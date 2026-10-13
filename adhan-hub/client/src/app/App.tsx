import { useState, useEffect, useCallback } from "react";
import { Home, BookOpen, Heart, Repeat2, Star, MoreHorizontal, Radio, Sun, Moon, ChevronLeft, Settings } from "lucide-react";
import logo from "../imports/transparent__1_.png";
import { HomePage } from "./components/HomePage";
import { QuranPage } from "./components/QuranPage";
import { SurahPage } from "./components/SurahPage";
import { DuasPage } from "./components/DuasPage";
import { DhikrPage } from "./components/DhikrPage";
import { NamesPage } from "./components/NamesPage";
import { MorePage } from "./components/MorePage";
import { AdhanHubPage } from "./components/AdhanHubPage";
import { CalendarPage } from "./components/CalendarPage";
import { HadithCollectionPage } from "./components/HadithCollectionPage";
import { QiblaPage } from "./components/QiblaPage";
import { SadaqahPage } from "./components/SadaqahPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { RemindersPage } from "./components/RemindersPage";
import { AppSettingsPage } from "./components/AppSettingsPage";
import { AboutPage } from "./components/AboutPage";
import { AdminPage } from "./components/AdminPage";
import { ProfilePickerPage } from "./components/ProfilePickerPage";
import { StarPattern } from "./components/GeometricPattern";

type Tab = "home" | "quran" | "duas" | "dhikr" | "names" | "adhan" | "more";

export interface QuranSettings {
  font: "uthmanic" | "indopak";
  size: "sm" | "md" | "lg" | "xl";
  showTranslation: boolean;
  showTranslit: boolean;
  audioEnabled: boolean;
}

export interface BookmarkState {
  surahs: number[];
  verses: string[];
  lastRead: { surahNum: number; surahName: string; verseNum: number } | null;
}

interface SubPage { id: string; title: string; }

const HIJRI_MONTHS = ["Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhul-Qi'dah","Dhul-Hijjah"];
function toHijri(date: Date) {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const month = Math.floor(24 * l / 709);
  const day = l - Math.floor(709 * month / 24);
  const year = 30 * n + j - 30;
  return { day, month: HIJRI_MONTHS[month - 1] ?? "Dhul-Hijjah", year };
}
const HIJRI = toHijri(new Date());
const FONT_FAMILIES = {
  uthmanic: "Scheherazade New, serif",
  indopak:  "'IndoPak Nastaleeq', 'Noto Nastaliq Urdu', serif",
};
const FONT_SIZES = { sm: "18px", md: "22px", lg: "26px", xl: "30px" };

const NAV: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "home",  label: "Home",     Icon: Home          },
  { id: "quran", label: "Quran",    Icon: BookOpen      },
  { id: "duas",  label: "Duas",     Icon: Heart         },
  { id: "dhikr", label: "Dhikr",    Icon: Repeat2       },
  { id: "names", label: "99 Names", Icon: Star          },
  { id: "adhan", label: "Adhan",    Icon: Radio         },
  { id: "more",  label: "More",     Icon: MoreHorizontal},
];

const TAB_TITLES: Record<Tab, string> = {
  home: "Home", quran: "Read Quran", duas: "Duas",
  dhikr: "Dhikr", names: "99 Names of Allah", adhan: "Adhan Hub", more: "More",
};

function loadBookmarks(): BookmarkState {
  try {
    const raw = localStorage.getItem("khushu-bookmarks");
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return { surahs: [], verses: [], lastRead: null };
}

function saveBookmarks(b: BookmarkState) {
  try { localStorage.setItem("khushu-bookmarks", JSON.stringify(b)); } catch (_) { /* ignore */ }
}

function loadQuranSettings(): QuranSettings {
  try {
    const raw = localStorage.getItem("khushu-quran-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old font values that no longer exist
      if (parsed.font === "simplified" || parsed.font === "amiri") parsed.font = "uthmanic";
      return parsed;
    }
  } catch (_) { /* ignore */ }
  return { font: "uthmanic", size: "md", showTranslation: true, showTranslit: false, audioEnabled: true };
}

// ── Profile helpers ───────────────────────────────────────────────────
interface StoredProfile { id: string; name: string; isAdmin: boolean; }

function loadStoredProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem("siraj-profile");
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return null;
}

function saveStoredProfile(p: StoredProfile) {
  try { localStorage.setItem("siraj-profile", JSON.stringify(p)); } catch (_) { /* ignore */ }
}

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("khushu-theme") === "dark");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [subPage, setSubPage] = useState<SubPage | null>(null);
  const [showQuranSettings, setShowQuranSettings] = useState(false);
  const [quranSettings, setQuranSettings] = useState<QuranSettings>(loadQuranSettings);
  const [bookmarks, setBookmarks] = useState<BookmarkState>(loadBookmarks);
  const [refreshKey, setRefreshKey] = useState(0);

  // Profile state
  const [profile, setProfile] = useState<StoredProfile | null>(loadStoredProfile);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) setRefreshKey(k => k + 1); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  useEffect(() => {
    try { localStorage.setItem("khushu-quran-settings", JSON.stringify(quranSettings)); } catch (_) { /* ignore */ }
  }, [quranSettings]);

  const handleSelectProfile = (id: string, name: string, isAdmin: boolean) => {
    const p = { id, name, isAdmin };
    setProfile(p);
    saveStoredProfile(p);
  };

  const navigate = (id: string, title: string) => setSubPage({ id, title });
  const goBack = () => setSubPage(null);

  const toggleSurahBookmark = useCallback((num: number) =>
    setBookmarks(b => ({ ...b, surahs: b.surahs.includes(num) ? b.surahs.filter(n => n !== num) : [...b.surahs, num] })), []);

  const toggleVerseBookmark = useCallback((key: string) =>
    setBookmarks(b => ({ ...b, verses: b.verses.includes(key) ? b.verses.filter(k => k !== key) : [...b.verses, key] })), []);

  const updateLastRead = useCallback((surahNum: number, surahName: string, verseNum: number) =>
    setBookmarks(b => ({ ...b, lastRead: { surahNum, surahName, verseNum } })), []);

  // Show profile picker on first visit
  if (!profile) {
    return (
      <div className={isDark ? "dark" : ""} style={{ minHeight: "100svh" }}>
        <div className="min-h-screen w-full flex items-start justify-center" style={{ background: isDark ? "#050d1a" : "#d6d0c4" }}>
          <div className="flex flex-col" style={{ width: "min(100vw, 430px)", height: "100svh", background: "var(--k-bg)" }}>
            <ProfilePickerPage onSelect={handleSelectProfile} />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (subPage) {
      const { id } = subPage;
      if (id.startsWith("surah-")) {
        const num = parseInt(id.replace("surah-", ""), 10);
        return (
          <SurahPage
            surahNum={num} settings={quranSettings} bookmarks={bookmarks}
            onBookmarkVerse={toggleVerseBookmark} onUpdateLastRead={updateLastRead}
            fontFamily={FONT_FAMILIES[quranSettings.font]} fontSize={FONT_SIZES[quranSettings.size]}
          />
        );
      }
      const map: Record<string, React.ReactElement> = {
        calendar:       <CalendarPage />,
        hadith:         <HadithCollectionPage />,
        qibla:          <QiblaPage />,
        sadaqah:        <SadaqahPage />,
        favorites:      <FavoritesPage bookmarks={bookmarks} />,
        reminders:      <RemindersPage />,
        "app-settings": <AppSettingsPage />,
        about:          <AboutPage />,
        // Admin page — only accessible when on the admin profile
        ...(profile.isAdmin ? { admin: <AdminPage /> } : {}),
        // Profile switcher
        "switch-profile": (
          <ProfilePickerPage onSelect={(id, name, isAdmin) => {
            handleSelectProfile(id, name, isAdmin);
            setSubPage(null);
          }} />
        ),
      };
      return map[id] ?? null;
    }
    switch (activeTab) {
      case "home":  return <HomePage refreshKey={refreshKey} />;
      case "quran": return (
        <QuranPage
          bookmarks={bookmarks} onBookmarkSurah={toggleSurahBookmark}
          onNavigateSurah={(num, title) => navigate(`surah-${num}`, title)}
          showSettings={showQuranSettings} onCloseSettings={() => setShowQuranSettings(false)}
          settings={quranSettings} onUpdateSettings={s => setQuranSettings(s)}
        />
      );
      case "duas":  return <DuasPage />;
      case "dhikr": return <DhikrPage />;
      case "names": return <NamesPage />;
      case "adhan": return <AdhanHubPage profileId={profile.id} profileName={profile.name} />;
      case "more":  return <MorePage onNavigate={navigate} isAdmin={profile.isAdmin} />;
    }
  };

  const isSubPage = !!subPage;
  const showQBtn  = !isSubPage && activeTab === "quran";

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100svh" }}>
      <div className="min-h-screen w-full flex items-start justify-center" style={{ background: isDark ? "#050d1a" : "#d6d0c4" }}>
        <div className="flex flex-col" style={{ width: "min(100vw, 430px)", height: "100svh", background: "var(--k-bg)", fontFamily: "Nunito, sans-serif", overflow: "hidden" }}>
          {/* Header */}
          {isSubPage ? (
            <div className="flex items-center px-3 py-2.5 flex-shrink-0" style={{ background: "var(--k-surface)", borderBottom: "1px solid var(--k-border)" }}>
              <button onClick={goBack} className="flex items-center gap-0.5 py-1 pr-3" style={{ color: "var(--k-green)", fontFamily: "Nunito, sans-serif", fontSize: "14px", fontWeight: 600 }}>
                <ChevronLeft size={18} />Back
              </button>
              <p className="flex-1 text-center truncate" style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "18px" }}>{subPage.title}</p>
              <div className="w-16" />
            </div>
          ) : (
            <div className="relative flex-shrink-0 overflow-hidden" style={{ background: "var(--k-surface)", borderBottom: "1px solid var(--k-border)" }}>
              <StarPattern className="absolute inset-0 w-full h-full pointer-events-none" style={{ color: "var(--k-gold)", opacity: 0.35 }} />
              <div className="relative z-10 flex flex-col items-center py-4 px-4">
                <button
                  onClick={() => setIsDark(d => { const next = !d; localStorage.setItem("khushu-theme", next ? "dark" : "light"); return next; })}
                  className="absolute right-4 top-4 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun size={15} style={{ color: "var(--k-gold)" }} /> : <Moon size={15} style={{ color: "var(--k-gold)" }} />}
                </button>
                {showQBtn && (
                  <button onClick={() => setShowQuranSettings(true)} className="absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }} aria-label="Quran settings">
                    <Settings size={15} style={{ color: "var(--k-gold)" }} />
                  </button>
                )}
                <div className="mb-2 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.92)" : "transparent", padding: isDark ? "5px 16px" : "0" }}>
                  <img src={logo} alt="Khushu" style={{ height: "96px", width: "auto", objectFit: "contain", display: "block" }} />
                </div>
                {activeTab === "home" && (
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
                    <span style={{ fontSize: "12px" }}>🌙</span>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "12px", fontWeight: 700 }}>
                      {HIJRI.day} {HIJRI.month} {HIJRI.year} AH
                    </p>
                  </div>
                )}
                {activeTab !== "home" && (
                  <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "19px" }}>{TAB_TITLES[activeTab]}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", background: "var(--k-bg)" }}>
            {renderContent()}
          </div>

          <div className="flex-shrink-0 flex items-stretch" style={{ background: "var(--k-nav-bg)", borderTop: "1px solid var(--k-border)", paddingBottom: "env(safe-area-inset-bottom, 6px)", boxShadow: "0 -2px 12px var(--k-shadow)" }}>
            {NAV.map(({ id, label, Icon }) => {
              const active = activeTab === id && !isSubPage;
              return (
                <button key={id} onClick={() => { setSubPage(null); setActiveTab(id); setShowQuranSettings(false); }} className="flex flex-1 flex-col items-center justify-center py-2 gap-0.5" style={{ minWidth: 0 }}>
                  <div className="flex items-center justify-center w-7 h-6 rounded-lg" style={{ background: active ? "var(--k-gold-sub)" : "transparent" }}>
                    <Icon size={15} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "var(--k-gold)" : "var(--k-text-disabled)" }} />
                  </div>
                  <p style={{ fontFamily: "Nunito, sans-serif", fontSize: "8px", color: active ? "var(--k-gold)" : "var(--k-text-disabled)", fontWeight: active ? 700 : 400, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", paddingInline: "2px" }}>
                    {label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
