import React from "react";
import {
  Tv,
  Home,
  GraduationCap,
  Sparkles,
  BookOpen,
  Moon,
  Search,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TABS = [
  { path: "/today", label: "Today", Icon: Home },
  { path: "/learn", label: "Academy", Icon: GraduationCap },
  { path: "/quran", label: "Quran", Icon: BookOpen },
  { path: "/tv", label: "TawfiqTV", Icon: Tv },
  { path: "/qaza", label: "Qaza", Icon: Sparkles },
  { path: "/sawm", label: "Sawm", Icon: Moon },
];

export default function BottomNav({ isFriday = false }) {
  const { pathname } = useLocation();

  const accent = isFriday
    ? {
        border: "border-amber-100 dark:border-amber-900",
        activeBg: "bg-amber-100 dark:bg-amber-900/40",
        activeText: "text-amber-700 dark:text-amber-300",
      }
    : {
        border: "border-green-100 dark:border-green-900",
        activeBg: "bg-green-100 dark:bg-green-900/40",
        activeText: "text-green-700 dark:text-green-300",
      };

  const isTvMode = pathname === "/tv";

  // TV Mode: Black background, Search, Today, Profile
  if (isTvMode) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex items-center justify-center gap-6 h-20">
          {/* Search Button (No Redirect) */}
          <button
            type="button"
            className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all duration-300 p-2 w-16"
          >
            <Search size={22} strokeWidth={2} />
            <span className="mt-1 text-[11px] font-medium">Search</span>
          </button>

          {/* Today Button (Redirects to /today) */}
          <Link
            to="/today"
            className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all duration-300 p-2"
          >
            <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-2 hover:bg-zinc-900 transition-colors">
              <Home size={24} strokeWidth={2} className="text-white" />
              <span className="mt-1 text-[11px] font-medium text-white">
                Today
              </span>
            </div>
          </Link>

          {/* Profile Button (No Redirect) */}
          <button
            type="button"
            className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all duration-300 p-2 w-16"
          >
            <User size={22} strokeWidth={2} />
            <span className="mt-1 text-[11px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  // Normal Mode: Standard navigation bar
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] ${accent.border}`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-2 h-20">
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center transition-all duration-300"
            >
              <div
                className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-300 ${
                  active
                    ? `${accent.activeBg} shadow-md`
                    : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon
                  size={active ? 24 : 22}
                  strokeWidth={active ? 2.6 : 2}
                  className={`transition-all duration-300 ${
                    active ? `${accent.activeText} scale-110` : "text-gray-500"
                  }`}
                />
                <span
                  className={`mt-1 text-[11px] transition-all duration-300 ${
                    active
                      ? `font-semibold ${accent.activeText}`
                      : "font-medium text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
