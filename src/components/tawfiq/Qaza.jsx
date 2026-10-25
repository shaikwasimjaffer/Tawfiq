import React from "react";
import { motion } from "framer-motion";
import { useQaza } from "@/lib/useQaza";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

// Qaza — placed where Surah Taha once was.
// Centered, hopeful, alive: stats, progress toward zero, the journey, and the ledger.

const PRAYER_UNITS = {
  fajr: "dawn",
  dhuhr: "noon",
  asr: "afternoon",
  maghrib: "sunset",
  isha: "night",
};

const journey = [
  { value: 312, label: "Last year" },
  { value: 231, label: "6 months" },
  { value: 167, label: "3 months" },
  { value: 132, label: "Now", highlight: true },
];

const ACCENT = "#d98e4a";

export default function Qaza() {
  const { qaza, total, totalMadeUp, clearedPercentage, adjust } = useQaza();

  const ledger = PRAYERS.map((key) => ({
    key,
    name: PRAYER_NAMES[key] || key,
    owed: qaza[key] ?? 0,
    unit: PRAYER_UNITS[key] || "prayer",
  }));

  const totalOwed = total;

  return (
    <section
      id="qaza"
      className="relative bg-[#f9f7f2] py-32 md:py-44 overflow-hidden"
    >
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#9d9d9d] mb-10"
        >
          02 — Qaza
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.01em] text-[#1a1a1a]"
        >
          Missed prayers,
          <br />
          <span className="italic font-light text-[#8a8a8a]">
            made up one at a time.
          </span>
        </motion.h2>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-serif text-[15px] md:text-base text-[#666666] leading-[1.9] max-w-xl mx-auto mt-10"
        >
          Missed prayers accumulate — over months, years, a lifetime. Tawfiq
          counts them, tracks every repayment, and shows you the path to zero.
          Not as a deadline. As a homecoming.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-10 md:gap-16 mt-16"
        >
          <div>
            <p className="font-serif text-4xl md:text-5xl text-[#1a1917] leading-none tabular-nums">
              {clearedPercentage.toFixed(0)}%
            </p>
            <p className="text-[11px] font-sans tracking-[0.1em] text-[#8f8b85] mt-3">
              recovered
            </p>
          </div>
          <div className="w-px h-12 bg-[#e0e0e0]" />
          <div>
            <p className="font-serif text-4xl md:text-5xl text-[#1a1917] leading-none tabular-nums">
              {totalMadeUp.toLocaleString()}
            </p>
            <p className="text-[11px] font-sans tracking-[0.1em] text-[#8f8b85] mt-3">
              prayers completed
            </p>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-14"
        >
          <div className="flex items-center justify-between text-[11px] font-sans text-[#8a8a8a] mb-3">
            <span>Progress toward zero</span>
            <span>{totalOwed} remaining</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#e0e0e0] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ACCENT }}
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(clearedPercentage > 0 ? 1 : 0, clearedPercentage)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>

        {/* Your Journey */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20"
        >
          <p className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#9d9d9d] mb-10">
            Your Journey
          </p>
          <div className="flex items-end justify-between max-w-lg mx-auto">
            {journey.map((j, i) => (
              <motion.div
                key={j.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center"
              >
                <p
                  className={`font-serif text-2xl md:text-3xl tabular-nums leading-none ${
                    j.highlight ? "text-[#1a1917]" : "text-[#1a1917]"
                  }`}
                >
                  {j.value}
                </p>
                <div
                  className={`mt-3 h-0.5 transition-all duration-500 ${
                    j.highlight ? "w-10" : "w-0"
                  }`}
                  style={{
                    backgroundColor: j.highlight ? ACCENT : "transparent",
                  }}
                />
                <p className="text-[10px] font-sans tracking-[0.1em] text-[#8f8b85] mt-3">
                  {j.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* The Ledger */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-20 text-left"
        >
          <div className="flex items-end justify-between pb-4 border-b border-[#e0e0e0]">
            <p className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#9d9d9d]">
              The Ledger
            </p>
            <p className="text-[12px] font-sans" style={{ color: ACCENT }}>
              Remaining {totalOwed}
             </p>
          </div>

          <div className="divide-y divide-[#e0e0e0]">
            {ledger.map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center justify-between py-5"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-[10px] font-sans text-[#bfbab3] w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-serif text-lg text-[#1a1917]">
                      {entry.name}
                    </p>
                    <p className="text-[10px] font-sans italic text-[#8f8b85] mt-0.5">
                      prayers of {entry.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjust(entry.key, -1)}
                    disabled={entry.owed <= 0}
                    className="w-7 h-7 rounded-full border border-[#dcd7cf] text-[#8f8b85] hover:border-[#d98e4a] hover:text-[#d98e4a] transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-30 disabled:hover:border-[#dcd7cf] disabled:hover:text-[#8f8b85]"
                    aria-label={`Decrease ${entry.name}`}
                  >
                    −
                  </button>
                  <span className="font-serif text-xl text-[#1a1917] w-8 text-center tabular-nums">
                    {entry.owed}
                  </span>
                  <button
                    onClick={() => adjust(entry.key, 1)}
                    className="w-7 h-7 rounded-full border border-[#dcd7cf] text-[#8f8b85] hover:border-[#d98e4a] hover:text-[#d98e4a] transition-all duration-300 flex items-center justify-center text-sm"
                    aria-label={`Increase ${entry.name}`}
                  >
                    +
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-[11px] font-sans text-[#8f8b85] mt-8 leading-relaxed">
            Adjust freely. The ledger remembers. Each repayment brings you
            closer to zero — not as a deadline, but as a homecoming.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
