import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Tawfiq Geometric Arch Icon
 * Authentic, minimalist Islamic architectural arch symbol crafted with geometric precision.
 */
export function TawfiqBrandIcon({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer mihrab / pointed arch silhouette */}
      <path
        d="M12 2.5C7.5 5.8 4 9.5 4 14.5V21.5H20V14.5C20 9.5 16.5 5.8 12 2.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner sacred arch niche */}
      <path
        d="M12 6.5C9 8.8 6.8 11.5 6.8 15V21.5H17.2V15C17.2 11.5 15 8.8 12 6.5Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.75"
      />
      {/* Center ascending axis */}
      <path
        d="M12 10.5V17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18.5" r="0.75" fill={color} />
    </svg>
  );
}

/**
 * Premium Brand Mark with Wordmark
 */
export function TawfiqWordmark({ className = "" }) {
  return (
    <Link
      to="/website"
      className={`inline-flex items-center gap-2.5 group transition-transform active:scale-95 ${className}`}
      title="Tawfiq Overview"
    >
      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#134D37] flex items-center justify-center text-[#EAF2ED] shadow-[0_2px_8px_rgba(19,77,55,0.18)] transition-all group-hover:bg-[#0E3B2A]">
        <TawfiqBrandIcon className="w-4.5 sm:w-5 h-4.5 sm:h-5" color="currentColor" />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif text-[19px] sm:text-[21px] font-bold text-[#134D37] tracking-tight leading-none">
          Tawfiq
        </span>
        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.16em] font-bold text-[#787062] leading-none mt-1">
          Islamic Companion
        </span>
      </div>
    </Link>
  );
}

/**
 * Tawfiq Standalone Square Emblem Logo
 *
 * The official green square logo containing the cream-coloured Islamic arch emblem,
 * matching the authentic brand identity shown in the reference screenshot.
 */
export function TawfiqSquareLogo({ className = "w-14 h-14", imgClassName = "w-full h-full" }) {
  return (
    <Link
      to="/website"
      className={`inline-flex items-center justify-center rounded-2xl bg-[#134D37] overflow-hidden shadow-[0_4px_16px_rgba(19,77,55,0.22)] border border-[#1C5E45] hover:scale-105 active:scale-95 transition-all duration-200 select-none ${className}`}
      title="Tawfiq"
      aria-label="Tawfiq Home"
    >
      <img
        src="/apple-touch-icon.png"
        alt="Tawfiq Emblem"
        className={`object-cover ${imgClassName}`}
        loading="eager"
      />
    </Link>
  );
}

/**
 * Unified, Art-Directed Authentication Shell Layout
 * - Quiet, serene warm stone palette (#F7F5EF) matching Tawfiq core.
 * - Subtly textured background with subtle radial gradient.
 * - High contrast WCAG AA compliant text.
 * - Natural unhindered document scrolling for all viewports (e.g. 425x704).
 */
export default function AuthLayout({
  title,
  subtitle = "",
  footer = null,
  headerAction = null,
  showTopNav = true,
  customLogo = null,
  children,
}) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen w-full bg-[#F7F5EF] text-[#2A261F] flex flex-col justify-between selection:bg-[#134D37]/15 selection:text-[#134D37] font-sans antialiased relative overflow-x-hidden overflow-y-auto">
      {/* Subtle organic top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 bg-gradient-to-b from-[#E7E2D5]/50 via-transparent to-transparent blur-3xl opacity-70 -z-10"
      />

      {/* Top Bar with Brand & Contextual Nav Action */}
      {showTopNav && (
        <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between z-10">
          <TawfiqWordmark />
          {headerAction ? (
            headerAction
          ) : isLoginPage ? (
            /* On login page, top-right link is removed as requested */
            null
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-[#134D37] hover:text-[#0E3B2A] py-1.5 px-3 rounded-full hover:bg-[#EBE5DB]/70 transition-colors"
            >
              Sign in
            </Link>
          )}
        </header>
      )}

      {/* Main Form Container: Starts naturally on mobile, centered on larger screens */}
      <main className={`flex-1 flex flex-col justify-start sm:justify-center items-center px-4 sm:px-6 ${showTopNav ? "py-2 sm:py-8" : "py-6 sm:py-10"} z-10`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Centered Top Logo when customLogo is provided or on login page */}
          {customLogo && (
            <div className="flex justify-center mb-5 sm:mb-6">
              {customLogo}
            </div>
          )}
          {/* Card Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,31,0.06),0_1px_3px_rgba(42,38,31,0.04)] border border-[#E8E2D6] transition-all">
            {/* Header within Card */}
            <div className="mb-5 sm:mb-6 text-center">
              <h1 className="font-serif text-[24px] sm:text-[27px] font-bold text-[#1C3B2B] tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[13px] sm:text-[13.5px] text-[#5C5549] mt-1.5 font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form content */}
            {children}
          </div>

          {/* Footer note / navigation link below card */}
          {footer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="mt-4 sm:mt-5 text-center text-xs text-[#5C5549]"
            >
              {footer}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Grounded Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-[11px] text-[#787062] flex items-center justify-center gap-3 sm:gap-4">
        <span>© {new Date().getFullYear()} Tawfiq</span>
        <span aria-hidden="true">•</span>
        <Link
          to="/privacy"
          className="hover:text-[#134D37] underline-offset-2 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-[#134D37]/30 rounded"
        >
          Privacy Policy
        </Link>
        <span aria-hidden="true">•</span>
        <Link
          to="/terms"
          className="hover:text-[#134D37] underline-offset-2 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-[#134D37]/30 rounded"
        >
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
