import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  BellRing,
  BellOff,
  Music,
  MapPin,
  Compass,
  Check,
  Sparkles,
  Info,
  Radio,
  Sliders,
  Clock,
  RefreshCw,
  User,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { getUserMiddleName, getUserHeaderGreeting } from "@/lib/userStorage";
import {
  AZAN_VOICES,
  azanAudioService,
} from "@/lib/azanAudioService";
import {
  azanScheduler,
  NOTIFICATION_MODES,
  ADVANCE_REMINDER_OPTIONS,
} from "@/lib/azanScheduler";
import {
  CITY_PRESETS,
  CALCULATION_METHODS,
  MADHHABS,
  getSavedLocation,
  saveLocation,
  requestDeviceLocation,
  getCalculationPreferences,
  saveCalculationPreferences,
  calculateQiblaBearing,
} from "@/lib/locationService";
import { PRAYER_NAMES, PRAYERS } from "@/lib/prayerUtils";

function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return { user: null, isAuthenticated: false, logout: () => {} };
  }
}

export default function AzanSettingsModal({
  isOpen,
  onClose,
  onLocationOrPrefsChanged,
  initialTab = "location",
}) {
  const navigate = useNavigate();
  const auth = useAuthSafe();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const logout = auth?.logout || (() => {});

  // Active Tab: "location" | "notifications" | "audio" | "account"
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Location & Calculation State
  const [location, setLocation] = useState(getSavedLocation());
  const [calcPrefs, setCalcPrefs] = useState(getCalculationPreferences());
  const [isLocating, setIsLocating] = useState(false);

  // Audio State
  const [audioState, setAudioState] = useState(() => {
    return (
      (typeof azanAudioService?.getState === "function"
        ? azanAudioService.getState()
        : azanAudioService?.state) || { isPlaying: false, isPaused: false }
    );
  });
  const [activeVoiceId, setActiveVoiceId] = useState(() => {
    return azanAudioService?.getActiveVoice?.()?.id || "makkah";
  });
  const [volume, setVolume] = useState(() => {
    return typeof azanAudioService?.getVolume === "function"
      ? azanAudioService.getVolume()
      : 0.85;
  });

  // Scheduler & Permissions State
  const [schedSettings, setSchedSettings] = useState(() => azanScheduler?.getSettings?.() || {});
  const [permissionState, setPermissionState] = useState(() => azanScheduler?.getPermissionState?.() || "default");

  // Subscribe to audio changes
  useEffect(() => {
    const unsubAudio = typeof azanAudioService?.subscribe === "function"
      ? azanAudioService.subscribe((state) => {
          if (state) setAudioState(state);
        })
      : () => {};

    const unsubSched = typeof azanScheduler?.subscribe === "function"
      ? azanScheduler.subscribe((data) => {
          if (data) {
            setSchedSettings(data.settings);
            setPermissionState(data.permission);
          }
        })
      : () => {};

    return () => {
      unsubAudio();
      unsubSched();
    };
  }, []);

  const handleVoiceChange = (voiceId) => {
    setActiveVoiceId(voiceId);
    azanAudioService.setActiveVoice(voiceId);
    toast.success("Azan reciter updated");
  };

  const handlePreviewVoice = async (voiceId) => {
    if (audioState.isPlaying && audioState.currentVoice?.id === voiceId) {
      azanAudioService.stop();
    } else {
      await azanAudioService.playAzan(voiceId);
    }
  };

  const handleTestChime = () => {
    azanAudioService.playGentleChime();
    toast.info("Playing gentle Islamic chime");
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    azanAudioService.setVolume(newVol);
  };

  const handleRequestPermission = async () => {
    const res = await azanScheduler.requestPermission();
    if (res === "granted") {
      toast.success("Notification permissions enabled!", {
        description: "You will receive timely prayer reminders and Azan notifications.",
      });
    } else if (res === "denied") {
      toast.error("Notification permission denied", {
        description: "Please enable notifications in your browser settings to receive alerts.",
      });
    }
  };

  const handlePrayerModeChange = (prayerKey, mode) => {
    azanScheduler.setPrayerAtTimeMode(prayerKey, mode);
    toast.success(`${PRAYER_NAMES[prayerKey]} prayer-time alert set to ${mode.toUpperCase()}`);
  };

  const handleAdvanceChange = (prayerKey, minutes) => {
    azanScheduler.setPrayerAdvanceReminder(prayerKey, minutes);
    toast.success(
      minutes > 0
        ? `${PRAYER_NAMES[prayerKey]} reminder set to ${minutes} min before`
        : `${PRAYER_NAMES[prayerKey]} advance reminder turned off`
    );
  };

  const handleSetAllAdvance = (minutes) => {
    for (const key of PRAYERS) {
      azanScheduler.setPrayerAdvanceReminder(key, minutes);
    }
    toast.success(
      minutes > 0
        ? `All prayers set to remind ${minutes} min before`
        : "All advance reminders turned off"
    );
  };

  const handleTestNotification = async () => {
    if (permissionState !== "granted") {
      const res = await handleRequestPermission();
      if (res !== "granted") return;
    }
    azanScheduler.dispatchWebNotification(
      "Tawfiq Prayer Alert",
      "This is a test notification. Reminders will arrive reliably as scheduled.",
      "tawfiq_test"
    );
    toast.success("Test notification sent! Check your system notification banner.");
  };

  const handleSelectCityPreset = (preset) => {
    const updated = {
      city: preset.city,
      country: preset.country,
      latitude: preset.latitude,
      longitude: preset.longitude,
      isAuto: false,
      method: preset.method || calcPrefs.methodId,
    };
    saveLocation(updated);
    setLocation(updated);
    if (onLocationOrPrefsChanged) onLocationOrPrefsChanged(updated, calcPrefs);
    toast.success(`Location updated to ${preset.city}, ${preset.country}`);
  };

  const handleAutoDetectGPS = async () => {
    setIsLocating(true);
    try {
      const autoLoc = await requestDeviceLocation();
      setLocation(autoLoc);
      if (onLocationOrPrefsChanged) onLocationOrPrefsChanged(autoLoc, calcPrefs);
      toast.success(`Auto-detected: ${autoLoc.city}, ${autoLoc.country}`);
    } catch (err) {
      toast.error(err.message || "Failed to detect location");
    } finally {
      setIsLocating(false);
    }
  };

  const handleMethodChange = (methodId) => {
    const updated = { ...calcPrefs, methodId };
    saveCalculationPreferences(updated);
    setCalcPrefs(updated);
    if (onLocationOrPrefsChanged) onLocationOrPrefsChanged(location, updated);
    toast.success("Calculation method updated");
  };

  const handleMadhhabChange = (madhabId) => {
    const updated = { ...calcPrefs, madhabId };
    saveCalculationPreferences(updated);
    setCalcPrefs(updated);
    if (onLocationOrPrefsChanged) onLocationOrPrefsChanged(location, updated);
    toast.success("Madhhab updated");
  };

  const qiblaBearing = calculateQiblaBearing(location.latitude, location.longitude);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] rounded-t-[28px] sm:rounded-[28px] border border-[#E7E2D9] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="azan-settings-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ECE7DD] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EAF2ED] text-[#134D37] flex items-center justify-center border border-[#CFDFD5]">
              <SettingsIcon size={18} />
            </div>
            <div>
              <h2 id="azan-settings-title" className="text-[17px] font-semibold text-stone-900 leading-tight">
                Settings & Preferences
              </h2>
              <p className="text-[12px] text-stone-500">
                Location, Azan audio, notifications & account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ECE7DD] bg-[#F4F1EA] px-3 pt-2 gap-1 text-[13px] font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("location")}
            className={`flex-1 py-2 px-3 rounded-t-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "location"
                ? "bg-[#FAF8F5] text-[#134D37] border-t border-x border-[#ECE7DD] font-semibold"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#EAE6DD]"
            }`}
          >
            <MapPin size={14} />
            <span>Location</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`flex-1 py-2 px-3 rounded-t-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "audio"
                ? "bg-[#FAF8F5] text-[#134D37] border-t border-x border-[#ECE7DD] font-semibold"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#EAE6DD]"
            }`}
          >
            <Music size={14} />
            <span>Azan Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2 px-3 rounded-t-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "notifications"
                ? "bg-[#FAF8F5] text-[#134D37] border-t border-x border-[#ECE7DD] font-semibold"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#EAE6DD]"
            }`}
          >
            <Bell size={14} />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex-1 py-2 px-3 rounded-t-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "account"
                ? "bg-[#FAF8F5] text-[#134D37] border-t border-x border-[#ECE7DD] font-semibold"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#EAE6DD]"
            }`}
          >
            <User size={14} />
            <span>Account</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-800">
          {/* TAB 1: AZAN AUDIO */}
          {activeTab === "audio" && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider block mb-2">
                  Select Muadhin (Reciter)
                </label>
                <div className="space-y-2">
                  {AZAN_VOICES.map((v) => {
                    const isSelected = activeVoiceId === v.id;
                    const isPreviewing =
                      audioState.isPlaying && audioState.currentVoice?.id === v.id;

                    return (
                      <div
                        key={v.id}
                        onClick={() => handleVoiceChange(v.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#EEF5F1] border-[#2A6A4E] shadow-sm"
                            : "bg-white border-[#E8E2D7] hover:border-stone-400"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[14.5px] text-stone-900">
                              {v.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] uppercase font-bold bg-[#134D37] text-white px-1.5 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[12.5px] text-stone-600 font-medium">
                            {v.reciter}
                          </p>
                          <p className="text-[11.5px] text-stone-400 truncate mt-0.5">
                            {v.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVoice(v.id);
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-transform active:scale-90 ${
                            isPreviewing
                              ? "bg-[#134D37] text-white border-[#134D37]"
                              : "bg-white text-[#134D37] border-[#CFDFD5] hover:bg-[#EEF5F1]"
                          }`}
                          aria-label={isPreviewing ? "Stop audio preview" : "Listen to audio preview"}
                        >
                          {isPreviewing ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider & Offline Chime Test */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D7] space-y-3">
                <div className="flex items-center justify-between text-[13px] font-medium text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={16} className="text-[#134D37]" />
                    Azan Audio Volume
                  </span>
                  <span className="tabular-nums font-semibold text-[#134D37]">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-[#134D37] cursor-pointer h-2 bg-stone-200 rounded-lg"
                />

                <div className="pt-2 border-t border-[#F0ECE4] flex items-center justify-between">
                  <div>
                    <span className="text-[12.5px] font-medium text-stone-800 block">
                      Gentle Sunnah Chime
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Offline melodic tone (zero network needed)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestChime}
                    className="text-[12px] font-medium text-[#134D37] bg-[#EEF5F1] hover:bg-[#DDEEE3] px-3 py-1.5 rounded-lg border border-[#BED7C9] transition-colors"
                  >
                    Test Chime
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {/* Permission Banner */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D7] flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    permissionState === "granted"
                      ? "bg-emerald-100 text-emerald-700"
                      : permissionState === "denied"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <Bell size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13.5px] font-semibold text-stone-900">
                      System Notifications
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        permissionState === "granted"
                          ? "bg-emerald-100 text-emerald-800"
                          : permissionState === "denied"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {permissionState}
                    </span>
                  </div>
                  <p className="text-[12px] text-stone-600 mt-0.5">
                    {permissionState === "granted"
                      ? "Tawfiq will send timely reminders before and at prayer times."
                      : permissionState === "denied"
                      ? "Notifications are blocked. Please enable them in your browser or system settings."
                      : "Allow notifications to receive prayer reminders and Azan alerts."}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {permissionState !== "granted" && permissionState !== "denied" && (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="text-[12px] font-semibold text-white bg-[#134D37] hover:bg-[#0E3B2A] px-3.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Enable Notifications
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="text-[11.5px] font-medium text-[#134D37] bg-[#EEF5F1] hover:bg-[#DDEEE3] px-3 py-1.5 rounded-lg border border-[#BED7C9] transition-colors cursor-pointer"
                    >
                      Send Test Alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Advance Reminders Bulk Presets */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D7]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[12px] font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-[#134D37]" />
                    Quick Advance Reminder Presets
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllAdvance(0)}
                    className="py-1.5 px-2 rounded-lg text-[11.5px] font-medium border border-[#E0D9CD] bg-white hover:bg-[#F3EFE7] text-stone-700 transition-colors cursor-pointer text-center"
                  >
                    All Reminders Off
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllAdvance(5)}
                    className="py-1.5 px-2 rounded-lg text-[11.5px] font-medium border border-[#BED7C9] bg-[#EEF5F1] hover:bg-[#DCEEE4] text-[#134D37] transition-colors cursor-pointer text-center"
                  >
                    All 5 Min Before
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllAdvance(10)}
                    className="py-1.5 px-2 rounded-lg text-[11.5px] font-medium border border-[#EBD7B9] bg-[#FEF6E9] hover:bg-[#FCECD0] text-[#9E651D] transition-colors cursor-pointer text-center"
                  >
                    All 10 Min Before
                  </button>
                </div>
              </div>

              {/* Per-Prayer Notification Preferences */}
              <div>
                <label className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider block mb-2">
                  Individual Prayer Notification Rules
                </label>
                <div className="space-y-2.5">
                  {PRAYERS.map((key) => {
                    const cfg = azanScheduler.getPrayerConfig(key);
                    const currentMode = cfg.atPrayerMode;
                    const advanceMin = cfg.advanceMinutes;

                    return (
                      <div
                        key={key}
                        className="bg-white p-3.5 rounded-xl border border-[#E8E2D7] shadow-xs space-y-2.5"
                      >
                        {/* Header: Prayer name and summary */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[14.5px] text-stone-900">
                            {PRAYER_NAMES[key]}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500">
                            {advanceMin > 0 ? `${advanceMin}m reminder` : "No pre-alert"}
                            {" • "}
                            {currentMode === NOTIFICATION_MODES.AZAN
                              ? "Full Azan"
                              : currentMode === NOTIFICATION_MODES.CHIME
                              ? "Chime"
                              : currentMode === NOTIFICATION_MODES.SILENT
                              ? "Silent"
                              : "Off"}
                          </span>
                        </div>

                        {/* Control 1: At-Prayer Time Notification */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#F2EDE3]">
                          <span className="text-[12px] font-medium text-stone-700">
                            At Prayer Time:
                          </span>
                          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#EBE6DC] self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handlePrayerModeChange(key, NOTIFICATION_MODES.AZAN)}
                              title="Full Azan Audio"
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                currentMode === NOTIFICATION_MODES.AZAN
                                  ? "bg-[#134D37] text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Azan
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrayerModeChange(key, NOTIFICATION_MODES.CHIME)}
                              title="Gentle Chime"
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                currentMode === NOTIFICATION_MODES.CHIME
                                  ? "bg-[#C4883B] text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Chime
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrayerModeChange(key, NOTIFICATION_MODES.SILENT)}
                              title="Silent Notification Banner"
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                currentMode === NOTIFICATION_MODES.SILENT
                                  ? "bg-stone-700 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Silent
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrayerModeChange(key, NOTIFICATION_MODES.OFF)}
                              title="At-prayer alerts disabled"
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                currentMode === NOTIFICATION_MODES.OFF
                                  ? "bg-rose-700 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Off
                            </button>
                          </div>
                        </div>

                        {/* Control 2: Pre-Prayer Advance Reminder */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#F2EDE3]">
                          <span className="text-[12px] font-medium text-stone-700">
                            Pre-Prayer Reminder:
                          </span>
                          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#EBE6DC] self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleAdvanceChange(key, 0)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                advanceMin === 0
                                  ? "bg-stone-600 text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              Off
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdvanceChange(key, 5)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                advanceMin === 5
                                  ? "bg-[#134D37] text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              5 min before
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdvanceChange(key, 10)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                advanceMin === 10
                                  ? "bg-[#C4883B] text-white shadow-xs"
                                  : "text-stone-600 hover:text-stone-900"
                              }`}
                            >
                              10 min before
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & CALCULATION */}
          {activeTab === "location" && (
            <div className="space-y-4">
              {/* Current Location Badge */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D7] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-[14.5px]">
                    <MapPin size={17} className="text-[#134D37]" />
                    <span>{location.city}, {location.country}</span>
                  </div>
                  <span className="text-[11px] font-medium bg-[#EEF5F1] text-[#134D37] px-2 py-0.5 rounded-full border border-[#CFDFD5]">
                    {location.isAuto ? "GPS Auto" : "Manual City"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-stone-500">
                  <span>Lat: {location.latitude.toFixed(4)}°, Lng: {location.longitude.toFixed(4)}°</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigate("/qibla");
                    }}
                    className="inline-flex items-center gap-1 text-[#134D37] hover:text-[#0E3B2A] font-semibold text-[11.5px] bg-[#EEF5F1] hover:bg-[#DDEEE3] px-2 py-0.5 rounded-md border border-[#BED7C9] cursor-pointer transition-colors"
                    title="Open Qibla Compass & Live AR Finder"
                  >
                    <Compass size={12} />
                    <span>Qibla: {qiblaBearing}°</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleAutoDetectGPS}
                  className="w-full mt-2 py-2 rounded-xl text-[12.5px] font-semibold text-[#134D37] bg-[#EEF5F1] hover:bg-[#DDEEE3] border border-[#BED7C9] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isLocating ? "animate-spin" : ""} />
                  {isLocating ? "Detecting GPS Position..." : "Detect My Location with GPS"}
                </button>
              </div>

              {/* City Presets Dropdown */}
              <div>
                <label className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider block mb-1.5">
                  Or Choose Major City
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {CITY_PRESETS.map((preset) => {
                    const isSelected =
                      location.city === preset.city && location.country === preset.country;
                    return (
                      <button
                        key={`${preset.city}-${preset.country}`}
                        type="button"
                        onClick={() => handleSelectCityPreset(preset)}
                        className={`p-2 rounded-lg text-left border text-[12px] transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#134D37] text-white border-[#134D37] font-medium"
                            : "bg-white text-stone-700 border-[#E8E2D7] hover:border-stone-400"
                        }`}
                      >
                        <div className="truncate">
                          <span className="block font-medium truncate">{preset.city}</span>
                          <span className={`block text-[10px] truncate ${isSelected ? "text-emerald-100" : "text-stone-400"}`}>
                            {preset.country}
                          </span>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Method Selection */}
              <div>
                <label className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider block mb-1.5">
                  Calculation Method
                </label>
                <select
                  value={calcPrefs.methodId}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E8E2D7] rounded-xl text-[13px] text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#134D37]/30"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Madhhab Selection (Asr Shadow) */}
              <div>
                <label className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider block mb-1.5">
                  Asr Juristic Method (Madhhab)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MADHHABS.map((madh) => {
                    const isSelected = calcPrefs.madhabId === madh.id;
                    return (
                      <button
                        key={madh.id}
                        type="button"
                        onClick={() => handleMadhhabChange(madh.id)}
                        className={`p-2.5 rounded-xl text-left border text-[12px] transition-all ${
                          isSelected
                            ? "bg-[#EEF5F1] border-[#2A6A4E] text-[#134D37] font-semibold"
                            : "bg-white border-[#E8E2D7] text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <span className="block font-medium">{madh.name}</span>
                        <span className="block text-[10.5px] text-stone-500 mt-0.5">
                          {madh.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT & PROFILE */}
          {activeTab === "account" && (
            <div className="space-y-4">
              {isAuthenticated && user ? (
                <>
                  {/* User Profile Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-xs flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-full bg-[#134D37] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white overflow-hidden shrink-0">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || "User profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {(getUserMiddleName(user) || user.name || user.email || "T")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] font-bold text-stone-900 truncate">
                          {user.name || "Tawfiq Believer"}
                        </h4>
                        <span className="text-[10.5px] font-semibold bg-[#EAF2ED] text-[#134D37] px-2 py-0.5 rounded-full border border-[#CFDFD5]">
                          Active
                        </span>
                      </div>
                      <p className="text-[12px] text-stone-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      {getUserMiddleName(user) && (
                        <p className="text-[11.5px] text-[#134D37] font-medium mt-1 inline-flex items-center gap-1 bg-[#F4F8F5] px-2 py-0.5 rounded-md">
                          <span>Middle Name:</span>
                          <span className="font-semibold">{getUserMiddleName(user)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Account Details & Sign Out */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-[12.5px] pb-2.5 border-b border-[#F4F0E8]">
                      <span className="text-stone-500">Authentication</span>
                      <span className="font-medium text-stone-800 capitalize">
                        {user.authProvider || "Email & Password"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12.5px] pb-2.5 border-b border-[#F4F0E8]">
                      <span className="text-stone-500">Security</span>
                      <span className="font-medium text-emerald-700 flex items-center gap-1">
                        <Shield size={13} />
                        <span>Protected</span>
                      </span>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onClose) onClose();
                          logout();
                          navigate("/login");
                        }}
                        className="w-full py-2.5 px-3.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <LogOut size={14} className="text-rose-600" />
                        <span>Sign out of Tawfiq</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Unauthenticated View */
                <div className="bg-white p-6 rounded-2xl border border-[#E8E2D7] text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-[#EAF2ED] text-[#134D37] mx-auto flex items-center justify-center">
                    <User size={22} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-stone-900">
                      Sign in to your Tawfiq Account
                    </h4>
                    <p className="text-[12px] text-stone-500 mt-1 max-w-xs mx-auto">
                      Synchronize prayer tracking, daily Dhikr progress, and Qaza ledger across your devices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigate("/login");
                    }}
                    className="w-full py-2.5 px-4 text-[13px] font-semibold text-white bg-[#134D37] hover:bg-[#0E3B2A] rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Sign In or Create Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ECE7DD] bg-white flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#134D37] hover:bg-[#0E3B2A] transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
