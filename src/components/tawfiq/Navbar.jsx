import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#F7F5F1]/85 backdrop-blur-xl border-b border-stone-200/40"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="text-stone-900"
          >
            <path
              d="M11 2C11 2 5 6 5 12C5 16 8 19 11 19C14 19 17 16 17 12C17 6 11 2 11 2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M11 5V19M8 11L11 8L14 11"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-serif text-xl text-stone-900 tracking-tight">
            Tawfiq
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Qaza", href: "#qaza" },
            { label: "Tawfiq AI", href: "#tawfiq-ai" },
            { label: "Quran", href: "#quran" },
            { label: "Academy", href: "#academy" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-sans text-stone-500 hover:text-stone-900 transition-colors duration-300 tracking-wide"
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          href="https://tawfiq-official.github.io/Tawfiq/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 text-[13px] text-stone-900 transition-all duration-300"
        >
          <span className="w-0 group-hover:w-4 h-px bg-stone-900 transition-all duration-500" />
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            className="text-stone-900"
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
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
          <span className="font-serif text-[15px] tracking-tight">
            Begin with Bismillah
          </span>
          <span className="w-0 group-hover:w-4 h-px bg-stone-900 transition-all duration-500" />
        </a>
      </nav>
    </motion.header>
  );
}
