/**
 * Verification test for Multi-turn conversation and personalized Salah/Qaza coaching
 */
import { retrieveEvidencePacket, resolveContextualQuery } from "../src/lib/mentorRagService.js";
import { generateLocalGroundedAnswer } from "../src/lib/localGroundedReasoner.js";

async function runTests() {
  console.log("=== Testing Personalized Coaching & Multi-turn Resolution ===");

  const mockUserContext = {
    hasUserData: true,
    todayDate: "2026-10-18",
    todayStatuses: { fajr: "on_time", dhuhr: "on_time" },
    completedTodayCount: 2,
    totalQazaOwed: 134,
    qazaLedger: { fajr: 28, dhuhr: 31, asr: 18, maghrib: 22, isha: 35 },
    qazaHistory: { totalMadeUp: 142, avgDailyMadeUp: 2.4, streakDays: 12 },
    completedDatesCount: 12,
    currentStreakDays: 12,
    nextPrayerName: "Asr",
    nextPrayerTime: "03:42 PM",
    nextPrayerRemainingMinutes: 45,
  };

  // Test 1: Qaza planning query with user context
  console.log("\n1. Testing Qaza Planning Query...");
  const packet1 = await retrieveEvidencePacket("Help me plan my Qaza recovery for today.", [], mockUserContext);
  const answer1 = generateLocalGroundedAnswer(packet1);
  console.log("Category:", answer1.category);
  console.log("Direct Answer:", answer1.directAnswer);
  if (!answer1.directAnswer.includes("134") || !answer1.directAnswer.includes("ledger")) {
    throw new Error("Failed: Qaza planning does not contain real user ledger numbers!");
  }
  console.log("-> Test 1 Passed: Real user Qaza balance accurately incorporated.");

  // Test 2: Prayer consistency query
  console.log("\n2. Testing Prayer Consistency Query...");
  const packet2 = await retrieveEvidencePacket("How has my prayer consistency been recently?", [], mockUserContext);
  const answer2 = generateLocalGroundedAnswer(packet2);
  console.log("Category:", answer2.category);
  console.log("Direct Answer:", answer2.directAnswer);
  if (!answer2.directAnswer.includes("12 day") || !answer2.directAnswer.includes("2/5")) {
    throw new Error("Failed: Consistency review does not contain genuine streak or today's count!");
  }
  console.log("-> Test 2 Passed: Prayer consistency references actual streak.");

  // Test 3: Follow-up resolution
  console.log("\n3. Testing Follow-Up Multi-Turn Query Expansion...");
  const history = [
    { role: "user", content: "What does the Quran say about interest and usury?" },
    {
      role: "assistant",
      answer: {
        categoryTitle: "Explicitly Supported Prohibition",
        citations: [{ reference: "Quran 2:275" }],
      },
    },
  ];

  const expandedQuery = resolveContextualQuery("Can you explain that verse in more detail?", history);
  console.log("Expanded Query:", expandedQuery);
  if (!expandedQuery.includes("Quran 2:275") && !expandedQuery.includes("Prohibition")) {
    throw new Error("Failed: Follow-up query did not resolve context from previous assistant answer!");
  }
  console.log("-> Test 3 Passed: Multi-turn reference successfully resolved from prior turns.");

  console.log("\nALL PERSONALIZATION & MULTI-TURN TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
