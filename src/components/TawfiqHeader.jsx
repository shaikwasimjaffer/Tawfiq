import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, ChevronDown, User, LogOut } from "lucide-react";
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
 * Redesigned Premium Mobile Tawfiq Header
 *
 * Inspired by Zomato's clean location & profile header architecture,
 * while maintaining Tawfiq's signature Islamic identity.
 *
 * Hierarchy:
 * - Top-Left: Location icon, prominent title (e.g. "Home"), dropdown indicator, and truncated address underneath.
 * - Top-Right: Compact circular user profile avatar with fallback and account menu.
 * - Mentor Mode has been completely removed.
 */
export default function TawfiqHeader({
  location: propLocation,
  onOpenSettings,
  className = "",
}) {
  const [internalLocation, setInternalLocation] = useState(getSavedLocation);
  const location = propLocation || internalLocation;

  // Fallback modal if onOpenSettings is not provided
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);

  const handleOpenLocation = () => {
    if (typeof onOpenSettings === "function") {
      onOpenSettings();
    } else {
      setIsInternalModalOpen(true);
    }
  };

  // Location display resolution
  const locationTitle =
    location?.label || (location?.isAuto ? "Current Location" : (location?.city || "Home"));

  const locationSubtitle =
    location?.address ||
    (location?.city && location?.country
      ? `${location.city}, ${location.country}`
      : location?.country || "Set prayer location");

  return (
    <header className={`w-full select-none pt-1 pb-1 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Top-Left: Location Header with icon aligned with title & subtitle */}
        <button
          type="button"
          onClick={handleOpenLocation}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none min-w-0 flex-1 active:opacity-80 transition-opacity"
          aria-label={`Location: ${locationTitle}, ${locationSubtitle}. Tap to change prayer calculation location.`}
          title="Tap to change prayer calculation location"
        >
          {/* Location Pin Icon in rounded circular badge, vertically centered across the 2-line title & subtitle */}
          <div className="w-[34px] h-[34px] rounded-full bg-[#134D37]/10 dark:bg-[#134D37]/20 flex items-center justify-center shrink-0 text-[#134D37] group-hover:bg-[#134D37]/15 transition-colors">
            <MapPin size={18} className="text-[#134D37] stroke-[2.2]" />
          </div>

          {/* Title and Address Column */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[16px] sm:text-[17px] font-bold text-[#143E2C] tracking-tight leading-tight truncate">
                {locationTitle}
              </span>
              <ChevronDown
                size={15}
                className="text-[#143E2C] stroke-[2.4] shrink-0 transition-transform group-hover:translate-y-0.5 ml-0.5"
              />
            </div>
            <p className="text-[11.5px] sm:text-[12px] text-[#7A7265] truncate font-medium leading-tight mt-0.5 max-w-[210px] sm:max-w-[270px]">
              {locationSubtitle}
            </p>
          </div>
        </button>

        {/* Top-Right: Integrated Profile Avatar */}
        <div className="shrink-0 flex items-center">
          <UserHeaderProfile />
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
  const auth = useAuthSafe();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const logout = auth?.logout || (() => {});

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
        className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full bg-white hover:bg-stone-50 border border-[#DDD7CD] hover:border-[#134D37] text-[#134D37] flex items-center justify-center shadow-2xs hover:shadow-xs active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30"
        title="Sign in to your Tawfiq account"
        aria-label="Sign in"
      >
        <User size={18} className="text-[#134D37] stroke-[2]" />
      </Link>
    );
  }

  const userInitial = (user.name || user.email || "T")[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full bg-[#134D37] text-[#EAF2ED] hover:bg-[#0E3B2A] flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-2xs ring-2 ring-[#134D37]/15 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/40 cursor-pointer overflow-hidden border border-white/40"
        title={user.name || user.email || "My Account"}
        aria-label="User account menu"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || "User profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{userInitial}</span>
        )}
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
              <div className="flex items-center gap-1.5">
                <LogOut size={13} className="text-rose-600" />
                <span>Sign out</span>
              </div>
              <span className="text-[10px] text-rose-400">Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
