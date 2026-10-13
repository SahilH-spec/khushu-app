// Static demo for GitHub Pages: no Express server and no API keys.
// When built with VITE_STATIC_DEMO=true, requests to /api/* are answered in the browser:
//   prayer times  → Aladhan API directly (your location if you allow it, else Makkah)
//   Quran         → Quran.com API directly, falling back to AlQuran.cloud
//   profiles      → this browser's localStorage
//   duas          → not available (the Ummah API needs a server-side key)

export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// ── Prayer times ───────────────────────────────────────────────────────
const MAKKAH = { lat: 21.4225, lng: 39.8262, label: "Makkah (share your location for local times)" };

function getPosition(): Promise<{ lat: number; lng: number; label: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(MAKKAH);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, label: "Your location" }),
      () => resolve(MAKKAH),
      { timeout: 8000, maximumAge: 3600_000 }
    );
  });
}

let positionPromise: ReturnType<typeof getPosition> | null = null;

async function prayerTimes() {
  positionPromise ??= getPosition();
  const pos = await positionPromise;
  const d = new Date();
  const date = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${pos.lat}&longitude=${pos.lng}&method=2&timezonestring=${encodeURIComponent(tz)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data?.code !== 200) return json({ ok: false, error: "Prayer time lookup failed" }, 502);
  const t = data.data.timings;
  const clean = (s: string) => s.split(" ")[0];
  const times = {
    Fajr: clean(t.Fajr), Sunrise: clean(t.Sunrise), Dhuhr: clean(t.Dhuhr),
    Asr: clean(t.Asr), Maghrib: clean(t.Maghrib), Isha: clean(t.Isha),
    source: "Aladhan API", label: pos.label,
  };
  const now = new Date();
  const next = (["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const)
    .map((name) => {
      const [h, m] = times[name].split(":").map(Number);
      const at = new Date(); at.setHours(h, m, 0, 0);
      return { name, time: times[name], at };
    })
    .find((p) => p.at > now);
  return json({ ok: true, times, next: next ? { name: next.name, time: next.time } : { name: "Fajr", time: times.Fajr, tomorrow: true } });
}

// ── Quran ──────────────────────────────────────────────────────────────
const stripHtml = (s?: string) => (s ? s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "");
const QF_AUDIO = "https://verses.quran.foundation/";

async function surahFromQuranCom(id: number, q: URLSearchParams) {
  const transl = q.get("translation") || "20";
  const ayahRec = parseInt(q.get("reciter") || "7", 10);
  const chapterRec = parseInt(q.get("chapter_reciter") || "7", 10);
  const all: any[] = [];
  for (let page = 1; ; page++) {
    const p = new URLSearchParams({ words: "true", translations: `${transl},57`, fields: "text_uthmani,text_indopak", per_page: "50", page: String(page) });
    if (ayahRec > 0) p.set("audio", String(ayahRec));
    const r = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?${p}`);
    if (!r.ok) throw new Error("quran.com " + r.status);
    const d = await r.json();
    all.push(...(d.verses || []));
    if (!d.pagination?.next_page) break;
  }
  let full: string | null = null;
  try {
    const a = await (await fetch(`https://api.quran.com/api/v4/chapter_recitations/${chapterRec}/${id}`)).json();
    full = a.audio_file?.audio_url ?? null;
  } catch { /* optional */ }
  const verses = all.map((v) => {
    const tr = v.translations?.find((t: any) => t.resource_id !== 57);
    const tl = v.translations?.find((t: any) => t.resource_id === 57);
    const raw = v.audio?.url ?? null;
    return {
      num: v.verse_number,
      arabic_uthmani: v.text_uthmani ?? "",
      arabic_indopak: v.text_indopak ?? "",
      translit: stripHtml(tl?.text),
      translation: stripHtml(tr?.text),
      audioUrl: raw ? (raw.startsWith("http") ? raw : QF_AUDIO + raw) : null,
    };
  });
  return { success: true, verses, audio: { url: full } };
}

async function surahFromAlQuranCloud(id: number) {
  const r = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.sahih,en.transliteration,ar.alafasy`);
  const d = await r.json();
  const [ar, en, tl, audio] = d.data;
  const verses = ar.ayahs.map((a: any, i: number) => ({
    num: a.numberInSurah,
    arabic_uthmani: a.text,
    arabic_indopak: a.text,
    translit: tl.ayahs[i]?.text ?? "",
    translation: en.ayahs[i]?.text ?? "",
    audioUrl: audio.ayahs[i]?.audio ?? null,
  }));
  return { success: true, verses, audio: { url: null } };
}

async function surah(id: number, q: URLSearchParams) {
  if (!(id >= 1 && id <= 114)) return json({ success: false, error: "Invalid surah" }, 400);
  try { return json(await surahFromQuranCom(id, q)); }
  catch {
    try { return json(await surahFromAlQuranCloud(id)); }
    catch { return json({ success: false, error: "Quran API unavailable" }, 502); }
  }
}

// ── Profiles and settings (this browser only) ──────────────────────────
const STORE = "khushu-demo-profiles";
type Profile = { displayName: string; volume: number; selectedReciter: string; adhanEnabled: boolean; fajrSpecial: boolean };
const load = (): Record<string, Profile> => { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; } };
const save = (p: Record<string, Profile>) => { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch { /* ignore */ } };
const DEFAULTS = { volume: 70, selectedReciter: "omar-hisham", adhanEnabled: true, fajrSpecial: true };

async function profiles(method: string, body: any) {
  const all = load();
  if (method === "POST") {
    const name = String(body?.displayName || "").trim().slice(0, 40);
    if (!name) return json({ ok: false, error: "displayName required" }, 400);
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "u-" + Math.random().toString(16).slice(2, 8);
    all[id] ??= { displayName: name, ...DEFAULTS };
    save(all);
    return json({ ok: true, profile: { id, displayName: name, isAdmin: false } });
  }
  return json({ ok: true, profiles: Object.entries(all).map(([id, p]) => ({ id, displayName: p.displayName, isAdmin: false, adhanEnabled: p.adhanEnabled })) });
}

async function settings(method: string, profileId: string, body: any) {
  const all = load();
  const p = all[profileId] ?? { displayName: profileId || "Guest", ...DEFAULTS };
  if (method === "POST") {
    for (const k of ["volume", "selectedReciter", "adhanEnabled", "fajrSpecial", "displayName"] as const) {
      if (body?.[k] !== undefined) (p as any)[k] = body[k];
    }
    all[profileId] = p;
    save(all);
    return json({ ok: true, settings: p });
  }
  return json({ ...p, profileId });
}

// ── Router ─────────────────────────────────────────────────────────────
async function handle(path: string, query: URLSearchParams, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const body = typeof init.body === "string" ? JSON.parse(init.body || "{}") : undefined;
  const headers = new Headers(init.headers);

  if (path === "/api/prayer-times") return prayerTimes();
  const m = path.match(/^\/api\/quran\/surah\/(\d+)$/);
  if (m) return surah(parseInt(m[1], 10), query);
  if (path === "/api/profiles") return profiles(method, body);
  if (path === "/api/settings") return settings(method, headers.get("X-Profile-Id") || "guest", body);
  if (path.startsWith("/api/ummah/")) {
    return json({ success: false, error: "Duas need the Ummah API key, which stays on the server. Not available in the static demo." }, 503);
  }
  if (path.startsWith("/api/admin") || (path.startsWith("/api/profiles/") && method === "DELETE")) {
    return json({ ok: false, error: "Admin is disabled in the static demo" }, 403);
  }
  return json({ error: "Not available in the static demo" }, 404);
}

/** Answers /api/* requests in the browser. Call once before the app renders. */
export function installStaticDemo() {
  if (!STATIC_DEMO) return;
  const realFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("/api/")) {
      const u = new URL(url, window.location.origin);
      return handle(u.pathname, u.searchParams, init);
    }
    return realFetch(input as RequestInfo, init);
  };
}

/** Direct EveryAyah URL (the server normally proxies it). */
export function everyAyahDirect(reciterPath: string, surah: number, verse: number) {
  return `https://everyayah.com/data/${reciterPath}/${String(surah).padStart(3, "0")}${String(verse).padStart(3, "0")}.mp3`;
}
