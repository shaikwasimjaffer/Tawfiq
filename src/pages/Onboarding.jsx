import React, {
  useState,
  useEffect,
  useMemo,
  memo,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Compass,
  Bell,
  CheckCircle2,
  ChevronRight,
  MoonStar,
  Check,
  TrendingUp,
  Sunrise,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useSettings } from "@/lib/useSettings";
import { getCurrentLocation } from "@/lib/prayerUtils";
import { useAuth } from "@/lib/AuthContext";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

// user_settings.calculation_method is int4
const CALCULATION_METHODS = {
  INDIA: 1,
  ISNA: 2,
  KARACHI: 1,
  MWL: 3,
};

// ─────────────────────────────────────────────────────────────
// ATMOSPHERE
// ─────────────────────────────────────────────────────────────

const getAtmosphere = (hour) => {
  const greenAccents = {
    accent: "text-emerald-600",

    accentBg: "bg-emerald-600/10",

    button:
      "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.25)]",

    cardBg:
      "bg-black/[0.02] hover:bg-black/[0.04]",

    focusRing:
      "ring-emerald-500/50",
  };

  const darkGreenAccents = {
    accent: "text-emerald-400",

    accentBg: "bg-emerald-400/10",

    button:
      "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.3)]",

    cardBg:
      "bg-white/[0.03] hover:bg-white/[0.06]",

    focusRing:
      "ring-emerald-400/50",
  };

  if (hour >= 4 && hour < 7) {
    return {
      bg:
        "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ffffff]",

      text:
        "text-emerald-950",

      muted:
        "text-emerald-700/60",

      borderColor:
        "border-emerald-900/10",

      isDark: false,

      ...greenAccents,
    };
  }

  if (hour >= 7 && hour < 18) {
    return {
      bg:
        "bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5]",

      text:
        "text-emerald-950",

      muted:
        "text-emerald-700/60",

      borderColor:
        "border-emerald-900/10",

      isDark: false,

      ...greenAccents,
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      bg:
        "bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]",

      text:
        "text-emerald-50",

      muted:
        "text-emerald-200/60",

      borderColor:
        "border-emerald-100/10",

      isDark: true,

      ...darkGreenAccents,
    };
  }

  return {
    bg:
      "bg-gradient-to-br from-[#022c22] via-[#014737] to-[#020617]",

    text:
      "text-emerald-50",

    muted:
      "text-emerald-200/50",

    borderColor:
      "border-emerald-100/10",

    isDark: true,

    ...darkGreenAccents,
  };
};

// ─────────────────────────────────────────────────────────────
// HAPTICS
// ─────────────────────────────────────────────────────────────

const triggerHaptic = (type = "light") => {
  if (typeof navigator === "undefined") return;

  if (!navigator.vibrate) return;

  if (type === "light") {
    navigator.vibrate(10);
  }

  if (type === "medium") {
    navigator.vibrate(25);
  }

  if (type === "success") {
    navigator.vibrate([20, 40, 20]);
  }

  if (type === "error") {
    navigator.vibrate([30, 50, 30]);
  }
};

// ─────────────────────────────────────────────────────────────
// MOON
// ─────────────────────────────────────────────────────────────

const LivingMoon = memo(({ isDark }) => (
  <div className="relative group flex items-center justify-center w-14 h-14">
    <div
      className={`absolute inset-0 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] ${
        isDark
          ? "bg-emerald-400/20"
          : "bg-emerald-500/20"
      }`}
    />

    <svg
      className={`w-10 h-10 transition-transform duration-[1200ms] animate-in fade-in zoom-in rotate-[15deg] ${
        isDark
          ? "text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "text-emerald-600 drop-shadow-[0_0_12px_rgba(5,150,105,0.3)]"
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </div>
));

// ─────────────────────────────────────────────────────────────
// MOCK NEXT PRAYER
// ─────────────────────────────────────────────────────────────

const getMockNextPrayer = (hour) => {
  if (hour >= 4 && hour < 12) {
    return {
      name: "Dhuhr",
      in: "3h 14m",
      time: "1:15 PM",
    };
  }

  if (hour >= 12 && hour < 15) {
    return {
      name: "Asr",
      in: "2h 42m",
      time: "4:30 PM",
    };
  }

  if (hour >= 15 && hour < 18) {
    return {
      name: "Maghrib",
      in: "1h 12m",
      time: "7:45 PM",
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      name: "Isha",
      in: "1h 30m",
      time: "9:15 PM",
    };
  }

  return {
    name: "Fajr",
    in: "6h 45m",
    time: "5:30 AM",
  };
};

// ─────────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();

  // IMPORTANT:
  // AuthContext is now the source of truth for authentication.
  const {
    user,
    isLoadingAuth,
  } = useAuth();

  // IMPORTANT:
  // useSettings is now the ONLY place responsible
  // for creating/updating user_settings.
  const {
    settings,
    updateSettings,
    loading: settingsLoading,
  } = useSettings();

  // ───────────────────────────────────────────────────────────
  // TIME
  // ───────────────────────────────────────────────────────────

  const [now, setNow] = useState(
    new Date()
  );

  const hour = now.getHours();

  const atmosphere = useMemo(
    () => getAtmosphere(hour),
    [hour]
  );

  const mockPrayer = useMemo(
    () => getMockNextPrayer(hour),
    [hour]
  );

  // ───────────────────────────────────────────────────────────
  // USER NAME
  // ───────────────────────────────────────────────────────────

  const [userName, setUserName] = useState("");

  // ───────────────────────────────────────────────────────────
  // UI STATE
  // ───────────────────────────────────────────────────────────

  const [step, setStep] = useState(0);

  const [locStatus, setLocStatus] =
    useState("idle");

  const [notifStatus, setNotifStatus] =
    useState("idle");

  const [selectedMethod, setSelectedMethod] =
    useState(
      CALCULATION_METHODS.INDIA
    );

  const [selectedGoals, setSelectedGoals] =
    useState([]);

  const [morphing, setMorphing] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // GET USER NAME
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      setUserName("");
      return;
    }

    const metadataName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      "";

    setUserName(
      metadataName.trim()
    );
  }, [user]);

  // ───────────────────────────────────────────────────────────
  // LOAD EXISTING SETTINGS INTO ONBOARDING
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    if (settingsLoading) return;

    if (!settings) return;

    // Existing calculation method
    if (
      settings.calculation_method !==
        null &&
      settings.calculation_method !==
        undefined
    ) {
      setSelectedMethod(
        Number(
          settings.calculation_method
        )
      );
    }

    // Existing goals
    if (
      Array.isArray(
        settings.primary_goals
      )
    ) {
      setSelectedGoals(
        settings.primary_goals
      );
    }

    // If onboarding is already completed,
    // don't show onboarding again.
    if (
      settings.onboarding_done === true
    ) {
      navigate("/today", {
        replace: true,
      });
    }
  }, [
    user?.id,
    settings,
    settingsLoading,
    navigate,
  ]);

  // ───────────────────────────────────────────────────────────
  // CLOCK
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  // ───────────────────────────────────────────────────────────
  // NEXT STEP
  // ───────────────────────────────────────────────────────────

  const nextStep = () => {
    triggerHaptic("medium");

    setSaveError("");

    setStep((current) =>
      Math.min(
        current + 1,
        TOTAL_STEPS
      )
    );
  };

  // ───────────────────────────────────────────────────────────
  // LOCATION
  // ───────────────────────────────────────────────────────────

  const handleLocation = async () => {
    if (!user?.id) {
      setSaveError(
        "Please log in again."
      );
      return;
    }

    triggerHaptic("medium");

    setLocStatus("loading");

    setSaveError("");

    try {
      const pos =
        await getCurrentLocation();

      if (
        !pos ||
        typeof pos.lat !==
          "number" ||
        typeof pos.lon !==
          "number"
      ) {
        throw new Error(
          "Invalid location returned."
        );
      }

      await updateSettings({
        latitude: pos.lat,
        longitude: pos.lon,
      });

      triggerHaptic("success");

      setLocStatus("done");

      setTimeout(() => {
        nextStep();
      }, 1000);
    } catch (error) {
      console.error(
        "LOCATION ERROR:",
        error
      );

      setLocStatus("idle");

      setSaveError(
        "Location access wasn't available. You can set it later."
      );

      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };

  // ───────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ───────────────────────────────────────────────────────────

  const handleNotifications =
    async () => {
      if (!user?.id) {
        setSaveError(
          "Please log in again."
        );
        return;
      }

      triggerHaptic("medium");

      setNotifStatus("loading");

      setSaveError("");

      try {
        let notificationsOn =
          false;

        if (
          "Notification" in
          window
        ) {
          const permission =
            await Notification.requestPermission();

          notificationsOn =
            permission ===
            "granted";
        }

        await updateSettings({
          notifications_on:
            notificationsOn,
        });

        triggerHaptic("success");

        setNotifStatus("done");

        setTimeout(() => {
          nextStep();
        }, 800);
      } catch (error) {
        console.error(
          "NOTIFICATION ERROR:",
          error
        );

        setNotifStatus("idle");

        setSaveError(
          "Notifications could not be enabled. You can change this later."
        );

        setTimeout(() => {
          nextStep();
        }, 500);
      }
    };

  // ───────────────────────────────────────────────────────────
  // CALCULATION METHOD
  // ───────────────────────────────────────────────────────────

  const handleMethodChange =
    (methodId) => {
      triggerHaptic("light");

      setSelectedMethod(
        Number(methodId)
      );

      setSaveError("");
    };

  // ───────────────────────────────────────────────────────────
  // GOALS
  // ───────────────────────────────────────────────────────────

  const toggleGoal = (id) => {
    triggerHaptic("light");

    setSaveError("");

    setSelectedGoals(
      (current) =>
        current.includes(id)
          ? current.filter(
              (goal) =>
                goal !== id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  // ───────────────────────────────────────────────────────────
  // FINISH
  // ───────────────────────────────────────────────────────────

  const finish = async () => {
    if (!user?.id) {
      setSaveError(
        "Your session is no longer active. Please log in again."
      );
      return;
    }

    triggerHaptic("success");

    setSaveError("");

    setMorphing(true);

    try {
      console.log(
        "ONBOARDING: Saving settings..."
      );

      console.log(
        "ONBOARDING USER:",
        user.id
      );

      console.log(
        "ONBOARDING METHOD:",
        selectedMethod
      );

      console.log(
        "ONBOARDING GOALS:",
        selectedGoals
      );

      // IMPORTANT:
      // We DO NOT manually insert into user_settings here.
      //
      // useSettings() handles both:
      // 1. Creating the row if necessary
      // 2. Updating the existing row
      //
      await updateSettings({
        calculation_method:
          Number(selectedMethod),

        primary_goals:
          selectedGoals,

        onboarding_done:
          true,
      });

      console.log(
        "ONBOARDING: Settings saved successfully."
      );

      // Remove old authentication flags from
      // previous versions of the application.
      localStorage.removeItem(
        "isAuthenticated"
      );

      localStorage.removeItem(
        "tawfiq_registered_user"
      );

      // Optional UI convenience.
      localStorage.setItem(
        "tawfiq_onboarding_done",
        "1"
      );

      console.log(
        "ONBOARDING: Navigating to /today..."
      );

      setTimeout(() => {
        navigate("/today", {
          replace: true,
        });
      }, 1800);
    } catch (error) {
      console.error(
        "FAILED TO FINISH ONBOARDING:",
        error
      );

      setMorphing(false);

      setSaveError(
        error?.message ||
          "We couldn't save your settings. Please try again."
      );

      triggerHaptic("error");
    }
  };

  // ───────────────────────────────────────────────────────────
  // AUTH LOADING
  // ───────────────────────────────────────────────────────────

  if (isLoadingAuth) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${atmosphere.bg}`}
      >
        <div className="flex flex-col items-center gap-5">
          <LivingMoon
            isDark={
              atmosphere.isDark
            }
          />

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />

            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
              style={{
                animationDelay:
                  "120ms",
              }}
            />

            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
              style={{
                animationDelay:
                  "240ms",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // NO USER
  // ───────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-6 ${atmosphere.bg}`}
      >
        <div className="w-full max-w-[340px] text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle
              size={26}
              className="text-red-500"
            />
          </div>

          <h1
            className={`text-2xl font-extrabold ${atmosphere.text}`}
          >
            Session unavailable
          </h1>

          <p
            className={`text-[13px] leading-relaxed mt-3 ${atmosphere.muted}`}
          >
            Your session could not be
            restored. Please log in again.
          </p>

          <button
            onClick={() =>
              navigate("/login", {
                replace: true,
              })
            }
            className={`w-full h-[56px] mt-8 rounded-2xl text-white text-[14px] font-semibold ${atmosphere.button}`}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // SETTINGS LOADING
  // ───────────────────────────────────────────────────────────

  if (settingsLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${atmosphere.bg}`}
      >
        <div className="flex flex-col items-center gap-5">
          <LivingMoon
            isDark={
              atmosphere.isDark
            }
          />

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />

            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
              style={{
                animationDelay:
                  "120ms",
              }}
            />

            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
              style={{
                animationDelay:
                  "240ms",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 transition-colors duration-[1500ms] ease-in-out ${atmosphere.bg} ${
        morphing
          ? "overflow-hidden"
          : ""
      }`}
    >
      {/* Grain */}

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient light */}

      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_25s_linear_infinite] z-0 pointer-events-none" />

      {/* Progress Header */}

      <div
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 ${
          step === 0 ||
          step === TOTAL_STEPS ||
          morphing
            ? "opacity-0 -translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="h-[2px] w-full bg-black/5 dark:bg-white/5">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{
              width: `${
                (step /
                  TOTAL_STEPS) *
                100
              }%`,
            }}
          />
        </div>

        <div className="pt-6 flex justify-center">
          <div
            className={`backdrop-blur-md border ${atmosphere.borderColor} rounded-full px-5 py-2 shadow-sm flex items-center gap-2`}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />

            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${atmosphere.text}`}
            >
              {mockPrayer.name} in{" "}
              {mockPrayer.in}
            </span>
          </div>
        </div>
      </div>

      {/* Main */}

      <div
        className={`w-full max-w-[340px] relative z-10 transition-all duration-[700ms] ${
          morphing
            ? "opacity-0 scale-95 blur-[2px]"
            : "opacity-100 scale-100"
        }`}
      >
        {/* STEP 0 */}

        {step === 0 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="mb-8">
              <LivingMoon
                isDark={
                  atmosphere.isDark
                }
              />
            </div>

            <h2
              className={`text-2xl font-arabic tracking-wide mb-3 ${atmosphere.text}`}
            >
              السلام عليكم
            </h2>

            <h1
              className={`text-3xl font-extrabold tracking-tight mb-3 ${atmosphere.text}`}
            >
              {userName
                ? `Welcome, ${userName}.`
                : "Welcome to Tawfiq."}
            </h1>

            <p
              className={`text-[14px] leading-relaxed font-medium ${atmosphere.muted}`}
            >
              Your companion for every
              prayer.
              <br />
              Built to help you stay
              consistent.
            </p>

            <button
              onClick={nextStep}
              className={`w-full mt-12 h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both flex items-center justify-center gap-2 ${atmosphere.button}`}
            >
              Continue
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        )}

        {/* STEP 1 LOCATION */}

        {step === 1 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <MapPin
                size={24}
                className="text-emerald-600"
              />
            </div>

            <h1
              className={`text-2xl font-extrabold tracking-tight mb-3 ${atmosphere.text}`}
            >
              Prayer times depend on
              where you are.
            </h1>

            <p
              className={`text-[13px] font-medium mb-8 ${atmosphere.muted}`}
            >
              We'll use your location to
              provide:
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  icon: Clock,
                  title:
                    "Accurate prayer times",
                },
                {
                  icon: Compass,
                  title:
                    "Precise Qibla direction",
                },
                {
                  icon: MoonStar,
                  title:
                    "Local Islamic calendar",
                },
              ].map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                    style={{
                      animationDelay: `${
                        i * 100
                      }ms`,
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${atmosphere.accentBg}`}
                    >
                      <item.icon
                        size={14}
                        className={
                          atmosphere.accent
                        }
                      />
                    </div>

                    <span
                      className={`text-[14px] font-semibold ${atmosphere.text}`}
                    >
                      {item.title}
                    </span>
                  </div>
                )
              )}
            </div>

            {saveError && (
              <p className="text-[12px] text-red-500 mb-4 text-center">
                {saveError}
              </p>
            )}

            <button
              onClick={
                handleLocation
              }
              disabled={
                locStatus !==
                "idle"
              }
              className={`w-full h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-90 flex items-center justify-center gap-2 ${
                locStatus ===
                "done"
                  ? "bg-emerald-500 shadow-none"
                  : atmosphere.button
              }`}
            >
              {locStatus ===
              "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Locating...
                </>
              ) : locStatus ===
                "done" ? (
                <>
                  <Check
                    size={18}
                  />
                  Location Saved
                </>
              ) : (
                "Allow Location"
              )}
            </button>

            <button
              onClick={nextStep}
              className={`mt-4 text-[12px] font-medium ${atmosphere.muted} transition-colors text-center w-full`}
            >
              I'll set it manually
              later
            </button>
          </div>
        )}

        {/* STEP 2 CALCULATION */}

        {step === 2 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <h1
              className={`text-2xl font-extrabold tracking-tight mb-2 ${atmosphere.text}`}
            >
              How should we
              calculate?
            </h1>

            <p
              className={`text-[13px] font-medium mb-8 ${atmosphere.muted}`}
            >
              Select the standard used
              in your region.
            </p>

            <div className="space-y-3 mb-10">
              {[
                {
                  id: CALCULATION_METHODS.INDIA,
                  name: "Indian Timing",
                  desc:
                    "Karachi calculation + Hanafi Asr",
                },
                {
                  id: CALCULATION_METHODS.ISNA,
                  name: "ISNA",
                  desc:
                    "North America",
                },
                {
                  id: CALCULATION_METHODS.MWL,
                  name: "MWL",
                  desc:
                    "Europe, Far East, parts of Asia",
                },
                {
                  id: CALCULATION_METHODS.KARACHI,
                  name: "Karachi",
                  desc:
                    "Pakistan, Bangladesh, India",
                },
              ].map(
                (method, i) => {
                  const isSelected =
                    selectedMethod ===
                    method.id;

                  return (
                    <button
                      key={`${method.name}-${method.id}`}
                      onClick={() =>
                        handleMethodChange(
                          method.id
                        )
                      }
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                        isSelected
                          ? `border-emerald-500 ${atmosphere.accentBg} ring-1 ring-emerald-500/50 scale-[1.02]`
                          : `${atmosphere.borderColor} ${atmosphere.cardBg}`
                      }`}
                      style={{
                        animationDelay: `${
                          i * 100
                        }ms`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[15px] font-bold ${atmosphere.text}`}
                        >
                          {
                            method.name
                          }
                        </span>

                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600 animate-in zoom-in"
                          />
                        )}
                      </div>

                      <span
                        className={`text-[12px] font-medium mt-1 block ${atmosphere.muted}`}
                      >
                        {
                          method.desc
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={nextStep}
              className={`w-full h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${atmosphere.button}`}
            >
              Continue
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        )}

        {/* STEP 3 NOTIFICATIONS */}

        {step === 3 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Bell
                size={24}
                className="text-emerald-600"
              />
            </div>

            <h1
              className={`text-2xl font-extrabold tracking-tight mb-3 ${atmosphere.text}`}
            >
              Never miss a prayer.
            </h1>

            <p
              className={`text-[13px] font-medium mb-8 ${atmosphere.muted}`}
            >
              We'll gently remind you
              before the window closes.
            </p>

            <div
              className={`backdrop-blur-xl bg-white/40 dark:bg-black/40 border ${atmosphere.borderColor} rounded-[20px] p-4 mb-10 shadow-sm animate-in slide-in-from-bottom-4 duration-700`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <MoonStar
                    size={12}
                    className={
                      atmosphere.accent
                    }
                  />

                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold ${atmosphere.muted}`}
                  >
                    Tawfiq
                  </span>
                </div>

                <span
                  className={`text-[10px] font-medium ${atmosphere.muted}`}
                >
                  now
                </span>
              </div>

              <p
                className={`text-[14px] font-bold ${atmosphere.text}`}
              >
                Maghrib begins in 15
                minutes.
              </p>

              <p
                className={`text-[13px] font-medium mt-0.5 ${atmosphere.muted}`}
              >
                Take a moment to
                prepare.
              </p>
            </div>

            {saveError && (
              <p className="text-[12px] text-red-500 mb-4 text-center">
                {saveError}
              </p>
            )}

            <button
              onClick={
                handleNotifications
              }
              disabled={
                notifStatus !==
                "idle"
              }
              className={`w-full h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-90 flex items-center justify-center gap-2 ${
                notifStatus ===
                "done"
                  ? "bg-emerald-500 shadow-none"
                  : atmosphere.button
              }`}
            >
              {notifStatus ===
              "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enabling...
                </>
              ) : notifStatus ===
                "done" ? (
                <>
                  <Check
                    size={18}
                  />
                  Reminders On
                </>
              ) : (
                "Enable Reminders"
              )}
            </button>

            <button
              onClick={nextStep}
              className={`mt-4 text-[12px] font-medium ${atmosphere.muted} transition-colors text-center w-full`}
            >
              Maybe later
            </button>
          </div>
        )}

        {/* STEP 4 GOALS */}

        {step === 4 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <h1
              className={`text-2xl font-extrabold tracking-tight mb-2 ${atmosphere.text}`}
            >
              What are your goals?
            </h1>

            <p
              className={`text-[13px] font-medium mb-6 ${atmosphere.muted}`}
            >
              We'll personalize your
              dashboard based on what
              you want to achieve.
            </p>

            <div className="space-y-3 mb-8">
              {[
                {
                  id: "fajr",
                  icon: Sunrise,
                  text:
                    "Wake up for Fajr consistently.",
                },
                {
                  id: "qaza",
                  icon: TrendingUp,
                  text:
                    "Reduce my missed prayers.",
                },
                {
                  id: "jamaah",
                  icon: Users,
                  text:
                    "Pray more in congregation.",
                },
              ].map(
                (goal, i) => {
                  const isActive =
                    selectedGoals.includes(
                      goal.id
                    );

                  return (
                    <button
                      key={goal.id}
                      onClick={() =>
                        toggleGoal(
                          goal.id
                        )
                      }
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                        isActive
                          ? `border-emerald-500 ${atmosphere.accentBg} ring-1 ring-emerald-500/50 scale-[1.02]`
                          : `${atmosphere.borderColor} ${atmosphere.cardBg}`
                      }`}
                      style={{
                        animationDelay: `${
                          i * 100
                        }ms`,
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-emerald-500 text-white"
                            : `${atmosphere.accentBg} ${atmosphere.accent}`
                        }`}
                      >
                        <goal.icon
                          size={18}
                          strokeWidth={
                            isActive
                              ? 2.5
                              : 2
                          }
                        />
                      </div>

                      <span
                        className={`text-[14px] font-semibold text-left ${atmosphere.text}`}
                      >
                        {
                          goal.text
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={nextStep}
              className={`w-full h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${atmosphere.button}`}
            >
              Continue
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        )}

        {/* STEP 5 FINISH */}

        {step === 5 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
              <CheckCircle2
                size={32}
                className="text-emerald-500"
              />
            </div>

            <h1
              className={`text-3xl font-extrabold tracking-tight mb-3 ${atmosphere.text}`}
            >
              You're ready.
            </h1>

            <p
              className={`text-[14px] font-medium leading-relaxed ${atmosphere.muted}`}
            >
              May Allah grant you
              consistency and accept
              your worship.
            </p>

            <div
              className={`mt-10 w-full p-6 rounded-[24px] border ${atmosphere.borderColor} ${atmosphere.cardBg} backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-700`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold ${atmosphere.muted} mb-2`}
                >
                  Today's Next Prayer
                </span>

                <span
                  className={`text-2xl font-black tracking-tight ${atmosphere.text} mb-1`}
                >
                  {
                    mockPrayer.name
                  }
                </span>

                <span
                  className={`text-sm font-semibold ${atmosphere.accent}`}
                >
                  Starts in{" "}
                  {
                    mockPrayer.in
                  }
                </span>
              </div>
            </div>

            {saveError && (
              <p className="text-[12px] text-red-500 mt-5 text-center">
                {saveError}
              </p>
            )}

            <button
              onClick={finish}
              disabled={morphing}
              className={`w-full mt-10 h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2 ${atmosphere.button}`}
            >
              {morphing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing Tawfiq...
                </>
              ) : (
                "Open Tawfiq"
              )}
            </button>
          </div>
        )}
      </div>

      {/* PREMIUM TRANSITION */}

      {morphing && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center ${atmosphere.bg} animate-in fade-in duration-700`}
        >
          <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-[spin_10s_linear_infinite] pointer-events-none" />

          <div className="relative flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20" />

              <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500/60 animate-[spin_3s_cubic-bezier(0.4,0,0.2,1)_infinite]" />

              <div className="absolute inset-4 rounded-full border border-emerald-500/15" />

              <div className="absolute inset-4 rounded-full border-l-2 border-emerald-400/60 animate-[spin_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />

              <div className="absolute inset-8 rounded-full border-2 border-dashed border-emerald-500/30 animate-[spin_4s_linear_infinite]" />

              <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />

              <div className="relative z-10 scale-125">
                <LivingMoon
                  isDark={
                    atmosphere.isDark
                  }
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <h2
                className={`text-2xl font-arabic tracking-widest ${atmosphere.text}`}
              >
                بِسْمِ اللَّهِ
              </h2>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />

                <span
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold ${atmosphere.muted}`}
                >
                  Entering Tawfiq
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}