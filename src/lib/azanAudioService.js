/**
 * Tawfiq Azan Audio Service
 *
 * Singleton audio controller managing authentic Azan recordings,
 * offline Web Audio chimes, volume controls, state subscriptions,
 * and graceful browser autoplay handling.
 */

export const AZAN_VOICES = [
  {
    id: "makkah",
    name: "Makkah Al-Mukarramah",
    reciter: "Sheikh Ali Ahmed Mullah",
    src: "/audio/azan/makkah.mp3",
    description: "The historic, resounding call from the Grand Mosque of Makkah",
  },
  {
    id: "madinah",
    name: "Madinah Al-Munawwarah",
    reciter: "Sheikh Essam Bukhari",
    src: "/audio/azan/madinah.mp3",
    description: "Serene, melodic recitation from the Prophet's Mosque",
  },
  {
    id: "alaqsa",
    name: "Masjid Al-Aqsa",
    reciter: "Sheikh Abdul Basit",
    src: "/audio/azan/alaqsa.mp3",
    description: "Traditional soul-stirring Maqam Bayati call to prayer",
  },
];

const PREFS_STORAGE_KEY = "tawfiq_azan_audio_prefs";

class AzanAudioService {
  constructor() {
    this.audioElement = null;
    this.activeVoiceId = "makkah";
    this.volume = 0.85;
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentVoice: null,
      prayerKey: null,
      currentTime: 0,
      duration: 0,
      error: null,
    };
    this.listeners = new Set();
    this.audioContext = null;

    if (typeof window !== "undefined") {
      this.loadPreferences();
      this.initAudioElement();
    }
  }

  loadPreferences() {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.voiceId && AZAN_VOICES.some((v) => v.id === parsed.voiceId)) {
          this.activeVoiceId = parsed.voiceId;
        }
        if (typeof parsed.volume === "number") {
          this.volume = Math.max(0, Math.min(1, parsed.volume));
        }
      }
    } catch {}
  }

  savePreferences() {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          voiceId: this.activeVoiceId,
          volume: this.volume,
        })
      );
    } catch {}
  }

  initAudioElement() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = "auto";
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener("timeupdate", () => {
        this.updateState({
          currentTime: this.audioElement.currentTime,
          duration: this.audioElement.duration || 0,
        });
      });

      this.audioElement.addEventListener("ended", () => {
        this.stop();
      });

      this.audioElement.addEventListener("error", (e) => {
        console.warn("[AzanAudioService] Playback notice:", e);
        this.updateState({
          isPlaying: false,
          isPaused: false,
          error: "Audio playback could not be started.",
        });
      });
    }
  }

  getAudioContext() {
    if (!this.audioContext && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /**
   * Synthesizes an offline, gentle double chime using Web Audio API
   * Guaranteed to work without external network dependencies.
   */
  playGentleChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Note 1: 528 Hz (Spiritual serenity frequency)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(528, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Note 2: 660 Hz (Major 3rd harmony, 0.25s later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(660, now + 0.25);
      gain2.gain.setValueAtTime(0, now + 0.25);
      gain2.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.8);
    } catch (e) {
      console.warn("[AzanAudioService] Chime synthesis notice:", e);
    }
  }

  /**
   * Plays the full authentic Azan
   */
  async playAzan(voiceId = null, prayerKey = null) {
    this.initAudioElement();
    const voiceToPlay = voiceId || this.activeVoiceId;
    const voiceObj = AZAN_VOICES.find((v) => v.id === voiceToPlay) || AZAN_VOICES[0];

    try {
      if (this.audioElement.src !== window.location.origin + voiceObj.src && !this.audioElement.src.endsWith(voiceObj.src)) {
        this.audioElement.src = voiceObj.src;
        this.audioElement.load();
      }

      this.audioElement.volume = this.volume;
      this.audioElement.currentTime = 0;

      await this.audioElement.play();

      this.updateState({
        isPlaying: true,
        isPaused: false,
        currentVoice: voiceObj,
        prayerKey,
        error: null,
      });

      return true;
    } catch (err) {
      console.warn("[AzanAudioService] Autoplay policy prevented playback:", err);
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentVoice: voiceObj,
        prayerKey,
        error: "autoplay_blocked",
      });
      return false;
    }
  }

  pause() {
    if (this.audioElement && this.state.isPlaying) {
      this.audioElement.pause();
      this.updateState({ isPlaying: false, isPaused: true });
    }
  }

  resume() {
    if (this.audioElement && this.state.isPaused) {
      this.audioElement.play().then(() => {
        this.updateState({ isPlaying: true, isPaused: false });
      });
    }
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      currentVoice: null,
      prayerKey: null,
    });
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.savePreferences();
    this.notify();
  }

  setActiveVoice(voiceId) {
    if (AZAN_VOICES.some((v) => v.id === voiceId)) {
      this.activeVoiceId = voiceId;
      this.savePreferences();
      this.notify();
    }
  }

  getActiveVoice() {
    return AZAN_VOICES.find((v) => v.id === this.activeVoiceId) || AZAN_VOICES[0];
  }

  getState() {
    return { ...this.state };
  }

  getVolume() {
    return this.volume;
  }

  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export const azanAudioService = new AzanAudioService();
