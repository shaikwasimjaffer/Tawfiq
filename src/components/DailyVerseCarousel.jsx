import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Authentic Quran Verses for Daily Reflection & Remembrance
 * Sourced directly from verified Sahih International translation in /quran-data/chapters/
 */
export const DAILY_QURAN_VERSES = [
  {
    id: "4:103",
    surahNumber: 4,
    surahName: "An-Nisa",
    surahArabic: "النساء",
    ayahNumber: 103,
    theme: "Prayer & Remembrance",
    arabic: "فَإِذَا قَضَيۡتُمُ ٱلصَّلَوٰةَ فَٱذۡكُرُواْ ٱللَّهَ قِيَٰمٗا وَقُعُودٗا وَعَلَىٰ جُنُوبِكُمۡۚ فَإِذَا ٱطۡمَأۡنَنتُمۡ فَأَقِيمُواْ ٱلصَّلَوٰةَۚ إِنَّ ٱلصَّلَوٰةَ كَانَتۡ عَلَى ٱلۡمُؤۡمِنِينَ كِتَٰبٗا مَّوۡقُوتٗا",
    translation: "“Indeed, prayer has been decreed upon the believers a decree of specified times.”",
    fullTranslation: "And when you have completed the prayer, remember Allah standing, sitting, or [lying] on your sides. But when you become secure, re-establish [regular] prayer. Indeed, prayer has been decreed upon the believers a decree of specified times.",
    reference: "Surah An-Nisa [4:103]",
  },
  {
    id: "13:28",
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    surahArabic: "الرعد",
    ayahNumber: 28,
    theme: "Peace of Heart",
    arabic: "ٱلَّذِينَ ءَامَنُواْ وَتَطۡمَئِنُّ قُلُوبُهُم بِذِكۡرِ ٱللَّهِۗ أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ",
    translation: "“Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.”",
    reference: "Surah Ar-Ra'd [13:28]",
  },
  {
    id: "2:152",
    surahNumber: 2,
    surahName: "Al-Baqarah",
    surahArabic: "البقرة",
    ayahNumber: 152,
    theme: "Remembrance & Gratitude",
    arabic: "فَٱذۡكُرُونِيٓ أَذۡكُرۡكُمۡ وَٱشۡكُرُواْ لِي وَلَا تَكۡفُرُونِ",
    translation: "“So remember Me; I will remember you. And be grateful to Me and do not deny Me.”",
    reference: "Surah Al-Baqarah [2:152]",
  },
  {
    id: "33:41-42",
    surahNumber: 33,
    surahName: "Al-Ahzab",
    surahArabic: "الأحزاب",
    ayahNumber: "41-42",
    theme: "Abundant Dhikr",
    arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱذۡكُرُواْ ٱللَّهَ ذِكۡرٗا كَثِيرٗا وَسَبِّحُوهُ بُكۡرَةٗ وَأَصِيلًا",
    translation: "“O you who have believed, remember Allah with much remembrance and glorify Him morning and afternoon.”",
    reference: "Surah Al-Ahzab [33:41-42]",
  },
  {
    id: "14:7",
    surahNumber: 14,
    surahName: "Ibrahim",
    surahArabic: "إبراهيم",
    ayahNumber: 7,
    theme: "Gratitude & Blessing",
    arabic: "وَإِذۡ تَأَذَّنَ رَبُّكُمۡ لَئِن شَكَرۡتُمۡ لَأَزِيدَنَّكُمۡۖ وَلَئِن كَفَرۡتُمۡ إِنَّ عَذَابِي لَشَدِيدٞ",
    translation: "“And [remember] when your Lord proclaimed, 'If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.'”",
    reference: "Surah Ibrahim [14:7]",
  },
  {
    id: "2:153",
    surahNumber: 2,
    surahName: "Al-Baqarah",
    surahArabic: "البقرة",
    ayahNumber: 153,
    theme: "Patience & Prayer",
    arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱسۡتَعِينُواْ بِٱلصَّبۡرِ وَٱلصَّلَوٰةِۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
    translation: "“O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.”",
    reference: "Surah Al-Baqarah [2:153]",
  },
  {
    id: "29:45",
    surahNumber: 29,
    surahName: "Al-'Ankabut",
    surahArabic: "العنكبوت",
    ayahNumber: 45,
    theme: "Worship & Reflection",
    arabic: "ٱتۡلُ مَآ أُوحِيَ إِلَيۡكَ مِنَ ٱلۡكِتَٰبِ وَأَقِمِ ٱلصَّلَوٰةَۖ إِنَّ ٱلصَّلَوٰةَ تَنۡهَىٰ عَنِ ٱلۡفَحۡشَآءِ وَٱلۡمُنكَرِۗ وَلَذِكۡرُ ٱللَّهِ أَكۡبَرُۗ وَٱللَّهُ يَعۡلَمُ مَا تَصۡنَعُونَ",
    translation: "“Establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.”",
    reference: "Surah Al-'Ankabut [29:45]",
  },
];

export default function DailyVerseCarousel({ verses = DAILY_QURAN_VERSES }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [isPaused, setIsPaused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Swipe detection coordinates
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchMoveXRef = useRef(null);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const totalVerses = verses.length;
  const currentVerse = verses[currentIndex] || verses[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalVerses);
  }, [totalVerses]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalVerses) % totalVerses);
  }, [totalVerses]);

  const handleGoTo = useCallback((index) => {
    setDirection(index >= currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Comfortable reading interval: 9 seconds
  useEffect(() => {
    if (isPaused || isUserInteracting || prefersReducedMotion) return;

    const timer = setInterval(() => {
      handleNext();
    }, 9000);

    return () => clearInterval(timer);
  }, [isPaused, isUserInteracting, prefersReducedMotion, handleNext]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchMoveXRef.current = e.touches[0].clientX;
    setIsUserInteracting(true);
  };

  const handleTouchMove = (e) => {
    touchMoveXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchMoveXRef.current !== null) {
      const diffX = touchStartXRef.current - touchMoveXRef.current;
      const threshold = 45; // Minimum px for swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchMoveXRef.current = null;
    setTimeout(() => setIsUserInteracting(false), 800);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 320, damping: 32 },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.28 },
      },
    },
    exit: (dir) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -40 : 40,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 320, damping: 32 },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.2 },
      },
    }),
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Daily Quran Verse Reflections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-[#FAF8F3] rounded-[22px] p-4 sm:p-5 border border-[#EBE4D5] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
    >
      {/* Top Bar: Theme Badge + Slide Counter + Prev/Next Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#134D37] bg-[#E3EDE6] px-2.5 py-0.5 rounded-full tracking-wide">
            {currentVerse.theme}
          </span>
          <span className="text-[11px] text-[#8C857B] font-medium tabular-nums">
            {currentIndex + 1} of {totalVerses}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Resume auto rotation" : "Pause auto rotation"}
            className="w-6 h-6 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous verse"
            className="w-6 h-6 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next verse"
            className="w-6 h-6 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Slide Content: Arabic + English Verse + Authentic Citation */}
      <div className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-center relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentVerse.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full text-center flex flex-col items-center select-text"
          >
            {/* Arabic Quranic Ayah */}
            <p
              dir="rtl"
              lang="ar"
              className="text-[19px] sm:text-[21px] font-bold text-[#134D37] leading-relaxed tracking-normal max-w-full"
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
            >
              {currentVerse.arabic}
            </p>

            {/* Verified English Translation */}
            <p className="text-[13.5px] sm:text-[14.5px] font-serif text-stone-700 leading-relaxed max-w-sm mx-auto mt-2 text-center">
              {currentVerse.translation}
            </p>

            {/* Surah Reference Attribution */}
            <p className="text-[11px] font-sans font-semibold text-[#827D74] mt-2.5 uppercase tracking-wider">
              {currentVerse.reference}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Position Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
        {verses.map((v, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => handleGoTo(idx)}
              aria-label={`Go to verse ${idx + 1}: ${v.surahName} [${v.ayahNumber}]`}
              aria-current={isActive ? "true" : undefined}
              className={`transition-all duration-300 rounded-full focus:outline-none ${
                isActive
                  ? "w-4 h-1.5 bg-[#134D37]"
                  : "w-1.5 h-1.5 bg-[#DED6C7] hover:bg-[#B3A996]"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
