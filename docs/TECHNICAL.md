# Khushu: Technical Details

This page holds the technical breakdown for Khushu. For a plain-language overview, see the [README](../README.md).

## Architecture

```
React + Vite + Tailwind (client/)  -->  Express API (server.js, routes/, services/)
(UI started as a Figma Make export,       |-- Aladhan (prayer times)
 then wired to the API)                   |-- Quran.com + EveryAyah (Quran text and audio)
                                          |-- Ummah API proxy (duas, key stays on server)
                                          `-- JSON profile store (data/config.json)

Raspberry Pi Zero W: local-player.js --> mpg123 --> PulseAudio --> Bluetooth speaker
```

## How each feature works

| Area | How it works |
|---|---|
| **Prayer times** | The Express server calls the [Aladhan API](https://aladhan.com/prayer-times-api) for your coordinates and timezone, caches per day, and computes the next prayer and a live countdown. |
| **Quran** | Surah reader with Arabic (Uthmani / IndoPak), translation, transliteration, and per-verse and full-surah audio. Text and audio come from the [Quran.com API](https://api.quran.com) and [EveryAyah](https://everyayah.com), proxied through the server. |
| **Duas** | Fetched from the [Ummah API](https://ummahapi.com) through a server-side proxy so the API key never reaches the browser. |
| **Dhikr, 99 Names, Qibla, reminders** | Client-side: dhikr counter, Names with meanings, a compass using the device's location and orientation, and browser prayer notifications. |
| **Profiles** | Each household member keeps their own adhan preferences (reciter, volume). An owner-only admin profile is protected by a server-side token. |
| **Pi adhan player** | A Raspberry Pi Zero W runs `local-player.js`, which checks prayer times every minute, plays the adhan MP3 through `mpg123`, then a rotating dua, over Bluetooth A2DP to a speaker (an Echo Dot used as a plain Bluetooth speaker, no Alexa account involved). It runs as a systemd service and reconnects the speaker on boot. |

## Run it locally

```bash
cd adhan-hub
cp .env.example .env   # set LATITUDE, LONGITUDE, TIMEZONE; optionally ADMIN_TOKEN, UMMAH_API_KEY
npm install
npm run build:client   # builds the React app into adhan-hub/public (needs pnpm: npm i -g pnpm)
npm start              # http://localhost:3000
```

## Audio files

The adhan and dua recordings are **not** in this repository. Put your own MP3s in `adhan-hub/public/audio/` (and `adhan-hub/client/public/audio/`) using these names:

- `adhan-omar-hisham.mp3`
- `adhan-ahmed-el-kourdi.mp3`
- `adhan-fajr.mp3`
- `dua-1.mp3` through `dua-4.mp3`

Make sure you have the right to use whatever recordings you choose.

## Deployment

`railway.toml` is included. Set the variables from `.env.example` in your host, and mount a volume at `/app/data` so profiles survive redeploys.

## Static demo (GitHub Pages)

The live demo is the same React app built with `VITE_STATIC_DEMO=true`, so it needs no server or keys. `src/staticDemo.ts` answers the app's `/api/*` calls in the browser instead:

- Prayer times come from Aladhan for your location (Makkah if you don't share it).
- The Quran comes from Quran.com, with AlQuran.cloud as a fallback.
- Profiles are saved in your browser.
- Duas are off (their API key belongs on a server), and the adhan recordings aren't included.

`.github/workflows/pages.yml` publishes it on every push to `main`.

## Security notes

- Admin routes and the admin profile (which the Pi reads its settings from) require `ADMIN_TOKEN` (16+ characters), compared in constant time. Without it, admin features are disabled.
- Third-party API keys live only in environment variables. The Duas proxy only forwards `/duas` paths.
- No open CORS (the UI is served by the same server), API rate limiting, a request body size limit, and validated settings input.
- Profiles are a convenience for preferences, not an identity system: anyone who can reach the site can create a non-admin profile.
- `npm run test:security` starts the server and checks these behaviors (it runs in CI).

## Raspberry Pi setup

Hardware list, Bluetooth pairing, the systemd service, and troubleshooting are in [`adhan-hub/pi/README.md`](../adhan-hub/pi/README.md).
