import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

interface PrayerReminder {
  name: string;
  enabled: boolean;
  offset: number; // minutes before
}

const OFFSETS = [0, 5, 10, 15];

const DEFAULT_REMINDERS: PrayerReminder[] = [
  { name: "Fajr",    enabled: true,  offset: 5  },
  { name: "Dhuhr",   enabled: true,  offset: 0  },
  { name: "Asr",     enabled: true,  offset: 0  },
  { name: "Maghrib", enabled: true,  offset: 5  },
  { name: "Isha",    enabled: false, offset: 0  },
];

function loadReminders(): PrayerReminder[] {
  try {
    const saved = localStorage.getItem("khushu-reminders");
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  } catch { return DEFAULT_REMINDERS; }
}

function timeStrToDate(timeStr: string): Date | null {
  if (!timeStr) return null;
  const [time, period] = timeStr.split(" ");
  if (!time || !period) return null;
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  let hours = h;
  if (period === "PM" && h !== 12) hours += 12;
  if (period === "AM" && h === 12) hours = 0;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, m, 0);
  if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

export function RemindersPage() {
  const [reminders, setReminders] = useState<PrayerReminder[]>(loadReminders);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "denied"
  );
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [quranReminder, setQuranReminder] = useState(() => localStorage.getItem("khushu-quran-reminder") !== "false");
  const [jumuahReminder, setJumuahReminder] = useState(() => localStorage.getItem("khushu-jumuah-reminder") !== "false");
  const [scheduled, setScheduled] = useState<string[]>([]);
  const [timers, setTimers] = useState<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    localStorage.setItem("khushu-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => { localStorage.setItem("khushu-quran-reminder", String(quranReminder)); }, [quranReminder]);
  useEffect(() => { localStorage.setItem("khushu-jumuah-reminder", String(jumuahReminder)); }, [jumuahReminder]);

  useEffect(() => {
    fetch("/api/prayer-times")
      .then(r => r.json())
      .then(data => {
        if (data?.times) setPrayerTimes(data.times);
      })
      .catch(() => {});
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const clearTimers = useCallback(() => {
    timers.forEach(clearTimeout);
    setTimers([]);
  }, [timers]);

  const scheduleNotifications = useCallback(() => {
    clearTimers();
    if (permission !== "granted") return;

    const newTimers: ReturnType<typeof setTimeout>[] = [];
    const names: string[] = [];

    reminders.forEach(r => {
      if (!r.enabled) return;
      const rawTime = prayerTimes[r.name] || prayerTimes[r.name.toLowerCase()];
      if (!rawTime) return;

      const prayerDate = timeStrToDate(rawTime);
      if (!prayerDate) return;

      const notifyAt = new Date(prayerDate.getTime() - r.offset * 60000);
      const msUntil = notifyAt.getTime() - Date.now();
      if (msUntil < 0) return;

      const label = r.offset > 0 ? `${r.offset} min before ${r.name}` : `${r.name} time`;
      const t = setTimeout(() => {
        new Notification("Khushu — " + label, {
          body: r.offset > 0
            ? `${r.name} prayer in ${r.offset} minutes. Time: ${rawTime}`
            : `It is time for ${r.name} prayer. ${r.name === "Fajr" ? "As-Salatu Khayrun Minan-Nawm." : ""}`,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: r.name,
        });
      }, msUntil);
      newTimers.push(t);
      names.push(label);
    });

    // Quran reminder at 9 AM
    if (quranReminder) {
      const now = new Date();
      const quranTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
      if (quranTime.getTime() < now.getTime()) quranTime.setDate(quranTime.getDate() + 1);
      const ms = quranTime.getTime() - now.getTime();
      const t = setTimeout(() => {
        new Notification("Khushu — Daily Quran Reminder", {
          body: "Have you read your daily Quran today?",
          icon: "/favicon.ico",
          tag: "quran-daily",
        });
      }, ms);
      newTimers.push(t);
      names.push("Daily Quran at 9:00 AM");
    }

    // Jumu'ah reminder Fridays at 12:00 PM
    if (jumuahReminder) {
      const now = new Date();
      const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
      const friday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday, 12, 0, 0);
      const ms = friday.getTime() - now.getTime();
      const t = setTimeout(() => {
        new Notification("Khushu — Jumu'ah Reminder", {
          body: "Friday prayer begins soon. Make sure to send salawat on the Prophet ﷺ.",
          icon: "/favicon.ico",
          tag: "jumuah",
        });
      }, ms);
      newTimers.push(t);
      names.push("Jumu'ah (Friday 12:00 PM)");
    }

    setTimers(newTimers);
    setScheduled(names);
  }, [reminders, prayerTimes, permission, quranReminder, jumuahReminder, clearTimers]);

  useEffect(() => {
    if (permission === "granted" && Object.keys(prayerTimes).length > 0) {
      scheduleNotifications();
    }
    return clearTimers;
  }, [permission, prayerTimes]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (i: number) => setReminders(ps => ps.map((p, j) => j === i ? { ...p, enabled: !p.enabled } : p));
  const setOffset = (i: number, offset: number) => setReminders(ps => ps.map((p, j) => j === i ? { ...p, offset } : p));

  const notifSupported = "Notification" in window;

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">

      {/* Permission banner */}
      {!notifSupported ? (
        <div className="rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>
            Browser notifications are not supported in this environment. Try opening Khushu in Chrome or Safari.
          </p>
        </div>
      ) : permission === "default" ? (
        <button onClick={requestPermission} className="rounded-2xl p-4 text-left w-full" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
          <div className="flex items-center gap-3 mb-2">
            <BellRing size={20} style={{ color: "#c8a84b" }} />
            <p style={{ fontFamily: "Nunito, sans-serif", color: "#f0ede6", fontSize: "14px", fontWeight: 700 }}>Enable Prayer Notifications</p>
          </div>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.7)", fontSize: "12px", lineHeight: 1.5 }}>
            Tap to allow notifications. You'll receive a reminder before each prayer based on the prayer times for your configured location.
          </p>
        </button>
      ) : permission === "denied" ? (
        <div className="rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "#c0392b", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Notifications blocked</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.5 }}>
            Please enable notifications for this site in your browser settings, then refresh the page. On iOS, open in Safari and add to Home Screen for best results.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#1e6b5e15", border: "1px solid #1e6b5e40" }}>
          <Bell size={18} style={{ color: "var(--k-green)" }} />
          <div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-green)", fontSize: "13px", fontWeight: 700 }}>Notifications enabled</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>
              {scheduled.length > 0 ? `${scheduled.length} reminder${scheduled.length !== 1 ? "s" : ""} scheduled for today` : "No upcoming reminders today"}
            </p>
          </div>
        </div>
      )}

      {/* Scheduled list */}
      {scheduled.length > 0 && (
        <div>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Scheduled Today</p>
          <div className="flex flex-col gap-1">
            {scheduled.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--k-surface)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--k-green)" }} />
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prayer reminders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest">Prayer Notifications</p>
          {permission === "granted" && (
            <button onClick={scheduleNotifications} className="rounded-lg px-2 py-1" style={{ background: "var(--k-gold-sub)" }}>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }}>Apply Changes</p>
            </button>
          )}
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          {reminders.map((prayer, i) => (
            <div key={prayer.name} className="px-4 py-3.5" style={{ borderBottom: i < reminders.length - 1 ? "1px solid var(--k-border)" : "none" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {prayer.enabled
                    ? <Bell size={14} style={{ color: "var(--k-gold)" }} />
                    : <BellOff size={14} style={{ color: "var(--k-text-disabled)" }} />
                  }
                  <div>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: prayer.enabled ? "var(--k-text)" : "var(--k-text-disabled)", fontSize: "14px", fontWeight: 600 }}>{prayer.name}</p>
                    {prayerTimes[prayer.name] && (
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{prayerTimes[prayer.name]}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => toggle(i)} className="w-11 h-6 rounded-full relative" style={{ background: prayer.enabled ? "var(--k-green)" : "var(--k-surface-2)" }}>
                  <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all" style={{ left: prayer.enabled ? "calc(100% - 22px)" : "2px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
              {prayer.enabled && (
                <div className="flex items-center gap-1.5">
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", flexShrink: 0 }}>Notify</p>
                  <div className="flex gap-1 flex-wrap">
                    {OFFSETS.map(o => (
                      <button key={o} onClick={() => setOffset(i, o)} className="rounded-lg px-2 py-0.5"
                        style={{ background: prayer.offset === o ? "var(--k-gold-sub)" : "var(--k-surface-2)", border: prayer.offset === o ? "1px solid var(--k-gold-border)" : "1px solid transparent" }}>
                        <p style={{ fontFamily: "Nunito, sans-serif", color: prayer.offset === o ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "11px" }}>
                          {o === 0 ? "At time" : `${o} min before`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Other reminders */}
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Other Reminders</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          {[
            { label: "Daily Quran Reading", desc: "Reminder at 9:00 AM to read your daily portion", value: quranReminder, set: setQuranReminder },
            { label: "Jumu'ah (Friday Prayer)", desc: "Reminder every Friday at 12:00 PM", value: jumuahReminder, set: setJumuahReminder },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i === 0 ? "1px solid var(--k-border)" : "none" }}>
              <div className="flex-1">
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{item.desc}</p>
              </div>
              <button onClick={() => item.set(!item.value)} className="w-11 h-6 rounded-full relative flex-shrink-0" style={{ background: item.value ? "var(--k-green)" : "var(--k-surface-2)" }}>
                <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all" style={{ left: item.value ? "calc(100% - 22px)" : "2px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Platform notes */}
      <div className="rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">Platform Notes</p>
        {[
          { icon: "🤖", title: "Android Chrome", desc: "Best support — notifications work even with the tab in the background. Add to Home Screen for PWA mode." },
          { icon: "🍎", title: "iPhone / Safari", desc: "Add Khushu to your Home Screen (Share → Add to Home Screen), then enable notifications from Settings → Khushu." },
          { icon: "💻", title: "Desktop", desc: "Works in Chrome, Firefox, Edge. Safari on macOS requires the site to be installed as a web app." },
          { icon: "🔔", title: "Adhan on Device", desc: "Full audio adhan on your phone requires a native app. For now, a Raspberry Pi plays the adhan through a Bluetooth speaker (see the Adhan tab)." },
        ].map((n, i) => (
          <div key={i} className={`flex items-start gap-3 ${i > 0 ? "mt-3 pt-3" : ""}`} style={i > 0 ? { borderTop: "1px solid var(--k-border)" } : {}}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{n.icon}</span>
            <div>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{n.title}</p>
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.5 }}>{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
