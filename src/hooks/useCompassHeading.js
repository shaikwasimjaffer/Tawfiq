import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Computes shortest signed circular difference in degrees [-180, 180]
 */
function getShortestAngleDiff(targetDeg, currentDeg) {
  return ((targetDeg - currentDeg + 540) % 360) - 180;
}

/**
 * Derives true horizontal compass heading from 3D Euler angles (alpha, beta, gamma)
 * using standard aerospace/W3C rotation matrix transformation.
 *
 * Handles both:
 * 1. Phone lying flat horizontally on a surface (beta, gamma ~ 0)
 * 2. Phone held upright at an angle or vertical (beta ~ 90)
 */
function computeHeadingFromEuler(alpha, beta, gamma) {
  const _x = (beta * Math.PI) / 180;
  const _y = (gamma * Math.PI) / 180;
  const _z = (alpha * Math.PI) / 180;

  const cX = Math.cos(_x);
  const cY = Math.cos(_y);
  const cZ = Math.cos(_z);
  const sX = Math.sin(_x);
  const sY = Math.sin(_y);
  const sZ = Math.sin(_z);

  // Vector pointing along the top of the device [0, 1, 0] transformed by R = Rz * Rx * Ry
  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;

  // Azimuth of top vector in horizontal ground plane
  let heading = Math.atan2(-Vx, Vy) * (180 / Math.PI);
  if (heading < 0) heading += 360;

  return heading;
}

/**
 * useCompassHeading Hook
 *
 * Provides real-time, jitter-filtered device heading, pitch, roll,
 * surface flat-state detection, iOS permission management,
 * and desktop simulation fallback.
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState(0);
  const [rawHeading, setRawHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [isFlat, setIsFlat] = useState(false);
  const [isUpright, setIsUpright] = useState(false);
  const [accuracy, setAccuracy] = useState(null); // degrees of accuracy
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [permissionState, setPermissionState] = useState(() => {
    if (typeof window !== "undefined" && typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      return "prompt";
    }
    return "granted";
  });
  const [simulatedHeading, setSimulatedHeading] = useState(null);

  const smoothedHeadingRef = useRef(0);
  const hasReceivedReadingRef = useRef(false);

  // Filter weight for Exponential Moving Average (EMA)
  // 0.28 gives responsive turn tracking with zero jitter
  const SMOOTH_ALPHA = 0.28;

  const handleOrientation = useCallback((event) => {
    let measuredHeading = null;
    let measuredAccuracy = null;

    // 1. iOS Safari: webkitCompassHeading provides direct magnetic/true north heading
    if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
      measuredHeading = event.webkitCompassHeading;
      if (typeof event.webkitCompassAccuracy === "number") {
        measuredAccuracy = event.webkitCompassAccuracy;
      }
    }
    // 2. Android / Standard Chrome: absolute orientation
    else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
      const alpha = event.alpha;
      const beta = typeof event.beta === "number" ? event.beta : 0;
      const gamma = typeof event.gamma === "number" ? event.gamma : 0;

      // When device is completely horizontal, alpha is directly related to heading
      if (Math.abs(beta) < 25 && Math.abs(gamma) < 25) {
        measuredHeading = (360 - alpha) % 360;
      } else {
        measuredHeading = computeHeadingFromEuler(alpha, beta, gamma);
      }

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

      const b = typeof event.beta === "number" ? event.beta : 0;
      const g = typeof event.gamma === "number" ? event.gamma : 0;
      setPitch(Math.round(b));
      setRoll(Math.round(g));

      // Posture detection:
      // Phone flat on table/ground: pitch and roll within 25 degrees of horizontal
      const flat = Math.abs(b) < 25 && Math.abs(g) < 25;
      setIsFlat(flat);

      // Phone held upright for camera AR view: pitch > 45
      const upright = b > 45 && b < 135;
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

    // Check if DeviceOrientationEvent exists
    if (!("DeviceOrientationEvent" in window)) {
      setSensorAvailable(false);
      return;
    }

    // Try absolute event on Android Chrome
    const hasAbsoluteEvent = "ondeviceorientationabsolute" in window;

    if (hasAbsoluteEvent) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    // Sensor availability timeout: If no sensor events fire in 1.8s, declare sensor unavailable
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

  // When simulated heading is active (e.g. desktop testing)
  const activeHeading = simulatedHeading !== null ? simulatedHeading : heading;

  return {
    heading: activeHeading,
    rawHeading,
    pitch,
    roll,
    isFlat,
    isUpright,
    accuracy,
    sensorAvailable,
    permissionState,
    requestPermission,
    simulatedHeading,
    setSimulatedHeading,
  };
}
