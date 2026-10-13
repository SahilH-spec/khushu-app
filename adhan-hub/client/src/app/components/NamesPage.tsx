import { useState } from "react";
import { Search } from "lucide-react";

const names = [
  { number: 1,  arabic: "اللَّهُ",          transliteration: "Allah",          meaning: "The One God",                  detail: "The greatest name of Allah. He is the one God with no partner, no equal, and no rival. All other names and attributes belong to Him." },
  { number: 2,  arabic: "الرَّحْمَنُ",      transliteration: "Ar-Rahman",      meaning: "The Most Gracious",            detail: "The One who has vast mercy encompassing all of creation in this world — believers and non-believers alike." },
  { number: 3,  arabic: "الرَّحِيمُ",       transliteration: "Ar-Rahim",       meaning: "The Most Merciful",            detail: "The One whose mercy is specific and abundant for the believers in the Hereafter." },
  { number: 4,  arabic: "الْمَلِكُ",        transliteration: "Al-Malik",       meaning: "The King",                     detail: "The One with complete dominion and sovereignty, owning everything in existence." },
  { number: 5,  arabic: "الْقُدُّوسُ",      transliteration: "Al-Quddus",      meaning: "The Most Holy",                detail: "The One pure from any imperfection, deficiency, or defect." },
  { number: 6,  arabic: "السَّلَامُ",       transliteration: "As-Salam",       meaning: "The Source of Peace",          detail: "The One who is free from every imperfection; the One who grants peace and safety to His creation." },
  { number: 7,  arabic: "الْمُؤْمِنُ",      transliteration: "Al-Mu'min",      meaning: "The Guardian of Faith",        detail: "The One who gives security and safety. He grants peace to the believers and protects them from fear." },
  { number: 8,  arabic: "الْمُهَيْمِنُ",    transliteration: "Al-Muhaymin",    meaning: "The Protector",                detail: "The One who observes and oversees everything. He watches over all of creation with perfect knowledge." },
  { number: 9,  arabic: "الْعَزِيزُ",       transliteration: "Al-Aziz",        meaning: "The Almighty",                 detail: "The Mighty who is never overcome; the One whose honor and power are absolute and unmatched." },
  { number: 10, arabic: "الْجَبَّارُ",      transliteration: "Al-Jabbar",      meaning: "The Compeller",                detail: "The One who compels all things according to His divine will; He can restore what is broken." },
  { number: 11, arabic: "الْمُتَكَبِّرُ",   transliteration: "Al-Mutakabbir",  meaning: "The Majestic",                 detail: "The One who is above any attributes of His creation; supremely great in dignity and honor." },
  { number: 12, arabic: "الْخَالِقُ",       transliteration: "Al-Khaliq",      meaning: "The Creator",                  detail: "The One who creates everything from nothing, bringing existence out of non-existence." },
  { number: 13, arabic: "الْبَارِئُ",       transliteration: "Al-Bari",        meaning: "The Originator",               detail: "The One who creates all things according to a precise plan without any prior model." },
  { number: 14, arabic: "الْمُصَوِّرُ",     transliteration: "Al-Musawwir",    meaning: "The Shaper of Beauty",         detail: "The One who shapes all of His creation into unique and fitting forms." },
  { number: 15, arabic: "الْغَفَّارُ",      transliteration: "Al-Ghaffar",     meaning: "The Forgiving",                detail: "The One who forgives the sins of His servants repeatedly and continuously." },
  { number: 16, arabic: "الْقَهَّارُ",      transliteration: "Al-Qahhar",      meaning: "The Subduer",                  detail: "The One who subdues all of creation and against whom nothing can withstand." },
  { number: 17, arabic: "الْوَهَّابُ",      transliteration: "Al-Wahhab",      meaning: "The Bestower",                 detail: "The One who continuously gives and bestows gifts to His creation without any need of compensation." },
  { number: 18, arabic: "الرَّزَّاقُ",      transliteration: "Ar-Razzaq",      meaning: "The Provider",                 detail: "The One who provides sustenance to all of His creation — both the seen and unseen." },
  { number: 19, arabic: "الْفَتَّاحُ",      transliteration: "Al-Fattah",      meaning: "The Opener",                   detail: "The One who opens the gates of mercy and provision for His servants." },
  { number: 20, arabic: "الْعَلِيمُ",       transliteration: "Al-'Alim",       meaning: "The All-Knowing",              detail: "The One whose knowledge is complete and perfect; He knows everything hidden and manifest." },
  { number: 21, arabic: "الْقَابِضُ",       transliteration: "Al-Qabid",       meaning: "The Withholder",               detail: "The One who withholds and restricts provision by His wisdom; He constricts hearts with sadness." },
  { number: 22, arabic: "الْبَاسِطُ",       transliteration: "Al-Basit",       meaning: "The Extender",                 detail: "The One who expands provision and abundance for whom He wills by His wisdom." },
  { number: 23, arabic: "الْخَافِضُ",       transliteration: "Al-Khafid",      meaning: "The Reducer",                  detail: "The One who lowers and degrades the arrogant and oppressors." },
  { number: 24, arabic: "الرَّافِعُ",       transliteration: "Ar-Rafi",        meaning: "The Exalter",                  detail: "The One who raises the believers and the pious in honor and status." },
  { number: 25, arabic: "الْمُعِزُّ",       transliteration: "Al-Mu'izz",      meaning: "The Honorer",                  detail: "The One who grants honor and dignity to whom He wills." },
  { number: 26, arabic: "الْمُذِلُّ",       transliteration: "Al-Mudhill",     meaning: "The Humiliator",               detail: "The One who humiliates and disgraces those who deserve it by His wisdom and justice." },
  { number: 27, arabic: "السَّمِيعُ",       transliteration: "As-Sami",        meaning: "The All-Hearing",              detail: "The One who hears all sounds and voices without limitation or restriction." },
  { number: 28, arabic: "الْبَصِيرُ",       transliteration: "Al-Basir",       meaning: "The All-Seeing",               detail: "The One who sees all things, hidden and manifest, no matter how small or concealed." },
  { number: 29, arabic: "الْحَكَمُ",        transliteration: "Al-Hakam",       meaning: "The Judge",                    detail: "The ultimate Judge who decides all matters with perfect justice and wisdom." },
  { number: 30, arabic: "الْعَدْلُ",        transliteration: "Al-'Adl",        meaning: "The Just",                     detail: "The One who is perfectly just; He never wrongs anyone, even by the weight of an atom." },
  { number: 31, arabic: "اللَّطِيفُ",       transliteration: "Al-Latif",       meaning: "The Subtle",                   detail: "The One who is kind and gentle; He knows the finest details and provides through subtle means." },
  { number: 32, arabic: "الْخَبِيرُ",       transliteration: "Al-Khabir",      meaning: "The All-Aware",                detail: "The One who is aware of all inner states, intentions, and hidden secrets." },
  { number: 33, arabic: "الْحَلِيمُ",       transliteration: "Al-Halim",       meaning: "The Forbearing",               detail: "The One who does not hasten punishment; He grants time for repentance with great patience." },
  { number: 34, arabic: "الْعَظِيمُ",       transliteration: "Al-'Azim",       meaning: "The Magnificent",              detail: "The One of supreme greatness and grandeur; His majesty transcends all comprehension." },
  { number: 35, arabic: "الْغَفُورُ",       transliteration: "Al-Ghafur",      meaning: "The Forgiving",                detail: "The One who overlooks and forgives sins; His forgiveness is vast and encompasses all who repent." },
  { number: 36, arabic: "الشَّكُورُ",       transliteration: "Ash-Shakur",     meaning: "The Grateful",                 detail: "The One who appreciates good deeds and rewards them abundantly, even if they are small." },
  { number: 37, arabic: "الْعَلِيُّ",       transliteration: "Al-'Ali",        meaning: "The Most High",                detail: "The One who is above all of creation in every way — in power, status, and essence." },
  { number: 38, arabic: "الْكَبِيرُ",       transliteration: "Al-Kabir",       meaning: "The Most Great",               detail: "The One who is the greatest in every aspect; no thing is comparable to His greatness." },
  { number: 39, arabic: "الْحَفِيظُ",       transliteration: "Al-Hafiz",       meaning: "The Preserver",                detail: "The One who preserves and protects all of creation; He guards the deeds of every person." },
  { number: 40, arabic: "الْمُقِيتُ",       transliteration: "Al-Muqit",       meaning: "The Sustainer",                detail: "The One who provides and sustains every living thing with what it needs." },
  { number: 41, arabic: "الْحَسِيبُ",       transliteration: "Al-Hasib",       meaning: "The Reckoner",                 detail: "The One who takes account of all deeds and is sufficient as a reckoner on the Day of Judgment." },
  { number: 42, arabic: "الْجَلِيلُ",       transliteration: "Al-Jalil",       meaning: "The Majestic",                 detail: "The One of majestic attributes and supreme grandeur; He possesses perfect attributes." },
  { number: 43, arabic: "الْكَرِيمُ",       transliteration: "Al-Karim",       meaning: "The Generous",                 detail: "The One who is continuously generous and noble; He gives without being asked and beyond what is expected." },
  { number: 44, arabic: "الرَّقِيبُ",       transliteration: "Ar-Raqib",       meaning: "The Watchful",                 detail: "The One who watches over all things at all times; nothing escapes His observation." },
  { number: 45, arabic: "الْمُجِيبُ",       transliteration: "Al-Mujib",       meaning: "The Responsive",               detail: "The One who responds to every sincere call and answers all supplications of those who ask." },
  { number: 46, arabic: "الْوَاسِعُ",       transliteration: "Al-Wasi",        meaning: "The All-Encompassing",         detail: "The One whose knowledge, mercy, and power encompass everything in existence." },
  { number: 47, arabic: "الْحَكِيمُ",       transliteration: "Al-Hakim",       meaning: "The Wise",                     detail: "The One whose wisdom is perfect; He places everything in its right place with perfect precision." },
  { number: 48, arabic: "الْوَدُودُ",       transliteration: "Al-Wadud",       meaning: "The Loving",                   detail: "The One who loves His righteous servants and is loved by those who believe." },
  { number: 49, arabic: "الْمَجِيدُ",       transliteration: "Al-Majid",       meaning: "The Glorious",                 detail: "The One of great glory and magnificent attributes; His honor and praise are beyond all limits." },
  { number: 50, arabic: "الْبَاعِثُ",       transliteration: "Al-Ba'ith",      meaning: "The Resurrector",              detail: "The One who will resurrect all of creation after death on the Day of Judgment." },
  { number: 51, arabic: "الشَّهِيدُ",       transliteration: "Ash-Shahid",     meaning: "The Witness",                  detail: "The One who witnesses all things; nothing in the heavens or earth is hidden from Him." },
  { number: 52, arabic: "الْحَقُّ",         transliteration: "Al-Haqq",        meaning: "The Truth",                    detail: "The One whose existence is absolute truth; He is the only true God and His word is truth." },
  { number: 53, arabic: "الْوَكِيلُ",       transliteration: "Al-Wakil",       meaning: "The Trustee",                  detail: "The One in whom total reliance and trust can be placed; He is the best disposer of affairs." },
  { number: 54, arabic: "الْقَوِيُّ",       transliteration: "Al-Qawiyy",      meaning: "The All-Powerful",             detail: "The One of infinite strength and power; He is never weakened by anything." },
  { number: 55, arabic: "الْمَتِينُ",       transliteration: "Al-Matin",       meaning: "The Firm",                     detail: "The One of absolute steadfastness and strength; His power never diminishes." },
  { number: 56, arabic: "الْوَلِيُّ",       transliteration: "Al-Wali",        meaning: "The Protector",                detail: "The One who is the ally, guardian, and protector of the believers." },
  { number: 57, arabic: "الْحَمِيدُ",       transliteration: "Al-Hamid",       meaning: "The Praiseworthy",             detail: "The One who is praised for His beautiful attributes and perfect actions; all praise belongs to Him." },
  { number: 58, arabic: "الْمُحْصِي",       transliteration: "Al-Muhsi",       meaning: "The Reckoner",                 detail: "The One who counts and records all things; nothing, no matter how small, escapes His count." },
  { number: 59, arabic: "الْمُبْدِئُ",      transliteration: "Al-Mubdi",       meaning: "The Originator",               detail: "The One who created all things for the first time without any prior example or model." },
  { number: 60, arabic: "الْمُعِيدُ",       transliteration: "Al-Mu'id",       meaning: "The Restorer",                 detail: "The One who brings creation back after its death on the Day of Resurrection." },
  { number: 61, arabic: "الْمُحْيِي",       transliteration: "Al-Muhyi",       meaning: "The Giver of Life",            detail: "The One who gives life to all living things and will restore life on the Day of Resurrection." },
  { number: 62, arabic: "الْمُمِيتُ",       transliteration: "Al-Mumit",       meaning: "The Taker of Life",            detail: "The One who causes death to all living things; life and death are entirely in His hands." },
  { number: 63, arabic: "الْحَيُّ",         transliteration: "Al-Hayy",        meaning: "The Ever-Living",              detail: "The One who is alive and will never die; His life has no beginning or end." },
  { number: 64, arabic: "الْقَيُّومُ",      transliteration: "Al-Qayyum",      meaning: "The Self-Subsisting",          detail: "The One who sustains Himself and sustains all of creation; everything depends on Him." },
  { number: 65, arabic: "الْوَاجِدُ",       transliteration: "Al-Wajid",       meaning: "The Finder",                   detail: "The One who finds whatever He wills; nothing is ever lost from Him." },
  { number: 66, arabic: "الْمَاجِدُ",       transliteration: "Al-Majid",       meaning: "The Noble",                    detail: "The One of infinite nobility and honor; His generosity is unlimited." },
  { number: 67, arabic: "الْوَاحِدُ",       transliteration: "Al-Wahid",       meaning: "The One",                      detail: "The One with no partners, no associates, and no rivals; He is uniquely singular." },
  { number: 68, arabic: "الْأَحَدُ",        transliteration: "Al-Ahad",        meaning: "The Unique",                   detail: "The absolutely unique One who has no equal, no parallel, and no like in any way." },
  { number: 69, arabic: "الصَّمَدُ",        transliteration: "As-Samad",       meaning: "The Eternal",                  detail: "The One upon whom all creation depends while He depends on no one and nothing." },
  { number: 70, arabic: "الْقَادِرُ",       transliteration: "Al-Qadir",       meaning: "The All-Powerful",             detail: "The One who has the complete power to do whatever He wills without limitation." },
  { number: 71, arabic: "الْمُقْتَدِرُ",    transliteration: "Al-Muqtadir",    meaning: "The Prevailing",               detail: "The One who has absolute and perfect power over all things; His power cannot be resisted." },
  { number: 72, arabic: "الْمُقَدِّمُ",     transliteration: "Al-Muqaddim",    meaning: "The Expediter",                detail: "The One who brings forward and elevates whom He wills in rank and status." },
  { number: 73, arabic: "الْمُؤَخِّرُ",     transliteration: "Al-Mu'akhkhir",  meaning: "The Delayer",                  detail: "The One who delays and sets back whom He wills; He places everything in its proper time." },
  { number: 74, arabic: "الْأَوَّلُ",       transliteration: "Al-Awwal",       meaning: "The First",                    detail: "The One who exists before all of creation; there is nothing before Him." },
  { number: 75, arabic: "الْآخِرُ",         transliteration: "Al-Akhir",       meaning: "The Last",                     detail: "The One who will remain after all of creation ceases to exist; He has no end." },
  { number: 76, arabic: "الظَّاهِرُ",       transliteration: "Az-Zahir",       meaning: "The Manifest",                 detail: "The One who is above all of creation and whose existence is evident through clear signs." },
  { number: 77, arabic: "الْبَاطِنُ",       transliteration: "Al-Batin",       meaning: "The Hidden",                   detail: "The One whose essence is hidden and not visible; His reality is beyond comprehension." },
  { number: 78, arabic: "الْوَالِي",        transliteration: "Al-Wali",        meaning: "The Governor",                 detail: "The One who governs and manages all of creation's affairs with perfect wisdom." },
  { number: 79, arabic: "الْمُتَعَالِي",    transliteration: "Al-Muta'ali",    meaning: "The Most Exalted",             detail: "The One who is exalted above all of creation in every possible way." },
  { number: 80, arabic: "الْبَرُّ",         transliteration: "Al-Barr",        meaning: "The Source of Goodness",       detail: "The One from whom all goodness, kindness, and blessing originates." },
  { number: 81, arabic: "التَّوَّابُ",      transliteration: "At-Tawwab",      meaning: "The Accepter of Repentance",   detail: "The One who continuously accepts the repentance of His servants; He loves those who repent." },
  { number: 82, arabic: "الْمُنْتَقِمُ",    transliteration: "Al-Muntaqim",    meaning: "The Avenger",                  detail: "The One who exacts just retribution on those who persist in wrongdoing and disbelief." },
  { number: 83, arabic: "الْعَفُوُّ",       transliteration: "Al-'Afuww",      meaning: "The Pardoner",                 detail: "The One who pardons sins and erases them completely, as if they never occurred." },
  { number: 84, arabic: "الرَّؤُوفُ",       transliteration: "Ar-Ra'uf",       meaning: "The Compassionate",            detail: "The One of extreme gentleness and compassion; His kindness toward believers is immense." },
  { number: 85, arabic: "مَالِكُ الْمُلْكِ", transliteration: "Malik al-Mulk", meaning: "Owner of All Sovereignty",     detail: "The One who possesses all sovereignty and gives and takes it from whom He wills." },
  { number: 86, arabic: "ذُو الْجَلَالِ وَالْإِكْرَامِ", transliteration: "Dhul-Jalali wal-Ikram", meaning: "Lord of Majesty and Bounty", detail: "The One who possesses both absolute majesty and infinite generosity and honor." },
  { number: 87, arabic: "الْمُقْسِطُ",      transliteration: "Al-Muqsit",      meaning: "The Equitable",                detail: "The One who deals with absolute equity and fairness in all matters." },
  { number: 88, arabic: "الْجَامِعُ",       transliteration: "Al-Jami",        meaning: "The Gatherer",                 detail: "The One who will gather all of creation together on the Day of Resurrection." },
  { number: 89, arabic: "الْغَنِيُّ",       transliteration: "Al-Ghani",       meaning: "The Self-Sufficient",          detail: "The One who is free from all need; He has no need of any of His creation." },
  { number: 90, arabic: "الْمُغْنِي",       transliteration: "Al-Mughni",      meaning: "The Enricher",                 detail: "The One who grants wealth and enriches whom He wills from His infinite bounty." },
  { number: 91, arabic: "الْمَانِعُ",       transliteration: "Al-Mani",        meaning: "The Preventer",                detail: "The One who prevents and withholds when granting would bring harm." },
  { number: 92, arabic: "الضَّارُّ",        transliteration: "Ad-Darr",        meaning: "The Afflicter",                detail: "The One who has the power to send affliction to those He wills — only for wisdom." },
  { number: 93, arabic: "النَّافِعُ",       transliteration: "An-Nafi",        meaning: "The Benefiter",                detail: "The One who causes benefit to reach those He wills — all benefit comes from Him." },
  { number: 94, arabic: "النُّورُ",         transliteration: "An-Nur",         meaning: "The Light",                    detail: "The One who is the light of the heavens and the earth; He guides whom He wills to His light." },
  { number: 95, arabic: "الْهَادِي",        transliteration: "Al-Hadi",        meaning: "The Guide",                    detail: "The One who guides His servants to truth, faith, and the straight path." },
  { number: 96, arabic: "الْبَدِيعُ",       transliteration: "Al-Badi",        meaning: "The Originator",               detail: "The One who creates in a unique, unprecedented way without any model or example." },
  { number: 97, arabic: "الْبَاقِي",        transliteration: "Al-Baqi",        meaning: "The Everlasting",              detail: "The One who will remain forever after all of creation perishes; His existence has no end." },
  { number: 98, arabic: "الْوَارِثُ",       transliteration: "Al-Warith",      meaning: "The Inheritor",                detail: "The One who inherits the earth after all have perished; all things return to Him." },
  { number: 99, arabic: "الصَّبُورُ",       transliteration: "As-Sabur",       meaning: "The Patient",                  detail: "The One who is patient with sinners and does not hasten their punishment; He gives them time to repent." },
];

export function NamesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = names.filter(n =>
    n.transliteration.toLowerCase().includes(search.toLowerCase()) ||
    n.meaning.toLowerCase().includes(search.toLowerCase()) ||
    n.arabic.includes(search) ||
    String(n.number).includes(search)
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Hero */}
      <div className="mx-4 mt-3 rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <p style={{ fontFamily: "Scheherazade New, serif", color: "#c8a84b", fontSize: "26px", lineHeight: 1.8 }}>أَسْمَاءُ اللَّهِ الْحُسْنَى</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.7)", fontSize: "12px" }}>The 99 Beautiful Names of Allah</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.5)", fontSize: "11px", marginTop: "4px" }}>"And to Allah belong the best names, so invoke Him by them." — Al-A'raf 7:180</p>
      </div>

      {/* Search */}
      <div className="mx-4 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <Search size={15} style={{ color: "var(--k-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search names…" className="bg-transparent flex-1 outline-none" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }} />
        {search && <button onClick={() => setSearch("")} style={{ color: "var(--k-text-muted)", fontSize: "16px" }}>×</button>}
      </div>

      {/* Grid */}
      <div className="mx-4 grid grid-cols-2 gap-2">
        {filtered.map(name => (
          <button key={name.number} onClick={() => setSelected(selected === name.number ? null : name.number)} className="rounded-xl p-3 text-left" style={{ background: selected === name.number ? "var(--k-gold-sub)" : "var(--k-surface)", border: selected === name.number ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--k-gold-sub)", fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "9px", fontWeight: 700 }}>{name.number}</span>
            </div>
            <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "20px", textAlign: "right", lineHeight: 1.7 }}>{name.arabic}</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "12px", fontWeight: 600 }}>{name.transliteration}</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{name.meaning}</p>
            {selected === name.number && (
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", lineHeight: 1.5, marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--k-border)" }}>{name.detail}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
