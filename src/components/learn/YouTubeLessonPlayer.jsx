import React, { useState } from "react";
import { Play, ExternalLink, Video } from "lucide-react";

export default function YouTubeLessonPlayer({
  videoId = "8b7g5J2Y84M",
  title = "Salah Demonstration Video",
  thumbnailUrl,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Fallback high quality video ID for Salah demonstration
  const effectiveId = videoId || "8b7g5J2Y84M";
  const defaultThumbnail = `https://img.youtube.com/vi/${effectiveId}/hqdefault.jpg`;
  const poster = thumbnailUrl || defaultThumbnail;

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-border bg-slate-950 group">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${effectiveId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
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
              // Fallback if maxres/hq thumbnail is unavailable
              e.currentTarget.src = `https://img.youtube.com/vi/${effectiveId}/0.jpg`;
            }}
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

          {/* Central Play Button */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl shadow-emerald-900/40 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
              <Play size={28} className="fill-white ml-1" />
            </div>
            <span className="text-white text-xs font-bold tracking-wide uppercase px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              Watch Salah Demonstration
            </span>
          </div>

          {/* External YouTube link badge */}
          <a
            href={`https://www.youtube.com/watch?v=${effectiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 text-[11px] font-bold text-white/90 bg-black/60 hover:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 transition-colors"
          >
            <span>YouTube</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
