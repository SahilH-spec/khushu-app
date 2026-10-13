import { useState, useEffect, useRef } from "react";
import { Check, Plus, Trash2, Star, Moon, Sun, Sunset, CloudMoon, Lightbulb, Loader } from "lucide-react";
import { GeometricPattern } from "./GeometricPattern";

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

interface PrayerEntry {
  name: PrayerName;
  time: string;
  icon: React.ElementType;
  passed: boolean;
  active: boolean;
}

const PRAYER_ICONS: Record<PrayerName, React.ElementType> = {
  Fajr: CloudMoon, Dhuhr: Sun, Asr: Lightbulb, Maghrib: Sunset, Isha: Moon,
};

function fmt12(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = (mStr ?? "00").replace(/[^\d]/g, "").padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${suffix}`;
}

// Day-of-year so content rotates each day
function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

const DOY = dayOfYear();

// ── Islamic Knowledge pool ─────────────────────────────────────────────
const knowledgePool = [
  { tag: "Aqeedah",  title: "The Five Pillars",           emoji: "🕌", color: "#1e6b5e", body: "Shahada, Salah, Zakat, Sawm, and Hajj — the five obligations every Muslim fulfils to build a God-conscious life." },
  { tag: "Iman",     title: "Six Articles of Faith",      emoji: "📖", color: "#5b3fa6", body: "Belief in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree forms the foundation of Islamic belief." },
  { tag: "Akhlaq",  title: "Tawakkul — Trust in Allah",  emoji: "💚", color: "#b89230", body: "True reliance means taking all necessary means then entrusting the outcome to Allah. 'He is sufficient for whoever relies on Him.' (65:3)" },
  { tag: "Seerah",  title: "The Hijra of the Prophet ﷺ", emoji: "🌙", color: "#b84230", body: "In 622 CE the Prophet ﷺ migrated from Makkah to Madinah — so significant it marks Year 1 of the Islamic calendar." },
  { tag: "Fiqh",    title: "Purification (Taharah)",      emoji: "💧", color: "#1aa399", body: "Taharah is the foundation of Islamic worship. Without wudu, salah is not accepted. Purity of body, mind, and soul is central to Islam." },
  { tag: "Quran",   title: "The First Revelation",        emoji: "📜", color: "#1e6b5e", body: "The first words revealed to the Prophet ﷺ were 'Iqra!' (Read!) — emphasizing the importance of knowledge in Islam." },
  { tag: "Akhlaq",  title: "Honesty (Sidq)",              emoji: "✨", color: "#5b3fa6", body: "The Prophet ﷺ said: 'Truthfulness leads to righteousness and righteousness leads to Paradise.' (Bukhari)" },
  { tag: "Aqeedah", title: "Tawhid — Oneness of Allah",  emoji: "☪️", color: "#b89230", body: "The most fundamental concept in Islam. Allah has no partners, no equals, and no rivals. Everything in creation belongs solely to Him." },
  { tag: "Seerah",  title: "Battle of Badr",              emoji: "⚔️", color: "#b84230", body: "In 624 CE, the first major battle of Islam. Despite being outnumbered 3-to-1, the Muslims were granted victory by Allah's decree." },
  { tag: "Fiqh",    title: "The Importance of Jumu'ah",  emoji: "🕌", color: "#1aa399", body: "Friday prayer is obligatory for Muslim men. The Prophet ﷺ called it 'the best day on which the sun rises.' It carries special rewards." },
  { tag: "Iman",    title: "Love of the Prophet ﷺ",       emoji: "💚", color: "#1e6b5e", body: "'None of you believes until I am more beloved to him than his child, his father, and all of mankind.' (Bukhari)" },
  { tag: "Quran",   title: "Surah Al-Kahf Every Friday", emoji: "📖", color: "#5b3fa6", body: "The Prophet ﷺ encouraged reading Surah Al-Kahf on Fridays. It provides light between two Fridays and protection from Dajjal." },
  { tag: "Akhlaq",  title: "Controlling Anger",           emoji: "🤲", color: "#b89230", body: "The Prophet ﷺ said: 'The strong man is not one who overcomes others; the truly strong man is one who controls himself when angry.' (Bukhari)" },
  { tag: "Aqeedah", title: "Al-Qadar — Divine Decree",   emoji: "⭐", color: "#b84230", body: "Believing in Qadar means accepting that Allah has knowledge of all things, has written everything, and that nothing happens except by His will." },
];

// Rotate by day of year, showing 4 knowledge items
const knowledgeItems = Array.from({ length: 4 }, (_, i) => knowledgePool[(DOY + i) % knowledgePool.length]);

// ── Default daily intentions ────────────────────────────────────────
const DEFAULT_TODOS = [
  { id: 1, text: "Pray 5 daily prayers on time",   done: false },
  { id: 2, text: "Read at least 1 page of Quran",  done: false },
  { id: 3, text: "Make morning & evening adhkar",   done: false },
  { id: 4, text: "Give sadaqah — even a smile",     done: false },
];

function loadTodos() {
  const today = new Date().toDateString();
  try {
    const raw = localStorage.getItem("khushu-todos");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.date === today) return saved.items;
    }
  } catch (_) { /* ignore */ }
  return DEFAULT_TODOS;
}

function saveTodos(items: typeof DEFAULT_TODOS) {
  try {
    localStorage.setItem("khushu-todos", JSON.stringify({ date: new Date().toDateString(), items }));
  } catch (_) { /* ignore */ }
}

// UmmahAPI widget wrapper — ensures widget.js re-initialises after React mounts the element
function UmmahWidget(props: Record<string, any>) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initWidget = () => {
      const api = (window as any).UmmahApiWidget;
      if (api && widgetRef.current) {
        api.init(widgetRef.current);
      }
    };

    const api = (window as any).UmmahApiWidget;
    if (api) {
      initWidget();
    } else {
      const existing = document.querySelector('script[src="https://www.ummahapi.com/widget.js"]');
      if (existing) {
        existing.addEventListener("load", initWidget);
        return () => existing.removeEventListener("load", initWidget);
      } else {
        const script = document.createElement("script");
        script.src = "https://www.ummahapi.com/widget.js";
        script.async = true;
        script.onload = initWidget;
        document.body.appendChild(script);
      }
    }
  }, []);

  return <div ref={widgetRef} {...props} />;
}

interface Props { refreshKey?: number; }

export function HomePage({ refreshKey = 0 }: Props) {
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [todos, setTodos] = useState(loadTodos);
  const [newTodo, setNewTodo] = useState("");
  const [addingTodo, setAddingTodo] = useState(false);

  // Persist todos whenever they change
  const updateTodos = (items: typeof todos) => {
    setTodos(items);
    saveTodos(items);
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/prayer-times")
      .then(r => r.json())
      .then(data => {
        if (!data.ok) return;
        const ORDER: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const now = new Date();
        const parsed: PrayerEntry[] = ORDER.map(name => {
          const raw: string = data.times[name] ?? "00:00";
          const [hStr, mStr] = raw.split(":");
          const h = parseInt(hStr, 10);
          const m = parseInt((mStr ?? "0").replace(/[^\d]/g, ""), 10);
          const dt = new Date(); dt.setHours(h, m, 0, 0);
          return { name, time: fmt12(raw), icon: PRAYER_ICONS[name], passed: dt < now, active: false };
        });
        const nextIdx = parsed.findIndex(p => !p.passed);
        if (nextIdx >= 0) parsed[nextIdx].active = true;
        setPrayers(parsed);
        setNextPrayer({ name: data.next.name, time: fmt12(data.next.time) });
        // Optional label configured on the server (LOCATION_LABEL)
        if (data.times.label) setLocation(data.times.label);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!prayers.length || !nextPrayer) return;
    const tick = () => {
      const prayer = prayers.find(p => p.name === nextPrayer.name);
      if (!prayer) return;
      const match = prayer.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
      const target = new Date(); target.setHours(h, m, 0, 0);
      let diff = Math.floor((target.getTime() - Date.now()) / 1000);
      if (diff < 0) diff += 86400;
      const hh = Math.floor(diff / 3600);
      const mm = Math.floor((diff % 3600) / 60);
      const ss = diff % 60;
      setCountdown(`${hh}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [prayers, nextPrayer]);

  const toggleTodo  = (id: number) => updateTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo  = (id: number) => updateTodos(todos.filter(t => t.id !== id));
  const addTodo     = () => {
    if (newTodo.trim()) {
      updateTodos([...todos, { id: Date.now(), text: newTodo.trim(), done: false }]);
      setNewTodo(""); setAddingTodo(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Next prayer hero */}
      <div className="relative overflow-hidden mx-4 mt-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #1e6b5e 0%, #0f3d35 65%, #0a2a23 100%)" }}>
        <GeometricPattern className="absolute inset-0 w-full h-full pointer-events-none" style={{ color: "#ffffff" }} />
        <div className="relative z-10 p-5 flex flex-col items-center text-center">
          <p style={{ color: "#c8a84b", fontFamily: "Nunito, sans-serif", fontSize: "10px", letterSpacing: "0.1em" }} className="uppercase mb-1">Next Prayer</p>
          {loading ? (
            <Loader size={24} style={{ color: "#c8a84b", margin: "8px auto" }} className="animate-spin" />
          ) : (
            <>
              <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "36px", lineHeight: 1 }}>{nextPrayer?.name ?? "—"}</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "#c8a84b", fontSize: "26px", fontWeight: 700 }}>{nextPrayer?.time ?? "—"}</p>
              {countdown && (
                <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.75)", fontSize: "13px", marginTop: "4px" }}>{countdown}</p>
              )}
            </>
          )}
          <div className="mt-2 flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#c8a84b" }} />
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "11px" }}>{location}</p>
          </div>
        </div>
      </div>

      {/* Prayer times grid */}
      <div className="mx-4 grid grid-cols-5 gap-1.5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-xl py-2.5" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)", opacity: 0.4 }}>
                <div className="w-3 h-3 rounded-full" style={{ background: "var(--k-border)" }} />
              </div>
            ))
          : prayers.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="flex flex-col items-center gap-1 rounded-xl py-2.5" style={{ background: p.active ? "var(--k-gold-sub)" : "var(--k-surface)", border: p.active ? "1px solid var(--k-gold-border)" : "1px solid var(--k-border)" }}>
                  <Icon size={13} style={{ color: p.active ? "var(--k-gold)" : p.passed ? "var(--k-text-disabled)" : "var(--k-text-muted)" }} />
                  <p style={{ fontFamily: "Nunito, sans-serif", fontSize: "9px", fontWeight: 700, color: p.active ? "var(--k-gold)" : p.passed ? "var(--k-text-disabled)" : "var(--k-text-muted)" }}>{p.name}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", fontSize: "8px", color: p.active ? "var(--k-text)" : "var(--k-text-disabled)" }}>{p.time}</p>
                </div>
              );
            })}
      </div>

      {/* Ramadan Counter */}
      <div className="mx-4">
        <UmmahWidget data-ummahapi="ramadan" data-lat="40.71" data-lng="-74" data-theme="light" />
      </div>

      {/* Islamic Knowledge — scrollable cards */}
      <div className="mx-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb size={13} style={{ color: "var(--k-gold)" }} />
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }} className="uppercase">Islamic Knowledge</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {knowledgeItems.map((item, i) => (
            <div key={i} className="flex-shrink-0 rounded-2xl p-4" style={{ width: "210px", background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full px-2 py-0.5" style={{ background: `${item.color}18`, color: item.color, fontFamily: "Nunito, sans-serif", fontSize: "9px", fontWeight: 700 }}>{item.tag}</span>
                <span style={{ fontSize: "17px" }}>{item.emoji}</span>
              </div>
              <p style={{ fontFamily: "Amiri, serif", color: "var(--k-text)", fontSize: "16px", marginBottom: "6px", lineHeight: 1.3 }}>{item.title}</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.5 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hadith of the Day (UmmahAPI widget) */}
      <div className="mx-4">
        <UmmahWidget data-ummahapi="hadith-of-day" data-theme="light" />
      </div>

      {/* Verse of the Day (UmmahAPI widget) */}
      <div className="mx-4">
        <UmmahWidget data-ummahapi="verse-of-day" data-theme="light" />
      </div>

      {/* Dua of the Day (UmmahAPI widget) */}
      <div className="mx-4">
        <UmmahWidget data-ummahapi="dua-of-day" data-theme="light" />
      </div>

      {/* Qibla Compass (UmmahAPI widget) */}
      <div className="mx-4">
        <UmmahWidget data-ummahapi="qibla" data-lat="40.71" data-lng="-74" data-theme="light" />
      </div>

      {/* Daily Intentions */}
      <div className="mx-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={13} style={{ color: "var(--k-gold)" }} />
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }} className="uppercase">Daily Intentions</p>
          </div>
          <button onClick={() => setAddingTodo(true)} className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
            <Plus size={11} style={{ color: "var(--k-gold)" }} />
            <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "11px" }}>Add</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 group" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: todo.done ? "var(--k-green)" : "transparent", border: todo.done ? "2px solid var(--k-green)" : "2px solid var(--k-border-strong)" }}>
                {todo.done && <Check size={10} color="#ffffff" />}
              </button>
              <p style={{ fontFamily: "Nunito, sans-serif", color: todo.done ? "var(--k-text-disabled)" : "var(--k-text)", fontSize: "14px", textDecoration: todo.done ? "line-through" : "none", flex: 1 }}>{todo.text}</p>
              <button onClick={() => removeTodo(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} style={{ color: "var(--k-text-disabled)" }} />
              </button>
            </div>
          ))}
          {addingTodo && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--k-surface)", border: "1px solid var(--k-gold-border)" }}>
              <input autoFocus value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} placeholder="New intention..." className="flex-1 bg-transparent outline-none" style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }} />
              <button onClick={addTodo} style={{ color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontSize: "12px", fontWeight: 700 }}>Save</button>
              <button onClick={() => setAddingTodo(false)} style={{ color: "var(--k-text-disabled)", fontFamily: "Nunito, sans-serif", fontSize: "12px" }}>✕</button>
            </div>
          )}
        </div>
        {todos.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full" style={{ background: "var(--k-border)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(todos.filter(t => t.done).length / todos.length) * 100}%`, background: "var(--k-green)" }} />
            </div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{todos.filter(t => t.done).length}/{todos.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
