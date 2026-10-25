import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  Bot,
  BookOpen,
  Plus,
  Trash2,
  Square,
  Compass,
  CheckCircle2,
  SquarePen,
  MessageSquare,
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowUp,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { retrieveEvidencePacket } from "@/lib/mentorRagService";
import { askTawfiqMentor, getStoredGeminiKey, setStoredGeminiKey, getActiveGeminiKey } from "@/lib/geminiClient";
import MentorAnswerCard from "@/components/mentor/MentorAnswerCard";
import ScriptureDetailModal from "@/components/mentor/ScriptureDetailModal";
import ZomatoAiTransition from "@/components/mentor/ZomatoAiTransition";
import { getAuthorizedUserPrayerContext } from "@/lib/salahCoachingService";
import { useAuth } from "@/lib/AuthContext";
import { usePrayerStreak } from "@/lib/usePrayerStreak";
import { TawfiqBrandIcon } from "@/components/AuthLayout";
import { toast } from "sonner";

const SESSIONS_STORAGE_KEY = "tawfiq_mentor_chat_sessions_v4";
const ACTIVE_SESSION_STORAGE_KEY = "tawfiq_mentor_active_session_id";
const FEEDBACK_STORAGE_KEY = "tawfiq_mentor_user_feedback";
const COACHING_CONSENT_KEY = "tawfiq_mentor_coaching_consent";

// ChatGPT-style Curated Islamic Prompt Cards
const HERO_PROMPT_CARDS = [
  {
    icon: "🕌",
    category: "Salah & Fiqh",
    title: "Missed Fajr due to sleep",
    prompt: "I missed Fajr because I overslept. What is the proper Shariah sequence to make it up with Dhuhr?",
  },
  {
    icon: "🤲",
    category: "Tawbah & Heart",
    title: "Repentance after repeating a sin",
    prompt: "I made a mistake, repented sincerely, but repeated it again. How does Allah view my Tawbah and how do I move forward?",
  },
  {
    icon: "📖",
    category: "Quranic Comfort",
    title: "Verses for severe anxiety",
    prompt: "Which authentic Surahs and Ayahs are recommended for finding tranquility during acute stress and anxiety?",
  },
  {
    icon: "⚖️",
    category: "Daily Situations",
    title: "Combining prayers for exams",
    prompt: "Can I combine Dhuhr and Asr prayers if I have a continuous university laboratory exam?",
  },
];

// Quick Focus Mode Pills
const FOCUS_MODES = [
  { id: "all", label: "🌿 All Sacred Fiqh" },
  { id: "quran", label: "📖 Quran & Tafsir" },
  { id: "hadith", label: "📜 Sahih Hadith" },
  { id: "coaching", label: "🕌 Salah Routine" },
];

export default function MentorApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const authContext = useAuth();
  const user = authContext?.user;
  const userScope = user?.id ? `u_${user.id}_` : "";

  // Streak counter
  const [now] = useState(() => new Date());
  const { currentStreak, longestStreak } = usePrayerStreak(now);

  // ── 1. Zomato AI-Style Full-Screen Transition ──────────────────────────
  // Fast, soft expanding transition when navigating to Mentor
  const [showZomatoTransition, setShowZomatoTransition] = useState(() => {
    return Boolean(location.state?.animatedEntry ?? true);
  });

  // ── 2. Multi-Session History State (ChatGPT Style) ─────────────────────
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Preserves active conversation session when navigating between tabs
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const activeId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const match = activeId ? parsed.find((s) => s.id === activeId) : parsed[0];
          if (match) return match.id;
        }
      }
    } catch {}
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  });

  // Current session's messages (restored from active session or empty for fresh canvas)
  const [messages, setMessages] = useState(() => {
    try {
      const activeId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const match = activeId ? parsed.find((s) => s.id === activeId) : parsed[0];
          if (match && Array.isArray(match.messages)) {
            return match.messages;
          }
        }
      }
    } catch {}
    return [];
  });

  // Sidebar Drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Input & Generation state
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [streamingText, setStreamingText] = useState("");

  // Feedback & Coaching state
  const [feedbackMap, setFeedbackMap] = useState(() => {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [coachingConsent, setCoachingConsent] = useState(() => {
    try {
      const stored = localStorage.getItem(COACHING_CONSENT_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // User prayer & Qaza context
  const [userPrayerContext, setUserPrayerContext] = useState(null);

  // Scripture Detail Modal state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gemini API Key Modal state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredGeminiKey());
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [keyTesting, setKeyTesting] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);

  async function handleTestApiKey() {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      toast.error("Please enter an API key to test.");
      return;
    }
    setKeyTesting(true);
    setKeyStatus(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${keyToTest}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
        }
      );
      if (res.ok) {
        setKeyStatus({ success: true, message: "Valid Gemini API Key! Quota active." });
        toast.success("Gemini API Key verified successfully!");
      } else if (res.status === 429) {
        setKeyStatus({ success: false, message: "Rate limit / quota exceeded for this key." });
        toast.error("Quota exceeded for this key.");
      } else {
        const errData = await res.json().catch(() => ({}));
        setKeyStatus({ success: false, message: errData?.error?.message || "Invalid API key." });
        toast.error("Invalid API key.");
      }
    } catch (e) {
      setKeyStatus({ success: false, message: e.message });
      toast.error("Connection failed.");
    } finally {
      setKeyTesting(false);
    }
  }

  function handleSaveApiKey() {
    setStoredGeminiKey(apiKeyInput.trim());
    toast.success(apiKeyInput.trim() ? "Custom Gemini API key saved!" : "Reverted to default configuration.");
    setApiKeyModalOpen(false);
  }

  function handleClearApiKey() {
    setApiKeyInput("");
    setStoredGeminiKey("");
    setKeyStatus(null);
    toast.info("Custom API key cleared. Reverted to system default.");
  }

  // Refs
  const bottomRef = useRef(null);
  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // ── Scroll Prevention: Strictly pin to top on mount or new chat ────────
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = 0;
    }
  }, [currentSessionId]);

  // Load user prayer context
  useEffect(() => {
    const ctx = getAuthorizedUserPrayerContext(userScope);
    setUserPrayerContext(ctx);
  }, [userScope]);

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Persist feedback to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackMap));
    } catch {}
  }, [feedbackMap]);

  // Persist coaching consent
  useEffect(() => {
    try {
      localStorage.setItem(COACHING_CONSENT_KEY, JSON.stringify(coachingConsent));
    } catch {}
  }, [coachingConsent]);

  // Auto-scroll ONLY when user has submitted a prompt or when streaming
  useEffect(() => {
    if (messages.length > 0 && (loading || isGeneratingRef.current)) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading, streamingText]);

  // Handle URL query parameter ?q=... (e.g. from landing page prompt launcher)
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam.trim() && !loading) {
      const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setCurrentSessionId(newId);
      setMessages([]);
      try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newId);
      } catch {}
      handleSend(queryParam.trim());
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Save current messages to active session
  const syncCurrentMessagesToSession = (newMessages) => {
    if (!newMessages || newMessages.length === 0) return;

    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, currentSessionId);
    } catch {}

    setSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === currentSessionId);
      const firstUserMsg = newMessages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 38) + (firstUserMsg.content.length > 38 ? "..." : "")
        : "New Conversation";

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          messages: newMessages,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newSession = {
          id: currentSessionId,
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: newMessages,
        };
        return [newSession, ...prev];
      }
    });
  };

  // Switch to a previous conversation from history drawer
  const handleSelectSession = (session) => {
    if (loading) handleStopGeneration();
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setSidebarOpen(false);
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.id);
    } catch {}

    // Reset scroll to top of chat
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = 0;
      }
    }, 50);
  };

  // Start a fresh, clean ChatGPT conversation session
  const handleNewChat = () => {
    if (loading) handleStopGeneration();
    const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setCurrentSessionId(newId);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newId);
    } catch {}

    // Pin scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = 0;
    }
    toast.success("New chat ready");
  };

  // Delete a specific session from history
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
    toast.info("Conversation removed.");
  };

  // Clear all saved conversations
  const handleClearAllSessions = () => {
    if (window.confirm("Clear all conversation history? This cannot be undone.")) {
      if (loading) handleStopGeneration();
      setSessions([]);
      setMessages([]);
      try {
        localStorage.removeItem(SESSIONS_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      } catch {}
      handleNewChat();
      toast.success("All chat history cleared.");
    }
  };

  // Progressive streaming animation
  const streamResponseAnimation = useCallback(async (fullAnswer, userMsgId) => {
    const text =
      fullAnswer.answer ||
      fullAnswer.directAnswer ||
      fullAnswer.scenarioApplication ||
      fullAnswer.explanation ||
      "Guidance generated from scripture.";
    const words = text.split(" ");
    let current = "";

    for (let i = 0; i < words.length; i++) {
      if (!isGeneratingRef.current) break;
      current += (i === 0 ? "" : " ") + words[i];
      setStreamingText(current);
      await new Promise((resolve) => setTimeout(resolve, 18));
    }

    setStreamingText("");
    const assistantMsg = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: current || text,
      answer: fullAnswer,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, assistantMsg];
      syncCurrentMessagesToSession(next);
      return next;
    });
  }, [currentSessionId]);

  // Main Send Action
  async function handleSend(text) {
    const q = (text || input).trim();
    if (!q || loading) return;

    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    syncCurrentMessagesToSession(nextMessages);

    setLoading(true);
    isGeneratingRef.current = true;
    setLoadingStep("Retrieving verified Quran & Hadith citations...");

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const historyContext = nextMessages.slice(-4);
      const activeCoachingContext = coachingConsent ? userPrayerContext : null;
      const packet = await retrieveEvidencePacket(q, historyContext, activeCoachingContext);

      if (!isGeneratingRef.current) return;
      setLoadingStep("Neural Islamic Reasoner synthesizing answer with authentic citations...");

      const answer = await askTawfiqMentor(q, packet);

      if (!isGeneratingRef.current) return;
      setLoadingStep("Formulating responsible guidance...");

      await streamResponseAnimation(answer, userMsg.id);
    } catch (err) {
      if (!isGeneratingRef.current) {
        toast.info("Generation stopped by user.");
      } else {
        console.error("Mentor query error:", err);
        const errMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            "An error occurred while evaluating scriptural evidence. Please ensure a stable connection or try rephrasing your question.",
        };
        setMessages((prev) => {
          const next = [...prev, errMsg];
          syncCurrentMessagesToSession(next);
          return next;
        });
        toast.error("Unable to complete request. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
      setStreamingText("");
      isGeneratingRef.current = false;
      abortControllerRef.current = null;
    }
  }

  function handleStopGeneration() {
    isGeneratingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setLoadingStep("");
    setStreamingText("");
  }

  function handleRegenerate(lastUserPrompt) {
    if (loading) return;
    const promptToRetry =
      lastUserPrompt || messages.filter((m) => m.role === "user").pop()?.content;
    if (promptToRetry) {
      setMessages((prev) => {
        if (prev.length > 1 && prev[prev.length - 1].role === "assistant") {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSend(promptToRetry);
    }
  }

  function handleFeedback(msgId, type) {
    setFeedbackMap((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
    toast.success(
      type === "helpful" ? "Thank you for your feedback!" : "Feedback recorded."
    );
  }

  function handleOpenScriptureModal(citation) {
    setSelectedCitation(citation);
    setIsModalOpen(true);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize input textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  // Grouped sessions for ChatGPT-style history sidebar
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="h-[100dvh] w-full bg-[#F7F5EF] text-[#2A261F] flex flex-col overflow-hidden font-sans select-none relative"
    >
      {/* ── Zomato AI-Style Full-Screen Transition Animation ────────────── */}
      <ZomatoAiTransition
        isOpen={showZomatoTransition}
        onComplete={() => {
          setShowZomatoTransition(false);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = 0;
          }
        }}
      />

      {/* ── Slide-Over History Sidebar (ChatGPT Drawer) ────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-[#1C1F1D] text-[#ECEEEA] flex flex-col z-10 shadow-2xl border-r border-white/10 animate-in slide-in-from-left duration-200">
            {/* Drawer Top Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#134D37] flex items-center justify-center text-[#EAF2ED]">
                  <TawfiqBrandIcon className="w-4 h-4" color="currentColor" />
                </div>
                <span className="font-serif font-bold text-sm tracking-tight text-white">
                  Chat History
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* + New Chat Button in Drawer */}
            <div className="p-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-between border border-white/10 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Plus size={15} className="text-[#34D399]" />
                  <span>New chat</span>
                </div>
                <SquarePen size={14} className="text-stone-400" />
              </button>
            </div>

            {/* Search chats */}
            {sessions.length > 2 && (
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin">
              {filteredSessions.length === 0 ? (
                <div className="py-8 text-center px-4 text-xs text-stone-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-600 opacity-60" />
                  <p>No past conversations found.</p>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Your questions and scriptural findings will be saved here.
                  </p>
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = s.id === currentSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`group w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? "bg-[#134D37] text-white font-semibold"
                          : "text-stone-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare
                          size={13}
                          className={`shrink-0 ${
                            isActive ? "text-[#34D399]" : "text-stone-400"
                          }`}
                        />
                        <span className="truncate">{s.title || "Conversation"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-400 rounded transition-opacity shrink-0"
                        title="Delete chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
              <span className="truncate max-w-[130px]">
                {user?.name || "Tawfiq Seeker"}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    setApiKeyModalOpen(true);
                  }}
                  className="text-stone-400 hover:text-[#34D399] transition-colors flex items-center gap-1"
                  title="Configure Gemini API Key"
                >
                  <Sparkles size={11} className="text-[#34D399]" />
                  <span>API Key</span>
                </button>
                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSessions}
                    className="text-stone-400 hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ChatGPT-Style Top Header Bar ───────────────────────────────── */}
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[#F7F5EF] border-b border-[#E8E2D6] px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 z-30"
      >
        {/* Left: History drawer toggle & New Chat */}
        <div className="flex-1 flex items-center gap-1 sm:gap-2 justify-start">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#4A453C] hover:text-[#134D37] hover:bg-[#EBE5DB] rounded-xl transition-colors relative"
            title="Open chat history sidebar"
          >
            <Menu size={18} />
            {sessions.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#134D37]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNewChat}
            className="p-2 text-[#4A453C] hover:text-[#134D37] hover:bg-[#EBE5DB] rounded-xl transition-colors hidden xs:flex items-center gap-1.5 text-xs font-semibold"
            title="New Chat"
          >
            <SquarePen size={16} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Center: Segmented Toggle (Tawfiq <-> Mentor) */}
        <div className="flex items-center justify-center shrink-0">
          <div className="inline-flex items-center h-[34px] p-[2.5px] bg-[#EAE4D9] rounded-full border border-[#DFD8CC] shadow-2xs">
            <Link
              to="/"
              className="px-3.5 h-full flex items-center justify-center rounded-full text-xs text-[#70685C] hover:text-[#2A261F] font-medium transition-colors"
            >
              Tawfiq
            </Link>
            <div className="px-3.5 h-full flex items-center justify-center rounded-full bg-white text-[#134D37] font-bold text-xs shadow-xs border border-black/5">
              Mentor
            </div>
          </div>
        </div>

        {/* Right: Symmetrical spacer to balance left nav controls and keep center toggle perfectly centered */}
        <div className="flex-1 flex items-center justify-end" />
      </motion.header>

      {/* ── Main Chat Area (ChatGPT-Style Canvas) ────────────────────────── */}
      <main
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col items-center scrollbar-thin relative"
      >
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-between">
          {/* ── EMPTY STATE: ChatGPT Landing Hero ── */}
          {messages.length === 0 ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.38, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="my-auto py-6 sm:py-10 flex flex-col items-center text-center"
            >
              {/* Luminous Emblem */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#134D37] text-[#F3E5AB] flex items-center justify-center shadow-[0_4px_24px_rgba(19,77,55,0.22)] border border-[#D4AF37]/40 mb-4 sm:mb-5 relative group">
                <TawfiqBrandIcon className="w-9 h-9 sm:w-11 sm:h-11" color="currentColor" />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#062419] flex items-center justify-center shadow-xs">
                  <Sparkles size={11} />
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C3B2B] tracking-tight mb-2">
                What guidance can I help you seek today?
              </h1>
              <p className="text-xs sm:text-[13.5px] text-[#70685C] max-w-md mx-auto leading-relaxed mb-6 sm:mb-8 font-normal">
                Ask any real-life scenario regarding prayer consistency, daily rulings, repentance,
                or Quranic peace. Verified with authentic scriptures.
              </p>

              {/* 4 ChatGPT-Style Suggestion Cards Grid with Staggered Motion */}
              <motion.div
                initial={shouldReduceMotion ? false : "hidden"}
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.14,
                    },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left"
              >
                {HERO_PROMPT_CARDS.map((card, idx) => (
                  <motion.button
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    whileHover={shouldReduceMotion ? {} : { y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    type="button"
                    onClick={() => handleSend(card.prompt)}
                    disabled={loading}
                    className="p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#DDD7CC] hover:border-[#134D37] text-left transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(19,77,55,0.08)] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#134D37]">
                        <span>{card.icon}</span>
                        <span>{card.category}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-[#2A261F] group-hover:text-[#134D37] transition-colors leading-snug">
                        {card.title}
                      </p>
                    </div>
                    <p className="text-[11.5px] text-[#787062] mt-1.5 line-clamp-2 leading-relaxed">
                      {card.prompt}
                    </p>
                  </motion.button>
                ))}
              </motion.div>

              {/* Personalized Context Badge if present */}
              {userPrayerContext?.hasUserData && (
                <div className="mt-6 flex items-center gap-2 text-xs text-[#5C5549] bg-white/70 px-3.5 py-1.5 rounded-full border border-[#DDD7CD]">
                  <Compass size={13} className="text-[#134D37]" />
                  <span>
                    Current Streak: <strong>{userPrayerContext.currentStreakDays}d</strong> • Qaza Owed:{" "}
                    <strong>{userPrayerContext.totalQazaOwed}</strong>
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            /* ── ACTIVE CONVERSATION FEED ── */
            <div className="space-y-4 sm:space-y-5 pb-6">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                const feedback = feedbackMap[m.id];

                return (
                  <div
                    key={m.id || idx}
                    className={`flex items-start gap-2.5 sm:gap-3 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? "bg-[#1C3B2B] text-white"
                          : "bg-[#134D37] text-[#F3E5AB] border border-[#D4AF37]/40 shadow-xs"
                      }`}
                    >
                      {isUser ? <User size={14} /> : <TawfiqBrandIcon className="w-4 h-4" color="#F3E5AB" />}
                    </div>

                    {/* Content Box */}
                    <div
                      className={`transition-all ${
                        isUser
                          ? "max-w-[85%] px-4 py-3 bg-[#1C3B2B] text-white rounded-2xl rounded-tr-xs text-[14px] leading-relaxed shadow-xs"
                          : m.answer
                          ? "w-full max-w-full sm:max-w-[95%] p-4 sm:p-5 bg-white text-[#2A261F] rounded-2xl rounded-tl-xs border border-[#DDD7CC] shadow-xs"
                          : "max-w-[90%] p-4 bg-white text-[#2A261F] rounded-2xl rounded-tl-xs border border-[#DDD7CC] shadow-xs text-[14px]"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      ) : m.answer ? (
                        <MentorAnswerCard
                          answer={m.answer}
                          onRegenerate={() => handleRegenerate(messages[idx - 1]?.content)}
                          onFeedback={(type) => handleFeedback(m.id, type)}
                          feedbackState={feedback}
                          onOpenScriptureModal={handleOpenScriptureModal}
                          onReportCitation={(cit) =>
                            toast.info(`Citation reported: ${cit.reference || "scripture"}`)
                          }
                        />
                      ) : (
                        <div className="prose prose-stone text-xs leading-relaxed max-w-none">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading State & Streaming Indicator */}
              {loading && (
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#134D37] text-[#F3E5AB] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                    <TawfiqBrandIcon className="w-4 h-4" color="#F3E5AB" />
                  </div>

                  <div className="w-full max-w-full sm:max-w-[95%] rounded-2xl rounded-tl-xs p-4 sm:p-5 bg-white border border-[#DDD7CC] shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-[#70685C]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#134D37] animate-ping" />
                        <span className="italic">{loadingStep || "Tawfiq Mentor is reflecting..."}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStopGeneration}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#70685C] hover:text-[#1C3B2B] bg-[#FAF8F5] hover:bg-[#EBE5DB] px-2.5 py-1 rounded-full transition-colors border border-[#DDD7CD]"
                      >
                        <Square size={10} className="fill-current" />
                        <span>Stop</span>
                      </button>
                    </div>

                    {streamingText && (
                      <div className="pt-2 border-t border-[#F0ECE1]">
                        <h2 className="text-[#1C3B2B] font-semibold text-sm tracking-tight mb-1">
                          Direct Guidance
                        </h2>
                        <div className="text-[14.5px] leading-relaxed text-[#2A261F] whitespace-pre-wrap">
                          {streamingText}
                          <span className="inline-block w-1.5 h-4 bg-[#134D37] ml-1 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── ChatGPT-Style Floating Bottom Dock ───────────────────────────── */}
      <motion.footer
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[#F7F5EF] border-t border-[#E8E2D6] px-3 sm:px-6 pt-2.5 pb-3 sm:pb-4 shrink-0 z-30"
      >
        <div className="max-w-2xl mx-auto w-full">
          {/* Continuous Capsule Prompt Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white rounded-full pl-4 sm:pl-5 pr-1.5 sm:pr-2 py-1.5 sm:py-2 border border-[#DDD7CC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-[#134D37] focus-within:ring-2 focus-within:ring-[#134D37]/15 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask anything on prayer, repentance, or Islamic guidance..."
              className="flex-1 bg-transparent px-1 py-1 text-[13.5px] sm:text-[14px] text-[#2A261F] placeholder:text-[#9B9386] focus:outline-none resize-none max-h-32 disabled:opacity-50 font-normal leading-relaxed min-w-0"
            />

            {loading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9B1C1C] hover:bg-[#801414] text-white flex items-center justify-center transition-all shrink-0 shadow-2xs active:scale-95"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square size={13} className="fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#134D37] hover:bg-[#0E3B2A] text-white flex items-center justify-center transition-all disabled:opacity-25 shrink-0 shadow-2xs active:scale-95 disabled:pointer-events-none"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <ArrowUp size={16} strokeWidth={2.2} />
              </button>
            )}
          </form>

          {/* Bottom Disclaimer */}
          <p className="text-[11px] text-[#8C8273] text-center mt-2 font-normal leading-tight px-2 truncate sm:whitespace-normal">
            Tawfiq Mentor references sacred Islamic texts. For binding rulings, consult a qualified scholar.
          </p>
        </div>
      </motion.footer>

      {/* ── Scripture Inspection Modal ─────────────────────────────────── */}
      <ScriptureDetailModal
        citation={selectedCitation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* ── Gemini API Key Configuration Modal ──────────────────────────── */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1C2421] border border-white/10 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#34D399]">
                <Key size={18} />
              </div>
              <h3 className="text-base font-bold font-serif">Google Gemini AI Engine</h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Tawfiq Mentor generates live, scenario-grounded answers by querying{" "}
              <span className="text-[#34D399] font-medium">quran.json</span> and{" "}
              <span className="text-[#34D399] font-medium">hadith.json</span> and reasoning over them with Google Gemini.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKeyText ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    className="w-full h-10 px-3 pr-10 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyText(!showApiKeyText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showApiKeyText ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {keyStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    keyStatus.success
                      ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/60 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>{keyStatus.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#34D399] hover:underline flex items-center gap-1"
                >
                  <span>Get free key from Google AI Studio</span>
                  <ExternalLink size={11} />
                </a>
                {getStoredGeminiKey() && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-stone-400 hover:text-rose-400 transition-colors"
                  >
                    Clear custom key
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={keyTesting}
                className="flex-1 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {keyTesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Test Key</span>
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 h-9 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
