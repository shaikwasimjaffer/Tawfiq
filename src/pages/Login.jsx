import React, { useState, useEffect, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, ChevronDown, Clock } from "lucide-react";

// Contextual Greetings & Subtitles
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
  const rand = generic[Math.floor(Math.random() * generic.length)];

  if (hour >= 4 && hour < 7) return "Fajr brings light to the soul.";
  if (hour >= 7 && hour < 15) return "May Allah bless your afternoon.";
  if (hour >= 15 && hour < 18) return rand;
  if (hour >= 18 && hour < 20) return "Maghrib approaches. Find peace.";
  return "End your day with remembrance.";
};

// Purely Green Atmosphere (Changes shade, not color)
const getAtmosphere = (hour) => {
  if (hour >= 4 && hour < 7) {
    return {
      bg: "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ffffff]", // Light emerald
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      peerFocusAccent: "peer-focus:text-emerald-600",
      accentBg: "bg-emerald-600/10",
      borderColor: "border-emerald-900/10",
      button:
        "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.2)]",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/50",
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
      focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/50",
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
      focusRing: "focus:ring-emerald-400/20 focus:border-emerald-400/50",
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
    focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/50",
    isDark: true,
  };
};

const triggerHaptic = (type = "light") => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === "light") navigator.vibrate(10);
    if (type === "medium") navigator.vibrate(25);
    if (type === "success") navigator.vibrate([20, 40, 20]);
    if (type === "error") navigator.vibrate([30, 50, 30, 50, 30]);
  }
};

const LivingMoon = memo(({ isDark, isFriday }) => {
  return (
    <div className="relative group flex items-center justify-center w-12 h-12">
      <div
        className={`absolute inset-0 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] ${isDark ? "bg-emerald-400/20" : "bg-emerald-500/20"}`}
      />
      <svg
        className={`w-8 h-8 transition-transform duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in fade-in zoom-in rotate-[15deg] group-hover:rotate-[25deg] ${
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
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 animate-[pulse_2s_ease-in-out_infinite] ${isDark ? "text-emerald-300" : "text-emerald-500"}`}
        />
      )}
    </div>
  );
});

const InteractivePrayerChip = ({ atmosphere, isExiting }) => {
  const [expanded, setExpanded] = useState(false);
  const [mins, setMins] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setMins((m) => (m > 0 ? m - 1 : 59));
      triggerHaptic("light");
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isExiting) return null;

  return (
    <div
      onClick={() => {
        triggerHaptic("light");
        setExpanded(!expanded);
      }}
      className={`relative mt-6 overflow-hidden transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer backdrop-blur-md border ${atmosphere.borderColor} ${
        expanded
          ? "w-[240px] rounded-[24px] p-4 bg-black/[0.03] dark:bg-white/[0.03]"
          : "w-[180px] rounded-full p-2 bg-transparent"
      }`}
    >
      {!expanded ? (
        <div className="flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
          <span
            className={`text-[11px] font-semibold uppercase tracking-widest tabular-nums ${atmosphere.muted}`}
          >
            Maghrib in{" "}
            <span
              className="inline-block animate-in slide-in-from-bottom-2 fade-in duration-[400ms] text-current font-bold"
              key={mins}
            >
              {mins}
            </span>
            m
          </span>
          <ChevronDown size={12} className={`${atmosphere.muted} opacity-50`} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${atmosphere.text}`}>
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
                className={`text-sm font-medium ${atmosphere.text} tabular-nums`}
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
                className={`text-sm font-medium ${atmosphere.text} tabular-nums`}
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

export default function Login() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  const hour = now.getHours();
  const isFriday = now.getDay() === 5;
  const atmosphere = useMemo(() => getAtmosphere(hour), [hour]);
  const greeting = useMemo(() => getGreeting(hour), [hour]);
  const message = useMemo(() => getDynamicMessage(hour), [hour]);

  const isFajrEasterEgg = hour >= 4 && hour < 6;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [morphing, setMorphing] = useState(false);

  const ambientTime = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async () => {
    triggerHaptic("medium");
    if (!email.trim() || !password.trim()) {
      triggerHaptic("error");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    localStorage.setItem("remember_email", email);

    setTimeout(() => {
      triggerHaptic("success");
      setLoading(false);
      setMorphing(true);

      if (!localStorage.getItem("tawfiq_registered_user")) {
        localStorage.setItem(
          "tawfiq_registered_user",
          JSON.stringify({ email, password }),
        );
      }

      localStorage.removeItem("tawfiq_onboarding_done");
      // Changed to 2000ms so the user can enjoy the new loader
      setTimeout(() => navigate("/onboarding"), 2000);
    }, 800);
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 transition-colors duration-[1500ms] ease-in-out ${atmosphere.bg} ${morphing ? "overflow-hidden" : ""}`}
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

      {/* 1% Grain Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Emerald Ambient Light */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_30s_linear_infinite] z-0 pointer-events-none" />

      {/* Floating Ambient Time */}
      <div
        className={`absolute top-10 right-10 flex items-center gap-2 transition-opacity duration-700 z-10 ${morphing ? "opacity-0" : "opacity-100"}`}
      >
        <Clock size={12} className={`${atmosphere.muted} opacity-50`} />
        <span
          className={`text-[11px] font-semibold tracking-widest ${atmosphere.muted} tabular-nums`}
        >
          {ambientTime}
        </span>
      </div>

      {/* Main Container */}
      <div
        className={`w-full max-w-[320px] mx-auto relative z-10 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${morphing ? "opacity-0 scale-95 blur-[2px]" : "opacity-100 scale-100"}`}
      >
        {/* Gateway Header */}
        <div className="flex flex-col items-center text-center mb-[48px]">
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-[800ms] fill-mode-both"
            style={{ animationDelay: "0ms" }}
          >
            <LivingMoon isDark={atmosphere.isDark} isFriday={isFriday} />
          </div>

          <h2
            className={`text-2xl font-bold tracking-tight mt-6 mb-2 ${atmosphere.text} animate-in fade-in blur-in duration-[800ms] fill-mode-both`}
            style={{ animationDelay: "80ms" }}
          >
            {greeting}
          </h2>

          <p
            className={`text-[13px] font-medium tracking-wide ${atmosphere.muted} animate-in fade-in slide-in-from-bottom-2 duration-[800ms] fill-mode-both`}
            style={{ animationDelay: "160ms" }}
          >
            {message}
          </p>

          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-[800ms] fill-mode-both"
            style={{ animationDelay: "240ms" }}
          >
            <InteractivePrayerChip
              atmosphere={atmosphere}
              isExiting={morphing}
            />
          </div>
        </div>

        {/* Inputs */}
        <div
          className={`space-y-[16px] text-left animate-in fade-in slide-in-from-bottom-2 duration-[800ms] fill-mode-both ${shake ? "animate-shake" : ""}`}
          style={{ animationDelay: "400ms" }}
        >
          <div className="relative group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => triggerHaptic("light")}
              className={`peer w-full h-[56px] px-4 pt-4 rounded-2xl border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium ${atmosphere.text} placeholder-transparent`}
              placeholder="Email Address"
            />
            <label
              htmlFor="email"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium transition-all duration-[180ms] pointer-events-none ${atmosphere.muted} peer-focus:top-3.5 peer-focus:text-[10px] ${atmosphere.peerFocusAccent} peer-valid:top-3.5 peer-valid:text-[10px]`}
            >
              Email Address
            </label>
          </div>

          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => triggerHaptic("light")}
              className={`peer w-full h-[56px] pl-4 pr-12 pt-4 rounded-2xl border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium tracking-widest ${atmosphere.text} placeholder-transparent`}
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium tracking-normal transition-all duration-[180ms] pointer-events-none ${atmosphere.muted} peer-focus:top-3.5 peer-focus:text-[10px] ${atmosphere.peerFocusAccent} peer-valid:top-3.5 peer-valid:text-[10px]`}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setShowPassword(!showPassword);
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${atmosphere.muted} hover:${atmosphere.text} transition-colors p-2 -mr-2`}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div
          className="mt-[32px] animate-in fade-in slide-in-from-bottom-2 duration-[800ms] fill-mode-both"
          style={{ animationDelay: "480ms" }}
        >
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
                  style={{ animationDelay: "0ms" }}
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

        <div
          className="mt-[48px] flex flex-col items-center gap-[24px] animate-in fade-in duration-[800ms] fill-mode-both"
          style={{ animationDelay: "560ms" }}
        >
          <Link
            to="/forgot-password"
            onClick={() => triggerHaptic("light")}
            className={`text-[12px] font-medium transition-all duration-200 ${atmosphere.muted} hover:${atmosphere.text} active:scale-95`}
          >
            Forgot your password?
          </Link>
          <Link
            to="/register"
            onClick={() => triggerHaptic("light")}
            className={`text-[12px] font-medium transition-colors ${atmosphere.muted} hover:${atmosphere.text}`}
          >
            Don't have an account?{" "}
            <span
              className={`underline underline-offset-4 decoration-opacity-40 decoration-current ${atmosphere.accent}`}
            >
              Sign up
            </span>
          </Link>
        </div>
      </div>

      {/* Morphing state loader overlay */}
      {morphing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div
            className={`w-12 h-12 rounded-full border-4 ${atmosphere.borderColor} border-t-emerald-500 animate-spin`}
          />
        </div>
      )}
    </div>
  );
}
