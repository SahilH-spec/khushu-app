import { useState } from "react";
import { RotateCcw } from "lucide-react";

const dhikrList = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Glory be to Allah", target: 33 },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise is due to Allah", target: 33 },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", target: 34 },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "There is no god but Allah", target: 100 },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", target: 100 },
];

export function DhikrPage() {
  const [selected, setSelected] = useState(0);
  const [counts, setCounts] = useState<number[]>(dhikrList.map(() => 0));

  const current = dhikrList[selected];
  const count = counts[selected];
  const progress = Math.min(count / current.target, 1);
  const done = count >= current.target;
  const circ = 2 * Math.PI * 78;

  const increment = () => { const c = [...counts]; c[selected]++; setCounts(c); };
  const reset = () => { const c = [...counts]; c[selected] = 0; setCounts(c); };

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-4 mt-3">
      {/* Selector list */}
      <div className="w-full flex flex-col gap-2">
        {dhikrList.map((d, i) => (
          <button key={i} onClick={() => setSelected(i)} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: selected === i ? "var(--k-gold-sub)" : "var(--k-surface)", border: selected === i ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
            <div className="text-left">
              <p style={{ fontFamily: "Nunito, sans-serif", color: selected === i ? "var(--k-gold)" : "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{d.transliteration}</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{d.translation}</p>
            </div>
            <div className="flex items-center gap-2">
              <p style={{ fontFamily: "Scheherazade New, serif", color: selected === i ? "var(--k-gold)" : "var(--k-text-disabled)", fontSize: "16px" }}>{d.arabic}</p>
              <span className="rounded-full px-2 py-0.5" style={{ background: "var(--k-gold-sub)", color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontSize: "10px" }}>{counts[i]}/{d.target}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Counter circle */}
      <div className="relative">
        <svg width="196" height="196" viewBox="0 0 196 196">
          <circle cx="98" cy="98" r="78" fill="none" stroke="var(--k-border)" strokeWidth="8" />
          <circle cx="98" cy="98" r="78" fill="none" stroke={done ? "var(--k-green)" : "var(--k-gold)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} transform="rotate(-90 98 98)" style={{ transition: "stroke-dashoffset 0.3s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-text)", fontSize: "19px", textAlign: "center", lineHeight: 1.6 }}>{current.arabic}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: done ? "var(--k-green)" : "var(--k-gold)", fontSize: "34px", fontWeight: 700, lineHeight: 1 }}>{count}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>of {current.target}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <RotateCcw size={16} style={{ color: "var(--k-gold)" }} />
        </button>
        <button onClick={increment} className="w-24 h-24 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95" style={{ background: done ? "var(--k-green)" : "linear-gradient(135deg, var(--k-gold), #a8883b)", boxShadow: "0 8px 24px rgba(184,146,48,0.3)" }}>
          <span style={{ fontFamily: "Nunito, sans-serif", color: "#0a1628", fontSize: "14px", fontWeight: 700 }}>{done ? "✓ Done" : "Tap"}</span>
        </button>
        <div className="w-10 h-10" />
      </div>
    </div>
  );
}
