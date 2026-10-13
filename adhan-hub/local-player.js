// ─────────────────────────────────────────────────────────────────────
// Khushu — Local Adhan Player
//
// Plays the REAL adhan MP3 (your chosen reciter) at each prayer time,
// straight out of this machine's default audio output. No Alexa, no cloud
// playback API, no expiring cookies. Runs 24/7 — just leave it open.
//
//   node local-player.js              → start the scheduler (run forever)
//   node local-player.js --test       → play Asr right now (quick check)
//   node local-player.js --test Fajr  → play a specific prayer now
//   node local-player.js --next       → print today's schedule and exit
//
// Audio output = whatever Windows (or the Pi) has set as the default
// playback device: PC speakers, a USB/3.5mm speaker, or an Echo Dot paired
// over Bluetooth. Set the default device in the OS sound settings.
//
// Ports to a Raspberry Pi unchanged: install Node + ffmpeg (`apt install
// ffmpeg`), copy this folder, run the same command. espeak handles TTS.
// ─────────────────────────────────────────────────────────────────────

require('dotenv').config();
const path  = require('path');
const fs    = require('fs');
const cron  = require('node-cron');

const { getPrayerTimes, getNextPrayer, clearCache } = require('./services/prayerTimes');
const storage = require('./services/storage');
const { playFile, speak } = require('./services/localAudio');

const TZ        = process.env.TZ || process.env.TIMEZONE || 'UTC';
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const SKIP      = new Set(['Sunrise']);


// For non-Fajr prayers: randomly alternate between these two
const REGULAR_ADHANS = ['adhan-omar-hisham.mp3', 'adhan-ahmed-el-kourdi.mp3'];
const FAJR_FILE      = 'adhan-fajr.mp3';
const DEFAULT_FILE   = 'adhan-omar-hisham.mp3';

function resolveAdhanFile(prayer) {
  const name = prayer === 'Fajr'
    ? FAJR_FILE
    : REGULAR_ADHANS[Math.floor(Math.random() * REGULAR_ADHANS.length)];
  const full = path.join(AUDIO_DIR, name);
  if (fs.existsSync(full)) return full;
  const fallback = path.join(AUDIO_DIR, DEFAULT_FILE);
  return fs.existsSync(fallback) ? fallback : null;
}

// Post-adhan duas: 4 local MP3s rotated in order
const DUA_FILES = ['dua-1.mp3', 'dua-2.mp3', 'dua-3.mp3', 'dua-4.mp3']
  .map(f => path.join(AUDIO_DIR, f))
  .filter(f => fs.existsSync(f));

let duaIndex = 0;

async function playAdhan(prayer) {
  const cfg = storage.load();
  if (!cfg.adhanEnabled) {
    console.log(`⏭  Adhan disabled in settings — skipping ${prayer}`);
    return;
  }
  const file = resolveAdhanFile(prayer);
  if (!file) { console.error('⚠️  No adhan file found'); return; }
  const vol  = cfg.volume || 70;
  const stamp = new Date().toLocaleTimeString();
  console.log(`\n🕌 [${stamp}] ${prayer} — ${path.basename(file)} @ volume ${vol}`);

  const ok = await playFile(file, vol);
  console.log(ok ? '   ✔ adhan finished' : '   ⚠️  playback failed');

  // Play rotating dua after adhan
  if (DUA_FILES.length > 0) {
    const duaFile = DUA_FILES[duaIndex % DUA_FILES.length];
    duaIndex++;
    console.log(`   🤲 Dua ${duaIndex}: ${path.basename(duaFile)}`);
    const duaOk = await playFile(duaFile, vol);
    console.log(duaOk ? '   ✔ dua finished' : '   ⚠️  dua playback failed');
  }
}

// ── Per-minute polling ────────────────────────────────────────────────
let firedToday  = new Set();
let todayStr    = null;
let cachedTimes = null;

function currentChicagoDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(new Date());
  const get = type => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function tick() {
  const now   = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: 'numeric',
    hour12: false, year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(now);
  const get  = type => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  const h    = get('hour');
  const m    = get('minute');
  const date = `${get('year')}-${get('month')}-${get('day')}`;

  if (date !== todayStr) {
    console.log(`🌙 New day (${date}) — refreshing prayer times`);
    todayStr = date;
    firedToday = new Set();
    clearCache();
    try {
      cachedTimes = await getPrayerTimes();
      logSchedule();
    } catch (e) {
      console.error('❌ Could not fetch prayer times:', e.message);
      cachedTimes = null;
    }
  }

  if (!cachedTimes) return;

  for (const [prayer, timeStr] of Object.entries(cachedTimes)) {
    if (SKIP.has(prayer) || prayer === 'source' || !timeStr) continue;
    const clean = String(timeStr).replace(/[^\d:]/g, '');
    const [ph, pm] = clean.split(':').map(Number);
    if (isNaN(ph) || isNaN(pm)) continue;

    if (ph === h && pm === m && !firedToday.has(prayer)) {
      firedToday.add(prayer);
      await playAdhan(prayer);
    }
  }
}

function logSchedule() {
  if (!cachedTimes) return;
  console.log(`\n📅 Today's schedule (${TZ}) — source: ${cachedTimes.source || 'unknown'}`);
  for (const [prayer, timeStr] of Object.entries(cachedTimes)) {
    if (SKIP.has(prayer) || prayer === 'source' || !timeStr) continue;
    console.log(`  ✅ ${prayer.padEnd(8)} → ${timeStr}`);
  }
  try {
    const next = getNextPrayer(cachedTimes);
    console.log(`  ⏭  Next: ${next.name} at ${next.time}${next.tomorrow ? ' (tomorrow)' : ''}`);
  } catch (_) {}
  console.log();
}

async function main() {
  const arg = process.argv[2];

  if (arg === '--test') {
    const prayer = process.argv[3] || 'Asr';
    console.log(`🔊 Test playback: ${prayer}`);
    await playAdhan(prayer);
    process.exit(0);
  }

  if (arg === '--next') {
    const times = await getPrayerTimes();
    const next = getNextPrayer(times);
    console.log(`Next prayer: ${next.name} at ${next.time}${next.tomorrow ? ' (tomorrow)' : ''}`);
    process.exit(0);
  }

  console.log('🕌  Khushu Local Adhan Player');
  console.log(`    audio: ${AUDIO_DIR}`);
  console.log(`    tz:    ${TZ}`);

  // Load today's times up front
  todayStr = currentChicagoDate();
  try {
    cachedTimes = await getPrayerTimes();
    logSchedule();
  } catch (e) {
    console.error('❌ Could not fetch prayer times:', e.message);
  }

  // Poll every minute instead of scheduling exact-time cron jobs.
  // This is resilient to process restarts — no scheduled job to lose.
  cron.schedule('* * * * *', tick, { timezone: TZ });

  console.log('⏰ Running. Keep this window open. Press Ctrl+C to stop.\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
