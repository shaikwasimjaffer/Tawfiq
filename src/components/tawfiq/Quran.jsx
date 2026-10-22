import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

// Quran — the reading experience itself, not a feature list.
// Real, continuous recitation that plays. Tajweed highlighting, translation,
// resume reading, and reading progress — all communicated through the interface.

// Tajweed markup: madd (prolongation) in amber, ghunnah (nasalization) in emerald.
const Tajweed = ({ segments }) => (
  <>
    {segments.map((s, i) => (
      <span
        key={i}
        className={
          s.type === "madd"
            ? "text-amber-700"
            : s.type === "ghunnah"
              ? "text-emerald-700"
              : ""
        }
      >
        {s.text}
      </span>
    ))}
  </>
);

const ayahs = [
  {
    n: 1,
    segments: [
      { text: "بِسْمِ " },
      { type: "madd", text: "ٱللَّهِ" },
      { text: " " },
      { type: "madd", text: "ٱلرَّحْمَٰنِ" },
      { text: " " },
      { type: "madd", text: "ٱلرَّحِيمِ" },
    ],
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
  },
  {
    n: 2,
    segments: [
      { text: "ٱلْحَمْدُ " },
      { type: "madd", text: "لِلَّهِ" },
      { text: " رَبِّ " },
      { type: "madd", text: "ٱلْعَٰلَمِينَ" },
    ],
    translation: "[All] praise is [due] to Allah, Lord of the worlds.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3",
  },
  {
    n: 3,
    segments: [
      { type: "madd", text: "ٱلرَّحْمَٰنِ" },
      { text: " " },
      { type: "madd", text: "ٱلرَّحِيمِ" },
    ],
    translation: "The Entirely Merciful, the Especially Merciful.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3",
  },
  {
    n: 4,
    segments: [
      { type: "madd", text: "مَٰلِكِ" },
      { text: " يَوْمِ " },
      { type: "ghunnah", text: "ٱلدِّينِ" },
    ],
    translation: "Sovereign of the Day of Recompense.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3",
  },
  {
    n: 5,
    segments: [{ text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" }],
    translation: "It is You we worship and You we ask for help.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3",
  },
  {
    n: 6,
    segments: [
      { text: "ٱهْدِنَا " },
      { type: "madd", text: "ٱلصِّرَٰطَ" },
      { text: " " },
      { type: "madd", text: "ٱلْمُسْتَقِيمَ" },
    ],
    translation: "Guide us to the straight path.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3",
  },
  {
    n: 7,
    segments: [
      { type: "madd", text: "صِرَٰطَ" },
      { text: " " },
      { type: "ghunnah", text: "ٱلَّذِينَ" },
      { text: " أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا " },
      { type: "madd", text: "ٱلضَّآلِّينَ" },
    ],
    translation:
      "The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3",
  },
];

export default function Quran() {
  const [current, setCurrent] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const audioRef = useRef(null);

  const overall = Math.min(
    ((current - 1 + progress) / ayahs.length) * 100,
    100,
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.src = ayahs[current - 1].audio;
      audio.play().catch(() => {});
    } else if (!audio.paused) {
      audio.pause();
    }
  }, [isPlaying, current]);

  const handleEnded = () => {
    if (current < ayahs.length) {
      setProgress(0);
      setCurrent((c) => c + 1); // isPlaying stays true → next ayah plays
    } else {
      setIsPlaying(false);
      setStarted(false);
      setProgress(0);
      setCurrent(1);
    }
  };

  const handleTime = () => {
    const a = audioRef.current;
    if (a && a.duration) setProgress(a.currentTime / a.duration);
  };

  const toggle = () => {
    if (!isPlaying) {
      setStarted(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const resumeLabel = started && !isPlaying && current > 1;

  return (
    <section
      id="quran"
      className="relative bg-[#F7F5F1] py-32 md:py-44 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(253,247,237,0.6) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 md:mb-20">
          <div className="lg:col-span-3">
            <p className="text-[11px] font-sans tracking-[0.2em] uppercase text-stone-400">
              02 — Quran
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-9"
          >
            <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] text-stone-900">
              Read the way
              <br />
              <span className="italic font-light text-stone-500">
                it was meant to be read.
              </span>
            </h2>
          </motion.div>
        </div>

        {/* The reader — the application interface communicates everything */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-stone-200/60 overflow-hidden shadow-[0_20px_60px_-30px_rgba(28,25,23,0.2)]">
            {/* Reading progress — a thin line at the top */}
            <div className="h-[3px] w-full bg-stone-100">
              <motion.div
                className="h-full bg-amber-600/80"
                animate={{ width: `${overall}%` }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
            </div>

            <div className="p-8 md:p-12">
              {/* Surah header */}
              <div className="flex items-baseline justify-between mb-10 pb-6 border-b border-stone-200/60">
                <div>
                  <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-stone-400">
                    Surah
                  </p>
                  <p className="font-serif text-2xl text-stone-900 mt-1">
                    Al-Fatiha
                  </p>
                  <p className="text-[12px] font-sans text-stone-400 mt-0.5 italic">
                    The Opening · 7 verses
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Tajweed legend */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px] font-sans text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-700" />
                      Madd
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700" />
                      Ghunnah
                    </span>
                  </div>
                  <button
                    onClick={() => setShowTranslation((s) => !s)}
                    className={`text-[10px] font-sans tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                      showTranslation
                        ? "border-stone-300 text-stone-700 bg-stone-50"
                        : "border-stone-200 text-stone-400"
                    }`}
                  >
                    Translation
                  </button>
                </div>
              </div>

              {/* Arabic — flowing, with tajweed highlighting; current ayah highlighted */}
              <div dir="rtl" className="space-y-6">
                {ayahs.map((a) => {
                  const active = a.n === current;
                  return (
                    <div
                      key={a.n}
                      className={`rounded-xl px-4 py-3 -mx-4 transition-all duration-700 ${
                        active && isPlaying
                          ? "bg-amber-50/70"
                          : "bg-transparent"
                      }`}
                    >
                      <p
                        className={`font-arabic leading-[2.1] transition-all duration-500 ${
                          active
                            ? "text-stone-900 text-[clamp(1.6rem,4vw,2.4rem)]"
                            : "text-stone-700 text-[clamp(1.4rem,3.5vw,2rem)]"
                        }`}
                      >
                        <Tajweed segments={a.segments} />
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-1 align-middle rounded-full border border-stone-300 text-[11px] font-sans text-stone-400 not-italic">
                          {a.n}
                        </span>
                      </p>
                      {showTranslation && (
                        <p
                          className={`font-serif italic font-light mt-2 transition-all duration-500 text-left ${
                            active
                              ? "text-stone-700 text-base"
                              : "text-stone-400 text-sm"
                          }`}
                          dir="ltr"
                        >
                          {a.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Resume reading indicator */}
              {resumeLabel && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center text-[11px] font-sans tracking-[0.15em] uppercase text-amber-700/70"
                >
                  Continue from Ayah {current}
                </motion.p>
              )}
            </div>

            {/* Control bar — a calm premium audio experience */}
            <div className="flex items-center justify-between gap-4 px-8 md:px-12 py-6 border-t border-stone-200/60 bg-stone-50/40">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-stone-50 transition-all duration-300 hover:bg-stone-800 active:scale-95"
                  aria-label={
                    isPlaying ? "Pause recitation" : "Play recitation"
                  }
                >
                  {isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} className="ml-0.5" />
                  )}
                </button>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-sans text-stone-500">
                    {isPlaying
                      ? "Reciting — Mishary Alafasy"
                      : resumeLabel
                        ? `Resume from Ayah ${current}`
                        : "Begin recitation"}
                  </p>
                  <p className="text-[10px] font-sans text-stone-400 mt-0.5 tracking-wide">
                    Continuous · Tajweed · Translation
                  </p>
                </div>
              </div>
              <p className="font-serif text-sm text-stone-500 tabular-nums">
                Ayah <span className="text-stone-900">{current}</span> of{" "}
                {ayahs.length}
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] font-sans text-stone-400 mt-8 leading-relaxed max-w-md mx-auto">
            Press play to listen. The recitation flows verse by verse, lighting
            each line as it is read. Close the app, and tomorrow it remembers
            where you stopped.
          </p>
        </motion.div>
      </div>

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTime}
        preload="none"
      />
    </section>
  );
}
