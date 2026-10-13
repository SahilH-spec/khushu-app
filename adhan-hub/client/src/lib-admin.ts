// Admin token is held in sessionStorage only (cleared when the tab closes) and verified by the server.
const KEY = "khushu-admin-token";

export function getAdminToken(): string {
  try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; }
}
export function setAdminToken(t: string) {
  try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
export function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const t = getAdminToken();
  return t ? { ...extra, "X-Admin-Token": t } : extra;
}
