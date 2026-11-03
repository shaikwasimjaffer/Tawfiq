import React, { useState, useMemo, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import {
  Search,
  Droplet,
  Waves,
  Landmark,
  Moon,
  Heart,
  ChevronLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  ListOrdered,
  BookOpen,
  Volume2,
  Info,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  ThumbsUp,
  PlayCircle,
  Trophy,
  BookMarked,
  GraduationCap,
  Map,
  Scale,
  Palette,
  Users,
  Award,
  Layers,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

import { SALAH_CURRICULUM } from "../data/salahCurriculumData";
import YouTubeLessonPlayer from "../components/learn/YouTubeLessonPlayer";
import AudioStepPlayer from "../components/learn/AudioStepPlayer";
import SalahQuizModal from "../components/learn/SalahQuizModal";
import HadithCollectionsView from "../components/learn/HadithCollectionsView";

// --- Custom Hook for Local Storage ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

// --- Data Categories with Dynamic Counts & Arabic Headings ---
const CATEGORIES = [
  {
    title: "Salah",
    arabic: "الصلاة",
    icon: Landmark,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    countText: "12 Lessons",
    desc: "Complete daily prayers breakdown",
  },
  {
    title: "Purification",
    arabic: "الطهارة",
    icon: Droplet,
    color: "text-blue-600",
    bg: "bg-blue-100",
    countText: "2 Guides",
    desc: "Step-by-step Wudu & Ghusl",
  },
  {
    title: "Quran",
    arabic: "القرآن الكريم",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-100",
    countText: "Tajweed & Rules",
    desc: "Recitation & foundational rules",
  },
  {
    title: "Hadith",
    arabic: "الحديث النبوي",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    countText: "50,884 Hadiths",
    desc: "17 Canonical collections",
  },
  {
    title: "Duas",
    arabic: "الأدعية",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-100",
    countText: "Daily Adhkar",
    desc: "Morning, evening & prayer duas",
  },
  {
    title: "Ramadan",
    arabic: "رمضان والصيام",
    icon: Moon,
    color: "text-purple-600",
    bg: "bg-purple-100",
    countText: "Fasting Guide",
    desc: "Rules, intentions & Taraweeh",
  },
  {
    title: "Hajj",
    arabic: "الحج والعمرة",
    icon: Map,
    color: "text-stone-600",
    bg: "bg-stone-100",
    countText: "Pilgrimage Steps",
    desc: "Ihram, Tawaf & Sa'i rites",
  },
  {
    title: "Prophets",
    arabic: "قصص الأنبياء",
    icon: BookMarked,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    countText: "Prophetic Stories",
    desc: "From Adam (AS) to Isa (AS)",
  },
  {
    title: "Seerah",
    arabic: "السيرة النبوية",
    icon: BookMarked,
    color: "text-teal-600",
    bg: "bg-teal-100",
    countText: "Life of the Prophet ﷺ",
    desc: "Makkan & Madinan periods",
  },
  {
    title: "Aqeedah",
    arabic: "العقيدة",
    icon: Scale,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    countText: "Tawheed & Faith",
    desc: "Six Pillars of Iman",
  },
  {
    title: "Fiqh",
    arabic: "الفقه الإسلامي",
    icon: Landmark,
    color: "text-orange-600",
    bg: "bg-orange-100",
    countText: "Practical Rulings",
    desc: "Authentic jurisprudence",
  },
  {
    title: "Tajweed",
    arabic: "أحكام التجويد",
    icon: Palette,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-100",
    countText: "Pronunciation Rules",
    desc: "Makharij & articulation points",
  },
  {
    title: "Manners",
    arabic: "الأخلاق والآداب",
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-100",
    countText: "Adab & Character",
    desc: "Islamic etiquette & dealings",
  },
];

// Fallback topics for other categories
const OTHER_TOPICS = {
  Purification: [
    {
      id: "wudu-basics",
      title: "How to perform Wudu (Ablution)",
      desc: "Step-by-step authentic minor ablution guide according to the Sunnah.",
      totalRakahs: 1,
      youtubeId: "8b7g5J2Y84M",
      steps: [
        {
          rakah: 1,
          title: "Intention & Bismillah",
          text: "Intend purification in your heart and begin by pronouncing the name of Allah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
          translation: "In the name of Allah, Most Gracious, Most Merciful.",
        },
        {
          rakah: 1,
          title: "Wash Hands Three Times",
          text: "Wash both hands completely up to the wrists three times, ensuring water passes between fingers.",
        },
        {
          rakah: 1,
          title: "Rinse Mouth & Sniff Water into Nose",
          text: "Rinse the mouth thoroughly three times. Sniff water into the nostrils and blow it out gently three times.",
        },
        {
          rakah: 1,
          title: "Wash the Entire Face Three Times",
          text: "Wash the face three times from forehead hairline to chin, and ear to ear.",
        },
        {
          rakah: 1,
          title: "Wash Arms to the Elbows Three Times",
          text: "Wash the right arm including the elbow three times, then the left arm three times.",
        },
        {
          rakah: 1,
          title: "Wipe Head & Ears (Masah)",
          text: "Wipe wet hands from front of hair to back and return, then wipe inside and outside of ears with index fingers and thumbs once.",
        },
        {
          rakah: 1,
          title: "Wash Feet to the Ankles Three Times",
          text: "Wash right foot up to and including the ankle three times, then left foot three times, cleaning between toes.",
        },
      ],
    },
    {
      id: "ghusl-basics",
      title: "How to perform Ghusl (Full Bath)",
      desc: "The complete ritual purification bath according to the Sunnah.",
      totalRakahs: 1,
      steps: [
        {
          rakah: 1,
          title: "Intention (Niyyah)",
          text: "Intend in the heart to remove ritual impurity for the sake of Allah.",
        },
        {
          rakah: 1,
          title: "Wash Hands & Private Parts",
          text: "Wash both hands, then wash private areas thoroughly with clean water.",
        },
        {
          rakah: 1,
          title: "Perform Complete Wudu",
          text: "Perform standard Wudu as for prayer.",
        },
        {
          rakah: 1,
          title: "Pour Water Over Head & Entire Body",
          text: "Pour water over head three times ensuring roots of hair are wet, then wash right side of body, then left side, leaving no spot dry.",
        },
      ],
    },
  ],
  Duas: [
    {
      id: "dua-morning-evening",
      title: "Essential Morning & Evening Adhkar",
      desc: "Authentic daily remembrances for protection, blessings, and peace.",
      totalRakahs: 1,
      steps: [
        {
          rakah: 1,
          title: "Ayat al-Kursi (Surah Al-Baqarah 2:255)",
          text: "Recited after every prayer and in the morning/evening for divine protection.",
          arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
          transliteration: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudhuhū sinatuw-wa lā nawm...",
          translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.",
        },
        {
          rakah: 1,
          title: "Sayyidul Istighfar (Master of Forgiveness)",
          text: "The supreme supplication of repentance taught by the Prophet ﷺ.",
          arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
          transliteration: "Allāhumma anta Rabbī lā ilāha illā anta, khalaqtanī wa anā 'abduka...",
          translation: "O Allah, You are my Lord; there is none worthy of worship except You. You created me and I am Your servant...",
        },
      ],
    },
  ],
  Quran: [
    {
      id: "quran-fatihah-mastery",
      title: "Surah Al-Fatihah Mastery & Tajweed",
      desc: "Perfect the recitation of the Pillar of Salah verse by verse.",
      totalRakahs: 1,
      steps: [
        {
          rakah: 1,
          title: "Verse 1: Bismillah",
          text: "Begin with calm articulation of the 'Ha' in Allah and smooth 'R' in Ar-Rahman.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        },
        {
          rakah: 1,
          title: "Verse 2: Al-Hamdulillah",
          text: "Clear pronunciation of the throat letter 'Ḥa' (ح) in Al-Hamdu.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          transliteration: "Al-ḥamdu lillāhi Rabbil-'ālamīn",
          translation: "All praise is due to Allah, Lord of the worlds.",
        },
      ],
    },
  ],
  default: [
    {
      id: "default-1",
      title: "Introduction Guide",
      desc: "Select a topic from the library to begin learning.",
      totalRakahs: 1,
      steps: [
        {
          rakah: 1,
          title: "Getting Started",
          text: "Tawfiq provides comprehensive, authentic Islamic knowledge step by step.",
        },
      ],
    },
  ],
};

// --- Fully Accessible Step Card with Copy Action & Visual Polish ---
function InteractiveStepCard({
  step,
  index,
  genderTrack,
  isCompleted,
  onToggleComplete,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = [
      step.arabic || "",
      step.transliteration || "",
      step.translation ? `"${step.translation}"` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.clipboard && textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex flex-col pl-14 transition-all duration-200">
      {/* Clickable step circle — users can tap to toggle completion */}
      <button
        onClick={onToggleComplete}
        title={isCompleted ? "Mark incomplete" : "Mark step complete"}
        className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ring-4 ring-background shadow-sm transition-all active:scale-95 cursor-pointer ${
          isCompleted
            ? "bg-primary text-white shadow-primary/20"
            : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
        }`}
      >
        {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
      </button>

      {/* Step Content Container — Always 100% visible and accessible */}
      <div
        className={`bg-card border ${
          isCompleted ? "border-primary/50 shadow-sm" : "border-border"
        } rounded-3xl p-5 transition-all space-y-4`}
      >
        {/* Step Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Step {index + 1}
            </span>
            {step.rakah && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                Rak'ah {step.rakah}
              </span>
            )}
          </div>
          <h3 className="font-bold text-foreground text-lg">{step.title}</h3>
        </div>

        {/* Step Detailed Text */}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-medium">
          {step.text}
        </p>

        {/* Dynamic Gender Posture Notes */}
        {genderTrack === "women" && step.womenNote && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🧕</span>
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block mb-0.5">
                Women's Posture Guide:
              </span>
              <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                {step.womenNote}
              </p>
            </div>
          </div>
        )}

        {genderTrack === "men" && step.menNote && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">👨</span>
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block mb-0.5">
                Men's Posture Guide:
              </span>
              <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                {step.menNote}
              </p>
            </div>
          </div>
        )}

        {/* General Note if present */}
        {step.note && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3">
            <Info
              size={18}
              className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-amber-900 dark:text-amber-200 text-xs font-medium leading-relaxed">
              {step.note}
            </p>
          </div>
        )}

        {/* Arabic Text & Audio Player — Permanently Displayed Without Hide/Unhide */}
        {(step.arabic || step.translation) && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 space-y-4">
            {/* Header row with Audio Player & Copy Button */}
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/40 dark:border-emerald-900/40 pb-3">
              <AudioStepPlayer
                arabicText={step.arabic}
                transliteration={step.transliteration}
                audioUrl={step.audioUrl}
              />
              <button
                onClick={handleCopy}
                title="Copy Arabic & translation"
                className="px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
              >
                {copied ? (
                  <Check size={12} className="text-emerald-700" />
                ) : (
                  <Copy size={12} />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Arabic Script */}
            {step.arabic && (
              <p className="text-2xl sm:text-3xl font-arabic text-right text-emerald-950 dark:text-emerald-100 leading-loose pt-1">
                {step.arabic}
              </p>
            )}

            {/* Transliteration */}
            {step.transliteration && (
              <div className="border-t border-emerald-200/40 dark:border-emerald-900/40 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  Transliteration
                </span>
                <p className="font-semibold text-xs sm:text-sm text-foreground">
                  {step.transliteration}
                </p>
              </div>
            )}

            {/* Translation */}
            {step.translation && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">
                  Meaning
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                  "{step.translation}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Learn Component ---
export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Men / Women Learning Track Selector (Persisted in localStorage)
  const [genderTrack, setGenderTrack] = useLocalStorage(
    "tawfiq_learn_gender_track",
    "men",
  );

  // Rak'ah Selector Filter inside multi-rak'ah lesson detail
  const [selectedRakahFilter, setSelectedRakahFilter] = useState("all");

  // Quiz Modal State & Score persistence
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizScore, setQuizScore] = useLocalStorage(
    "tawfiq_salah_quiz_score",
    null,
  );

  // Lesson Progress State
  const [completedLessons, setCompletedLessons] = useLocalStorage(
    "tawfiq_completed_lessons",
    [],
  );
  const [completedStepIds, setCompletedStepIds] = useLocalStorage(
    "tawfiq_completed_steps",
    [],
  );
  const [bookmarkedLessons, setBookmarkedLessons] = useLocalStorage(
    "tawfiq_bookmarked_lessons",
    [],
  );
  const [recentLesson, setRecentLesson] = useLocalStorage(
    "tawfiq_recent_lesson",
    null,
  );

  // Get current topics list for selected category
  const currentCategoryTopics = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory.title === "Salah") {
      return SALAH_CURRICULUM;
    }
    return OTHER_TOPICS[selectedCategory.title] || OTHER_TOPICS.default;
  }, [selectedCategory]);

  // Category completion metrics
  const categoryCompletion = useMemo(() => {
    if (!selectedCategory || !currentCategoryTopics.length) return null;
    const doneCount = currentCategoryTopics.filter((t) =>
      completedLessons.includes(t.id),
    ).length;
    const total = currentCategoryTopics.length;
    const percent = Math.round((doneCount / total) * 100);
    return { doneCount, total, percent };
  }, [selectedCategory, currentCategoryTopics, completedLessons]);

  // Global Search across all topics
  const allTopics = useMemo(() => {
    const list = [];
    SALAH_CURRICULUM.forEach((t) => {
      list.push({ ...t, categoryName: "Salah" });
    });
    Object.keys(OTHER_TOPICS).forEach((cat) => {
      OTHER_TOPICS[cat].forEach((t) => {
        list.push({ ...t, categoryName: cat });
      });
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTopics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.desc?.toLowerCase().includes(q) ||
        topic.steps?.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.text.toLowerCase().includes(q) ||
            s.transliteration?.toLowerCase().includes(q),
        ),
    );
  }, [searchQuery, allTopics]);

  // Calculate dynamic progress for recent lesson card
  const recentLessonProgress = useMemo(() => {
    if (!recentLesson) return null;
    let topic = null;
    if (recentLesson.category === "Salah") {
      topic = SALAH_CURRICULUM.find((t) => t.id === recentLesson.id);
    } else {
      const catTopics =
        OTHER_TOPICS[recentLesson.category] || OTHER_TOPICS.default;
      topic = catTopics.find((t) => t.id === recentLesson.id);
    }
    if (!topic || !topic.steps || topic.steps.length === 0) return null;

    const totalSteps = topic.steps.length;
    const completedCount = topic.steps.filter((s, idx) => {
      const stepId = `${topic.id}-step-${s.rakah || 1}-${idx}`;
      return completedStepIds.includes(stepId);
    }).length;

    const percentage = Math.round((completedCount / totalSteps) * 100);
    return {
      topic,
      totalSteps,
      completedCount,
      percentage,
    };
  }, [recentLesson, completedStepIds]);

  // Handlers
  const openCategory = (category) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTopic = (topic, categoryName) => {
    setSelectedTopic(topic);
    setSelectedRakahFilter("all");
    setRecentLesson({
      id: topic.id,
      title: topic.title,
      category: categoryName || selectedCategory?.title,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (selectedTopic) setSelectedTopic(null);
    else setSelectedCategory(null);
  };

  const toggleBookmark = (id) => {
    if (bookmarkedLessons.includes(id)) {
      setBookmarkedLessons(bookmarkedLessons.filter((l) => l !== id));
    } else {
      setBookmarkedLessons([...bookmarkedLessons, id]);
    }
  };

  const finishLesson = () => {
    if (!completedLessons.includes(selectedTopic.id)) {
      setCompletedLessons([...completedLessons, selectedTopic.id]);
    }
    goBack();
  };

  const toggleStepCompletion = (stepIdentifier) => {
    if (completedStepIds.includes(stepIdentifier)) {
      setCompletedStepIds(
        completedStepIds.filter((id) => id !== stepIdentifier),
      );
    } else {
      setCompletedStepIds([...completedStepIds, stepIdentifier]);
    }
  };

  // Filter steps by selected Rak'ah filter if specified
  const displayedSteps = useMemo(() => {
    if (!selectedTopic || !selectedTopic.steps) return [];
    if (selectedRakahFilter === "all") return selectedTopic.steps;
    return selectedTopic.steps.filter((s) => s.rakah === selectedRakahFilter);
  }, [selectedTopic, selectedRakahFilter]);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header / Breadcrumbs */}
      <div className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-5 py-4">
          {selectedCategory || selectedTopic ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in">
              <button
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full hover:bg-muted transition-colors active:scale-95 flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>

              <div className="min-w-0 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                  <span>Learn</span>
                  {selectedCategory && (
                    <>
                      <span>›</span>
                      <span className="truncate">{selectedCategory.title}</span>
                    </>
                  )}
                </div>
                <h1 className="text-lg font-black tracking-tight text-foreground truncate mt-0.5">
                  {selectedTopic
                    ? selectedTopic.title
                    : selectedCategory?.title === "Hadith"
                    ? "Hadith Library"
                    : "Topics"}
                </h1>
              </div>

              {/* Men / Women Learning Track Selector Toggle in Topics Header */}
              {!selectedTopic && selectedCategory?.title === "Salah" && (
                <div className="flex items-center bg-secondary p-1 rounded-2xl border border-border shadow-sm flex-shrink-0 ml-auto">
                  <button
                    onClick={() => setGenderTrack("men")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      genderTrack === "men"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>👨</span>
                    <span>Men</span>
                  </button>
                  <button
                    onClick={() => setGenderTrack("women")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      genderTrack === "women"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>🧕</span>
                    <span>Women</span>
                  </button>
                </div>
              )}

              {/* Bookmark Button in Lesson Detail Header */}
              {selectedTopic && (
                <button
                  onClick={() => toggleBookmark(selectedTopic.id)}
                  className="ml-auto w-10 h-10 flex items-center justify-center bg-secondary rounded-full text-foreground hover:text-primary transition-colors flex-shrink-0"
                >
                  {bookmarkedLessons.includes(selectedTopic.id) ? (
                    <BookmarkCheck
                      size={18}
                      className="text-primary fill-primary/20"
                    />
                  ) : (
                    <Bookmark size={18} />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Learn
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Master your faith, step by step.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <GraduationCap size={22} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        {/* --- LAYER 3: THE LESSON VIEW --- */}
        {selectedTopic ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            {/* Real Working YouTube Video Player */}
            <YouTubeLessonPlayer
              videoId={selectedTopic.youtubeId}
              title={selectedTopic.title}
            />

            {/* Prayer Subtitle & Active Track Pill */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {selectedTopic.type || "Salah Lesson"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTopic.desc}
                </p>
              </div>

              {/* Track Badge */}
              <button
                onClick={() =>
                  setGenderTrack(genderTrack === "men" ? "women" : "men")
                }
                className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs font-bold text-foreground flex items-center gap-1.5 hover:bg-muted transition-colors flex-shrink-0"
              >
                <span>{genderTrack === "men" ? "👨 Men" : "🧕 Women"}</span>
              </button>
            </div>

            {/* Rak'ah Selector Tabs for Prayers with Multiple Units */}
            {selectedTopic.totalRakahs > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} /> Filter by Rak'ah
                  </span>
                  <span>
                    {selectedRakahFilter === "all"
                      ? `All ${selectedTopic.totalRakahs} Rak'ahs`
                      : `Viewing Rak'ah ${selectedRakahFilter}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  <button
                    onClick={() => setSelectedRakahFilter("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedRakahFilter === "all"
                        ? "bg-primary text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Steps ({selectedTopic.steps?.length || 0})
                  </button>

                  {Array.from({ length: selectedTopic.totalRakahs }).map(
                    (_, i) => {
                      const rakahNum = i + 1;
                      return (
                        <button
                          key={rakahNum}
                          onClick={() => setSelectedRakahFilter(rakahNum)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            selectedRakahFilter === rakahNum
                              ? "bg-primary text-white shadow-sm"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Rak'ah {rakahNum}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* Steps List — 100% Accessible, No Lock, Always Visible */}
            {displayedSteps.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {displayedSteps.map((step, idx) => {
                  const stepId = `${selectedTopic.id}-step-${step.rakah || 1}-${idx}`;
                  const isDone = completedStepIds.includes(stepId);

                  return (
                    <InteractiveStepCard
                      key={idx}
                      step={step}
                      index={idx}
                      genderTrack={genderTrack}
                      isCompleted={isDone}
                      onToggleComplete={() => toggleStepCompletion(stepId)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-3xl">
                <FileText
                  size={32}
                  className="mx-auto text-muted-foreground/50 mb-3"
                />
                <p className="font-bold">Content arriving soon.</p>
              </div>
            )}

            {/* Sunnah Tips Card */}
            {selectedTopic.sunnahs && selectedTopic.sunnahs.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-6 mt-8">
                <h3 className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-4">
                  <ThumbsUp size={18} /> Sunnah Tips
                </h3>
                <ul className="space-y-3">
                  {selectedTopic.sunnahs.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400"
                    >
                      <span className="mt-0.5">🌿</span> <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes Card */}
            {selectedTopic.mistakes && selectedTopic.mistakes.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 mt-4">
                <h3 className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-4">
                  <AlertCircle size={18} /> Common Mistakes to Avoid
                </h3>
                <ul className="space-y-3">
                  {selectedTopic.mistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400"
                    >
                      <span className="mt-0.5">❌</span> <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive 10-Question Quiz Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-6 mt-8 flex flex-col items-center text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-3">
                <Trophy size={28} />
              </div>
              <h3 className="font-black text-indigo-950 dark:text-indigo-100 text-lg mb-1">
                Test Your Knowledge
              </h3>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300 max-w-xs mb-4">
                Reinforce your understanding with 10 authentic questions covering obligations, postures, and duas.
              </p>

              {quizScore && (
                <div
                  className={`mb-4 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                    quizScore.score === quizScore.total
                      ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200"
                      : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800"
                  }`}
                >
                  {quizScore.score === quizScore.total ? (
                    <>
                      <span>🌟</span>
                      <span>
                        Perfect Score: {quizScore.score} / {quizScore.total} (100%) — Masha'Allah!
                      </span>
                    </>
                  ) : (
                    <>
                      <Award size={15} />
                      <span>
                        Best Score: {quizScore.score} / {quizScore.total} (
                        {Math.round((quizScore.score / quizScore.total) * 100)}%)
                      </span>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsQuizOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 text-sm"
              >
                <Trophy size={16} />
                <span>{quizScore ? "Retake Quiz" : "Start 10-Question Quiz"}</span>
              </button>
            </div>

            {/* Completion Button */}
            <button
              onClick={finishLesson}
              className={`w-full mt-8 font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md ${
                completedLessons.includes(selectedTopic.id)
                  ? "bg-secondary text-primary border border-primary/30"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              <CheckCircle2
                size={20}
                className={
                  completedLessons.includes(selectedTopic.id)
                    ? "fill-primary text-white"
                    : ""
                }
              />
              {completedLessons.includes(selectedTopic.id)
                ? "Marked as Learned"
                : "Mark Complete"}
            </button>
          </div>
        ) : selectedCategory ? (
          /* --- LAYER 2: TOPICS / SYLLABUS LIST VIEW --- */
          selectedCategory.title === "Hadith" ? (
            <HadithCollectionsView onBack={goBack} />
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
              {/* Category Overview & Progress Banner */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <selectedCategory.icon size={18} className="text-emerald-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      {selectedCategory.title} Curriculum
                    </span>
                  </div>
                  <p className="text-base font-black">
                    {categoryCompletion?.doneCount || 0} of {categoryCompletion?.total || 0} Lessons Completed
                  </p>
                  <div className="w-44 bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${categoryCompletion?.percent || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-300">
                    {categoryCompletion?.percent || 0}%
                  </span>
                  <p className="text-[10px] uppercase font-bold text-white/70">
                    Mastery
                  </p>
                </div>
              </div>

              {/* Header info bar */}
              <div className="px-1 flex items-center justify-between pt-1">
                <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                  <ListOrdered size={16} /> Syllabus & Lessons
                </h2>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentCategoryTopics.length} lessons
                </span>
              </div>

              {/* Clean Topics List — Metadata badges removed as requested */}
              <div className="space-y-3">
                {currentCategoryTopics.map((topic, idx) => {
                  const isDone = completedLessons.includes(topic.id);
                  return (
                    <button
                      key={idx}
                      onClick={() => openTopic(topic)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-md active:scale-[0.98] transition-all duration-300 text-left group relative overflow-hidden"
                    >
                      {/* Completion indicator line */}
                      {isDone && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                      )}

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold transition-colors ${
                          isDone
                            ? "bg-primary text-white"
                            : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-base truncate ${
                            isDone ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {topic.title}
                        </p>
                        {topic.type && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {topic.type}
                            {topic.totalRakahs ? ` • ${topic.totalRakahs} Rak'ahs` : ""}
                          </p>
                        )}
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* --- LAYER 1: MAIN DASHBOARD VIEW --- */
          <div className="space-y-7 animate-in fade-in zoom-in-95 duration-300">
            {/* Global Search with Clear Button */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prayers, steps, topics, adhkar..."
                  className="w-full rounded-2xl border border-border bg-card pl-11 pr-10 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Instant Search Recommendation Chips when search is empty */}
              {!searchQuery && (
                <div className="pt-0.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
                      <Sparkles size={12} className="text-emerald-600" /> Quick:
                    </span>
                    {[
                      "Fajr Sunnah",
                      "Wudu Steps",
                      "Dhuhr 12 Rak'ahs",
                      "Ghusl",
                      "Tashahhud",
                      "Sahih Bukhari",
                      "Sayyidul Istighfar",
                    ].map((queryText) => (
                      <button
                        key={queryText}
                        onClick={() => setSearchQuery(queryText)}
                        className="px-3 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all whitespace-nowrap active:scale-95 shadow-xs"
                      >
                        {queryText}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchQuery ? (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-xs font-bold tracking-widest text-primary uppercase">
                    Search Results ({searchResults.length})
                  </h2>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Reset Search
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const targetCat =
                            CATEGORIES.find(
                              (c) => c.title === topic.categoryName,
                            ) || CATEGORIES[0];
                          setSelectedCategory(targetCat);
                          openTopic(topic, topic.categoryName);
                        }}
                        className="w-full bg-card border border-border rounded-2xl p-4 text-left shadow-sm flex items-center justify-between hover:border-primary/40 hover:shadow-md transition-all group"
                      >
                        <div>
                          <p className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                            {topic.categoryName}
                          </p>
                          <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                            {topic.title}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-3xl border border-dashed border-border">
                    <Search
                      size={32}
                      className="mx-auto text-muted-foreground/50 mb-3"
                    />
                    <p className="text-foreground font-bold">
                      No exact matches found for "{searchQuery}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try searching "Fajr", "Wudu", "Bukhari", or "Salah"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Interactive Beginner Roadmap Banner */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Map size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-emerald-400" />
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                          Guided Learning Path
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Recommended
                      </span>
                    </div>

                    <h2 className="text-2xl font-black mb-1">
                      Beginner Roadmap
                    </h2>
                    <p className="text-xs text-white/70 mb-4">
                      Follow the authentic sequence of Islamic practice. Tap any stage to begin:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { step: "① Purity", cat: "Purification", desc: "Wudu & Ghusl" },
                        { step: "② Salah", cat: "Salah", desc: "All 5 Prayers" },
                        { step: "③ Duas", cat: "Duas", desc: "Daily Adhkar" },
                        { step: "④ Quran", cat: "Quran", desc: "Tajweed & Rules" },
                      ].map((item, i) => {
                        const catObj =
                          CATEGORIES.find((c) => c.title === item.cat) ||
                          CATEGORIES[0];
                        return (
                          <button
                            key={i}
                            onClick={() => openCategory(catObj)}
                            className="flex flex-col text-left bg-white/10 hover:bg-emerald-600/30 border border-white/20 hover:border-emerald-400/50 backdrop-blur-sm p-3 rounded-2xl transition-all active:scale-95 group"
                          >
                            <span className="font-extrabold text-xs text-white group-hover:text-emerald-300 flex items-center justify-between">
                              {item.step}
                              <ArrowRight
                                size={12}
                                className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                              />
                            </span>
                            <span className="text-[10px] text-white/60 group-hover:text-white/80 mt-1">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Continue Learning / Recent Lesson with Dynamic Progress Bar */}
                {recentLesson && (
                  <div>
                    <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3 px-1">
                      Jump Back In
                    </h2>
                    <button
                      onClick={() => {
                        const cat = CATEGORIES.find(
                          (c) => c.title === recentLesson.category,
                        );
                        if (cat) {
                          setSelectedCategory(cat);
                          if (cat.title === "Salah") {
                            const found = SALAH_CURRICULUM.find(
                              (t) => t.id === recentLesson.id,
                            );
                            if (found) openTopic(found);
                          } else {
                            const found = (
                              OTHER_TOPICS[cat.title] || OTHER_TOPICS.default
                            ).find((t) => t.id === recentLesson.id);
                            if (found) openTopic(found);
                          }
                        }
                      }}
                      className="w-full bg-card border border-primary/30 rounded-3xl p-5 text-left shadow-md hover:shadow-lg transition-all group space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                            {recentLesson.category}
                          </p>
                          <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {recentLesson.title}
                          </p>
                        </div>
                        <PlayCircle
                          size={28}
                          className="text-primary group-hover:scale-110 transition-transform flex-shrink-0"
                        />
                      </div>

                      {/* Dynamic Progress indicator */}
                      {recentLessonProgress && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1.5">
                            <span>
                              {recentLessonProgress.completedCount} of{" "}
                              {recentLessonProgress.totalSteps} steps completed
                            </span>
                            <span className="text-primary">
                              {recentLessonProgress.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${recentLessonProgress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                )}

                {/* 13 Categories Knowledge Library Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                      Knowledge Library
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                      13 Topics Available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.title}
                        onClick={() => openCategory(category)}
                        className="bg-card border border-border rounded-3xl p-5 text-left hover:-translate-y-1 hover:border-primary/40 hover:shadow-md active:scale-95 transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-12 h-12 rounded-2xl ${category.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                            >
                              <category.icon size={22} className={category.color} />
                            </div>
                            {category.arabic && (
                              <span className="text-sm font-arabic text-muted-foreground/60 group-hover:text-primary transition-colors">
                                {category.arabic}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">
                            {category.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                          <span>{category.countText}</span>
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Interactive 10-Question Salah Quiz Modal */}
      <SalahQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onQuizComplete={(score, total) => {
          setQuizScore({
            score,
            total,
            date: new Date().toISOString(),
          });
        }}
      />

      <BottomNav />
    </div>
  );
}
