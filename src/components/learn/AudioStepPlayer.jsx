import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles } from "lucide-react";

export default function AudioStepPlayer({
  arabicText,
  transliteration,
  audioUrl,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(3.5); // estimated duration in seconds
  const audioRef = useRef(null);
  const synthRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize or cleanup
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [arabicText]);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const startProgressTimer = (estimatedSecs) => {
    setDuration(estimatedSecs);
    setProgress(0);
    const intervalMs = 100;
    const stepIncrement = (intervalMs / (estimatedSecs * 1000)) * 100;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(timerRef.current);
          return 100;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // If explicit audio URL exists
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        fallbackToSpeech();
      });

      audioRef.current.onended = () => {
        stopPlayback();
      };
      return;
    }

    fallbackToSpeech();
  };

  const fallbackToSpeech = () => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const textToSpeak = arabicText || transliteration || "";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8; // Relaxed Tajweed-friendly recitation pace
      utterance.pitch = 1.0;

      // Try finding Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic"),
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      // Estimate speech duration based on text length
      const wordCount = textToSpeak.split(/\s+/).length;
      const estimatedSeconds = Math.max(2.5, wordCount * 0.9);

      utterance.onstart = () => {
        setIsPlaying(true);
        startProgressTimer(estimatedSeconds);
      };

      utterance.onend = () => {
        stopPlayback();
      };

      utterance.onerror = () => {
        stopPlayback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer simulation
      setIsPlaying(true);
      startProgressTimer(3);
      setTimeout(() => {
        stopPlayback();
      }, 3000);
    }
  };

  const handleReplay = () => {
    stopPlayback();
    setTimeout(() => {
      handlePlayToggle();
    }, 150);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between gap-3">
        {/* Recite pill */}
        <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Volume2 size={13} className={isPlaying ? "animate-pulse text-emerald-600" : ""} />
          <span>{isPlaying ? "Reciting..." : "Say & Listen"}</span>
        </span>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Animated sound wave bars when playing */}
          {isPlaying && (
            <div className="flex items-center gap-0.5 px-2 py-1">
              <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
            </div>
          )}

          {/* Replay Button */}
          <button
            onClick={handleReplay}
            title="Repeat recitation"
            className="w-8 h-8 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={13} />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={handlePlayToggle}
            title={isPlaying ? "Pause audio" : "Play Arabic audio"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md ${
              isPlaying
                ? "bg-emerald-600 text-white ring-4 ring-emerald-400/30 shadow-emerald-500/30"
                : "bg-emerald-700 text-white hover:bg-emerald-600"
            }`}
          >
            {isPlaying ? (
              <Pause size={15} className="fill-white" />
            ) : (
              <Play size={15} className="fill-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/50 h-1.5 rounded-full overflow-hidden mt-1">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-150"
          style={{ width: `${isPlaying ? progress : 0}%` }}
        />
      </div>
    </div>
  );
}
