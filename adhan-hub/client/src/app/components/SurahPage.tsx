import { useState, useEffect, useRef } from "react";
import { Bookmark, Play, Pause, ChevronDown, Loader, Music } from "lucide-react";
import type { QuranSettings, BookmarkState } from "../App";
import { ALL_SURAHS } from "./QuranPage";

interface Props {
  surahNum: number;
  settings: QuranSettings;
  bookmarks: BookmarkState;
  onBookmarkVerse: (key: string) => void;
  onUpdateLastRead: (surahNum: number, surahName: string, verseNum: number) => void;
  fontFamily: string;
  fontSize: string;
}

interface Verse {
  num: number;
  arabic_uthmani: string;
  arabic_indopak: string;
  translit: string;
  translation: string;
  audioUrl: string | null;
}

// Verified QF reciter IDs — ayahId and chapterId are separate namespaces, do not mix
// ayahId=0 means no QF per-verse audio available; everyayah fallback is used instead
const RECITERS = [
  { id: "alafasy", name: "Mishary Alafasy",        ayahId: 7, chapterId: 7  },
  { id: "sudais",  name: "Abdul Rahman Al-Sudais", ayahId: 3, chapterId: 3  },
  { id: "basit",   name: "Abdul Basit (Murattal)", ayahId: 2, chapterId: 2  },
  { id: "shatri",  name: "Abu Bakr al-Shatri",    ayahId: 4, chapterId: 4  },
  { id: "husary",  name: "Mahmoud al-Husary",      ayahId: 6, chapterId: 6  },
  { id: "ghamdi",  name: "Saad Al-Ghamdi",         ayahId: 0, chapterId: 13 },
] as const;

// quran.com translation resource IDs
const TRANSLATIONS = [
  { id: "20",  label: "English (Saheeh Int.)"  },
  { id: "22",  label: "English (Yusuf Ali)"    },
  { id: "85",  label: "English (Abdul Haleem)" },
] as const;

type ReciterId = typeof RECITERS[number]["id"];
type TranslId  = typeof TRANSLATIONS[number]["id"];

// Fallback: everyayah.com per-verse proxy (used when QF audio URL is absent)
const EVERYAYAH_PATHS: Record<ReciterId, string> = {
  alafasy: "Alafasy_128kbps",
  sudais:  "Abdurrahmaan_As-Sudais_192kbps",
  basit:   "Abdul_Basit_Murattal_192kbps",
  shatri:  "Abu_Bakr_Ash-Shaatree_128kbps",
  husary:  "Husary_128kbps",
  ghamdi:  "Ghamadi_40kbps",
};

function everyayahUrl(reciterId: ReciterId, surahNum: number, verseNum: number) {
  const path = EVERYAYAH_PATHS[reciterId];
  return `/api/quran-audio?reciter=${encodeURIComponent(path)}&surah=${surahNum}&verse=${verseNum}`;
}

async function fetchSurahData(surahNum: number, translId: TranslId, ayahRecId: number, chapterRecId: number) {
  const params = new URLSearchParams({
    translation:     translId,
    reciter:         String(ayahRecId),
    chapter_reciter: String(chapterRecId),
  });
  const res = await fetch(`/api/quran/surah/${surahNum}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("Quran API error");
  return {
    verses:       json.verses as Verse[],
    fullAudioUrl: (json.audio?.url as string | null) ?? null,
  };
}

export function SurahPage({ surahNum, settings, bookmarks, onBookmarkVerse, onUpdateLastRead, fontFamily, fontSize }: Props) {
  const surahMeta = ALL_SURAHS.find(s => s.number === surahNum)
    ?? { name: "Surah", arabic: "", meaning: "", type: "Meccan", verses: 0, number: surahNum };

  const [verses,       setVerses]       = useState<Verse[]>([]);
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);

  const [playing,         setPlaying]         = useState<number | null>(null);
  const [playingFull,     setPlayingFull]     = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [showTranslMenu,  setShowTranslMenu]  = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [selectedTransl,  setSelectedTransl]  = useState(TRANSLATIONS[0]);

  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setVerses([]);
    setFullAudioUrl(null);
    audioRef.current?.pause();
    audioRef.current = null;
    fullAudioRef.current?.pause();
    fullAudioRef.current = null;
    setPlaying(null);
    setPlayingFull(false);

    fetchSurahData(surahNum, selectedTransl.id, selectedReciter.ayahId, selectedReciter.chapterId)
      .then(({ verses, fullAudioUrl }) => {
        setVerses(verses);
        setFullAudioUrl(fullAudioUrl);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [surahNum, selectedTransl.id, selectedReciter.ayahId, selectedReciter.chapterId]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      fullAudioRef.current?.pause();
    };
  }, [surahNum]);

  const getVerseAudioUrl = (verse: Verse) =>
    verse.audioUrl ?? everyayahUrl(selectedReciter.id, surahNum, verse.num);

  const handleVersePlay = (verse: Verse) => {
    onUpdateLastRead(surahNum, surahMeta.name, verse.num);
    if (playing === verse.num) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    audioRef.current = null;
    const audio = new Audio(getVerseAudioUrl(verse));
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audio.play().catch(() => setPlaying(null));
    audioRef.current = audio;
    setPlaying(verse.num);
  };

  const handlePlayAll = () => {
    if (!verses.length || playing !== null) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(null);
      return;
    }
    playSequence(0, verses);
  };

  const playSequence = (index: number, vs: Verse[]) => {
    if (index >= vs.length) { setPlaying(null); return; }
    const v = vs[index];
    onUpdateLastRead(surahNum, surahMeta.name, v.num);
    const audio = new Audio(getVerseAudioUrl(v));
    audio.onended = () => playSequence(index + 1, vs);
    audio.onerror = () => playSequence(index + 1, vs);
    audio.play().catch(() => playSequence(index + 1, vs));
    audioRef.current = audio;
    setPlaying(v.num);
  };

  const handleFullSurah = () => {
    if (playingFull) {
      fullAudioRef.current?.pause();
      fullAudioRef.current = null;
      setPlayingFull(false);
      return;
    }
    if (!fullAudioUrl) return;
    const audio = new Audio(fullAudioUrl);
    audio.onended = () => { setPlayingFull(false); fullAudioRef.current = null; };
    audio.onerror = () => { setPlayingFull(false); fullAudioRef.current = null; };
    audio.play().catch(() => setPlayingFull(false));
    fullAudioRef.current = audio;
    setPlayingFull(true);
  };

  const verseKey          = (v: number) => `${surahNum}:${v}`;
  const isVerseBookmarked = (v: number) => bookmarks.verses.includes(verseKey(v));

  // IndoPak needs more vertical space
  const isIndoPak   = settings.font === "indopak";
  const arabicSize  = isIndoPak ? `calc(${fontSize} + 4px)` : fontSize;
  const lineHeight  = isIndoPak ? 3.2 : 2;

  return (
    <div className="flex flex-col pb-6">
      {/* Surah header */}
      <div className="relative overflow-hidden mx-4 mt-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <div className="p-5 text-center">
          <p style={{ fontFamily: "Scheherazade New, serif", color: "#c8a84b", fontSize: "28px", lineHeight: 1.5 }}>{surahMeta.arabic}</p>
          <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "22px", lineHeight: 1.3 }}>{surahMeta.name}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "13px", marginTop: "4px" }}>
            {surahMeta.meaning} · {surahMeta.type} · {surahMeta.verses} Verses
          </p>

          {settings.audioEnabled && (
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              {/* Reciter picker */}
              <button
                onClick={() => { setShowReciterMenu(m => !m); setShowTranslMenu(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(200,168,75,0.2)", border: "1px solid rgba(200,168,75,0.35)" }}
              >
                <span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>{selectedReciter.name}</span>
                <ChevronDown size={11} style={{ color: "#c8a84b" }} />
              </button>

              {/* Translation picker */}
              <button
                onClick={() => { setShowTranslMenu(m => !m); setShowReciterMenu(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.25)" }}
              >
                <span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>{selectedTransl.label}</span>
                <ChevronDown size={11} style={{ color: "#c8a84b" }} />
              </button>

              {/* Play all / stop */}
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(200,168,75,0.2)", border: "1px solid rgba(200,168,75,0.35)" }}
              >
                {playing !== null
                  ? <><Pause size={11} fill="#c8a84b" style={{ color: "#c8a84b" }} /><span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>Stop</span></>
                  : <><Play  size={11} fill="#c8a84b" style={{ color: "#c8a84b" }} /><span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>Verse by Verse</span></>
                }
              </button>

              {/* Full surah audio */}
              {fullAudioUrl && (
                <button
                  onClick={handleFullSurah}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: playingFull ? "rgba(30,107,94,0.5)" : "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.25)" }}
                >
                  {playingFull
                    ? <><Pause size={11} fill="#c8a84b" style={{ color: "#c8a84b" }} /><span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>Stop Full</span></>
                    : <><Music size={11} style={{ color: "#c8a84b" }} /><span style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "11px" }}>Full Surah</span></>
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reciter picker dropdown */}
      {showReciterMenu && (
        <div className="mx-4 mt-2 rounded-xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          {RECITERS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => { setSelectedReciter(r); setShowReciterMenu(false); }}
              className="w-full text-left px-4 py-2.5 flex items-center justify-between"
              style={{ borderBottom: i < RECITERS.length - 1 ? "1px solid var(--k-border)" : "none" }}
            >
              <p style={{ fontFamily: "Nunito, sans-serif", color: selectedReciter.id === r.id ? "var(--k-gold)" : "var(--k-text)", fontSize: "13px" }}>{r.name}</p>
              {selectedReciter.id === r.id && <div className="w-2 h-2 rounded-full" style={{ background: "var(--k-gold)" }} />}
            </button>
          ))}
        </div>
      )}

      {/* Translation picker dropdown */}
      {showTranslMenu && (
        <div className="mx-4 mt-2 rounded-xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          {TRANSLATIONS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTransl(t); setShowTranslMenu(false); }}
              className="w-full text-left px-4 py-2.5 flex items-center justify-between"
              style={{ borderBottom: i < TRANSLATIONS.length - 1 ? "1px solid var(--k-border)" : "none" }}
            >
              <p style={{ fontFamily: "Nunito, sans-serif", color: selectedTransl.id === t.id ? "var(--k-gold)" : "var(--k-text)", fontSize: "13px" }}>{t.label}</p>
              {selectedTransl.id === t.id && <div className="w-2 h-2 rounded-full" style={{ background: "var(--k-gold)" }} />}
            </button>
          ))}
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader size={24} style={{ color: "var(--k-gold)" }} className="animate-spin" />
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>Loading verses…</p>
        </div>
      )}
      {error && !loading && (
        <div className="mx-4 mt-4 rounded-xl p-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>Could not load verses. Check your internet connection.</p>
        </div>
      )}

      {/* Bismillah — shown for all surahs except Al-Fatiha (1, already verse 1) and At-Tawbah (9, no Bismillah) */}
      {!loading && !error && surahNum !== 1 && surahNum !== 9 && (
        <div className="mx-4 mt-3 rounded-2xl py-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p
            dir="rtl"
            translate="no"
            style={{
              fontFamily,
              color: "var(--k-gold)",
              fontSize: arabicSize,
              lineHeight,
            }}
          >
            {isIndoPak
              ? "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِیۡمِ"
              : "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"}
          </p>
        </div>
      )}

      {/* Verses */}
      {!loading && !error && (
        <div className="mx-4 mt-3 flex flex-col gap-3">
          {verses.map(verse => {
            const isPlaying    = playing === verse.num;
            const isBookmarked = isVerseBookmarked(verse.num);
            const arabicText   = isIndoPak ? verse.arabic_indopak : verse.arabic_uthmani;
            return (
              <div
                key={verse.num}
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--k-surface)", border: isBookmarked ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}
              >
                {/* Verse header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
                    <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "11px", fontWeight: 700 }}>{verse.num}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.audioEnabled && (
                      <button
                        onClick={() => handleVersePlay(verse)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: isPlaying ? "var(--k-green)" : "var(--k-gold-sub)" }}
                      >
                        {isPlaying
                          ? <Pause size={12} style={{ color: "#ffffff" }} />
                          : <Play  size={12} fill="var(--k-gold)" style={{ color: "var(--k-gold)" }} />}
                      </button>
                    )}
                    <button
                      onClick={() => onBookmarkVerse(verseKey(verse.num))}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: isBookmarked ? "var(--k-gold-sub)" : "transparent" }}
                    >
                      <Bookmark size={13} fill={isBookmarked ? "var(--k-gold)" : "none"} style={{ color: isBookmarked ? "var(--k-gold)" : "var(--k-text-disabled)" }} />
                    </button>
                  </div>
                </div>

                {/* Arabic */}
                <p
                  className="px-4 pt-2 pb-1 text-right"
                  dir="rtl"
                  translate="no"
                  style={{ fontFamily, color: "var(--k-text)", fontSize: arabicSize, lineHeight }}
                >
                  {arabicText}
                </p>

                {/* Transliteration */}
                {settings.showTranslit && verse.translit && (
                  <p className="px-4 pb-1" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "13px", fontStyle: "italic", lineHeight: 1.6 }}>{verse.translit}</p>
                )}

                {/* Translation */}
                {settings.showTranslation && verse.translation && (
                  <p className="px-4 pb-4" translate="no" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px", lineHeight: 1.7 }}>{verse.translation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
