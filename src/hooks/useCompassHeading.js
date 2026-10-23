import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Computes shortest signed circular difference in degrees [-180, 180]
 */
export function getShortestAngleDiff(targetDeg, currentDeg) {
  return ((targetDeg - currentDeg + 540) % 360) - 180;
}

/**
 * Normalizes an angle in degrees to [0, 360)
 */
export function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * useCompassHeading Hook
 *
 * Provides rock-solid, jitter-free device heading, pitch, and roll across both
 * iOS Safari and Android Chrome.
 *
 * Fixes for sensor instability & direction tweaking:
 * 1. Absolute Sensor Isolation: On Android, binds ONLY to 'deviceorientationabsolute'
 *    and strictly rejects non-absolute relative gyro events that cause wild jumping.
 * 2. Screen Orientation Compensation: Compensates for device screen orientation rotation.
 * 3. Deadband & Adaptive Low-Pass Filter: Eliminates hand tremors and sensor noise
 *    (< 0.4° deadband) while maintaining instantaneous response to real body turns.
 * 4. Smooth Attitude Filtering: Exponential smoothing on pitch and roll to eliminate
 *    spatial 3D shudder.
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState(0);
  const [rawHeading, setRawHeading] = useState(0);
  const [pitch, setPitch] = useState(90); // Default to 90° (upright portrait in air)
  const [roll, setRoll] = useState(0);
  const [isFlat, setIsFlat] = useState(false);
  const [isUpright, setIsUpright] = useState(true);
  const [accuracy, setAccuracy] = useState(null);
  const [sensorAvailable, setSensorAvailable] = useState(false);

  // iOS Safari permission state
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

  // References for filtering
  const smoothedHeadingRef = useRef(0);
  const smoothedPitchRef = useRef(90);
  const smoothedRollRef = useRef(0);
  const hasReceivedReadingRef = useRef(false);
  const hasAbsoluteSensorRef = useRef(false);

  const handleOrientation = useCallback((event) => {
    // 1. Guard against non-absolute events if absolute sensor is active
    if (event.type === "deviceorientationabsolute" || event.absolute === true) {
      hasAbsoluteSensorRef.current = true;
    } else if (hasAbsoluteSensorRef.current && event.absolute === false) {
      // Reject relative gyro event to prevent 180° / 90° oscillations!
      return;
    }

    let measuredHeading = null;
    let measuredAccuracy = null;

    // Detect screen orientation angle (0, 90, 180, 270)
    let screenAngle = 0;
    if (typeof window !== "undefined") {
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === "number") {
        screenAngle = window.screen.orientation.angle;
      } else if (typeof window.orientation === "number") {
        screenAngle = window.orientation;
      }
    }

    // 1. iOS Safari: webkitCompassHeading directly provides true/magnetic heading
    if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
      measuredHeading = normalizeDegrees(event.webkitCompassHeading + screenAngle);
      if (typeof event.webkitCompassAccuracy === "number") {
        measuredAccuracy = event.webkitCompassAccuracy;
      }
    }
    // 2. Android Chrome / Standard W3C Absolute Orientation
    else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
      // W3C absolute alpha is counter-clockwise rotation around Z
      // True heading clockwise from North is: (360 - alpha - screenAngle)
      measuredHeading = normalizeDegrees(360 - event.alpha - screenAngle);
      measuredAccuracy = event.absolute ? 10 : 25;
    }

    if (measuredHeading !== null && !Number.isNaN(measuredHeading)) {
      const b = typeof event.beta === "number" ? event.beta : 90;
      const g = typeof event.gamma === "number" ? event.gamma : 0;

      if (!hasReceivedReadingRef.current) {
        hasReceivedReadingRef.current = true;
        setSensorAvailable(true);
        smoothedHeadingRef.current = measuredHeading;
        smoothedPitchRef.current = b;
        smoothedRollRef.current = g;
      }

      // -------------------------------------------------------------
      // ADAPTIVE DEADBAND & LOW-PASS FILTER FOR ROCK-SOLID HEADING
      // -------------------------------------------------------------
      const rawDiff = getShortestAngleDiff(measuredHeading, smoothedHeadingRef.current);
      const absDiff = Math.abs(rawDiff);

      // Deadband: If change is tiny hand jitter (< 0.4°), freeze to avoid twitching!
      if (absDiff >= 0.4) {
        // Dynamic responsiveness:
        // Slow turn (< 4°): Smooth heavy filtering (0.12) -> silky stability!
        // Moderate turn (4° - 15°): Responsive tracking (0.28)
        // Quick snap (> 15°): Instant snap (0.55) -> zero lag!
        let filterAlpha = 0.12;
        if (absDiff > 15) {
          filterAlpha = 0.55;
        } else if (absDiff > 4) {
          filterAlpha = 0.28;
        }

        smoothedHeadingRef.current = normalizeDegrees(
          smoothedHeadingRef.current + rawDiff * filterAlpha
        );
      }

      // Smooth pitch and roll to prevent 3D mesh shudder
      smoothedPitchRef.current += (b - smoothedPitchRef.current) * 0.22;
      smoothedRollRef.current += (g - smoothedRollRef.current) * 0.22;

      const finalHeading = Math.round(smoothedHeadingRef.current * 10) / 10;
      const finalPitch = Math.round(smoothedPitchRef.current * 10) / 10;
      const finalRoll = Math.round(smoothedRollRef.current * 10) / 10;

      setRawHeading(Math.round(measuredHeading));
      setHeading(finalHeading);
      if (measuredAccuracy !== null) setAccuracy(measuredAccuracy);

      setPitch(finalPitch);
      setRoll(finalRoll);

      // Posture detection:
      // Flat on table/ground: beta and gamma close to 0
      const flat = Math.abs(b) < 25 && Math.abs(g) < 25;
      setIsFlat(flat);

      // Upright portrait in air: beta between 45° and 135°
      const upright = b >= 45 && b <= 135;
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
        console.warn("[useCompassHeading] Permission error:", err);
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

    // Check if device supports absolute orientation (Android Chrome)
    const hasAbsoluteEvent = "ondeviceorientationabsolute" in window;

    if (hasAbsoluteEvent) {
      // ONLY listen to absolute orientation on Android to prevent relative-event contamination!
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    } else {
      // Fallback for iOS and browsers without deviceorientationabsolute
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

  // Active values (supports simulation on desktop / manual testing)
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
