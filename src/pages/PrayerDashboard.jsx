import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  Flame,
  Users,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  X,
  PlusCircle,
  Plus,
  RotateCcw,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TawfiqHeader from "@/components/TawfiqHeader";
import DailyVerseCarousel from "@/components/DailyVerseCarousel";
import AzanSettingsModal from "@/components/prayer/AzanSettingsModal";
import FloatingAzanPlayer from "@/components/prayer/FloatingAzanPlayer";
import {
  PRAYERS,
  PRAYER_NAMES,
  getNextPrayerInfo,
  getHijriDate,
  getLocalDateString,
  hasQualifyingPrayer,
  VOLUNTARY_PRAYERS,
  VOLUNTARY_PRAYER_NAMES,
  getVoluntaryPrayerInfo,
  SUNNAH_RAWATIB,
  TOTAL_SUNNAH_RAKAHS,
  calculateCompletedSunnahRakahs,
} from "@/lib/prayerUtils";
import { azanScheduler } from "@/lib/azanScheduler";
import { getSavedLocation, getCalculationPreferences } from "@/lib/locationService";
import { useQaza } from "@/lib/useQaza";
import { usePrayerStreak } from "@/lib/usePrayerStreak";
import { toast } from "sonner";

/**
 * Status button styling and logging options configuration:
 * Uses soft sage surfaces and deep forest greens rather than loud neon buttons.
 */
const STATUS_CONFIG = {
  unprayed: {
    label: "Mark Salah",
    sublabel: "Tap to record Salah",
    badge: "border border-[#DDD7CD] text-[#6E685F] bg-[#FAF8F5]/80 hover:bg-[#F2ECE1] focus-visible:ring-2 focus-visible:ring-stone-400/40",
    icon: null,
  },
  on_time: {
    label: "On time",
    sublabel: "Prayed within its prescribed window",
    badge: "bg-[#E3EEE6] text-[#1B4332] border border-[#BFD9C7] font-medium hover:bg-[#D9E8DD] focus-visible:ring-2 focus-visible:ring-[#1B4332]/30",
    icon: CheckCircle2,
    accent: "text-[#1B4332] bg-[#E3EEE6]",
  },
  jamaah: {
    label: "With Jama'ah",
    sublabel: "Prayed in congregation with extra reward",
    badge: "bg-[#DFEDE4] text-[#163B2C] border border-[#B5D3C0] font-medium hover:bg-[#D5E6DC] focus-visible:ring-2 focus-visible:ring-[#163B2C]/30",
    icon: Users,
    accent: "text-[#163B2C] bg-[#DFEDE4]",
  },
  late: {
    label: "Late (Made up)",
    sublabel: "Prayed after its appointed time",
    badge: "bg-[#F5EEDF] text-[#745517] border border-[#E3D6BC] font-medium hover:bg-[#EDE3CE] focus-visible:ring-2 focus-visible:ring-[#745517]/30",
    icon: Clock,
    accent: "text-[#745517] bg-[#F5EEDF]",
  },
  missed: {
    label: "Missed",
    sublabel: "Missed this prayer • Automatically added to Qaza debt",
    badge: "bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4] font-medium hover:bg-[#FBD5D5] focus-visible:ring-2 focus-visible:ring-[#9B1C1C]/30",
    icon: XCircle,
    accent: "text-[#9B1C1C] bg-[#FDE8E8]",
  },
};

const LOG_OPTIONS = [
  {
    key: "on_time",
    title: "Prayed On Time",
    description: "Prayed promptly within time",
    icon: CheckCircle2,
    badgeBg: "bg-[#E3EEE6]",
    badgeText: "text-[#1B4332]",
    border: "border-[#BFD9C7]",
  },
  {
    key: "jamaah",
    title: "With Jama'ah",
    description: "In congregation at the Masjid or at home",
    icon: Users,
    badgeBg: "bg-[#DFEDE4]",
    badgeText: "text-[#163B2C]",
    border: "border-[#B5D3C0]",
  },
  {
    key: "late",
    title: "Prayed Late (Qada)",
    description: "Completed after the appointed time has passed",
    icon: Clock,
    badgeBg: "bg-[#F5EEDF]",
    badgeText: "text-[#745517]",
    border: "border-[#E3D6BC]",
  },
  {
    key: "missed",
    title: "Missed Prayer",
    description: "Unable to pray • Automatically adds +1 to your Qaza debt",
    icon: XCircle,
    badgeBg: "bg-[#FDE8E8]",
    badgeText: "text-[#9B1C1C]",
    border: "border-[#F8B4B4]",
    isMissed: true,
  },
];

/**
 * Authentic Daily Dhikr collection:
 * Uses verified Sunnah adhkar with standard 33 target for daily tasbih.
 */
const DHIKR_ITEMS = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    target: 33,
  },
];

export default function PrayerDashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const { qaza, total, history, recordDebtAdjustment } = useQaza();

  // Location, Calculation preferences, and Azan Settings modal state
  const [location, setLocation] = useState(getSavedLocation());
  const [calcPrefs, setCalcPrefs] = useState(getCalculationPreferences());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [schedSettings, setSchedSettings] = useState(azanScheduler.getSettings());

  // Subscribe to Azan scheduler settings changes
  useEffect(() => {
    return azanScheduler.subscribe((data) => {
      setSchedSettings(data.settings);
    });
  }, []);

  // Update clock every second for precise live countdown & automatic prayer transitions.
  // Also recalculate immediately when tab visibility changes or window gains focus (e.g. mobile/tab wake-up after midnight).
  useEffect(() => {
    const syncTime = () => setNow(new Date());
    const timer = setInterval(syncTime, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncTime();
      }
    };
    const handleFocus = () => syncTime();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const prayerInfo = useMemo(
    () => getNextPrayerInfo(now, location, calcPrefs),
    [now, location, calcPrefs]
  );

  // Compute live numeric countdown: HH:MM:SS (compact, tabular-nums, sans-serif)
  const countdownData = useMemo(() => {
    if (!prayerInfo?.nextDate) return null;
    const diffMs = Math.max(0, prayerInfo.nextDate.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    const hStr = pad(hrs);
    const mStr = pad(mins);
    const sStr = pad(secs);
    return {
      hrs: hStr,
      mins: mStr,
      secs: sStr,
      formatted: `${hStr}:${mStr}:${sStr}`,
    };
  }, [now, prayerInfo?.nextDate]);

  const voluntaryInfo = useMemo(
    () => getVoluntaryPrayerInfo(now, location, calcPrefs),
    [now, location, calcPrefs]
  );

  const todayDateStr = useMemo(
    () => getLocalDateString(now, location?.timezone),
    [now, location?.timezone]
  );
  const { currentStreak, longestStreak, recordDayStatuses, userScope } = usePrayerStreak(now);

  // Today's 12 Daily Sunnah Prayers (Sunan al-Rawatib) state stored in localStorage:
  // Key format: tawfiq_sunnah_rawatib_${userScope}${todayDateStr}
  // Shape: { fajr: { before: true }, dhuhr: { before: true, after: false }, maghrib: { after: true }, isha: { after: false } }
  const sunnahTodayKey = `tawfiq_sunnah_rawatib_${userScope}${todayDateStr}`;
  const [sunnahStatuses, setSunnahStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(sunnahTodayKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Re-sync 12 Sunnah prayers whenever calendar date or user account changes (automatic midnight rollover / app resume)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(sunnahTodayKey);
      setSunnahStatuses(stored ? JSON.parse(stored) : {});
    } catch {
      setSunnahStatuses({});
    }
  }, [sunnahTodayKey]);

  // Selected Sunnah prayer for bottom sheet logging modal
  const [selectedSunnahForLog, setSelectedSunnahForLog] = useState(null);

  /**
   * Toggles completion status of a specific Sunnah set (e.g. prayerKey: "dhuhr", setId: "before")
   */
  const handleToggleSunnahSet = (prayerKey, setId) => {
    if (!prayerKey || !setId) return;
    setSunnahStatuses((prev) => {
      const prevPrayerObj = prev[prayerKey] || {};
      const isCurrentlyCompleted = !!prevPrayerObj[setId];
      const updated = {
        ...prev,
        [prayerKey]: {
          ...prevPrayerObj,
          [setId]: !isCurrentlyCompleted,
        },
      };

      try {
        localStorage.setItem(sunnahTodayKey, JSON.stringify(updated));
      } catch {}

      const prayerConfig = SUNNAH_RAWATIB.find((p) => p.prayerKey === prayerKey);
      const setConfig = prayerConfig?.sets.find((s) => s.id === setId);

      if (!isCurrentlyCompleted) {
        toast.success(`Marked ${prayerConfig?.name || prayerKey} ${setConfig?.label || ""} (${setConfig?.rakahs || 2} Rak'ahs) as completed.`, {
          description: "May Allah build for you a home in Jannah.",
        });
      } else {
        toast.info(`Unmarked ${prayerConfig?.name || prayerKey} ${setConfig?.label || ""}.`);
      }

      return updated;
    });
  };

  const completedSunnahRakahs = useMemo(
    () => calculateCompletedSunnahRakahs(sunnahStatuses),
    [sunnahStatuses]
  );

  // Today's voluntary prayer statuses stored in localStorage (preserved for compatibility)
  const voluntaryTodayKey = `tawfiq_voluntary_prayers_${userScope}${todayDateStr}`;
  const [voluntaryPrayerStatuses, setVoluntaryPrayerStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(voluntaryTodayKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Re-sync voluntary prayers whenever calendar date or user account changes (e.g. midnight rollover)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(voluntaryTodayKey);
      setVoluntaryPrayerStatuses(stored ? JSON.parse(stored) : {});
    } catch {
      setVoluntaryPrayerStatuses({});
    }
  }, [voluntaryTodayKey]);

  const handleToggleVoluntaryPrayer = (key) => {
    if (!key) return;
    setVoluntaryPrayerStatuses((prev) => {
      const isCurrentlyCompleted = !!prev[key];
      const updated = { ...prev, [key]: !isCurrentlyCompleted };
      try {
        localStorage.setItem(voluntaryTodayKey, JSON.stringify(updated));
      } catch {}
      if (!isCurrentlyCompleted) {
        toast.success(`Marked ${VOLUNTARY_PRAYER_NAMES[key] || key} prayer as completed.`);
      } else {
        toast.info(`Unmarked ${VOLUNTARY_PRAYER_NAMES[key] || key} prayer.`);
      }
      return updated;
    });
  };

  // Today's prayer statuses stored in localStorage (defaults to unrecorded / unprayed for a clean day)
  const todayKey = `tawfiq_prayers_${userScope}${todayDateStr}`;
  const [prayerStatuses, setPrayerStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(todayKey);
      if (stored) return JSON.parse(stored);
      // Safe fallback for legacy key using UTC date format
      const legacyKey = `tawfiq_prayers_${now.toISOString().split("T")[0]}`;
      if (legacyKey !== todayKey) {
        const legacyStored = localStorage.getItem(legacyKey);
        if (legacyStored) return JSON.parse(legacyStored);
      }
    } catch {}
    return {};
  });

  // Re-sync daily prayers whenever calendar date or user changes (automatic midnight rollover / app resume)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(todayKey);
      if (stored) {
        setPrayerStatuses(JSON.parse(stored));
      } else {
        // Safe check for legacy key
        const legacyKey = `tawfiq_prayers_${now.toISOString().split("T")[0]}`;
        const legacyStored = legacyKey !== todayKey ? localStorage.getItem(legacyKey) : null;
        setPrayerStatuses(legacyStored ? JSON.parse(legacyStored) : {});
      }
    } catch {
      setPrayerStatuses({});
    }
  }, [todayKey]);

  // Ensure streak index is synchronized with today's status on mount or date/user change
  useEffect(() => {
    if (hasQualifyingPrayer(prayerStatuses)) {
      recordDayStatuses(todayDateStr, prayerStatuses);
    }
  }, [todayDateStr, userScope, prayerStatuses, recordDayStatuses]);

  // Selected prayer for bottom drawer sheet
  const [selectedPrayerForLog, setSelectedPrayerForLog] = useState(null);

  /**
   * Sets prayer status with smart Qaza synchronization:
   * - If transitioning to "missed" from a non-missed state: automatically calls adjust(prayerKey, +1)
   * - If transitioning away from "missed" (e.g. user corrected mistake): automatically calls adjust(prayerKey, -1)
   */
  const handleSetPrayerStatus = (prayerKey, newStatus) => {
    if (!prayerKey || !newStatus) return;

    setPrayerStatuses((prev) => {
      const current = prev[prayerKey] || "unprayed";
      if (current === newStatus) return prev;

      const updated = { ...prev, [prayerKey]: newStatus };
      try {
        localStorage.setItem(todayKey, JSON.stringify(updated));
      } catch {}

      // Synchronize prayer streak
      recordDayStatuses(todayDateStr, updated);

      // Automatic Qaza integration:
      if (newStatus === "missed" && current !== "missed") {
        recordDebtAdjustment(prayerKey, 1, {
          category: "today_salah_missed",
          reason: `Logged missed in today's daily Salah dashboard`,
        });
        toast.info(`Added 1 missed ${PRAYER_NAMES[prayerKey]} to your Qaza debt.`, {
          description: "May Allah make it easy for you to make it up soon.",
        });
      } else if (current === "missed" && newStatus !== "missed") {
        // Revert 1 from Qaza if user mistakenly logged it as missed earlier without falsifying completion count
        recordDebtAdjustment(prayerKey, -1, {
          category: "revert_today_missed",
          reason: `Reverted missed status for today's Salah`,
        });
        toast.success(`Removed 1 ${PRAYER_NAMES[prayerKey]} from Qaza debt.`);
      } else if (newStatus === "unprayed") {
        toast.info(`Reset ${PRAYER_NAMES[prayerKey]} to unprayed.`);
      } else {
        toast.success(`Marked ${PRAYER_NAMES[prayerKey]} as completed.`, {
          description: "May Allah accept your Salah.",
          action: {
            label: "Undo",
            onClick: () => handleSetPrayerStatus(prayerKey, "unprayed"),
          },
        });
      }

      return updated;
    });

    setSelectedPrayerForLog(null);
  };

  const completedCount = useMemo(() => {
    return PRAYERS.filter((p) => {
      const st = prayerStatuses[p];
      return st && st !== "unprayed" && st !== "missed";
    }).length;
  }, [prayerStatuses]);

  // Daily Dhikr state stored in localStorage for today (respects local prayer calendar date)
  const dhikrStorageKey = `tawfiq_daily_dhikr_${todayDateStr}`;
  const [dhikrState, setDhikrState] = useState(() => {
    try {
      const stored = localStorage.getItem(dhikrStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          count: typeof parsed.count === "number" && parsed.count >= 0 ? parsed.count : 0,
          index:
            typeof parsed.index === "number" &&
            parsed.index >= 0 &&
            parsed.index < DHIKR_ITEMS.length
              ? parsed.index
              : 0,
        };
      }
    } catch {
      return { count: 0, index: 0 };
    }
    return { count: 0, index: 0 };
  });

  // Re-sync dhikr state on day boundary
  useEffect(() => {
    try {
      const stored = localStorage.getItem(dhikrStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDhikrState({
          count: typeof parsed.count === "number" && parsed.count >= 0 ? parsed.count : 0,
          index:
            typeof parsed.index === "number" &&
            parsed.index >= 0 &&
            parsed.index < DHIKR_ITEMS.length
              ? parsed.index
              : 0,
        });
      } else {
        setDhikrState({ count: 0, index: 0 });
      }
    } catch {
      setDhikrState({ count: 0, index: 0 });
    }
  }, [dhikrStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(dhikrStorageKey, JSON.stringify(dhikrState));
    } catch {}
  }, [dhikrState, dhikrStorageKey]);

  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const resetTimerRef = useRef(null);

  const currentDhikr = DHIKR_ITEMS[dhikrState.index] || DHIKR_ITEMS[0];
  const isDhikrCompleted = dhikrState.count >= currentDhikr.target;

  // Clean up confirmation timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCountDhikr = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (isResetConfirming) {
      setIsResetConfirming(false);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    }

    // Gentle tactile feedback if supported on mobile devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    if (isDhikrCompleted) {
      // Seamlessly advance to the next authentic dhikr in the Sunnah sequence with reset count
      setDhikrState((prev) => ({
        index: (prev.index + 1) % DHIKR_ITEMS.length,
        count: 0,
      }));
    } else {
      setDhikrState((prev) => ({
        ...prev,
        count: prev.count + 1,
      }));
    }
  };

  const handleResetClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (dhikrState.count === 0) return;

    if (isResetConfirming) {
      // Deliberate confirmation tap: resets count safely to 0
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setIsResetConfirming(false);
      setDhikrState((prev) => ({
        ...prev,
        count: 0,
      }));
    } else {
      // First tap prompts confirmation for 3.5 seconds
      setIsResetConfirming(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsResetConfirming(false);
      }, 3500);
    }
  };

  return (
    <div className="w-full bg-[#F7F5EF] text-stone-900 pb-28 font-sans select-none">
      <main className="max-w-md mx-auto px-4 pt-2 space-y-3.5">
        {/* Zomato-inspired Integrated Header (Location & Profile) */}
        <TawfiqHeader
          location={location}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Next Namaz Hero Card: Immersive Mecca Dawn Photography */}
        <section className="relative overflow-hidden rounded-[26px] text-white shadow-[0_8px_20px_-6px_rgba(15,35,26,0.14),0_2px_6px_-1px_rgba(0,0,0,0.04)] border border-[#3A5D4D]/25 isolate flex flex-col justify-between min-h-[220px]">
          {/* Dawn Kaaba Photograph Background - Positioned to showcase Kaaba, minarets, and dawn light */}
          <img
            src="/kaaba-dawn.jpg"
            alt="Masjid al-Haram and Kaaba at dawn"
            className="absolute inset-0 w-full h-full object-cover object-[center_55%] sm:object-center pointer-events-none select-none z-0"
            loading="eager"
          />

          {/* Directional Upper-Left Forest-Green Gradient: Calibrated to provide crisp text contrast behind white typography without dimming the Kaaba or sky */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: `linear-gradient(
                110deg,
                rgba(3, 22, 15, 0.62) 0%,
                rgba(3, 22, 15, 0.44) 28%,
                rgba(3, 22, 15, 0.22) 52%,
                rgba(3, 22, 15, 0.06) 72%,
                transparent 100%
              )`
            }}
          />

          {/* Top subtle vertical vignette for consistent top edge contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              background: "linear-gradient(to bottom, rgba(3, 20, 14, 0.35) 0%, rgba(3, 20, 14, 0.10) 30%, transparent 50%)"
            }}
          />

          {/* Continuous Image-Integrated Bottom Fade: Smooth photographic gradient allowing the photo to show through while establishing comfortable contrast for the prayer indicators */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-[3]"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                rgba(5, 24, 17, 0.02) 30%,
                rgba(5, 24, 17, 0.12) 48%,
                rgba(5, 24, 17, 0.35) 64%,
                rgba(5, 24, 17, 0.65) 82%,
                rgba(4, 18, 13, 0.88) 100%
              )`
            }}
          />

          {/* Top-Right Day Streak Habit Tab: Attached flush to top-0 right-0 with integrated rounded corner tab */}
          <div
            className="absolute top-0 right-0 z-20 flex items-center gap-1.5 pl-3 pr-4 pt-2 pb-2 rounded-bl-[18px] bg-black/50 hover:bg-black/65 border-b border-l border-white/20 text-white shadow-sm shrink-0 select-none backdrop-blur-xs transition-colors"
            title={`Current prayer streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}${
              longestStreak > currentStreak ? ` (Best: ${longestStreak})` : ""
            }`}
            aria-label={`Current prayer streak: ${currentStreak} days`}
          >
            <Flame
              size={12.5}
              className={`shrink-0 transition-colors ${
                currentStreak > 0
                  ? "text-[#F59E0B] fill-[#F59E0B]/90 animate-pulse"
                  : "text-stone-400 fill-none"
              }`}
            />
            <span className="text-[12px] sm:text-[12.5px] font-bold font-sans text-white leading-none tabular-nums">
              {currentStreak}
            </span>
            <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider font-bold text-stone-200 leading-none whitespace-nowrap">
              DAY STREAK
            </span>
          </div>

          {/* Main Card Content (Middle-Lower Hero Area): Beautifully balanced vertical placement, reducing excessive space below */}
          <div className="relative z-10 pt-11 pb-4 px-5 sm:pt-12 sm:pb-5 sm:px-6 pr-28 sm:pr-32">
            {/* Left Column: Primary prayer name, refined numeric countdown, readable start time */}
            <div className="min-w-0">
              <h1
                className="text-[34px] sm:text-[36px] font-serif font-normal tracking-tight text-[#FFFDF8] leading-none"
                style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.40)" }}
              >
                {prayerInfo.nextPrayer}
              </h1>

              {/* Refined Live Numeric Countdown: 06:02:48 (25-28px, clean sans-serif, medium weight, tabular numerals, subtle colons) */}
              {countdownData && (
                <div
                  className="mt-2 text-[25px] sm:text-[27px] font-medium font-sans text-[#FFFDF8] select-none leading-none inline-flex items-baseline"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.38)",
                  }}
                  aria-label={`Time remaining until ${prayerInfo.nextPrayer}: ${countdownData.formatted}`}
                >
                  <span className="tabular-nums tracking-tight">{countdownData.hrs}</span>
                  <span className="text-[#FFFDF8]/70 px-[2px] font-normal select-none" aria-hidden="true">:</span>
                  <span className="tabular-nums tracking-tight">{countdownData.mins}</span>
                  <span className="text-[#FFFDF8]/70 px-[2px] font-normal select-none" aria-hidden="true">:</span>
                  <span className="tabular-nums tracking-tight">{countdownData.secs}</span>
                </div>
              )}

              <p
                className="text-[#EBF3ED] text-[13.5px] sm:text-[14px] mt-1.5 font-medium font-sans tracking-normal leading-normal"
                style={{ textShadow: "0 1px 8px rgba(0, 0, 0, 0.38)" }}
              >
                Begins at {prayerInfo.nextTime}
              </p>
            </div>
          </div>

          {/* Seamless Translucent Glass-Fade Tawfiq AI Footer: Integrated directly with the Kaaba photograph */}
          <Link
            to="/mentor"
            state={{ animatedEntry: true }}
            className="group relative z-10 mt-auto w-full px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between text-white select-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset"
            aria-label="Open Tawfiq AI"
          >
            {/* Seamless Translucent Glass-Fade Background Layer: Zero hard border, photograph visible throughout */}
            <div
              className="absolute inset-0 mentor-glass-fade-bg pointer-events-none transition-opacity duration-300 group-hover:opacity-95"
              aria-hidden="true"
            />

            {/* Left: Sparkle Icon and primary 'Tawfiq AI' label */}
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white/15 transition-colors"
                aria-hidden="true"
              >
                <Sparkles size={14} className="text-emerald-300 transition-transform duration-300 group-hover:scale-110" />
              </div>

              <span
                className="font-semibold text-[15px] sm:text-[16px] text-[#FFFDF8] tracking-tight whitespace-nowrap leading-tight"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
              >
                Tawfiq AI
              </span>
            </div>

            {/* Right: Refined right-facing arrow with smooth hover glide */}
            <div
              className="relative z-10 flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-emerald-100 group-hover:text-white transition-all duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <ArrowRight size={15} strokeWidth={2.4} />
            </div>
          </Link>
        </section>

        {/* 5 Obligatory Prayers Section: Predictable layout with refined typography & prominent Mark Salah action */}
        <section className="bg-white rounded-[22px] p-4 sm:p-5 border border-[#E7E2D9] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)]">
          {/* Section Header: Obligatory Prayers */}
          <div className="mb-3.5 sm:mb-4 px-0.5">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 tracking-tight leading-tight">
              Obligatory Prayers
            </h2>
          </div>

          {/* Consistent 5-Row List with Clean Hierarchy */}
          <div className="divide-y divide-[#F0ECE4]">
            {PRAYERS.map((key) => {
              const name = PRAYER_NAMES[key];
              const time = prayerInfo.times[key];
              const isNext = prayerInfo.nextPrayerKey === key;
              const status = prayerStatuses[key] || "unprayed";
              const isCompleted = status === "on_time" || status === "jamaah" || status === "late";

              return (
                <div
                  key={key}
                  className={`py-3.5 px-2.5 sm:px-3 rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-colors ${
                    isNext ? "bg-[#EDF4F0]" : "hover:bg-[#FAF9F6]"
                  }`}
                >
                  {/* Left Column: Prayer Name + NEXT badge */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-[17px] sm:text-[18px] text-stone-900 leading-tight">
                      {name}
                    </span>
                    {isNext && (
                      <span
                        className="text-[9.5px] sm:text-[10px] font-semibold bg-[#1C4533] text-white px-1.5 py-0.5 rounded-[4px] leading-none uppercase tracking-wider shrink-0"
                        aria-label="Next upcoming prayer"
                      >
                        NEXT
                      </span>
                    )}
                  </div>

                  {/* Right Column: Appointed Prayer Time + Action */}
                  <div className="shrink-0 flex items-center gap-2.5 sm:gap-3.5">
                    <span
                      className="text-[14.5px] sm:text-[15.5px] font-sans font-medium text-stone-700 tabular-nums whitespace-nowrap leading-none inline-block text-right"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {time}
                    </span>

                    <div className="w-[102px] sm:w-[110px] text-right flex items-center justify-end">
                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrayerForLog(key);
                          }}
                          className="w-full h-[35px] px-2 rounded-full text-[12.5px] sm:text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 bg-[#E6F0EA] hover:bg-[#DCECE1] text-[#14422F] border border-[#BFD9C7] shadow-2xs cursor-pointer group"
                          title="Completed • Tap to edit or undo"
                          aria-label={`${name} marked completed. Tap to edit or undo.`}
                        >
                          <CheckCircle2 size={14} className="text-[#14422F] stroke-[2.2] shrink-0" />
                          <span className="truncate">
                            {status === "jamaah" ? "Jama'ah" : status === "late" ? "Late" : "Completed"}
                          </span>
                        </button>
                      ) : status === "missed" ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrayerForLog(key);
                          }}
                          className="w-full h-[35px] px-2 rounded-full text-[12px] sm:text-[12.5px] font-medium inline-flex items-center justify-center gap-1 transition-all duration-150 active:scale-95 bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4] shadow-2xs cursor-pointer"
                          title="Missed • Tap to edit"
                          aria-label={`${name} marked as missed. Tap to edit.`}
                        >
                          <XCircle size={13.5} className="stroke-[2.2] shrink-0" />
                          <span className="truncate">Missed</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrayerStatus(key, "on_time");
                          }}
                          className="w-full h-[35px] px-2 rounded-full text-[12.5px] sm:text-[13px] font-medium inline-flex items-center justify-center transition-all duration-150 active:scale-95 bg-[#1B4332] hover:bg-[#143527] text-white shadow-2xs cursor-pointer hover:shadow-sm"
                          title={`Mark ${name} as completed`}
                          aria-label={`Mark ${name} as completed`}
                        >
                          Mark Salah
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 12 Daily Sunnah Prayers (Sunan al-Rawatib) Section */}
        <section className="bg-white rounded-[22px] p-4 sm:p-5 border border-[#E7E2D9] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)]">
          {/* Section Header: Title + Accurate Rak'ahs Progress */}
          <div className="mb-3.5 sm:mb-4 px-0.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 tracking-tight leading-tight">
                  12 Daily Sunnah Prayers
                </h2>
                <p className="text-[12px] sm:text-[12.5px] text-[#6E685F] mt-0.5">
                  Sunan al-Rawatib attached to obligatory prayers
                </p>
              </div>

              {/* Progress Count Badge */}
              <div className="text-right shrink-0">
                <span className="text-[13.5px] sm:text-[14.5px] font-bold text-[#134D37] tabular-nums">
                  {completedSunnahRakahs} / {TOTAL_SUNNAH_RAKAHS}
                </span>
                <span className="text-[11px] text-[#6E685F] block leading-none mt-0.5">
                  Rak'ahs
                </span>
              </div>
            </div>

            {/* Restrained Progress Bar */}
            <div className="mt-3 h-2 w-full bg-[#EAE5DD] rounded-full overflow-hidden p-0.5 border border-[#DFD9CD]">
              <div
                className="h-full bg-[#134D37] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, Math.round((completedSunnahRakahs / TOTAL_SUNNAH_RAKAHS) * 100))
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* 4 Obligatory Prayer Rows for Sunnah Tracking: Fajr, Dhuhr, Maghrib, Isha */}
          <div className="divide-y divide-[#F0ECE4]">
            {SUNNAH_RAWATIB.map((item) => {
              const prayerKey = item.prayerKey;
              const prayerSunnahState = sunnahStatuses[prayerKey] || {};
              const completedSetsCount = item.sets.filter((s) => !!prayerSunnahState[s.id]).length;
              const isFullyCompleted = completedSetsCount === item.sets.length;
              const isPartiallyCompleted = completedSetsCount > 0 && !isFullyCompleted;

              // Calculate rakahs completed for this prayer
              const prayerCompletedRakahs = item.sets.reduce(
                (sum, s) => sum + (prayerSunnahState[s.id] ? s.rakahs : 0),
                0
              );

              return (
                <div
                  key={prayerKey}
                  className="py-3.5 px-2.5 sm:px-3 rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-colors hover:bg-[#FAF9F6]"
                >
                  {/* Left Column: Prayer Name + Sunnah Information & Indicators */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[17px] sm:text-[18px] text-stone-900 leading-tight">
                        {item.name}
                      </span>
                      {isFullyCompleted ? (
                        <span className="text-[10px] font-semibold bg-[#E6F0EA] text-[#14422F] border border-[#BFD9C7] px-1.5 py-0.5 rounded-full leading-none shrink-0 inline-flex items-center gap-1">
                          <CheckCircle2 size={10} className="shrink-0" />
                          <span>All Done</span>
                        </span>
                      ) : isPartiallyCompleted ? (
                        <span className="text-[10px] font-semibold bg-[#F5EEDF] text-[#745517] border border-[#E3D6BC] px-1.5 py-0.5 rounded-full leading-none shrink-0">
                          {prayerCompletedRakahs} / {item.totalRakahs}
                        </span>
                      ) : null}
                    </div>

                    {/* Sunnah Information & Dhuhr Independent Indicators */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[12.5px] sm:text-[13px] text-[#6E685F] font-medium leading-none">
                        {item.subtitle}
                      </span>

                      {/* Explicit visual set indicators for multi-set prayers like Dhuhr */}
                      {item.sets.length > 1 && (
                        <div className="flex items-center gap-1 text-[11px] select-none">
                          {item.sets.map((set) => {
                            const isDone = !!prayerSunnahState[set.id];
                            return (
                              <span
                                key={set.id}
                                className={`px-1.5 py-0.5 rounded-[4px] font-medium text-[10.5px] border transition-colors ${
                                  isDone
                                    ? "bg-[#E6F0EA] text-[#14422F] border-[#BFD9C7]"
                                    : "bg-[#F7F5EF] text-stone-600 border-[#E5DFD5]"
                                }`}
                              >
                                {set.id === "before" ? "4 Pre" : "2 Post"}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Log Sunnah Action Button (Reuses Tawfiq Action Language) */}
                  <div className="shrink-0 w-[102px] sm:w-[110px] text-right flex items-center justify-end">
                    {isFullyCompleted ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSunnahForLog(item)}
                        className="w-full h-[35px] px-2 rounded-full text-[12.5px] sm:text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 bg-[#E6F0EA] hover:bg-[#DCECE1] text-[#14422F] border border-[#BFD9C7] shadow-2xs cursor-pointer group"
                        title="Completed • Tap to edit or view"
                        aria-label={`${item.name} Sunnah completed. Tap to edit.`}
                      >
                        <CheckCircle2 size={14} className="text-[#14422F] stroke-[2.2] shrink-0" />
                        <span className="truncate">Done</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedSunnahForLog(item)}
                        className="w-full h-[35px] px-2 rounded-full text-[12.5px] sm:text-[13px] font-medium inline-flex items-center justify-center transition-all duration-150 active:scale-95 bg-[#1B4332] hover:bg-[#143527] text-white shadow-2xs cursor-pointer hover:shadow-sm"
                        title={`Log ${item.name} Sunnah prayers`}
                        aria-label={`Log ${item.name} Sunnah prayers`}
                      >
                        Log Sunnah
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily Dhikr Card */}
        <section className="bg-white rounded-[22px] p-5 border border-[#E7E2D9] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]">
          {/* Card Header: Simplified Daily Dhikr Heading without decorative icon or subtitle */}
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] sm:text-[21px] font-bold text-stone-900 leading-none tracking-tight">
              Daily Dhikr
            </h3>
            {/* Authentic Dhikr Switcher: SubhanAllah, Alhamdulillah, Allahu Akbar */}
            <div className="flex items-center gap-1 bg-[#F5F2EA] p-1 rounded-xl border border-[#EBE4D7]">
              {DHIKR_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setDhikrState((prev) => ({
                      index: idx,
                      count: prev.index === idx ? prev.count : 0,
                    }))
                  }
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-all ${
                    dhikrState.index === idx
                      ? "bg-[#134D37] text-white shadow-xs"
                      : "text-[#726B60] hover:text-[#134D37]"
                  }`}
                  title={`${item.transliteration} (${idx + 1}/${DHIKR_ITEMS.length})`}
                >
                  {item.transliteration.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Main Dhikr Content: Arabic dhikr & transliteration as an accessible interactive tap target */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleCountDhikr}
              className="w-full py-4 px-3 bg-[#FAF8F5] hover:bg-[#F3EFE7] active:scale-[0.99] border border-[#EFE9DF] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
              aria-label={`Count ${currentDhikr.transliteration}. Currently ${dhikrState.count} of ${currentDhikr.target}. Tap to increment.`}
            >
              <span
                dir="rtl"
                lang="ar"
                className="text-[28px] sm:text-[30px] font-bold text-[#134D37] leading-relaxed tracking-normal transition-transform group-hover:scale-[1.01]"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
              >
                {currentDhikr.arabic}
              </span>
              <span className="text-[13px] sm:text-[14px] text-[#5C574F] font-medium mt-1">
                {currentDhikr.transliteration} • {currentDhikr.translation}
              </span>
            </button>
          </div>

          {/* Functional Dhikr Counter: Substantial, polished, clearly visible progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-[13px]">
              <span className="text-[#6E685F] font-medium">Today's progress</span>
              <div className="flex items-center gap-1.5">
                {isDhikrCompleted && (
                  <span className="text-[11px] font-semibold text-[#134D37] bg-[#E3EEE6] px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
                <span className="text-[#134D37] font-bold tabular-nums">
                  {dhikrState.count} / {currentDhikr.target}
                </span>
              </div>
            </div>
            {/* Substantial, polished progress track with rounded corners and Tawfiq green fill */}
            <div className="h-2.5 sm:h-3 w-full bg-[#EAE5DD] rounded-full overflow-hidden p-0.5 border border-[#DFD9CD]">
              <div
                className="h-full bg-[#134D37] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round((dhikrState.count / (currentDhikr.target || 33)) * 100)
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card Footer: Primary "Count Dhikr" button and visually consistent "Reset" button */}
          <div className="mt-5 pt-3.5 border-t border-[#F0EBE1] flex items-center gap-2.5">
            {/* Primary Action: Count Dhikr */}
            <button
              type="button"
              onClick={handleCountDhikr}
              className="flex-1 h-11 bg-[#134D37] hover:bg-[#0E3D2B] active:scale-[0.98] text-white font-semibold text-[13px] sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/40 cursor-pointer select-none"
              aria-label={`Count ${currentDhikr.transliteration}. Current count is ${dhikrState.count} of ${currentDhikr.target}`}
            >
              <span>Count Dhikr</span>
              <Plus size={16} className="text-white/85" />
            </button>

            {/* Reset Button: Identical height, typography, corner radius, padding, alignment & color styling with safety confirmation */}
            <button
              type="button"
              onClick={handleResetClick}
              disabled={dhikrState.count === 0 && !isResetConfirming}
              className={`h-11 px-4 sm:px-5 font-semibold text-[13px] sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/40 ${
                isResetConfirming
                  ? "bg-amber-700 text-white hover:bg-amber-800 shadow-xs animate-pulse cursor-pointer"
                  : dhikrState.count === 0
                  ? "bg-[#134D37]/15 text-[#134D37]/40 cursor-not-allowed border border-[#134D37]/10"
                  : "bg-[#134D37] hover:bg-[#0E3D2B] text-white shadow-xs active:scale-[0.98] cursor-pointer"
              }`}
              aria-label={
                isResetConfirming
                  ? "Confirm resetting dhikr counter to 0"
                  : "Reset dhikr counter to 0"
              }
              title={
                dhikrState.count === 0
                  ? "Counter is at 0"
                  : isResetConfirming
                  ? "Tap again to confirm reset"
                  : "Reset counter to 0"
              }
            >
              <RotateCcw size={15} className={isResetConfirming ? "animate-spin" : ""} />
              <span>{isResetConfirming ? "Confirm?" : "Reset"}</span>
            </button>
          </div>
        </section>

        {/* Multi-Verse Islamic Inspiration Carousel with Smooth Horizontal Sliding Transitions */}
        <DailyVerseCarousel />
      </main>

      {/* Slide-up Bottom Sheet (Pulls up ~30-35% of the screen) */}
      {selectedPrayerForLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Log status for ${PRAYER_NAMES[selectedPrayerForLog]}`}
          className="fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Backdrop with soft blur */}
          <div
            onClick={() => setSelectedPrayerForLog(null)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
          />

          {/* Bottom Sheet Drawer content - Constrained to ~32% max height */}
          <div className="relative w-full max-w-md mx-auto bg-[#FAF8F5] rounded-t-[26px] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] border-t border-[#E5DFD5] p-4 pb-6 z-10 animate-in slide-in-from-bottom duration-300">
            {/* Grab handle indicator */}
            <div className="w-10 h-1 bg-[#D3CDC4] rounded-full mx-auto mb-3" />

            {/* Header: Prayer name, appointed time, and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold text-stone-900 leading-none">
                    Log {PRAYER_NAMES[selectedPrayerForLog]}
                  </h3>
                  <span className="text-xs font-medium text-[#134D37] bg-[#E3EEE6] px-2 py-0.5 rounded-full">
                    {prayerInfo.times[selectedPrayerForLog]}
                  </span>
                </div>
                <p className="text-[12px] text-[#6E685F] mt-0.5">
                  Select your prayer completion status
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrayerForLog(null)}
                className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#6E685F] hover:bg-[#E4DDCF] flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close sheet"
              >
                <X size={15} />
              </button>
            </div>

            {/* Options Grid: On Time, With Jama'ah, Prayed Late, Missed */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
              {LOG_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = prayerStatuses[selectedPrayerForLog] === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSetPrayerStatus(selectedPrayerForLog, opt.key)}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 active:scale-[0.98] flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#173F2E] text-white border-[#173F2E] shadow-sm"
                        : opt.isMissed
                        ? "bg-rose-50/70 hover:bg-rose-100/70 border-rose-200/80 text-stone-900"
                        : "bg-white hover:bg-[#F5F2EB] border-[#E8E2D7] text-stone-900"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : `${opt.badgeBg} ${opt.badgeText}`
                        }`}
                      >
                        <IconComponent size={15} />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-semibold bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h4
                        className={`text-[13.5px] font-semibold leading-tight ${
                          isSelected ? "text-white" : opt.isMissed ? "text-rose-900" : "text-stone-900"
                        }`}
                      >
                        {opt.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-1 leading-tight ${
                          isSelected
                            ? "text-white/80"
                            : opt.isMissed
                            ? "text-rose-700 font-medium"
                            : "text-[#6E685F]"
                        }`}
                      >
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear / Unprayed option reset */}
            {prayerStatuses[selectedPrayerForLog] &&
              prayerStatuses[selectedPrayerForLog] !== "unprayed" && (
                <div className="mt-3 pt-2.5 border-t border-[#EAE4D9] flex items-center justify-between">
                  <span className="text-[12px] text-stone-500">Need to undo?</span>
                  <button
                    type="button"
                    onClick={() => handleSetPrayerStatus(selectedPrayerForLog, "unprayed")}
                    className="text-[12px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors py-1.5 px-3 cursor-pointer shadow-2xs"
                  >
                    Reset to Unprayed
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Slide-up Bottom Sheet for 12 Daily Sunnah Prayers (Sunan al-Rawatib) */}
      {selectedSunnahForLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Log ${selectedSunnahForLog.name} Sunnah prayers`}
          className="fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Backdrop with soft blur */}
          <div
            onClick={() => setSelectedSunnahForLog(null)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
          />

          {/* Bottom Sheet Drawer content - Constrained to ~32% max height */}
          <div className="relative w-full max-w-md mx-auto bg-[#FAF8F5] rounded-t-[26px] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] border-t border-[#E5DFD5] p-4 pb-6 z-10 animate-in slide-in-from-bottom duration-300">
            {/* Grab handle indicator */}
            <div className="w-10 h-1 bg-[#D3CDC4] rounded-full mx-auto mb-3" />

            {/* Header: Prayer name, appointed time, and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold text-stone-900 leading-none">
                    Log {selectedSunnahForLog.name} Sunnah
                  </h3>
                  <span className="text-xs font-medium text-[#134D37] bg-[#E3EEE6] px-2 py-0.5 rounded-full">
                    {selectedSunnahForLog.totalRakahs} Rak'ahs Total
                  </span>
                </div>
                <p className="text-[12px] text-[#6E685F] mt-0.5">
                  Select Sunnah Rawatib set to toggle completion
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSunnahForLog(null)}
                className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#6E685F] hover:bg-[#E4DDCF] flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close sheet"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sunnah Sets Grid: Before Fard / After Fard cards matching obligatory options visual language */}
            <div className={`mt-3 grid gap-2 sm:gap-2.5 ${selectedSunnahForLog.sets.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {selectedSunnahForLog.sets.map((set) => {
                const prayerSunnahState = sunnahStatuses[selectedSunnahForLog.prayerKey] || {};
                const isCompleted = !!prayerSunnahState[set.id];

                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => handleToggleSunnahSet(selectedSunnahForLog.prayerKey, set.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] flex flex-col justify-between ${
                      isCompleted
                        ? "bg-[#173F2E] text-white border-[#173F2E] shadow-sm"
                        : "bg-white hover:bg-[#F5F2EB] border-[#E8E2D7] text-stone-900"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-white/20 text-white"
                            : "bg-[#DFEDE4] text-[#163B2C]"
                        }`}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                      {isCompleted ? (
                        <span className="text-[10px] font-semibold bg-white/25 text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-[#FAF8F5] text-stone-600 border border-[#DDD7CD] px-1.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>

                    <div>
                      <h4
                        className={`text-[14px] font-semibold leading-tight ${
                          isCompleted ? "text-white" : "text-stone-900"
                        }`}
                      >
                        {set.label} · {set.rakahs} Rak'ahs
                      </h4>
                      <p
                        className={`text-[11.5px] mt-0.5 leading-tight ${
                          isCompleted ? "text-white/80" : "text-[#6E685F]"
                        }`}
                      >
                        {set.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Done/Dismiss Action */}
            <div className="mt-3.5 pt-3 border-t border-[#EAE4D9] flex items-center justify-between">
              <span className="text-[12px] text-stone-500">
                Tip: Praying all 12 rak'ahs earns a house in Jannah
              </span>
              <button
                type="button"
                onClick={() => setSelectedSunnahForLog(null)}
                className="text-[12.5px] font-semibold text-[#14422F] hover:bg-[#DCECE1] bg-[#E6F0EA] border border-[#BFD9C7] rounded-lg transition-colors py-1.5 px-3.5 cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Azan Player */}
      <FloatingAzanPlayer />

      {/* Azan, Location & Calculation Settings Modal */}
      {isSettingsOpen && (
        <AzanSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab="location"
          onLocationOrPrefsChanged={(newLoc, newPrefs) => {
            if (newLoc) setLocation(newLoc);
            if (newPrefs) setCalcPrefs(newPrefs);
          }}
        />
      )}
    </div>
  );
}
