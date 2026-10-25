import test from "node:test";
import assert from "node:assert/strict";
import { classifyPrompt, PROMPT_CATEGORIES } from "../src/lib/promptActivityClassifier.js";
import { extractStreamingAnswer } from "../src/lib/geminiClient.js";

test("Prompt Activity Classifier Tests", async (t) => {
  await t.test("Test 1: Code and programming prompt classification", () => {
    const res = classifyPrompt("Can you write a python function to binary search an array?");
    assert.equal(res.category, PROMPT_CATEGORIES.CODE);
    assert.equal(res.categoryTitle, "Code & Programming");
    assert.equal(res.phases[0].label, "Analyzing the problem…");
    assert.equal(res.phases[1].label, "Working through the solution…");
    assert.equal(res.phases[2].label, "Preparing the code…");
    assert.equal(res.phases[3].label, "Formatting the explanation…");
  });

  await t.test("Test 2: Essay and writing prompt classification", () => {
    const res = classifyPrompt("Write a detailed essay on the historical impact of the printing press.");
    assert.equal(res.category, PROMPT_CATEGORIES.WRITING);
    assert.equal(res.categoryTitle, "Writing & Composition");
    assert.equal(res.phases[0].label, "Understanding your topic…");
    assert.equal(res.phases[1].label, "Organizing the key ideas…");
    assert.equal(res.phases[2].label, "Drafting your response…");
    assert.equal(res.phases[3].label, "Polishing the final answer…");
  });

  await t.test("Test 3: Mathematical and analytical prompt classification", () => {
    const res = classifyPrompt("Solve the equation 3x^2 - 12x + 9 = 0 and calculate its roots.");
    assert.equal(res.category, PROMPT_CATEGORIES.MATH);
    assert.equal(res.categoryTitle, "Mathematical Analysis");
    assert.equal(res.phases[0].label, "Breaking down the problem…");
    assert.equal(res.phases[1].label, "Working through the calculation…");
    assert.equal(res.phases[2].label, "Preparing the explanation…");
  });

  await t.test("Test 4: Islamic and Sacred Fiqh prompt classification", () => {
    const res = classifyPrompt("I overslept and missed Fajr prayer. What is the authentic Sunnah sequence to make it up with Dhuhr?");
    assert.equal(res.category, PROMPT_CATEGORIES.FIQH_ISLAMIC);
    assert.equal(res.categoryTitle, "Sacred Fiqh & Guidance");
    assert.equal(res.phases[0].label, "Understanding your scenario…");
    assert.equal(res.phases[1].label, "Retrieving verified Quran & Hadith citations…");
    assert.equal(res.phases[2].label, "Synthesizing evidence-based guidance…");
    assert.equal(res.phases[3].label, "Formulating responsible answer…");
  });

  await t.test("Test 5: Quick definition prompt classification", () => {
    const res = classifyPrompt("What is photosynthesis?");
    assert.equal(res.category, PROMPT_CATEGORIES.DEFINITION);
    assert.equal(res.categoryTitle, "Quick Definition");
    assert.equal(res.isQuick, true);
    assert.equal(res.phases.length, 2);
    assert.equal(res.phases[0].label, "Understanding your question…");
    assert.equal(res.phases[1].label, "Composing your answer…");
  });

  await t.test("Test 6: Complex multi-part query classification", () => {
    const longPrompt = "Please provide a comprehensive analysis and compare and contrast the economic models of classical mercantilism versus modern Keynesian fiscal stimulus, breaking down the pros and cons of each.";
    const res = classifyPrompt(longPrompt);
    assert.equal(res.category, PROMPT_CATEGORIES.COMPLEX);
    assert.equal(res.phases[0].label, "Analyzing your request…");
    assert.equal(res.phases[1].label, "Organizing the response…");
    assert.equal(res.phases[2].label, "Composing the main sections…");
    assert.equal(res.phases[3].label, "Reviewing the answer…");
  });

  await t.test("Test 7: General question default classification", () => {
    const res = classifyPrompt("Why is the sky blue?");
    assert.equal(res.category, PROMPT_CATEGORIES.GENERAL);
    assert.equal(res.phases[0].label, "Understanding your question…");
    assert.equal(res.phases[1].label, "Putting the answer together…");
    assert.equal(res.phases[2].label, "Drafting your response…");
    assert.equal(res.phases[3].label, "Finalizing the response…");
  });
});

test("Real-Time Streaming Text Extractor Tests", async (t) => {
  await t.test("Test 8: Extract partial answer during streaming JSON", () => {
    const partialJson = '{"category": "explicit_obligation", "answer": "You should make up the prayer as soon as you remember it.';
    const text = extractStreamingAnswer(partialJson);
    assert.equal(text, "You should make up the prayer as soon as you remember it.");
  });

  await t.test("Test 9: Extract answer and explanation when streaming has reached both", () => {
    const fullJson = '{"category": "explicit_obligation", "answer": "You should make up the prayer.", "scenarioApplication": "Since you overslept without negligence, there is no sin, but the obligation remains."}';
    const text = extractStreamingAnswer(fullJson);
    assert.equal(
      text,
      "You should make up the prayer.\n\nSince you overslept without negligence, there is no sin, but the obligation remains."
    );
  });

  await t.test("Test 10: Handle plain markdown fallback text", () => {
    const markdown = "Here is the guidance:\n- First perform wudu\n- Then pray Fajr";
    const text = extractStreamingAnswer(markdown);
    assert.equal(text, markdown);
  });

  await t.test("Test 11: Handle escaped characters in JSON answer string", () => {
    const escapedJson = '{"answer": "The Prophet (ﷺ) said: \\"Whoever sleeps through a prayer...\\"\\nPerform it when remembered."}';
    const text = extractStreamingAnswer(escapedJson);
    assert.equal(text, 'The Prophet (ﷺ) said: "Whoever sleeps through a prayer..."\nPerform it when remembered.');
  });
});
