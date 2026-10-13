import { useState, useEffect } from "react";
import { setAdminToken, adminHeaders } from "../../lib-admin";
import { User, Plus, ChevronRight, Loader, Shield } from "lucide-react";

interface ProfileSummary {
  id: string;
  displayName: string;
  isAdmin: boolean;
  adhanEnabled: boolean;
}

interface Props {
  onSelect: (id: string, name: string, isAdmin: boolean) => void;
}

export function ProfilePickerPage({ onSelect }: Props) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTok, setAdminTok]   = useState("");
  const [adminErr, setAdminErr]   = useState<string | null>(null);

  const handleAdmin = async () => {
    setAdminErr(null);
    setAdminToken(adminTok.trim());
    try {
      const res  = await fetch("/api/profiles", { headers: adminHeaders() });
      const data = await res.json();
      const check = await fetch("/api/admin/status", { headers: adminHeaders() });
      const admin = (data.profiles || []).find((p: ProfileSummary) => p.isAdmin);
      if (check.ok && admin) onSelect(admin.id, admin.displayName, true);
      else { setAdminToken(""); setAdminErr("Invalid admin token."); }
    } catch {
      setAdminToken("");
      setAdminErr("Network error.");
    }
  };

  useEffect(() => {
    fetch("/api/profiles")
      .then(r => r.json())
      .then(d => { if (d.ok) setProfiles(d.profiles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const data = await res.json();
      if (data.ok) {
        onSelect(data.profile.id, name, !!data.profile.isAdmin);
      } else {
        setError(data.error || "Could not create profile.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--k-bg)" }}>
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Header */}
        <div className="text-center mb-2">
          <p style={{ fontFamily: "Amiri, serif", color: "var(--k-gold)", fontSize: "28px" }}>سراج</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "20px", fontWeight: 700 }}>Who's using Khushu?</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Each person keeps their own adhan preferences.
          </p>
        </div>

        {/* Profile list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader size={22} style={{ color: "var(--k-gold)" }} className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id, p.displayName, p.isAdmin)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
                style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: p.isAdmin ? "rgba(200,168,75,0.18)" : "rgba(30,107,94,0.15)" }}>
                  {p.isAdmin
                    ? <Shield size={17} style={{ color: "var(--k-gold)" }} />
                    : <User size={17} style={{ color: "var(--k-teal)" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "15px", fontWeight: 700 }}>{p.displayName}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>
                    {p.isAdmin ? "Admin" : "Household member"}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: "var(--k-text-disabled)", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        )}

        {/* Add new profile */}
        {creating ? (
          <div className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 700 }}>Your name</p>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
              placeholder="e.g. Mom, Dad, Amina…"
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--k-bg)", border: "1px solid var(--k-border)",
                color: "var(--k-text)", fontFamily: "Nunito, sans-serif", fontSize: "14px"
              }}
            />
            {error && <p style={{ color: "#e08080", fontSize: "12px", fontFamily: "Nunito, sans-serif" }}>{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setCreating(false); setNewName(""); setError(null); }}
                className="flex-1 rounded-xl py-2 text-center"
                style={{ border: "1px solid var(--k-border)", color: "var(--k-text-muted)", fontFamily: "Nunito, sans-serif", fontSize: "13px" }}
              >Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                className="flex-2 rounded-xl py-2 px-5 text-center flex items-center justify-center gap-2"
                style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)", flex: 2 }}
              >
                {saving ? <Loader size={13} style={{ color: "var(--k-gold)" }} className="animate-spin" /> : null}
                <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "13px", fontWeight: 700 }}>Join</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5"
            style={{ border: "1.5px dashed var(--k-border)" }}
          >
            <Plus size={15} style={{ color: "var(--k-text-disabled)" }} />
            <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "14px", fontWeight: 600 }}>Add your name</span>
          </button>
        )}

        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "11px", textAlign: "center", lineHeight: 1.5 }}>
          You can switch profiles anytime from Settings
        </p>

        {/* Admin sign-in (owner only) */}
        {adminOpen ? (
          <div className="flex flex-col gap-2">
            <input
              type="password"
              autoComplete="off"
              value={adminTok}
              onChange={e => setAdminTok(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdmin(); }}
              placeholder="Admin token"
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: "var(--k-bg)", border: "1px solid var(--k-border)", color: "var(--k-text)", fontFamily: "Nunito, sans-serif", fontSize: "14px" }}
            />
            {adminErr && <p style={{ color: "#e08080", fontSize: "12px", fontFamily: "Nunito, sans-serif" }}>{adminErr}</p>}
            <button onClick={handleAdmin} disabled={!adminTok.trim()} className="rounded-xl py-2 text-center"
              style={{ border: "1px solid var(--k-border)", color: "var(--k-text-muted)", fontFamily: "Nunito, sans-serif", fontSize: "13px" }}>
              Sign in as admin
            </button>
          </div>
        ) : (
          <button onClick={() => setAdminOpen(true)} style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "11px" }}>
            Admin sign-in
          </button>
        )}
      </div>
    </div>
  );
}
