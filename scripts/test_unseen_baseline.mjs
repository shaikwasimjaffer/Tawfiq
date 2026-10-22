const baseUrl = "http://localhost:5173";
const origFetch = globalThis.fetch;
globalThis.fetch = (url, opts) => {
  if (typeof url === "string" && url.startsWith("/")) {
    url = baseUrl + url;
  }
  return origFetch(url, opts);
};

import { retrieveEvidencePacket } from "../src/lib/mentorRagService.js";
import { generateLocalGroundedAnswer } from "../src/lib/localGroundedReasoner.js";

const UNSEEN_QUESTIONS = [
  {
    id: "icu_nurse_emergency",
    q: "I work as an ICU night-shift nurse. A critical patient crashed during Maghrib and by the time they stabilized, Isha had already entered. Did I sin, and what should I do with my prayer?",
  },
  {
    id: "roommate_arabic_prayer",
    q: "My non-Muslim college roommate asked why Muslims pray in Arabic instead of their native languages. How should I explain this to them gently and accurately?",
  },
  {
    id: "accidental_swallow_fasting",
    q: "I accidentally swallowed some water while rinsing my mouth during wudu while fasting in Ramadan. Did I break my fast?",
  },
  {
    id: "dementia_mother_prayer",
    q: "My elderly grandmother has severe dementia and constantly forgets she already prayed Dhuhr ten minutes ago and tries to pray it again. How should our family handle this with compassion?",
  },
  {
    id: "lost_property_luqatah",
    q: "I found an expensive gold watch on a bus seat. Can I keep it or what am I required to do Islamically?",
  },
];

async function run() {
  console.log("=== UNSEEN QUESTIONS AUDIT BASELINE ===");
  for (const item of UNSEEN_QUESTIONS) {
    console.log(`\nTesting question [${item.id}]: "${item.q}"`);
    const packet = await retrieveEvidencePacket(item.q);
    console.log(`- Matched concepts count: ${packet.analysis.matchedConcepts.length}`);
    if (packet.analysis.matchedConcepts.length > 0) {
      console.log(`- Matched concept ids/terms:`, packet.analysis.matchedConcepts.map(c => c.scenarioId || c.terms[0]));
    }
    console.log(`- Retrieved Quran count: ${packet.quranEvidence.length}`);
    if (packet.quranEvidence[0]) {
      console.log(`  Top Quran: ${packet.quranEvidence[0].key} (${packet.quranEvidence[0].surahName})`);
    }
    console.log(`- Retrieved Hadith count: ${packet.hadithEvidence.length}`);
    if (packet.hadithEvidence[0]) {
      console.log(`  Top Hadith: ${packet.hadithEvidence[0].bookKey} #${packet.hadithEvidence[0].idInBook || packet.hadithEvidence[0].id}`);
    }
    const answerObj = generateLocalGroundedAnswer(packet);
    console.log(`- Answer Category: ${answerObj.category}`);
    console.log(`- Answer Title: ${answerObj.categoryTitle}`);
    console.log(`- Direct Answer: "${answerObj.answer}"`);
    console.log(`- Scenario Application: "${answerObj.scenarioApplication.slice(0, 160)}..."`);
  }
}

run();
