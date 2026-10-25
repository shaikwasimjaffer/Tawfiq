import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Code,
  Calculator,
  PenLine,
  BookOpen,
  Compass,
  Square,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { TawfiqBrandIcon } from "@/components/AuthLayout";

/**
 * AiActivityIndicator
 * Compact, refined, and contextual response activity indicator for Tabaka / Tawfiq AI.
 * Communicates current processing phases with smooth crossfades and subtle animations.
 */
export default function AiActivityIndicator({
  phase,
  category = "general",
  categoryTitle = "",
  isStreaming = false,
  onStop,
  error = null,
  onRetry = null,
}) {
  const statusText = phase?.label || (isStreaming ? "Drafting your response…" : "Generating response…");

  // Category Icon resolver
  const getCategoryIcon = () => {
    switch (category) {
      case "code":
        return <Code size={12} className="text-[#134D37]" />;
      case "math":
        return <Calculator size={12} className="text-[#134D37]" />;
      case "writing":
        return <PenLine size={12} className="text-[#134D37]" />;
      case "fiqh_islamic":
        return <BookOpen size={12} className="text-[#134D37]" />;
      case "complex":
        return <Compass size={12} className="text-[#134D37]" />;
      default:
        return <Sparkles size={12} className="text-[#134D37]" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full transition-all"
    >
      {/* Top Header / Status Row */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Animated Pulse + Dynamic Status Message */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {error ? (
            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={12} />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-[#134D37]/8 shrink-0">
              {/* Subtle animated orbital glow */}
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#134D37]/35" />
              <span className="relative flex items-center justify-center">
                {getCategoryIcon()}
              </span>
            </div>
          )}

          {/* Smooth Crossfading Status Text */}
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.span
                  key="error-text"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-[12.5px] font-medium text-rose-700 truncate block"
                >
                  {error}
                </motion.span>
              ) : (
                <motion.div
                  key={statusText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  <span className="text-[12.5px] font-medium text-[#2A261F] truncate">
                    {statusText}
                  </span>
                  {categoryTitle && !isStreaming && (
                    <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-stone-100 text-[#70685C] border border-stone-200/60 shrink-0">
                      {categoryTitle}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Stop Generation or Retry Button */}
        <div className="flex items-center gap-2 shrink-0">
          {error && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#134D37] hover:text-[#0E3B2A] bg-[#134D37]/10 hover:bg-[#134D37]/15 px-2.5 py-1 rounded-full transition-colors active:scale-95"
            >
              <RotateCcw size={11} />
              <span>Retry</span>
            </button>
          ) : onStop ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generation"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#70685C] hover:text-[#1C3B2B] bg-[#FAF8F5] hover:bg-[#EBE5DB] px-2.5 py-1 rounded-full transition-colors border border-[#DDD7CD] shadow-2xs active:scale-95"
            >
              <Square size={10} className="fill-current text-[#8C8273]" />
              <span>Stop</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Subtle Skeletal Shimmer Placeholder (Visible only during initial processing before streaming text) */}
      {!isStreaming && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-3.5 space-y-2 max-w-lg pointer-events-none"
        >
          <div className="h-2.5 bg-gradient-to-r from-stone-200/60 via-stone-100 to-stone-200/60 rounded-full w-[85%] animate-pulse" />
          <div className="h-2.5 bg-gradient-to-r from-stone-200/60 via-stone-100 to-stone-200/60 rounded-full w-[68%] animate-pulse [animation-delay:150ms]" />
          <div className="h-2.5 bg-gradient-to-r from-stone-200/60 via-stone-100 to-stone-200/60 rounded-full w-[44%] animate-pulse [animation-delay:300ms]" />
        </motion.div>
      )}
    </div>
  );
}
