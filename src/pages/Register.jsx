import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Check,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP Verification state if provider requires confirmation
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resending, setResending] = useState(false);

  const validateInputs = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Please choose a password.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) return;

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanName =
        name.trim() ||
        cleanEmail
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

      const res = await base44.auth.register({
        email: cleanEmail,
        password,
        name: cleanName,
      });

      // If backend provider requires email confirmation via OTP
      if (res?.requiresOtp || res?.status === "verification_required") {
        setShowOtp(true);
        toast.info("Verification code sent to your email.");
      } else {
        // Successful registration and automatic session creation
        await base44.auth.loginViaEmailPassword(cleanEmail, password);
        await checkUserAuth();
        toast.success("Account created successfully. Welcome to Tawfiq!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({
        email: email.trim(),
        otpCode,
      });

      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      await checkUserAuth();
      toast.success("Email verified! Welcome to Tawfiq.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResending(true);
    try {
      await base44.auth.resendOtp(email.trim());
      toast.success("A new 6-digit code has been sent to your email.");
    } catch (err) {
      setError(err?.message || "Could not resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const handleGoogle = () => {
    setError("");
    setGoogleLoading(true);
    try {
      base44.auth.loginWithProvider("google", "/");
    } catch (err) {
      setGoogleLoading(false);
      // Honest notification of OAuth setup status
      setError(
        err?.message ||
          "Google Sign-In is not currently available for this deployment. Please register with your email."
      );
    }
  };

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // ── OTP Email Verification View ──────────────────────────────────────────
  if (showOtp) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit confirmation code to ${email}`}
        footer={
          <p className="text-[#5C5549] text-xs">
            Entered the wrong email?{" "}
            <button
              onClick={() => setShowOtp(false)}
              className="text-[#134D37] font-bold hover:underline ml-1"
            >
              Go back
            </button>
          </p>
        }
      >
        <div className="flex justify-center my-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val);
              if (error) setError("");
            }}
          >
            <InputOTPGroup className="gap-2 sm:gap-2.5">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="w-10 sm:w-12 h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl border border-[#DDD7CC] bg-[#FAF8F5] focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otpCode.length < 6}
          className="w-full h-11 sm:h-12 bg-[#134D37] hover:bg-[#0E3B2A] text-white rounded-xl sm:rounded-2xl text-[14px] sm:text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(19,77,55,0.22)] transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Complete registration</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="text-xs text-[#5C5549] hover:text-[#134D37] font-semibold transition-colors"
          >
            {resending ? "Sending new code..." : "Didn't receive it? Resend code"}
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Standard Account Creation Form ──────────────────────────────────────
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Tawfiq to track Salah, manage Qaza, and discover authentic guidance."
      footer={
        <p className="text-[#5C5549] text-xs">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#134D37] font-bold hover:underline underline-offset-4 transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-[#134D37]/20 rounded"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {/* Google Action with consistent label */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl border border-[#D5CDC0] bg-white hover:bg-[#FAF8F5] text-[#2A261F] text-[13.5px] sm:text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30 group disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#134D37]" />
        ) : (
          <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-105 transition-transform" />
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-4 sm:my-5 flex items-center justify-center">
        <div className="w-full border-t border-[#EAE4D9]" />
        <span className="absolute px-3 bg-white text-[11px] uppercase tracking-widest text-[#787062] font-semibold">
          or register with email
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs leading-relaxed flex items-start gap-2.5 shadow-2xs"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#9B1C1C] mt-1.5 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
        {/* Full Name (Optional) */}
        <div className="space-y-1 text-left">
          <label
            htmlFor="register-name"
            className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
          >
            Full name <span className="text-[#787062] font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Wasim Jaffer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10.5 sm:h-11.5 pl-10 pr-4 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[13.5px] sm:text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1 text-left">
          <label
            htmlFor="register-email"
            className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-10.5 sm:h-11.5 pl-10 pr-4 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[13.5px] sm:text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1 text-left">
          <label
            htmlFor="register-password"
            className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-10.5 sm:h-11.5 pl-10 pr-11 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[13.5px] sm:text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#787062] hover:text-[#2A261F] hover:bg-[#EAE4D9]/50 transition-colors rounded-xl focus:outline-none focus:ring-1 focus:ring-[#134D37]/30"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1 text-left">
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-10.5 sm:h-11.5 pl-10 pr-11 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[13.5px] sm:text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#787062] hover:text-[#2A261F] hover:bg-[#EAE4D9]/50 transition-colors rounded-xl focus:outline-none focus:ring-1 focus:ring-[#134D37]/30"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements Guide */}
        {password.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9] space-y-1 text-[11px] text-[#5C5549]">
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasMinLength
                    ? "bg-[#134D37] text-white"
                    : "bg-[#DDD7CC] text-stone-600"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className={hasMinLength ? "text-[#134D37] font-semibold" : ""}>
                At least 8 characters
              </span>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    passwordsMatch
                      ? "bg-[#134D37] text-white"
                      : "bg-[#DDD7CC] text-stone-600"
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span
                  className={passwordsMatch ? "text-[#134D37] font-semibold" : ""}
                >
                  Passwords match
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 sm:h-12 mt-1 sm:mt-2 bg-[#134D37] hover:bg-[#0E3B2A] active:bg-[#0A2D20] text-white rounded-xl sm:rounded-2xl text-[14px] sm:text-[14.5px] font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(19,77,55,0.22)] hover:shadow-[0_6px_20px_rgba(19,77,55,0.28)] transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] outline-none focus-visible:ring-4 focus-visible:ring-[#134D37]/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
