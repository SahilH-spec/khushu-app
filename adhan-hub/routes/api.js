const express = require('express');
const crypto  = require('crypto');
const https   = require('https');
const axios   = require('axios');
const router  = express.Router();

const { getPrayerTimes, getNextPrayer } = require('../services/prayerTimes');
const storage = require('../services/storage');

// ── Quran Foundation / quran.com API helpers ──────────────────────────
// Uses the legacy public quran.com API (api.quran.com/api/v4) — same paths and shapes
// as the authenticated QF Content API. Swap to @quranjs/api/server + QF_CLIENT_ID/SECRET
// when production credentials are available.
const QC_BASE = 'https://api.quran.com/api/v4';
const QC_HEADERS = { 'User-Agent': 'Khushu/1.0', 'Accept': 'application/json' };
const AUDIO_CDN = 'https://verses.quran.foundation/';

async function qcGet(path, params = {}) {
  const url = `${QC_BASE}${path}`;
  const { data } = await axios.get(url, { headers: QC_HEADERS, params, timeout: 15000 });
  return data;
}

function stripHtml(str) {
  return str ? str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

// Verified reciter IDs (per-verse ayahId ↔ full-surah chapterId)
// ayahId  = /resources/recitations namespace
// chapterId = /chapter_recitations/{id}/{surah} namespace
const QF_RECITERS = [
  { id: 'alafasy', name: 'Mishary Alafasy',        ayahId: 7, chapterId: 7  },
  { id: 'sudais',  name: 'Abdul Rahman Al-Sudais', ayahId: 3, chapterId: 3  },
  { id: 'basit',   name: 'Abdul Basit (Murattal)', ayahId: 2, chapterId: 2  },
  { id: 'shatri',  name: 'Abu Bakr al-Shatri',    ayahId: 4, chapterId: 4  },
  { id: 'husary',  name: 'Mahmoud al-Husary',      ayahId: 6, chapterId: 6  },
  { id: 'ghamdi',  name: 'Saad Al-Ghamdi',         ayahId: 0, chapterId: 13 },
];

// Reciters available on the Pi (filenames must match public/audio/)
const RECITERS = [
  { id: 'omar-hisham',  name: 'Omar Hisham al-Arabi',    file: 'adhan-omar-hisham.mp3', isDefault: true },
  { id: 'el-kourdi',   name: 'Ahmed El-Kourdi',           file: 'adhan-ahmed-el-kourdi.mp3' },
  { id: 'fajr-special', name: 'Fajr Special',             file: 'adhan-fajr.mp3' },
];

// ── Auth / profile middleware ─────────────────────────────────────────
// Household profiles (X-Profile-Id) are a convenience for per-person preferences, NOT a security
// boundary: anyone can claim any non-admin profile. The admin profile (which also drives the Pi's
// adhan player) and the admin routes require the server-side ADMIN_TOKEN.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const MAX_PROFILES = 50;

const digest = (v) => crypto.createHash('sha256').update(String(v)).digest();

function isAdminRequest(req) {
  if (ADMIN_TOKEN.length < 16) return false;            // admin disabled unless a strong token is set
  const given = req.headers['x-admin-token'];
  if (!given) return false;
  return crypto.timingSafeEqual(digest(given), digest(ADMIN_TOKEN));
}

router.use((req, _res, next) => {
  req.profileId = String(req.headers['x-profile-id'] || '').trim().slice(0, 40);
  req.isAdmin = isAdminRequest(req);
  next();
});

function requireAdmin(req, res, next) {
  if (!req.isAdmin) return res.status(403).json({ ok: false, error: 'Admin only' });
  next();
}

// Settings routes need a profile; the admin profile needs the admin token.
function requireProfile(req, res, next) {
  if (!req.profileId) return res.status(400).json({ ok: false, error: 'X-Profile-Id header required' });
  const existing = storage.loadProfile(req.profileId);
  if ((req.profileId === storage.ADMIN_PROFILE_ID || existing?.isAdmin) && !req.isAdmin) {
    return res.status(403).json({ ok: false, error: 'Admin only' });
  }
  next();
}

// ── Ummah API proxy ───────────────────────────────────────────────────
// The key lives in the environment only (never in source). Only the duas endpoints are proxied.
const UMMAH_KEY = process.env.UMMAH_API_KEY || '';

router.get('/ummah/*', (req, res) => {
  if (!UMMAH_KEY) return res.status(503).json({ error: 'UMMAH_API_KEY is not configured on the server' });
  const subPath = req.path.replace(/^\/ummah\//, '');
  if (!/^duas(\/[A-Za-z0-9_-]+)*$/.test(subPath)) return res.status(404).json({ error: 'Not found' });
  const query = new URLSearchParams(req.query).toString();
  const apiUrl = `https://ummahapi.com/api/${subPath}${query ? '?' + query : ''}`;
  const ureq = https.get(apiUrl, {
    headers: {
      'Authorization': `Bearer ${UMMAH_KEY}`,
      'User-Agent': 'Khushu/1.0'
    },
    timeout: 10000,
  }, (upstream) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(upstream.statusCode);
    upstream.pipe(res);
  });
  ureq.on('timeout', () => ureq.destroy());
  ureq.on('error', () => { if (!res.headersSent) res.status(502).json({ error: 'Ummah API unavailable' }); });
});

// ── Audio proxy helpers ───────────────────────────────────────────────
function proxyAudio(url, res) {
  const req = https.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://everyayah.com/' }
  }, (upstream) => {
    if (upstream.statusCode !== 200) { res.status(502).end(); return; }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
    upstream.pipe(res);
  });
  req.on('error', () => res.status(502).end());
}

// ── Quran: surah verses ───────────────────────────────────────────────
// GET /api/quran/surah/:id?translation=20&reciter=7&chapter_reciter=7
// translation = quran.com translation resource ID (default 20 = Saheeh Int.)
// reciter     = per-ayah recitation ID (default 7 = Alafasy)
// chapter_reciter = full-surah reciter ID (default 7 = Alafasy)
router.get('/quran/surah/:id', async (req, res) => {
  try {
    const surahId       = parseInt(req.params.id, 10);
    const translId      = req.query.translation || '20';
    const ayahRecId     = parseInt(req.query.reciter || '7', 10);
    const chapterRecId  = parseInt(req.query.chapter_reciter || '7', 10);

    if (surahId < 1 || surahId > 114) return res.status(400).json({ success: false, error: 'Invalid surah' });

    // Paginate — quran.com max per_page is 50
    let allVerses = [];
    let page = 1;
    while (true) {
      const verseParams = {
        words:        true,
        translations: `${translId},57`,
        fields:       'text_uthmani,text_indopak',
        per_page:     50,
        page,
      };
      // ayahRecId=0 means no QF per-verse audio; client falls back to everyayah
      if (ayahRecId > 0) verseParams.audio = ayahRecId;
      const data = await qcGet(`/verses/by_chapter/${surahId}`, verseParams);
      allVerses = allVerses.concat(data.verses || []);
      if (!data.pagination?.next_page) break;
      page++;
    }

    // Full-surah audio (absolute CDN URL)
    let fullAudioUrl = null;
    try {
      const audioData = await qcGet(`/chapter_recitations/${chapterRecId}/${surahId}`);
      fullAudioUrl = audioData.audio_file?.audio_url ?? null;
    } catch (_) { /* non-fatal — surah audio is optional */ }

    const verses = allVerses.map(v => {
      const translEntry  = v.translations?.find(t => t.resource_id !== 57) ?? null;
      const translitEntry = v.translations?.find(t => t.resource_id === 57) ?? null;
      const rawAudio = v.audio?.url ?? null;
      const audioUrl = rawAudio
        ? (rawAudio.startsWith('http') ? rawAudio : AUDIO_CDN + rawAudio)
        : null;
      return {
        num:             v.verse_number,
        arabic_uthmani:  v.text_uthmani  ?? '',
        arabic_indopak:  v.text_indopak  ?? '',
        translit:        stripHtml(translitEntry?.text ?? ''),
        translation:     stripHtml(translEntry?.text  ?? ''),
        audioUrl,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({ success: true, verses, audio: { url: fullAudioUrl } });
  } catch (err) {
    console.error('[Quran API]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Quran: reciters list ──────────────────────────────────────────────
router.get('/quran/reciters', (_req, res) => {
  res.json({ success: true, reciters: QF_RECITERS });
});

// ── Prayer times ──────────────────────────────────────────────────────
router.get('/prayer-times', async (req, res) => {
  try {
    const times = await getPrayerTimes();
    const next  = getNextPrayer(times);
    res.json({ ok: true, times, next });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Quran audio proxy ─────────────────────────────────────────────────
router.get('/quran-audio', (req, res) => {
  const { reciter, surah, verse } = req.query;
  if (!reciter || !surah || !verse) return res.status(400).end();
  const s = String(parseInt(surah, 10)).padStart(3, '0');
  const v = String(parseInt(verse, 10)).padStart(3, '0');
  proxyAudio(`https://everyayah.com/data/${encodeURIComponent(reciter)}/${s}${v}.mp3`, res);
});

// ── Reciters ──────────────────────────────────────────────────────────
router.get('/reciters', (req, res) => {
  res.json(RECITERS);
});

// ── Profiles ──────────────────────────────────────────────────────────
// Public list shows display names only; the admin profile is hidden unless the admin token is sent.
router.get('/profiles', (req, res) => {
  const all = storage.listProfiles();
  const visible = req.isAdmin ? all : all.filter(p => !p.isAdmin && p.id !== storage.ADMIN_PROFILE_ID);
  res.json({ ok: true, profiles: visible });
});

router.post('/profiles', (req, res) => {
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim().slice(0, 40) : '';
  if (!displayName) return res.status(400).json({ ok: false, error: 'displayName required' });
  let slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
  if (!slug) slug = 'u-' + crypto.randomBytes(3).toString('hex');   // e.g. names written in Arabic script
  if (slug === storage.ADMIN_PROFILE_ID || storage.loadProfile(slug)?.isAdmin) {
    return res.status(409).json({ ok: false, error: 'That name is reserved. Please choose another.' });
  }
  if (storage.listProfiles().length >= MAX_PROFILES && !storage.loadProfile(slug)) {
    return res.status(429).json({ ok: false, error: 'Profile limit reached.' });
  }
  const profile = storage.createProfile(slug, displayName);
  res.json({ ok: true, profile: { id: slug, displayName: profile.displayName, isAdmin: false } });
});

router.delete('/profiles/:profileId', requireAdmin, (req, res) => {
  const ok = storage.deleteProfile(req.params.profileId);
  res.json({ ok });
});

// ── Settings (per-profile) ────────────────────────────────────────────
router.get('/settings', requireProfile, (req, res) => {
  const cfg = storage.loadProfile(req.profileId) || {};
  res.json({ ...cfg, profileId: req.profileId });
});

router.post('/settings', requireProfile, (req, res) => {
  if (!storage.loadProfile(req.profileId)) {
    return res.status(404).json({ ok: false, error: 'Unknown profile' });
  }
  const b = req.body || {};
  const patch = {};
  if (typeof b.selectedReciter === 'string' && RECITERS.some(r => r.id === b.selectedReciter)) patch.selectedReciter = b.selectedReciter;
  if (typeof b.adhanEnabled === 'boolean') patch.adhanEnabled = b.adhanEnabled;
  if (typeof b.fajrSpecial === 'boolean') patch.fajrSpecial = b.fajrSpecial;
  if (Number.isFinite(b.volume)) patch.volume = Math.min(100, Math.max(0, Math.round(b.volume)));
  if (typeof b.displayName === 'string' && b.displayName.trim()) patch.displayName = b.displayName.trim().slice(0, 40);
  const updated = storage.upsertProfile(req.profileId, patch);
  res.json({ ok: true, settings: updated });
});

// ── Admin ─────────────────────────────────────────────────────────────
router.get('/admin/status', requireAdmin, (req, res) => {
  res.json({ ok: true, profiles: storage.listProfiles() });
});

module.exports = router;
