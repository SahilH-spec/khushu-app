import { useState, useEffect } from "react";
import { adminHeaders } from "../../lib-admin";
import { Shield, Loader, Trash2, Bell, BellOff } from "lucide-react";

interface ProfileStatus {
  id: string;
  displayName: string;
  isAdmin: boolean;
  adhanEnabled: boolean;
}

export function AdminPage() {
  const [profiles, setProfiles] = useState<ProfileStatus[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/status", { headers: adminHeaders() })
      .then(r => r.json())
      .then(d => { if (d.ok) setProfiles(d.profiles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (profileId: string, name: string) => {
    if (!confirm(`Remove ${name}'s profile? Their preferences will be lost.`)) return;
    await fetch(`/api/profiles/${profileId}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    load();
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      {/* Header */}
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.25)" }}>
        <Shield size={20} style={{ color: "var(--k-gold)" }} />
        <div>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "14px", fontWeight: 700 }}>Admin Dashboard</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>All household profiles</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size={22} style={{ color: "var(--k-gold)" }} className="animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No profiles found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {profiles.map(p => (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "15px", fontWeight: 700 }}>{p.displayName}</p>
                    {p.isAdmin && (
                      <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)", fontSize: "10px", color: "var(--k-gold)", fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>Admin</span>
                    )}
                  </div>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "11px" }}>ID: {p.id}</p>
                </div>

                {/* Adhan enabled */}
                <div className="flex items-center gap-1">
                  {p.adhanEnabled
                    ? <Bell size={13} style={{ color: "var(--k-teal)" }} />
                    : <BellOff size={13} style={{ color: "var(--k-text-disabled)" }} />
                  }
                </div>
              </div>

              {/* Delete (non-admin profiles only) */}
              {!p.isAdmin && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => handleDelete(p.id, p.displayName)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                    style={{ border: "1px solid rgba(224,128,128,0.3)" }}
                  >
                    <Trash2 size={11} style={{ color: "#e08080" }} />
                    <span style={{ fontFamily: "Nunito, sans-serif", color: "#e08080", fontSize: "11px" }}>Remove profile</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={load} className="rounded-xl py-2.5 text-center" style={{ border: "1px solid var(--k-border)" }}>
        <span style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>Refresh</span>
      </button>
    </div>
  );
}
