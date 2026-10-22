import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { TawfiqBrandIcon } from "@/components/AuthLayout";

/**
 * ZomatoAiTransition
 * 
 * A refined, high-performance entry animation for Tawfiq AI / Mentor.
 * Inspired by the satisfying, responsive feel of Zomato AI's feature entry:
 * - 0–200ms: Responsive press & expanding shape transformation originating from the pill entry.
 * - 200–600ms: Soft, branded transition expanding with Tawfiq's signature warm cream (#F7F5EF)
 *   and deep forest emerald (#134D37) gradient illumination.
 * - 400–800ms: Seamlessly dissolves into the AI workspace while content elements stagger in.
 * - Fully completes within ~700ms with zero artificial delays or blocking screens.
 * - Zero flashy particles or gimmick spinners; authentic, restrained, and intentional motion.
 * - Full prefers-reduced-motion support.
 */
export default function ZomatoAiTransition({ isOpen, onComplete }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    // Pin scroll position immediately to prevent unwanted viewport jumping
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Fast, responsive completion: ~650ms (or 100ms for reduced motion)
    const duration = shouldReduceMotion ? 100 : 650;
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onComplete, shouldReduceMotion]);

  if (!isOpen) return null;

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F7F5EF] pointer-events-none" />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="mentor-ai-entry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-start pointer-events-none overflow-hidden select-none"
        style={{
          backgroundColor: "#F7F5EF",
          background:
            "radial-gradient(circle at 50% 28px, rgba(19, 77, 55, 0.12) 0%, rgba(247, 245, 239, 0.98) 55%, #F7F5EF 100%)",
        }}
      >
        {/* Soft expanding pill element originating from the top center navigation */}
        <motion.div
          initial={{
            scaleX: 0.25,
            scaleY: 0.1,
            y: 20,
            opacity: 0.9,
            borderRadius: 9999,
          }}
          animate={{
            scaleX: 1,
            scaleY: 1,
            y: 0,
            opacity: [0.9, 0.4, 0],
            borderRadius: [9999, 32, 0],
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 bg-gradient-to-b from-[#134D37]/8 via-[#134D37]/4 to-transparent pointer-events-none"
        />

        {/* Minimal, tasteful brand anchor icon at the center of the transition */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{
            scale: [0.92, 1, 1.02],
            opacity: [0, 1, 0],
            y: [16, 0, -4],
          }}
          transition={{
            duration: 0.58,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-28 sm:mt-36 flex flex-col items-center text-center px-4"
        >
          {/* Subtle brand icon in soft emerald */}
          <div className="w-14 h-14 rounded-2xl bg-[#134D37] text-[#FAF8F5] flex items-center justify-center shadow-[0_4px_20px_rgba(19,77,55,0.18)] border border-[#134D37]/20 mb-3.5">
            <TawfiqBrandIcon className="w-8 h-8" color="currentColor" />
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C3B2B] tracking-tight">
            Tawfiq <span className="text-[#134D37]">Mentor</span>
          </h2>
          <p className="text-xs text-[#70685C] mt-1 font-medium">
            Entering Islamic Intelligence...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
