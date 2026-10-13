import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface Donation {
  date: string;
  type: string;
  amount: number;
  note: string;
}

const typeColors: Record<string, string> = { Zakat: "#b89230", Sadaqah: "#1e6b5e", Lillah: "#5b3fa6", Kaffarah: "#b84230" };

const RESOURCES = [
  { name: "LaunchGood", desc: "Crowdfunding for Muslim communities worldwide", url: "https://launchgood.com", tag: "Global" },
  { name: "Islamic Relief USA", desc: "Emergency aid, education, and food programs", url: "https://irusa.org", tag: "Zakat eligible" },
  { name: "ICNA Relief", desc: "Domestic aid, food banks, and refugee support", url: "https://icnarelief.org", tag: "USA" },
  { name: "Human Appeal", desc: "Global humanitarian and development programs", url: "https://humanappeal.org", tag: "Global" },
  { name: "Penny Appeal USA", desc: "Water wells, orphan care, emergency relief", url: "https://pennyappealusa.org", tag: "Wells & orphans" },
  { name: "Zakat Foundation", desc: "Zakat calculation and certified distribution", url: "https://zakat.org", tag: "Zakat eligible" },
];

const BENEFITS = [
  { title: "Extinguishes Sins", desc: "\"Charity extinguishes sin just as water extinguishes fire.\" — Prophet ﷺ (Tirmidhi 2616)", icon: "🔥" },
  { title: "Never Decreases Wealth", desc: "\"Charity does not decrease wealth.\" — Prophet ﷺ (Muslim 2588). It increases barakah.", icon: "📈" },
  { title: "Sadaqah Jariyah", desc: "Ongoing charity — a water well, knowledge shared, or a righteous child — earns reward even after death.", icon: "♾️" },
  { title: "Shade on Judgment Day", desc: "A person will be shaded under their charity on the Day of Judgment when the sun is only a mile away.", icon: "☀️" },
  { title: "Multiplied Reward", desc: "\"Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?\" — Quran 2:245", icon: "✨" },
  { title: "Protects from Calamity", desc: "Give charity early in the morning — it closes the gates of calamity for that day. (Ibn Hibban)", icon: "🛡️" },
];

function loadDonations(): Donation[] {
  try {
    const saved = localStorage.getItem("khushu-sadaqah");
    return saved ? JSON.parse(saved) : [
      { date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), type: "Sadaqah", amount: 20, note: "Local food bank" },
      { date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), type: "Lillah", amount: 50, note: "Masjid renovation" },
    ];
  } catch {
    return [];
  }
}

const MONTHLY_GOAL = 500;

export function SadaqahPage() {
  const [donations, setDonations] = useState<Donation[]>(loadDonations);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Sadaqah", amount: "", note: "" });
  const [activeTab, setActiveTab] = useState<"tracker" | "resources" | "benefits">("tracker");

  useEffect(() => {
    localStorage.setItem("khushu-sadaqah", JSON.stringify(donations));
  }, [donations]);

  const totalGiven = donations.reduce((s, d) => s + d.amount, 0);

  const byType = Object.entries(typeColors).map(([label, color]) => ({
    label, color,
    amount: donations.filter(d => d.type === label).reduce((s, d) => s + d.amount, 0),
  })).filter(c => c.amount > 0);

  const save = () => {
    const amt = parseFloat(form.amount);
    if (!amt || isNaN(amt)) return;
    const entry: Donation = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: form.type,
      amount: amt,
      note: form.note || form.type,
    };
    setDonations(prev => [entry, ...prev]);
    setForm({ type: "Sadaqah", amount: "", note: "" });
    setShowForm(false);
  };

  const remove = (i: number) => setDonations(prev => prev.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {(["tracker", "resources", "benefits"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 text-center"
            style={{ background: activeTab === tab ? "var(--k-gold-sub)" : "transparent" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: activeTab === tab ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "12px", fontWeight: activeTab === tab ? 700 : 400, textTransform: "capitalize" }}>{tab}</p>
          </button>
        ))}
      </div>

      {activeTab === "tracker" && (
        <>
          {/* Goal card */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Monthly Giving Goal</p>
            <div className="flex items-end gap-2 mb-3">
              <p style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "32px", fontWeight: 700, lineHeight: 1 }}>${totalGiven}</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.5)", fontSize: "16px", marginBottom: "2px" }}>/ ${MONTHLY_GOAL}</p>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((totalGiven / MONTHLY_GOAL) * 100, 100)}%`, background: "#c8a84b" }} />
            </div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.6)", fontSize: "12px", marginTop: "6px" }}>
              {Math.round((totalGiven / MONTHLY_GOAL) * 100)}% of goal · ${Math.max(MONTHLY_GOAL - totalGiven, 0)} remaining
            </p>
          </div>

          {/* By type */}
          {byType.length > 0 && (
            <div>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">By Type</p>
              <div className="grid grid-cols-3 gap-2">
                {byType.map(cat => (
                  <div key={cat.label} className="rounded-xl p-3 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                    <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ background: cat.color }} />
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "16px", fontWeight: 700 }}>${cat.amount}</p>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Record button */}
          <button onClick={() => setShowForm(s => !s)} className="flex items-center justify-center gap-2 rounded-xl py-3" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
            <Plus size={16} style={{ color: "var(--k-gold)" }} />
            <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "14px", fontWeight: 600 }}>Record Donation</span>
          </button>

          {showForm && (
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-gold-border)" }}>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(typeColors).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className="flex-1 rounded-lg py-2"
                    style={{ background: form.type === t ? "var(--k-gold-sub)" : "var(--k-bg)", border: form.type === t ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: form.type === t ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "12px", fontWeight: 600 }}>{t}</p>
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Amount ($)"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="rounded-xl px-3 py-2.5 outline-none"
                style={{ background: "var(--k-bg)", border: "1px solid var(--k-border)", fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}
              />
              <input
                placeholder="Note (optional)"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="rounded-xl px-3 py-2.5 outline-none"
                style={{ background: "var(--k-bg)", border: "1px solid var(--k-border)", fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}
              />
              <div className="flex gap-2">
                <button onClick={save} className="flex-1 rounded-xl py-2.5" style={{ background: "var(--k-green)" }}>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "#ffffff", fontSize: "14px", fontWeight: 700 }}>Save</p>
                </button>
                <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5" style={{ background: "var(--k-surface-2)" }}>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "14px" }}>Cancel</p>
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Donation History</p>
            {donations.length === 0 ? (
              <div className="rounded-xl px-4 py-6 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>No donations recorded yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {donations.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                    <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: typeColors[d.type] ?? "var(--k-border)" }} />
                    <div className="flex-1">
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{d.type} — {d.note}</p>
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{d.date}</p>
                    </div>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "15px", fontWeight: 700 }}>${d.amount}</p>
                    <button onClick={() => remove(i)} className="ml-1 p-1 rounded-lg" style={{ background: "var(--k-surface-2)" }}>
                      <X size={12} style={{ color: "var(--k-text-muted)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "resources" && (
        <>
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
            <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "18px", textAlign: "center", lineHeight: 1.5 }}>
              مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ
            </p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.75)", fontSize: "12px", textAlign: "center", marginTop: "8px", lineHeight: 1.5 }}>
              "The example of those who spend in the way of Allah is like a grain that grows seven spikes, in each spike a hundred grains." — Quran 2:261
            </p>
          </div>

          <div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Trusted Organizations</p>
            <div className="flex flex-col gap-2">
              {RESOURCES.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{r.name}</p>
                      <span className="rounded-full px-2 py-0.5" style={{ background: "var(--k-gold-sub)", color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontSize: "10px", fontWeight: 700 }}>{r.tag}</span>
                    </div>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{r.desc}</p>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-green)", fontSize: "11px", marginTop: "2px" }}>{r.url}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.6 }}>
              Always verify an organization's 501(c)(3) status and check ratings on Charity Navigator or GuideStar before donating. For Zakat, ensure the org has certified Islamic scholars verifying eligible recipients.
            </p>
          </div>
        </>
      )}

      {activeTab === "benefits" && (
        <>
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-1">The Prophet ﷺ said</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "#f0ede6", fontSize: "14px", lineHeight: 1.6, fontStyle: "italic" }}>
              "Give charity without delay, for it stands in the way of calamity."
            </p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(200,168,75,0.8)", fontSize: "11px", marginTop: "6px" }}>— At-Tirmidhi</p>
          </div>

          <div className="flex flex-col gap-2">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                <span style={{ fontSize: "22px", lineHeight: 1.4, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{b.title}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.5, marginTop: "2px" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl px-4 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>Types of Charity in Islam</p>
            {[
              { name: "Zakat", desc: "Obligatory 2.5% of eligible wealth above nisab; one of the Five Pillars" },
              { name: "Sadaqah", desc: "Voluntary charity — includes a smile, removing harm from the path, or kind words" },
              { name: "Lillah", desc: "Given purely for Allah's sake — to mosques, Islamic institutions, or the poor" },
              { name: "Kaffarah", desc: "Expiation for broken oaths, accidental killings, or Ramadan violations" },
              { name: "Sadaqah Jariyah", desc: "Ongoing charity — wells, Quran copies, knowledge, or raising a righteous child" },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--k-gold)" }} />
                <div>
                  <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "12px", fontWeight: 700 }}>{t.name} </span>
                  <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>— {t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
