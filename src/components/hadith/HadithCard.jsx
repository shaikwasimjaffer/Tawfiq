import React, { useState } from "react";
import { Bookmark, Share2, Check, ChevronDown, ChevronUp, Copy, BookOpen } from "lucide-react";
import { toast } from "sonner";

/**
 * Premium Hadith Card
 * Displays collection, chapter, hadith number, right-aligned Arabic text,
 * narrator, English translation, bookmark/save action, and share/copy action.
 */
export default function HadithCard({
  hadith,
  isSaved,
  onToggleSave,
  onSelectCollection,
  onSelectChapter,
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const englishText = typeof hadith.english === "string" ? hadith.english : hadith.english?.text || "";
  const narratorText = hadith.narrator || hadith.english?.narrator || "";
  const arabicText = hadith.arabic || "";
  const bookTitle = hadith.bookTitle || "Hadith";
  const hadithNumber = hadith.idInBook ?? hadith.id;

  // Determine if content is long enough to offer expand/collapse
  const isLong = englishText.length > 380 || arabicText.length > 500;
  const displayEnglish = isLong && !isExpanded ? englishText.slice(0, 360) + "…" : englishText;
  const displayArabic = isLong && !isExpanded ? arabicText.slice(0, 400) + "…" : arabicText;

  const handleShare = async () => {
    const shareText = `${bookTitle} — Hadith #${hadithNumber}\n\n${arabicText}\n\n${narratorText ? narratorText + " " : ""}${englishText}\n\nVia Tawfiq`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bookTitle} #${hadithNumber}`,
          text: shareText,
        });
        return;
      } catch (e) {
        // Fallback to clipboard if user cancels or share fails
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Hadith copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <article
      className={`bg-white dark:bg-card rounded-[22px] p-5 border border-[#E7E2D9] dark:border-border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:border-[#134D37]/35 transition-all text-left ${className}`}
    >
      {/* Header Metadata & Quick Actions */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0EBE1] dark:border-border/60">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span
            onClick={() => onSelectCollection && hadith.bookKey && onSelectCollection(hadith.bookKey)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4EEE7] text-[#134D37] dark:bg-primary/15 dark:text-primary cursor-pointer hover:opacity-85 transition-opacity"
            title="Filter by this collection"
          >
            {bookTitle}
          </span>

          {hadith.chapterTitle && (
            <span
              onClick={() => onSelectChapter && hadith.chapterId != null && onSelectChapter(hadith.chapterId)}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3EFE7] text-[#5C574F] dark:bg-muted dark:text-muted-foreground truncate max-w-[190px] sm:max-w-[260px] cursor-pointer hover:opacity-85 transition-opacity"
              title={hadith.chapterTitle}
            >
              {hadith.chapterTitle}
            </span>
          )}

          <span className="text-[11px] font-medium text-[#8C857B] dark:text-muted-foreground tabular-nums">
            #{hadithNumber}
          </span>
        </div>

        {/* Save & Share Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#77766F] hover:text-[#134D37] hover:bg-[#F3EFE7] dark:hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
            title="Share or copy Hadith"
            aria-label="Share hadith"
          >
            {copied ? <Check size={15} className="text-[#134D37]" /> : <Share2 size={15} />}
          </button>

          <button
            type="button"
            onClick={() => onToggleSave && onToggleSave(hadith)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30 ${
              isSaved
                ? "text-[#134D37] bg-[#E4EEE7] dark:bg-primary/20"
                : "text-[#77766F] hover:text-[#134D37] hover:bg-[#F3EFE7] dark:hover:bg-muted"
            }`}
            title={isSaved ? "Remove from saved" : "Save Hadith"}
            aria-label={isSaved ? "Saved" : "Save"}
          >
            <Bookmark size={15} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Arabic Text (Prominent, RTL, Deep Forest Green / Primary) */}
      {arabicText && (
        <div className="pt-4 text-right">
          <p
            dir="rtl"
            lang="ar"
            className="text-[20px] sm:text-[22px] font-['Amiri',serif] leading-[1.8] text-[#134D37] dark:text-emerald-300 font-bold tracking-normal select-text text-right"
            style={{ textAlign: "right", direction: "rtl" }}
          >
            {displayArabic}
          </p>
        </div>
      )}

      {/* English Narrator (if available) */}
      {narratorText && (
        <p className="text-xs font-semibold text-[#5C574F] dark:text-stone-300 mt-3 italic tracking-wide">
          {narratorText}
        </p>
      )}

      {/* English Translation */}
      {englishText ? (
        <p className="text-sm sm:text-[14.5px] leading-relaxed text-[#2C2A26] dark:text-stone-100 mt-1.5 select-text">
          {displayEnglish}
        </p>
      ) : (
        <p className="text-xs text-[#8C857B] italic mt-2">
          (English translation not available in source records for this entry)
        </p>
      )}

      {/* Read More / Expand Toggle for Long Hadiths */}
      {isLong && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#134D37] dark:text-primary hover:underline focus-visible:outline-none"
          >
            <span>{isExpanded ? "Show less" : "Read full hadith"}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      )}
    </article>
  );
}
