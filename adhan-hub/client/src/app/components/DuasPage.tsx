import { STATIC_DEMO } from "../../staticDemo";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Heart, Loader } from "lucide-react";

interface Dua {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  repeat?: number;
  category: string;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  morning:      "🌅",
  evening:      "🌙",
  wudu:         "💧",
  prayer:       "🕌",
  after_prayer: "🤲",
  sleep:        "😴",
  food:         "🍽️",
  travel:       "✈️",
  home:         "🏠",
  masjid:       "🕌",
  distress:     "☁️",
  forgiveness:  "💚",
  illness:      "❤️‍🩹",
  weather:      "🌧️",
  knowledge:    "📖",
  parents:      "👨‍👩‍👧",
  guidance:     "🧭",
  gratitude:    "🌟",
  protection:   "🛡️",
  dhikr:        "📿",
  marriage:     "💍",
};

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem("khushu-dua-favorites") ?? "[]"); } catch (_) { return []; }
}
function saveFavorites(favs: string[]) {
  try { localStorage.setItem("khushu-dua-favorites", JSON.stringify(favs)); } catch (_) { /* ignore */ }
}

function DuaCard({ dua, isFav, onToggleFav }: { dua: Dua; isFav: boolean; onToggleFav: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface-2)", border: isFav ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
      <div className="flex items-start justify-between px-4 pt-3 pb-1 gap-3">
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600, flex: 1 }}>{dua.title}</p>
        <button onClick={onToggleFav} className="flex-shrink-0 mt-0.5">
          <Heart size={14} fill={isFav ? "var(--k-gold)" : "none"} style={{ color: isFav ? "var(--k-gold)" : "var(--k-text-disabled)" }} />
        </button>
      </div>
      <p className="px-4 pt-1 pb-1 text-right" style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-text)", fontSize: "20px", lineHeight: 2 }}>{dua.arabic}</p>
      {dua.transliteration && (
        <p className="px-4 pb-1" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "12px", fontStyle: "italic", lineHeight: 1.6 }}>{dua.transliteration}</p>
      )}
      {dua.translation && (
        <p className="px-4 pb-2" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.7 }}>{dua.translation}</p>
      )}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: "var(--k-border)" }} />
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "10px" }}>{dua.source}</p>
        {dua.repeat && dua.repeat > 1 && (
          <span className="rounded-full px-2 py-0.5" style={{ background: "var(--k-gold-sub)", color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontSize: "9px" }}>
            ×{dua.repeat}
          </span>
        )}
      </div>
    </div>
  );
}

export function DuasPage() {
  const [activeTab,   setActiveTab]   = useState<"all" | "saved">("all");
  const [expanded,    setExpanded]    = useState<string | null>("morning");
  const [favorites,   setFavorites]   = useState<string[]>(loadFavorites);
  const [categories,  setCategories]  = useState<ApiCategory[]>([]);
  const [duas,        setDuas]        = useState<Dua[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);

  useEffect(() => {
    fetch("/api/ummah/duas")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setCategories(json.data.categories ?? []);
          setDuas(json.data.duas ?? []);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const toggleFav = (key: string) => {
    setFavorites(prev => {
      const next = prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key];
      saveFavorites(next);
      return next;
    });
  };

  const favDuas = duas.filter(d => favorites.includes(String(d.id)));

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Tabs */}
      <div className="mx-4 mt-3 flex gap-2">
        {(["all", "saved"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl py-2.5"
            style={{ background: activeTab === tab ? "var(--k-gold-sub)" : "var(--k-surface)", border: activeTab === tab ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}
          >
            <p style={{ fontFamily: "Nunito, sans-serif", color: activeTab === tab ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "13px", fontWeight: 600 }}>
              {tab === "all" ? `All Duas (${duas.length})` : `Saved (${favDuas.length})`}
            </p>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader size={22} style={{ color: "var(--k-gold)" }} className="animate-spin" />
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>Loading duas…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mx-4 rounded-xl p-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>{STATIC_DEMO ? "Duas come from the Ummah API, which needs a private key kept on the server, so they are turned off in this public demo." : "Could not load duas. Check your internet connection."}</p>
        </div>
      )}

      {/* Saved tab */}
      {!loading && activeTab === "saved" && (
        <div className="mx-4 flex flex-col gap-3">
          {favDuas.length === 0
            ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>🤍</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>Tap the heart on any dua to save it here.</p>
              </div>
            )
            : favDuas.map(d => (
              <DuaCard key={d.id} dua={d} isFav={true} onToggleFav={() => toggleFav(String(d.id))} />
            ))
          }
        </div>
      )}

      {/* All tab — categories accordion */}
      {!loading && !error && activeTab === "all" && (
        <div className="mx-4 flex flex-col gap-2">
          {categories.map(cat => {
            const catDuas = duas.filter(d => d.category === cat.id);
            const isOpen  = expanded === cat.id;
            const icon    = CATEGORY_ICONS[cat.id] ?? "🤲";

            return (
              <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                {/* Category header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <div className="text-left">
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{cat.name}</p>
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{cat.count} duas</p>
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronDown  size={16} style={{ color: "var(--k-gold)" }} />
                    : <ChevronRight size={16} style={{ color: "var(--k-text-disabled)" }} />
                  }
                </button>

                {/* Duas list */}
                {isOpen && (
                  <div className="flex flex-col gap-2 px-3 pb-3">
                    {catDuas.map(dua => (
                      <DuaCard
                        key={dua.id}
                        dua={dua}
                        isFav={favorites.includes(String(dua.id))}
                        onToggleFav={() => toggleFav(String(dua.id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
