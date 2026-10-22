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
  Clock,
  BookOpen,
  Volume2,
  Info,
  Play,
  Pause,
  Repeat,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  ThumbsUp,
  Video,
  PlayCircle,
  Trophy,
  BookMarked,
  Star,
  GraduationCap,
  Map,
  Scale,
  Palette,
  Users,
} from "lucide-react";

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

// --- Data Categories ---
const CATEGORIES = [
  {
    title: "Salah",
    icon: Landmark,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    title: "Purification",
    icon: Droplet,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Quran",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "Hadith",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  { title: "Duas", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
  {
    title: "Ramadan",
    icon: Moon,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  { title: "Hajj", icon: Map, color: "text-stone-600", bg: "bg-stone-100" },
  {
    title: "Prophets",
    icon: Star,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    title: "Seerah",
    icon: BookMarked,
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
  { title: "Aqeedah", icon: Scale, color: "text-cyan-600", bg: "bg-cyan-100" },
  {
    title: "Fiqh",
    icon: Landmark,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    title: "Tajweed",
    icon: Palette,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-100",
  },
  { title: "Manners", icon: Users, color: "text-pink-600", bg: "bg-pink-100" },
];

// --- Highly Detailed, Convert-Friendly Database ---
const MOCK_TOPICS = {
  Salah: [
    {
      id: "salah-fajr-fard",
      title: "Fajr Fard (Obligatory)",
      desc: "The 2 obligatory units of the morning prayer, recited aloud.",
      time: "7 min",
      stepsCount: 11,
      difficulty: "beginner",
      video:
        "https://dummyimage.com/800x400/0f172a/10b981.png&text=▶+Watch+Fajr+Demonstration",
      steps: [
        {
          title: "Intention (Niyyah)",
          text: "Stand facing the Qiblah. Intend in your heart to pray the 2 Fard Rakats of Fajr. (You do not need to say it aloud).",
          arabic: "نويت أن أصلي ركعتي الفرض من صلاة الفجر",
          transliteration:
            "Nawaytu an usalliya rak'atay al-fard min salat al-fajr",
          translation:
            "I intend to pray the 2 obligatory Rakats of Fajr prayer.",
        },
        {
          title: "Opening Takbeer",
          text: "Raise your hands to your earlobes (men) or shoulders (women). Say the opening phrase to enter the prayer.",
          arabic: "الله أكبر",
          transliteration: "Allāhu Akbar",
          translation: "Allah is the Greatest",
        },
        {
          title: "Standing (Qiyam) & Fatihah",
          text: "Place your right hand over your left on your chest. Recite Surah Al-Fatihah aloud.",
          arabic: "الحمد لله رب العالمين...",
          transliteration: "Alḥamdu lillāhi rabbil-'ālamīn...",
          translation: "All praise is due to Allah, Lord of the worlds...",
          note: "Beginner Tip: If you haven't memorized this yet, you can read from a paper or repeat 'Subhanallah' until you learn it.",
        },
        {
          title: "Bowing (Ruku)",
          text: "Say 'Allahu Akbar' and bow down. Keep your back straight, hands on knees. Say this 3 times:",
          arabic: "سبحان ربي العظيم",
          transliteration: "Subḥāna Rabbiyal-'Aẓīm",
          translation: "Glory be to my Lord, the Greatest",
        },
        {
          title: "Rising from Ruku",
          text: "Stand back up straight. Say the first phrase while rising, and the second when fully standing.",
          arabic: "سمع الله لمن حمده. ربنا ولك الحمد.",
          transliteration: "Sami'allāhu liman ḥamidah. Rabbanā wa lakal-ḥamd.",
          translation:
            "Allah hears those who praise Him. Our Lord, to You is all praise.",
        },
        {
          title: "First Prostration (Sujood)",
          text: "Say 'Allahu Akbar' and go down. Forehead, nose, palms, knees, and toes must touch the floor. Say 3 times:",
          arabic: "سبحان ربي الأعلى",
          transliteration: "Subḥāna Rabbiyal-A'lā",
          translation: "Glory be to my Lord, the Most High",
        },
        {
          title: "Sitting (Jalsah)",
          text: "Say 'Allahu Akbar' and sit up on your knees. Pause and seek forgiveness.",
          arabic: "رب اغفر لي",
          transliteration: "Rabbighfir lī",
          translation: "My Lord, forgive me.",
        },
        {
          title: "Second Prostration (Sujood)",
          text: "Say 'Allahu Akbar' and prostrate again. Say 'Subhana Rabbiyal-A'la' 3 times.",
        },
        {
          title: "Second Rakat",
          text: "Say 'Allahu Akbar', stand up, and repeat the recitation, bowing, and prostrating just like the first Rakat.",
        },
        {
          title: "Final Sitting (Tashahhud)",
          text: "After the second prostration of the 2nd Rakat, remain sitting. Recite the Tashahhud and blessings on the Prophet.",
          arabic: "التحيات لله والصلوات والطيبات...",
          transliteration: "At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt...",
          translation:
            "All greetings, prayers, and pure words are due to Allah...",
        },
        {
          title: "Conclusion (Tasleem)",
          text: "Turn your head to the right and say the greeting of peace, then turn to the left and repeat it.",
          arabic: "السلام عليكم ورحمة الله",
          transliteration: "As-salāmu 'alaykum wa raḥmatullāh",
          translation: "May the peace and mercy of Allah be upon you",
        },
      ],
      mistakes: [
        "Moving too fast and not pausing between positions (lack of Khushu).",
        "Not keeping the back flat and straight during Ruku.",
        "Forehead or nose not touching the ground during Sujood.",
        "Looking around instead of looking at the place of prostration.",
      ],
      sunnahs: [
        "Raise your hands when going into Ruku and rising from it.",
        "Say 'Ameen' aloud after reciting Surah Al-Fatihah.",
        "Keep your eyes fixed on the spot where your forehead will touch.",
      ],
      summaryTable: [
        {
          pos: "Opening",
          arabic: "الله أكبر",
          trans: "Allahu Akbar",
          mean: "Allah is the Greatest",
        },
        {
          pos: "Ruku",
          arabic: "سبحان ربي العظيم",
          trans: "Subḥāna Rabbiyal-'Aẓīm",
          mean: "Glory be to my Lord, the Great",
        },
        {
          pos: "Rising",
          arabic: "سمع الله لمن حمده",
          trans: "Samiʿallāhu liman ḥamidah",
          mean: "Allah hears those who praise Him",
        },
        {
          pos: "Standing",
          arabic: "ربنا ولك الحمد",
          trans: "Rabbanā wa lakal-ḥamd",
          mean: "Our Lord, to You belongs all praise",
        },
        {
          pos: "Sujood",
          arabic: "سبحان ربي الأعلى",
          trans: "Subḥāna Rabbiyal-Aʿlā",
          mean: "Glory be to my Lord, the High",
        },
        {
          pos: "Sitting",
          arabic: "رب اغفر لي",
          trans: "Rabbighfir lī",
          mean: "My Lord, forgive me",
        },
        {
          pos: "Tasleem",
          arabic: "السلام عليكم ورحمة الله",
          trans: "As-salāmu ʿalaykum wa raḥmatullāh",
          mean: "Peace and mercy be upon you",
        },
      ],
    },
    {
      id: "salah-fajr-sunnah",
      title: "Fajr Sunnah",
      desc: "The 2 highly recommended units before Fajr Fard.",
      time: "5 min",
      stepsCount: 8,
      difficulty: "beginner",
    },
    {
      id: "salah-dhuhr-fard",
      title: "Dhuhr Fard",
      desc: "The 4 obligatory midday units, recited silently.",
      time: "10 min",
      stepsCount: 15,
      difficulty: "intermediate",
    },
    {
      id: "salah-dhuhr-sunnah",
      title: "Dhuhr Sunnah",
      desc: "4 Rakats before and 2 Rakats after Dhuhr Fard.",
      time: "12 min",
      stepsCount: 15,
      difficulty: "intermediate",
    },
    {
      id: "salah-asr-fard",
      title: "Asr Fard",
      desc: "The 4 obligatory afternoon units.",
      time: "10 min",
      stepsCount: 15,
      difficulty: "intermediate",
    },
    {
      id: "salah-maghrib-fard",
      title: "Maghrib Fard",
      desc: "The 3 obligatory sunset units.",
      time: "8 min",
      stepsCount: 13,
      difficulty: "intermediate",
    },
    {
      id: "salah-isha-fard",
      title: "Isha Fard",
      desc: "The 4 obligatory night units.",
      time: "10 min",
      stepsCount: 15,
      difficulty: "intermediate",
    },
    {
      id: "salah-witr",
      title: "Witr Prayer",
      desc: "The final odd-numbered prayer of the night.",
      time: "6 min",
      stepsCount: 12,
      difficulty: "advanced",
    },
    {
      id: "salah-tahajjud",
      title: "Tahajjud",
      desc: "The voluntary night prayer for immense reward.",
      time: "15 min",
      stepsCount: 8,
      difficulty: "advanced",
    },
  ],
  Purification: [
    {
      id: "wudu-basics",
      title: "How to perform Wudu",
      desc: "Step-by-step guide to minor ablution.",
      time: "4 min",
      stepsCount: 8,
      difficulty: "beginner",
      steps: [
        {
          title: "Intention & Bismillah",
          text: "Intend to purify yourself.",
          arabic: "بسم الله",
          transliteration: "Bismillah",
          translation: "In the name of Allah",
        },
        { title: "Wash Hands", text: "Wash up to wrists 3 times." },
      ],
    },
    {
      id: "ghusl-basics",
      title: "How to perform Ghusl",
      desc: "The full ritual bath.",
      time: "6 min",
      stepsCount: 5,
      difficulty: "beginner",
    },
  ],
  default: [
    {
      id: "default-1",
      title: "Introduction Guide",
      desc: "Select a topic to begin learning.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
    },
  ],
};

// --- Helper Components ---

// Individual Step Card with Expandable Arabic
function InteractiveStepCard({ step, index, isActive, onComplete }) {
  const [showArabic, setShowArabic] = useState(false);

  return (
    <div
      className={`relative flex flex-col pl-14 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-50"}`}
    >
      <button
        onClick={onComplete}
        className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ring-4 ring-background shadow-sm transition-colors ${isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-primary/20"}`}
      >
        {isActive ? <CheckCircle2 size={20} /> : index + 1}
      </button>

      <div
        className={`bg-card border ${isActive ? "border-primary shadow-md" : "border-border"} rounded-3xl p-5 transition-all`}
      >
        <h3 className="font-bold text-foreground text-lg mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {step.text}
        </p>

        {step.note && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3">
            <Info
              size={18}
              className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-amber-900 dark:text-amber-200 text-sm font-medium">
              {step.note}
            </p>
          </div>
        )}

        {(step.arabic || step.translation) && (
          <div className="mt-4">
            <button
              onClick={() => setShowArabic(!showArabic)}
              className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 mb-2 hover:underline"
            >
              {showArabic ? "▼ Hide Arabic & Audio" : "▶ Show Arabic & Audio"}
            </button>

            {showArabic && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 animate-in slide-in-from-top-2 fade-in">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Volume2 size={12} /> Say
                  </span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-200 hover:scale-105 active:scale-95 transition-transform">
                      <Play size={14} className="ml-0.5" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:scale-105 active:scale-95 transition-transform">
                      <Repeat size={14} />
                    </button>
                  </div>
                </div>

                {step.arabic && (
                  <p className="text-3xl font-arabic text-right text-emerald-900 dark:text-emerald-100 mb-4 leading-relaxed">
                    {step.arabic}
                  </p>
                )}
                {step.transliteration && (
                  <p className="font-bold text-sm text-foreground mb-1">
                    {step.transliteration}
                  </p>
                )}
                {step.translation && (
                  <p className="text-sm text-muted-foreground italic">
                    "{step.translation}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Progress State
  const [completedLessons, setCompletedLessons] = useLocalStorage(
    "tawfiq_completed_lessons",
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

  // Active step tracker for checklists
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Computed Search across ALL topics if searching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    let results = [];
    Object.keys(MOCK_TOPICS).forEach((cat) => {
      MOCK_TOPICS[cat].forEach((topic) => {
        if (
          topic.title.toLowerCase().includes(q) ||
          topic.desc.toLowerCase().includes(q)
        ) {
          results.push({ ...topic, categoryName: cat });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // Handlers
  const openCategory = (category) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTopic = (topic, categoryName) => {
    setSelectedTopic(topic);
    setActiveStepIndex(0);
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

  const getDifficultyColor = (level) => {
    if (level === "beginner")
      return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200";
    if (level === "intermediate")
      return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200";
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header / Breadcrumbs */}
      <div className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-6 py-5">
          {selectedCategory || selectedTopic ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in">
              <button
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full hover:bg-muted transition-colors active:scale-95 flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                  <span>Learn</span>
                  {selectedCategory && (
                    <>
                      <span>›</span>
                      <span className="truncate">{selectedCategory.title}</span>
                    </>
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-foreground truncate mt-0.5">
                  {selectedTopic ? selectedTopic.title : "Topics"}
                </h1>
              </div>

              {/* Bookmark Button in Header */}
              {selectedTopic && (
                <button
                  onClick={() => toggleBookmark(selectedTopic.id)}
                  className="ml-auto w-10 h-10 flex items-center justify-center bg-secondary rounded-full text-foreground hover:text-primary transition-colors"
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
            <div className="animate-in fade-in">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                Learn
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Master your faith, step by step.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        {/* --- LAYER 3: THE LESSON VIEW --- */}
        {selectedTopic ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            {/* Video Placeholder */}
            {selectedTopic.video && (
              <div className="relative w-full h-48 bg-slate-900 rounded-3xl overflow-hidden shadow-lg group cursor-pointer">
                <img
                  src={selectedTopic.video}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Meta Data */}
            <div className="flex flex-wrap gap-2">
              <div
                className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${getDifficultyColor(selectedTopic.difficulty)}`}
              >
                <Star size={12} className="fill-current" />{" "}
                {selectedTopic.difficulty}
              </div>
              <div className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> {selectedTopic.time}
              </div>
              <div className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered size={12} /> {selectedTopic.steps?.length || 0}{" "}
                Steps
              </div>
            </div>

            {/* Steps List (Interactive Checklist) */}
            {selectedTopic.steps ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {selectedTopic.steps.map((step, idx) => (
                  <InteractiveStepCard
                    key={idx}
                    step={step}
                    index={idx}
                    isActive={idx <= activeStepIndex}
                    onComplete={() =>
                      setActiveStepIndex(Math.max(activeStepIndex, idx + 1))
                    }
                  />
                ))}
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
            {selectedTopic.sunnahs && (
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

            {/* Mistakes Card */}
            {selectedTopic.mistakes && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 mt-4">
                <h3 className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-4">
                  <AlertCircle size={18} /> Common Mistakes
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

            {/* Quick Reference Summary Table */}
            {selectedTopic.summaryTable && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden mt-8 shadow-sm">
                <div className="bg-secondary p-4 border-b border-border">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <BookOpen size={16} /> What to Say Quick Reference
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Position</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Arabic
                        </th>
                        <th className="px-4 py-3 font-semibold">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedTopic.summaryTable.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {row.pos}
                          </td>
                          <td className="px-4 py-3 text-right font-arabic text-lg text-primary">
                            {row.arabic}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {row.mean}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quiz Placeholder */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-3xl p-6 mt-8 flex flex-col items-center text-center">
              <Trophy size={32} className="text-indigo-500 mb-3" />
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg mb-1">
                Test Your Knowledge
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                Take a 5-question quiz to lock in what you've learned.
              </p>
              <button className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                Start Quiz
              </button>
            </div>

            {/* Completion Button */}
            <button
              onClick={finishLesson}
              className={`w-full mt-8 font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md ${completedLessons.includes(selectedTopic.id) ? "bg-secondary text-primary border border-primary/30" : "bg-primary hover:bg-primary/90 text-white"}`}
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
          /* --- LAYER 2: CATEGORY "TABLE OF CONTENTS" VIEW --- */
          <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="px-2 mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <ListOrdered size={16} /> Syllabus
              </h2>
            </div>
            <div className="space-y-3">
              {(MOCK_TOPICS[selectedCategory.title] || MOCK_TOPICS.default).map(
                (topic, idx) => {
                  const isDone = completedLessons.includes(topic.id);
                  return (
                    <button
                      key={idx}
                      onClick={() => openTopic(topic)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.98] transition-all duration-300 text-left group relative overflow-hidden"
                    >
                      {/* Completion indicator line */}
                      {isDone && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                      )}

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold transition-colors ${isDone ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}
                      >
                        {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-base truncate ${isDone ? "text-primary" : "text-foreground"}`}
                        >
                          {topic.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs font-medium text-muted-foreground">
                          <span
                            className={`px-2 py-0.5 rounded border ${getDifficultyColor(topic.difficulty).split(" ")[0]} border-current/20`}
                          >
                            {topic.difficulty}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {topic.time}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        ) : (
          /* --- LAYER 1: MAIN DASHBOARD VIEW --- */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Global Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prayers, steps, topics..."
                className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={16} className="rotate-180" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery ? (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-4 px-1">
                  Search Results
                </h2>
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedCategory(
                            CATEGORIES.find(
                              (c) => c.title === topic.categoryName,
                            ) || CATEGORIES[0],
                          );
                          openTopic(topic, topic.categoryName);
                        }}
                        className="w-full bg-card border border-border rounded-2xl p-4 text-left shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs text-primary font-bold mb-1 uppercase">
                            {topic.categoryName}
                          </p>
                          <p className="font-bold text-foreground">
                            {topic.title}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground"
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
                      No exact matches
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Beginner Roadmap Banner */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Map size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap size={16} className="text-emerald-400" />
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                        Start Here
                      </p>
                    </div>
                    <h2 className="text-2xl font-black mb-4">
                      Beginner Roadmap
                    </h2>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {["① Purity", "② Salah", "③ Duas", "④ Quran"].map(
                        (step, i) => (
                          <span
                            key={i}
                            className="flex-shrink-0 bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                          >
                            {step}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Continue Learning / Recent */}
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
                          openTopic(
                            MOCK_TOPICS[cat.title].find(
                              (t) => t.id === recentLesson.id,
                            ),
                          );
                        }
                      }}
                      className="w-full bg-card border border-primary/30 rounded-3xl p-5 text-left shadow-md flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs text-primary font-bold uppercase mb-1">
                          {recentLesson.category}
                        </p>
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {recentLesson.title}
                        </p>
                      </div>
                      <PlayCircle
                        size={28}
                        className="text-primary group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                )}

                {/* 14 Categories Grid */}
                <div>
                  <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 px-1">
                    Knowledge Library
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.title}
                        onClick={() => openCategory(category)}
                        className="bg-card border border-border rounded-3xl p-5 text-left hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-300 group"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl ${category.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4`}
                        >
                          <category.icon size={22} className={category.color} />
                        </div>
                        <h3 className="font-bold text-base text-foreground leading-tight">
                          {category.title}
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          Explore courses
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
