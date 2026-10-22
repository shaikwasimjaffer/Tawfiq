import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Scale,
  Sparkles,
  Info,
  ArrowRight,
  BookMarked,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Compass,
} from "lucide-react";
import SourceCitationCard from "./SourceCitationCard";

export default function MentorAnswerCard({
  answer,
  onRegenerate,
  onFeedback,
  feedbackState,
  onOpenScriptureModal,
  onReportCitation,
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [reported, setReported] = useState(false);

  if (!answer) return null;

  const {
    category,
    categoryTitle,
    citations = [],
  } = answer;

  const displayAnswer = answer.answer || answer.directAnswer || "";
  const displayApplication = answer.scenarioApplication || answer.explanation || "";
  const displaySteps = Array.isArray(answer.practicalNextSteps)
    ? answer.practicalNextSteps
    : Array.isArray(answer.actionableSteps)
    ? answer.actionableSteps
    : [];
  const displayLimitations = answer.limitations || answer.scholarlyContext || null;

  // Split citations into Quran and Hadith references
  const quranReferences =
    Array.isArray(answer.quranReferences) && answer.quranReferences.length > 0
      ? answer.quranReferences
      : citations.filter((c) => c.type === "quran");

  const hadithReferences =
    Array.isArray(answer.hadithReferences) && answer.hadithReferences.length > 0
      ? answer.hadithReferences
      : citations.filter((c) => c.type === "hadith");

  // Determine Badge Styling
  const badgeConfig = getCategoryBadgeConfig(category);

  function handleCopyAll() {
    let fullText = `${categoryTitle || "Tawfiq AI Guidance"}\n\n`;
    if (displayAnswer) fullText += `Direct Answer:\n${displayAnswer}\n\n`;
    if (displayApplication) fullText += `Application to Your Situation:\n${displayApplication}\n\n`;
    if (quranReferences.length > 0) {
      fullText +=
        `Quran References:\n` +
        quranReferences
          .map(
            (q) =>
              `- Surah ${q.surahName || "Quran"} (${q.surahNumber || q.surahId}:${q.ayahNumber || q.ayahId}): "${q.translation || q.text || ""}"${
                q.relevance ? `\n  Relevance: ${q.relevance}` : ""
              }`
          )
          .join("\n") +
        "\n\n";
    }
    if (hadithReferences.length > 0) {
      fullText +=
        `Hadith References:\n` +
        hadithReferences
          .map(
            (h) =>
              `- ${h.collection || h.collectionName} #${h.hadithNumber || h.idInBook}: "${h.translation || h.text || ""}"${
                h.relevance ? `\n  Relevance: ${h.relevance}` : ""
              }`
          )
          .join("\n") +
        "\n\n";
    }
    if (displaySteps.length > 0) {
      fullText += `Practical Next Steps:\n` + displaySteps.map((s) => `• ${s}`).join("\n") + "\n\n";
    }
    fullText += `(Verified via Tawfiq Islamic RAG Engine)`;

    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    const shareData = {
      title: "Tawfiq AI Islamic Guidance",
      text: `${displayAnswer}\n\n${displayApplication}\n\n(Tawfiq Verified Evidence)`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {}
    } else {
      handleCopyAll();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  function handleReport() {
    setReported(true);
    if (onReportCitation) onReportCitation(citations[0] || { reference: displayAnswer });
    setTimeout(() => setReported(false), 3000);
  }

  return (
    <div className="space-y-3.5 text-stone-900 select-text">
      {/* ── 1. Understated Category / Guidance Label ── */}
      {(categoryTitle || badgeConfig.label) && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/70" />
          <span>{categoryTitle || badgeConfig.label}</span>
        </div>
      )}

      {/* ── 2. Direct Answer (Primary Prominent Element) ── */}
      {displayAnswer && (
        <div className="space-y-1.5 py-1">
          <h2 className="text-stone-900 font-semibold text-lg sm:text-xl tracking-tight">
            Direct Guidance
          </h2>
          <p className="text-stone-900 text-[17px] sm:text-[19px] md:text-[20px] leading-[1.6] sm:leading-[1.65] font-normal font-sans antialiased">
            {displayAnswer}
          </p>
        </div>
      )}

      {/* ── 3. Application to Your Situation (Supporting Explanation) ── */}
      {displayApplication && (
        <div className="pt-3 pb-1 border-t border-stone-100/90 space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Compass size={13} className="text-emerald-700/80" />
            <span>How this applies to your situation</span>
          </h3>
          <div className="text-[14px] sm:text-[15px] text-stone-700 leading-relaxed prose prose-stone max-w-none prose-p:my-1 prose-strong:text-stone-900 prose-em:text-stone-800">
            <ReactMarkdown>{displayApplication}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ── 4. Quran References Section ── */}
      {quranReferences.length > 0 && (
        <div className="pt-3 space-y-2 border-t border-stone-100/90">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <BookMarked size={13} className="text-emerald-700/80" />
              <span>Quran References ({quranReferences.length})</span>
            </h3>
            <span className="text-[11px] text-stone-400">Canonical Scripture</span>
          </div>
          <div className="space-y-2">
            {quranReferences.map((citation, idx) => (
              <SourceCitationCard
                key={`q-${idx}`}
                citation={{ ...citation, type: "quran" }}
                onOpenModal={onOpenScriptureModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Hadith References Section ── */}
      {hadithReferences.length > 0 && (
        <div className="pt-3 space-y-2 border-t border-stone-100/90">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <BookMarked size={13} className="text-amber-700/80" />
              <span>Hadith References ({hadithReferences.length})</span>
            </h3>
            <span className="text-[11px] text-stone-400">Canonical Narrations</span>
          </div>
          <div className="space-y-2">
            {hadithReferences.map((citation, idx) => (
              <SourceCitationCard
                key={`h-${idx}`}
                citation={{ ...citation, type: "hadith" }}
                onOpenModal={onOpenScriptureModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Practical Next Steps ── */}
      {displaySteps.length > 0 && (
        <div className="pt-3 border-t border-stone-100/90">
          <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 text-stone-800 space-y-2">
            <h3 className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-700" />
              <span>Practical Next Steps</span>
            </h3>
            <ul className="space-y-1.5 text-[13px] text-stone-700 leading-relaxed">
              {displaySteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 7. Scholarly Context & Limitations ── */}
      {displayLimitations && (
        <div className="pt-2">
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 text-[12px] text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-700 text-[11px]">
              <Info size={12} className="text-stone-500" />
              <span>Scholarly Context & Boundaries</span>
            </div>
            <p className="leading-relaxed text-stone-600">{displayLimitations}</p>
          </div>
        </div>
      )}

      {/* ── Interactive Message Action Controls ── */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-stone-400">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1 text-[11px] hover:text-emerald-800 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
            title="Copy entire answer and citations"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 text-[11px] hover:text-emerald-800 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
              title="Regenerate response"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-[11px] hover:text-emerald-800 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
            title="Share answer"
          >
            <Share2 size={12} />
            <span>{shared ? "Shared" : "Share"}</span>
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onFeedback && onFeedback("helpful")}
            className={`p-1.5 rounded-md transition-colors ${
              feedbackState === "helpful"
                ? "text-emerald-700 bg-emerald-50"
                : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            }`}
            title="Helpful guidance"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => onFeedback && onFeedback("unhelpful")}
            className={`p-1.5 rounded-md transition-colors ${
              feedbackState === "unhelpful"
                ? "text-rose-700 bg-rose-50"
                : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            }`}
            title="Not helpful"
          >
            <ThumbsDown size={13} />
          </button>
          <button
            onClick={handleReport}
            className={`p-1.5 rounded-md transition-colors ${
              reported
                ? "text-amber-700 bg-amber-50"
                : "text-stone-400 hover:text-amber-700 hover:bg-stone-100"
            }`}
            title="Report potentially inaccurate citation"
          >
            <Flag size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getCategoryBadgeConfig(category) {
  switch (category) {
    case "explicit_prohibition":
      return {
        label: "Explicitly Supported Prohibition",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
        icon: <ShieldAlert size={12} className="text-rose-600" />,
      };
    case "explicit_obligation":
      return {
        label: "Explicitly Supported Obligation",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <CheckCircle2 size={12} className="text-emerald-600" />,
      };
    case "explicit_permission":
      return {
        label: "Explicitly Supported Permission",
        badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
        icon: <Sparkles size={12} className="text-teal-600" />,
      };
    case "scholarly_disagreement":
      return {
        label: "Recognized Difference of Opinion (Ikhtilaf)",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
        icon: <Scale size={12} className="text-amber-600" />,
      };
    case "insufficient_evidence":
      return {
        label: "Insufficient Evidence in Available Corpus",
        badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
        icon: <HelpCircle size={12} className="text-stone-500" />,
      };
    case "more_context_required":
      return {
        label: "Additional Context Required",
        badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
        icon: <Info size={12} className="text-sky-600" />,
      };
    case "scholarly_review_recommended":
      return {
        label: "Personal Scholarly Review Recommended",
        badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
        icon: <AlertTriangle size={12} className="text-purple-600" />,
      };
    case "general_guidance":
    default:
      return {
        label: "Scriptural Guidance & Reflection",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <Sparkles size={12} className="text-emerald-600" />,
      };
  }
}
