/**
 * Tawfiq Mentor RAG Service
 * General-purpose, scenario-aware Islamic query understanding, theological expansion,
 * hybrid scripture retrieval across full Quran & Hadith datasets, evidence packet assembly,
 * context sufficiency evaluation, and citation validation.
 */

import { searchQuran, getVerse, normalizeArabic } from "./quranService.js";
import { searchHadiths, getHadithById } from "./hadithService.js";
import { isSalahCoachingQuery } from "./salahCoachingService.js";

// ─── Theological Semantic Domain Ontology & Query Expansion Vectors ─────────
// General-purpose semantic categories mapping theological concepts to scriptural search queries.
// These are NOT a rigid lookup table of fixed answers; they serve as dynamic query expansion vectors.
export const THEOLOGICAL_CONCEPTS = [
  {
    domain: "speech_ethics",
    terms: ["lie", "lying", "liar", "deceit", "dishonesty", "falsehood", "fake", "backdate", "false invoice", "forgery", "false contract", "falsify"],
    arabic: "كذب صدق شهادة الزور تزوير",
    quranKeys: ["9:119", "40:28", "16:105", "2:42"],
    hadithQueries: ["bukhari:6094", "truthfulness leads to righteousness"],
    category: "explicit_prohibition",
    fiqhDomain: "speech_ethics",
  },
  {
    domain: "speech_ethics",
    terms: ["backbite", "backbiting", "gossip", "slander", "rumor", "talking behind"],
    arabic: "غيبة بهتان نميمة",
    quranKeys: ["49:12", "104:1"],
    hadithQueries: ["muslim:2589", "do you know what is backbiting"],
    category: "explicit_prohibition",
    fiqhDomain: "speech_ethics",
  },
  {
    domain: "transactions_money",
    terms: ["interest", "usury", "riba", "bank interest", "loan fee"],
    arabic: "ربا",
    quranKeys: ["2:275", "2:278", "3:130"],
    hadithQueries: ["muslim:1598", "allah has cursed the receiver of usury"],
    category: "explicit_prohibition",
    fiqhDomain: "transactions_money",
  },
  {
    domain: "dietary",
    terms: ["alcohol", "beer", "wine", "liquor", "intoxicant", "drinking", "drunk"],
    arabic: "خمر مسكر",
    quranKeys: ["5:90", "5:91", "2:219"],
    hadithQueries: ["muslim:2003", "every intoxicant is khamr"],
    category: "explicit_prohibition",
    fiqhDomain: "dietary",
  },
  {
    domain: "dietary",
    terms: ["pork", "pig", "swine", "bacon", "ham", "gelatin from pork", "dead animals", "carrion", "maytah"],
    arabic: "خنزير ميتة",
    quranKeys: ["2:173", "5:3", "6:145", "16:115"],
    hadithQueries: ["bukhari:2236", "dead animals and swine"],
    category: "explicit_prohibition",
    fiqhDomain: "dietary",
  },
  {
    domain: "prayer_overslept",
    terms: ["missed fajr", "overslept", "slept through prayer", "woke up late", "alarm fajr", "sleep prayer"],
    arabic: "صلاة الفجر النوم عن الصلاة استيقظ بعد الشروق",
    quranKeys: ["20:14", "4:103", "2:238"],
    hadithQueries: ["bukhari:583", "muslim:684"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_overslept",
  },
  {
    domain: "prayer_schedule",
    terms: ["college schedule", "university schedule", "lecture during prayer", "busy schedule prayer", "class during prayer", "exam prayer"],
    arabic: "جدول الدراسة صلاة الجامعة اوقات المحاضرات",
    quranKeys: ["4:103", "2:286", "2:238"],
    hadithQueries: ["bukhari:517"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_schedule",
  },
  {
    domain: "parents_ethics",
    terms: ["angry at parents", "spoke badly to parents", "yelled at parents", "disrespected parents", "shouted at mother", "harsh to parents", "apologize to parents"],
    arabic: "عقوق الوالدين الغضب بر الوالدين رفع الصوت على الوالدين",
    quranKeys: ["17:23", "17:24", "31:14"],
    hadithQueries: ["bukhari:5743", "nawawi40:16", "bukhari:517"],
    category: "explicit_prohibition",
    fiqhDomain: "parents_ethics",
  },
  {
    domain: "repentance_repeated",
    terms: ["repeated mistake", "sinned again after repenting", "relapsed into sin", "repented and repeated", "guilt past sins", "despair forgiveness"],
    arabic: "تكرار الذنب التوبة العود للذنب نقض التوبة",
    quranKeys: ["39:53", "3:135", "4:110"],
    hadithQueries: ["nawawi40:42", "qudsi40:34"],
    category: "general_guidance",
    fiqhDomain: "repentance_repeated",
  },
  {
    domain: "medical_emergency_life",
    terms: ["icu", "nurse", "doctor", "crashed", "cpr", "saving life", "emergency surgery", "hospital", "patient emergency", "night shift nurse"],
    arabic: "إنقاذ النفس حرج ضرورة إسعاف مريض",
    quranKeys: ["5:32", "2:185", "22:78"],
    hadithQueries: ["bukhari:583", "muslim:684", "whoever saves a life"],
    category: "explicit_permission",
    fiqhDomain: "medical_emergency",
  },
  {
    domain: "fasting_mistake",
    terms: ["swallowed water fasting", "mouthwash fasting", "rinsing mouth fasting", "ate forgetfully fasting", "drank accidentally fasting"],
    arabic: "نسي وهو صائم أكل أو شرب خطأ في الصيام مضمضة",
    quranKeys: ["2:286", "33:5", "2:187"],
    hadithQueries: ["bukhari:1933", "muslim:1155"],
    category: "explicit_permission",
    fiqhDomain: "fasting",
  },
  {
    domain: "elder_dementia_memory",
    terms: ["dementia", "alzheimer", "elderly memory loss", "repeats prayer forgets", "grandmother dementia", "loss of reason", "cognitive decline"],
    arabic: "الخرف الزهايمر كبير السن نسيان الصلاة رفع القلم",
    quranKeys: ["2:286", "22:5"],
    hadithQueries: ["abudawud:4403", "tirmidhi:1423"],
    category: "explicit_permission",
    fiqhDomain: "loss_of_capacity",
  },
  {
    domain: "property_lost_luqatah",
    terms: ["found watch", "found wallet", "lost property", "luqatah", "found on bus", "found money", "unclaimed item", "وجدت ساعة", "لقطة", "ساعة ثمينة"],
    arabic: "اللقطة وجد مالا وجدت ساعة ضالة الغنم ضالة الإبل حفظ الأمانة حافلة عامة",
    quranKeys: ["4:58", "23:8"],
    hadithQueries: ["bukhari:2427", "muslim:1722"],
    category: "explicit_obligation",
    fiqhDomain: "property_luqatah",
  },
  {
    domain: "cross_cultural_dawah",
    terms: ["why pray in arabic", "roommate asked prayer", "why arabic quran", "explaining prayer to non muslim", "arabic language salah"],
    arabic: "القرآن بلسان عربي مبين الصلاة بالعربية الدعاء بغير العربية",
    quranKeys: ["12:2", "41:44", "14:4"],
    hadithQueries: ["nawawi40:1", "bukhari:756"],
    category: "general_guidance",
    fiqhDomain: "cross_cultural",
  },
  {
    domain: "peer_pressure_integrity",
    terms: ["friend pressuring", "coworker pressure", "peer pressure", "forced to do haram", "refusing haram politely"],
    arabic: "ضغط الأصدقاء لا طاعة لمخلوق في معصية الخالق التعاون على البر",
    quranKeys: ["5:2", "49:10"],
    hadithQueries: ["bukhari:6875", "muslim:1840"],
    category: "explicit_prohibition",
    fiqhDomain: "ethics_integrity",
  },
  {
    domain: "prayer_doubts_sahw",
    terms: ["doubt in prayer", "how many rakahs", "forgot 3 or 4", "sajdah sahw", "waswas prayer", "doubts in salah"],
    arabic: "الشك في الصلاة كم صلى ثلاثا أم أربعا سجود السهو",
    quranKeys: ["2:286"],
    hadithQueries: ["muslim:571", "bukhari:401"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_sahw",
  },
  {
    domain: "prayer_illness_sitting",
    terms: ["cannot stand", "pray sitting", "back pain prayer", "surgery prayer", "illness prayer", "sick prayer"],
    arabic: "صلاة المريض صلاة القاعد العجز عن القيام",
    quranKeys: ["2:286", "3:191"],
    hadithQueries: ["bukhari:1117"],
    category: "explicit_permission",
    fiqhDomain: "prayer_illness",
  },
  {
    domain: "exams_stress_salah",
    terms: ["exam", "exams", "exam stress", "studying for exams", "preparing for exams", "struggling to maintain my prayers while preparing for exams"],
    arabic: "امتحانات مذاكرة صلاة الصبر والصلاة",
    quranKeys: ["2:45"],
    hadithQueries: ["bukhari:5641"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_exams",
  },
  {
    domain: "qaza_backlog_plan",
    terms: ["missed several prayers", "qaza backlog", "making up missed prayers", "missed prayers backlog", "accumulated missed prayers"],
    arabic: "قضاء الصلوات الفائتة جدول قضاء الفوائت",
    quranKeys: ["20:14"],
    hadithQueries: ["bukhari:583"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_qaza",
  },
  {
    domain: "guilt_past_sins",
    terms: ["feel guilty", "guilt about past mistakes", "past mistakes moving forward", "guilt past sins", "burden of past sins"],
    arabic: "الشعور بالذنب الندم التوبة تجديد الإيمان",
    quranKeys: ["39:53", "25:70"],
    hadithQueries: ["qudsi40:34", "nawawi40:42"],
    category: "general_guidance",
    fiqhDomain: "spiritual_guilt",
  },
  {
    domain: "prayer_combine_context",
    terms: ["can i combine my prayers", "combine prayers", "combining prayers", "combine salah", "joining prayers"],
    arabic: "جمع الصلوات جمع التقديم والتأخير الجمع للمطر والسفر",
    quranKeys: ["4:103", "4:101"],
    hadithQueries: ["muslim:705", "bukhari:1089"],
    category: "more_context_required",
    fiqhDomain: "prayer_combining",
  },
  {
    domain: "scholarly_disagreement_socks",
    terms: ["wiping over regular socks", "wiping over socks", "socks wudu", "regular socks wudu"],
    arabic: "المسح على الجوربين والمسح على الخفين",
    quranKeys: ["5:6"],
    hadithQueries: ["muslim:276"],
    category: "scholarly_disagreement",
    fiqhDomain: "wudu_purity",
  },
  {
    domain: "closeness_to_allah",
    terms: ["improve my relationship with allah", "drawing closer to allah", "draw closer to allah", "closeness to allah", "get closer to allah"],
    arabic: "التقرب إلى الله النوافل والفرائض محبة الله",
    quranKeys: ["2:186", "51:56"],
    hadithQueries: ["bukhari:6502", "nawawi40:38"],
    category: "general_guidance",
    fiqhDomain: "spiritual_growth",
  },
  {
    domain: "madhhab_jurisprudence",
    terms: ["follow a particular madhhab", "following a madhhab", "following a particular madhhab", "which madhhab", "following madhhab"],
    arabic: "التمذهب تقليد المذاهب الفقهية الأربعة",
    quranKeys: ["16:43"],
    hadithQueries: ["bukhari:7071"],
    category: "scholarly_disagreement",
    fiqhDomain: "madhhab_jurisprudence",
  },
  {
    domain: "doubt_prayer_performed",
    terms: ["forgot whether i performed a prayer", "forgot whether i prayed", "doubt whether i performed"],
    arabic: "الشك في أداء الصلاة اليقين لا يزول بالشك",
    quranKeys: ["2:286"],
    hadithQueries: ["muslim:1172"],
    category: "explicit_obligation",
    fiqhDomain: "prayer_doubt",
  },
  {
    domain: "family_marriage",
    terms: ["divorce", "custody", "talaq", "wife custody", "ex wife", "inheritance exclude", "writing my will exclude daughter"],
    arabic: "طلاق حضانة ميراث وصية",
    quranKeys: ["2:229", "4:11", "65:1"],
    hadithQueries: ["bukhari:2743", "abudawud:2276"],
    category: "scholarly_review_recommended",
    fiqhDomain: "family_marriage",
    requiresScholar: true,
  },
];

function escapeRegExp(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function termMatches(term, lower) {
  const termLower = term.toLowerCase().trim();
  if (termLower.includes(" ")) {
    const words = termLower.split(/\s+/);
    return words.every((w) =>
      new RegExp(`(^|[^a-z0-9])${escapeRegExp(w)}($|[^a-z0-9])`, "i").test(lower)
    );
  } else {
    if (new RegExp(`(^|[^a-z0-9])${escapeRegExp(termLower)}($|[^a-z0-9])`, "i").test(lower)) {
      return true;
    }
    if (termLower.length >= 6) {
      const stem = termLower.slice(0, 6);
      return new RegExp(`(^|[^a-z0-9])${escapeRegExp(stem)}[a-z]*($|[^a-z0-9])`, "i").test(lower);
    }
    return false;
  }
}

// ─── General-Purpose Scenario & Intent Analyzer ──────────────────────────────
export function analyzeUserQuery(query) {
  if (!query || typeof query !== "string") {
    return {
      cleanQuery: "",
      tokens: [],
      intentType: "guidance_inquiry",
      circumstances: {},
      scenarioDomain: "general",
      matchedConcepts: [],
      theologicalQueries: [],
      requiresScholar: false,
    };
  }

  const cleanQuery = query.trim();
  const lower = cleanQuery.toLowerCase();
  const tokens = lower.split(/[^a-z0-9\u0600-\u06FF]+/).filter((t) => t.length > 1);

  // 1. Identify Mitigating Circumstances & Real-World Facts
  const circumstances = {
    isEmergency: /\b(icu|nurse|doctor|paramedic|crashed|patient|resuscit|surgery|hospital|emergency|saving a life|save a life|life threatening|ambulance)\b/i.test(lower),
    isAccidental: /\b(accident|accidentally|unintentional|by mistake|swallowed|didn't mean|not on purpose|slipped|involuntary)\b/i.test(lower),
    isForgotten: /\b(forgot|forgotten|forget|forgetfully)\b/i.test(lower),
    isDementia: /\b(dementia|alzheimer|memory loss|elderly|grandmother|grandfather|confused|repeats prayer|loss of reason|keeps forgetting|forgetting she already|prayed dhuhr and wants to pray)\b/i.test(lower),
    isSleep: /\b(overslept|slept through|sleep|sleeping|woke up late|alarm|alarm failed|didn't wake up)\b/i.test(lower),
    isSchedule: /\b(college|university|lecture|class|exam|schedule|work shift|classes|campus|school)\b/i.test(lower),
    isIllness: /\b(cannot stand|knee pain|back pain|surgery|sitting|cannot bow|hospitalized|injury|sick|illness)\b/i.test(lower),
    isDuress: /\b(lost my job|cannot afford|starve|starving|forced|threatened|coerced|life danger)\b/i.test(lower),
    isRepeated: /\b(repeated|did it again|sinned again|fell into|relapsed|after repenting|again)\b/i.test(lower),
    isLostProperty: /\b(found|lost property|watch|wallet|money|bus seat|unclaimed|item on the street|luqatah|وجدت|ساعة|لقطة|ضائعة)\b/i.test(lower) || /وجدت|لقطة|ضائع/.test(cleanQuery),
    isCrossCultural: /\b(roommate|non-muslim|friend asked|why in arabic|why arabic|explaining to|different language)\b/i.test(lower),
    isPeerPressure: /\b(pressur|peer|friend wants me|coworker|insisting|friend asking me to)\b/i.test(lower),
    isDoubt: /\b(doubt|unsure|forgot whether|3 or 4|how many rak|waswas)\b/i.test(lower),
    isPastAction: /\b(i already|i did|i ate|i missed|i committed|yesterday|earlier)\b/i.test(lower),
  };

  // 2. Identify Intent Type
  let intentType = "guidance_inquiry";
  if (/\b(can i combine|combine prayers|combining prayers|combine salah)\b/i.test(cleanQuery)) {
    intentType = "more_context_required";
  } else if (
    /\b(halal|haram|permissible|allowed|forbidden|sin|prohibited|valid|broken|did i break)\b/i.test(cleanQuery) ||
    /حكم|حلال|حرام|جائز|مباح|محرم|صحيح|بطل/.test(cleanQuery)
  ) {
    intentType = "ruling_inquiry";
  } else if (/\b(obligatory|fard|wajib|must i|do i have to|required)\b/i.test(cleanQuery) || /واجب|فرض/.test(cleanQuery)) {
    intentType = "obligation_inquiry";
  } else if (/\b(mistake|sinned|i did|repent|tawbah|forgive|made mistake|guilt)\b/i.test(cleanQuery) || /توبة|استغفار|ذنبي|أذنبت/.test(cleanQuery)) {
    intentType = "repentance_rectification";
  } else if (/\b(differ|difference|opinion|madhhab|scholars say|schools|ikhtilaf)\b/i.test(cleanQuery) || /خلاف|مذاهب|أقوال/.test(cleanQuery)) {
    intentType = "scholarly_disagreement_inquiry";
  }

  // 3. Match Knowledge Ontology Concepts
  const matchedConcepts = [];
  const arNormQuery = normalizeArabic(cleanQuery);

  for (const concept of THEOLOGICAL_CONCEPTS) {
    let matchedSpecificity = 0;
    for (const term of concept.terms) {
      if (termMatches(term, lower)) {
        matchedSpecificity = Math.max(matchedSpecificity, term.length);
      }
    }
    if (concept.arabic) {
      const arWords = concept.arabic.split(/\s+/);
      for (const arWord of arWords) {
        const normAr = normalizeArabic(arWord);
        if (normAr.length >= 3 && arNormQuery.includes(normAr)) {
          matchedSpecificity = Math.max(matchedSpecificity, normAr.length * 3);
        }
      }
    }
    if (matchedSpecificity > 0) {
      matchedConcepts.push({ ...concept, specificity: matchedSpecificity });
    }
  }
  matchedConcepts.sort((a, b) => b.specificity - a.specificity);

  // 4. Determine Primary Scenario Domain
  let scenarioDomain = "general";
  if (matchedConcepts[0]) {
    scenarioDomain = matchedConcepts[0].domain || matchedConcepts[0].fiqhDomain;
  }
  if (circumstances.isEmergency) scenarioDomain = "medical_emergency_life";
  else if (circumstances.isDementia) scenarioDomain = "elder_dementia_memory";
  else if (circumstances.isAccidental && (lower.includes("fast") || lower.includes("ramadan") || lower.includes("water") || lower.includes("mouthwash")))
    scenarioDomain = "fasting_mistake";
  else if (circumstances.isLostProperty) scenarioDomain = "property_lost_luqatah";
  else if (circumstances.isCrossCultural) scenarioDomain = "cross_cultural_dawah";
  else if (matchedConcepts[0]?.domain === "exams_stress_salah") scenarioDomain = "exams_stress_salah";
  else if (matchedConcepts[0]?.domain === "qaza_backlog_plan") scenarioDomain = "qaza_backlog_plan";
  else if (matchedConcepts[0]?.domain === "guilt_past_sins") scenarioDomain = "guilt_past_sins";
  else if (matchedConcepts[0]?.domain === "prayer_combine_context") scenarioDomain = "prayer_combine_context";
  else if (matchedConcepts[0]?.domain === "scholarly_disagreement_socks") scenarioDomain = "scholarly_disagreement_socks";
  else if (matchedConcepts[0]?.domain === "closeness_to_allah") scenarioDomain = "closeness_to_allah";
  else if (matchedConcepts[0]?.domain === "madhhab_jurisprudence") scenarioDomain = "madhhab_jurisprudence";
  else if (matchedConcepts[0]?.domain === "doubt_prayer_performed") scenarioDomain = "doubt_prayer_performed";
  else if (circumstances.isSleep) scenarioDomain = "prayer_overslept";
  else if (circumstances.isSchedule) scenarioDomain = "prayer_schedule";
  else if (circumstances.isPeerPressure) scenarioDomain = "peer_pressure_integrity";
  else if (circumstances.isRepeated) scenarioDomain = "repentance_repeated";
  else if (circumstances.isDoubt) scenarioDomain = "prayer_doubts_sahw";
  else if (circumstances.isIllness) scenarioDomain = "prayer_illness_sitting";

  // 5. Generate Dynamic Theological Search Query Expansions
  const theologicalQueries = [];
  if (circumstances.isEmergency) {
    theologicalQueries.push("whoever saves a life", "saving a life", "intends for you ease", "5:32", "2:185", "delay prayer emergency");
  }
  if (circumstances.isDementia) {
    theologicalQueries.push("pen is lifted from three", "loss of reason", "does not burden a soul beyond", "2:286");
  }
  if (scenarioDomain === "fasting_mistake") {
    theologicalQueries.push("bukhari:1933", "muslim:1155", "forgets while fasting eats or drinks", "mistakes and forgetfulness", "2:286");
  }
  if (circumstances.isLostProperty) {
    theologicalQueries.push("bukhari:2427", "muslim:1722", "lost property luqatah", "announces for a year", "4:58");
  }
  if (circumstances.isCrossCultural) {
    theologicalQueries.push("quran in arabic", "12:2", "41:44", "14:4", "clear arabic");
  }
  if (circumstances.isSleep) {
    theologicalQueries.push("bukhari:583", "muslim:684", "sleeps through a prayer or forgets it", "20:14");
  }
  if (circumstances.isSchedule) {
    theologicalQueries.push("bukhari:517", "prayer at designated times", "4:103", "2:238", "combining prayers");
  }
  if (circumstances.isDoubt) {
    theologicalQueries.push("muslim:571", "bukhari:401", "doubt in prayer", "sajdah sahw");
  }
  if (circumstances.isIllness) {
    theologicalQueries.push("bukhari:1117", "pray standing if you cannot then sitting", "3:191");
  }
  if (scenarioDomain === "parents_ethics" || (circumstances.isRepeated && lower.includes("parent"))) {
    theologicalQueries.push("do not say to them uff", "17:23", "31:14", "bukhari:5743", "nawawi40:16");
  }
  if (scenarioDomain === "repentance_repeated") {
    theologicalQueries.push("39:53", "3:135", "nawawi40:42", "do not despair of the mercy of allah");
  }

  const requiresScholar =
    matchedConcepts.some((c) => c.requiresScholar) ||
    /\b(divorce|talaq|child custody|custody of|inherit|inheritance distribution|disinherit)\b/i.test(lower);

  return {
    cleanQuery,
    tokens,
    intentType,
    circumstances,
    scenarioDomain,
    matchedConcepts,
    theologicalQueries,
    requiresScholar,
  };
}

// ─── Multi-Turn Contextual Query Resolver ────────────────────────────────────
export function resolveContextualQuery(query, history = []) {
  if (!query || typeof query !== "string") return "";
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // Greetings, small talk, and general introductions are never follow-ups
  const isGreetingOrIntro = /^(hi|hello|hey|salam|salaam|assalam|assalamu|assalamu alaikum|good morning|good evening|who are you|what can you do|what are your capabilities|help|thanks|thank you|shukran|jazakallah|jazakallahu khair)\b/i.test(lower);
  if (isGreetingOrIntro) return clean;

  const isFollowUp =
    Array.isArray(history) &&
    history.length > 0 &&
    /\b(this|that|it|that verse|that hadith|already did it|my situation|same ruling|explain more|tell me more|what if|what should i do now|what next|what about|how to do it)\b/i.test(lower);

  if (!isFollowUp) return clean;

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === "assistant" && msg.answer) {
      const topic = msg.answer.categoryTitle || "";
      const direct = msg.answer.directAnswer || msg.answer.answer || "";
      const citations = (msg.answer.citations || []).map((c) => c.reference).join(" ");
      return `${clean} (context: ${topic} ${direct.slice(0, 80)} ${citations})`.trim();
    }
    if (msg.role === "user" && msg.content && msg.content !== clean) {
      return `${clean} (in relation to previous question: "${msg.content}")`.trim();
    }
  }

  return clean;
}

// ─── Irrelevant Scripture Filter ─────────────────────────────────────────────
// Discards coincidental, contextually inappropriate verses (e.g. infanticide/extreme punishment for civil/compassionate queries)
function isIrrelevantOrMismatchedVerse(verse, analysis) {
  if (!verse) return true;
  const key = verse.key || `${verse.surahId}:${verse.ayahId}`;

  // Surah 16:59 (pagan female infanticide) must never be returned for lost property or finding watches
  if (key === "16:59" && analysis.scenarioDomain === "property_lost_luqatah") return true;

  // Surah 54:16 (severe punishment on ancient tribes) must never be returned for dementia or elderly care
  if (key === "54:16" && (analysis.circumstances.isDementia || analysis.circumstances.isEmergency)) return true;

  // Surah 17:79 (Tahajjud prayer) should not take precedence over life-saving verses for emergency nurse
  if (key === "17:79" && analysis.circumstances.isEmergency) return true;

  return false;
}

// ─── Hybrid Scripture Retrieval Across Full Datasets ─────────────────────────
export async function retrieveEvidencePacket(query, history = [], userCoachingContext = null) {
  const resolvedQuery = resolveContextualQuery(query, history);
  const analysis = analyzeUserQuery(resolvedQuery);
  const isCoaching = isSalahCoachingQuery(query);
  const quranResults = [];
  const hadithResults = [];

  // 1. Direct Scripture Keys from Domain Concepts & Expansions
  for (const concept of analysis.matchedConcepts) {
    if (concept.quranKeys) {
      for (const key of concept.quranKeys) {
        const [sId, vId] = key.split(":");
        const verse = await getVerse(sId, vId);
        if (verse && !quranResults.some((q) => q.key === verse.key)) {
          quranResults.push({
            ...verse,
            matchScore: 95,
            sourceReason: `Canonical scriptural foundation for ${concept.fiqhDomain || concept.domain}`,
            relevance: `Provides theological principle for ${concept.fiqhDomain || concept.domain}`,
          });
        }
      }
    }

    if (concept.hadithQueries) {
      for (const hQ of concept.hadithQueries) {
        if (hQ.includes(":")) {
          const [bKey, id] = hQ.split(":");
          const hadith = await getHadithById(bKey, id);
          if (hadith && !hadithResults.some((h) => h.id === hadith.id && h.bookKey === hadith.bookKey)) {
            hadithResults.push({
              ...hadith,
              matchScore: 95,
              sourceReason: `Canonical narration on ${concept.fiqhDomain || concept.domain}`,
              relevance: `Authentic prophetic precedent regarding ${concept.fiqhDomain || concept.domain}`,
            });
          }
        }
      }
    }
  }

  // 2. Query Expanded Scripture Retrievals
  for (const expQ of analysis.theologicalQueries) {
    if (expQ.includes(":")) {
      if (/^\d{1,3}:\d{1,3}$/.test(expQ)) {
        const [sId, vId] = expQ.split(":");
        const verse = await getVerse(sId, vId);
        if (verse && !quranResults.some((q) => q.key === verse.key)) {
          quranResults.push({
            ...verse,
            matchScore: 98,
            sourceReason: `Direct canonical verse for ${analysis.scenarioDomain}`,
            relevance: `Establishes core principle for ${analysis.scenarioDomain}`,
          });
        }
      } else {
        const [bKey, id] = expQ.split(":");
        const hadith = await getHadithById(bKey, id);
        if (hadith && !hadithResults.some((h) => h.id === hadith.id && h.bookKey === hadith.bookKey)) {
          hadithResults.push({
            ...hadith,
            matchScore: 98,
            sourceReason: `Direct prophetic narration for ${analysis.scenarioDomain}`,
            relevance: `Prophetic guidance establishing ruling for ${analysis.scenarioDomain}`,
          });
        }
      }
    } else {
      // Search Quran with expanded query
      const qMatches = await searchQuran(expQ, 3);
      for (const q of qMatches) {
        if (!quranResults.some((existing) => existing.key === q.key) && !isIrrelevantOrMismatchedVerse(q, analysis)) {
          quranResults.push({ ...q, matchScore: Math.max(q.matchScore || 0, 85) });
        }
      }
      // Search Hadith with expanded query
      const hMatches = await searchHadiths(expQ, 3);
      for (const h of hMatches) {
        if (!hadithResults.some((existing) => existing.id === h.id && existing.bookKey === h.bookKey)) {
          hadithResults.push({ ...h, matchScore: Math.max(h.matchScore || 0, 85) });
        }
      }
    }
  }

  // 3. Dynamic Text Search with User Query
  const dynamicQuran = await searchQuran(analysis.cleanQuery, 5);
  for (const q of dynamicQuran) {
    if (!quranResults.some((existing) => existing.key === q.key) && !isIrrelevantOrMismatchedVerse(q, analysis)) {
      quranResults.push(q);
    }
  }

  const dynamicHadith = await searchHadiths(analysis.cleanQuery, 5, { allCollections: true });
  for (const h of dynamicHadith) {
    if (!hadithResults.some((existing) => existing.id === h.id && existing.bookKey === h.bookKey)) {
      hadithResults.push(h);
    }
  }

  // Limit to top 5 most relevant each
  const topQuran = quranResults.slice(0, 5);
  const topHadith = hadithResults.slice(0, 5);
  const totalEvidenceCount = topQuran.length + topHadith.length;

  // 4. Evaluate Evidence Sufficiency & Out-of-Scope Limits
  const lowerQ = analysis.cleanQuery.toLowerCase();
  const outOfScopeTokens = [
    "bitcoin",
    "crypto",
    "cryptocurrency",
    "blockchain",
    "ethereum",
    "solana",
    "yield farm",
    "liquidity pool",
    "staking",
    "quantum entanglement",
    "reproductive cloning",
    "alien",
    "extraterrestrial",
    "mars colonization",
  ];
  const isModernOutOfScope = outOfScopeTokens.some((tok) => lowerQ.includes(tok));

  let sufficiency = "sufficient";
  if (isModernOutOfScope) {
    sufficiency = "insufficient";
  } else if (analysis.requiresScholar) {
    sufficiency = "scholar_escalation";
  } else if (totalEvidenceCount === 0) {
    sufficiency = "insufficient";
  }

  return {
    analysis,
    quranEvidence: topQuran,
    hadithEvidence: topHadith,
    sufficiency,
    totalEvidenceCount,
    isCoachingQuery: isCoaching,
    coachingContext: userCoachingContext,
  };
}

// ─── Format Evidence Packet for Grounded Language Model ──────────────────────
export function formatEvidencePacketXML(packet) {
  let xml = `<evidence_packet query="${escapeXml(packet.analysis.cleanQuery)}" scenario_domain="${escapeXml(packet.analysis.scenarioDomain)}">\n`;

  xml += `  <scenario_context>\n`;
  xml += `    <domain>${escapeXml(packet.analysis.scenarioDomain)}</domain>\n`;
  xml += `    <intent_type>${escapeXml(packet.analysis.intentType)}</intent_type>\n`;
  xml += `    <circumstances>\n`;
  for (const [k, v] of Object.entries(packet.analysis.circumstances || {})) {
    if (v) xml += `      <circumstance type="${k}">true</circumstance>\n`;
  }
  xml += `    </circumstances>\n`;
  xml += `  </scenario_context>\n`;

  xml += `  <quran_evidence count="${packet.quranEvidence.length}">\n`;
  for (const q of packet.quranEvidence) {
    xml += `    <ayah key="${q.key}" surah_id="${q.surahId}" ayah_id="${q.ayahId}" surah_name="${escapeXml(q.surahName)}" surah_ar="${escapeXml(q.surahArabic)}">\n`;
    xml += `      <arabic>${escapeXml(q.text)}</arabic>\n`;
    xml += `      <translation>${escapeXml(q.translation)}</translation>\n`;
    if (q.relevance || q.sourceReason) xml += `      <relevance>${escapeXml(q.relevance || q.sourceReason)}</relevance>\n`;
    xml += `    </ayah>\n`;
  }
  xml += `  </quran_evidence>\n`;

  xml += `  <hadith_evidence count="${packet.hadithEvidence.length}">\n`;
  for (const h of packet.hadithEvidence) {
    xml += `    <hadith collection="${escapeXml(h.bookKey)}" id="${h.idInBook || h.id}" collection_title="${escapeXml(h.collectionName || h.bookTitle)}">\n`;
    if (h.arabic) xml += `      <arabic>${escapeXml(h.arabic)}</arabic>\n`;
    if (h.narrator) xml += `      <narrator>${escapeXml(h.narrator)}</narrator>\n`;
    xml += `      <translation>${escapeXml(h.english)}</translation>\n`;
    if (h.relevance || h.sourceReason) xml += `      <relevance>${escapeXml(h.relevance || h.sourceReason)}</relevance>\n`;
    xml += `    </hadith>\n`;
  }
  xml += `  </hadith_evidence>\n`;

  xml += `</evidence_packet>`;
  return xml;
}

function escapeXml(unsafe) {
  if (!unsafe || typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
