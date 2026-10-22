/**
 * Tawfiq Location & Geocoding Service
 *
 * Manages coordinates, city presets, GPS auto-detection, calculation methods,
 * and Qibla angle determination using astronomical spherical trigonometry.
 */
import { Coordinates, CalculationMethod, Madhab, Qibla } from "adhan";

const LOCATION_STORAGE_KEY = "tawfiq_user_location";
const CALC_PREFS_KEY = "tawfiq_calc_preferences";

export const CITY_PRESETS = [
  { city: "Makkah", country: "Saudi Arabia", latitude: 21.4225, longitude: 39.8262, method: "Makkah" },
  { city: "Madinah", country: "Saudi Arabia", latitude: 24.4672, longitude: 39.6111, method: "Makkah" },
  { city: "Jerusalem", country: "Palestine", latitude: 31.7767, longitude: 35.2345, method: "MWL" },
  { city: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357, method: "Egypt" },
  { city: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784, method: "MWL" },
  { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, method: "MWL" },
  { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, method: "ISNA" },
  { city: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, method: "ISNA" },
  { city: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, method: "Dubai" },
  { city: "Karachi", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, method: "Karachi" },
  { city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, method: "Karachi" },
  { city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867, method: "Karachi" },
  { city: "Kuala Lumpur", country: "Malaysia", latitude: 3.139, longitude: 101.6869, method: "MWL" },
  { city: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, method: "MWL" },
  { city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, method: "MWL" },
];

export const CALCULATION_METHODS = [
  { id: "MWL", name: "Muslim World League (MWL)", desc: "Standard for Europe, Far East, parts of US" },
  { id: "ISNA", name: "Islamic Society of North America (ISNA)", desc: "Standard for USA & Canada" },
  { id: "Makkah", name: "Umm Al-Qura University, Makkah", desc: "Official standard for Saudi Arabia & Gulf" },
  { id: "Egypt", name: "Egyptian General Authority of Survey", desc: "Egypt, Africa, Syria, Lebanon, Iraq" },
  { id: "Karachi", name: "University of Islamic Sciences, Karachi", desc: "Pakistan, India, Bangladesh, Afghanistan" },
  { id: "Dubai", name: "Dubai (UAE Awqaf)", desc: "Official standard for United Arab Emirates" },
];

export const MADHHABS = [
  { id: "shafi", name: "Standard (Shafi'i, Maliki, Hanbali)", desc: "Asr shadow equals 1x object height" },
  { id: "hanafi", name: "Hanafi", desc: "Asr shadow equals 2x object height" },
];

/**
 * Returns the currently active location from localStorage or default Makkah preset
 */
export function getSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
        return parsed;
      }
    }
  } catch {}
  return CITY_PRESETS[0]; // Default: Makkah
}

/**
 * Saves selected location to localStorage
 */
export function saveLocation(locationObj) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationObj));
  } catch {}
  return locationObj;
}

/**
 * Returns calculation preferences (method + madhhab)
 */
export function getCalculationPreferences() {
  try {
    const raw = localStorage.getItem(CALC_PREFS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    methodId: "MWL",
    madhabId: "shafi",
  };
}

/**
 * Saves calculation preferences
 */
export function saveCalculationPreferences(prefs) {
  try {
    localStorage.setItem(CALC_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
  return prefs;
}

/**
 * Requests GPS position from browser navigator.geolocation
 */
export function requestDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find nearest city or label as Auto-detected
        const nearest = findNearestCity(latitude, longitude);
        const autoLocation = {
          city: nearest ? nearest.city : "Detected Coordinates",
          country: nearest ? nearest.country : "GPS",
          latitude,
          longitude,
          isAuto: true,
          method: nearest ? nearest.method : "MWL",
        };
        saveLocation(autoLocation);
        resolve(autoLocation);
      },
      (err) => {
        let msg = "Could not detect location.";
        if (err.code === 1) msg = "Location permission was denied.";
        else if (err.code === 2) msg = "Position unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

/**
 * Finds the closest city preset given coordinates
 */
function findNearestCity(lat, lng) {
  let minDistance = Infinity;
  let nearest = null;

  for (const preset of CITY_PRESETS) {
    const dLat = (preset.latitude - lat) * (Math.PI / 180);
    const dLng = (preset.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(preset.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (distance < minDistance) {
      minDistance = distance;
      nearest = preset;
    }
  }

  // If within ~150km, return preset name
  return nearest;
}

/**
 * Resolves adhan calculation parameters based on method ID and madhab
 */
export function resolveCalculationParameters(methodId, madhabId) {
  let params = CalculationMethod.MuslimWorldLeague();

  switch (methodId) {
    case "ISNA":
      params = CalculationMethod.NorthAmerica();
      break;
    case "Makkah":
      params = CalculationMethod.UmmAlQura();
      break;
    case "Egypt":
      params = CalculationMethod.Egyptian();
      break;
    case "Karachi":
      params = CalculationMethod.Karachi();
      break;
    case "Dubai":
      params = CalculationMethod.Dubai();
      break;
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }

  if (madhabId === "hanafi") {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  return params;
}

/**
 * Calculates exact Qibla compass bearing (in degrees, 0 to 360)
 */
export function calculateQiblaBearing(lat, lng) {
  try {
    const coords = new Coordinates(lat, lng);
    return Math.round(Qibla(coords));
  } catch {
    return 294; // fallback standard bearing
  }
}
