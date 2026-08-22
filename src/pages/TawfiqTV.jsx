import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Plus,
  ChevronRight,
  X,
  VolumeX,
  Volume2,
  Share2,
  ThumbsUp,
  Download,
  ArrowLeft,
  Search,
  Droplet,
  Waves,
  Landmark,
  Moon,
  Heart,
  FileText,
  CheckCircle2,
  ListOrdered,
  Clock,
  BookOpen,
  Info,
  Pause,
  Repeat,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Video,
  PlayCircle,
  Trophy,
  BookMarked,
  Star,
  GraduationCap,
  Map,
  Scale,
  Palette,
  Users,
  MessageCircle,
  Flame,
  MapPin,
  CalendarDays,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sun,
  Sparkles,
  Shield,
  Compass,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";

// ─── UTILITIES ─────────────────────────────────────────────────────────────
const hideScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// Using the provided local video file
const SAMPLE_TRAILER =
  "/How to Make Wudu Step by Step - Majed Mahmoud (1080p).mp4";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const heroCarousel = [
  {
    id: 1,
    title: "Stories of the Prophets",
    subtitle: "Quran • Authentic • Series",
    image:
      "/ChatGPT Image Jul 24, 2026, 06_15_52 PM.png",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 2,
    title: "Tafsir Al-Baqarah",
    subtitle: "Quran • Tafsir • Episodes",
    image:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 3,
    title: "Miracles of the Quran",
    subtitle: "Documentary • History • HD",
    image:
      "https://images.unsplash.com/photo-1519818175545-3129881512db?q=80&w=1200&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
];

const continueWatching = [
  {
    id: 101,
    title: "Prophet Yusuf (AS)",
    series: "Prophet Yusuf (AS)",
    episode: "Episode 3",
    progress: 65,
    timeLeft: "18m left",
    image:
      "/ChatGPT Image Jul 24, 2026, 06_15_52 PM.png",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 102,
    title: "Tafsir Al-Baqarah",
    series: "Tafsir Al-Baqarah",
    episode: "Lesson 12",
    progress: 15,
    timeLeft: "45m left",
    image:
      "https://images.unsplash.com/photo-1519818175545-3129881512db?q=80&w=800&h=450&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
];

const newReleases = [
  {
    id: 201,
   
    image:
      "/wudu2.png",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 202,
    title: "Hud (AS)",
    episodes: "5 Episodes",
    image:
      "https://images.unsplash.com/photo-1542128962-9d50ad7bf014?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 203,
    title: "Salih (AS)",
    episodes: "4 Episodes",
    image:
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 204,
    title: "Ibrahim (AS)",
    episodes: "12 Episodes",
    image:
      "https://images.unsplash.com/photo-1574246604907-db69e30ddb97?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
];

const quranSeries = [
  {
    id: 301,
    title: "Juz Amma Explained",
    episodes: "Series",
    image:
      "/ChatGPT Image Jul 24, 2026, 06_15_52 PM.png",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 302,
    title: "Tajweed Masterclass",
    episodes: "Course",
    image:
      "https://images.unsplash.com/photo-1597551681492-10c86e481548?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 303,
    title: "Miracles of the Quran",
    episodes: "Documentary",
    image:
      "https://images.unsplash.com/photo-1519818175545-3129881512db?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 304,
    title: "Heart of the Believer",
    episodes: "Series",
    image:
      "/ChatGPT Image Jul 24, 2026, 06_15_52 PM.png",
    trailerUrl: SAMPLE_TRAILER,
  },
];

const kids = [
  {
    id: 401,
    title: "Stories of Animals",
    episodes: "Kids",
    image:
      "/ChatGPT Image Jul 24, 2026, 06_15_52 PM.png",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 402,
    title: "Learning Arabic",
    episodes: "Kids",
    image:
      "https://images.unsplash.com/photo-1574246604907-db69e30ddb97?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 403,
    title: "Prophets for Kids",
    episodes: "Kids",
    image:
      "https://images.unsplash.com/photo-1564769662533-4f00abce0bc4?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
  {
    id: 404,
    title: "My First Duas",
    episodes: "Kids",
    image:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=400&h=600&auto=format&fit=crop",
    trailerUrl: SAMPLE_TRAILER,
  },
];

// Mock episode list for the detailed view
const mockEpisodesList = [
  {
    title: "Children of the Comet",
    meta: "S1 E2 • 12 May 2022 • 49m",
    image: heroCarousel[0].image,
  },
  {
    title: "Ghosts of Illyria",
    meta: "S1 E3 • 19 May 2022 • 43m",
    image: heroCarousel[1].image,
  },
  {
    title: "Memento Mori",
    meta: "S1 E4 • 26 May 2022 • 51m",
    image: heroCarousel[2].image,
  },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────

const MediaDetailsModal = ({ item, onClose }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement || document.webkitFullscreenElement;

      if (isFullscreen) {
        try {
          if (
            window.screen &&
            window.screen.orientation &&
            window.screen.orientation.lock
          ) {
            await window.screen.orientation.lock("landscape");
          }
        } catch (error) {
          console.warn("Screen orientation lock failed:", error);
        }
      } else {
        try {
          if (
            window.screen &&
            window.screen.orientation &&
            window.screen.orientation.unlock
          ) {
            window.screen.orientation.unlock();
          }
        } catch (error) {
          console.warn("Screen orientation unlock failed:", error);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  if (!item) return null;

  // ─── PLAYING VIEW (Triggered when a user clicks Play or an Episode) ───
  if (showPlayer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#0A0A0A] overflow-y-auto text-white flex flex-col"
      >
        {/* Sticky Video Player Header - Updated to fill landscape/cover cleanly */}
        <div className="sticky top-0 z-50 w-full aspect-video bg-black flex-shrink-0 relative overflow-hidden">
          <video
            ref={videoRef}
            src={item.trailerUrl || SAMPLE_TRAILER}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-cover bg-black outline-none"
          />
          {/* Custom Overlay for Back Button */}
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none flex justify-between items-start z-10">
            <button
              onClick={() => setShowPlayer(false)}
              className="pointer-events-auto text-white hover:text-gray-300 drop-shadow-md transition-colors"
            >
              <ArrowLeft size={26} />
            </button>
          </div>
        </div>

        {/* Mock Ad Banner */}
        <div className="bg-[#18181A] px-4 py-3 flex items-center justify-between border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-black text-[10px] font-black leading-tight text-center uppercase">
              Ad
            </div>
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">
                Gillette Guard 3in1
              </p>
              <p className="text-[11px] text-gray-400">Guard 3in1</p>
            </div>
          </div>
          <button className="bg-[#1D4ED8] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded transition-colors">
            Buy Now
          </button>
        </div>

        {/* Episodes List */}
        <div className="p-4 space-y-4">
          {mockEpisodesList.map((ep, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="relative w-[130px] aspect-video bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                <img
                  src={ep.image}
                  alt="Episode thumbnail"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <Play
                  size={18}
                  fill="white"
                  className="absolute bottom-2 left-2 text-white drop-shadow-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {ep.title}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">{ep.meta}</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition">
                <Download size={20} />
              </button>
            </div>
          ))}

          <div className="pt-2 flex justify-center">
            <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors border border-gray-800">
              <ChevronDown size={16} /> View More
            </button>
          </div>
        </div>

        {/* More Like This Section */}
        <div className="p-4 pb-12 border-t border-[#1A1A1A]">
          <h3 className="text-[15px] font-bold text-white mb-4">
            More Like This
          </h3>
          <div
            className={`flex gap-3 overflow-x-auto snap-x snap-mandatory ${hideScrollbar}`}
          >
            {newReleases.map((poster) => (
              <div
                key={poster.id}
                className="w-[120px] flex-shrink-0 snap-start cursor-pointer group rounded overflow-hidden relative bg-[#1A1A1A]"
              >
                <div className="w-full aspect-[2/3] relative">
                  <img
                    src={poster.image}
                    alt={poster.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-90" />
                  <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                    <h4 className="text-white text-xs font-bold leading-tight drop-shadow-md">
                      {poster.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── STANDARD DETAILS VIEW (Default when card is clicked) ───
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#0A0A0A] overflow-y-auto text-white flex flex-col"
    >
      {/* ─── TRAILER VIDEO HEADER ─── */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        {item.trailerUrl ? (
          <video
            src={item.trailerUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}

        {/* Gradient overlay to blend video into the dark background */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-gray-300 drop-shadow-md z-10">
          TRAILER
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition z-10"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10">
          <span className="bg-gray-600/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-bold">
            Arabic
          </span>
          <span className="text-gray-200 text-xs font-medium drop-shadow-md">
            English Original
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition z-10"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* ─── DETAILS SECTION ─── */}
      <div className="px-5 py-6 relative z-20 -mt-4">
        <h1 className="text-3xl font-black font-serif italic text-center mb-3 tracking-wide uppercase drop-shadow-md">
          {item.title || item.series}
        </h1>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 mb-4 font-semibold uppercase tracking-wider">
          <span className="text-[#3b82f6]">IMDb 8.5</span>
          <span>•</span>
          <span className="text-[#3b82f6]">New Season</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-6 font-medium">
          <span>2024</span>
          <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-300">
            U/A 13+
          </span>
          <span>{item.episodes || "4 Seasons"}</span>
          <span>2 Languages</span>
        </div>

        {/* ─── PLAY FULL VIDEO BUTTON ─── */}
        <button
          onClick={() => setShowPlayer(true)}
          className="w-full bg-white text-black py-3.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 mb-6 hover:bg-gray-200 transition active:scale-[0.98]"
        >
          <Play size={18} fill="currentColor" /> Watch First Episode{" "}
          <span className="text-gray-500 font-medium ml-1">S1 E1</span>
        </button>

        <p className="text-[11px] font-bold text-gray-400 mb-3 flex flex-wrap gap-2 justify-center">
          <span className="text-white">Action</span>{" "}
          <span className="text-gray-700">|</span>
          <span className="text-white">Adventure</span>{" "}
          <span className="text-gray-700">|</span>
          <span className="text-white">Historical</span>{" "}
          <span className="text-gray-700">|</span>
          <span className="text-white">Inspirational</span>
        </p>

        <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
          Experience the profound journey and trials. A stunning visual
          masterpiece bringing authentic historical narratives and lessons to
          life for the modern believer.
        </p>

        <p className="text-xs font-bold text-white mb-6">
          New Episode Fridays at 12:01 AM
        </p>

        {/* ─── ACTIONS ROW ─── */}
        <div className="flex items-center justify-around mb-8 px-4">
          <div className="flex flex-col items-center gap-2 cursor-pointer relative group">
            <Plus size={24} className="text-white" />
            <span className="text-[10px] text-gray-400 font-medium">
              Watchlist
            </span>
            <div className="absolute -top-10 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none shadow-lg">
              Click to add to Watchlist
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <Share2 size={24} className="text-white" />
            <span className="text-[10px] text-gray-400 font-medium">Share</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <ThumbsUp size={24} className="text-white" />
            <span className="text-[10px] text-gray-400 font-medium">Rate</span>
          </div>
        </div>

        {/* ─── SEASONS TABS ─── */}
        <div className="border-b border-gray-800 mb-5 flex gap-6 overflow-x-auto hide-scrollbar">
          <button className="pb-3 border-b-2 border-white text-sm font-bold text-white whitespace-nowrap">
            Season 1
          </button>
          <button className="pb-3 text-sm font-bold text-gray-500 whitespace-nowrap hover:text-gray-300 transition">
            Season 2
          </button>
          <button className="pb-3 text-sm font-bold text-gray-500 whitespace-nowrap hover:text-gray-300 transition">
            Season 3
          </button>
          <button className="pb-3 text-sm font-bold text-gray-500 whitespace-nowrap hover:text-gray-300 transition">
            Season 4
          </button>
        </div>

        {/* ─── EPISODES LIST ─── */}
        <div className="space-y-4 pb-12">
          {mockEpisodesList.map((ep, idx) => (
            <div
              key={idx}
              onClick={() => setShowPlayer(true)}
              className="flex items-center gap-4 cursor-pointer group opacity-90 hover:opacity-100 transition-opacity"
            >
              <div className="relative w-[130px] aspect-video bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                <img
                  src={ep.image}
                  alt="Episode thumbnail"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <Play
                  size={18}
                  fill="white"
                  className="absolute bottom-2 left-2 text-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {ep.title}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">{ep.meta}</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Landscape Card (16:9) exactly for Continue Watching
const ContinueWatchingCard = ({ item, onSelect }) => (
  <motion.div
    onClick={() => onSelect(item)}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="w-[260px] flex-shrink-0 snap-start cursor-pointer group overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.25)] bg-[#1A1A1A] rounded-none"
  >
    <div className="w-full aspect-video relative rounded-none">
      <img
        src={item.image}
        alt={item.series}
        className="w-full h-full object-cover rounded-none"
      />

      {/* Dimming overlay and play button on hover */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-none border-[1.5px] border-white/50 flex items-center justify-center bg-black/30 backdrop-blur-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
          <Play size={20} fill="white" className="text-white ml-1" />
        </div>
      </div>

      {/* Bottom Gradient Overlay for Text & Progress */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 rounded-none" />

      <div className="absolute bottom-0 inset-x-0 p-3 pb-4">
        <h4 className="text-white text-[14px] font-bold leading-tight truncate drop-shadow-md">
          {item.series}
        </h4>
        <div className="flex items-center justify-between mt-1 mb-2.5">
          <span className="text-gray-300 text-[11px] font-medium">
            {item.episode}
          </span>
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">
            {item.timeLeft}
          </span>
        </div>
        {/* Netflix-style Progress Bar */}
        <div className="h-1 bg-gray-600/60 rounded-none overflow-hidden">
          <div
            className="h-full bg-[#0F8A5F] rounded-none"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// Portrait Card (2:3 aspect ratio) for standard rows
const PosterCard = ({ item, onSelect }) => (
  <motion.div
    onClick={() => onSelect(item)}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="w-[130px] flex-shrink-0 snap-start cursor-pointer group overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.25)] bg-[#1A1A1A] rounded-none"
  >
    <div className="w-full aspect-[2/3] relative rounded-none">
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover rounded-none"
      />

      {/* Bottom Gradient Overlay for Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 rounded-none" />

      <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end h-full pointer-events-none">
        <h4 className="text-white text-[14px] font-bold leading-tight drop-shadow-md mb-0.5">
          {item.title}
        </h4>
        <p className="text-gray-400 text-[11px] font-medium drop-shadow-sm">
          {item.episodes}
        </p>
      </div>
    </div>
  </motion.div>
);

const CarouselRow = ({
  title,
  items,
  isContinueWatching = false,
  onSelect,
}) => (
  <div className="mb-8">
    <div className="px-5 mb-2.5 flex items-center justify-between">
      <h2 className="text-white font-bold text-[17px] tracking-wide drop-shadow-sm">
        {title}
      </h2>
      <ChevronRight
        size={20}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
      />
    </div>
    <div
      className={`flex gap-3 overflow-x-auto px-5 pb-4 snap-x snap-mandatory ${hideScrollbar}`}
    >
      {items.map((item) =>
        isContinueWatching ? (
          <ContinueWatchingCard key={item.id} item={item} onSelect={onSelect} />
        ) : (
          <PosterCard key={item.id} item={item} onSelect={onSelect} />
        ),
      )}
    </div>
  </div>
);

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function TawfiqTV() {
  const [selectedMedia, setSelectedMedia] = useState(null);

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans pb-24 overflow-x-hidden">
      {/* ─── NEW STACKED HERO CAROUSEL ────────────────────────────────────── */}
      <div className="relative mb-8 pt-8">
        <div
          className={`flex gap-4 overflow-x-auto px-5 snap-x snap-mandatory ${hideScrollbar}`}
        >
          {heroCarousel.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              whileTap={{ scale: 0.98 }}
              className="w-[85vw] max-w-[400px] aspect-[4/5] flex-shrink-0 snap-center relative bg-[#1A1A1A] overflow-hidden rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Dark Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

              {/* Top Left: IMDb Badge */}
              <div className="absolute top-5 left-5 bg-[#F5C518] text-black text-[11px] font-extrabold px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md z-10">
                <span className="bg-black text-[#F5C518] text-[9px] px-1 rounded-sm">
                  IMDb
                </span>{" "}
                8.5
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-6 left-5 right-5 flex justify-between items-end pointer-events-none z-10">
                {/* Left Side: Title & Meta */}
                <div className="flex flex-col gap-2 flex-1 pr-4">
                  <h1 className="text-4xl font-black text-white leading-[1.05] drop-shadow-lg font-serif italic">
                    {item.title}
                  </h1>
                  <p className="text-[10px] text-gray-300 font-semibold drop-shadow-md tracking-wider">
                    2024 • 5 Languages •{" "}
                    {item.subtitle.split(" • ")[1] || "Action"} •{" "}
                    {item.subtitle.split(" • ")[2] || "Biopic"}
                  </p>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex flex-col gap-3 items-center pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      /* Add to watchlist logic */
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMedia(item);
                    }}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-xl"
                  >
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── HORIZONTAL CAROUSELS ─────────────────────────────────────────── */}
      <CarouselRow
        title="Continue Watching"
        items={continueWatching}
        isContinueWatching={true}
        onSelect={setSelectedMedia}
      />

      <CarouselRow
        title="New Releases"
        items={newReleases}
        onSelect={setSelectedMedia}
      />

      <CarouselRow
        title="Learn the Quran"
        items={quranSeries}
        onSelect={setSelectedMedia}
      />

      <CarouselRow
        title="Kids & Family"
        items={kids}
        onSelect={setSelectedMedia}
      />

      <CarouselRow
        title="Recently Added"
        items={newReleases.slice().reverse()}
        onSelect={setSelectedMedia}
      />

      {/* ─── DETAILED VIEW MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaDetailsModal
            item={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── DARK BOTTOM NAV ──────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-xl border-t border-[#222]">
        <BottomNav theme="dark" />
      </div>
    </div>
  );
}