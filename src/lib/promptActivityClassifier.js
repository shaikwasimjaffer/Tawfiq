/**
 * Prompt Activity Classifier for Tabaka / Tawfiq AI
 * Maps user queries to contextual, meaningful activity states and progress phases.
 * Ensures the response-generation experience feels intelligent, alive, and transparent.
 */

export const PROMPT_CATEGORIES = {
  FIQH_ISLAMIC: "fiqh_islamic",
  CODE: "code",
  WRITING: "writing",
  MATH: "math",
  DEFINITION: "definition",
  COMPLEX: "complex",
  GENERAL: "general",
};

/**
 * Classifies a user's prompt text into a category with appropriate contextual activity phases.
 * @param {string} text - User prompt text
 * @returns {Object} Classified category metadata with tailored activity phases
 */
export function classifyPrompt(text) {
  if (!text || typeof text !== "string") {
    return getDefaultActivityConfig(PROMPT_CATEGORIES.GENERAL);
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const wordCount = clean.split(/\s+/).length;

  // 1. Programming & Code Detection
  const isCode =
    /```|`[^`]+`/.test(clean) ||
    /\b(code|function|def\s+|const\s+|let\s+|var\s+|class\s+|import\s+|export\s+|debug|error|exception|syntax|stack trace|algorithm|react|vue|node|npm|sql|python|javascript|typescript|c\+\+|java|html|css|json|api|endpoint|git|github|regex|loop|array|pointer|compiler)\b/i.test(lower) ||
    /\b(fix this (code|bug|error)|write a (script|function|program|class)|implement an algorithm)\b/i.test(lower);

  if (isCode) {
    return {
      category: PROMPT_CATEGORIES.CODE,
      categoryTitle: "Code & Programming",
      icon: "code",
      isQuick: false,
      phases: [
        { id: "analyzing", label: "Analyzing the problem…", shortLabel: "Analyzing…" },
        { id: "processing", label: "Working through the solution…", shortLabel: "Solving…" },
        { id: "drafting", label: "Preparing the code…", shortLabel: "Coding…" },
        { id: "finalizing", label: "Formatting the explanation…", shortLabel: "Finalizing…" },
      ],
    };
  }

  // 2. Math & Analytical Detection
  const isMath =
    /\b(calculate|solve|equation|integral|derivative|algebra|arithmetic|formula|fraction|probability|matrix|trigonometry|logarithm|statistics|variance|deviation|sum of|solve for x|evaluate the expression)\b/i.test(lower) ||
    /\d+\s*[\+\-\*\/^=]\s*\d+/.test(clean) ||
    /\b\d+\s*%\s*(of|off)\b/i.test(lower);

  if (isMath) {
    return {
      category: PROMPT_CATEGORIES.MATH,
      categoryTitle: "Mathematical Analysis",
      icon: "calculator",
      isQuick: wordCount < 15,
      phases: [
        { id: "analyzing", label: "Breaking down the problem…", shortLabel: "Analyzing…" },
        { id: "processing", label: "Working through the calculation…", shortLabel: "Calculating…" },
        { id: "drafting", label: "Preparing the explanation…", shortLabel: "Explaining…" },
        { id: "finalizing", label: "Checking the solution…", shortLabel: "Checking…" },
      ],
    };
  }

  // 3. Essay & Writing Detection
  const isWriting =
    /\b(essay|write an essay|draft a letter|cover letter|speech|write an email|blog post|article|poem|poetry|story|creative writing|write a paragraph|narrative|dialogue|script|compose a)\b/i.test(lower) ||
    /\b(write (about|on)|rewrite|paraphrase|summarize the following in detail)\b/i.test(lower);

  if (isWriting) {
    return {
      category: PROMPT_CATEGORIES.WRITING,
      categoryTitle: "Writing & Composition",
      icon: "pen",
      isQuick: false,
      phases: [
        { id: "analyzing", label: "Understanding your topic…", shortLabel: "Reviewing topic…" },
        { id: "processing", label: "Organizing the key ideas…", shortLabel: "Outlining…" },
        { id: "drafting", label: "Drafting your response…", shortLabel: "Drafting…" },
        { id: "finalizing", label: "Polishing the final answer…", shortLabel: "Polishing…" },
      ],
    };
  }

  // 4. Islamic Scripture, Fiqh, Prayer & Spiritual Guidance (Core Domain)
  const isIslamic =
    /\b(salah|prayer|prayers|fajr|dhuhr|asr|maghrib|isha|tahajjud|wudu|ghusl|quran|hadith|surah|ayah|sunnah|qaza|taharah|fasting|sawm|ramadan|iftar|suhoor|halal|haram|makruh|mustahabb|zakat|sadaqah|nikah|talaq|tawbah|sin|repentance|istikhara|dhikr|dua|bukhari|muslim|fiqh|shariah|ruling|islamic|prophet|allah|kaaba|makkah|madinah|masjid|rakah|prostration|sujood|tayammum|adhan|scholar|fatwa)\b/i.test(lower) ||
    /\b(missed (fajr|prayer|salah)|how to make up|can i pray|is it permissible|ruling on)\b/i.test(lower);

  if (isIslamic) {
    return {
      category: PROMPT_CATEGORIES.FIQH_ISLAMIC,
      categoryTitle: "Sacred Fiqh & Guidance",
      icon: "book",
      isQuick: false,
      phases: [
        { id: "analyzing", label: "Understanding your scenario…", shortLabel: "Understanding…" },
        { id: "processing", label: "Retrieving verified Quran & Hadith citations…", shortLabel: "Searching scripture…" },
        { id: "synthesizing", label: "Synthesizing evidence-based guidance…", shortLabel: "Reasoning…" },
        { id: "drafting", label: "Formulating responsible answer…", shortLabel: "Composing…" },
      ],
    };
  }

  // 5. Short Definition & Quick Fact Queries
  const isDefinition =
    wordCount <= 8 &&
    /\b(what is|what's|define|definition of|meaning of|who was|who is|synonym of|how do you say|translate)\b/i.test(lower);

  if (isDefinition) {
    return {
      category: PROMPT_CATEGORIES.DEFINITION,
      categoryTitle: "Quick Definition",
      icon: "sparkles",
      isQuick: true,
      phases: [
        { id: "analyzing", label: "Understanding your question…", shortLabel: "Reviewing…" },
        { id: "drafting", label: "Composing your answer…", shortLabel: "Drafting…" },
      ],
    };
  }

  // 6. Long-form / Complex Multi-part Requests
  const isComplex =
    wordCount > 35 ||
    /\b(compare and contrast|in depth|detailed breakdown|pros and cons|step by step guide|comprehensive analysis|multiple perspectives)\b/i.test(lower) ||
    (/\b(first|second|also|furthermore)\b/i.test(lower) && clean.includes("?"));

  if (isComplex) {
    return {
      category: PROMPT_CATEGORIES.COMPLEX,
      categoryTitle: "Deep Analysis",
      icon: "compass",
      isQuick: false,
      phases: [
        { id: "analyzing", label: "Analyzing your request…", shortLabel: "Analyzing…" },
        { id: "processing", label: "Organizing the response…", shortLabel: "Structuring…" },
        { id: "drafting", label: "Composing the main sections…", shortLabel: "Composing…" },
        { id: "finalizing", label: "Reviewing the answer…", shortLabel: "Reviewing…" },
      ],
    };
  }

  // 7. General Questions (Default Fallback)
  return getDefaultActivityConfig(PROMPT_CATEGORIES.GENERAL);
}

function getDefaultActivityConfig(category) {
  return {
    category,
    categoryTitle: "General Inquiry",
    icon: "sparkles",
    isQuick: false,
    phases: [
      { id: "analyzing", label: "Understanding your question…", shortLabel: "Understanding…" },
      { id: "processing", label: "Putting the answer together…", shortLabel: "Synthesizing…" },
      { id: "drafting", label: "Drafting your response…", shortLabel: "Drafting…" },
      { id: "finalizing", label: "Finalizing the response…", shortLabel: "Finalizing…" },
    ],
  };
}
