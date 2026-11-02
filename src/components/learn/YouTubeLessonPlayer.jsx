import React, { useState, useRef, useEffect } from "react";
import { Play, ExternalLink, Maximize2, Minimize2, RotateCcw } from "lucide-react";

export default function YouTubeLessonPlayer({
  videoId = "8b7g5J2Y84M",
  title = "Salah Demonstration Video",
  thumbnailUrl,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLandscapeFullscreen, setIsLandscapeFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Fallback high quality video ID for Salah demonstration
  const effectiveId = videoId || "8b7g5J2Y84M";
  const defaultThumbnail = `https://img.youtube.com/vi/${effectiveId}/hqdefault.jpg`;
  const poster = thumbnailUrl || defaultThumbnail;

  // Toggle in-app Landscape mode
  const toggleLandscape = async (e) => {
    if (e) e.stopPropagation();
    setIsPlaying(true);

    if (!isLandscapeFullscreen) {
      setIsLandscapeFullscreen(true);

      // Attempt Screen Orientation lock and Fullscreen API if supported by mobile browser
      try {
        if (containerRef.current && containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current && containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }

        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock("landscape").catch(() => {});
        }
      } catch (err) {
        // Fallback to pure CSS landscape layout which always works
      }
    } else {
      exitLandscape();
    }
  };

  const exitLandscape = async () => {
    setIsLandscapeFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
      if (window.screen?.orientation?.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (err) {}
  };

  // Sync state if user presses Escape or exits native fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsLandscapeFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <>
      {/* Landscape Fullscreen Backdrop / Container */}
      <div
        ref={containerRef}
        className={`${
          isLandscapeFullscreen
            ? "fixed inset-0 z-50 bg-black flex flex-col justify-center items-center w-screen h-screen p-0 m-0 overflow-hidden"
            : "relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-border bg-slate-950 group"
        }`}
      >
        {isPlaying ? (
          <div className="relative w-full h-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${effectiveId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              className="w-full h-full border-0"
            />

            {/* Quick in-app Landscape / Normal Mode Toggle Button */}
            <button
              onClick={toggleLandscape}
              title={isLandscapeFullscreen ? "Exit Landscape" : "Play in Landscape Mode"}
              className="absolute top-3 left-3 z-30 flex items-center gap-1.5 text-xs font-bold text-white bg-black/75 hover:bg-black/90 active:scale-95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg transition-all"
            >
              {isLandscapeFullscreen ? (
                <>
                  <Minimize2 size={14} />
                  <span>Exit Landscape</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span>Landscape Mode</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
          >
            {/* Video Poster */}
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${effectiveId}/0.jpg`;
              }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

            {/* Central Play Button */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-600/95 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/50 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
                <Play size={28} className="fill-white ml-1" />
              </div>
              <span className="text-white text-xs font-bold tracking-wide uppercase px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                Watch Demonstration
              </span>
            </div>

            {/* Top Controls: Landscape mode pill & YouTube link */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
              <button
                type="button"
                onClick={toggleLandscape}
                className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/70 hover:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-all shadow-md active:scale-95"
              >
                <Maximize2 size={13} />
                <span>Landscape Mode</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${effectiveId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] font-bold text-white/90 bg-black/60 hover:bg-black/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/15 transition-colors"
              >
                <span>YouTube</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
