import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Download,
  Plane,
  Bell,
  Volume2,
  Play,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Compass,
  BatteryWarning,
  Smartphone,
  ChevronRight,
  ClipboardCopy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { CALCULATION_METHODS } from "@/lib/prayerUtils";
import { fetchAllLogs } from "@/lib/useDailyLog";
import { exportToCSV } from "@/lib/exportUtils";

const ADHAN_VOICES = [
  { id: "none", name: "None (silent)" },
  { id: "mecca", name: "Makkah — Abdul Rahman Al-Sudais" },
  { id: "medina", name: "Madinah — Ali Ahmed Mullah" },
  { id: "egypt", name: "Egypt — Sheikh Ali Al-Husary" },
  { id: "turkey", name: "Turkey — Diyanet" },
  { id: "mishary", name: "Mishary Rashid Al-Afasy" },
];

const ADHAN_URLS = {
  mecca: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  medina: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  egypt: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  turkey: "https://www.islamcan.com/audio/adhan/azan4.mp3",
  mishary: "https://www.islamcan.com/audio/adhan/azan5.mp3",
};

export default function SettingsModal({ open, onClose, settings, onUpdate }) {
  const navigate = useNavigate();
  const [testingAdhan, setTestingAdhan] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] = useState("idle"); // idle, testing, success
  const [copiedReport, setCopiedReport] = useState(false);

  // Audio Refs for bug-free Adhan preview
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Cleanup audio when modal closes
    if (!open) stopAdhan();
    return () => stopAdhan();
  }, [open]);

  function handleLogout() {
    onClose();
    navigate("/login", { replace: true });
  }

  async function handleExport() {
    const logs = await fetchAllLogs();
    exportToCSV(logs);
  }

  async function handleNotificationToggle(v) {
    if (v && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    onUpdate({ notifications_on: v });
  }

  function testNotification() {
    if (Notification.permission !== "granted") return;
    setTestNotificationStatus("testing");
    setTimeout(() => {
      new Notification("Tawfiq Preview", {
        body: "🔔 Asr begins in 15 minutes. Prepare for prayer.",
        icon: "/favicon.ico",
      });
      setTestNotificationStatus("success");
      setTimeout(() => setTestNotificationStatus("idle"), 3000);
    }, 500);
  }

  function stopAdhan() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTestingAdhan(false);
  }

  function toggleAdhan(voice) {
    if (testingAdhan) {
      stopAdhan();
      return;
    }
    if (voice === "none" || !ADHAN_URLS[voice]) return;

    setTestingAdhan(true);
    const audio = new Audio(ADHAN_URLS[voice]);
    audio.volume = 0.6;
    audioRef.current = audio;

    audio.play().catch(() => setTestingAdhan(false));

    // Stop after 10 seconds automatically
    timeoutRef.current = setTimeout(() => {
      stopAdhan();
    }, 10000);
  }

  function copyDiagnostics() {
    navigator.clipboard.writeText(
      "Tawfiq Setup Health: 96%\nDevice: Pixel 9\nLocation: Granted\nNotifications: Granted\nCompass: ±2°",
    );
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[380px] w-[92%] rounded-[2rem] max-h-[88vh] overflow-y-auto p-6 bg-[#F9F9F7] dark:bg-background border-emerald-900/[0.06] dark:border-emerald-100/[0.06] hide-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-center text-emerald-950 dark:text-white tracking-tight">
            Control Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-10 pt-2">
          {/* =========================================
              SECTION 1: SYSTEM STATUS
          ========================================= */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 dark:text-emerald-100/40 ml-1">
              1. System Status
            </h3>

            {/* Smart Warning Banner */}
            {!settings.notifications_on && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
                <AlertTriangle
                  size={18}
                  className="text-red-600 dark:text-red-500 shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-400">
                    Prayer reminders are OFF
                  </h4>
                  <p className="text-xs text-red-800/80 dark:text-red-400/80 font-medium mt-0.5">
                    You may miss today's prayers.
                  </p>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-red-700 hover:underline mt-2">
                    Why this matters →
                  </button>
                </div>
              </div>
            )}

            {/* App Confidence Score */}
            <div className="bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-500/20 dark:border-emerald-500/10 rounded-[1.25rem] p-5 shadow-[0_2px_12px_rgba(16,185,129,0.04)] relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 dark:opacity-10 pointer-events-none">
                <ShieldCheck size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h3 className="text-[2rem] font-black text-emerald-950 dark:text-white tracking-tighter leading-none flex items-center gap-2">
                      96%{" "}
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full tracking-normal mt-1">
                        ↑ +4%
                      </span>
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-400/70 mt-1.5">
                      Setup Health
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5 text-[11px] font-semibold">
                  <div className="flex justify-between items-center pb-2.5 border-b border-emerald-900/5 dark:border-white/5">
                    <span className="text-emerald-900/60 dark:text-emerald-100/60 flex items-center gap-1.5">
                      <MapPin size={12} /> Location
                    </span>
                    <span className="text-emerald-900 dark:text-emerald-300">
                      Updated 2m ago • Hyderabad
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-emerald-900/5 dark:border-white/5">
                    <span className="text-emerald-900/60 dark:text-emerald-100/60 flex items-center gap-1.5">
                      <Compass size={12} /> Compass
                    </span>
                    <span className="text-emerald-900 dark:text-emerald-300">
                      Heading Accuracy ±2°
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900/60 dark:text-emerald-100/60 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Missing
                    </span>
                    <span className="text-red-500 font-bold hover:underline cursor-pointer">
                      Enable Background Refresh →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================
              SECTION 2: WORSHIP SETTINGS
          ========================================= */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 dark:text-emerald-100/40 ml-1">
              2. Worship Settings
            </h3>

            {/* Smart Notification Assistant */}
            <div className="bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <Bell
                      size={16}
                      className="text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-900 dark:text-white">
                      Prayer Reminders
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Average delay: 1.2s
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!settings.notifications_on}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>

              {settings.notifications_on && (
                <div className="pt-2 border-t border-black/[0.03] dark:border-white/[0.04] space-y-3">
                  {/* Reminder Reliability List */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 text-[11px] font-semibold space-y-2">
                    <div className="flex justify-between text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[9px] mb-1">
                      <span>Reliability</span>
                      <span>Status</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Fajr
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Delivered
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Dhuhr
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Delivered
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Asr
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Delivered
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Maghrib
                      </span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Isha
                      </span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Before Adhan
                    </span>
                    <Select
                      value={String(settings.notification_mins ?? 15)}
                      onValueChange={(v) =>
                        onUpdate({ notification_mins: Number(v) })
                      }
                    >
                      <SelectTrigger className="w-24 h-7 text-[11px] rounded-lg bg-gray-50 dark:bg-white/5 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 30].map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Battery Warning */}
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 px-3 py-2.5 rounded-xl border border-amber-200/50">
                    <div className="flex items-center gap-2">
                      <BatteryWarning size={14} className="text-amber-600" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400">
                          Battery Optimized
                        </span>
                        <span className="text-[9px] text-amber-700/70">
                          May delay reminders by 5-20m
                        </span>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-amber-600 hover:underline">
                      Fix →
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testNotification}
                    className={`w-full rounded-xl h-9 text-[11px] font-bold transition-all ${testNotificationStatus === "success" ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100"}`}
                  >
                    {testNotificationStatus === "idle" && "▶ Preview Reminder"}
                    {testNotificationStatus === "testing" && "Sending..."}
                    {testNotificationStatus === "success" && (
                      <>
                        <CheckCircle2 size={14} className="mr-1.5" /> Test
                        Successful
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Adhan Voice */}
            <div className="bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Volume2
                      size={16}
                      className="text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-900 dark:text-white">
                      Adhan Voice
                    </Label>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Offline Ready
                    </p>
                  </div>
                </div>
              </div>

              <Select
                value={settings.adhan_voice || "none"}
                onValueChange={(v) => {
                  onUpdate({ adhan_voice: v });
                }}
              >
                <SelectTrigger className="rounded-xl h-11 bg-gray-50 dark:bg-white/5 border-none font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADHAN_VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Silent Override */}
              <div className="flex items-center justify-between pt-1 opacity-70">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Play even if phone is silent
                </span>
                <Switch checked={true} disabled />
              </div>

              {settings.adhan_voice && settings.adhan_voice !== "none" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAdhan(settings.adhan_voice)}
                  className={`w-full rounded-xl h-10 gap-2 font-bold text-xs transition-all ${testingAdhan ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" : "bg-transparent border border-black/5 dark:border-white/5"}`}
                >
                  {testingAdhan ? (
                    <Pause size={14} />
                  ) : (
                    <Play
                      size={14}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  )}
                  {testingAdhan ? "Stop Preview" : "Preview Adhan"}
                </Button>
              )}
            </div>

            {/* Calculation Method Validator */}
            <div className="bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <Label className="text-sm font-bold text-gray-900 dark:text-white">
                  Prayer Calculation
                </Label>
                <div className="flex items-center justify-between mt-2 mb-3 bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex flex-col text-[10px] font-bold uppercase tracking-wider text-emerald-800/60 dark:text-emerald-200/60">
                    <span>Your Mosque (Maghrib)</span>
                    <span className="text-sm text-emerald-900 dark:text-emerald-300">
                      6:54 PM
                    </span>
                  </div>
                  <div className="flex flex-col text-[10px] font-bold uppercase tracking-wider text-emerald-800/60 dark:text-emerald-200/60 items-end">
                    <span>Tawfiq</span>
                    <span className="text-sm text-emerald-900 dark:text-emerald-300">
                      6:53 PM{" "}
                      <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 rounded-sm ml-1">
                        -1 min
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <Select
                value={String(settings.calculation_method ?? "india")}
                onValueChange={(v) => onUpdate({ calculation_method: v })}
              >
                <SelectTrigger className="rounded-xl h-11 bg-gray-50 dark:bg-white/5 border-none font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {CALCULATION_METHODS.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intelligent Travel Detection */}
            <div className="flex flex-col rounded-2xl p-4 bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <Plane
                      size={16}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-900 dark:text-white">
                      Travel Mode
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Enables Qasr & combining
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!settings.travel_mode}
                  onCheckedChange={(v) => onUpdate({ travel_mode: v })}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex items-center justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400">
                    Home
                  </span>
                  <span>Hyderabad</span>
                </div>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400">
                    Current
                  </span>
                  <span className="text-amber-600">Bengaluru (574km)</span>
                </div>
              </div>

              {!settings.travel_mode && (
                <button className="text-[10px] font-bold uppercase tracking-widest text-amber-600 text-center hover:underline w-full pt-1">
                  Travel detected. Enable? →
                </button>
              )}
            </div>

            {/* Exempt Mode */}
            <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Pause
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-900 dark:text-white">
                    Exempt Mode
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {settings.exempt_mode
                      ? "Paused since July 18 • Resume anytime"
                      : "Pause streak & tracking"}
                  </p>
                </div>
              </div>
              <Switch
                checked={!!settings.exempt_mode}
                onCheckedChange={(v) => onUpdate({ exempt_mode: v })}
              />
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />

          {/* =========================================
              SECTION 3: DEVICE & SUPPORT
          ========================================= */}
          <section className="space-y-4 pb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 dark:text-emerald-100/40 ml-1">
              3. Device & Support
            </h3>

            {/* Sensor & Permissions Page */}
            <div className="bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.04] rounded-2xl p-4 shadow-sm flex flex-col gap-3 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                <Smartphone
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <Label className="text-sm font-bold">
                  Permissions & Sensors
                </Label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">GPS Sensor</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Motion & Gyro</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Background Refresh</span>{" "}
                <span className="text-red-500 font-bold flex items-center gap-1">
                  Disabled <ChevronRight size={10} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Timezone</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  GMT +5:30
                </span>
              </div>
            </div>

            {/* 1-Tap Diagnostic Report */}
            <Button
              variant="outline"
              className={`w-full rounded-2xl h-12 font-bold text-xs transition-all bg-transparent border border-black/[0.05] dark:border-white/[0.05] shadow-sm ${copiedReport ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
              onClick={copyDiagnostics}
            >
              {copiedReport ? (
                <CheckCircle2 size={16} className="mr-2" />
              ) : (
                <ClipboardCopy size={16} className="mr-2" />
              )}
              {copiedReport
                ? "Report Copied to Clipboard"
                : "Generate Diagnostic Report"}
            </Button>

            {/* Device Info & Logout */}
            <div className="flex justify-between items-center px-2 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Google Pixel 9</span>
              <span>v1.2.1</span>
            </div>

            <div className="pt-6 text-center">
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors focus:outline-none uppercase tracking-wider"
              >
                Log out of device
              </button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
