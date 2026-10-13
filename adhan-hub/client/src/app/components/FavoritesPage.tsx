import { useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import type { BookmarkState } from "../App";

const surahNames: Record<number, string> = { 1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 18: "Al-Kahf", 36: "Ya-Sin", 55: "Ar-Rahman", 67: "Al-Mulk", 112: "Al-Ikhlas" };
const surahArabic: Record<number, string> = { 1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 18: "الكهف", 36: "يس", 55: "الرحمن", 67: "الملك", 112: "الإخلاص" };

export function FavoritesPage({ bookmarks }: { bookmarks: BookmarkState }) {
  const [tab, setTab] = useState<"verses" | "surahs">("verses");

  const hasVerses = bookmarks.verses.length > 0;
  const hasSurahs = bookmarks.surahs.length > 0;

  return (
    <div className="flex flex-col pb-6">
      {/* Tabs */}
      <div className="flex mx-4 mt-3 mb-3 rounded-xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {(["verses", "surahs"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5" style={{ background: tab === t ? "var(--k-gold-sub)" : "transparent" }}>
            {t === "verses" ? <Bookmark size={12} style={{ color: tab === t ? "var(--k-gold)" : "var(--k-text-muted)" }} /> : <Heart size={12} style={{ color: tab === t ? "var(--k-gold)" : "var(--k-text-muted)" }} />}
            <p style={{ fontFamily: "Nunito, sans-serif", color: tab === t ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "13px", fontWeight: tab === t ? 700 : 400 }}>
              {t === "verses" ? `Verses (${bookmarks.verses.length})` : `Surahs (${bookmarks.surahs.length})`}
            </p>
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === "verses" ? (
          !hasVerses ? (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <Bookmark size={32} style={{ color: "var(--k-text-disabled)" }} />
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "14px", textAlign: "center" }}>No saved verses yet. Open a surah and tap the bookmark icon on any verse.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {bookmarks.verses.map(key => {
                const [sNum, vNum] = key.split(":").map(Number);
                return (
                  <div key={key} className="rounded-xl px-4 py-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-gold-border)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "12px", fontWeight: 600 }}>{surahNames[sNum] ?? `Surah ${sNum}`} — Verse {vNum}</p>
                      <Bookmark size={13} fill="var(--k-gold)" style={{ color: "var(--k-gold)" }} />
                    </div>
                    <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px" }}>Tap to read in context</p>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          !hasSurahs ? (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <Heart size={32} style={{ color: "var(--k-text-disabled)" }} />
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "14px", textAlign: "center" }}>No bookmarked surahs. Tap the bookmark icon next to a surah in the Quran section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {bookmarks.surahs.map(num => (
                <div key={num} className="rounded-xl p-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-gold-border)" }}>
                  <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "20px", textAlign: "right" }}>{surahArabic[num] ?? "سورة"}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", fontWeight: 600 }}>{surahNames[num] ?? `Surah ${num}`}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
