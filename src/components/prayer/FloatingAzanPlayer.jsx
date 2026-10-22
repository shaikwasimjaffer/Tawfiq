import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Volume2, VolumeX, Radio } from "lucide-react";
import { azanAudioService } from "@/lib/azanAudioService";

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

export default function FloatingAzanPlayer() {
  const [audioState, setAudioState] = useState(() => {
    return (
      (typeof azanAudioService?.getState === "function"
        ? azanAudioService.getState()
        : azanAudioService?.state) || { isPlaying: false, isPaused: false }
    );
  });
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.85);

  useEffect(() => {
    if (typeof azanAudioService?.subscribe === "function") {
      return azanAudioService.subscribe((state) => {
        if (state) setAudioState(state);
      });
    }
  }, []);

  if (!audioState?.isPlaying && !audioState?.isPaused) {
    return null;
  }

  const voiceName = audioState.currentVoice?.name || "Azan Call to Prayer";
  const reciter = audioState.currentVoice?.reciter || "Makkah Al-Mukarramah";
  const progressPercent = audioState.duration > 0
    ? Math.min(100, (audioState.currentTime / audioState.duration) * 100)
    : 0;

  const handleTogglePlayPause = () => {
    if (audioState.isPaused) {
      azanAudioService.resume();
    } else {
      azanAudioService.pause();
    }
  };

  const handleStop = () => {
    azanAudioService.stop();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      azanAudioService.setVolume(prevVolume || 0.85);
      setIsMuted(false);
    } else {
      setPrevVolume(azanAudioService.getVolume());
      azanAudioService.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="region"
      aria-label="Active Azan Audio Player"
    >
      <div className="bg-[#0B2E20]/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-[#2E6B4F] shadow-emerald-950/40">
        {/* Top line: indicator and prayer title */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Animated sound wave bars */}
            <div className="flex items-end gap-0.5 h-3.5 shrink-0" aria-hidden="true">
              <span className={`w-1 bg-[#86D2AD] rounded-full ${!audioState.isPaused ? "animate-[bounce_0.8s_ease-in-out_infinite]" : "h-2"}`} style={{ height: "60%" }} />
              <span className={`w-1 bg-[#86D2AD] rounded-full ${!audioState.isPaused ? "animate-[bounce_1.1s_ease-in-out_infinite_0.2s]" : "h-3"}`} style={{ height: "100%" }} />
              <span className={`w-1 bg-[#86D2AD] rounded-full ${!audioState.isPaused ? "animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" : "h-2"}`} style={{ height: "40%" }} />
            </div>

            <div className="min-w-0 truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5D8BE] block leading-none">
                {audioState.prayerKey ? `${audioState.prayerKey.toUpperCase()} AZAN` : "AZAN AUDIO"}
              </span>
              <h4 className="text-[13px] font-medium text-white truncate leading-tight mt-0.5">
                {reciter}
              </h4>
            </div>
          </div>

          {/* Action buttons: Play/Pause, Stop, Mute */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleMute}
              className="w-7 h-7 rounded-full bg-[#174633] hover:bg-[#1E5740] flex items-center justify-center text-emerald-200 transition-colors"
              aria-label={isMuted ? "Unmute Azan audio" : "Mute Azan audio"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            <button
              type="button"
              onClick={handleTogglePlayPause}
              className="w-8 h-8 rounded-full bg-[#EAF5EF] hover:bg-white text-[#0B2E20] flex items-center justify-center shadow transition-transform active:scale-95"
              aria-label={audioState.isPaused ? "Resume Azan playback" : "Pause Azan playback"}
            >
              {audioState.isPaused ? (
                <Play size={13} className="fill-current ml-0.5" />
              ) : (
                <Pause size={13} className="fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={handleStop}
              className="w-7 h-7 rounded-full bg-rose-900/60 hover:bg-rose-900 text-rose-200 flex items-center justify-center transition-colors"
              aria-label="Stop and dismiss Azan audio"
            >
              <Square size={12} className="fill-current" />
            </button>
          </div>
        </div>

        {/* Progress bar and time indicators */}
        <div className="space-y-1">
          <div className="w-full bg-[#184A36] h-1.5 rounded-full overflow-hidden border border-[#2E6B4F]/50">
            <div
              className="bg-gradient-to-r from-[#62B78E] to-[#A3E5C2] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#A2C7B5] font-mono tabular-nums leading-none pt-0.5">
            <span>{formatSeconds(audioState.currentTime)}</span>
            <span>{formatSeconds(audioState.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
