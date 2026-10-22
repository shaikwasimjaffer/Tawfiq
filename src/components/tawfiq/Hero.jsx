import React from "react";
import { motion } from "framer-motion";

// Hero — keep the visual language (warm light, hairlines, serif, device).
// Improve product communication: within five seconds, understand what Tawfiq is.
// The device shows ONE meaningful workflow (the Qaza journey) rather than a dashboard.

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#F7F5F1] overflow-hidden flex items-center">
      {/* Single source of natural light — top left, like morning sun through a window */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(253,247,237,1) 0%, rgba(247,245,241,0) 55%)",
        }}
      />
      {/* Hairline architectural lines — only vertical, very faint */}
      <div className="absolute inset-0 flex justify-center pointer-events-none opacity-[0.035]">
        <div className="w-full max-w-[1400px] grid grid-cols-6 h-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-r border-stone-900 h-full last:border-r-0"
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 w-full pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left — typographic statement, now with a clear product sentence */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="text-[11px] font-sans tracking-[0.25em] uppercase text-stone-400 mb-8"
            >
              بِسْمِ اللَّهِ — A companion for the consistent Muslim
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15,
              }}
              className="font-serif text-[clamp(2.75rem,7.5vw,7rem)] leading-[0.98] tracking-[-0.02em] text-stone-900"
            >
              Become consistent
              <br />
              <span className="italic font-light text-stone-500">
                in your worship.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.7 }}
              className="mt-8 max-w-md text-[15px] md:text-base font-sans text-stone-500 leading-relaxed"
            >
              Tawfiq brings Salah, Qaza management, Quran reading, and gentle AI
              guidance into one calm experience — so returning feels natural,
              never like a debt.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
              className="mt-10 flex items-center gap-8"
            >
              <a
                href="https://tawfiq.base44.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3"
              >
                <span className="font-sans text-sm text-stone-900 tracking-wide">
                  Open the app
                </span>
                <span className="w-10 h-px bg-stone-900 group-hover:w-16 transition-all duration-500" />
              </a>
            </motion.div>
          </div>

          {/* Right — the app, showing one focused workflow: the Qaza journey to zero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="lg:col-span-5 order-1 lg:order-2 flex justify-center"
          >
            <div className="relative w-full max-w-[300px]">
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-stone-900/10 blur-2xl rounded-full" />
              <div className="relative w-full aspect-[9/19] bg-[#1a1816] rounded-[44px] p-2.5 shadow-[0_30px_80px_-20px_rgba(28,25,23,0.25)]">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1816] rounded-full z-20" />
                <div className="w-full h-full rounded-[36px] bg-[#FBF9F5] overflow-hidden flex flex-col pt-10 pb-6 px-5 select-none">
                  {/* Header — minimal */}
                  <div className="mb-6">
                    <p className="text-[8px] font-sans tracking-[0.2em] uppercase text-stone-400">
                      Qaza
                    </p>
                    <p className="font-serif text-lg text-stone-900 leading-none mt-1">
                      The journey home
                    </p>
                  </div>

                  {/* Progress ring — repayment progress, journey toward zero */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg
                        viewBox="0 0 120 120"
                        className="w-full h-full -rotate-90"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="#E7E2D9"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="#b45309"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="339.29"
                          initial={{ strokeDashoffset: 339.29 }}
                          animate={{ strokeDashoffset: 339.29 * (1 - 0.826) }}
                          transition={{
                            duration: 1.8,
                            delay: 1.2,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="font-serif text-3xl text-stone-900 leading-none tabular-nums">
                          23
                        </p>
                        <p className="text-[8px] font-sans tracking-[0.15em] uppercase text-stone-400 mt-1">
                          remaining
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] font-sans text-stone-500 mt-4 text-center leading-relaxed px-4">
                      <span className="text-stone-800 font-medium">
                        109 cleared.
                      </span>
                      <br />
                      Walking toward zero, gently.
                    </p>
                  </div>

                  {/* Single nudge — one meaningful action */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 2 }}
                    className="mt-4 pt-4 border-t border-stone-200/60 text-center"
                  >
                    <p className="text-[8px] font-sans tracking-[0.15em] uppercase text-amber-700/80 font-semibold">
                      Today
                    </p>
                    <p className="text-[11px] font-sans text-stone-600 mt-1 leading-relaxed">
                      Complete one Qaza prayer.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-stone-400">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-stone-300"
        />
      </motion.div>
    </section>
  );
}
