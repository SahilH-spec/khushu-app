const axios = require('axios');

// Location comes from the environment. Without LATITUDE/LONGITUDE the times would be for Makkah,
// which is almost never what you want, so we warn loudly.
const ALADHAN = {
  latitude:  process.env.LATITUDE  || '21.4225',
  longitude: process.env.LONGITUDE || '39.8262',
  method:    process.env.ALADHAN_METHOD  || '2',  // 2 = ISNA (North America)
  school:    process.env.ALADHAN_SCHOOL  || '0',  // 0 = Standard (Shafi) Asr, 1 = Hanafi
  timezone:  process.env.TIMEZONE || process.env.TZ || 'UTC',
  label:     process.env.LOCATION_LABEL || '',
};
if (!process.env.LATITUDE || !process.env.LONGITUDE) {
  console.warn('⚠️  LATITUDE / LONGITUDE not set: showing prayer times for Makkah. Set them in your environment.');
}

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Cache: one entry per day
let cache = { date: null, times: null };

// ── Aladhan.com API (coordinates-based) ──────────────────────────────
async function fetchFromAladhan(date = new Date()) {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const res = await axios.get(
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}`,
    {
      params: {
        latitude:        ALADHAN.latitude,
        longitude:       ALADHAN.longitude,
        method:          ALADHAN.method,
        school:          ALADHAN.school,
        timezonestring:  ALADHAN.timezone
      },
      timeout: 10000
    }
  );

  if (res.data?.code !== 200) throw new Error('Aladhan API error');

  const t = res.data.data.timings;
  return {
    Fajr:    stripSuffix(t.Fajr),
    Sunrise: stripSuffix(t.Sunrise),
    Dhuhr:   stripSuffix(t.Dhuhr),
    Asr:     stripSuffix(t.Asr),
    Maghrib: stripSuffix(t.Maghrib),
    Isha:    stripSuffix(t.Isha),
    source:  'Aladhan API',
    label:   ALADHAN.label
  };
}

// Aladhan sometimes appends "(EDT)" etc. — strip it
function stripSuffix(t = '') {
  return t.split(' ')[0].trim();
}

// ── Public: getPrayerTimes() ──────────────────────────────────────────
async function getPrayerTimes(date = new Date()) {
  const today = date.toDateString();

  // Return same-day cache
  if (cache.date === today && cache.times) return cache.times;

  let times;
  try {
    times = await fetchFromAladhan(date);
    console.log(`✅ Prayer times from Aladhan API — ${today}`);
  } catch (e) {
    throw new Error(`Prayer time fetch failed: ${e.message}`);
  }

  cache = { date: today, times };
  return times;
}

// Convert "HH:MM" string → Date object (today, local TZ)
function timeStrToDate(timeStr) {
  const [h, m] = timeStr.replace(/[^\d:]/g, '').split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Returns the next prayer name & time from now
function getNextPrayer(times) {
  const now = new Date();
  const prayers = PRAYER_NAMES.filter(p => p !== 'Sunrise' && times[p]);

  for (const name of prayers) {
    const t = timeStrToDate(times[name]);
    if (t > now) return { name, time: times[name], date: t };
  }
  // Past Isha — next is tomorrow's Fajr
  return { name: 'Fajr', time: times.Fajr, date: null, tomorrow: true };
}

// Invalidate cache (call on midnight)
function clearCache() { cache = { date: null, times: null }; }

module.exports = { getPrayerTimes, getNextPrayer, timeStrToDate, clearCache, PRAYER_NAMES };
