import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: "2d" | "ar", synchronized with URL query so AppLayout knows when to hide bottom nav
  const mode = searchParams.get("mode") === "ar" ? "ar" : "2d";
  const setMode = useCallback((newMode) => {
    if (newMode === "ar") {
      setSearchParams({ mode: "ar" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

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

  // Video element and camera stream tracking
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Session counter prevents stale asynchronous callbacks from setting ready state
  const sessionCounterRef = useRef(0);

  // Camera stream state machine: "idle" | "initializing" | "ready" | "error"
  const [cameraState, setCameraState] = useState("idle");
  const [cameraError, setCameraError] = useState(null);
  const cameraStateRef = useRef("idle");
  cameraStateRef.current = cameraState;

  // Haptic feedback tracker
  const hadAlignedRef = useRef(false);

  // Haptic feedback trigger on reaching alignment
  useEffect(() => {
    if (alignment.isAligned && !hadAlignedRef.current) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // Ignore vibrate restrictions
        }
      }
      hadAlignedRef.current = true;
    } else if (!alignment.isAligned) {
      hadAlignedRef.current = false;
    }
  }, [alignment.isAligned]);

  // Stop camera helper - cleans up all tracks and resets state
  const stopCamera = useCallback(() => {
    sessionCounterRef.current += 1;
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn("[QiblaApp] Error stopping stream tracks:", err);
      }
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
    stopCamera();
    setCameraState("initializing");
    setCameraError(null);

    const currentSession = sessionCounterRef.current;

    // Safety timeout: prevents infinite loader
    const timeoutId = setTimeout(() => {
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

      // Ideal camera constraints: environment-facing rear camera
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Guard against race conditions if user quickly exited AR mode
      if (sessionCounterRef.current !== currentSession) {
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(timeoutId);
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("[QiblaApp] video.play() note:", playErr);
        }
      }

      clearTimeout(timeoutId);
      if (sessionCounterRef.current === currentSession) {
        setCameraState("ready");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (sessionCounterRef.current !== currentSession) return;

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
    }
  }, [stopCamera]);

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

  /* ============================================================
     FULL-SCREEN AR MODE: Complete takeover of the viewport
     ============================================================ */
  if (mode === "ar") {
    return (
      <div className="fixed inset-0 z-50 w-screen h-[100dvh] bg-black overflow-hidden select-none isolate flex flex-col justify-between">
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
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* State 1: Camera Loading Overlay */}
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
          {/* Top Navigation Row: Small clean Exit AR button pinned top-right */}
          <div className="w-full flex items-center justify-end text-white mb-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setMode("2d")}
              className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95 border border-white/25 flex items-center gap-1.5"
            >
              <CompassIcon size={13} className="text-emerald-300" />
              <span>Exit AR</span>
            </button>
          </div>

          {/* Turn Instruction: Placed directly in the top guidance slot */}
          <div className="w-full max-w-[320px] flex items-center justify-center pointer-events-auto">
            <div
              className={`w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold tracking-wide shadow-lg transition-all duration-300 ${
                alignment.isAligned
                  ? "bg-emerald-500/90 text-white border border-emerald-300/80 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                  : "bg-black/65 text-white border border-white/20"
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

          {/* Horizontal Degree Ruler Tape */}
          <div className="w-full max-w-[320px] mt-2 pointer-events-auto">
            <QiblaDegreeRuler
              heading={heading}
              qiblaBearing={qiblaBearing}
              isAligned={alignment.isAligned}
            />
          </div>
        </div>

        {/* 3D WebGL Green Arrow AR Spatial Layer */}
        <QiblaAR3DView
          qiblaBearing={qiblaBearing}
          heading={heading}
          pitch={pitch}
          roll={roll}
        />
      </div>
    );
  }

  /* ============================================================
     MODE 1: 2D PRECISION COMPASS EXPERIENCE (Standard page layout)
     ============================================================ */
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

          {/* Mode Switch Button (Launch AR View) */}
          <button
            type="button"
            onClick={handleOpenAR}
            className="h-9 px-3 rounded-full bg-[#134D37] text-white hover:bg-[#0E3B2A] text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            title="Launch Live Camera AR Finder"
          >
            <Camera size={14} />
            <span>AR View</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
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
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.18)_0%,transparent_70%)] animate-pulse pointer-events-none"
              />
            )}

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 transition-all ${
                  alignment.isAligned
                    ? "bg-[#134D37] text-white shadow-xs"
                    : "bg-[#F3EFE6] text-stone-700"
                }`}
              >
                {alignment.isAligned ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                    <span>Qibla Aligned</span>
                  </>
                ) : (
                  <>
                    <CompassIcon size={13} className="text-[#134D37] shrink-0" />
                    <span>
                      Kaaba: {qiblaBearing}° {cardinal}
                    </span>
                  </>
                )}
              </div>

              <h2
                className={`text-xl font-bold tracking-tight transition-colors ${
                  alignment.isAligned ? "text-[#134D37]" : "text-stone-900"
                }`}
              >
                {alignment.text}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">{alignment.subtext}</p>
            </div>
          </div>

          {/* Compass Dial Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E7E2D9] shadow-sm flex flex-col items-center">
            {/* Compass Container */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Stationary alignment marker at top (12 o'clock) */}
              <div
                aria-hidden="true"
                className={`absolute top-0 z-20 flex flex-col items-center transition-transform ${
                  alignment.isAligned ? "scale-110" : ""
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rotate-45 rounded-[2px] transition-colors shadow-xs ${
                    alignment.isAligned
                      ? "bg-emerald-500 ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                      : "bg-[#134D37]"
                  }`}
                />
                <div
                  className={`w-0.5 h-3 mt-0.5 transition-colors ${
                    alignment.isAligned ? "bg-emerald-400" : "bg-[#134D37]/70"
                  }`}
                />
              </div>

              {/* Rotating Compass Dial */}
              <div
                className="relative w-full h-full rounded-full transition-transform duration-150 ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${dialRotation}deg)`,
                  willChange: "transform",
                }}
              >
                {/* Dial Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-[#E7E2D9] bg-[#FAF8F3] shadow-inner" />

                {/* Sub-degree tick marks */}
                <div className="absolute inset-2 rounded-full border border-[#EDE8DE]">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const deg = i * 10;
                    const isMajor = deg % 90 === 0;
                    const isMid = deg % 30 === 0;
                    return (
                      <div
                        key={deg}
                        className="absolute inset-0 flex justify-center pointer-events-none"
                        style={{ transform: `rotate(${deg}deg)` }}
                      >
                        <div
                          className={`origin-top transition-colors ${
                            isMajor
                              ? "w-0.5 h-2.5 bg-stone-700"
                              : isMid
                              ? "w-0.5 h-1.5 bg-stone-400"
                              : "w-px h-1 bg-stone-300"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Cardinal Labels (N, E, S, W) */}
                <div className="absolute inset-5 flex flex-col justify-between items-center text-xs font-bold pointer-events-none">
                  <span className="text-[#C53030] tracking-wider">N</span>
                  <span className="text-stone-500 tracking-wider">S</span>
                </div>
                <div className="absolute inset-5 flex justify-between items-center text-xs font-bold pointer-events-none">
                  <span className="text-stone-500 tracking-wider pl-1">W</span>
                  <span className="text-stone-500 tracking-wider pr-1">E</span>
                </div>

                {/* Kaaba Directional Marker & Arrow Vector on Dial */}
                <div
                  className="absolute inset-0 flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${kaabaAngleOnRose}deg)` }}
                >
                  <div className="relative flex flex-col items-center pt-2">
                    {/* Holy Kaaba Icon Marker */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md transition-all ${
                        alignment.isAligned
                          ? "bg-emerald-500 ring-4 ring-emerald-200 scale-110 shadow-[0_0_16px_rgba(16,185,129,0.6)]"
                          : "bg-[#134D37] text-white"
                      }`}
                    >
                      <span role="img" aria-label="Kaaba">
                        🕋
                      </span>
                    </div>

                    {/* Radiant Direction Arrow toward Kaaba center */}
                    <div
                      className={`w-0.5 h-16 mt-1 rounded-full transition-colors ${
                        alignment.isAligned
                          ? "bg-gradient-to-b from-emerald-500 to-transparent"
                          : "bg-gradient-to-b from-[#134D37] to-transparent"
                      }`}
                    />
                  </div>
                </div>

                {/* Compass Center Cap */}
                <div className="w-16 h-16 rounded-full bg-white border border-[#E7E2D9] shadow-sm flex flex-col items-center justify-center z-10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Heading
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800 tabular-nums">
                    {Math.round(heading)}°
                  </span>
                </div>
              </div>
            </div>

            {/* Live Bearing Numerical Footer */}
            <div className="w-full mt-6 pt-4 border-t border-[#F0EBE1] grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EFEAE0]">
                <p className="text-[10.5px] uppercase font-bold tracking-wider text-stone-500">
                  Current Heading
                </p>
                <p className="text-base font-mono font-bold text-stone-900 mt-0.5 tabular-nums">
                  {Math.round(heading)}° {getCardinalDirection(heading)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EEF5F1] border border-[#D5E8DD]">
                <p className="text-[10.5px] uppercase font-bold tracking-wider text-[#134D37]">
                  Qibla Target
                </p>
                <p className="text-base font-mono font-bold text-[#134D37] mt-0.5 tabular-nums">
                  {qiblaBearing}° {cardinal}
                </p>
              </div>
            </div>
          </div>

          {/* Sensor Diagnostics & Calibration Guidance */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    sensorAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="text-xs font-semibold text-stone-800">
                  {sensorAvailable ? "Compass Hardware Active" : "Compass Sensor Not Detected"}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Accuracy: {accuracy || (sensorAvailable ? "Calibrated" : "Manual")}
              </span>
            </div>

            {!isFlat && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>
                  Tip: Hold device flatter for optimal 2D compass accuracy (Tilt: {Math.round(pitch)}°).
                </span>
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
      </main>
    </div>
  );
}
