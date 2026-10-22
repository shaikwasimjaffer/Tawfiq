/**
 * Test Suite for Qibla Calculation Engine
 */
import assert from "node:assert";
import {
  calculateQiblaBearing,
  calculateDistanceToKaabaKm,
  getAngularDifference,
  getQiblaAlignmentInfo,
  normalizeAngle,
  getCardinalDirection,
} from "../tawfiq-plus/src/lib/qiblaService.js";

console.log("▶ Running Qibla Calculation Tests...\n");

// Reference benchmarks from standard astronomical geodesic tables:
const REFERENCE_CITIES = [
  { name: "Hyderabad, India", lat: 17.385, lng: 78.4867, expectedRange: [282, 283.5] },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, expectedRange: [118, 120] },
  { name: "New York, USA", lat: 40.7128, lng: -74.006, expectedRange: [57, 59] },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, expectedRange: [292, 294] },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, expectedRange: [135, 137] },
  { name: "Madinah, Saudi Arabia", lat: 24.4672, lng: 39.6111, expectedRange: [175, 177] },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, expectedRange: [276, 279] },
  { name: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, expectedRange: [294, 296] },
];

for (const city of REFERENCE_CITIES) {
  const bearing = calculateQiblaBearing(city.lat, city.lng);
  const [min, max] = city.expectedRange;
  assert.ok(
    bearing >= min && bearing <= max,
    `Bearing for ${city.name} (${bearing}°) should be between ${min}° and ${max}°`
  );
  const distanceKm = calculateDistanceToKaabaKm(city.lat, city.lng);
  assert.ok(distanceKm > 0, `Distance for ${city.name} must be positive (${distanceKm} km)`);
  console.log(`✔ ${city.name}: ${bearing}° (${getCardinalDirection(bearing)}) • Distance: ${distanceKm} km`);
}

// Test 2: Normalization and Wraparound behavior at North (0 / 360)
{
  assert.strictEqual(normalizeAngle(0), 0);
  assert.strictEqual(normalizeAngle(360), 0);
  assert.strictEqual(normalizeAngle(-10), 350);
  assert.strictEqual(normalizeAngle(725), 5);

  // Shortest angular distance across 0/360 boundary
  // E.g. Target 5°, Heading 355° -> Difference is +10° (clockwise)
  assert.strictEqual(getAngularDifference(5, 355), 10);
  // Target 355°, Heading 5° -> Difference is -10° (counter-clockwise)
  assert.strictEqual(getAngularDifference(355, 5), -10);

  console.log("✔ Test: 0°/360° north wraparound and angular difference calculate accurately");
}

// Test 3: Alignment guidance evaluation
{
  const qibla = 293;
  // Exact alignment
  const exact = getQiblaAlignmentInfo(qibla, 293, 3);
  assert.strictEqual(exact.isAligned, true);
  assert.strictEqual(exact.direction, "aligned");

  // Within 3° tolerance
  const near = getQiblaAlignmentInfo(qibla, 291.5, 3);
  assert.strictEqual(near.isAligned, true);

  // Turn right
  const turnRight = getQiblaAlignmentInfo(qibla, 260, 3);
  assert.strictEqual(turnRight.isAligned, false);
  assert.strictEqual(turnRight.direction, "right");
  assert.ok(turnRight.text.includes("Right"));

  // Turn left
  const turnLeft = getQiblaAlignmentInfo(qibla, 330, 3);
  assert.strictEqual(turnLeft.isAligned, false);
  assert.strictEqual(turnLeft.direction, "left");
  assert.ok(turnLeft.text.includes("Left"));

  console.log("✔ Test: Alignment guidance correctly detects alignment and gives turn directions");
}

console.log("\n All Qibla Calculation Tests Passed Successfully!");
