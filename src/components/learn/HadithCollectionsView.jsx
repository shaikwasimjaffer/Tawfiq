import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  X,
  Volume2,
  Pause,
  Copy,
  Check,
  ChevronDown,
  Layers,
  GraduationCap,
} from "lucide-react";
import HadithCard from "@/components/hadith/HadithCard";
import {
  getCollections,
  getChapterHadiths,
  getBookHadiths,
  getTodayHadith,
  normalizeArabic,
  getSavedHadiths,
  toggleSaveHadith,
} from "@/lib/hadithService";
import { getLocalDateString } from "@/lib/prayerUtils";
import { toast } from "sonner";

const PAGE_SIZE = 15;

export default function HadithCollectionsView({ onBack }) {
  // Collections data
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [selectedBookKey, setSelectedBookKey] = useState(null); // null = browsing 17 collections
  const [selectedChapterId, setSelectedChapterId] = useState("all");
  const [todayHadith, setTodayHadith] = useState(null);

  // Filter & Search states
  const [collectionFilter, setCollectionFilter] = useState("all"); // 'all' | 'the_9_books' | 'forties' | 'other_books'
  const [collectionSearch, setCollectionSearch] = useState("");
  const [hadithSearch, setHadithSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("original"); // 'original' | 'asc' | 'desc' | 'saved_first'
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Loaded Hadiths for selected book
  const [currentHadiths, setCurrentHadiths] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [errorHadiths, setErrorHadiths] = useState(null);
  const [savedHadiths, setSavedHadiths] = useState(() => getSavedHadiths(""));

  // Reader Modal State
  const [activeReadingHadith, setActiveReadingHadith] = useState(null);
  const [readerFontSize, setReaderFontSize] = useState("normal"); // 'normal' | 'large'
  const [isPlayingReaderAudio, setIsPlayingReaderAudio] = useState(false);

  // Load collections & daily hadith on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoadingCollections(true);
      const cols = await getCollections();
      if (!mounted) return;
      setCollections(cols);
      setLoadingCollections(false);

      const localDate = getLocalDateString(new Date());
      const daily = await getTodayHadith(localDate);
      if (mounted) setTodayHadith(daily);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Active selected collection object
  const activeCollection = useMemo(() => {
    if (!selectedBookKey) return null;
    return collections.find((c) => c.key === selectedBookKey) || null;
  }, [collections, selectedBookKey]);

  // Load Hadiths when a collection or chapter is selected
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!selectedBookKey) {
        setCurrentHadiths([]);
        return;
      }
      setLoadingHadiths(true);
      setErrorHadiths(null);
      setDisplayCount(PAGE_SIZE);

      try {
        if (selectedChapterId !== "all") {
          const data = await getChapterHadiths(selectedBookKey, selectedChapterId);
          if (!mounted) return;
          const chapterName =
            activeCollection?.chapters?.find(
              (c) => String(c.id) === String(selectedChapterId),
            )?.english || "";

          const mapped = (data.hadiths || []).map((h) => ({
            ...h,
            bookKey: selectedBookKey,
            bookTitle: activeCollection?.canonicalTitle || activeCollection?.titleEn || "Hadith",
            chapterTitle: chapterName || data.chapter?.english || "",
          }));
          setCurrentHadiths(mapped);
        } else {
          const data = await getBookHadiths(selectedBookKey);
          if (!mounted) return;
          const chaptersMap = new Map();
          (data?.chapters || []).forEach((c) =>
            chaptersMap.set(String(c.id), c.english),
          );

          const mapped = (data?.hadiths || []).map((h) => ({
            ...h,
            bookKey: selectedBookKey,
            bookTitle: activeCollection?.canonicalTitle || activeCollection?.titleEn || "Hadith",
            chapterTitle: chaptersMap.get(String(h.chapterId)) || "",
          }));
          setCurrentHadiths(mapped);
        }
      } catch (err) {
        if (mounted) setErrorHadiths("Failed to load Hadith records.");
      } finally {
        if (mounted) setLoadingHadiths(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [selectedBookKey, selectedChapterId, activeCollection]);

  // Toggle bookmark / save
  const handleToggleSave = (hadith) => {
    const updated = toggleSaveHadith(hadith, "");
    setSavedHadiths(updated);
  };

  const isHadithSaved = (id) => savedHadiths.some((s) => s.id === id);

  // Filtered collections for the collection catalog view
  const filteredCollections = useMemo(() => {
    let list = collections;
    if (collectionFilter !== "all") {
      list = list.filter((c) => c.group === collectionFilter);
    }
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.canonicalTitle.toLowerCase().includes(q) ||
          c.titleAr?.toLowerCase().includes(q) ||
          c.authorEn?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [collections, collectionFilter, collectionSearch]);

  // Filtered Hadiths within active collection
  const filteredHadiths = useMemo(() => {
    let result = [...currentHadiths];

    if (hadithSearch.trim()) {
      const q = hadithSearch.trim().toLowerCase();
      const normQ = normalizeArabic(q);

      result = result.filter((h) => {
        const enText = (
          typeof h.english === "string" ? h.english : h.english?.text || ""
        ).toLowerCase();
        const narrator = (h.narrator || h.english?.narrator || "").toLowerCase();
        const numStr = String(h.idInBook ?? h.id);
        const chapterName = (h.chapterTitle || "").toLowerCase();

        if (
          enText.includes(q) ||
          narrator.includes(q) ||
          numStr === q ||
          chapterName.includes(q)
        ) {
          return true;
        }

        if (h.arabic) {
          const normAr = normalizeArabic(h.arabic);
          if (normAr.includes(normQ)) return true;
        }

        return false;
      });
    }

    if (sortOrder === "asc") {
      result.sort((a, b) => (a.idInBook ?? a.id) - (b.idInBook ?? b.id));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => (b.idInBook ?? b.id) - (a.idInBook ?? a.id));
    } else if (sortOrder === "saved_first") {
      const savedIds = new Set(savedHadiths.map((s) => s.id));
      result.sort((a, b) => {
        const aSaved = savedIds.has(a.id) ? 1 : 0;
        const bSaved = savedIds.has(b.id) ? 1 : 0;
        return bSaved - aSaved;
      });
    }

    return result;
  }, [currentHadiths, hadithSearch, sortOrder, savedHadiths]);

  const visibleHadiths = useMemo(() => {
    return filteredHadiths.slice(0, displayCount);
  }, [filteredHadiths, displayCount]);

  // Reader Modal Next / Previous Handlers
  const currentReaderIndex = useMemo(() => {
    if (!activeReadingHadith) return -1;
    return filteredHadiths.findIndex(
      (h) => (h.idInBook ?? h.id) === (activeReadingHadith.idInBook ?? activeReadingHadith.id),
    );
  }, [activeReadingHadith, filteredHadiths]);

  const handleNextHadith = () => {
    if (currentReaderIndex >= 0 && currentReaderIndex < filteredHadiths.length - 1) {
      setActiveReadingHadith(filteredHadiths[currentReaderIndex + 1]);
      window.speechSynthesis?.cancel();
      setIsPlayingReaderAudio(false);
    }
  };

  const handlePrevHadith = () => {
    if (currentReaderIndex > 0) {
      setActiveReadingHadith(filteredHadiths[currentReaderIndex - 1]);
      window.speechSynthesis?.cancel();
      setIsPlayingReaderAudio(false);
    }
  };

  const handlePlayReaderSpeech = () => {
    if (!activeReadingHadith) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio speech synthesis not supported on this device.");
      return;
    }

    if (isPlayingReaderAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingReaderAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = activeReadingHadith.arabic || activeReadingHadith.english;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeReadingHadith.arabic ? "ar-SA" : "en-US";
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic"),
    );
    if (arabicVoice && activeReadingHadith.arabic) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => setIsPlayingReaderAudio(true);
    utterance.onend = () => setIsPlayingReaderAudio(false);
    utterance.onerror = () => setIsPlayingReaderAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
      {/* ─── LEVEL 1: ALL 17 COLLECTIONS CATALOG ─────────────────────────────────── */}
      {!selectedBookKey ? (
        <div className="space-y-6">
          {/* Header Stats Banner */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Hadith Library
                </span>
                <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/10">
                  50,884 Available
                </span>
              </div>
              <h2 className="text-2xl font-black">17 Hadith Collections</h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm">
                Explore authentic prophetic narrations with original Arabic script,
                English translations, narrators, and audio recitations.
              </p>
            </div>
          </div>

          {/* Featured Daily Hadith Spotlight */}
          {todayHadith && (
            <div
              onClick={() => {
                if (todayHadith.bookKey) {
                  setSelectedBookKey(todayHadith.bookKey);
                  if (todayHadith.chapterId != null) {
                    setSelectedChapterId(String(todayHadith.chapterId));
                  }
                }
              }}
              className="bg-card border border-primary/30 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Today's Selected Hadith</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {todayHadith.bookTitle} #{todayHadith.idInBook || todayHadith.id}
                </span>
              </div>

              {todayHadith.arabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-base sm:text-lg font-arabic text-right text-emerald-900 dark:text-emerald-200 leading-relaxed line-clamp-2 my-2"
                >
                  {todayHadith.arabic}
                </p>
              )}

              <p className="text-xs sm:text-sm text-foreground/90 line-clamp-2 font-medium">
                {todayHadith.narrator ? `${todayHadith.narrator} ` : ""}
                {typeof todayHadith.english === "string"
                  ? todayHadith.english
                  : todayHadith.english?.text}
              </p>

              <div className="flex items-center gap-1 text-xs font-bold text-primary mt-3 group-hover:translate-x-1 transition-transform">
                <span>Explore in {todayHadith.bookTitle}</span>
                <ChevronRight size={14} />
              </div>
            </div>
          )}

          {/* Collection Group Filter Tabs & Search */}
          <div className="space-y-3">
            {/* Search Collections */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                placeholder="Search collection name or author..."
                className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              {collectionSearch && (
                <button
                  onClick={() => setCollectionSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Groups Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs font-bold">
              <button
                onClick={() => setCollectionFilter("all")}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  collectionFilter === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                All Collections (17)
              </button>
              <button
                onClick={() => setCollectionFilter("the_9_books")}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  collectionFilter === "the_9_books"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                The 9 Major Books (9)
              </button>
              <button
                onClick={() => setCollectionFilter("forties")}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  collectionFilter === "forties"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                The 40 Hadiths (3)
              </button>
              <button
                onClick={() => setCollectionFilter("other_books")}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  collectionFilter === "other_books"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Classical Collections (5)
              </button>
            </div>
          </div>

          {/* 17 Collection Cards Listing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
              Select a Collection ({filteredCollections.length})
            </h3>

            {loadingCollections ? (
              <div className="py-16 text-center bg-card border border-border rounded-3xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">
                  Loading collections…
                </p>
              </div>
            ) : (
              filteredCollections.map((col, idx) => (
                <button
                  key={col.key}
                  onClick={() => {
                    setSelectedBookKey(col.key);
                    setSelectedChapterId("all");
                    setHadithSearch("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-md active:scale-[0.98] transition-all duration-300 text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0 font-bold text-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {col.canonicalTitle}
                      </p>
                      {col.titleAr && (
                        <span className="font-arabic text-sm text-primary/80 font-bold truncate">
                          {col.titleAr}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {col.authorEn || col.authorAr || "Prophetic Tradition"}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <span>{col.hadithsCount.toLocaleString()} Hadiths</span>
                      <span>•</span>
                      <span>{col.chaptersCount} Chapters</span>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                  />
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ─── LEVEL 2: INSIDE A SELECTED COLLECTION ───────────────────────────── */
        <div className="space-y-5 animate-in slide-in-from-right-8 fade-in duration-300">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setSelectedBookKey(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>All Collections</span>
            </button>

            <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10">
              {activeCollection?.hadithsCount.toLocaleString()} Hadiths
            </span>
          </div>

          {/* Collection Banner */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">
                {activeCollection?.canonicalTitle}
              </h2>
              {activeCollection?.titleAr && (
                <span className="font-arabic text-lg text-primary font-bold">
                  {activeCollection?.titleAr}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Author: {activeCollection?.authorEn || activeCollection?.authorAr}
            </p>
          </div>

          {/* Search & Chapter Filters */}
          <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={hadithSearch}
                onChange={(e) => {
                  setHadithSearch(e.target.value);
                  setDisplayCount(PAGE_SIZE);
                }}
                placeholder="Search hadith #, keyword, narrator, Arabic…"
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              {hadithSearch && (
                <button
                  onClick={() => setHadithSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Chapter & Sort Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Chapter Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Chapter ({activeCollection?.chaptersCount || 0})
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    setDisplayCount(PAGE_SIZE);
                  }}
                  className="w-full h-10 rounded-xl border border-border bg-secondary px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="all">
                    All Chapters ({activeCollection?.chaptersCount || 0})
                  </option>
                  {(activeCollection?.chapters || []).map((ch) => (
                    <option key={ch.id} value={String(ch.id)}>
                      {ch.id}. {ch.english || `Chapter ${ch.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-secondary px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="original">Original Source Order</option>
                  <option value="asc">Hadith Number (Ascending)</option>
                  <option value="desc">Hadith Number (Descending)</option>
                  <option value="saved_first">Saved Hadiths First</option>
                </select>
              </div>
            </div>

            {/* Filter Stats Bar */}
            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground font-medium">
              <span>
                Showing <strong className="text-foreground">{visibleHadiths.length}</strong> of{" "}
                <strong className="text-foreground">{filteredHadiths.length}</strong> hadiths
              </span>

              {(selectedChapterId !== "all" || hadithSearch.trim()) && (
                <button
                  onClick={() => {
                    setSelectedChapterId("all");
                    setHadithSearch("");
                  }}
                  className="text-primary hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Hadiths Cards Listing */}
          <div className="space-y-4">
            {loadingHadiths ? (
              <div className="py-20 text-center bg-card border border-border rounded-3xl space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Loading authentic Hadith records…
                </p>
              </div>
            ) : errorHadiths ? (
              <div className="py-12 text-center bg-card border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6">
                <p className="text-sm font-semibold text-rose-600 mb-2">{errorHadiths}</p>
                <button
                  onClick={() => setSelectedChapterId("all")}
                  className="text-xs font-bold text-primary underline"
                >
                  Reload all chapters
                </button>
              </div>
            ) : visibleHadiths.length === 0 ? (
              <div className="py-16 text-center bg-card border border-border rounded-3xl p-6 space-y-2">
                <Search size={28} className="text-muted-foreground mx-auto opacity-40 mb-1" />
                <h3 className="text-sm font-bold text-foreground">
                  No matching Hadiths found
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Try adjusting your search query or switching to All Chapters.
                </p>
              </div>
            ) : (
              visibleHadiths.map((hadith) => (
                <HadithCard
                  key={hadith.id}
                  hadith={hadith}
                  isSaved={isHadithSaved(hadith.id)}
                  onToggleSave={handleToggleSave}
                  onSelectChapter={(chId) => setSelectedChapterId(String(chId))}
                  onSelectHadith={(h) => setActiveReadingHadith(h)}
                />
              ))
            )}

            {/* Load More Button */}
            {!loadingHadiths && visibleHadiths.length < filteredHadiths.length && (
              <button
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                className="w-full py-3.5 rounded-2xl bg-secondary hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider border border-border transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2"
              >
                <span>Load More Hadiths ({filteredHadiths.length - visibleHadiths.length} remaining)</span>
                <ChevronDown size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── HADITH READER MODAL (FOCUSED READING EXPERIENCE) ────────────────────────── */}
      {activeReadingHadith && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {activeReadingHadith.bookTitle}
                </span>
                <h3 className="font-extrabold text-base text-foreground">
                  Hadith #{activeReadingHadith.idInBook ?? activeReadingHadith.id}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Font Size Toggle */}
                <button
                  onClick={() =>
                    setReaderFontSize(readerFontSize === "normal" ? "large" : "normal")
                  }
                  className="px-2.5 py-1 rounded-xl bg-secondary text-xs font-bold text-muted-foreground hover:text-foreground"
                  title="Toggle Arabic Font Size"
                >
                  {readerFontSize === "normal" ? "A+" : "A-"}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveReadingHadith(null);
                    window.speechSynthesis?.cancel();
                    setIsPlayingReaderAudio(false);
                  }}
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 select-text">
              {activeReadingHadith.chapterTitle && (
                <div className="p-2.5 rounded-xl bg-secondary/60 text-xs font-semibold text-muted-foreground">
                  Chapter: {activeReadingHadith.chapterTitle}
                </div>
              )}

              {/* Arabic Script */}
              {activeReadingHadith.arabic && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <p
                    dir="rtl"
                    lang="ar"
                    className={`font-arabic text-right text-emerald-950 dark:text-emerald-100 leading-loose ${
                      readerFontSize === "large" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {activeReadingHadith.arabic}
                  </p>
                </div>
              )}

              {/* Narrator */}
              {(activeReadingHadith.narrator || activeReadingHadith.english?.narrator) && (
                <p className="text-xs font-bold text-muted-foreground italic">
                  {activeReadingHadith.narrator || activeReadingHadith.english?.narrator}
                </p>
              )}

              {/* English Translation */}
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {typeof activeReadingHadith.english === "string"
                  ? activeReadingHadith.english
                  : activeReadingHadith.english?.text}
              </p>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-2">
              <button
                onClick={handlePrevHadith}
                disabled={currentReaderIndex <= 0}
                className="px-3 py-2 rounded-xl border border-border text-xs font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Prev
              </button>

              {/* Audio Listen */}
              {activeReadingHadith.arabic && (
                <button
                  onClick={handlePlayReaderSpeech}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPlayingReaderAudio
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {isPlayingReaderAudio ? <Pause size={13} /> : <Volume2 size={13} />}
                  <span>{isPlayingReaderAudio ? "Stop" : "Listen"}</span>
                </button>
              )}

              <button
                onClick={handleNextHadith}
                disabled={currentReaderIndex >= filteredHadiths.length - 1}
                className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 flex items-center gap-1"
              >
                Next <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
