import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateQiblaBearing,
  calculateDistanceToKaabaKm,
  getAngularDifference,
  getQiblaAlignmentInfo,
  normalizeAngle,
  KAABA_COORDINATES,
} from "../src/lib/qiblaService.js";

describe("Tawfiq Qibla Geospatial Engine & Direction Instructions", () => {
  test("Calculate Qibla Bearing for global cities", () => {
    // Hyderabad, India: ~282.7° WNW
    const hydBearing = calculateQiblaBearing(17.385, 78.4867);
    assert.ok(Math.abs(hydBearing - 282.7) <= 0.5, `Expected ~282.7°, got ${hydBearing}`);

    // London, UK: ~118.9° ESE
    const lonBearing = calculateQiblaBearing(51.5074, -0.1278);
    assert.ok(Math.abs(lonBearing - 118.9) <= 0.5, `Expected ~118.9°, got ${lonBearing}`);

    // New York, USA: ~58.5° ENE
    const nyBearing = calculateQiblaBearing(40.7128, -74.006);
    assert.ok(Math.abs(nyBearing - 58.5) <= 0.5, `Expected ~58.5°, got ${nyBearing}`);

    // At Kaaba coordinates: 0°
    const kaabaBearing = calculateQiblaBearing(KAABA_COORDINATES.latitude, KAABA_COORDINATES.longitude);
    assert.equal(kaabaBearing, 0);
  });

  test("Distance to Kaaba in kilometers (Haversine)", () => {
    // Hyderabad to Makkah: ~4,070 km
    const hydDist = calculateDistanceToKaabaKm(17.385, 78.4867);
    assert.ok(Math.abs(hydDist - 4070) <= 20, `Expected ~4070km, got ${hydDist}`);

    // London to Makkah: ~4,790 km
    const lonDist = calculateDistanceToKaabaKm(51.5074, -0.1278);
    assert.ok(Math.abs(lonDist - 4790) <= 20, `Expected ~4790km, got ${lonDist}`);
  });

  test("Angular difference wraparound across 0°/360° boundary", () => {
    // Target 1°, Heading 359° -> Target is 2° to the right (+2)
    assert.equal(getAngularDifference(1, 359), 2);

    // Target 359°, Heading 1° -> Target is 2° to the left (-2)
    assert.equal(getAngularDifference(359, 1), -2);

    // Target 0°, Heading 350° -> +10°
    assert.equal(getAngularDifference(0, 350), 10);

    // Target 350°, Heading 0° -> -10°
    assert.equal(getAngularDifference(350, 0), -10);

    // Target 180°, Heading 0° -> 180°
    assert.equal(Math.abs(getAngularDifference(180, 0)), 180);
  });

  test("Turn instructions format with strictly positive magnitudes and NO minus signs", () => {
    // Case 1: Wraparound Turn Right (Target 1°, Heading 359°)
    const r1 = getQiblaAlignmentInfo(1, 359, 1);
    assert.equal(r1.direction, "right");
    assert.equal(r1.degrees, 2);
    assert.equal(r1.text, "Turn Right 2°");
    assert.ok(!r1.text.includes("-"), "Must never contain negative sign");

    // Case 2: Wraparound Turn Left (Target 359°, Heading 1°)
    const r2 = getQiblaAlignmentInfo(359, 1, 1);
    assert.equal(r2.direction, "left");
    assert.equal(r2.degrees, 2);
    assert.equal(r2.text, "Turn Left 2°");
    assert.ok(!r2.text.includes("-"), "Must never contain negative sign");

    // Case 3: Turn Left - Never 'Turn Left -5°' or 'Turn Left -114°'
    const r3 = getQiblaAlignmentInfo(282, 294, 3);
    assert.equal(r3.direction, "left");
    assert.equal(r3.degrees, 12);
    assert.equal(r3.text, "Turn Left 12°");
    assert.ok(!r3.text.includes("-"), "Must never contain negative sign");

    // Case 4: Turn Right
    const r4 = getQiblaAlignmentInfo(282, 270, 3);
    assert.equal(r4.direction, "right");
    assert.equal(r4.degrees, 12);
    assert.equal(r4.text, "Turn Right 12°");

    // Case 5: Already aligned (within 4° threshold)
    const r5 = getQiblaAlignmentInfo(282, 281, 4);
    assert.equal(r5.isAligned, true);
    assert.equal(r5.direction, "aligned");
    assert.equal(r5.text, "Facing the Kaaba");

    // Case 6: Exact alignment
    const r6 = getQiblaAlignmentInfo(282, 282, 4);
    assert.equal(r6.isAligned, true);
    assert.equal(r6.direction, "aligned");
    assert.equal(r6.text, "Facing the Kaaba");

    // Case 7: Invalid / NaN sensor input handled gracefully
    const r7 = getQiblaAlignmentInfo(282, NaN, 4);
    assert.equal(r7.isAligned, false);
    assert.equal(r7.direction, "none");
    assert.equal(r7.degrees, 0);

    // Case 8: Non-finite sensor input handled gracefully
    const r8 = getQiblaAlignmentInfo(282, Infinity, 4);
    assert.equal(r8.isAligned, false);
    assert.equal(r8.direction, "none");
    assert.equal(r8.degrees, 0);
  });
});
