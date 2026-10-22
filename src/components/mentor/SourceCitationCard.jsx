import React, { useState } from "react";
import { BookOpen, Copy, Check, ChevronDown, ChevronUp, ExternalLink, Maximize2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SourceCitationCard({ citation, onOpenModal }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (!citation) return null;

  const isQuran = citation.type === "quran";
  const title = isQuran
    ? `Surah ${citation.surahName || "Quran"} (${citation.surahNumber || citation.surahId || ""}:${citation.ayahNumber || citation.ayahId || ""})`
    : `${citation.collection || citation.collectionName || "Hadith"} #${citation.hadithNumber || citation.idInBook || citation.id || ""}`;

  const arabicText = citation.arabicText || citation.text || "";
  const englishText = citation.translation || "";
  const narrator = citation.narrator || "";
  const relevance = citation.relevance || "";
  const authenticityGrade = citation.authenticityGrade || null;

  const isLong = arabicText.length > 200 || englishText.length > 250;

  function handleCopy() {
    let copyText = `${title}\n`;
    if (authenticityGrade) copyText += `Grade: ${authenticityGrade}\n`;
    if (narrator) copyText += `Narrator: ${narrator}\n`;
    if (arabicText) copyText += `${arabicText}\n`;
    if (englishText) copyText += `${englishText}\n`;
    if (relevance) copyText += `Relevance: ${relevance}\n`;
    copyText += `(Source: Tawfiq Verified Scripture Library)`;

    navigator.clipboard?.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleViewInLibrary() {
    navigate("/quran");
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden transition-all hover:border-emerald-300">
      {/* Card Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/70 border-b border-stone-200/60">
        <div
          onClick={() => onOpenModal && onOpenModal(citation)}
          className="flex items-center gap-2 cursor-pointer group flex-wrap"
          title="Click to view full scripture"
        >
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isQuran
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-amber-100 text-amber-900 border border-amber-200"
            }`}
          >
            {isQuran ? "Holy Quran" : "Hadith"}
          </span>

          <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-800 truncate max-w-[200px]">
            {title}
          </span>

          {authenticityGrade && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={10} />
              <span>{authenticityGrade}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenModal && (
            <button
              onClick={() => onOpenModal(citation)}
              title="Read Full Scripture Record"
              className="p-1 text-stone-400 hover:text-emerald-700 rounded-md transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          )}
          <button
            onClick={handleCopy}
            title="Copy citation"
            className="p-1 text-stone-400 hover:text-emerald-700 rounded-md transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
          <button
            onClick={handleViewInLibrary}
            title="View in Library"
            className="p-1 text-stone-400 hover:text-emerald-700 rounded-md transition-colors"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Arabic Text (RTL) */}
        {arabicText && (
          <p
            dir="rtl"
            lang="ar"
            className={`text-right text-stone-900 leading-loose font-serif text-[15px] select-text ${
              !expanded && isLong ? "line-clamp-3" : ""
            }`}
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
          >
            {arabicText}
          </p>
        )}

        {/* Narrator (for Hadith) */}
        {narrator && (
          <p className="text-[11px] font-semibold text-emerald-800 italic">
            Narrated by: {narrator}
          </p>
        )}

        {/* English Translation */}
        {englishText && (
          <p
            className={`text-xs text-stone-700 leading-relaxed ${
              !expanded && isLong ? "line-clamp-4" : ""
            }`}
          >
            {englishText}
          </p>
        )}

        {/* Relevance to User Scenario */}
        {relevance && (
          <div className="bg-emerald-50/50 rounded-lg p-2.5 border-l-2 border-emerald-600 border-y border-r border-emerald-100 text-[11px] leading-relaxed text-stone-800 space-y-0.5">
            <span className="font-bold text-emerald-900 block text-[10px] uppercase tracking-wider">
              Relevance to Your Situation
            </span>
            <span className="text-stone-700">{relevance}</span>
          </div>
        )}

        {/* Expand / Collapse toggle for long text */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 pt-1"
          >
            {expanded ? (
              <>
                <ChevronUp size={12} /> Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} /> Read full text
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
