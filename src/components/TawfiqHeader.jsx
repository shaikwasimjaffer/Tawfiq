import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, User } from "lucide-react";
import { getSavedLocation } from "@/lib/locationService";
import { useAuth } from "@/lib/AuthContext";
import { getUserMiddleName, getUserHeaderGreeting } from "@/lib/userStorage";
import AzanSettingsModal from "@/components/prayer/AzanSettingsModal";

function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return { user: null, isAuthenticated: false, logout: () => {} };
  }
}

/**
 * Tawfiq Header with Dedicated Settings Icon & Centralized Settings Interface
 *
 * Structure:
 * [User Avatar]  Welcome {Middle Name}    [Settings Icon]
 *                {Selected Location}
 *
 * - Old dropdown chevron and greeting dropdown trigger have been completely removed.
 * - Clicking the Settings icon opens the centralized Settings interface (location, audio, notifications, account).
 * - Clicking the avatar can also open the Settings interface on the account tab if authenticated.
 * - The greeting text and location subtitle are clean, static informational headers.
 */
export default function TawfiqHeader({
  location: propLocation,
  onOpenSettings,
  className = "",
}) {
  const auth = useAuthSafe();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const isLoadingAuth = auth?.isLoadingAuth;

  const [internalLocation, setInternalLocation] = useState(getSavedLocation);
  const location = propLocation || internalLocation;

  // Fallback modal if onOpenSettings is not provided
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState("location");

  const handleOpenSettings = (initialTab = "location") => {
    setModalInitialTab(initialTab);
    if (typeof onOpenSettings === "function") {
      onOpenSettings(initialTab);
    } else {
      setIsInternalModalOpen(true);
    }
  };

  // Location subtitle display resolution (e.g. "Hyderabad, India")
  const locationSubtitle =
    location?.address ||
    (location?.city && location?.country
      ? `${location.city}, ${location.country}`
      : location?.country || "Set prayer location");

  // Dynamic Personalized Greeting
  const greetingHeading = isAuthenticated && user
    ? getUserHeaderGreeting(user)
    : isLoadingAuth
    ? "Welcome..."
    : (location?.label || "Welcome");

  return (
    <header className={`w-full select-none pt-1 pb-1 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Avatar + Personalized Greeting + Location Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* User Profile Avatar */}
          <div className="shrink-0 flex items-center">
            <UserAvatarButton
              user={user}
              isAuthenticated={isAuthenticated}
              onClick={() => handleOpenSettings("account")}
            />
          </div>

          {/* Greeting Title and Location Subtitle Column */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h1 className="text-[15.5px] sm:text-[16.5px] font-bold text-[#143E2C] tracking-tight leading-tight truncate">
              {greetingHeading}
            </h1>
            <p className="text-[11.5px] sm:text-[12px] text-[#7A7265] truncate font-medium leading-tight mt-0.5 max-w-[210px] sm:max-w-[270px]">
              {locationSubtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Dedicated Settings Icon */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => handleOpenSettings("location")}
            className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full bg-white hover:bg-[#F2ECE1] border border-[#DDD7CD] hover:border-[#134D37] text-[#143E2C] flex items-center justify-center shadow-2xs hover:shadow-xs active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30 cursor-pointer"
            aria-label="Open settings"
            title="Settings & Preferences (Location, Audio, Notifications, Account)"
          >
            <SettingsIcon size={19} className="text-[#143E2C] stroke-[2.1] hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Internal fallback modal if not managed by parent */}
      {isInternalModalOpen && (
        <AzanSettingsModal
          isOpen={isInternalModalOpen}
          onClose={() => setIsInternalModalOpen(false)}
          initialTab={modalInitialTab}
          onLocationOrPrefsChanged={(newLoc) => {
            if (newLoc) setInternalLocation(newLoc);
          }}
        />
      )}
    </header>
  );
}

function UserAvatarButton({ user, isAuthenticated, onClick }) {
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

  const middleName = getUserMiddleName(user);
  const preferredName = middleName || user.name || user.email || "T";
  const userInitial = preferredName.trim()[0].toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full bg-[#134D37] text-[#EAF2ED] hover:bg-[#0E3B2A] flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-2xs ring-2 ring-[#134D37]/15 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/40 cursor-pointer overflow-hidden border border-white/40"
      title={`${user.name || user.email || "User Account"} - View Account in Settings`}
      aria-label="User account settings"
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
  );
}
