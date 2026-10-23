import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Computes shortest signed circular difference in degrees [-180, 180]
 */
export function getShortestAngleDiff(targetDeg, currentDeg) {
  return ((targetDeg - currentDeg + 540) % 360) - 180;
}

/**
 * Derives true horizontal compass heading from 3D Euler angles (alpha, beta, gamma)
 * using standard aerospace/W3C rotation matrix transformation.
 *
 * Robustly handles ALL device postures without gimbal lock or inversion:
 * 1. Phone lying flat on a surface (beta, gamma ~ 0) -> top of device vector
 * 2. Phone held upright in the air (beta ~ 90) -> camera line-of-sight vector
 * 3. Intermediate tilt angles (smooth circular blend)
 */
export function computeHeadingFromSensors(alpha, beta, gamma) {
  const rad = Math.PI / 180;
  const a = (alpha || 0) * rad;
  const b = (beta || 0) * rad;
  const g = (gamma || 0) * rad;

  const cA = Math.cos(a), sA = Math.sin(a);
  const cB = Math.cos(b), sB = Math.sin(b);
  const cG = Math.cos(g), sG = Math.sin(g);

  // Vector 1: Camera line-of-sight vector (0, 0, -1) projected onto Earth horizontal plane
  // In Earth coordinates (East = +X, North = +Y, Up = +Z):
  // CE = -(cA * sG + sA * sB * cG)
  // CN = -sA * sG + cA * sB * cG
  const CE = -(cA * sG + sA * sB * cG);
  const CN = -sA * sG + cA * sB * cG;
  let camHeading = Math.atan2(CE, CN) * (180 / Math.PI);
  camHeading = (camHeading + 360) % 360;

  // Vector 2: Top of device vector (0, 1, 0) projected onto Earth horizontal plane
  // TE = -cB * sA
  // TN = cB * cA
  const TE = -cB * sA;
  const TN = cB * cA;
  let topHeading = Math.atan2(TE, TN) * (180 / Math.PI);
  topHeading = (topHeading + 360) % 360;

  const absBeta = Math.abs(beta || 0);

  // Surface mode: When phone is nearly horizontal (beta <= 25°)
  if (absBeta <= 25) {
    return topHeading;
  }

  // Air / AR mode: When phone is held upright (beta >= 55°)
  if (absBeta >= 55) {
    return camHeading;
  }

  // Smooth circular interpolation for transitional angles (25° - 55°)
  const t = (absBeta - 25) / 30; // 0 to 1
  const diff = getShortestAngleDiff(camHeading, topHeading);
  return (topHeading + diff * t + 360) % 360;
}

/**
 * useCompassHeading Hook
 *
 * Provides real-time, jitter-filtered device heading, pitch, roll,
 * posture detection (flat on table vs upright in air), iOS permission handling,
 * and desktop orientation simulation.
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState(0);
  const [rawHeading, setRawHeading] = useState(0);
  const [pitch, setPitch] = useState(90); // Default to 90° (upright in air)
  const [roll, setRoll] = useState(0);
  const [isFlat, setIsFlat] = useState(false);
  const [isUpright, setIsUpright] = useState(true);
  const [accuracy, setAccuracy] = useState(null); // degrees of accuracy
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [permissionState, setPermissionState] = useState(() => {
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      return "prompt";
    }
    return "granted";
  });

  // Simulation states for desktop & manual testing
  const [simulatedHeading, setSimulatedHeading] = useState(null);
  const [simulatedPitch, setSimulatedPitch] = useState(null);
  const [simulatedRoll, setSimulatedRoll] = useState(null);

  const smoothedHeadingRef = useRef(0);
  const hasReceivedReadingRef = useRef(false);

  // Filter weight for Exponential Moving Average (EMA)
  // 0.28 gives responsive turn tracking with zero jitter
  const SMOOTH_ALPHA = 0.28;

  const handleOrientation = useCallback((event) => {
    let measuredHeading = null;
    let measuredAccuracy = null;

    const b = typeof event.beta === "number" ? event.beta : 0;
    const g = typeof event.gamma === "number" ? event.gamma : 0;

    // 1. iOS Safari: webkitCompassHeading provides direct magnetic/true north heading
    if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
      measuredHeading = event.webkitCompassHeading;
      if (typeof event.webkitCompassAccuracy === "number") {
        measuredAccuracy = event.webkitCompassAccuracy;
      }
    }
    // 2. Android / Standard Chrome: absolute orientation
    else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
      measuredHeading = computeHeadingFromSensors(event.alpha, b, g);
      measuredAccuracy = event.absolute ? 10 : 25;
    }

    if (measuredHeading !== null && !Number.isNaN(measuredHeading)) {
      if (!hasReceivedReadingRef.current) {
        hasReceivedReadingRef.current = true;
        setSensorAvailable(true);
        smoothedHeadingRef.current = measuredHeading;
      }

      // Smooth with circular EMA
      const diff = getShortestAngleDiff(measuredHeading, smoothedHeadingRef.current);
      smoothedHeadingRef.current = (smoothedHeadingRef.current + diff * SMOOTH_ALPHA + 360) % 360;

      setRawHeading(Math.round(measuredHeading));
      setHeading(Math.round(smoothedHeadingRef.current * 10) / 10);
      if (measuredAccuracy !== null) setAccuracy(measuredAccuracy);

      setPitch(Math.round(b));
      setRoll(Math.round(g));

      // Posture detection:
      // Phone flat on table/ground: pitch and roll within 25 degrees of horizontal
      const flat = Math.abs(b) < 25 && Math.abs(g) < 25;
      setIsFlat(flat);

      // Phone held upright for camera AR view in the air: pitch between 50° and 130°
      const upright = b >= 50 && b <= 130;
      setIsUpright(upright);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        setPermissionState(response);
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
        return response;
      } catch (err) {
        console.warn("[useCompassHeading] Permission request error:", err);
        setPermissionState("denied");
        return "denied";
      }
    }
    setPermissionState("granted");
    return "granted";
  }, [handleOrientation]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("DeviceOrientationEvent" in window)) {
      setSensorAvailable(false);
      return;
    }

    const hasAbsoluteEvent = "ondeviceorientationabsolute" in window;

    if (hasAbsoluteEvent) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    const timer = setTimeout(() => {
      if (!hasReceivedReadingRef.current) {
        setSensorAvailable(false);
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
      if (hasAbsoluteEvent) {
        window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      } else {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  // Active values (supports simulation on desktop / testing)
  const activeHeading = simulatedHeading !== null ? simulatedHeading : heading;
  const activePitch = simulatedPitch !== null ? simulatedPitch : pitch;
  const activeRoll = simulatedRoll !== null ? simulatedRoll : roll;

  return {
    heading: activeHeading,
    rawHeading,
    pitch: activePitch,
    roll: activeRoll,
    isFlat,
    isUpright,
    accuracy,
    sensorAvailable,
    permissionState,
    requestPermission,
    simulatedHeading,
    setSimulatedHeading,
    simulatedPitch,
    setSimulatedPitch,
    simulatedRoll,
    setSimulatedRoll,
  };
}
