import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  Compass,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import HadithCard from "./HadithCard";
import {
  getCollections,
  getChapterHadiths,
  getBookHadiths,
  getTodayHadith,
  normalizeArabic,
  getSavedHadiths,
  toggleSaveHadith,
  recordHadithView,
} from "@/lib/hadithService";
import { getLocalDateString } from "@/lib/prayerUtils";
import { useAuth } from "@/lib/AuthContext";

const PAGE_SIZE = 15;

export default function HadithTab() {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {}
  const userScope = user?.id ? `u_${user.id}_` : "";

  // Data states
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [todayHadith, setTodayHadith] = useState(null);
  const [savedHadiths, setSavedHadiths] = useState(() => getSavedHadiths(userScope));

  // Filter states
  const [selectedBookKey, setSelectedBookKey] = useState("nawawi40"); // start with concise popular collection
  const [selectedChapterId, setSelectedChapterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("original"); // "original" | "asc" | "desc" | "saved_first"
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Loaded hadiths for active collection/chapter
  const [currentHadiths, setCurrentHadiths] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [errorHadiths, setErrorHadiths] = useState(null);

  // Sync saved hadiths when userScope changes
  useEffect(() => {
    setSavedHadiths(getSavedHadiths(userScope));
  }, [userScope]);

  // Load collections & Today's Hadith on mount
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

  // Active collection object
  const activeCollection = useMemo(() => {
    return collections.find((c) => c.key === selectedBookKey) || collections[0] || null;
  }, [collections, selectedBookKey]);

  // Load Hadiths whenever selected collection or chapter changes
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!selectedBookKey) return;
      setLoadingHadiths(true);
      setErrorHadiths(null);
      setDisplayCount(PAGE_SIZE);

      try {
        if (selectedChapterId !== "all") {
          // Chapter-level on-demand loading
          const data = await getChapterHadiths(selectedBookKey, selectedChapterId);
          if (!mounted) return;
          const chapterName =
            activeCollection?.chapters?.find((c) => String(c.id) === String(selectedChapterId))?.english || "";

          const mapped = (data.hadiths || []).map((h) => ({
            ...h,
            bookKey: selectedBookKey,
            bookTitle: activeCollection?.canonicalTitle || activeCollection?.titleEn || "Hadith",
            chapterTitle: chapterName || data.chapter?.english || "",
          }));
          setCurrentHadiths(mapped);
        } else {
          // Full-book on-demand loading
          const data = await getBookHadiths(selectedBookKey);
          if (!mounted) return;
          const chaptersMap = new Map();
          (data?.chapters || []).forEach((c) => chaptersMap.set(String(c.id), c.english));

          const mapped = (data?.hadiths || []).map((h) => ({
            ...h,
            bookKey: selectedBookKey,
            bookTitle: activeCollection?.canonicalTitle || activeCollection?.titleEn || "Hadith",
            chapterTitle: chaptersMap.get(String(h.chapterId)) || "",
          }));
          setCurrentHadiths(mapped);
        }
      } catch (err) {
        if (mounted) setErrorHadiths("Failed to load Hadiths for this collection.");
      } finally {
        if (mounted) setLoadingHadiths(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [selectedBookKey, selectedChapterId, activeCollection]);

  // Handle Save / Unsave
  const handleToggleSave = (hadith) => {
    const updated = toggleSaveHadith(hadith, userScope);
    setSavedHadiths(updated);
  };

  // Jump to Today's Hadith in Library
  const handleJumpToDaily = () => {
    if (!todayHadith) return;
    if (todayHadith.bookKey) {
      setSelectedBookKey(todayHadith.bookKey);
      if (todayHadith.chapterId != null) {
        setSelectedChapterId(String(todayHadith.chapterId));
      } else {
        setSelectedChapterId("all");
      }
      setSearchQuery(String(todayHadith.idInBook || todayHadith.id));
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedChapterId("all");
    setSearchQuery("");
    setSortOrder("original");
    setDisplayCount(PAGE_SIZE);
  };

  // Filter & Search & Sort Hadiths
  const filteredHadiths = useMemo(() => {
    let result = [...currentHadiths];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const normQ = normalizeArabic(q);

      result = result.filter((h) => {
        const enText = (typeof h.english === "string" ? h.english : h.english?.text || "").toLowerCase();
        const narrator = (h.narrator || h.english?.narrator || "").toLowerCase();
        const numStr = String(h.idInBook ?? h.id);
        const chapterName = (h.chapterTitle || "").toLowerCase();

        // Match English, narrator, number, or chapter
        if (
          enText.includes(q) ||
          narrator.includes(q) ||
          numStr === q ||
          chapterName.includes(q)
        ) {
          return true;
        }

        // Match Arabic text
        if (h.arabic) {
          const normAr = normalizeArabic(h.arabic);
          if (normAr.includes(normQ)) return true;
        }

        return false;
      });
    }

    // Sort Order
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
  }, [currentHadiths, searchQuery, sortOrder, savedHadiths]);

  // Sliced for pagination
  const visibleHadiths = useMemo(() => {
    return filteredHadiths.slice(0, displayCount);
  }, [filteredHadiths, displayCount]);

  const savedIdsSet = useMemo(() => {
    return new Set(savedHadiths.map((s) => s.id));
  }, [savedHadiths]);

  const hasActiveFilters = selectedChapterId !== "all" || searchQuery.trim() !== "" || sortOrder !== "original";

  return (
    <div className="space-y-4 text-left pb-12">
      {/* ─── Featured Daily Hadith Card ────────────────────────────────────── */}
      {todayHadith && (
        <section className="bg-gradient-to-br from-[#134D37] to-[#1E6047] text-white rounded-[24px] p-5 shadow-sm border border-[#134D37] relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-emerald-200">
                <Sparkles size={15} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                TODAY'S HADITH
              </span>
            </div>

            <span className="text-[11px] text-emerald-200/90 font-medium">
              {todayHadith.bookTitle} #{todayHadith.idInBook || todayHadith.id}
            </span>
          </div>

          {/* Arabic text snippet */}
          <p
            dir="rtl"
            lang="ar"
            className="text-[17px] sm:text-[18px] font-['Amiri',serif] leading-relaxed text-emerald-50 mb-3 text-right"
          >
            {todayHadith.arabic?.length > 250
              ? todayHadith.arabic.slice(0, 240) + "…"
              : todayHadith.arabic}
          </p>

          {/* English translation */}
          <p className="text-sm leading-relaxed text-emerald-100/95 font-sans mb-4">
            {todayHadith.narrator ? `${todayHadith.narrator} ` : ""}
            {typeof todayHadith.english === "string" ? todayHadith.english : todayHadith.english?.text}
          </p>

          {/* Jump to Library action */}
          <div className="flex items-center justify-between pt-3 border-t border-white/15">
            <span className="text-xs text-emerald-200/90 font-medium">
              {activeCollection?.canonicalTitle || "Canonical Collections"}
            </span>
            <button
              type="button"
              onClick={handleJumpToDaily}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all active:scale-[0.98]"
            >
              <span>View in Library</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </section>
      )}

      {/* ─── Hadith Library Filter & Search Controls ────────────────────────── */}
      <section className="bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#134D37] dark:text-primary" />
            <h2 className="text-base font-bold text-stone-900 dark:text-foreground">
              Hadith Library
            </h2>
          </div>

          <span className="text-xs font-medium text-[#77766F] dark:text-muted-foreground tabular-nums">
            50,884 Available
          </span>
        </div>

        {/* 1. Search Bar with Instant Reset */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(PAGE_SIZE);
            }}
            placeholder="Search by English, Arabic, narrator, number…"
            className="w-full bg-[#FAF8F5] dark:bg-secondary border border-[#E7E2D9] dark:border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#134D37]/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* 2. Collection Selector (17 collections) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider">
            Collection (17 Available)
          </label>
          <select
            value={selectedBookKey}
            onChange={(e) => {
              setSelectedBookKey(e.target.value);
              setSelectedChapterId("all");
              setDisplayCount(PAGE_SIZE);
            }}
            className="w-full h-11 rounded-xl border border-[#E7E2D9] dark:border-border bg-[#FAF8F5] dark:bg-secondary px-3.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#134D37]/30 cursor-pointer"
          >
            {collections.map((col) => (
              <option key={col.key} value={col.key}>
                {col.canonicalTitle} ({col.hadithsCount.toLocaleString()} Hadiths)
              </option>
            ))}
          </select>
        </div>

        {/* 3. Chapter Selector & Sort Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Chapter Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider">
              Chapter
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value);
                setDisplayCount(PAGE_SIZE);
              }}
              className="w-full h-10 rounded-xl border border-[#E7E2D9] dark:border-border bg-[#FAF8F5] dark:bg-secondary px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#134D37]/30 cursor-pointer"
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

          {/* Sort Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E7E2D9] dark:border-border bg-[#FAF8F5] dark:bg-secondary px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#134D37]/30 cursor-pointer"
            >
              <option value="original">Original Source Order</option>
              <option value="asc">Hadith Number (Ascending)</option>
              <option value="desc">Hadith Number (Descending)</option>
              <option value="saved_first">Saved Hadiths First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Reset Button */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <p className="text-[#6E685F] dark:text-muted-foreground font-medium">
            Showing <span className="font-semibold text-stone-900 dark:text-foreground">{visibleHadiths.length}</span> of{" "}
            <span className="font-semibold text-stone-900 dark:text-foreground">{filteredHadiths.length}</span> hadiths
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-[#134D37] dark:text-primary font-medium hover:underline"
            >
              <RotateCcw size={11} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* ─── Hadith Records List ────────────────────────────────────────────── */}
      <section className="space-y-3.5">
        {loadingHadiths ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-6">
            <div className="w-8 h-8 border-2 border-[#134D37] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#77766F] font-medium">
              Loading authentic Hadith records…
            </p>
          </div>
        ) : errorHadiths ? (
          <div className="py-12 text-center bg-white dark:bg-card border border-red-200 rounded-[22px] p-6">
            <p className="text-sm font-semibold text-red-600 mb-1">{errorHadiths}</p>
            <button
              type="button"
              onClick={() => setSelectedChapterId("all")}
              className="text-xs font-medium text-[#134D37] underline"
            >
              Try loading all chapters
            </button>
          </div>
        ) : visibleHadiths.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-card border border-[#E7E2D9] dark:border-border rounded-[22px] p-6 space-y-2">
            <Search size={28} className="text-[#8C857B] mx-auto opacity-40 mb-1" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-foreground">
              No matching Hadiths found
            </h3>
            <p className="text-xs text-[#77766F] max-w-xs mx-auto">
              No records in this collection match your search query. Try clearing filters or searching for another keyword.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E4EEE7] text-[#134D37]"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          visibleHadiths.map((hadith) => (
            <HadithCard
              key={`${hadith.bookKey || selectedBookKey}_${hadith.id}`}
              hadith={hadith}
              isSaved={savedIdsSet.has(hadith.id)}
              onToggleSave={handleToggleSave}
              onSelectCollection={(bk) => {
                setSelectedBookKey(bk);
                setSelectedChapterId("all");
              }}
              onSelectChapter={(chId) => setSelectedChapterId(String(chId))}
            />
          ))
        )}

        {/* Load More Pagination */}
        {!loadingHadiths && visibleHadiths.length < filteredHadiths.length && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
              className="px-6 py-3 rounded-2xl bg-[#E4EEE7] hover:bg-[#D5E5DA] text-[#134D37] font-semibold text-xs transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
            >
              Load More Hadiths ({filteredHadiths.length - visibleHadiths.length} remaining)
            </button>
          </div>
        )}
      </section>

      {/* ─── Source Attribution & Metadata Footer ───────────────────────────── */}
      <footer className="text-center pt-4 pb-2 text-[11px] text-[#8C857B] dark:text-muted-foreground border-t border-[#E7E2D9] dark:border-border">
        <p>
          Dataset: <span className="font-semibold text-stone-700 dark:text-stone-300">AhmedBaset/hadith-json (v1.2.0)</span> via Sunnah.com
        </p>
        <p className="mt-0.5">
          Includes all 17 canonical collections (50,884 Hadiths) with preserved Arabic & English texts.
        </p>
      </footer>
    </div>
  );
}
