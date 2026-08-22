import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Bookmark,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  X,
  ArrowLeft,
  Clock,
  Copy,
  Minus,
  Plus,
  CheckCircle2,
  Hash,
  Repeat,
  Type,
  BookText,
  Volume2,
  Palette,
  ChevronDown,
  Check,
  Settings2,
  SkipBack,
  SkipForward,
  Circle,
  MoreHorizontal,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SectionSwitcher from "@/components/SectionSwitcher";
import BottomNav from "@/components/BottomNav";

// ─── Local storage helpers ───────────────────────────────────────────────────
const LS = {
  get: (k, def) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? def;
    } catch {
      return def;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
const KEY_LAST = "tawfiq_quran_last";
const KEY_BKMK = "tawfiq_quran_bookmarks";
const KEY_PAGES = "tawfiq_quran_pages_log";
const KEY_GOAL = "tawfiq_quran_daily_goal";

// ─── Static Surah & Juz Lists ────────────────────────────────────────────────
const SURAHS = [
  [1, "Al-Fatihah", "The Opening", 7, "Meccan"],
  [2, "Al-Baqarah", "The Cow", 286, "Medinan"],
  [3, "Ali 'Imran", "Family of Imran", 200, "Medinan"],
  [4, "An-Nisa'", "The Women", 176, "Medinan"],
  [5, "Al-Ma'idah", "The Table Spread", 120, "Medinan"],
  [6, "Al-An'am", "The Cattle", 165, "Meccan"],
  [7, "Al-A'raf", "The Heights", 206, "Meccan"],
  [8, "Al-Anfal", "The Spoils of War", 75, "Medinan"],
  [9, "At-Tawbah", "The Repentance", 129, "Medinan"],
  [10, "Yunus", "Jonah", 109, "Meccan"],
  [11, "Hud", "Hud", 123, "Meccan"],
  [12, "Yusuf", "Joseph", 111, "Meccan"],
  [13, "Ar-Ra'd", "The Thunder", 43, "Medinan"],
  [14, "Ibrahim", "Abraham", 52, "Meccan"],
  [15, "Al-Hijr", "The Rocky Tract", 99, "Meccan"],
  [16, "An-Nahl", "The Bee", 128, "Meccan"],
  [17, "Al-Isra'", "The Night Journey", 111, "Meccan"],
  [18, "Al-Kahf", "The Cave", 110, "Meccan"],
  [19, "Maryam", "Mary", 98, "Meccan"],
  [20, "Ta-Ha", "Ta-Ha", 135, "Meccan"],
  [21, "Al-Anbiya'", "The Prophets", 112, "Meccan"],
  [22, "Al-Hajj", "The Pilgrimage", 78, "Medinan"],
  [23, "Al-Mu'minun", "The Believers", 118, "Meccan"],
  [24, "An-Nur", "The Light", 64, "Medinan"],
  [25, "Al-Furqan", "The Criterion", 77, "Meccan"],
  [26, "Ash-Shu'ara'", "The Poets", 227, "Meccan"],
  [27, "An-Naml", "The Ant", 93, "Meccan"],
  [28, "Al-Qasas", "The Stories", 88, "Meccan"],
  [29, "Al-'Ankabut", "The Spider", 69, "Meccan"],
  [30, "Ar-Rum", "The Romans", 60, "Meccan"],
  [31, "Luqman", "Luqman", 34, "Meccan"],
  [32, "As-Sajdah", "The Prostration", 30, "Meccan"],
  [33, "Al-Ahzab", "The Combined Forces", 73, "Medinan"],
  [34, "Saba'", "Sheba", 54, "Meccan"],
  [35, "Fatir", "Originator", 45, "Meccan"],
  [36, "Ya-Sin", "Ya Sin", 83, "Meccan"],
  [37, "As-Saffat", "Those who set the Ranks", 182, "Meccan"],
  [38, "Sad", "The Letter Sad", 88, "Meccan"],
  [39, "Az-Zumar", "The Troops", 75, "Meccan"],
  [40, "Ghafir", "The Forgiver", 85, "Meccan"],
  [41, "Fussilat", "Explained in Detail", 54, "Meccan"],
  [42, "Ash-Shuraa", "The Consultation", 53, "Meccan"],
  [43, "Az-Zukhruf", "The Ornaments of Gold", 89, "Meccan"],
  [44, "Ad-Dukhan", "The Smoke", 59, "Meccan"],
  [45, "Al-Jathiyah", "The Crouching", 37, "Meccan"],
  [46, "Al-Ahqaf", "The Wind-Curved Sandhills", 35, "Meccan"],
  [47, "Muhammad", "Muhammad", 38, "Medinan"],
  [48, "Al-Fath", "The Victory", 29, "Medinan"],
  [49, "Al-Hujurat", "The Rooms", 18, "Medinan"],
  [50, "Qaf", "The Letter Qaf", 45, "Meccan"],
  [51, "Adh-Dhariyat", "The Winnowing Winds", 60, "Meccan"],
  [52, "At-Tur", "The Mount", 49, "Meccan"],
  [53, "An-Najm", "The Star", 62, "Meccan"],
  [54, "Al-Qamar", "The Moon", 55, "Meccan"],
  [55, "Ar-Rahman", "The Beneficent", 78, "Meccan"],
  [56, "Al-Waqi'ah", "The Inevitable", 96, "Meccan"],
  [57, "Al-Hadid", "The Iron", 29, "Medinan"],
  [58, "Al-Mujadila", "The Pleading Woman", 22, "Medinan"],
  [59, "Al-Hashr", "The Exile", 24, "Medinan"],
  [60, "Al-Mumtahanah", "She that is to be examined", 13, "Medinan"],
  [61, "As-Saf", "The Ranks", 14, "Medinan"],
  [62, "Al-Jumu'ah", "The Congregation Friday", 11, "Medinan"],
  [63, "Al-Munafiqun", "The Hypocrites", 11, "Medinan"],
  [64, "At-Taghabun", "The Mutual Disillusion", 18, "Medinan"],
  [65, "At-Talaq", "The Divorce", 12, "Medinan"],
  [66, "At-Tahrim", "The Prohibition", 12, "Medinan"],
  [67, "Al-Mulk", "The Sovereignty", 30, "Meccan"],
  [68, "Al-Qalam", "The Pen", 52, "Meccan"],
  [69, "Al-Haqqah", "The Reality", 52, "Meccan"],
  [70, "Al-Ma'arij", "The Ascending Stairways", 44, "Meccan"],
  [71, "Nuh", "Noah", 28, "Meccan"],
  [72, "Al-Jinn", "The Jinn", 28, "Meccan"],
  [73, "Al-Muzzammil", "The Enshrouded One", 20, "Meccan"],
  [74, "Al-Muddaththir", "The Cloaked One", 56, "Meccan"],
  [75, "Al-Qiyamah", "The Resurrection", 40, "Meccan"],
  [76, "Al-Insan", "The Human", 31, "Medinan"],
  [77, "Al-Mursalat", "The Emissaries", 50, "Meccan"],
  [78, "An-Naba'", "The Tidings", 40, "Meccan"],
  [79, "An-Nazi'at", "Those who drag forth", 46, "Meccan"],
  [80, "'Abasa", "He Frowned", 42, "Meccan"],
  [81, "At-Takwir", "The Overthrowing", 29, "Meccan"],
  [82, "Al-Infitar", "The Cleaving", 19, "Meccan"],
  [83, "Al-Mutaffifin", "The Defrauding", 36, "Meccan"],
  [84, "Al-Inshiqaq", "The Sundering", 25, "Meccan"],
  [85, "Al-Buruj", "The Mansions of the Stars", 22, "Meccan"],
  [86, "At-Tariq", "The Nightcommer", 17, "Meccan"],
  [87, "Al-A'la", "The Most High", 19, "Meccan"],
  [88, "Al-Ghashiyah", "The Overwhelming", 26, "Meccan"],
  [89, "Al-Fajr", "The Dawn", 30, "Meccan"],
  [90, "Al-Balad", "The City", 20, "Meccan"],
  [91, "Ash-Shams", "The Sun", 15, "Meccan"],
  [92, "Al-Layl", "The Night", 21, "Meccan"],
  [93, "Ad-Duha", "The Morning Hours", 11, "Meccan"],
  [94, "Ash-Sharh", "The Relief", 8, "Meccan"],
  [95, "At-Tin", "The Fig", 8, "Meccan"],
  [96, "Al-'Alaq", "The Clot", 19, "Meccan"],
  [97, "Al-Qadr", "The Power", 5, "Meccan"],
  [98, "Al-Bayyinah", "The Clear Proof", 8, "Medinan"],
  [99, "Az-Zalzalah", "The Earthquake", 8, "Medinan"],
  [100, "Al-'Adiyat", "The Courser", 11, "Meccan"],
  [101, "Al-Qari'ah", "The Calamity", 11, "Meccan"],
  [102, "At-Takathur", "The Rivalry in World Increase", 8, "Meccan"],
  [103, "Al-'Asr", "The Declining Day", 3, "Meccan"],
  [104, "Al-Humazah", "The Traducer", 9, "Meccan"],
  [105, "Al-Fil", "The Elephant", 5, "Meccan"],
  [106, "Quraysh", "Quraysh", 4, "Meccan"],
  [107, "Al-Ma'un", "The Small Kindnesses", 7, "Meccan"],
  [108, "Al-Kawthar", "The Abundance", 3, "Meccan"],
  [109, "Al-Kafirun", "The Disbelievers", 6, "Meccan"],
  [110, "An-Nasr", "The Divine Support", 3, "Medinan"],
  [111, "Al-Masad", "The Palm Fibre", 5, "Meccan"],
  [112, "Al-Ikhlas", "Sincerity", 4, "Meccan"],
  [113, "Al-Falaq", "The Daybreak", 5, "Meccan"],
  [114, "An-Nas", "Mankind", 6, "Meccan"],
];

const ARABIC_NAMES = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

const JUZ = [
  [1, 1],
  [2, 142],
  [2, 253],
  [3, 92],
  [4, 24],
  [4, 148],
  [5, 82],
  [6, 111],
  [7, 88],
  [8, 41],
  [9, 93],
  [11, 6],
  [12, 53],
  [15, 1],
  [17, 1],
  [18, 75],
  [21, 1],
  [23, 1],
  [25, 21],
  [27, 56],
  [29, 46],
  [33, 31],
  [36, 28],
  [39, 32],
  [41, 47],
  [46, 1],
  [51, 31],
  [58, 1],
  [67, 1],
  [78, 1],
];

function juzOfAyah(surah, ayah) {
  for (let i = JUZ.length - 1; i >= 0; i--) {
    const [s, a] = JUZ[i];
    if (surah > s || (surah === s && ayah >= a)) return i + 1;
  }
  return 1;
}

const JUZ_META = [
  ["Al-Fatihah", 1, "Al-Baqarah", 141],
  ["Al-Baqarah", 142, "Al-Baqarah", 252],
  ["Al-Baqarah", 253, "Ali 'Imran", 91],
  ["Ali 'Imran", 92, "An-Nisa'", 23],
  ["An-Nisa'", 24, "An-Nisa'", 147],
  ["An-Nisa'", 148, "Al-Ma'idah", 81],
  ["Al-Ma'idah", 82, "Al-An'am", 110],
  ["Al-An'am", 111, "Al-A'raf", 87],
  ["Al-A'raf", 88, "Al-Anfal", 40],
  ["Al-Anfal", 41, "At-Tawbah", 92],
  ["At-Tawbah", 93, "Hud", 5],
  ["Hud", 6, "Yusuf", 52],
  ["Yusuf", 53, "Ibrahim", 52],
  ["Al-Hijr", 1, "An-Nahl", 128],
  ["Al-Isra'", 1, "Al-Kahf", 74],
  ["Al-Kahf", 75, "Ta-Ha", 135],
  ["Al-Anbiya'", 1, "Al-Hajj", 78],
  ["Al-Mu'minun", 1, "Al-Furqan", 20],
  ["Al-Furqan", 21, "An-Naml", 55],
  ["An-Naml", 56, "Al-'Ankabut", 45],
  ["Al-'Ankabut", 46, "Al-Ahzab", 30],
  ["Al-Ahzab", 31, "Ya-Sin", 27],
  ["Ya-Sin", 28, "Az-Zumar", 31],
  ["Az-Zumar", 32, "Fussilat", 46],
  ["Fussilat", 47, "Al-Jathiyah", 37],
  ["Al-Ahqaf", 1, "Adh-Dhariyat", 30],
  ["Adh-Dhariyat", 31, "Al-Hadid", 29],
  ["Al-Mujadila", 1, "At-Tahrim", 12],
  ["Al-Mulk", 1, "Al-Mursalat", 50],
  ["An-Naba'", 1, "An-Nas", 6],
];

const KEY_JUZ_PROGRESS = "tawfiq_juz_progress";
const API = "https://api.alquran.cloud/v1";

async function fetchSurah(number, edition = "en.asad") {
  const [arRes, enRes, transRes] = await Promise.all([
    fetch(`${API}/surah/${number}`).then((r) => r.json()),
    fetch(`${API}/surah/${number}/${edition}`).then((r) => r.json()),
    fetch(`${API}/surah/${number}/en.transliteration`).then((r) => r.json()),
  ]);
  const ar = arRes.data?.ayahs || [];
  const en = enRes.data?.ayahs || [];
  const tr = transRes.data?.ayahs || [];
  return ar.map((v, i) => ({
    number: v.numberInSurah,
    globalNumber: v.number,
    arabic: v.text,
    translation: en[i]?.text || "",
    transliteration: tr[i]?.text || "",
    surahName: arRes.data?.englishName,
    surahNumber: number,
  }));
}

async function fetchJuzData(number, edition = "en.asad") {
  const [arRes, enRes, transRes] = await Promise.all([
    fetch(`${API}/juz/${number}`).then((r) => r.json()),
    fetch(`${API}/juz/${number}/${edition}`).then((r) => r.json()),
    fetch(`${API}/juz/${number}/en.transliteration`).then((r) => r.json()),
  ]);
  const ar = arRes.data?.ayahs || [];
  const en = enRes.data?.ayahs || [];
  const tr = transRes.data?.ayahs || [];
  return ar.map((v, i) => ({
    number: v.numberInSurah,
    globalNumber: v.number,
    arabic: v.text,
    translation: en[i]?.text || "",
    transliteration: tr[i]?.text || "",
    surahName: v.surah.englishName,
    surahNumber: v.surah.number,
  }));
}

const EDITIONS = [
  { id: "en.asad", label: "Asad (English)" },
  { id: "en.sahih", label: "Saheeh Int." },
  { id: "ur.jalandhry", label: "Jalandhry (Urdu)" },
];

const RECITERS = [
  { id: "ar.alafasy", label: "Mishary Alafasy", shortName: "Alafasy" },
  { id: "ar.husary", label: "Mahmoud Al Husary", shortName: "Husary" },
];

const TABS = [
  { id: "read", label: "Read" },
  { id: "hadith", label: "Hadith" },
  { id: "bookmarks", label: "Saved" },
  { id: "insights", label: "Insights" },
];

// ─── Custom Animated Dropdown ────────────────────────────────────────────────
function QuranDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 h-11 px-4 rounded-[16px] border border-[#E8E8E8] bg-white text-[14px] font-medium text-slate-800 hover:bg-slate-50 transition-all text-left focus:outline-none focus:border-[#10b981]"
      >
        <span className="truncate">
          {selectedOption?.label || selectedOption?.name || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-[20px] border border-[#ECECEC] bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] origin-bottom"
          >
            <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 text-[14px] rounded-[14px] transition-all text-left ${
                      isSelected
                        ? "bg-[#ecfdf5] text-[#10b981] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{opt.label || opt.name}</span>
                    {isSelected && (
                      <Check size={16} className="flex-shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function QuranPage() {
  const [tab, setTab] = useState("read");
  const [view, setView] = useState("list");
  const [browseMode, setBrowseMode] = useState("surah");
  const [showSettings, setShowSettings] = useState(false);

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [search, setSearch] = useState("");

  const [bookmarks, setBookmarks] = useState(() => LS.get(KEY_BKMK, []));
  const [edition, setEdition] = useState(() =>
    LS.get("tawfiq_quran_edition", "en.asad"),
  );
  const [reciter, setReciter] = useState(() =>
    LS.get("tawfiq_quran_reciter", "ar.alafasy"),
  );
  const [fontSize, setFontSize] = useState(() =>
    LS.get("tawfiq_quran_fontsize", 26),
  );

  const [showWordByWord, setShowWordByWord] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(() =>
    LS.get("tawfiq_quran_transliteration", false),
  );
  const [showTajweed, setShowTajweed] = useState(() =>
    LS.get("tawfiq_quran_tajweed", false),
  );
  const [readingMode, setReadingMode] = useState(() =>
    LS.get("tawfiq_quran_reading_mode", "translation"),
  );

  const [playingAyah, setPlayingAyah] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => LS.get(KEY_GOAL, 2));

  const audioRef = useRef(null);
  const verseRefs = useRef({});
  const stateRef = useRef({ verses });
  const lastRead = LS.get(KEY_LAST, null);

  const streak = useMemo(() => {
    const pagesLog = LS.get(KEY_PAGES, {});
    let s = 0,
      d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (!pagesLog[k]) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, []);

  useEffect(() => {
    stateRef.current = { verses };
  }, [verses]);

  useEffect(() => {
    if (view === "reader") {
      setLoadingVerses(true);
      const fetcher = selectedSurah
        ? fetchSurah(selectedSurah, edition)
        : fetchJuzData(selectedJuz, edition);
      fetcher
        .then((data) => {
          setVerses(data);
          setLoadingVerses(false);
        })
        .catch(() => setLoadingVerses(false));
    }
  }, [edition, selectedSurah, selectedJuz]);

  const filteredSurahs = useMemo(() => {
    if (!search) return SURAHS;
    const q = search.toLowerCase();
    return SURAHS.filter(
      ([n, ar, en]) =>
        ar.toLowerCase().includes(q) ||
        en.toLowerCase().includes(q) ||
        String(n).includes(q),
    );
  }, [search]);

  async function openSurah(surahNum) {
    setSelectedSurah(surahNum);
    setSelectedJuz(null);
    setView("reader");
    LS.set(KEY_LAST, {
      surah: surahNum,
      ayah: 1,
      name: SURAHS[surahNum - 1][1],
    });

    const today = new Date().toISOString().slice(0, 10);
    const pages = LS.get(KEY_PAGES, {});
    pages[today] =
      (pages[today] || 0) + Math.ceil((SURAHS[surahNum - 1][3] || 10) / 15);
    LS.set(KEY_PAGES, pages);
  }

  async function openJuz(juzNum) {
    setSelectedJuz(juzNum);
    setSelectedSurah(null);
    setView("reader");
  }

  function toggleBookmark(surahNum, ayahNum, ayahText, surahName) {
    const key = `${surahNum}:${ayahNum}`;
    const exists = bookmarks.find((b) => b.key === key);
    let next = exists
      ? bookmarks.filter((b) => b.key !== key)
      : [
          ...bookmarks,
          {
            key,
            surah: surahNum,
            ayah: ayahNum,
            surahName: surahName || SURAHS[surahNum - 1][1],
            text: ayahText || "",
          },
        ];
    setBookmarks(next);
    LS.set(KEY_BKMK, next);
  }

  function playAyah(globalNumber) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingAyah === globalNumber && audioPlaying) {
      setPlayingAyah(null);
      setAudioPlaying(false);
      return;
    }

    const audio = new Audio(
      `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalNumber}.mp3`,
    );
    audioRef.current = audio;
    audio
      .play()
      .then(() => {
        setPlayingAyah(globalNumber);
        setAudioPlaying(true);
      })
      .catch((e) => console.log(e));

    audio.onended = () => {
      const { verses: currentVerses } = stateRef.current;
      const currentIndex = currentVerses.findIndex(
        (v) => v.globalNumber === globalNumber,
      );
      if (currentIndex >= 0 && currentIndex < currentVerses.length - 1) {
        const nextAyah = currentVerses[currentIndex + 1];
        playAyah(nextAyah.globalNumber);
        const nextEl = verseRefs.current[nextAyah.globalNumber];
        if (nextEl)
          nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setPlayingAyah(null);
        setAudioPlaying(false);
      }
    };
  }

  function togglePlayPause() {
    if (audioPlaying && audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else if (playingAyah && audioRef.current) {
      audioRef.current.play();
      setAudioPlaying(true);
    } else if (verses.length > 0) {
      playAyah(verses[0].globalNumber);
    }
  }

  function playNext() {
    if (!playingAyah || !verses.length) return;
    const idx = verses.findIndex((v) => v.globalNumber === playingAyah);
    if (idx >= 0 && idx < verses.length - 1) {
      const targetGlobal = verses[idx + 1].globalNumber;
      playAyah(targetGlobal);
      const targetEl = verseRefs.current[targetGlobal];
      if (targetEl)
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function playPrev() {
    if (!playingAyah || !verses.length) return;
    const idx = verses.findIndex((v) => v.globalNumber === playingAyah);
    if (idx > 0) {
      const targetGlobal = verses[idx - 1].globalNumber;
      playAyah(targetGlobal);
      const targetEl = verseRefs.current[targetGlobal];
      if (targetEl)
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F7] relative font-sans text-slate-800">
      {/* Subtle Top Gradient */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-[#edf4f1] to-transparent pointer-events-none" />

      {/* Header */}
      <header
        className={`sticky top-0 z-40 transition-all ${
          view === "reader"
            ? "bg-[#F6F8F7]/80 backdrop-blur-xl py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-[#ECECEC]"
            : "bg-background border-b border-border px-6 py-5"
        }`}
      >
        <div
          className={`max-w-md mx-auto flex items-center justify-between gap-3 relative z-10 ${
            view === "reader" ? "px-5" : ""
          }`}
        >
          {view === "reader" ? (
            <>
              <button
                onClick={() => {
                  setView("list");
                  setVerses([]);
                  audioRef.current?.pause();
                  setPlayingAyah(null);
                }}
                className="p-2 -ml-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="text-center flex-1">
                <p className="text-[16px] font-bold text-slate-800 tracking-tight">
                  {selectedJuz
                    ? `Juz ${selectedJuz}`
                    : selectedSurah
                      ? SURAHS[selectedSurah - 1][1]
                      : ""}
                </p>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                  {selectedJuz
                    ? `Complete Part`
                    : selectedSurah
                      ? `${SURAHS[selectedSurah - 1][2]}`
                      : ""}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 -mr-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
              >
                <Settings2 size={20} />
              </button>
            </>
          ) : (
            <div className="w-full">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Quran
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Al-Quran Al-Kareem
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Reader View vs List View */}
      {view === "reader" ? (
        <ReaderView
          verses={verses}
          loading={loadingVerses}
          showWordByWord={showWordByWord}
          showTransliteration={showTransliteration}
          showTajweed={showTajweed}
          readingMode={readingMode}
          isBookmarked={(s, a) => bookmarks.some((b) => b.key === `${s}:${a}`)}
          onBookmark={toggleBookmark}
          playingAyah={playingAyah}
          onPlayAyah={playAyah}
          audioPlaying={audioPlaying}
          togglePlayPause={togglePlayPause}
          playNext={playNext}
          playPrev={playPrev}
          reciterName={RECITERS.find((r) => r.id === reciter)?.shortName}
          fontSize={fontSize}
          verseRefs={verseRefs}
        />
      ) : (
        <div className="pb-32 relative z-10">
          <div className="sticky top-[78px] z-30 bg-[#F6F8F7]/90 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-[#ECECEC]">
            <div className="max-w-md mx-auto px-5 py-2.5">
              <SectionSwitcher tabs={TABS} active={tab} onChange={setTab} />
            </div>
          </div>

          <div className="max-w-md mx-auto px-5 pt-8 space-y-6">
            {tab === "read" && (
              <>
                {/* Continue Reading Card */}
                {lastRead && (
                  <motion.button
                    whileHover={{ scale: 0.98, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openSurah(lastRead.surah)}
                    className="w-full relative overflow-hidden bg-gradient-to-br from-[#10b981] to-[#047857] shadow-[0_8px_30px_rgba(16,185,129,0.25)] rounded-[24px] p-6 text-left transition-all"
                  >
                    {/* Faint Islamic-inspired Geometric Pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.05]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: "40px 40px",
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-100 uppercase tracking-widest mb-3">
                        <BookOpen size={14} /> Continue Reading
                      </div>

                      <div>
                        <h3 className="text-[22px] font-bold text-white mb-1">
                          {lastRead.name}
                        </h3>
                        <p className="text-[14px] font-medium text-emerald-50">
                          Verse {lastRead.ayah} of{" "}
                          {SURAHS[lastRead.surah - 1][3]}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-black/15 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{
                              width: `${Math.min(100, (lastRead.ayah / SURAHS[lastRead.surah - 1][3]) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-white">
                          {Math.round(
                            (lastRead.ayah / SURAHS[lastRead.surah - 1][3]) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )}

                {/* Section Divider */}
                <div className="flex items-center gap-4 mt-10 mb-6">
                  <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">
                    Browse Quran
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ECECEC] to-transparent" />
                </div>

                <div className="space-y-6">
                  {/* Segmented Control for Surah/Juz */}
                  <div className="relative flex p-1.5 bg-[#EAEFEF] rounded-[18px] w-full max-w-[280px] mx-auto shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                    {["surah", "juz"].map((mode) => {
                      const isActive = browseMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setBrowseMode(mode)}
                          className={`relative flex-1 py-2.5 text-[14px] font-semibold capitalize z-10 transition-colors duration-300 ${isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="browseTab"
                              className="absolute inset-y-1.5 inset-x-1.5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-[14px]"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.5,
                              }}
                            />
                          )}
                          <span className="relative z-20 flex items-center justify-center gap-2">
                            {mode}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {browseMode === "surah" && (
                    <div className="relative group mt-6 mb-4">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors duration-300"
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Surah..."
                        className="w-full bg-white border border-[#E8E8E8] focus:border-[#10b981] rounded-[16px] pl-12 pr-12 py-3.5 text-[15px] text-slate-800 placeholder:text-slate-400 shadow-[0_3px_12px_rgba(0,0,0,0.03)] outline-none transition-all"
                      />
                      {search ? (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      ) : (
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#10b981] transition-colors">
                          <Mic size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  {browseMode === "surah" ? (
                    filteredSurahs.map(([num, ar, en, ayahs, rev]) => (
                      <motion.button
                        whileHover={{ scale: 0.99, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        key={num}
                        onClick={() => openSurah(num)}
                        className="group w-full bg-white border border-[#ECECEC] shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] rounded-[24px] p-5 flex items-center gap-5 text-left transition-all duration-300"
                      >
                        {/* Elegant Circular Badge */}
                        <div className="w-[42px] h-[42px] rounded-full border border-[#E5E7EB] flex items-center justify-center flex-shrink-0 group-hover:border-[#10b981]/30 group-hover:bg-[#ecfdf5] transition-colors">
                          <span className="text-[14px] font-semibold text-slate-600 group-hover:text-[#10b981]">
                            {num}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[17px] font-semibold text-slate-800 group-hover:text-[#10b981] transition-colors truncate">
                              {ar}
                            </span>
                            <span
                              className="text-[19px] text-slate-500 flex-shrink-0 ml-3"
                              dir="rtl"
                              style={{
                                fontFamily: "serif",
                                fontWeight: 300,
                                WebkitFontSmoothing: "antialiased",
                                MozOsxFontSmoothing: "grayscale",
                              }}
                            >
                              {ARABIC_NAMES[num - 1]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[13px] font-medium text-slate-500 truncate">
                              {en}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                            <span className="text-[11px] font-semibold text-slate-500 bg-[#F3F4F6] px-2 py-0.5 rounded-full uppercase tracking-wide">
                              {rev} • {ayahs} verses
                            </span>
                          </div>
                        </div>

                        {/* Right indicator */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Juz {juzOfAyah(num, 1)}
                          </span>
                          {lastRead?.surah === num ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#10b981]">
                              <CheckCircle2 size={12} /> Continue
                            </span>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play
                                size={14}
                                fill="currentColor"
                                className="ml-0.5"
                              />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <JuzList onOpen={openJuz} />
                  )}
                </div>
              </>
            )}

            {tab === "hadith" && <HadithTab />}
            {tab === "bookmarks" && (
              <BookmarksTab
                bookmarks={bookmarks}
                onOpen={openSurah}
                onRemove={(s, a) => toggleBookmark(s, a)}
              />
            )}
            {tab === "insights" && (
              <InsightsTab
                dailyGoal={dailyGoal}
                onGoalChange={(g) => {
                  setDailyGoal(g);
                  LS.set(KEY_GOAL, g);
                }}
                streak={streak}
              />
            )}
          </div>
        </div>
      )}

      {view !== "reader" && <BottomNav />}

      {/* Settings Bottom Sheet (Only in Reader View) */}
      <AnimatePresence>
        {showSettings && (
          <SettingsSheet
            onClose={() => setShowSettings(false)}
            readingMode={readingMode}
            setReadingMode={(v) => {
              setReadingMode(v);
              LS.set("tawfiq_quran_reading_mode", v);
            }}
            showTransliteration={showTransliteration}
            setShowTransliteration={(v) => {
              setShowTransliteration(v);
              LS.set("tawfiq_quran_transliteration", v);
            }}
            showWordByWord={showWordByWord}
            setShowWordByWord={setShowWordByWord}
            showTajweed={showTajweed}
            setShowTajweed={(v) => {
              setShowTajweed(v);
              LS.set("tawfiq_quran_tajweed", v);
            }}
            edition={edition}
            setEdition={(v) => {
              setEdition(v);
              LS.set("tawfiq_quran_edition", v);
            }}
            reciter={reciter}
            setReciter={(v) => {
              setReciter(v);
              LS.set("tawfiq_quran_reciter", v);
            }}
            fontSize={fontSize}
            adjustFontSize={(increment) => {
              setFontSize((prev) => {
                const newSize = Math.max(
                  20,
                  Math.min(60, prev + (increment ? 4 : -4)),
                );
                LS.set("tawfiq_quran_fontsize", newSize);
                return newSize;
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Reader View Component ───────────────────────────────────────────────────
function ReaderView({
  verses,
  loading,
  showWordByWord,
  showTransliteration,
  showTajweed,
  readingMode,
  isBookmarked,
  onBookmark,
  playingAyah,
  onPlayAyah,
  audioPlaying,
  togglePlayPause,
  playNext,
  playPrev,
  reciterName,
  fontSize,
  verseRefs,
}) {
  const [toast, setToast] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  const minimizeTimerRef = useRef(null);
  const prevPlayingRef = useRef(null);

  const activeVerse = verses.find((v) => v.globalNumber === playingAyah);
  const currentSurahName = activeVerse ? `Surah ${activeVerse.surahName}` : "";

  const resetMinimizeTimer = () => {
    setIsPlayerMinimized(false);
    if (minimizeTimerRef.current) {
      clearTimeout(minimizeTimerRef.current);
    }
    minimizeTimerRef.current = setTimeout(() => {
      setIsPlayerMinimized(true);
    }, 5000);
  };

  useEffect(() => {
    if (playingAyah !== null && prevPlayingRef.current === null) {
      resetMinimizeTimer();
    }

    if (playingAyah === null) {
      setIsPlayerMinimized(false);
      if (minimizeTimerRef.current) {
        clearTimeout(minimizeTimerRef.current);
        minimizeTimerRef.current = null;
      }
    }
    prevPlayingRef.current = playingAyah;
  }, [playingAyah]);

  useEffect(() => {
    if (playingAyah !== null) {
      if (!audioPlaying) {
        setIsPlayerMinimized(false);
        if (minimizeTimerRef.current) clearTimeout(minimizeTimerRef.current);
      } else {
        resetMinimizeTimer();
      }
    }
  }, [audioPlaying]);

  const handleCopy = (verse) => {
    const textToCopy = `${verse.arabic}\n\n${verse.translation}\n- Surah ${verse.surahName}, Ayah ${verse.number}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    });
  };

  const [currentReadIndex, setCurrentReadIndex] = useState(1);
  useEffect(() => {
    if (!verses.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const num = Number(entry.target.dataset.index);
            setCurrentReadIndex((prev) => Math.max(prev, num + 1));
          }
        });
      },
      { threshold: 0.5 },
    );
    Object.values(verseRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [verses, verseRefs]);

  if (loading)
    return (
      <div className="max-w-md mx-auto px-6 pt-10 space-y-12">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-6 animate-pulse"
            >
              <div className="w-8 h-4 rounded bg-[#E8E8E8]" />
              <div className="w-full h-12 rounded bg-[#E8E8E8]" />
              <div className="w-3/4 h-4 rounded bg-[#E8E8E8] self-start mt-4" />
            </div>
          ))}
      </div>
    );

  return (
    <div className="max-w-md mx-auto relative pb-40">
      <div
        className={`fixed top-20 inset-x-0 flex justify-center pointer-events-none z-50 transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="bg-[#111827] text-white px-5 py-3 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-3 text-[14px] font-semibold pointer-events-auto">
          <CheckCircle2 size={18} className="text-[#10b981]" /> Ayah Copied
        </div>
      </div>

      {verses.length > 0 && (
        <div className="text-center py-5 border-b border-[#ECECEC]">
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            Ayah {currentReadIndex} of {verses.length}
          </span>
        </div>
      )}

      <div className="px-6">
        {readingMode === "mushaf" ? (
          <div
            className="py-10 leading-[3.5] text-center"
            style={{
              fontFamily: "serif",
              direction: "rtl",
              fontSize: `${fontSize + 12}px`,
              fontWeight: 300,
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            {verses.map((v, i) => {
              const isBismillah =
                v.number === 1 && v.surahNumber !== 1 && v.surahNumber !== 9;
              const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
              let displayArabic = v.arabic;
              if (isBismillah && displayArabic.startsWith(bismillahText))
                displayArabic = displayArabic.replace(bismillahText, "").trim();

              return (
                <React.Fragment key={v.globalNumber}>
                  {isBismillah && (
                    <div className="text-center w-full block py-8 text-[#10b981]">
                      {bismillahText}
                    </div>
                  )}
                  <span
                    ref={(el) => (verseRefs.current[v.globalNumber] = el)}
                    data-index={i}
                    onClick={() => onPlayAyah(v.globalNumber)}
                    className={`inline transition-colors cursor-pointer ${playingAyah === v.globalNumber ? "text-[#10b981] bg-[#ecfdf5] rounded-xl px-1" : "text-slate-800 hover:text-[#10b981]/70"}`}
                  >
                    <TajweedText text={displayArabic} active={showTajweed} />
                    <span className="inline-flex items-center justify-center w-9 h-9 text-[14px] mx-2 text-slate-400 tabular-nums align-middle relative top-[-4px] border border-slate-200 rounded-full font-sans font-medium">
                      {v.number}
                    </span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          verses.map((v, i) => {
            const isBismillah =
              v.number === 1 && v.surahNumber !== 1 && v.surahNumber !== 9;
            const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            let displayArabic = v.arabic;
            if (isBismillah && displayArabic.startsWith(bismillahText))
              displayArabic = displayArabic.replace(bismillahText, "").trim();

            return (
              <div
                key={v.globalNumber}
                ref={(el) => (verseRefs.current[v.globalNumber] = el)}
                data-index={i}
                className={`py-12 border-b border-[#ECECEC] last:border-0 relative transition-colors ${playingAyah === v.globalNumber ? "bg-[#ecfdf5]/50 -mx-6 px-6" : ""}`}
              >
                {isBismillah && (
                  <div className="text-center pb-12">
                    <p
                      className="text-slate-800"
                      style={{
                        fontFamily: "serif",
                        direction: "rtl",
                        fontSize: `${fontSize + 6}px`,
                        fontWeight: 300,
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                      }}
                    >
                      {bismillahText}
                    </p>
                  </div>
                )}

                <div className="text-center mb-10">
                  <span className="text-[12px] font-bold text-slate-400 mb-6 block font-sans">
                    {v.number}
                  </span>
                  {showWordByWord ? (
                    <WordByWordDisplay
                      arabic={displayArabic}
                      translation={v.translation}
                      fontSize={fontSize + 6}
                      showTajweed={showTajweed}
                    />
                  ) : (
                    <div
                      onClick={() => onPlayAyah(v.globalNumber)}
                      className="cursor-pointer text-slate-800 leading-[2.5]"
                      style={{
                        fontFamily: "serif",
                        direction: "rtl",
                        fontSize: `${fontSize + 12}px`,
                        fontWeight: 300,
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                      }}
                    >
                      <TajweedText text={displayArabic} active={showTajweed} />
                    </div>
                  )}
                </div>

                {showTransliteration && (
                  <p className="text-[16px] text-[#10b981]/80 italic leading-relaxed mb-4 font-sans">
                    {v.transliteration}
                  </p>
                )}
                <p className="text-[16px] font-medium text-slate-600 leading-relaxed font-sans">
                  {v.translation}
                </p>

                <div className="flex items-center gap-6 mt-10 text-slate-400">
                  <button
                    onClick={() => onPlayAyah(v.globalNumber)}
                    className={`hover:text-[#10b981] transition-colors ${playingAyah === v.globalNumber ? "text-[#10b981]" : ""}`}
                  >
                    {playingAyah === v.globalNumber ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      onBookmark(
                        v.surahNumber,
                        v.number,
                        displayArabic,
                        v.surahName,
                      )
                    }
                    className={`hover:text-amber-500 transition-colors ${isBookmarked(v.surahNumber, v.number) ? "text-amber-500" : ""}`}
                  >
                    <Bookmark
                      size={20}
                      fill={
                        isBookmarked(v.surahNumber, v.number)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                  <button
                    onClick={() => handleCopy(v)}
                    className="hover:text-slate-800 transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dark Anchor Mini Player */}
      <AnimatePresence>
        {playingAyah !== null && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 inset-x-0 z-40 flex justify-center pointer-events-none px-5"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              whileHover={isPlayerMinimized ? { scale: 1.05 } : {}}
              onClick={() => {
                if (isPlayerMinimized) resetMinimizeTimer();
              }}
              onMouseMove={resetMinimizeTimer}
              onTouchStart={resetMinimizeTimer}
              className={`bg-[#111827] text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] flex items-center pointer-events-auto cursor-pointer overflow-hidden origin-center ${
                isPlayerMinimized
                  ? "rounded-full w-14 h-14 justify-center"
                  : "rounded-full px-6 py-4 max-w-full"
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isPlayerMinimized ? (
                  <motion.div
                    key="minimized"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    <div className="flex items-center justify-center gap-[3px] h-4">
                      <motion.div
                        animate={{ height: ["40%", "100%", "40%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "easeInOut",
                        }}
                        className="w-1 bg-[#10b981] rounded-full"
                      />
                      <motion.div
                        animate={{ height: ["100%", "40%", "100%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                        className="w-1 bg-[#10b981] rounded-full"
                      />
                      <motion.div
                        animate={{ height: ["60%", "100%", "60%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                        className="w-1 bg-[#10b981] rounded-full"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-6 whitespace-nowrap"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPrev();
                        resetMinimizeTimer();
                      }}
                      className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                      <SkipBack size={20} fill="currentColor" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                        resetMinimizeTimer();
                      }}
                      className="w-11 h-11 bg-white text-[#111827] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md flex-shrink-0"
                    >
                      {audioPlaying ? (
                        <Pause size={20} fill="currentColor" />
                      ) : (
                        <Play
                          size={20}
                          fill="currentColor"
                          className="ml-0.5"
                        />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playNext();
                        resetMinimizeTimer();
                      }}
                      className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                      <SkipForward size={20} fill="currentColor" />
                    </button>
                    <div className="h-5 w-px bg-slate-700 ml-2 flex-shrink-0" />
                    <span className="text-[15px] font-semibold ml-2 truncate max-w-[130px] flex-shrink-1">
                      {currentSurahName}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Settings Bottom Sheet ───────────────────────────────────────────────────
function SettingsSheet({
  onClose,
  readingMode,
  setReadingMode,
  showTransliteration,
  setShowTransliteration,
  showWordByWord,
  setShowWordByWord,
  showTajweed,
  setShowTajweed,
  edition,
  setEdition,
  reciter,
  setReciter,
  fontSize,
  adjustFontSize,
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[32px] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-center"
      >
        <div className="w-full max-w-md p-8 pb-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-slate-800">
              Reading Options
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 -mr-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex bg-slate-100 p-1.5 rounded-[20px]">
              <button
                onClick={() => setReadingMode("translation")}
                className={`flex-1 py-2.5 rounded-[16px] text-[14px] font-semibold transition-all duration-300 ${readingMode === "translation" ? "bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "text-slate-500 hover:text-slate-700"}`}
              >
                Translation
              </button>
              <button
                onClick={() => setReadingMode("mushaf")}
                className={`flex-1 py-2.5 rounded-[16px] text-[14px] font-semibold transition-all duration-300 ${readingMode === "mushaf" ? "bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "text-slate-500 hover:text-slate-700"}`}
              >
                Mushaf
              </button>
            </div>

            <div className="space-y-5">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Display
              </p>
              {readingMode === "translation" && (
                <>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <button
                      onClick={() =>
                        setShowTransliteration(!showTransliteration)
                      }
                      className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    >
                      {showTransliteration ? (
                        <CheckCircle2 className="text-[#10b981]" size={24} />
                      ) : (
                        <Circle
                          className="text-slate-300 group-hover:text-slate-400"
                          size={24}
                        />
                      )}
                    </button>
                    <span className="text-[15px] font-medium text-slate-700">
                      Transliteration
                    </span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <button
                      onClick={() => setShowWordByWord(!showWordByWord)}
                      className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    >
                      {showWordByWord ? (
                        <CheckCircle2 className="text-[#10b981]" size={24} />
                      ) : (
                        <Circle
                          className="text-slate-300 group-hover:text-slate-400"
                          size={24}
                        />
                      )}
                    </button>
                    <span className="text-[15px] font-medium text-slate-700">
                      Word by Word
                    </span>
                  </label>
                </>
              )}
              <label className="flex items-center gap-4 cursor-pointer group">
                <button
                  onClick={() => setShowTajweed(!showTajweed)}
                  className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                >
                  {showTajweed ? (
                    <CheckCircle2 className="text-[#10b981]" size={24} />
                  ) : (
                    <Circle
                      className="text-slate-300 group-hover:text-slate-400"
                      size={24}
                    />
                  )}
                </button>
                <span className="text-[15px] font-medium text-slate-700">
                  Tajweed Color Coding
                </span>
              </label>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Translation
                </p>
                <QuranDropdown
                  value={edition}
                  options={EDITIONS}
                  onChange={setEdition}
                />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Reciter
                </p>
                <QuranDropdown
                  value={reciter}
                  options={RECITERS}
                  onChange={setReciter}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Arabic Text Size
              </p>
              <div className="flex bg-slate-100 p-1.5 rounded-[20px]">
                <button
                  onClick={() => adjustFontSize(false)}
                  className="flex-1 py-3.5 flex justify-center items-center rounded-[16px] hover:bg-white transition-colors text-slate-700 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <Minus size={20} />
                </button>
                <button
                  onClick={() => adjustFontSize(true)}
                  className="flex-1 py-3.5 flex justify-center items-center rounded-[16px] hover:bg-white transition-colors text-slate-700 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function WordByWordDisplay({ arabic, translation, fontSize, showTajweed }) {
  const words = arabic.split(" ");
  const trWords = translation.split(" ");
  return (
    <div
      className="flex flex-wrap gap-x-5 gap-y-8 justify-center py-2"
      dir="rtl"
    >
      {words.map((w, i) => (
        <div key={i} className="flex flex-col items-center gap-3 min-w-[50px]">
          <span
            className="text-slate-800 transition-all"
            style={{
              fontFamily: "serif",
              fontSize: `${fontSize}px`,
              fontWeight: 300,
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            <TajweedText text={w} active={showTajweed} />
          </span>
          <span className="text-[12px] font-medium text-slate-500 text-center font-sans">
            {trWords[i] || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function applyTajweed(text) {
  let res = text;
  // Let the browser inherit the thin font-weight instead of forcing bold classes
  res = res.replace(/([نم])(ّ[َُِ]?)/g, '<span class="text-[#10b981]">$1$2</span>');
  res = res.replace(/([قطبجد])(ْ)/g, '<span class="text-blue-500">$1$2</span>');
  res = res.replace(/([آئؤاوي])(ٓ)/g, '<span class="text-red-500">$1$2</span>');
  return res;
}

const TajweedText = ({ text, active }) => {
  if (!active) return <>{text}</>;
  return <span dangerouslySetInnerHTML={{ __html: applyTajweed(text) }} />;
};

// ─── Unchanged Sub-Tabs ──────────────────────────────────────────────────
function JuzList({ onOpen }) {
  const [progress, setProgress] = useState(() => LS.get(KEY_JUZ_PROGRESS, {}));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const juzRefs = useRef({});
  const markProgress = (num, status) => {
    const next = { ...progress, [num]: status };
    setProgress(next);
    LS.set(KEY_JUZ_PROGRESS, next);
  };
  const scrollToJuz = (num) => {
    const el = juzRefs.current[num];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setQuickJumpOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#ECECEC] rounded-[24px] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-all">
        <button
          onClick={() => setQuickJumpOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors bg-slate-50/50 hover:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <Hash size={14} /> Quick Jump
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${quickJumpOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`transition-all duration-300 overflow-hidden ${quickJumpOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-4 pb-5 grid grid-cols-10 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
              const st = progress[n];
              return (
                <button
                  key={n}
                  onClick={() => scrollToJuz(n)}
                  className={`h-8 w-full rounded-lg text-[12px] font-semibold tabular-nums transition-all ${st === "completed" ? "bg-[#10b981] text-white shadow-sm" : st === "inprogress" ? "bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 border border-transparent"}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 px-3 py-2">
        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ecfdf5] flex items-center justify-center">
            <CheckCircle2 size={10} className="text-[#10b981]" />
          </span>{" "}
          Done
        </span>
        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-50 flex items-center justify-center">
            <BookOpen size={9} className="text-amber-500" />
          </span>{" "}
          In Progress
        </span>
      </div>

      {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => {
        const [startS, startA, endS, endA] = JUZ_META[num - 1] || [];
        const st = progress[num];
        const isCompleted = st === "completed";
        const isInProgress = st === "inprogress";
        return (
          <motion.div
            key={num}
            whileHover={{ scale: 0.99, y: -1 }}
            ref={(el) => (juzRefs.current[num] = el)}
            className="group flex items-center gap-5 bg-white border border-[#ECECEC] shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] rounded-[24px] p-5 transition-all duration-300"
          >
            {isCompleted ? (
              <div className="w-[42px] h-[42px] rounded-full bg-[#ecfdf5] border border-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-[#10b981]" />
              </div>
            ) : isInProgress ? (
              <div className="w-[42px] h-[42px] rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-semibold text-amber-500 tabular-nums">
                  {num}
                </span>
              </div>
            ) : (
              <div className="w-[42px] h-[42px] rounded-[14px] border border-[#ECECEC] flex items-center justify-center flex-shrink-0 group-hover:border-[#10b981]/30 group-hover:bg-[#ecfdf5] transition-colors">
                <span className="text-[14px] font-semibold text-slate-500 group-hover:text-[#10b981] tabular-nums">
                  {num}
                </span>
              </div>
            )}

            <button
              onClick={() => onOpen(num)}
              className="flex-1 min-w-0 text-left"
            >
              <p
                className={`text-[17px] font-bold transition-colors ${isCompleted ? "text-[#10b981]" : "text-slate-800 group-hover:text-[#10b981]"}`}
              >
                Juz {num}
              </p>
              {startS && (
                <p className="text-[13px] font-medium text-slate-500 mt-1 truncate">
                  {startS} {startA} → {endS} {endA}
                </p>
              )}
            </button>

            <div className="flex items-center gap-2 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  markProgress(num, isCompleted ? null : "completed")
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-[#ecfdf5] text-[#10b981]" : "text-slate-400 hover:text-[#10b981] hover:bg-[#ecfdf5]"}`}
              >
                <CheckCircle2 size={18} />
              </button>
              <button
                onClick={() =>
                  markProgress(num, isInProgress ? null : "inprogress")
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isInProgress ? "bg-amber-50 text-amber-500" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}
              >
                <BookOpen size={16} />
              </button>
              <ChevronRight
                size={18}
                onClick={() => onOpen(num)}
                className="text-slate-300 group-hover:text-[#10b981] transition-all cursor-pointer ml-1"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BookmarksTab({ bookmarks, onOpen, onRemove }) {
  if (!bookmarks.length)
    return (
      <div className="text-center py-20">
        <Bookmark size={36} className="text-slate-300 mx-auto mb-4" />
        <p className="text-[15px] font-medium text-slate-500">
          No bookmarks yet
        </p>
      </div>
    );
  return (
    <div className="space-y-4">
      {bookmarks.map((b) => (
        <motion.div
          whileHover={{ scale: 0.99, y: -1 }}
          key={b.key}
          className="bg-white border border-[#ECECEC] shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] rounded-[24px] p-5 flex items-center gap-5 transition-all"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#10b981] uppercase tracking-wider mb-1.5">
              {b.surahName} • Verse {b.ayah}
            </p>
            <p
              className="text-[17px] text-slate-800 mt-1 truncate"
              style={{
                direction: "rtl",
                fontFamily: "serif",
                fontWeight: 300,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {b.text}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onOpen(b.surah)}
              className="text-[14px] font-semibold text-[#10b981] hover:opacity-80 transition-opacity"
            >
              Open
            </button>
            <button
              onClick={() => onRemove(b.surah, b.ayah)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function InsightsTab({ dailyGoal, onGoalChange, streak }) {
  const pagesLog = LS.get(KEY_PAGES, {});
  const today = new Date().toISOString().slice(0, 10);
  const todayPages = pagesLog[today] || 0;
  const totalPages = Object.values(pagesLog).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 text-center shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-[#10b981] tabular-nums">
            {streak}
          </p>
          <p className="text-[12px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
            Day Streak
          </p>
        </div>
        <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 text-center shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-slate-800 tabular-nums">
            {totalPages}
          </p>
          <p className="text-[12px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
            Total Pages
          </p>
        </div>
      </div>
      <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Today's Progress
        </p>
        <div className="flex items-center gap-5">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10b981] rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, (todayPages / dailyGoal) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[15px] font-bold text-slate-800 tabular-nums">
            {todayPages} / {dailyGoal}
          </span>
        </div>
      </div>
      <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Daily Goal
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 5, 10].map((g) => (
            <button
              key={g}
              onClick={() => onGoalChange(g)}
              className={`py-3 rounded-[16px] text-[15px] font-bold transition-all duration-200 ${dailyGoal === g ? "bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-105" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HadithTab() {
  const [view, setHView] = useState("daily");
  const [hadith, setHadith] = useState({ text: { en: "Loading..." } });

  useEffect(() => {
    setHadith({
      book: "Sahih al-Bukhari",
      text: {
        en: "The Prophet (ﷺ) said: 'The most beloved deeds to Allah are those done regularly, even if they are small.'",
      },
    });
  }, []);

  return (
    <div className="space-y-5">
      <SectionSwitcher
        tabs={[{ id: "daily", label: "Daily" }]}
        active={view}
        onChange={setHView}
      />
      <div className="relative overflow-hidden bg-white border border-[#ECECEC] shadow-[0_6px_24px_rgba(0,0,0,0.04)] rounded-[24px] p-8 text-left">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] to-transparent opacity-60" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-[#10b981]">
            <BookText size={18} />
            <p className="text-[12px] font-bold uppercase tracking-widest">
              Daily Hadith
            </p>
          </div>
          <p className="text-[17px] font-semibold leading-relaxed text-slate-800 mb-5">
            {hadith.text.en}
          </p>
          <p className="text-[13px] font-bold text-slate-500 flex items-center gap-2">
            <span className="w-5 h-px bg-slate-300" />
            {hadith.book}
          </p>
        </div>
      </div>
    </div>
  );
}