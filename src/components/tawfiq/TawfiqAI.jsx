import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, ShieldCheck, Compass, ArrowRight, CheckCircle2 } from "lucide-react";

const SAMPLE_PROMPTS = [
  {
    category: "Overslept Prayer",
    prompt: "I missed Fajr because I overslept. What should I do now?",
    badge: "Bukhari #583",
  },
  {
    category: "College Routine",
    prompt: "I keep missing Salah because of my college schedule. How can I improve?",
    badge: "Quran 4:103",
  },
  {
    category: "Family Ethics",
    prompt: "I got angry and spoke badly to my parents. What should I do?",
    badge: "Quran 17:23",
  },
  {
    category: "Renewing Tawbah",
    prompt: "I made a mistake, repented, and then repeated it. What should I do?",
    badge: "Quran 39:53",
  },
];

export default function TawfiqAI() {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState(SAMPLE_PROMPTS[0].prompt);

  const handleLaunchChat = (query) => {
    const q = query || selectedPrompt;
    navigate(`/mentor?q=${encodeURIComponent(q)}`, { state: { animatedEntry: true } });
  };

  return (
    <section
      id="tawfiq-ai"
      className="relative bg-[#F7F5F1] py-32 md:py-44 overflow-hidden border-t border-stone-200/40"
    >
      {/* Subtle radial illumination */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 25%, rgba(253,247,237,0.7) 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#9d9d9d] mb-10 flex items-center justify-center gap-2"
        >
          <Sparkles size={13} className="text-emerald-700" />
          <span>03 — Tawfiq AI</span>
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.05] tracking-[-0.01em] text-[#1a1a1a]"
        >
          Scripture-grounded wisdom,
          <br />
          <span className="italic font-light text-[#8a8a8a]">
            gentle personal guidance.
          </span>
        </motion.h2>

        {/* Body Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-serif text-[15px] md:text-base text-[#666666] leading-[1.9] max-w-2xl mx-auto mt-10"
        >
          Every spiritual question deserves authentic evidence. Tawfiq AI retrieves directly
          from 6,236 Quranic verses and 50,884 canonical Hadith narrations, distinguishing explicit
          scripture from scholarly interpretation—while helping you build a compassionate, sustainable
          Salah and Qaza recovery routine.
        </motion.p>

        {/* Three Pillar Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <BookOpen size={16} />
            </div>
            <h3 className="font-serif text-lg text-stone-900 mb-2">Authentic Evidence First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every citation links directly to canonical Quran and Hadith collections. Zero fabricated grades or hallucinated texts.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <Compass size={16} />
            </div>
            <h3 className="font-serif text-lg text-stone-900 mb-2">Personalized Coaching</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Understands your actual prayer streak and Qaza balance, offering realistic daily plans and encouraging progress without shame.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center mb-4">
              <ShieldCheck size={16} />
            </div>
            <h3 className="font-serif text-lg text-stone-900 mb-2">Honest Boundaries</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Never claims fatwa authority. Identifies recognized scholarly disagreement (*Ikhtilaf*) and escalates complex legal disputes to local scholars.
            </p>
          </div>
        </motion.div>

        {/* Interactive Prompt Showcase & Launcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-sm max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-sans tracking-wider uppercase text-stone-400 font-semibold">
              Explore Live Real-World Queries
            </span>
            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Multi-turn Memory Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left mb-6">
            {SAMPLE_PROMPTS.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPrompt(sp.prompt)}
                className={`p-3.5 rounded-xl border text-xs transition-all flex flex-col justify-between gap-2 ${
                  selectedPrompt === sp.prompt
                    ? "bg-emerald-50/70 border-emerald-600 text-emerald-950 shadow-2xs font-medium"
                    : "bg-[#FAFAFA] border-stone-200/80 text-stone-700 hover:border-stone-300"
                }`}
              >
                <span>"{sp.prompt}"</span>
                <span className="text-[10px] text-stone-400 font-mono self-start uppercase tracking-wider">
                  {sp.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-500 text-center sm:text-left">
              Powered by Google Gemini 3.8 Flash & Grounded Hybrid RAG.
            </p>
            <button
              onClick={() => handleLaunchChat(selectedPrompt)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium tracking-wide transition-all shadow-sm group"
            >
              <span>Ask Tawfiq AI</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
