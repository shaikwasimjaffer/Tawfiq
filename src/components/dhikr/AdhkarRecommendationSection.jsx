import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Plus,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { MORNING_EVENING_ADHKAR } from "@/data/dhikrData";

/**
 * Morning and Evening Adhkar Recommendation Section
 * Time-aware guidance: Morning (Fajr - Dhuhr, 4:00 - 12:00) & Evening (Asr - Isha, 15:30 - 23:59).
 * Session progress is stored independently in localStorage per date and period.
 */
export default function AdhkarRecommendationSection({
  todayDateStr,
  currentHour = new Date().getHours(),
}) {
  // Determine time-aware default period: morning (4 to 12), evening (15 to 24), default to whichever is closer
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 15 && currentHour <= 23;

  const defaultPeriod = isMorningTime
    ? "morning"
    : isEveningTime
    ? "evening"
    : currentHour < 4
    ? "evening"
    : "morning";

  // Allow user to toggle between Morning & Evening recommendations tab
  const [activeSession, setActiveSession] = useState(defaultPeriod);

  // Active recitation item id (null if collapsed, or item.id)
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Storage key for Morning/Evening session counts: tawfiq_adhkar_session_{date}
  const sessionKey = `tawfiq_adhkar_sessions_${todayDateStr}`;

  const [sessionData, setSessionData] = useState(() => {
    try {
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      morning: {},
      evening: {},
    };
  });

  // Re-sync on day boundary
  useEffect(() => {
    try {
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        setSessionData(JSON.parse(stored));
      } else {
        setSessionData({ morning: {}, evening: {} });
      }
    } catch {
      setSessionData({ morning: {}, evening: {} });
    }
  }, [sessionKey]);

  // Persist session counts
  useEffect(() => {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    } catch {}
  }, [sessionData, sessionKey]);

  // Filter items matching current session
  const sessionItems = MORNING_EVENING_ADHKAR.filter((item) =>
    item.sessions.includes(activeSession)
  );

  // Active session counts
  const currentCounts = sessionData[activeSession] || {};

  // Calculate completed count
  const completedItemsCount = sessionItems.filter(
    (item) => (currentCounts[item.id] || 0) >= item.target
  ).length;

  const totalSessionItems = sessionItems.length;
  const isSessionFullyCompleted =
    totalSessionItems > 0 && completedItemsCount === totalSessionItems;

  // Handle counter click for a specific item in the session
  const handleCountItem = (itemId, target, e) => {
    if (e) e.stopPropagation();

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }

    setSessionData((prev) => {
      const activeMap = { ...(prev[activeSession] || {}) };
      const currentVal = activeMap[itemId] || 0;
      if (currentVal < target) {
        activeMap[itemId] = currentVal + 1;
      } else {
        // already completed, increment or keep at target
        activeMap[itemId] = currentVal + 1;
      }
      return {
        ...prev,
        [activeSession]: activeMap,
      };
    });
  };

  // Reset a specific item's count in the current session
  const handleResetItem = (itemId, e) => {
    if (e) e.stopPropagation();
    setSessionData((prev) => {
      const activeMap = { ...(prev[activeSession] || {}) };
      delete activeMap[itemId];
      return {
        ...prev,
        [activeSession]: activeMap,
      };
    });
  };

  return (
    <section className="bg-white rounded-[22px] p-5 border border-[#E7E2D9] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-4">
      {/* Header with Title and Session Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#134D37] bg-[#E3EEE6] px-2 py-0.5 rounded-md">
              Recommended Sunnah
            </span>
            {(isMorningTime && activeSession === "morning") ||
            (isEveningTime && activeSession === "evening") ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Current Time
              </span>
            ) : null}
          </div>
          <h3 className="text-[19px] sm:text-[20px] font-bold text-stone-900 leading-tight mt-1">
            {activeSession === "morning" ? "Morning Adhkar" : "Evening Adhkar"}
          </h3>
          <p className="text-xs text-[#726B60] mt-0.5">
            {activeSession === "morning"
              ? "Authentic remembrances recited after Fajr until sunrise / midday."
              : "Authentic remembrances recited after 'Asr until Maghrib / nightfall."}
          </p>
        </div>

        {/* Tab switch between Morning & Evening */}
        <div className="inline-flex items-center gap-1 bg-[#F5F2EA] p-1 rounded-xl border border-[#EBE4D7] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSession("morning");
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSession === "morning"
                ? "bg-[#134D37] text-white shadow-xs"
                : "text-[#726B60] hover:text-[#134D37]"
            }`}
          >
            <Sun size={13} className={activeSession === "morning" ? "text-amber-300" : ""} />
            <span>Morning</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSession("evening");
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSession === "evening"
                ? "bg-[#134D37] text-white shadow-xs"
                : "text-[#726B60] hover:text-[#134D37]"
            }`}
          >
            <Moon size={13} className={activeSession === "evening" ? "text-blue-200" : ""} />
            <span>Evening</span>
          </button>
        </div>
      </div>

      {/* Session Progress Overview Bar */}
      <div className="bg-[#FAF8F5] border border-[#EFE9DF] rounded-xl p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#6E685F] font-medium">Session completion</span>
          <div className="flex items-center gap-1.5">
            {isSessionFullyCompleted && (
              <span className="text-[11px] font-semibold text-[#134D37] bg-[#E3EEE6] px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} />
                All Completed
              </span>
            )}
            <span className="text-[#134D37] font-bold tabular-nums">
              {completedItemsCount} of {totalSessionItems} completed
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-[#EAE5DD] rounded-full overflow-hidden border border-[#DFD9CD]">
          <div
            className="h-full bg-[#134D37] rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.round((completedItemsCount / (totalSessionItems || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Adhkar Items Accordion / Recitation Cards */}
      <div className="space-y-2.5">
        {sessionItems.map((item, index) => {
          const count = currentCounts[item.id] || 0;
          const isItemCompleted = count >= item.target;
          const isExpanded = selectedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`border rounded-2xl transition-all duration-200 ${
                isItemCompleted
                  ? "bg-[#F7FAF8] border-[#CFDFD5]"
                  : isExpanded
                  ? "bg-[#FCFBF8] border-[#D8CEBF] shadow-xs"
                  : "bg-white border-[#E7E2D9] hover:border-[#D5CDBD]"
              }`}
            >
              {/* Card Summary Header */}
              <div
                onClick={() => setSelectedItemId(isExpanded ? null : item.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedItemId(isExpanded ? null : item.id);
                  }
                }}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isItemCompleted
                        ? "bg-[#134D37] text-white"
                        : "bg-[#F5F2EA] text-[#726B60] border border-[#EBE4D7]"
                    }`}
                  >
                    {isItemCompleted ? <CheckCircle2 size={15} /> : index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-stone-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-medium text-[#726B60] bg-[#FAF8F5] border border-[#EBE4D7] px-1.5 py-0.5 rounded-md shrink-0">
                        {item.target > 1 ? `${item.target}×` : "1×"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#726B60] truncate">{item.reference}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick counter badge */}
                  <span
                    className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${
                      isItemCompleted
                        ? "bg-[#E3EEE6] text-[#134D37]"
                        : count > 0
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-[#FAF8F5] text-[#726B60] border border-[#EBE4D7]"
                    }`}
                  >
                    {count}/{item.target}
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={17} className="text-[#726B60]" />
                  ) : (
                    <ChevronRight size={17} className="text-[#726B60]" />
                  )}
                </div>
              </div>

              {/* Expanded Recitation View */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#F0EBE1] space-y-3.5">
                  {/* Note / Context */}
                  {item.note && (
                    <p className="text-[12px] text-[#635D53] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFE9DF] leading-relaxed">
                      <span className="font-semibold text-stone-800">Virtue & Context: </span>
                      {item.note}
                    </p>
                  )}

                  {/* Arabic Text */}
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EFE9DF] text-center">
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-[24px] sm:text-[26px] font-bold text-[#134D37] leading-[1.8] tracking-normal"
                      style={{
                        fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif",
                      }}
                    >
                      {item.arabic}
                    </p>
                  </div>

                  {/* Transliteration */}
                  {item.transliteration && (
                    <div className="text-[13px] text-[#5C574F] italic leading-relaxed">
                      <span className="font-semibold not-italic text-stone-700">
                        Transliteration:{" "}
                      </span>
                      {item.transliteration}
                    </div>
                  )}

                  {/* English Translation */}
                  <div className="text-[13px] text-stone-800 leading-relaxed">
                    <span className="font-semibold text-[#134D37]">Translation: </span>
                    {item.translation}
                  </div>

                  {/* Counter Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-xs text-[#726B60]">
                      <BookOpen size={14} className="text-[#134D37]" />
                      <span>{item.reference}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handleResetItem(item.id, e)}
                          className="h-9 px-3 text-xs font-semibold text-[#726B60] hover:text-stone-900 bg-[#F5F2EA] hover:bg-[#EBE4D7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Reset count for this dhikr"
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleCountItem(item.id, item.target, e)}
                        className={`h-9 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                          isItemCompleted
                            ? "bg-[#134D37] text-white hover:bg-[#0E3D2B]"
                            : "bg-[#134D37] text-white hover:bg-[#0E3D2B]"
                        }`}
                        aria-label={`Count ${item.title}`}
                      >
                        <Plus size={14} />
                        <span>
                          {isItemCompleted ? `Recited (${count})` : `Count (${count}/${item.target})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
