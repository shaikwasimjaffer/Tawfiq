import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass as CompassIcon,
  Camera,
  ArrowLeft,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Loader2,
  RotateCw,
  RotateCcw,
} from "lucide-react";
import { getSavedLocation } from "@/lib/locationService";
import {
  calculateQiblaBearing,
  calculateDistanceToKaabaKm,
  getQiblaAlignmentInfo,
  getCardinalDirection,
} from "@/lib/qiblaService";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import QiblaAR3DView from "@/components/qibla/QiblaAR3DView";
import QiblaDegreeRuler from "@/components/qibla/QiblaDegreeRuler";
import { toast } from "sonner";

export default function QiblaApp() {
  const navigate = useNavigate();

  // Mode: "2d" | "ar"
  const [mode, setMode] = useState("2d");

  // Location state
  const [location] = useState(() => getSavedLocation());

  // Calculations
  const qiblaBearing = calculateQiblaBearing(location.latitude, location.longitude);
  const distanceKm = calculateDistanceToKaabaKm(location.latitude, location.longitude);
  const cardinal = getCardinalDirection(qiblaBearing);

  // Sensor Heading & Orientation Hook
  const {
    heading,
    pitch,
    roll,
    isFlat,
    accuracy,
    sensorAvailable,
    permissionState,
    requestPermission,
    simulatedHeading,
    setSimulatedHeading,
    setSimulatedPitch,
    setSimulatedRoll,
  } = useCompassHeading();

  // Alignment info with strictly positive rotation magnitudes
  const alignment = getQiblaAlignmentInfo(qiblaBearing, heading, 4);

  // Haptic feedback trigger when alignment state flips to true
  const wasAlignedRef = useRef(false);
  useEffect(() => {
    if (alignment.isAligned && !wasAlignedRef.current) {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate([60, 40, 60]);
        } catch {}
      }
    }
    wasAlignedRef.current = alignment.isAligned;
  }, [alignment.isAligned]);

  // Camera stream state machine: "idle" | "initializing" | "ready" | "error"
  const [cameraState, setCameraState] = useState("idle");
  const [cameraError, setCameraError] = useState(null);
  const cameraStateRef = useRef("idle");
  cameraStateRef.current = cameraState;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sessionCounterRef = useRef(0);
  const timeoutTimerRef = useRef(null);

  // Stop camera helper - cleans up all tracks and resets state
  const stopCamera = useCallback(() => {
    sessionCounterRef.current += 1;
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("idle");
    setCameraError(null);
  }, []);

  // Start camera helper - reliable initialization flow with 7.5s safety timeout
  const startCamera = useCallback(async () => {
    const currentSession = ++sessionCounterRef.current;
    setCameraState("initializing");
    setCameraError(null);

    // Safety timeout: Never leave user stuck on loader indefinitely
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => {
      if (sessionCounterRef.current === currentSession && cameraStateRef.current === "initializing") {
        setCameraState("error");
        setCameraError(
          "Camera connection timed out. Please verify camera permissions or return to 2D compass."
        );
      }
    }, 7500);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser context (HTTPS required).");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // Discard if user already left AR mode
      if (sessionCounterRef.current !== currentSession) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("[QiblaApp] Video play error (may require user gesture):", playErr);
        }
      }

      if (sessionCounterRef.current === currentSession) {
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
        setCameraState("ready");
      }
    } catch (err) {
      if (sessionCounterRef.current !== currentSession) return;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

      console.warn("[QiblaApp] Camera initialization error:", err);
      let msg = "Could not access live camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please allow camera access in your browser settings to use live AR.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No suitable rear camera was found on this device.";
      } else if (err.message) {
        msg = err.message;
      }
      setCameraState("error");
      setCameraError(msg);
      toast.error(msg);
    }
  }, []);

  // Manage AR mode camera lifecycle
  useEffect(() => {
    if (mode === "ar") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  // Handle switching to AR mode
  const handleOpenAR = async () => {
    if (isIOS && permissionState === "prompt") {
      await requestPermission();
    }
    setMode("ar");
  };

  // Difference in degrees for dial rotation
  // Compass rose rotates counter-clockwise by device heading
  const dialRotation = -heading;

  // Kaaba pointer angle on the rose
  const kaabaAngleOnRose = qiblaBearing;

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-stone-900 pb-24 font-sans select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E7E2D9] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-[#E7E2D9] flex items-center justify-center text-stone-700 hover:text-stone-900 shadow-2xs active:scale-95 transition-all cursor-pointer"
            aria-label="Back to previous screen"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="text-center min-w-0 flex-1">
            <h1 className="text-[17px] font-bold text-[#134D37] tracking-tight truncate">
              Qibla Direction
            </h1>
            <div className="flex items-center justify-center gap-1 text-[11.5px] text-stone-500 mt-0.5">
              <MapPin size={11} className="text-[#134D37] shrink-0" />
              <span className="truncate max-w-[170px]">
                {location.city}, {location.country}
              </span>
              <span>•</span>
              <span className="tabular-nums font-medium">{distanceKm.toLocaleString()} km</span>
            </div>
          </div>

          {/* Mode Switch Button (2D vs AR) */}
          {mode === "2d" ? (
            <button
              type="button"
              onClick={handleOpenAR}
              className="h-9 px-3 rounded-full bg-[#134D37] text-white hover:bg-[#0E3B2A] text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Launch Live Camera AR Finder"
            >
              <Camera size={14} />
              <span>AR View</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("2d")}
              className="h-9 px-3 rounded-full bg-white border border-[#E7E2D9] text-[#134D37] hover:bg-stone-50 text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Return to 2D Compass"
            >
              <CompassIcon size={14} />
              <span>2D Mode</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {mode === "2d" ? (
          /* ============================================================
             MODE 1: 2D PRECISION COMPASS EXPERIENCE
             ============================================================ */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Status & Alignment Hero Card */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 text-center relative overflow-hidden ${
                alignment.isAligned
                  ? "bg-gradient-to-b from-[#EEF5F1] to-[#E3EFE8] border-[#86D2AD] shadow-[0_4px_20px_-4px_rgba(19,77,55,0.18)]"
                  : "bg-white border-[#E7E2D9] shadow-xs"
              }`}
            >
              {alignment.isAligned && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none"
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    alignment.isAligned
                      ? "bg-[#134D37] text-[#E8F5EE]"
                      : "bg-[#F3EFE7] text-stone-700"
                  }`}
                >
                  {alignment.isAligned ? (
                    <>
                      <CheckCircle2 size={12} className="text-[#86D2AD]" />
                      Aligned with Kaaba
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} className="text-[#9E651D]" />
                      Alignment Guide
                    </>
                  )}
                </span>

                <h2 className="text-[26px] sm:text-[28px] font-bold text-stone-900 mt-1.5 tracking-tight leading-none">
                  {alignment.text}
                </h2>
                <p className="text-[12.5px] text-stone-600 mt-1">{alignment.subtext}</p>

                {/* Horizontal Surface Indicator */}
                {isFlat && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#D5DFD8] text-[11px] font-medium text-[#134D37]">
                    <span>📱 Flat Surface Mode (Horizontal)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Precision Compass Rose Dial */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E7E2D9] shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              {/* Outer Alignment Glow Ring */}
              <div
                className={`w-[290px] h-[290px] sm:w-[320px] sm:h-[320px] rounded-full relative flex items-center justify-center transition-all duration-300 ${
                  alignment.isAligned
                    ? "ring-8 ring-emerald-500/20 shadow-[0_0_50px_rgba(19,77,55,0.25)]"
                    : "ring-1 ring-stone-200"
                }`}
              >
                {/* Fixed Top Indicator (Top of Phone / Current Heading Pointer) */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1 z-20 flex flex-col items-center">
                  <div
                    className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] ${
                      alignment.isAligned ? "border-t-[#134D37]" : "border-t-rose-600"
                    }`}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-0.5">
                    HEADING
                  </span>
                </div>

                {/* Rotating Compass Rose Dial */}
                <div
                  className="w-full h-full rounded-full relative flex items-center justify-center transition-transform ease-out will-change-transform"
                  style={{
                    transform: `rotate(${dialRotation}deg)`,
                    transitionDuration: simulatedHeading !== null ? "100ms" : "150ms",
                  }}
                >
                  {/* Compass Background Face */}
                  <div className="absolute inset-2 rounded-full bg-[#FAF8F5] border border-[#EAE4D8] shadow-inner" />

                  {/* Degree Graduation Markings (every 30 degrees) */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-full h-full pointer-events-none flex justify-center"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div className="w-[1.5px] h-3 bg-stone-300 mt-3" />
                    </div>
                  ))}

                  {/* Cardinal Directions (N, E, S, W) */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 font-bold text-[15px] text-[#134D37]">
                    N
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-[13px] text-stone-500">
                    E
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-bold text-[13px] text-stone-500">
                    S
                  </div>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-[13px] text-stone-500">
                    W
                  </div>

                  {/* KAABA DIRECTION BEACON / NEEDLE */}
                  <div
                    className="absolute w-full h-full pointer-events-none flex justify-center items-start"
                    style={{
                      transform: `rotate(${kaabaAngleOnRose}deg)`,
                    }}
                  >
                    {/* Golden / Emerald Kaaba Pointer Needle */}
                    <div className="flex flex-col items-center mt-3 z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                          alignment.isAligned
                            ? "bg-[#134D37] text-white scale-110 ring-4 ring-emerald-300"
                            : "bg-[#C4883B] text-white shadow-[#C4883B]/40"
                        }`}
                      >
                        <span className="text-[13px]">🕋</span>
                      </div>
                      <div
                        className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] mt-0.5 ${
                          alignment.isAligned ? "border-b-[#134D37]" : "border-b-[#C4883B]"
                        }`}
                      />
                      <span
                        className={`text-[9.5px] font-extrabold uppercase tracking-tight px-1.5 py-0.5 rounded-full mt-0.5 shadow-xs ${
                          alignment.isAligned
                            ? "bg-[#134D37] text-white"
                            : "bg-[#C4883B] text-white"
                        }`}
                      >
                        Qibla
                      </span>
                    </div>
                  </div>

                  {/* Inner Concentric Circle with Crosshairs */}
                  <div className="w-28 h-28 rounded-full border border-dashed border-stone-300/80 flex items-center justify-center" />
                </div>

                {/* Center Hub: Real-time Bearing & Heading Readout */}
                <div className="absolute z-10 w-24 h-24 rounded-full bg-white border border-[#E0D8CA] shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center p-1 text-center pointer-events-none">
                  <span className="text-[19px] sm:text-[20px] font-extrabold text-[#134D37] leading-none tabular-nums tracking-tight">
                    {qiblaBearing}°
                  </span>
                  <span className="text-[10px] font-bold text-[#967840] uppercase tracking-wider mt-0.5">
                    {cardinal}
                  </span>
                  <div className="w-8 h-[1px] bg-stone-200 my-1" />
                  <span className="text-[9.5px] text-stone-500 font-medium tabular-nums leading-none">
                    Dev {Math.round(heading)}°
                  </span>
                </div>
              </div>

              {/* Angle Difference & Status Summary */}
              <div className="mt-5 w-full grid grid-cols-3 divide-x divide-stone-200 text-center pt-2 border-t border-stone-100">
                <div className="px-2">
                  <span className="block text-[10.5px] uppercase tracking-wider font-semibold text-stone-400">
                    Qibla
                  </span>
                  <span className="text-[15px] font-bold text-stone-800 tabular-nums">
                    {qiblaBearing}° {cardinal}
                  </span>
                </div>
                <div className="px-2">
                  <span className="block text-[10.5px] uppercase tracking-wider font-semibold text-stone-400">
                    Heading
                  </span>
                  <span className="text-[15px] font-bold text-stone-800 tabular-nums">
                    {Math.round(heading)}°
                  </span>
                </div>
                <div className="px-2">
                  <span className="block text-[10.5px] uppercase tracking-wider font-semibold text-stone-400">
                    Distance
                  </span>
                  <span className="text-[15px] font-bold text-stone-800 tabular-nums">
                    {distanceKm.toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>

            {/* iOS Sensor Permission Recovery Card */}
            {isIOS && permissionState === "prompt" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-700 shrink-0" />
                  <p className="text-[12px] text-amber-900 font-medium">
                    Motion sensors require permission on iOS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestPermission}
                  className="px-3 py-1.5 rounded-lg bg-[#134D37] text-white text-[11.5px] font-semibold shrink-0 cursor-pointer"
                >
                  Enable Sensor
                </button>
              </div>
            )}

            {/* Sensor Status & Desktop Testing Simulation */}
            <div className="bg-white p-4 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      sensorAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span className="text-[12.5px] font-semibold text-stone-800">
                    {sensorAvailable
                      ? "Hardware Compass Active"
                      : "Simulation / Manual Compass Mode"}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  {accuracy ? `±${accuracy}° precision` : "Calculated Geodesic"}
                </span>
              </div>

              {/* Desktop Slider / Fallback */}
              {!sensorAvailable && (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
                  <div className="flex items-center justify-between text-[11.5px] text-stone-600">
                    <span className="font-medium flex items-center gap-1.5">
                      <Sliders size={12} className="text-[#134D37]" />
                      Simulate Phone Heading (360°):
                    </span>
                    <span className="font-bold text-[#134D37] tabular-nums">
                      {Math.round(heading)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={Math.round(heading)}
                    onChange={(e) => setSimulatedHeading(Number(e.target.value))}
                    className="w-full accent-[#134D37] cursor-pointer"
                    aria-label="Simulate device compass heading"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 uppercase font-semibold">
                    <span>0° N</span>
                    <span>90° E</span>
                    <span>180° S</span>
                    <span>270° W</span>
                    <span>359° N</span>
                  </div>
                </div>
              )}

              {/* Calibration Advice */}
              <div className="flex items-start gap-2 text-[11.5px] text-stone-500 leading-relaxed pt-1">
                <Info size={14} className="text-stone-400 shrink-0 mt-0.5" />
                <p>
                  To calibrate: Move your device in a slow figure-8 motion away from metal cases or magnets. Laying your phone flat on a table gives highest reading accuracy.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             MODE 2: LIVE-CAMERA AR DIRECTION FINDER EXPERIENCE
             ============================================================ */
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl aspect-[9/16] max-h-[75vh] w-full flex flex-col justify-between isolate">
            {/* Real Live Video Camera Stream */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              onLoadedData={() => {
                if (cameraStateRef.current === "initializing") {
                  setCameraState("ready");
                }
              }}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* State 1: Camera Loading Overlay (ONLY visible while cameraState === "initializing") */}
            {cameraState === "initializing" && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-3 animate-pulse">
                  <Loader2 size={32} className="text-emerald-400 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Starting Live AR View...</h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xs">
                  Connecting to device camera and spatial orientation sensors
                </p>
                <button
                  type="button"
                  onClick={() => setMode("2d")}
                  className="mt-5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-stone-200 transition-all cursor-pointer"
                >
                  Cancel & Return to 2D
                </button>
              </div>
            )}

            {/* State 2: Camera Error / Recovery Fallback */}
            {cameraState === "error" && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mb-3">
                  <AlertTriangle size={28} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white">Camera Unavailable</h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
                  {cameraError || "Unable to access device camera stream."}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-[#134D37] hover:bg-[#0E3B2A] text-white text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    Retry Camera Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("2d")}
                    className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium cursor-pointer transition-all active:scale-95"
                  >
                    Return to 2D Compass
                  </button>
                </div>
              </div>
            )}

            {/* TOP AR HUD: Clean Non-Overlapping Structured Flex Layout */}
            <div className="relative z-20 flex flex-col items-center w-full p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none">
              {/* Row 1: Header Bar (Live AR Finder badge + Exit AR button) */}
              <div className="w-full flex items-center justify-between text-white mb-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cameraState === "ready" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span className="font-bold text-xs sm:text-[13px] tracking-tight flex items-center gap-1.5 drop-shadow">
                    <Camera size={14} className="text-emerald-400" />
                    Live AR Finder
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("2d")}
                  className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[11.5px] font-semibold cursor-pointer shadow-md transition-all active:scale-95 border border-white/20"
                >
                  Exit AR
                </button>
              </div>

              {/* Row 2: Target Information Pill (Kaaba Bearing & Distance) */}
              <div className="w-full max-w-[320px] flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white shadow-md text-xs pointer-events-auto">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <span>🕋</span>
                  <span>
                    Kaaba: {qiblaBearing}° {cardinal}
                  </span>
                </span>
                <span className="text-white/40">•</span>
                <span className="text-stone-300 tabular-nums font-mono">
                  {distanceKm.toLocaleString()} km
                </span>
              </div>

              {/* Row 3: Horizontal Degree Ruler Tape (Independent layout slot) */}
              <div className="w-full max-w-[320px] mt-2 pointer-events-auto">
                <QiblaDegreeRuler
                  heading={heading}
                  qiblaBearing={qiblaBearing}
                  isAligned={alignment.isAligned}
                />
              </div>

              {/* Row 4: Direction Guidance Instruction Chip (Strictly positive magnitude) */}
              <div className="mt-2 pointer-events-auto">
                <div
                  className={`px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg transition-all duration-300 ${
                    alignment.isAligned
                      ? "bg-emerald-500/90 text-white border border-emerald-300/80 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                      : "bg-black/75 text-white border border-white/20"
                  }`}
                >
                  {alignment.isAligned ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-200 shrink-0" />
                      <span>Qibla Aligned • Facing the Kaaba</span>
                    </>
                  ) : alignment.direction === "right" ? (
                    <>
                      <RotateCw size={14} className="text-emerald-400 shrink-0" />
                      <span>Turn Right {alignment.degrees}°</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} className="text-emerald-400 shrink-0" />
                      <span>Turn Left {alignment.degrees}°</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* True 3D WebGL Green Arrow AR Spatial Layer */}
            <QiblaAR3DView
              qiblaBearing={qiblaBearing}
              heading={heading}
              pitch={pitch}
              roll={roll}
              distanceKm={distanceKm}
              sensorAvailable={sensorAvailable}
              onSimulateHeading={setSimulatedHeading}
              onSimulatePitch={setSimulatedPitch}
              onSimulateRoll={setSimulatedRoll}
            />
          </div>
        )}
      </main>
    </div>
  );
}
