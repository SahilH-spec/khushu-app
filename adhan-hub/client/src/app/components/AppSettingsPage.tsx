import { useState } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";

const madhabs    = ["Hanafi (Later Asr)", "Shafi'i / Hanbali / Maliki (Standard Asr)"];
const languages  = ["English", "Arabic", "Urdu", "French", "Turkish", "Malay", "Indonesian"];

export function AppSettingsPage() {
  const [madhab,        setMadhab]        = useState(0); // 0 = Hanafi
  const [language,      setLanguage]      = useState(0);
  const [hijriOffset,   setHijriOffset]   = useState(0);
  const [show24hr,      setShow24hr]      = useState(false);
  const [showGregorian, setShowGregorian] = useState(true);
  const [openPicker,    setOpenPicker]    = useState<string | null>(null);

  const Picker = ({ id, label, options, value, onChange }: {
    id: string; label: string; options: string[]; value: number; onChange: (i: number) => void
  }) => (
    <div style={{ borderBottom: "1px solid var(--k-border)" }}>
      <button onClick={() => setOpenPicker(openPicker === id ? null : id)} className="w-full flex items-center justify-between px-4 py-3.5">
        <div>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{label}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{options[value]}</p>
        </div>
        <ChevronDown size={15} style={{ color: "var(--k-text-muted)", transform: openPicker === id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {openPicker === id && (
        <div className="px-4 pb-3 flex flex-col gap-1">
          {options.map((opt, i) => (
            <button key={i} onClick={() => { onChange(i); setOpenPicker(null); }} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: value === i ? "var(--k-gold-sub)" : "transparent" }}>
              <p style={{ fontFamily: "Nunito, sans-serif", color: value === i ? "var(--k-gold)" : "var(--k-text)", fontSize: "13px" }}>{opt}</p>
              {value === i && <Check size={13} style={{ color: "var(--k-gold)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) => (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--k-border)" }}>
      <div className="flex-1">
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{label}</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{desc}</p>
      </div>
      <button onClick={onChange} className="w-11 h-6 rounded-full relative flex-shrink-0" style={{ background: value ? "var(--k-green)" : "var(--k-surface-2)" }}>
        <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all" style={{ left: value ? "calc(100% - 22px)" : "2px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      {/* Prayer calculation — locked to ISNA Hanafi */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Prayer Calculation</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          {/* Calculation method locked */}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--k-border)" }}>
            <div>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>Calculation Method</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>ISNA (Islamic Society of North America)</p>
            </div>
            <span className="rounded-full px-2 py-0.5" style={{ background: "var(--k-gold-sub)", color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontSize: "10px", fontWeight: 700 }}>Locked</span>
          </div>

          {/* Asr madhab */}
          <Picker id="madhab" label="Asr Calculation" options={madhabs} value={madhab} onChange={setMadhab} />

          {/* Hijri adjustment */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>Hijri Date Adjustment</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} days</p>
            </div>
            <div className="flex items-center gap-2">
              {[-1, 0, 1].map(v => (
                <button key={v} onClick={() => setHijriOffset(v)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: hijriOffset === v ? "var(--k-gold-sub)" : "var(--k-surface-2)", border: hijriOffset === v ? "1px solid var(--k-gold-border)" : "1px solid transparent" }}>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: hijriOffset === v ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "12px" }}>{v > 0 ? `+${v}` : v}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Display */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Display</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <Picker id="lang" label="Language" options={languages} value={language} onChange={setLanguage} />
          <Toggle label="24-Hour Clock" desc="Display prayer times in 24h format" value={show24hr} onChange={() => setShow24hr(v => !v)} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex-1">
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>Show Gregorian Date</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>Show alongside Hijri date</p>
            </div>
            <button onClick={() => setShowGregorian(v => !v)} className="w-11 h-6 rounded-full relative flex-shrink-0" style={{ background: showGregorian ? "var(--k-green)" : "var(--k-surface-2)" }}>
              <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all" style={{ left: showGregorian ? "calc(100% - 22px)" : "2px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Data</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <button className="w-full flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--k-border)" }}
            onClick={() => { localStorage.removeItem("khushu-bookmarks"); alert("Bookmarks cleared."); }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}>Clear Bookmarks</p>
            <ChevronRight size={15} style={{ color: "var(--k-text-disabled)" }} />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--k-border)" }}
            onClick={() => { localStorage.removeItem("khushu-dua-favorites"); localStorage.removeItem("khushu-todos"); alert("Cache cleared."); }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}>Clear Cache</p>
            <ChevronRight size={15} style={{ color: "var(--k-text-disabled)" }} />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5"
            onClick={() => { if (confirm("Reset all settings?")) { localStorage.clear(); location.reload(); } }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "#c0392b", fontSize: "14px" }}>Reset All Settings</p>
            <ChevronRight size={15} style={{ color: "var(--k-text-disabled)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
