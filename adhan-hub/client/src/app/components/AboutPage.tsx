import logo from "../../imports/transparent.png";

export function AboutPage() {
  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-6 mt-4">
      {/* Logo + name */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)", boxShadow: "0 8px 24px rgba(30,107,94,0.3)" }}>
          <img src={logo} alt="Khushu logo" className="w-14 h-14 object-contain" />
        </div>
        <div className="text-center">
          <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "28px", lineHeight: 1.2 }}>Khushu</p>
          <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "18px" }}>خشوع</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px", marginTop: "4px" }}>Version 1.0.0 (Beta)</p>
        </div>
      </div>

      {/* Quran verse */}
      <div className="w-full rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <p style={{ fontFamily: "Scheherazade New, serif", color: "#c8a84b", fontSize: "22px", lineHeight: 2 }}>الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.75)", fontSize: "13px", lineHeight: 1.6, marginTop: "4px" }}>
          "Those who remember Allah while standing, sitting, and lying on their sides…"
        </p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(200,168,75,0.8)", fontSize: "11px", marginTop: "6px" }}>Surah Ali 'Imran 3:191</p>
      </div>

      {/* Description */}
      <div className="w-full rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "18px", marginBottom: "8px" }}>About Khushu</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px", lineHeight: 1.7 }}>
          Khushu (خشوع) means humility and presence of heart — the state every believer strives for in worship. This app is designed to help Muslims cultivate that presence through prayer times, Quran reading, dhikr, and Islamic knowledge — all in one beautiful, focused experience.
        </p>
      </div>

      {/* Info rows */}
      <div className="w-full rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {[
          { label: "Quran Source", value: "King Fahd Complex" },
          { label: "Hadith Source", value: "Sunnah.com" },
          { label: "Prayer Times", value: "Adhan.js Library" },
          { label: "Platform", value: "iOS & Android" },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < 3 ? "1px solid var(--k-border)" : "none" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>{row.label}</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="w-full flex flex-col gap-2">
        {["Privacy Policy", "Terms of Use", "Contact Us", "Rate on App Store"].map((link, i) => (
          <button key={i} className="rounded-xl px-4 py-3 text-left w-full" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-green)", fontSize: "14px" }}>{link}</p>
          </button>
        ))}
      </div>

      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "12px", textAlign: "center" }}>
        Made with ❤️ for the Ummah · © 2026 Khushu App
      </p>
    </div>
  );
}
