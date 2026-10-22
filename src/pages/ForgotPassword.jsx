import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ArrowRight, ExternalLink, Copy, Check } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await base44.auth.resetPasswordRequest(cleanEmail);
      if (res?.resetUrl) {
        setGeneratedLink(res.resetUrl);
      }
      setSent(true);
      toast.success("Password recovery link generated.");
    } catch (err) {
      if (err.message && err.message.includes("Google Sign-In")) {
        setError(err.message);
      } else if (err.message && err.message.includes("Please wait")) {
        setError(err.message);
      } else {
        // Privacy-conscious response: do not reveal whether account exists
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Recovery link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email associated with your Tawfiq account and we'll provide instructions to reset your password."
      footer={
        <Link
          to="/login"
          className="text-[#134D37] font-semibold hover:underline inline-flex items-center gap-1.5 transition-colors text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to sign in</span>
        </Link>
      }
    >
      {sent ? (
        <div className="py-2 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#E3EEE6] text-[#134D37] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-bold text-[#1C3B2B]">
              Check your email
            </h3>
            <p className="text-xs text-[#70685C] leading-relaxed max-w-xs mx-auto">
              If an account is associated with <strong className="text-stone-800">{email}</strong>, follow the instructions we send you to reset your password.
            </p>
          </div>

          {/* Genuine Direct Recovery Link Card */}
          {generatedLink && (
            <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#DDD7CC] text-left space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#134D37] uppercase tracking-wider">
                <span>Secure Recovery Link</span>
                <span className="text-[10px] text-stone-500 font-normal">Valid for 15 min</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full text-xs font-mono bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-600 truncate select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors shrink-0"
                  title="Copy link"
                  aria-label="Copy recovery link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const url = new URL(generatedLink);
                    navigate(`${url.pathname}${url.search}`);
                  }}
                  className="w-full h-9 rounded-xl bg-[#134D37] hover:bg-[#0E3B2A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Reset Password Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setGeneratedLink("");
                setEmail("");
              }}
              className="text-[#134D37] hover:underline"
            >
              Use another email
            </button>
            <span className="text-stone-300">•</span>
            <Link to="/login" className="text-[#134D37] hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs font-medium leading-relaxed"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#403B32] uppercase tracking-wider text-[11px]"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="w-full h-11 sm:h-12 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-[#134D37] hover:bg-[#0E3B2A] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(19,77,55,0.22)] transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <>
                <span>Send recovery link</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

