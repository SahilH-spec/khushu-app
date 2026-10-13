import { ChevronRight, Calendar, Book, Globe, Heart, Settings, Bell, Star, Info, Shield, UserCircle2 } from "lucide-react";

interface Props {
  onNavigate: (id: string, title: string) => void;
  isAdmin?: boolean;
}

const menuItems = [
  { id: "calendar",       icon: Calendar,     label: "Islamic Calendar",  desc: "Hijri dates & upcoming events", color: "#b89230" },
  { id: "hadith",         icon: Book,         label: "Hadith Collection", desc: "Authentic narrations by book",  color: "#1aa399" },
  { id: "qibla",          icon: Globe,        label: "Qibla Direction",   desc: "Find direction of prayer",      color: "#1e6b5e" },
  { id: "sadaqah",        icon: Heart,        label: "Sadaqah Tracker",   desc: "Track your charity & giving",   color: "#c0392b" },
  { id: "favorites",      icon: Star,         label: "Favorites",         desc: "Saved verses & duas",           color: "#f39c12" },
  { id: "reminders",      icon: Bell,         label: "Prayer Reminders",  desc: "Notification settings",         color: "#9b59b6" },
  { id: "app-settings",   icon: Settings,     label: "Settings",          desc: "App preferences & display",     color: "#6b7a69" },
  { id: "about",          icon: Info,         label: "About Khushu",       desc: "Version & credits",             color: "#4a5d72" },
];

const accountItems = [
  { id: "switch-profile", icon: UserCircle2,  label: "Switch Profile",    desc: "Change to a different household member", color: "#4a7a9b" },
];

const adminItems = [
  { id: "admin",          icon: Shield,       label: "Admin Dashboard",   desc: "Manage household profiles",       color: "#b89230" },
];

export function MorePage({ onNavigate, isAdmin = false }: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4 mt-3">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,168,75,0.2)" }}>
          <span style={{ fontSize: "22px" }}>🌙</span>
        </div>
        <div>
          <p style={{ fontFamily: "Amiri, serif", color: "#f0ede6", fontSize: "18px" }}>Assalamu Alaikum</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "12px" }}>May Allah bless your day</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id, item.label)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderBottom: i < menuItems.length - 1 ? "1px solid var(--k-border)" : "none" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                <Icon size={17} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{item.desc}</p>
              </div>
              <ChevronRight size={15} style={{ color: "var(--k-text-disabled)" }} />
            </button>
          );
        })}
      </div>

      {/* Account actions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {[...accountItems, ...(isAdmin ? adminItems : [])].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id, item.label)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--k-border)" : "none" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                <Icon size={17} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>{item.desc}</p>
              </div>
              <ChevronRight size={15} style={{ color: "var(--k-text-disabled)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
