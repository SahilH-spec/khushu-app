import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HIJRI_MONTHS = [
  "Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban",
  "Ramadan","Shawwal","Dhul-Qi'dah","Dhul-Hijjah"
];

const HIJRI_MONTHS_AR = [
  "مُحَرَّم","صَفَر","رَبِيعُ الأَوَّل","رَبِيعُ الآخِر",
  "جُمَادَى الأُولَى","جُمَادَى الآخِرَة","رَجَب","شَعْبَان",
  "رَمَضَان","شَوَّال","ذُو الْقَعْدَة","ذُو الْحِجَّة"
];

const DAY_LABELS = ["Sa","Su","Mo","Tu","We","Th","Fr"];

function toHijri(date: Date): { day: number; month: number; year: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const month = Math.floor(24 * l / 709);
  const day = l - Math.floor(709 * month / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

function hijriDaysInMonth(month: number, year: number): number {
  // Hijri months alternate 30/29 with some adjustments
  return month % 2 === 1 || (month === 12 && isHijriLeapYear(year)) ? 30 : 29;
}

function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

// Convert Hijri back to Gregorian (approximate) for weekday calculation
function hijriToGregorian(day: number, month: number, year: number): Date {
  const n = day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + 1948440 - 385;
  return new Date((n - 2440587.5) * 86400000);
}

// Upcoming Islamic events per Hijri month
const EVENTS_BY_MONTH: Record<number, { day: number; name: string; desc: string; color: string }[]> = {
  1:  [{ day: 1, name: "Islamic New Year (1 Muharram)", desc: "First day of the Islamic New Year", color: "#1e6b5e" }, { day: 10, name: "Ashura", desc: "Voluntary fasting — expiation for the past year", color: "#b89230" }],
  2:  [],
  3:  [{ day: 12, name: "Mawlid al-Nabi ﷺ", desc: "Birthday of the Prophet Muhammad ﷺ", color: "#5b3fa6" }],
  4:  [],
  5:  [],
  6:  [],
  7:  [{ day: 27, name: "Isra' wal Mi'raj", desc: "Night Journey & Ascension of the Prophet ﷺ", color: "#1aa399" }],
  8:  [{ day: 15, name: "Shab-e-Barat", desc: "Night of fortune and forgiveness", color: "#b84230" }],
  9:  [{ day: 1, name: "Ramadan Begins", desc: "First night of Ramadan — tarawih prayer", color: "#1e6b5e" }, { day: 27, name: "Laylat al-Qadr", desc: "Night of Power — better than a thousand months", color: "#c8a84b" }],
  10: [{ day: 1, name: "Eid al-Fitr", desc: "Celebration of breaking the fast — Zakat al-Fitr due", color: "#1e6b5e" }, { day: 13, name: "Ayyam al-Bid", desc: "White days — fasting on 13, 14, 15 is recommended", color: "#5b3fa6" }],
  11: [],
  12: [{ day: 8, name: "Day of Tarwiyah", desc: "Pilgrims travel to Mina", color: "#b89230" }, { day: 9, name: "Day of Arafah", desc: "Most important day of Hajj — fasting is expiation for two years", color: "#c8a84b" }, { day: 10, name: "Eid al-Adha", desc: "Feast of Sacrifice — celebrate with family and give qurbani", color: "#1e6b5e" }, { day: 13, name: "Ayyam al-Tashreeq End", desc: "Last day of Hajj pillar — takbir continues", color: "#5b3fa6" }],
};

export function CalendarPage() {
  const today   = new Date();
  const todayHijri = toHijri(today);

  const [viewMonth, setViewMonth] = useState(todayHijri.month);
  const [viewYear,  setViewYear]  = useState(todayHijri.year);

  const daysInMonth = hijriDaysInMonth(viewMonth, viewYear);
  // Get the weekday of the 1st
  const firstDay = hijriToGregorian(1, viewMonth, viewYear);
  // In Hijri week, Saturday = 0
  let startOffset = (firstDay.getDay() + 1) % 7; // JS: 0=Sun → convert to Sa=0

  const isCurrentMonth = viewMonth === todayHijri.month && viewYear === todayHijri.year;
  const monthEvents = EVENTS_BY_MONTH[viewMonth] ?? [];

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      {/* Month header */}
      <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
            <ChevronLeft size={16} style={{ color: "#f0ede6" }} />
          </button>
          <div className="text-center">
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "11px", fontWeight: 700 }} className="uppercase tracking-widest mb-0.5">Hijri Calendar</p>
            <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "22px", lineHeight: 1.3 }}>{HIJRI_MONTHS[viewMonth - 1]} {viewYear} AH</p>
            <p style={{ fontFamily: "Scheherazade New, serif", color: "#c8a84b", fontSize: "18px" }}>{HIJRI_MONTHS_AR[viewMonth - 1]}</p>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
            <ChevronRight size={16} style={{ color: "#f0ede6" }} />
          </button>
        </div>
        {isCurrentMonth && (
          <div className="mt-2 text-center">
            <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "11px" }}>
              Today: {todayHijri.day} {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year} AH · {today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 px-2 pt-3 pb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="flex items-center justify-center py-1">
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "10px", fontWeight: 700 }}>{d}</p>
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 px-2 pb-3 gap-0.5">
          {cells.map((day, i) => {
            const isToday    = isCurrentMonth && day === todayHijri.day;
            const hasEvent   = day !== null && monthEvents.some(e => e.day === day);
            const eventColor = hasEvent ? (monthEvents.find(e => e.day === day)?.color ?? "var(--k-gold)") : null;
            return (
              <div key={i} className="flex flex-col items-center justify-center py-1.5 rounded-xl" style={{ background: isToday ? "var(--k-green)" : "transparent", minHeight: "36px" }}>
                {day !== null && (
                  <>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: isToday ? "#ffffff" : "var(--k-text)", fontSize: "13px", fontWeight: isToday ? 700 : 400 }}>{day}</p>
                    {hasEvent && !isToday && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: eventColor ?? "var(--k-gold)" }} />}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events for this month */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">
          Islamic Events — {HIJRI_MONTHS[viewMonth - 1]}
        </p>
        {monthEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {monthEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${event.color}18` }}>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: event.color, fontSize: "13px", fontWeight: 700 }}>{event.day}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{event.name}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl px-4 py-6 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>No major events this month.</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "12px", marginTop: "4px" }}>Sunnahs: fast Mondays & Thursdays, Ayyam al-Bid (13, 14, 15).</p>
          </div>
        )}
      </div>

      {/* Recommended fasting reminder */}
      <div className="rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Voluntary Fasting</p>
        <div className="flex flex-col gap-1.5">
          {[
            { name: "Mondays & Thursdays", desc: "Sunnah of the Prophet ﷺ" },
            { name: "Ayyam al-Bid (13, 14, 15)", desc: "White days of every Hijri month" },
            { name: "Day of Arafah (9 Dhul-Hijjah)", desc: "Expiation for two years" },
            { name: "Day of Ashura (10 Muharram)", desc: "Expiation for the past year" },
          ].map(item => (
            <div key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "var(--k-bg)" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--k-gold)" }} />
              <div>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
