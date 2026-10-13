import { STATIC_DEMO } from "../../staticDemo";
import { adminHeaders } from "../../lib-admin";
import { useState, useEffect, useRef } from "react";
import { Play, Square, Clock, Volume2, ChevronDown } from "lucide-react";

interface Props {
  profileId: string;
  profileName: string;
}

const RECITERS = [
  { id: "omar-hisham",  label: "Omar Hisham al-Arabi",   file: "adhan-omar-hisham.mp3" },
  { id: "el-kourdi",   label: "Ahmed El-Kourdi",          file: "adhan-ahmed-el-kourdi.mp3" },
  { id: "fajr-special", label: "Fajr Special",            file: "adhan-fajr.mp3" },
];

interface PrayerTimes {
  Fajr?: string; Sunrise?: string; Dhuhr?: string;
  Asr?: string;  Maghrib?: string; Isha?: string;
  source?: string;
}

export function AdhanHubPage({ profileId, profileName }: Props) {
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(70);
  const [times, setTimes]       = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNext]   = useState<{ name: string; time: string } | null>(null);
  const [timesLoading, setTimesLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const apiFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), "X-Profile-Id": profileId, ...adminHeaders() } });

  // Load prayer times
  useEffect(() => {
    apiFetch("/api/prayer-times")
      .then(r => r.json())
      .then(data => {
        if (data.ok) { setTimes(data.times); setNext(data.next); }
      })
      .catch(() => {})
      .finally(() => setTimesLoading(false));
  }, []);

  // Load saved reciter from settings
  useEffect(() => {
    apiFetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.volume !== undefined) setVolume(data.volume);
        if (data.selectedReciter) {
          const found = RECITERS.find(r => r.id === data.selectedReciter);
          if (found) setSelectedReciter(found);
        }
      })
      .catch(() => {});
  }, [profileId]);

  function handleReciterChange(id: string) {
    const r = RECITERS.find(x => x.id === id);
    if (!r) return;
    setSelectedReciter(r);
    apiFetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedReciter: id }),
    }).catch(() => {});
  }

  function handlePlay() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(`/audio/${selectedReciter.file}`);
    audio.volume = volume / 100;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audioRef.current = audio;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function handleStop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }

  function handleVolumeChange(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    apiFetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volume: v }),
    }).catch(() => {});
  }

  const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-4xl">🕌</div>
        <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Adhan Hub</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Playing automatically via Raspberry Pi → Echo Dot
        </p>
        {STATIC_DEMO && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Public demo: the adhan recordings aren't included, so Play is silent here. At home they play from local MP3s on the Pi.
          </p>
        )}
      </div>

      {/* Reciter selector + Play/Stop */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 space-y-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">
          Test Adhan
        </h2>

        {/* Reciter dropdown */}
        <div className="relative">
          <select
            value={selectedReciter.id}
            onChange={e => handleReciterChange(e.target.value)}
            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="range" min={0} max={100} value={volume}
            onChange={e => handleVolumeChange(Number(e.target.value))}
            className="flex-1 accent-emerald-600"
          />
          <span className="text-xs text-gray-500 w-8 text-right">{volume}%</span>
        </div>

        {/* Play / Stop */}
        <div className="flex gap-3">
          <button
            onClick={handlePlay}
            disabled={playing}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          <button
            onClick={handleStop}
            disabled={!playing}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-40 text-gray-700 dark:text-gray-100 font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>

        {playing && (
          <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
            Playing {selectedReciter.label}…
          </p>
        )}
      </div>

      {/* Today's prayer times */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">
            Today's Schedule
          </h2>
        </div>

        {timesLoading ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
        ) : times ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {PRAYER_ORDER.filter(p => times[p]).map(prayer => {
              const isNext = nextPrayer?.name === prayer;
              return (
                <div
                  key={prayer}
                  className={`flex justify-between items-center py-2.5 px-1 ${isNext ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                >
                  <span className="text-sm">{prayer}{isNext ? " ◀" : ""}</span>
                  <span className="text-sm font-mono">{times[prayer]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Could not load prayer times</p>
        )}
      </div>

      {/* Pi info */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
        <p className="font-semibold">How it works</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          The Raspberry Pi Zero W fetches prayer times over WiFi and plays the adhan MP3
          through your Echo Dot via Bluetooth at each prayer time — no cloud account needed.
        </p>
      </div>
    </div>
  );
}
