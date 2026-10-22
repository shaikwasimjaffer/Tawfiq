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
  Star,
  Clock,
  Target,
  BarChart2,
  Copy,
  Minus,
  Plus,
  CheckCircle2,
  Hash,
  AlignRight,
  Repeat,
  Type,
  BookText,
  Volume2,
  Palette,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SectionSwitcher from "@/components/SectionSwitcher";
import HadithTab from "@/components/hadith/HadithTab";
import HadithCard from "@/components/hadith/HadithCard";
import {
  getSavedHadiths,
  toggleSaveHadith,
  getHadithInsights,
  clearHadithHistory,
  normalizeArabic,
} from "@/lib/hadithService";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

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

// ─── API helpers ─────────────────────────────────────────────────────────────
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
  { id: "en.sahih", label: "Saheeh International" },
  { id: "ur.jalandhry", label: "Jalandhry (Urdu)" },
];

const RECITERS = [
  { id: "ar.alafasy", label: "Mishary Alafasy" },
  { id: "ar.husary", label: "Mahmoud Al Husary" },
];

const TABS = [
  { id: "read", label: "Read" },
  { id: "hadith", label: "Hadith" },
  { id: "bookmarks", label: "Saved" },
  { id: "insights", label: "Insights" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function QuranPage() {
  const [tab, setTab] = useState("read");
  const [view, setView] = useState("list");
  const [browseMode, setBrowseMode] = useState("surah");

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
    LS.get("tawfiq_quran_fontsize", 30),
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

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const [dailyGoal, setDailyGoal] = useState(() => LS.get(KEY_GOAL, 2));

  const audioRef = useRef(null);
  const verseRefs = useRef({});
  const stateRef = useRef({ isAutoPlay, verses });
  const lastRead = LS.get(KEY_LAST, null);

  useEffect(() => {
    stateRef.current = { isAutoPlay, verses };
  }, [isAutoPlay, verses]);

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
    setLoadingVerses(true);
    setVerses([]);
    const data = await fetchSurah(surahNum, edition).catch(() => []);
    setVerses(data);
    setLoadingVerses(false);
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
    setLoadingVerses(true);
    setVerses([]);
    const data = await fetchJuzData(juzNum, edition).catch(() => []);
    setVerses(data);
    setLoadingVerses(false);
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
      setPlayingAyah(null);
      setAudioPlaying(false);
      const currentRefState = stateRef.current;
      if (currentRefState.isAutoPlay) {
        const currentIndex = currentRefState.verses.findIndex(
          (v) => v.globalNumber === globalNumber,
        );
        if (
          currentIndex >= 0 &&
          currentIndex < currentRefState.verses.length - 1
        ) {
          const nextAyah = currentRefState.verses[currentIndex + 1];
          playAyah(nextAyah.globalNumber);
          const nextEl = verseRefs.current[nextAyah.globalNumber];
          if (nextEl)
            nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setIsAutoPlay(false);
        }
      }
    };
  }

  const adjustFontSize = (increment) => {
    setFontSize((prev) => {
      const newSize = Math.max(20, Math.min(50, prev + (increment ? 4 : -4)));
      LS.set("tawfiq_quran_fontsize", newSize);
      return newSize;
    });
  };

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-green-100 dark:border-green-900 px-6 py-5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {view === "reader" ? (
            <>
              <button
                onClick={() => {
                  setView("list");
                  setVerses([]);
                  audioRef.current?.pause();
                  setPlayingAyah(null);
                  setIsAutoPlay(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft size={17} />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {selectedJuz
                    ? `Juz ${selectedJuz}`
                    : selectedSurah
                      ? SURAHS[selectedSurah - 1][1]
                      : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedJuz
                    ? `Complete Part`
                    : selectedSurah
                      ? `${SURAHS[selectedSurah - 1][2]}`
                      : ""}
                </p>
              </div>
              <div className="w-9 h-9"></div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Quran
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Al-Quran Al-Kareem
                </p>
              </div>
              <select
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  LS.set("tawfiq_quran_edition", e.target.value);
                }}
                className="
    h-11
    min-w-[220px]
    rounded-2xl
    border
    border-green-100
    dark:border-green-900
    bg-white
    dark:bg-card
    px-4
    text-[15px]
    font-medium
    text-foreground
    shadow-sm
    hover:shadow-md
    hover:border-green-300
    focus:outline-none
    focus:ring-2
    focus:ring-green-500/20
    transition-all
    duration-300
  "
              >
                {EDITIONS.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </header>

      {view === "reader" ? (
        <ReaderView
          isJuzMode={!!selectedJuz}
          verses={verses}
          loading={loadingVerses}
          showWordByWord={showWordByWord}
          setShowWordByWord={setShowWordByWord}
          showTransliteration={showTransliteration}
          setShowTransliteration={(val) => {
            setShowTransliteration(val);
            LS.set("tawfiq_quran_transliteration", val);
          }}
          showTajweed={showTajweed}
          setShowTajweed={(val) => {
            setShowTajweed(val);
            LS.set("tawfiq_quran_tajweed", val);
          }}
          readingMode={readingMode}
          setReadingMode={(mode) => {
            setReadingMode(mode);
            LS.set("tawfiq_quran_reading_mode", mode);
          }}
          isBookmarked={(s, a) => bookmarks.some((b) => b.key === `${s}:${a}`)}
          onBookmark={toggleBookmark}
          playingAyah={playingAyah}
          onPlayAyah={playAyah}
          isAutoPlay={isAutoPlay}
          setIsAutoPlay={setIsAutoPlay}
          audioRef={audioRef}
          fontSize={fontSize}
          adjustFontSize={adjustFontSize}
          verseRefs={verseRefs}
        />
      ) : (
        <div>
          <div className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-md mx-auto px-4 py-3 shadow-sm">
              <SectionSwitcher tabs={TABS} active={tab} onChange={setTab} />
            </div>
          </div>

          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            {tab === "read" && (
              <>
                {lastRead && (
                  <button
                    onClick={() => openSurah(lastRead.surah)}
                    className="w-full flex items-center gap-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl p-5 shadow-lg text-left hover:bg-primary/90 transition-all active:scale-[0.99]"
                  >
                    <Clock size={18} className="text-green-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-100">
                        Continue Reading
                      </p>
                      <p className="text-lg font-bold text-white">
                        {lastRead.name}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-white flex-shrink-0"
                    />
                  </button>
                )}

                <div className="space-y-3">
                  <div className="flex bg-secondary p-1 rounded-xl">
                    <button
                      onClick={() => setBrowseMode("surah")}
                      className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${browseMode === "surah" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Surah
                    </button>
                    <button
                      onClick={() => setBrowseMode("juz")}
                      className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${browseMode === "juz" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Juz
                    </button>
                  </div>

                  {browseMode === "surah" && (
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search surah…"
                        className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {browseMode === "surah"
                    ? filteredSurahs.map(([num, ar, en, ayahs, rev]) => (
                        <button
                          key={num}
                          onClick={() => openSurah(num)}
                          className="w-full flex items-center gap-4 bg-card border border-border rounded-3xl px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] text-left"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary tabular-nums">
                              {num}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {ar}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {en} · {ayahs} verses · {rev}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
                              Juz {juzOfAyah(num, 1)}
                            </p>
                          </div>
                        </button>
                      ))
                    : Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => openJuz(num)}
                          className="w-full flex items-center gap-4 bg-card border border-border rounded-3xl px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] text-left"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary tabular-nums">
                              {num}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              Juz {num}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-muted-foreground"
                          />
                        </button>
                      ))}
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
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tajweed Rendering Engine ──────────────────────────────────────────────────
function applyTajweed(text) {
  let res = text;
  // Ghunnah (Green): Noon or Meem followed by Shaddah
  res = res.replace(
    /([نم])(ّ[َُِ]?)/g,
    '<span class="text-green-500 font-bold">$1$2</span>',
  );
  // Qalqalah (Blue): Qaf, Ta, Ba, Jeem, Dal followed by Sukoon
  res = res.replace(
    /([قطبجد])(ْ)/g,
    '<span class="text-blue-500 font-bold">$1$2</span>',
  );
  // Madd (Red): Alif, Waw, Ya with Maddah
  res = res.replace(
    /([آئؤاوي])(ٓ)/g,
    '<span class="text-red-500 font-bold">$1$2</span>',
  );
  return res;
}

const TajweedText = ({ text, active }) => {
  if (!active) return <>{text}</>;
  return <span dangerouslySetInnerHTML={{ __html: applyTajweed(text) }} />;
};

// ─── Reader View ─────────────────────────────────────────────────────────────
function ReaderView({
  isJuzMode,
  verses,
  loading,
  showWordByWord,
  setShowWordByWord,
  showTransliteration,
  setShowTransliteration,
  showTajweed,
  setShowTajweed,
  readingMode,
  setReadingMode,
  isBookmarked,
  onBookmark,
  playingAyah,
  onPlayAyah,
  isAutoPlay,
  setIsAutoPlay,
  audioRef,
  fontSize,
  adjustFontSize,
  verseRefs,
}) {
  const [toast, setToast] = useState(false);
  const [jumpTo, setJumpTo] = useState("");

  const handleCopy = (verse) => {
    const textToCopy = `${verse.arabic}\n\n${verse.translation}\n- Surah ${verse.surahName}, Ayah ${verse.number}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    });
  };

  const handleJump = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const num = parseInt(jumpTo);
      const target = verses.find((v) => v.number === num);
      if (target && verseRefs.current[target.globalNumber]) {
        verseRefs.current[target.globalNumber].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      setJumpTo("");
    }
  };

  if (loading)
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
      </div>
    );

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-3 relative">
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={16} /> Ayah Copied
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-secondary p-1 rounded-xl">
            <button
              onClick={() => setReadingMode("translation")}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${readingMode === "translation" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <AlignRight size={14} /> Translation
            </button>
            <button
              onClick={() => setReadingMode("mushaf")}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${readingMode === "mushaf" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <BookText size={14} /> Mushaf
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustFontSize(false)}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => adjustFontSize(true)}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
          <div className="flex bg-secondary p-1 rounded-xl overflow-x-auto hide-scrollbar">
            {readingMode === "translation" && (
              <>
                <button
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${showTransliteration ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Type size={12} /> Phonetics
                </button>
                <button
                  onClick={() => setShowWordByWord(!showWordByWord)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showWordByWord ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  W×W
                </button>
              </>
            )}
            <button
              onClick={() => setShowTajweed(!showTajweed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${showTajweed ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Palette size={12} /> Tajweed
            </button>
          </div>
          <div className="relative w-20 flex-shrink-0">
            <Hash
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={jumpTo}
              onChange={(e) => setJumpTo(e.target.value)}
              onKeyDown={handleJump}
              placeholder="Ayah"
              className="w-full bg-secondary rounded-lg pl-7 pr-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {readingMode === "mushaf" ? (
        <div
          className="bg-card border border-border p-6 rounded-3xl shadow-sm leading-[3.5] text-right"
          style={{
            fontFamily: "serif",
            direction: "rtl",
            fontSize: `${fontSize + 6}px`,
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
                  <div className="text-center w-full block py-6 text-primary">
                    {bismillahText}
                  </div>
                )}
                <span
                  ref={(el) => (verseRefs.current[v.globalNumber] = el)}
                  onClick={() => onPlayAyah(v.globalNumber)}
                  className={`inline transition-colors cursor-pointer ${playingAyah === v.globalNumber ? "text-primary bg-primary/10 rounded-lg" : "text-foreground hover:text-primary/80"}`}
                >
                  <TajweedText text={displayArabic} active={showTajweed} />
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-primary/40 text-sm mx-2 text-primary tabular-nums align-middle relative top-[-4px]">
                    {v.number}
                  </span>
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        verses.map((v) => {
          const isBismillah =
            v.number === 1 && v.surahNumber !== 1 && v.surahNumber !== 9;
          const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
          let displayArabic = v.arabic;
          if (isBismillah && displayArabic.startsWith(bismillahText))
            displayArabic = displayArabic.replace(bismillahText, "").trim();

          return (
            <React.Fragment key={v.globalNumber}>
              {isBismillah && (
                <div className="text-center py-5">
                  <p
                    className="font-bold text-foreground"
                    style={{
                      fontFamily: "serif",
                      direction: "rtl",
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    {bismillahText}
                  </p>
                </div>
              )}
              <div
                ref={(el) => (verseRefs.current[v.globalNumber] = el)}
                className={`bg-card border ${playingAyah === v.globalNumber ? "border-primary ring-1 ring-primary/20" : "border-border"} rounded-3xl p-5 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary shadow-sm flex items-center justify-center">
                      <span className="text-[10px] font-bold tabular-nums">
                        {v.number}
                      </span>
                    </div>
                    {isJuzMode && v.number === 1 && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {v.surahName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(v)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      onClick={() => onPlayAyah(v.globalNumber)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${playingAyah === v.globalNumber ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {playingAyah === v.globalNumber ? (
                        <Pause size={11} />
                      ) : (
                        <Play size={11} />
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isBookmarked(v.surahNumber, v.number) ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground bg-secondary"}`}
                    >
                      <Bookmark
                        size={11}
                        fill={
                          isBookmarked(v.surahNumber, v.number)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>

                {showWordByWord ? (
                  <WordByWordDisplay
                    arabic={displayArabic}
                    translation={v.translation}
                    fontSize={fontSize}
                    showTajweed={showTajweed}
                  />
                ) : (
                  <p
                    className="leading-loose text-foreground text-right mb-3 transition-all duration-200"
                    style={{
                      fontFamily: "serif",
                      direction: "rtl",
                      lineHeight: 2.2,
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    <TajweedText text={displayArabic} active={showTajweed} />
                  </p>
                )}

                {showTransliteration && (
                  <p className="text-sm text-primary italic leading-relaxed border-t border-border pt-3 mt-3">
                    {v.transliteration}
                  </p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3 mt-3">
                  {v.translation}
                </p>
              </div>
            </React.Fragment>
          );
        })
      )}

      {/* Floating Audio Player */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md pointer-events-none">
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-full shadow-2xl p-2.5 flex items-center justify-between px-5 pointer-events-auto transition-transform">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${isAutoPlay ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <Repeat size={16} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">
                {isAutoPlay ? "Auto-scroll ON" : "Continuous Play"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {playingAyah ? "Audio Playing" : "Ready to Read"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {playingAyah ? (
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setPlayingAyah(null);
                }}
                className="p-3 bg-secondary text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <Pause size={16} />
              </button>
            ) : (
              <div className="p-3 bg-secondary/50 text-muted-foreground/50 rounded-full">
                <Volume2 size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WordByWordDisplay({ arabic, translation, fontSize, showTajweed }) {
  const words = arabic.split(" ");
  const trWords = translation.split(" ");
  return (
    <div className="flex flex-wrap gap-2 justify-end py-2">
      {words.map((w, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 bg-secondary rounded-xl px-2 py-2 min-w-[48px]"
        >
          <span
            className="text-foreground transition-all duration-200"
            style={{
              fontFamily: "serif",
              direction: "rtl",
              fontSize: `${fontSize - 10}px`,
            }}
          >
            <TajweedText text={w} active={showTajweed} />
          </span>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">
            {trWords[i] || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Bookmarks Tab (Supports both Saved Hadiths and Quran Ayahs) ────────────────
function BookmarksTab({ bookmarks, onOpen, onRemove }) {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {}
  const userScope = user?.id ? `u_${user.id}_` : "";

  const [savedSection, setSavedSection] = useState("hadith"); // "hadith" | "quran"
  const [savedHadiths, setSavedHadiths] = useState(() => getSavedHadiths(userScope));
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");

  useEffect(() => {
    setSavedHadiths(getSavedHadiths(userScope));
  }, [userScope]);

  const handleToggleSave = (hadith) => {
    const updated = toggleSaveHadith(hadith, userScope);
    setSavedHadiths(updated);
  };

  const filteredHadiths = useMemo(() => {
    return savedHadiths.filter((h) => {
      if (selectedBook !== "all" && h.bookKey !== selectedBook) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const normQ = normalizeArabic(q);
      const en = (h.english || "").toLowerCase();
      const narrator = (h.narrator || "").toLowerCase();
      const book = (h.bookTitle || "").toLowerCase();
      const num = String(h.idInBook ?? h.id);

      if (en.includes(q) || narrator.includes(q) || book.includes(q) || num === q) return true;
      if (h.arabic && normalizeArabic(h.arabic).includes(normQ)) return true;
      return false;
    });
  }, [savedHadiths, search, selectedBook]);

  // Unique books in saved list
  const savedBookKeys = useMemo(() => {
    const map = new Map();
    savedHadiths.forEach((h) => {
      if (h.bookKey && !map.has(h.bookKey)) {
        map.set(h.bookKey, h.bookTitle);
      }
    });
    return Array.from(map.entries());
  }, [savedHadiths]);

  return (
    <div className="space-y-4 text-left">
      {/* Sub-tab Pill Switcher */}
      <div className="flex bg-[#F3EFE7] dark:bg-secondary p-1 rounded-2xl border border-[#E7E2D9] dark:border-border">
        <button
          type="button"
          onClick={() => setSavedSection("hadith")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            savedSection === "hadith"
              ? "bg-white dark:bg-card text-[#134D37] dark:text-primary shadow-sm"
              : "text-[#77766F] hover:text-stone-900 dark:hover:text-foreground"
          }`}
        >
          Saved Hadiths ({savedHadiths.length})
        </button>
        <button
          type="button"
          onClick={() => setSavedSection("quran")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            savedSection === "quran"
              ? "bg-white dark:bg-card text-[#134D37] dark:text-primary shadow-sm"
              : "text-[#77766F] hover:text-stone-900 dark:hover:text-foreground"
          }`}
        >
          Quran Ayahs ({bookmarks.length})
        </button>
      </div>

      {savedSection === "hadith" ? (
        <div className="space-y-3.5">
          {savedHadiths.length > 0 && (
            <div className="space-y-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search saved Hadiths…"
                  className="w-full bg-white dark:bg-secondary border border-[#E7E2D9] dark:border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#134D37]/30"
                />
              </div>

              {savedBookKeys.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedBook("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                      selectedBook === "all"
                        ? "bg-[#134D37] text-white"
                        : "bg-white dark:bg-card border border-[#E7E2D9] dark:border-border text-[#6E685F]"
                    }`}
                  >
                    All Collections ({savedHadiths.length})
                  </button>
                  {savedBookKeys.map(([k, title]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelectedBook(k)}
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                        selectedBook === k
                          ? "bg-[#134D37] text-white"
                          : "bg-white dark:bg-card border border-[#E7E2D9] dark:border-border text-[#6E685F]"
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredHadiths.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-6 space-y-2">
              <Bookmark size={32} className="text-[#8C857B] mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-foreground">
                {savedHadiths.length === 0 ? "No saved Hadiths yet" : "No matching saved Hadiths"}
              </p>
              <p className="text-xs text-[#77766F] max-w-xs mx-auto">
                {savedHadiths.length === 0
                  ? "Browse the Hadith library and tap the bookmark icon on any Hadith to save it for quick reference."
                  : "Try clearing your search query to see all your saved Hadiths."}
              </p>
            </div>
          ) : (
            filteredHadiths.map((h) => (
              <HadithCard
                key={`saved_${h.bookKey}_${h.id}`}
                hadith={h}
                isSaved={true}
                onToggleSave={handleToggleSave}
              />
            ))
          )}
        </div>
      ) : (
        /* Quran Bookmarks */
        <div className="space-y-2">
          {!bookmarks.length ? (
            <div className="text-center py-16 bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-6">
              <Bookmark size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Quran bookmarks yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap the bookmark icon on any Ayah while reading to save it here.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.key}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary">
                    {b.surahName} · Verse {b.ayah}
                  </p>
                  <p
                    className="text-sm text-foreground mt-0.5 truncate"
                    style={{ direction: "rtl", fontFamily: "serif" }}
                  >
                    {b.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onOpen(b.surah)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onRemove(b.surah, b.ayah)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Insights Tab (Quran & Hadith Library Insights) ───────────────────────────
function InsightsTab({ dailyGoal, onGoalChange }) {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {}
  const userScope = user?.id ? `u_${user.id}_` : "";

  const [insights, setInsights] = useState(() => getHadithInsights(userScope));
  const pagesLog = LS.get(KEY_PAGES, {});
  const today = new Date().toISOString().slice(0, 10);
  const todayPages = pagesLog[today] || 0;

  const quranStreak = useMemo(() => {
    let s = 0,
      d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (!pagesLog[k]) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [pagesLog]);
  const totalPages = Object.values(pagesLog).reduce((a, b) => a + b, 0);

  const handleClearHistory = () => {
    clearHadithHistory(userScope);
    setInsights(getHadithInsights(userScope));
    toast.success("Reading history cleared");
  };

  return (
    <div className="space-y-4 text-left">
      {/* ── Hadith Library Insights ── */}
      <div className="bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-[#134D37] dark:text-primary" />
            <h3 className="text-sm font-bold text-foreground">Hadith Library Stats</h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            17 Collections Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#FAF8F5] dark:bg-secondary p-3.5 rounded-xl border border-[#EFE9DF] dark:border-border">
            <p className="text-2xl font-bold text-[#134D37] dark:text-primary tabular-nums">
              50,884
            </p>
            <p className="text-[11px] font-medium text-[#77766F] dark:text-muted-foreground mt-0.5">
              Total Hadiths Available
            </p>
          </div>
          <div className="bg-[#FAF8F5] dark:bg-secondary p-3.5 rounded-xl border border-[#EFE9DF] dark:border-border">
            <p className="text-2xl font-bold text-[#134D37] dark:text-primary tabular-nums">
              {insights.savedCount}
            </p>
            <p className="text-[11px] font-medium text-[#77766F] dark:text-muted-foreground mt-0.5">
              Saved Hadiths
            </p>
          </div>
          <div className="bg-[#FAF8F5] dark:bg-secondary p-3.5 rounded-xl border border-[#EFE9DF] dark:border-border">
            <p className="text-2xl font-bold text-stone-900 dark:text-foreground tabular-nums">
              {insights.exploredCollectionsCount} / 17
            </p>
            <p className="text-[11px] font-medium text-[#77766F] dark:text-muted-foreground mt-0.5">
              Collections Explored
            </p>
          </div>
          <div className="bg-[#FAF8F5] dark:bg-secondary p-3.5 rounded-xl border border-[#EFE9DF] dark:border-border">
            <p className="text-2xl font-bold text-stone-900 dark:text-foreground tabular-nums">
              {insights.viewedCount}
            </p>
            <p className="text-[11px] font-medium text-[#77766F] dark:text-muted-foreground mt-0.5">
              Hadiths Opened / Read
            </p>
          </div>
        </div>

        {/* Recently Viewed History */}
        {insights.recentHistory.length > 0 && (
          <div className="pt-2 border-t border-[#F0EBE1] dark:border-border/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-[#77766F] dark:text-muted-foreground uppercase tracking-wider">
                Recently Viewed
              </p>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[11px] text-[#8C857B] hover:text-destructive transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-1.5">
              {insights.recentHistory.map((item) => (
                <div
                  key={`hist_${item.id}`}
                  className="p-2.5 bg-[#FAF8F5] dark:bg-secondary rounded-lg text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {item.bookTitle} #{item.idInBook || item.id}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.englishSnippet}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8C857B] shrink-0">
                    {new Date(item.viewedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Quran Reading Insights ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-primary tabular-nums">
            {quranStreak}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Day Reading Streak
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {totalPages}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Pages Read</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Quran Progress
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (todayPages / dailyGoal) * 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {todayPages}/{dailyGoal}
          </span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Daily Quran Goal (Pages)
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 5, 10].map((g) => (
            <button
              key={g}
              onClick={() => onGoalChange(g)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${
                dailyGoal === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
