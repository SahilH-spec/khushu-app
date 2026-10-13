import { useState } from "react";
import { Search, Bookmark, Play, Check, X, Volume2 } from "lucide-react";
import type { QuranSettings, BookmarkState } from "../App";

interface Props {
  bookmarks?: BookmarkState;
  onBookmarkSurah?: (num: number) => void;
  onNavigateSurah?: (num: number, name: string) => void;
  showSettings?: boolean;
  onCloseSettings?: () => void;
  settings?: QuranSettings;
  onUpdateSettings?: (s: QuranSettings) => void;
}

const DEFAULT_BOOKMARKS: BookmarkState = { surahs: [], verses: [], lastRead: null };
const DEFAULT_SETTINGS: QuranSettings  = { font: "uthmanic", size: "md", showTranslation: true, showTranslit: false, audioEnabled: true };

// All 114 surahs of the Quran
export const ALL_SURAHS = [
  { number: 1,   name: "Al-Fatihah",       arabic: "الفاتحة",        meaning: "The Opening",              verses: 7,   type: "Meccan"  },
  { number: 2,   name: "Al-Baqarah",       arabic: "البقرة",         meaning: "The Cow",                  verses: 286, type: "Medinan" },
  { number: 3,   name: "Ali 'Imran",       arabic: "آل عمران",       meaning: "Family of Imran",          verses: 200, type: "Medinan" },
  { number: 4,   name: "An-Nisa",          arabic: "النساء",         meaning: "The Women",                verses: 176, type: "Medinan" },
  { number: 5,   name: "Al-Ma'idah",       arabic: "المائدة",        meaning: "The Table Spread",         verses: 120, type: "Medinan" },
  { number: 6,   name: "Al-An'am",         arabic: "الأنعام",        meaning: "The Cattle",               verses: 165, type: "Meccan"  },
  { number: 7,   name: "Al-A'raf",         arabic: "الأعراف",        meaning: "The Heights",              verses: 206, type: "Meccan"  },
  { number: 8,   name: "Al-Anfal",         arabic: "الأنفال",        meaning: "The Spoils of War",        verses: 75,  type: "Medinan" },
  { number: 9,   name: "At-Tawbah",        arabic: "التوبة",         meaning: "The Repentance",           verses: 129, type: "Medinan" },
  { number: 10,  name: "Yunus",            arabic: "يونس",           meaning: "Jonah",                    verses: 109, type: "Meccan"  },
  { number: 11,  name: "Hud",              arabic: "هود",            meaning: "Hud",                      verses: 123, type: "Meccan"  },
  { number: 12,  name: "Yusuf",            arabic: "يوسف",           meaning: "Joseph",                   verses: 111, type: "Meccan"  },
  { number: 13,  name: "Ar-Ra'd",          arabic: "الرعد",          meaning: "The Thunder",              verses: 43,  type: "Medinan" },
  { number: 14,  name: "Ibrahim",          arabic: "إبراهيم",        meaning: "Abraham",                  verses: 52,  type: "Meccan"  },
  { number: 15,  name: "Al-Hijr",          arabic: "الحجر",          meaning: "The Rocky Tract",          verses: 99,  type: "Meccan"  },
  { number: 16,  name: "An-Nahl",          arabic: "النحل",          meaning: "The Bee",                  verses: 128, type: "Meccan"  },
  { number: 17,  name: "Al-Isra",          arabic: "الإسراء",        meaning: "The Night Journey",        verses: 111, type: "Meccan"  },
  { number: 18,  name: "Al-Kahf",          arabic: "الكهف",          meaning: "The Cave",                 verses: 110, type: "Meccan"  },
  { number: 19,  name: "Maryam",           arabic: "مريم",           meaning: "Mary",                     verses: 98,  type: "Meccan"  },
  { number: 20,  name: "Ta-Ha",            arabic: "طه",             meaning: "Ta-Ha",                    verses: 135, type: "Meccan"  },
  { number: 21,  name: "Al-Anbiya",        arabic: "الأنبياء",       meaning: "The Prophets",             verses: 112, type: "Meccan"  },
  { number: 22,  name: "Al-Hajj",          arabic: "الحج",           meaning: "The Pilgrimage",           verses: 78,  type: "Medinan" },
  { number: 23,  name: "Al-Mu'minun",      arabic: "المؤمنون",       meaning: "The Believers",            verses: 118, type: "Meccan"  },
  { number: 24,  name: "An-Nur",           arabic: "النور",          meaning: "The Light",                verses: 64,  type: "Medinan" },
  { number: 25,  name: "Al-Furqan",        arabic: "الفرقان",        meaning: "The Criterion",            verses: 77,  type: "Meccan"  },
  { number: 26,  name: "Ash-Shu'ara",      arabic: "الشعراء",        meaning: "The Poets",                verses: 227, type: "Meccan"  },
  { number: 27,  name: "An-Naml",          arabic: "النمل",          meaning: "The Ant",                  verses: 93,  type: "Meccan"  },
  { number: 28,  name: "Al-Qasas",         arabic: "القصص",          meaning: "The Stories",              verses: 88,  type: "Meccan"  },
  { number: 29,  name: "Al-'Ankabut",      arabic: "العنكبوت",       meaning: "The Spider",               verses: 69,  type: "Meccan"  },
  { number: 30,  name: "Ar-Rum",           arabic: "الروم",          meaning: "The Romans",               verses: 60,  type: "Meccan"  },
  { number: 31,  name: "Luqman",           arabic: "لقمان",          meaning: "Luqman",                   verses: 34,  type: "Meccan"  },
  { number: 32,  name: "As-Sajdah",        arabic: "السجدة",         meaning: "The Prostration",          verses: 30,  type: "Meccan"  },
  { number: 33,  name: "Al-Ahzab",         arabic: "الأحزاب",        meaning: "The Clans",                verses: 73,  type: "Medinan" },
  { number: 34,  name: "Saba",             arabic: "سبأ",            meaning: "Sheba",                    verses: 54,  type: "Meccan"  },
  { number: 35,  name: "Fatir",            arabic: "فاطر",           meaning: "The Originator",           verses: 45,  type: "Meccan"  },
  { number: 36,  name: "Ya-Sin",           arabic: "يس",             meaning: "Ya Sin",                   verses: 83,  type: "Meccan"  },
  { number: 37,  name: "As-Saffat",        arabic: "الصافات",        meaning: "Those Ranged in Ranks",    verses: 182, type: "Meccan"  },
  { number: 38,  name: "Sad",              arabic: "ص",              meaning: "The Letter Sad",           verses: 88,  type: "Meccan"  },
  { number: 39,  name: "Az-Zumar",         arabic: "الزمر",          meaning: "The Groups",               verses: 75,  type: "Meccan"  },
  { number: 40,  name: "Ghafir",           arabic: "غافر",           meaning: "The Forgiver",             verses: 85,  type: "Meccan"  },
  { number: 41,  name: "Fussilat",         arabic: "فصلت",           meaning: "Explained in Detail",      verses: 54,  type: "Meccan"  },
  { number: 42,  name: "Ash-Shura",        arabic: "الشورى",         meaning: "The Consultation",         verses: 53,  type: "Meccan"  },
  { number: 43,  name: "Az-Zukhruf",       arabic: "الزخرف",         meaning: "The Ornaments of Gold",    verses: 89,  type: "Meccan"  },
  { number: 44,  name: "Ad-Dukhan",        arabic: "الدخان",         meaning: "The Smoke",                verses: 59,  type: "Meccan"  },
  { number: 45,  name: "Al-Jathiyah",      arabic: "الجاثية",        meaning: "The Crouching",            verses: 37,  type: "Meccan"  },
  { number: 46,  name: "Al-Ahqaf",         arabic: "الأحقاف",        meaning: "The Wind-Curved Sandhills",verses: 35,  type: "Meccan"  },
  { number: 47,  name: "Muhammad",         arabic: "محمد",           meaning: "Muhammad",                 verses: 38,  type: "Medinan" },
  { number: 48,  name: "Al-Fath",          arabic: "الفتح",          meaning: "The Victory",              verses: 29,  type: "Medinan" },
  { number: 49,  name: "Al-Hujurat",       arabic: "الحجرات",        meaning: "The Rooms",                verses: 18,  type: "Medinan" },
  { number: 50,  name: "Qaf",              arabic: "ق",              meaning: "The Letter Qaf",           verses: 45,  type: "Meccan"  },
  { number: 51,  name: "Adh-Dhariyat",     arabic: "الذاريات",       meaning: "The Winnowing Winds",      verses: 60,  type: "Meccan"  },
  { number: 52,  name: "At-Tur",           arabic: "الطور",          meaning: "The Mount",                verses: 49,  type: "Meccan"  },
  { number: 53,  name: "An-Najm",          arabic: "النجم",          meaning: "The Star",                 verses: 62,  type: "Meccan"  },
  { number: 54,  name: "Al-Qamar",         arabic: "القمر",          meaning: "The Moon",                 verses: 55,  type: "Meccan"  },
  { number: 55,  name: "Ar-Rahman",        arabic: "الرحمن",         meaning: "The Most Merciful",        verses: 78,  type: "Medinan" },
  { number: 56,  name: "Al-Waqi'ah",       arabic: "الواقعة",        meaning: "The Inevitable",           verses: 96,  type: "Meccan"  },
  { number: 57,  name: "Al-Hadid",         arabic: "الحديد",         meaning: "The Iron",                 verses: 29,  type: "Medinan" },
  { number: 58,  name: "Al-Mujadila",      arabic: "المجادلة",       meaning: "The Pleading Woman",       verses: 22,  type: "Medinan" },
  { number: 59,  name: "Al-Hashr",         arabic: "الحشر",          meaning: "The Exile",                verses: 24,  type: "Medinan" },
  { number: 60,  name: "Al-Mumtahanah",    arabic: "الممتحنة",       meaning: "She that is to be Examined",verses: 13, type: "Medinan" },
  { number: 61,  name: "As-Saf",           arabic: "الصف",           meaning: "The Ranks",                verses: 14,  type: "Medinan" },
  { number: 62,  name: "Al-Jumu'ah",       arabic: "الجمعة",         meaning: "The Congregation",         verses: 11,  type: "Medinan" },
  { number: 63,  name: "Al-Munafiqun",     arabic: "المنافقون",      meaning: "The Hypocrites",           verses: 11,  type: "Medinan" },
  { number: 64,  name: "At-Taghabun",      arabic: "التغابن",        meaning: "The Mutual Disillusion",   verses: 18,  type: "Medinan" },
  { number: 65,  name: "At-Talaq",         arabic: "الطلاق",         meaning: "The Divorce",              verses: 12,  type: "Medinan" },
  { number: 66,  name: "At-Tahrim",        arabic: "التحريم",        meaning: "The Prohibition",          verses: 12,  type: "Medinan" },
  { number: 67,  name: "Al-Mulk",          arabic: "الملك",          meaning: "The Sovereignty",          verses: 30,  type: "Meccan"  },
  { number: 68,  name: "Al-Qalam",         arabic: "القلم",          meaning: "The Pen",                  verses: 52,  type: "Meccan"  },
  { number: 69,  name: "Al-Haqqah",        arabic: "الحاقة",         meaning: "The Reality",              verses: 52,  type: "Meccan"  },
  { number: 70,  name: "Al-Ma'arij",       arabic: "المعارج",        meaning: "The Ascending Stairways",  verses: 44,  type: "Meccan"  },
  { number: 71,  name: "Nuh",              arabic: "نوح",            meaning: "Noah",                     verses: 28,  type: "Meccan"  },
  { number: 72,  name: "Al-Jinn",          arabic: "الجن",           meaning: "The Jinn",                 verses: 28,  type: "Meccan"  },
  { number: 73,  name: "Al-Muzzammil",     arabic: "المزمل",         meaning: "The Enshrouded One",       verses: 20,  type: "Meccan"  },
  { number: 74,  name: "Al-Muddaththir",   arabic: "المدثر",         meaning: "The Cloaked One",          verses: 56,  type: "Meccan"  },
  { number: 75,  name: "Al-Qiyamah",       arabic: "القيامة",        meaning: "The Resurrection",         verses: 40,  type: "Meccan"  },
  { number: 76,  name: "Al-Insan",         arabic: "الإنسان",        meaning: "The Human",                verses: 31,  type: "Medinan" },
  { number: 77,  name: "Al-Mursalat",      arabic: "المرسلات",       meaning: "Those Sent Forth",         verses: 50,  type: "Meccan"  },
  { number: 78,  name: "An-Naba",          arabic: "النبأ",          meaning: "The Tidings",              verses: 40,  type: "Meccan"  },
  { number: 79,  name: "An-Nazi'at",       arabic: "النازعات",       meaning: "Those Who Pull Out",       verses: 46,  type: "Meccan"  },
  { number: 80,  name: "'Abasa",           arabic: "عبس",            meaning: "He Frowned",               verses: 42,  type: "Meccan"  },
  { number: 81,  name: "At-Takwir",        arabic: "التكوير",        meaning: "The Folding Up",           verses: 29,  type: "Meccan"  },
  { number: 82,  name: "Al-Infitar",       arabic: "الانفطار",       meaning: "The Cleaving",             verses: 19,  type: "Meccan"  },
  { number: 83,  name: "Al-Mutaffifin",    arabic: "المطففين",       meaning: "The Defrauders",           verses: 36,  type: "Meccan"  },
  { number: 84,  name: "Al-Inshiqaq",      arabic: "الانشقاق",       meaning: "The Sundering",            verses: 25,  type: "Meccan"  },
  { number: 85,  name: "Al-Buruj",         arabic: "البروج",         meaning: "The Mansions of the Stars",verses: 22,  type: "Meccan"  },
  { number: 86,  name: "At-Tariq",         arabic: "الطارق",         meaning: "The Morning Star",         verses: 17,  type: "Meccan"  },
  { number: 87,  name: "Al-A'la",          arabic: "الأعلى",         meaning: "The Most High",            verses: 19,  type: "Meccan"  },
  { number: 88,  name: "Al-Ghashiyah",     arabic: "الغاشية",        meaning: "The Overwhelming",         verses: 26,  type: "Meccan"  },
  { number: 89,  name: "Al-Fajr",          arabic: "الفجر",          meaning: "The Dawn",                 verses: 30,  type: "Meccan"  },
  { number: 90,  name: "Al-Balad",         arabic: "البلد",          meaning: "The City",                 verses: 20,  type: "Meccan"  },
  { number: 91,  name: "Ash-Shams",        arabic: "الشمس",          meaning: "The Sun",                  verses: 15,  type: "Meccan"  },
  { number: 92,  name: "Al-Layl",          arabic: "الليل",          meaning: "The Night",                verses: 21,  type: "Meccan"  },
  { number: 93,  name: "Ad-Duha",          arabic: "الضحى",          meaning: "The Morning Hours",        verses: 11,  type: "Meccan"  },
  { number: 94,  name: "Ash-Sharh",        arabic: "الشرح",          meaning: "The Relief",               verses: 8,   type: "Meccan"  },
  { number: 95,  name: "At-Tin",           arabic: "التين",          meaning: "The Fig",                  verses: 8,   type: "Meccan"  },
  { number: 96,  name: "Al-'Alaq",         arabic: "العلق",          meaning: "The Clot",                 verses: 19,  type: "Meccan"  },
  { number: 97,  name: "Al-Qadr",          arabic: "القدر",          meaning: "The Power",                verses: 5,   type: "Meccan"  },
  { number: 98,  name: "Al-Bayyinah",      arabic: "البينة",         meaning: "The Clear Proof",          verses: 8,   type: "Medinan" },
  { number: 99,  name: "Az-Zalzalah",      arabic: "الزلزلة",        meaning: "The Earthquake",           verses: 8,   type: "Medinan" },
  { number: 100, name: "Al-'Adiyat",       arabic: "العاديات",       meaning: "The Courser",              verses: 11,  type: "Meccan"  },
  { number: 101, name: "Al-Qari'ah",       arabic: "القارعة",        meaning: "The Calamity",             verses: 11,  type: "Meccan"  },
  { number: 102, name: "At-Takathur",      arabic: "التكاثر",        meaning: "The Rivalry in World Increase", verses: 8, type: "Meccan" },
  { number: 103, name: "Al-'Asr",          arabic: "العصر",          meaning: "The Declining Day",        verses: 3,   type: "Meccan"  },
  { number: 104, name: "Al-Humazah",       arabic: "الهمزة",         meaning: "The Traducer",             verses: 9,   type: "Meccan"  },
  { number: 105, name: "Al-Fil",           arabic: "الفيل",          meaning: "The Elephant",             verses: 5,   type: "Meccan"  },
  { number: 106, name: "Quraysh",          arabic: "قريش",           meaning: "Quraysh",                  verses: 4,   type: "Meccan"  },
  { number: 107, name: "Al-Ma'un",         arabic: "الماعون",        meaning: "The Small Kindnesses",     verses: 7,   type: "Meccan"  },
  { number: 108, name: "Al-Kawthar",       arabic: "الكوثر",         meaning: "Abundance",                verses: 3,   type: "Meccan"  },
  { number: 109, name: "Al-Kafirun",       arabic: "الكافرون",       meaning: "The Disbelievers",         verses: 6,   type: "Meccan"  },
  { number: 110, name: "An-Nasr",          arabic: "النصر",          meaning: "The Divine Support",       verses: 3,   type: "Medinan" },
  { number: 111, name: "Al-Masad",         arabic: "المسد",          meaning: "The Palm Fibre",           verses: 5,   type: "Meccan"  },
  { number: 112, name: "Al-Ikhlas",        arabic: "الإخلاص",        meaning: "Sincerity",                verses: 4,   type: "Meccan"  },
  { number: 113, name: "Al-Falaq",         arabic: "الفلق",          meaning: "The Daybreak",             verses: 5,   type: "Meccan"  },
  { number: 114, name: "An-Nas",           arabic: "الناس",          meaning: "Mankind",                  verses: 6,   type: "Meccan"  },
];

const FONTS = [
  { id: "uthmanic", label: "Uthmani",  family: "Scheherazade New, serif",                         preview: "بِسْمِ ٱللَّهِ" },
  { id: "indopak",  label: "IndoPak",  family: "'IndoPak Nastaleeq', 'Noto Nastaliq Urdu', serif", preview: "بِسۡمِ اللهِ"  },
] as const;

const SIZES = [
  { id: "sm", label: "S" }, { id: "md", label: "M" }, { id: "lg", label: "L" }, { id: "xl", label: "XL" },
] as const;

function SettingsView({ settings, onUpdate, onClose }: { settings: QuranSettings; onUpdate: (s: QuranSettings) => void; onClose: () => void }) {
  const update = (patch: Partial<QuranSettings>) => onUpdate({ ...settings, ...patch });
  const previewFont = FONTS.find(f => f.id === settings.font)?.family ?? FONTS[0].family;
  const previewSize = { sm: "18px", md: "22px", lg: "26px", xl: "30px" }[settings.size];

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "20px" }}>Display Settings</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--k-surface-2)" }}>
          <X size={16} style={{ color: "var(--k-text-muted)" }} />
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-2xl p-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <p style={{ fontFamily: previewFont, color: "var(--k-text)", fontSize: previewSize, lineHeight: 2 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        {settings.showTranslit && <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "13px", fontStyle: "italic" }}>Bismi llāhi r-raḥmāni r-raḥīm</p>}
        {settings.showTranslation && <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>In the name of Allah, the Most Gracious, the Most Merciful</p>}
      </div>

      {/* Font style */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "8px" }} className="uppercase">Font Style</p>
        <div className="flex flex-col gap-2">
          {FONTS.map(f => (
            <button key={f.id} onClick={() => update({ font: f.id })} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: settings.font === f.id ? "var(--k-gold-sub)" : "var(--k-surface)", border: settings.font === f.id ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
              <p style={{ fontFamily: "Nunito, sans-serif", color: settings.font === f.id ? "var(--k-gold)" : "var(--k-text)", fontSize: "14px" }}>{f.label}</p>
              <div className="flex items-center gap-2">
                <p style={{ fontFamily: f.family, color: "var(--k-text-muted)", fontSize: "16px" }}>{f.preview}</p>
                {settings.font === f.id && <Check size={14} style={{ color: "var(--k-gold)" }} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "8px" }} className="uppercase">Font Size</p>
        <div className="flex gap-2">
          {SIZES.map(s => (
            <button key={s.id} onClick={() => update({ size: s.id })} className="flex-1 rounded-xl py-2 text-center" style={{ background: settings.size === s.id ? "var(--k-gold-sub)" : "var(--k-surface)", border: settings.size === s.id ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
              <p style={{ fontFamily: "Nunito, sans-serif", color: settings.size === s.id ? "var(--k-gold)" : "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      {[
        { key: "showTranslation" as const, label: "English Translation", icon: "🌐" },
        { key: "showTranslit"    as const, label: "Transliteration",     icon: "Aa" },
        { key: "audioEnabled"    as const, label: "Audio Playback",      icon: null },
      ].map(({ key, label, icon }) => (
        <div key={key} className="flex items-center justify-between rounded-xl px-3 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <div className="flex items-center gap-2">
            {key === "audioEnabled" ? <Volume2 size={15} style={{ color: "var(--k-text-muted)" }} /> : <span style={{ fontSize: "14px" }}>{icon}</span>}
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}>{label}</p>
          </div>
          <button onClick={() => update({ [key]: !settings[key] })} className="w-11 h-6 rounded-full relative" style={{ background: settings[key] ? "var(--k-green)" : "var(--k-surface-2)" }}>
            <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all" style={{ left: settings[key] ? "calc(100% - 22px)" : "2px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function QuranPage({ bookmarks: bm, onBookmarkSurah, onNavigateSurah, showSettings, onCloseSettings, settings: st, onUpdateSettings }: Props) {
  const [search, setSearch] = useState("");
  const bookmarks = bm ?? DEFAULT_BOOKMARKS;
  const settings  = st ?? DEFAULT_SETTINGS;

  if (showSettings) return <SettingsView settings={settings} onUpdate={onUpdateSettings ?? (() => {})} onClose={onCloseSettings ?? (() => {})} />;

  const filtered = ALL_SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.arabic.includes(search) ||
    s.meaning.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number).includes(search)
  );
  const bookmarkedSurahs = ALL_SURAHS.filter(s => (bookmarks.surahs ?? []).includes(s.number));

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Continue reading */}
      {bookmarks.lastRead ? (
        <button onClick={() => onNavigateSurah?.(bookmarks.lastRead!.surahNum, bookmarks.lastRead!.surahName)} className="mx-4 mt-3 rounded-2xl p-4 flex items-center gap-3 text-left w-auto" style={{ background: "linear-gradient(135deg, var(--k-green) 0%, #0f3d35 100%)" }}>
          <div className="flex-1">
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.7)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }} className="uppercase mb-0.5">Continue Reading</p>
            <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "18px" }}>{bookmarks.lastRead.surahName}</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.6)", fontSize: "12px" }}>Verse {bookmarks.lastRead.verseNum}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,168,75,0.25)" }}>
            <Play size={16} fill="#c8a84b" style={{ color: "#c8a84b" }} />
          </div>
        </button>
      ) : (
        <div className="mx-4 mt-3 rounded-2xl p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e3a5e 0%, var(--k-surface) 100%)", border: "1px solid var(--k-border)" }}>
          <div className="flex-1">
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }} className="uppercase tracking-widest mb-0.5">Start Reading</p>
            <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "18px" }}>Select a Surah below</p>
          </div>
          <span style={{ fontSize: "24px" }}>📖</span>
        </div>
      )}

      {/* Bookmarked surahs */}
      {bookmarkedSurahs.length > 0 && (
        <div className="mx-4">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark size={13} style={{ color: "var(--k-gold)" }} />
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }} className="uppercase">Bookmarked</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {bookmarkedSurahs.map(s => (
              <button key={s.number} onClick={() => onNavigateSurah?.(s.number, s.name)} className="flex-shrink-0 rounded-xl px-3 py-2" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
                <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "16px" }}>{s.arabic}</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "11px" }}>{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mx-4 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <Search size={15} style={{ color: "var(--k-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, number, or meaning…" className="bg-transparent flex-1 outline-none" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }} />
        {search && <button onClick={() => setSearch("")}><X size={14} style={{ color: "var(--k-text-muted)" }} /></button>}
      </div>

      {/* Surah list */}
      <div className="mx-4 flex flex-col gap-2">
        {filtered.map(surah => {
          const isBookmarked = (bookmarks.surahs ?? []).includes(surah.number);
          return (
            <div key={surah.number} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <button onClick={() => onNavigateSurah?.(surah.number, surah.name)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--k-gold-sub)" }}>
                  <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "11px", fontWeight: 700 }}>{surah.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{surah.name}</p>
                    <span className="rounded-full px-1.5 py-0.5" style={{ background: "var(--k-green-sub)", color: "var(--k-teal)", fontSize: "9px", fontFamily: "Nunito, sans-serif" }}>{surah.type}</span>
                  </div>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{surah.meaning} · {surah.verses} verses</p>
                </div>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "18px" }}>{surah.arabic}</p>
                <button onClick={() => onBookmarkSurah?.(surah.number)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isBookmarked ? "var(--k-gold-sub)" : "transparent" }}>
                  <Bookmark size={14} fill={isBookmarked ? "var(--k-gold)" : "none"} style={{ color: isBookmarked ? "var(--k-gold)" : "var(--k-text-disabled)" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
