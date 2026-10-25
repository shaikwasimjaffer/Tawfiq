import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPersonalizedVerseRecommendations,
  recordRecommendationDisplayed,
  cleanVerseText,
} from "@/lib/verseRecommendationService";

/**
 * Authentic Quran Verses for Daily Reflection & Remembrance
 * Sourced directly from verified Sahih International translation in /quran-data/chapters/
 * Preserved for curated fallback and verification suites.
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
    translation: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
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
    translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
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
    translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
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
    translation: "O you who have believed, remember Allah with much remembrance and glorify Him morning and afternoon.",
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
    translation: "And when your Lord proclaimed, 'If you are grateful, I will surely increase you in favor; but if you deny, indeed, My punishment is severe.'",
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
    translation: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
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
    translation: "Establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",
    reference: "Surah Al-'Ankabut [29:45]",
  },
];

export default function DailyVerseCarousel({ verses: explicitVerses = null }) {
  // Retrieve personalized verse recommendations based on user's authentic reading history
  const [personalizedList, setPersonalizedList] = useState(() => {
    if (explicitVerses && explicitVerses.length > 0) return explicitVerses;
    return getPersonalizedVerseRecommendations();
  });

  // Re-sync recommendations when component mounts or gains focus
  useEffect(() => {
    if (explicitVerses && explicitVerses.length > 0) {
      setPersonalizedList(explicitVerses);
    } else {
      setPersonalizedList(getPersonalizedVerseRecommendations());
    }
  }, [explicitVerses]);

  const activeVerses = useMemo(() => {
    return personalizedList.length > 0 ? personalizedList : DAILY_QURAN_VERSES;
  }, [personalizedList]);

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

  const totalVerses = activeVerses.length;
  const currentVerse = activeVerses[currentIndex % totalVerses] || activeVerses[0];

  // Record that this recommendation was displayed (for repetition penalty only)
  useEffect(() => {
    if (currentVerse?.id) {
      recordRecommendationDisplayed(currentVerse.id);
    }
  }, [currentVerse?.id]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalVerses);
  }, [totalVerses]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalVerses) % totalVerses);
  }, [totalVerses]);

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

  // Animation variants: restrained, smooth crossfade and subtle horizontal glide
  const slideVariants = {
    enter: (dir) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 32 : -32,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.25 },
      },
    },
    exit: (dir) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -32 : 32,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.18 },
      },
    }),
  };

  // Stripped cleaned texts (ensures no quotation marks surround Arabic or English)
  const cleanArabic = cleanVerseText(currentVerse.arabic);
  const cleanTranslation = cleanVerseText(currentVerse.translation);

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Quran and Hadith Reflections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-[#FAF8F3] rounded-[22px] p-5 sm:p-6 border border-[#EBE4D5] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
    >
      {/* Subtle top controls bar without category badge or numeric position counter */}
      <div className="flex items-center justify-end gap-1 mb-2">
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? "Resume auto rotation" : "Pause auto rotation"}
          className="w-7 h-7 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#134D37]/40 cursor-pointer"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous reflection"
          className="w-7 h-7 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#134D37]/40 cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next reflection"
          className="w-7 h-7 rounded-full hover:bg-[#EFE9DF] text-[#77766F] hover:text-[#134D37] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#134D37]/40 cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Content Hierarchy: 1. Complete Arabic Text -> 2. English Translation -> 3. Accurate Reference */}
      <div className="min-h-[115px] sm:min-h-[125px] flex flex-col justify-center relative">
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
            {/* 1. Arabic Text (Quranic / Hadith) */}
            <p
              dir="rtl"
              lang="ar"
              className="text-[20px] sm:text-[22px] font-bold text-[#134D37] leading-[1.8] tracking-normal max-w-full"
              style={{
                fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif",
              }}
            >
              {cleanArabic}
            </p>

            {/* 2. English Translation without quotation marks */}
            <p className="text-[14px] sm:text-[15px] font-serif text-stone-700 leading-relaxed max-w-md mx-auto mt-2.5 text-center">
              {cleanTranslation}
            </p>

            {/* 3. Authentic Source Reference Attribution */}
            <p className="text-[11px] font-sans font-semibold text-[#827D74] mt-2.5 uppercase tracking-wider">
              {currentVerse.reference}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
