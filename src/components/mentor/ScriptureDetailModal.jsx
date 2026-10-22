import React, { useState } from "react";
import { X, Copy, Check, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

export default function ScriptureDetailModal({ citation, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !citation) return null;

  const isQuran = citation.type === "quran";
  const title = isQuran
    ? `Surah ${citation.surahName || "Quran"} (${citation.reference || ""})`
    : citation.reference || citation.collectionName || "Hadith Narration";

  const arabicText = citation.text || "";
  const englishText = citation.translation || "";
  const narrator = citation.narrator || "";

  function handleCopy() {
    const textToCopy = `${title}\n\nArabic:\n${arabicText}\n\n${narrator ? "Narrator: " + narrator + "\n\n" : ""}English Translation:\n${englishText}\n\n(Source: Tawfiq Verified Scripture Library)`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/90 border-b border-stone-200/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isQuran
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              <BookOpen size={14} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-stone-900">{title}</h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">
                {isQuran ? "Canonical Quranic Revelation" : "Authentic Hadith Record"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Authenticity Grade (if reliable) */}
          {citation.authenticityGrade && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Authenticity Grade: {citation.authenticityGrade}</span>
            </div>
          )}

          {/* Canonical Arabic Text */}
          {arabicText && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Canonical Arabic
              </span>
              <p
                dir="rtl"
                lang="ar"
                className="text-right text-stone-900 leading-[2.2] font-serif text-lg md:text-xl select-text"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
              >
                {arabicText}
              </p>
            </div>
          )}

          {/* Hadith Narrator Chain */}
          {narrator && (
            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100 text-xs text-amber-950">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                Narrator Chain (Isnad)
              </span>
              <p className="italic font-medium">{narrator}</p>
            </div>
          )}

          {/* Translation */}
          {englishText && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Authorized English Translation
              </span>
              <p className="text-sm text-stone-800 leading-relaxed font-sans">{englishText}</p>
            </div>
          )}

          {/* Relevance to Scenario */}
          {citation.relevance && (
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Relevance to Your Scenario
              </span>
              <p className="leading-relaxed text-stone-700">{citation.relevance}</p>
            </div>
          )}

          {/* Provenance Box */}
          <div className="bg-stone-100/70 p-3.5 rounded-xl border border-stone-200/60 text-[11px] text-stone-600 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
            <span>
              Pinned release dataset: {isQuran ? "risan/quran-json v3.1.2" : "AhmedBaset/hadith-json v1.2.0"}.
              Verified against primary canonical collections.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Full Scripture</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
