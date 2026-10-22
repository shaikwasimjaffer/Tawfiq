import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Flame, MapPin, ArrowRight, X, Bot, Sparkles } from "lucide-react";
import { usePrayerStreak } from "@/lib/usePrayerStreak";
import { getSavedLocation } from "@/lib/locationService";
import { useAuth } from "@/lib/AuthContext";
import AzanSettingsModal from "@/components/prayer/AzanSettingsModal";

function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return { user: null, isAuthenticated: false, logout: () => {} };
  }
}

/**
 * Premium Mobile Tawfiq Header
 * 1. Feature Spotlight Card: "Meet Mentor Mode" announcement for new/un-dismissed users.
 *    Transitions to a compact, accessible bar once explored or dismissed.
 * 2. Utility Row: Separated location pill, Day Streak indicator, and profile trigger.
 * 3. Followed by next-prayer hero card.
 */
export default function TawfiqHeader({
  now: propNow,
  location: propLocation,
  onOpenSettings,
  currentStreak: propStreak,
  longestStreak: propLongest,
  className = "",
}) {
  const navigate = useNavigate();
  const auth = useAuthSafe();
  const user = auth?.user;

  const [internalNow] = useState(() => new Date());
  const now = propNow || internalNow;

  // Streak data fallback if not passed as prop
  const streakData = usePrayerStreak(now);
  const currentStreak = propStreak !== undefined ? propStreak : streakData.currentStreak;
  const longestStreak = propLongest !== undefined ? propLongest : streakData.longestStreak;

  // Location fallback if not passed as prop
  const [internalLocation, setInternalLocation] = useState(getSavedLocation);
  const location = propLocation || internalLocation;

  // Internal modal fallback if onOpenSettings is not passed
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);

  // State-aware feature spotlight persistence
  const getStorageKey = (u) => {
    const scope = u?.id || u?.email || "guest";
    return `tawfiq_mentor_spotlight_dismissed_${scope}`;
  };

  const [isSpotlightDismissed, setIsSpotlightDismissed] = useState(() => {
    try {
      const userKey = getStorageKey(user);
      if (localStorage.getItem(userKey) === "true") return true;
      return localStorage.getItem("tawfiq_mentor_spotlight_dismissed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const userKey = getStorageKey(user);
      if (localStorage.getItem(userKey) === "true") {
        setIsSpotlightDismissed(true);
      }
    } catch {}
  }, [user]);

  const handleDismissSpotlight = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSpotlightDismissed(true);
    try {
      const userKey = getStorageKey(user);
      localStorage.setItem(userKey, "true");
      localStorage.setItem("tawfiq_mentor_spotlight_dismissed", "true");
    } catch (err) {
      console.warn("Storage error saving spotlight dismissal:", err);
    }
  };

  const handleExploreMentor = () => {
    // Once explored, persist dismissal so future sessions use the compact view
    try {
      const userKey = getStorageKey(user);
      localStorage.setItem(userKey, "true");
      localStorage.setItem("tawfiq_mentor_spotlight_dismissed", "true");
    } catch {}
    setIsSpotlightDismissed(true);
    navigate("/mentor", { state: { animatedEntry: true } });
  };

  const handleOpenLocation = () => {
    if (typeof onOpenSettings === "function") {
      onOpenSettings();
    } else {
      setIsInternalModalOpen(true);
    }
  };

  return (
    <header className={`w-full select-none ${className}`}>
      <div className="w-full space-y-2.5">
        {/* SECTION 1: Mentor Mode Feature Spotlight (Prominent vs Compact State) */}
        {!isSpotlightDismissed ? (
          /* Prominent Feature Spotlight Card */
          <div
            className="w-full rounded-2xl bg-gradient-to-br from-[#FAF8F3] via-[#FCFAF6] to-[#F4EFE6] border border-[#E2DBD0] p-4 sm:p-4.5 shadow-[0_2px_10px_-3px_rgba(19,77,55,0.07),0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all duration-200"
            role="region"
            aria-label="Mentor Mode Feature Announcement"
          >
            {/* Top Row: Small Status Label + Dismiss Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#134D37]/10 text-[#134D37] text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase leading-none">
                <Sparkles size={11} className="text-[#134D37] shrink-0" />
                <span>NEW FEATURE</span>
              </span>

              {/* Dismiss Action: Does NOT trigger Mentor navigation */}
              <button
                type="button"
                onClick={handleDismissSpotlight}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#8C8273] hover:text-[#134D37] hover:bg-black/5 active:bg-black/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#134D37]/40 cursor-pointer"
                aria-label="Dismiss announcement"
                title="Dismiss announcement"
              >
                <X size={13.5} className="stroke-[2.2]" />
              </button>
            </div>

            {/* Middle Row: Mentor Brand Icon + Heading + Accurate Benefit Copy */}
            <div className="mt-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#134D37]/10 text-[#134D37] flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-[#134D37]" />
                </div>
                <h2 className="text-[17px] sm:text-[18px] font-serif font-bold text-[#143E2C] tracking-tight leading-snug">
                  Meet Mentor Mode
                </h2>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-[#5A544A] leading-relaxed mt-1 font-normal">
                Personalized Islamic guidance grounded in verified Quran, Sahih Hadith, and sacred Fiqh.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="mt-3.5 pt-0.5">
              <button
                type="button"
                onClick={handleExploreMentor}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#134D37] hover:bg-[#0E3B2A] text-white text-[13px] sm:text-[13.5px] font-semibold tracking-tight shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all motion-reduce:transition-none motion-reduce:transform-none group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/40"
              >
                <span>Explore Mentor Mode</span>
                <ArrowRight
                  size={14}
                  className="text-[#C9DEC8] group-hover:text-white group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none"
                />
              </button>
            </div>
          </div>
        ) : (
          /* Compact, Accessible Entry Point (Retained after discovery/dismissal) */
          <button
            type="button"
            onClick={handleExploreMentor}
            className="w-full h-[40px] sm:h-[42px] px-3.5 rounded-xl bg-white/95 hover:bg-white border border-[#E7E2D9] hover:border-[#134D37]/35 text-[#143E2C] flex items-center justify-between shadow-2xs hover:shadow-xs transition-all motion-reduce:transition-none motion-reduce:transform-none active:scale-[0.99] group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
            aria-label="Open Mentor Mode: Personalized Islamic Guidance"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5.5 h-5.5 rounded-md bg-[#134D37]/10 text-[#134D37] flex items-center justify-center shrink-0">
                <Bot size={13} className="text-[#134D37]" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[13px] font-semibold text-[#143E2C] tracking-tight">
                  Mentor Mode
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-[#134D37]/8 text-[#134D37] tracking-wider uppercase shrink-0">
                  AI Guide
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#134D37] shrink-0">
              <span>Open</span>
              <ArrowRight
                size={13}
                className="text-[#134D37] group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none"
              />
            </div>
          </button>
        )}

        {/* SECTION 2: Separated Utility Controls (Location, Day Streak, and Profile) */}
        <div className="flex items-center justify-between gap-2 px-0.5">
          {/* Left: Compact Location Control */}
          <button
            type="button"
            onClick={handleOpenLocation}
            className="h-[34px] sm:h-[36px] inline-flex items-center gap-1.5 px-3 rounded-full bg-white/95 hover:bg-white border border-[#E7E2D9] text-[#134D37] text-[12.5px] sm:text-[13px] font-semibold shadow-2xs transition-colors group cursor-pointer truncate min-w-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
            title="Tap to change calculation location & prayer settings"
            aria-label={`Location: ${location.city}. Tap to change.`}
          >
            <MapPin size={13.5} className="text-[#134D37] group-hover:scale-110 transition-transform shrink-0 stroke-[2.2]" />
            <span className="truncate">{location.city}</span>
          </button>

          {/* Right: Standardized Day Streak Pill & User Profile Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Standardized Day Streak Pill */}
            <div
              className="h-[34px] sm:h-[36px] px-3 rounded-full bg-white/95 border border-[#E7E2D9] text-[#134D37] flex items-center justify-center gap-1.5 shadow-2xs select-none"
              title={`Current streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}${
                longestStreak > currentStreak ? ` (Best: ${longestStreak})` : ""
              }`}
              aria-label={`Current prayer streak: ${currentStreak} days`}
            >
              <div className="flex items-center justify-center gap-1">
                <Flame
                  size={13.5}
                  className={`shrink-0 transition-colors ${
                    currentStreak > 0
                      ? "text-[#C4883B] fill-[#C4883B]/80"
                      : "text-[#B8B1A5] fill-none"
                  }`}
                />
                <span className="text-[13.5px] sm:text-[14px] font-bold font-sans text-[#134D37] leading-none tabular-nums tracking-tight">
                  {currentStreak}
                </span>
              </div>
              <span className="text-[9px] sm:text-[9.5px] uppercase tracking-[0.08em] font-bold text-[#7D7467] leading-none whitespace-nowrap">
                DAY STREAK
              </span>
            </div>

            {/* User Account Trigger */}
            <UserHeaderProfile />
          </div>
        </div>
      </div>

      {/* Internal fallback modal if not managed by parent */}
      {isInternalModalOpen && (
        <AzanSettingsModal
          isOpen={isInternalModalOpen}
          onClose={() => setIsInternalModalOpen(false)}
          initialTab="location"
          onLocationOrPrefsChanged={(newLoc) => {
            if (newLoc) setInternalLocation(newLoc);
          }}
        />
      )}
    </header>
  );
}

function UserHeaderProfile() {
  const navigate = useNavigate();
  let user = null;
  let isAuthenticated = false;
  let logout = () => {};

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch {}

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        className="h-[34px] sm:h-[36px] px-2.5 sm:px-3 rounded-full border border-[#DDD7CD] hover:border-[#134D37] bg-white text-[#134D37] text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap"
        title="Sign in to your Tawfiq account"
      >
        <span>Sign in</span>
      </Link>
    );
  }

  const userInitial = (user.name || user.email || "T")[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-[#134D37] text-[#EAF2ED] hover:bg-[#0E3B2A] flex items-center justify-center text-xs font-bold transition-all shadow-2xs border border-white/50 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30 cursor-pointer"
        title={user.email || "My Account"}
        aria-label="User account menu"
      >
        <span>{userInitial}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E8E2D6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-[#F0ECE1]">
            <p className="text-xs font-bold text-[#1C3B2B] truncate">
              {user.name || "Tawfiq Believer"}
            </p>
            <p className="text-[11px] text-[#8C8273] truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="px-1.5 py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate("/login");
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50/70 font-medium rounded-xl transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Sign out</span>
              <span className="text-[10px] text-rose-400">Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
