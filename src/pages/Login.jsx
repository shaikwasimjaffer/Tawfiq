import React, { useState, useEffect, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────────────────────

const getGreeting = (hour) => {
  if (hour >= 4 && hour < 12) return "Good Morning.";
  if (hour >= 12 && hour < 17) return "Good Afternoon.";
  if (hour >= 17 && hour < 20) return "Good Evening.";
  return "Welcome back.";
};

const getDynamicMessage = (hour) => {
  const generic = [
    "Every prayer counts.",
    "The next prayer is an opportunity.",
    "Consistency brings peace.",
    "Allah loves consistency.",
  ];

  const rand =
    generic[Math.floor(Math.random() * generic.length)];

  if (hour >= 4 && hour < 7)
    return "Fajr brings light to the soul.";

  if (hour >= 7 && hour < 15)
    return "May Allah bless your afternoon.";

  if (hour >= 15 && hour < 18)
    return rand;

  if (hour >= 18 && hour < 20)
    return "Maghrib approaches. Find peace.";

  return "End your day with remembrance.";
};

// ─────────────────────────────────────────────────────────────
// Atmosphere
// ─────────────────────────────────────────────────────────────

const getAtmosphere = (hour) => {
  if (hour >= 4 && hour < 7) {
    return {
      bg: "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ffffff]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      peerFocusAccent: "peer-focus:text-emerald-600",
      accentBg: "bg-emerald-600/10",
      borderColor: "border-emerald-900/10",
      button:
        "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.2)]",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing:
        "focus:ring-emerald-500/20 focus:border-emerald-500/50",
      isDark: false,
    };
  }

  if (hour >= 7 && hour < 18) {
    return {
      bg: "bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      peerFocusAccent: "peer-focus:text-emerald-600",
      accentBg: "bg-emerald-600/10",
      borderColor: "border-emerald-900/10",
      button:
        "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.2)]",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing:
        "focus:ring-emerald-500/20 focus:border-emerald-500/50",
      isDark: false,
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      bg: "bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]",
      text: "text-emerald-50",
      muted: "text-emerald-200/60",
      accent: "text-emerald-400",
      peerFocusAccent: "peer-focus:text-emerald-400",
      accentBg: "bg-emerald-400/10",
      borderColor: "border-emerald-100/10",
      button:
        "bg-emerald-500 hover:bg-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.2)]",
      inputBg: "bg-white/[0.04]",
      focusRing:
        "focus:ring-emerald-400/20 focus:border-emerald-400/50",
      isDark: true,
    };
  }

  return {
    bg: "bg-gradient-to-br from-[#022c22] via-[#014737] to-[#020617]",
    text: "text-emerald-50",
    muted: "text-emerald-200/50",
    accent: "text-emerald-400",
    peerFocusAccent: "peer-focus:text-emerald-400",
    accentBg: "bg-emerald-400/10",
    borderColor: "border-emerald-100/10",
    button:
      "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.3)]",
    inputBg: "bg-white/[0.03]",
    focusRing:
      "focus:ring-emerald-500/20 focus:border-emerald-500/50",
    isDark: true,
  };
};

// ─────────────────────────────────────────────────────────────
// Haptics
// ─────────────────────────────────────────────────────────────

const triggerHaptic = (type = "light") => {
  if (typeof navigator === "undefined" || !navigator.vibrate)
    return;

  if (type === "light") navigator.vibrate(10);
  if (type === "medium") navigator.vibrate(25);
  if (type === "success") navigator.vibrate([20, 40, 20]);
  if (type === "error") navigator.vibrate([30, 50, 30, 50, 30]);
};

// ─────────────────────────────────────────────────────────────
// Moon
// ─────────────────────────────────────────────────────────────

const LivingMoon = memo(({ isDark, isFriday }) => {
  return (
    <div className="relative group flex items-center justify-center w-12 h-12">
      <div
        className={`absolute inset-0 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] ${
          isDark
            ? "bg-emerald-400/20"
            : "bg-emerald-500/20"
        }`}
      />

      <svg
        className={`w-8 h-8 transition-transform duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] rotate-[15deg] group-hover:rotate-[25deg] ${
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

      {isFriday && (
        <Sparkles
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 ${
            isDark
              ? "text-emerald-300"
              : "text-emerald-500"
          }`}
        />
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// Prayer Chip
// ─────────────────────────────────────────────────────────────

const InteractivePrayerChip = ({
  atmosphere,
  isExiting,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [mins, setMins] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setMins((m) => (m > 0 ? m - 1 : 59));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isExiting) return null;

  return (
    <div
      onClick={() => {
        triggerHaptic("light");
        setExpanded((value) => !value);
      }}
      className={`relative mt-6 overflow-hidden transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer backdrop-blur-md border ${
        atmosphere.borderColor
      } ${
        expanded
          ? "w-[240px] rounded-[24px] p-4 bg-black/[0.03] dark:bg-white/[0.03]"
          : "w-[180px] rounded-full p-2 bg-transparent"
      }`}
    >
      {!expanded ? (
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`text-[11px] font-semibold uppercase tracking-widest tabular-nums ${atmosphere.muted}`}
          >
            Maghrib in{" "}
            <span className="font-bold">
              {mins}
            </span>
            m
          </span>

          <ChevronDown
            size={12}
            className={`${atmosphere.muted} opacity-50`}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className={`text-lg font-bold ${atmosphere.text}`}
            >
              Maghrib
            </span>

            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${atmosphere.accent} ${atmosphere.accentBg} px-2 py-1 rounded-full`}
            >
              In {mins}m
            </span>
          </div>

          <div
            className={`flex justify-between items-center pt-2 border-t ${atmosphere.borderColor}`}
          >
            <div className="flex flex-col text-left">
              <span
                className={`text-[9px] uppercase tracking-widest font-semibold ${atmosphere.muted}`}
              >
                Starts
              </span>

              <span
                className={`text-sm font-medium ${atmosphere.text}`}
              >
                6:53 PM
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span
                className={`text-[9px] uppercase tracking-widest font-semibold ${atmosphere.muted}`}
              >
                Ends
              </span>

              <span
                className={`text-sm font-medium ${atmosphere.text}`}
              >
                7:58 PM
              </span>
            </div>
          </div>

          <div
            className={`text-center text-[9px] uppercase tracking-widest font-medium ${atmosphere.muted} opacity-60 pt-1`}
          >
            ISNA Calculation
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  const hour = now.getHours();
  const isFriday = now.getDay() === 5;

  const atmosphere = useMemo(
    () => getAtmosphere(hour),
    [hour]
  );

  const greeting = useMemo(
    () => getGreeting(hour),
    [hour]
  );

  const message = useMemo(
    () => getDynamicMessage(hour),
    [hour]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [morphing, setMorphing] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const ambientTime = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load remembered email
  useEffect(() => {
    const savedEmail =
      localStorage.getItem("remember_email");

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // Ensure user settings
  // ───────────────────────────────────────────────────────────

  const ensureUserSettings = async (userId) => {
    if (!userId) return;

    const { data: existingSettings, error: fetchError } =
      await supabase
        .from("user_settings")
        .select("id, onboarding_done")
        .eq("user_id", userId)
        .maybeSingle();

    if (fetchError) {
      console.error(
        "Could not check user settings:",
        fetchError
      );
      return;
    }

    if (existingSettings) {
      return existingSettings;
    }

    const { data: newSettings, error: insertError } =
      await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          onboarding_done: false,
          primary_goals: [],
        })
        .select("id, onboarding_done")
        .single();

    if (insertError) {
      console.error(
        "Could not create user settings:",
        insertError
      );

      return null;
    }

    return newSettings;
  };

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 6;
  };

  // ───────────────────────────────────────────────────────────
  // Login
  // ───────────────────────────────────────────────────────────

  const handleLogin = async () => {
    triggerHaptic("medium");

    let isValid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 6 characters"
      );
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      triggerHaptic("error");

      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      return;
    }

    setLoading(true);

    try {
      // ───────────────────────────────────────────────────────
      // Supabase Auth
      // Supabase handles password verification.
      // ───────────────────────────────────────────────────────

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to authenticate user.");
      }

      // Make sure the user's settings row exists.
      const settings = await ensureUserSettings(
        data.user.id
      );

      // Remember email
      localStorage.setItem(
        "remember_email",
        email.trim().toLowerCase()
      );

      // We no longer need this after successful Auth.
      localStorage.removeItem("tawfiq_onboarding_done");

      triggerHaptic("success");

      setLoading(false);
      setMorphing(true);

      // Existing Tawfiq flow:
      // Login → Onboarding
      setTimeout(() => {
        navigate("/onboarding");
      }, 800);

    } catch (err) {
      console.error("Login error:", err);

      triggerHaptic("error");

      setLoading(false);

      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      if (
        err?.message?.toLowerCase().includes("invalid login")
      ) {
        setEmailError(
          "Incorrect email or password."
        );
      } else if (
        err?.message
          ?.toLowerCase()
          .includes("email not confirmed")
      ) {
        setEmailError(
          "Please confirm your email before logging in."
        );
      } else {
        setEmailError(
          err?.message ||
            "Authentication failed. Please try again."
        );
      }
    }
  };

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 transition-colors duration-[1500ms] ease-in-out ${
        atmosphere.bg
      } ${morphing ? "overflow-hidden" : ""}`}
    >
      <style>{`
        @keyframes subtle-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }

        .animate-shake {
          animation: subtle-shake 400ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        input {
          caret-color: #10b981;
        }

        input:focus {
          animation: focus-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes focus-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
      `}</style>

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient light */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_30s_linear_infinite] z-0 pointer-events-none" />

      {/* Time */}
      <div
        className={`absolute top-10 right-10 flex items-center gap-2 transition-opacity duration-700 z-10 ${
          morphing ? "opacity-0" : "opacity-100"
        }`}
      >
        <Clock
          size={12}
          className={`${atmosphere.muted} opacity-50`}
        />

        <span
          className={`text-[11px] font-semibold tracking-widest ${atmosphere.muted} tabular-nums`}
        >
          {ambientTime}
        </span>
      </div>

      {/* Main */}
      <div
        className={`w-full max-w-[320px] mx-auto relative z-10 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          morphing
            ? "opacity-0 scale-95 blur-[2px]"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-[48px]">
          <LivingMoon
            isDark={atmosphere.isDark}
            isFriday={isFriday}
          />

          <h2
            className={`text-2xl font-bold tracking-tight mt-6 mb-2 ${atmosphere.text}`}
          >
            {greeting}
          </h2>

          <p
            className={`text-[13px] font-medium tracking-wide ${atmosphere.muted}`}
          >
            {message}
          </p>

          <InteractivePrayerChip
            atmosphere={atmosphere}
            isExiting={morphing}
          />
        </div>

        {/* Inputs */}
        <div
          className={`space-y-[16px] text-left ${
            shake ? "animate-shake" : ""
          }`}
        >
          {/* Email */}
          <div className="relative group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onFocus={() => triggerHaptic("light")}
              autoComplete="email"
              className={`peer w-full h-[56px] px-4 pt-4 rounded-2xl border border-transparent ${
                atmosphere.inputBg
              } ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium ${
                atmosphere.text
              } placeholder-transparent`}
              placeholder="Email Address"
            />

            <label
              htmlFor="email"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium transition-all duration-[180ms] pointer-events-none ${
                atmosphere.muted
              } peer-focus:top-3.5 peer-focus:text-[10px] ${
                atmosphere.peerFocusAccent
              } ${email ? "top-3.5 text-[10px]" : ""}`}
            >
              Email Address
            </label>

            {emailError && (
              <p className="text-sm text-red-500 mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              onFocus={() => triggerHaptic("light")}
              autoComplete="current-password"
              className={`peer w-full h-[56px] pl-4 pr-12 pt-4 rounded-2xl border border-transparent ${
                atmosphere.inputBg
              } ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium tracking-widest ${
                atmosphere.text
              } placeholder-transparent`}
              placeholder="Password"
            />

            <label
              htmlFor="password"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium tracking-normal transition-all duration-[180ms] pointer-events-none ${
                atmosphere.muted
              } peer-focus:top-3.5 peer-focus:text-[10px] ${
                atmosphere.peerFocusAccent
              } ${password ? "top-3.5 text-[10px]" : ""}`}
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setShowPassword((value) => !value);
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${atmosphere.muted} transition-colors p-2 -mr-2`}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>

            {passwordError && (
              <p className="text-sm text-red-500 mt-1">
                {passwordError}
              </p>
            )}
          </div>
        </div>

        {/* Login button */}
        <div className="mt-[32px]">
          <button
            onClick={handleLogin}
            disabled={loading || morphing}
            className={`w-full rounded-2xl text-[14px] font-semibold tracking-wide transition-all duration-[120ms] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-80 min-w-[140px] ${
              loading
                ? `h-[56px] bg-${atmosphere.text}/5 text-transparent shadow-none`
                : `h-[56px] text-white ${atmosphere.button} hover:-translate-y-[1px]`
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-current ${atmosphere.accent} animate-bounce`}
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-current ${atmosphere.accent} animate-bounce`}
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-current ${atmosphere.accent} animate-bounce`}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            ) : (
              "Log In"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-[48px] flex flex-col items-center gap-[24px]">
          <Link
            to="/forgot-password"
            onClick={() => triggerHaptic("light")}
            className={`text-[12px] font-medium ${atmosphere.muted}`}
          >
            Forgot your password?
          </Link>

          <Link
            to="/register"
            onClick={() => triggerHaptic("light")}
            className={`text-[12px] font-medium ${atmosphere.muted}`}
          >
            Don't have an account?{" "}
            <span
              className={`underline underline-offset-4 decoration-opacity-40 ${atmosphere.accent}`}
            >
              Sign up
            </span>
          </Link>
        </div>
      </div>

      {/* Loading overlay */}
      {morphing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className={`w-12 h-12 rounded-full border-4 ${atmosphere.borderColor} border-t-emerald-500 animate-spin`}
          />
        </div>
      )}
    </div>
  );
}