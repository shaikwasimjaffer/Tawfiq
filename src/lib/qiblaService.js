/**
 * Tawfiq Qibla Geospatial Calculation Engine
 *
 * Implements high-precision spherical trigonometry to calculate:
 * 1. Initial Great-Circle Bearing from user coordinates to the Holy Kaaba in Makkah.
 * 2. Great-Circle Distance (Haversine formula) in kilometers.
 * 3. Relative orientation offset, alignment thresholds, and circular angle normalization.
 */

// Holy Kaaba Coordinates (Masjid al-Haram, Makkah, Saudi Arabia)
export const KAABA_COORDINATES = {
  latitude: 21.422487, // 21° 25' 20.95" N
  longitude: 39.826206, // 39° 49' 34.34" E
};

const EARTH_RADIUS_KM = 6371.0088;

/**
 * Converts degrees to radians
 */
export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Normalizes an angle in degrees to [0, 360)
 */
export function normalizeAngle(deg) {
  const normalized = deg % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Computes the shortest signed angular difference between two angles in degrees.
 * Returns a value in [-180, 180].
 * Positive means target is to the right (clockwise).
 * Negative means target is to the left (counter-clockwise).
 */
export function getAngularDifference(targetDeg, currentDeg) {
  const diff = ((targetDeg - currentDeg + 540) % 360) - 180;
  return diff;
}

/**
 * Calculates mathematically exact Initial Great-Circle Bearing to the Kaaba
 *
 * Formula:
 * Δλ = λ_kaaba - λ_user
 * y = sin(Δλ) * cos(φ_kaaba)
 * x = cos(φ_user) * sin(φ_kaaba) - sin(φ_user) * cos(φ_kaaba) * cos(Δλ)
 * bearing = atan2(y, x)
 *
 * @param {number} latitude User latitude in decimal degrees [-90, 90]
 * @param {number} longitude User longitude in decimal degrees [-180, 180]
 * @returns {number} Bearing in degrees [0, 360) clockwise from True North
 */
export function calculateQiblaBearing(latitude, longitude) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    throw new Error("Invalid coordinates provided to calculateQiblaBearing");
  }

  // Handle exact Kaaba location
  if (
    Math.abs(latitude - KAABA_COORDINATES.latitude) < 0.0001 &&
    Math.abs(longitude - KAABA_COORDINATES.longitude) < 0.0001
  ) {
    return 0; // Already at Kaaba
  }

  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const initialBearingRad = Math.atan2(y, x);
  const initialBearingDeg = toDegrees(initialBearingRad);

  return Math.round(normalizeAngle(initialBearingDeg) * 10) / 10;
}

/**
 * Calculates Great-Circle distance to the Kaaba in kilometers using Haversine formula
 */
export function calculateDistanceToKaabaKm(latitude, longitude) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return 0;
  }

  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaPhi = toRadians(KAABA_COORDINATES.latitude - latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

/**
 * Returns human-readable alignment guidance based on relative angle to Kaaba
 *
 * @param {number} qiblaBearing Calculated bearing to Kaaba (0-360)
 * @param {number} deviceHeading Current device compass heading (0-360)
 * @param {number} thresholdDegrees Alignment tolerance in degrees (default 3°)
 * @returns {object} { isAligned, diff, text, direction }
 */
export function getQiblaAlignmentInfo(qiblaBearing, deviceHeading, thresholdDegrees = 4) {
  if (typeof deviceHeading !== "number" || !Number.isFinite(deviceHeading)) {
    return {
      isAligned: false,
      diff: 0,
      absDiff: 0,
      degrees: 0,
      text: "Waiting for sensor readings...",
      subtext: "Calibrating device compass",
      direction: "none",
    };
  }

  const diff = getAngularDifference(qiblaBearing, deviceHeading);
  const absDiff = Math.abs(diff);
  const rounded = Math.round(absDiff);

  if (rounded <= thresholdDegrees) {
    return {
      isAligned: true,
      diff,
      absDiff,
      degrees: rounded,
      text: "Facing the Kaaba",
      subtext: "You are directly aligned with the Qibla",
      direction: "aligned",
    };
  }

  if (diff > 0) {
    return {
      isAligned: false,
      diff,
      absDiff,
      degrees: rounded,
      text: `Turn Right ${rounded}°`,
      subtext: "Rotate clockwise towards Qibla",
      direction: "right",
    };
  } else {
    return {
      isAligned: false,
      diff,
      absDiff,
      degrees: rounded,
      text: `Turn Left ${rounded}°`,
      subtext: "Rotate counter-clockwise towards Qibla",
      direction: "left",
    };
  }
}

/**
 * Returns Cardinal direction label for a bearing (N, NE, E, SE, S, SW, W, NW)
 */
export function getCardinalDirection(bearingDeg) {
  const normalized = normalizeAngle(bearingDeg);
  const directions = [
    { label: "N", min: 337.5, max: 360 },
    { label: "N", min: 0, max: 22.5 },
    { label: "NE", min: 22.5, max: 67.5 },
    { label: "E", min: 67.5, max: 112.5 },
    { label: "SE", min: 112.5, max: 157.5 },
    { label: "S", min: 157.5, max: 202.5 },
    { label: "SW", min: 202.5, max: 247.5 },
    { label: "W", min: 247.5, max: 292.5 },
    { label: "NW", min: 292.5, max: 337.5 },
  ];

  for (const d of directions) {
    if (normalized >= d.min && normalized < d.max) {
      return d.label;
    }
  }
  return "N";
}
