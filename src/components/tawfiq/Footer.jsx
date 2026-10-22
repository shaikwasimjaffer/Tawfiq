import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// A quiet close — tagline, the wordmark, the Bismillah call, and the links.

const BismillahButton = ({
  className = "",
  iconSize = 18,
  textSize = "text-xl md:text-2xl",
}) => (
  <a
    href="https://tawfiq-official.github.io/Tawfiq/"
    target="_blank"
    rel="noopener noreferrer"
    className={`group inline-flex items-center gap-3 ${className}`}
  >
    <span className="w-0 group-hover:w-6 h-px bg-stone-900 transition-all duration-500" />
    <svg
      viewBox="0 0 24 24"
      width={iconSize}
      height={iconSize}
      fill="none"
      className="text-stone-900"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 5 L14.5 12 L12 14.5 L9.5 12 Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M12 19 L14.5 12 L12 14.5 L9.5 12 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </svg>
    <span className={`font-serif ${textSize} text-stone-900 tracking-tight`}>
      Begin with Bismillah
    </span>
    <span className="w-0 group-hover:w-6 h-px bg-stone-900 transition-all duration-500" />
  </a>
);

export default function Footer() {
  return (
    <footer className="relative bg-[#F5F2EF] pt-32 pb-12 overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif italic font-light text-xl md:text-2xl text-stone-500 leading-relaxed"
        >
          Every prayer is a step home.
        </motion.p>

        {/* Wordmark */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(3rem,9vw,6.5rem)] font-bold uppercase tracking-[-0.02em] text-stone-900 leading-none mt-12"
        >
          Tawfiq
        </motion.h2>

        {/* The Bismillah call */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16"
        >
          <BismillahButton />
        </motion.div>

        {/* Links */}
        <div className="mt-24 pt-8 border-t border-stone-300/40 flex items-center justify-center gap-10 text-[11px] font-sans text-stone-400 tracking-wide">
          <Link
            to="/privacy"
            className="hover:text-stone-700 transition-colors"
          >
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-stone-700 transition-colors">
            Terms
          </Link>
          <a
            href="mailto:hello@tawfiq.app"
            className="hover:text-stone-700 transition-colors"
          >
            Support
          </a>
        </div>

        <p className="mt-8 text-[10px] font-sans tracking-[0.15em] uppercase text-stone-300">
          تَوْفِيق — Tawfiq · Made with intention
        </p>
      </div>
    </footer>
  );
}
