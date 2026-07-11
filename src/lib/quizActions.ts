"use server";

import { aiChat, isAiConfigured, parseJson } from "@/lib/ai";

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  skill?: string;
};

const FOCUS_HINT: Record<string, string> = {
  mixed: "a varied mix of vocabulary, grammar, and short reading comprehension",
  vocab: "vocabulary meaning and usage",
  grammar: "grammar points and correct particle/form usage",
  reading: "very short (1-2 sentence) reading comprehension",
};

const JP_SCRIPT = /[぀-ヿ㐀-龯ｦ-ﾟ]/; // kana or kanji

function valid(q: unknown): q is QuizQuestion {
  const o = q as QuizQuestion;
  if (
    !o ||
    typeof o.q !== "string" ||
    o.q.trim().length === 0 ||
    !Array.isArray(o.options) ||
    o.options.length !== 4 ||
    !o.options.every((x) => typeof x === "string" && x.trim().length > 0) ||
    !Number.isInteger(o.answer) ||
    o.answer < 0 ||
    o.answer > 3
  ) {
    return false;
  }
  // Reject broken/duplicate options.
  const uniq = new Set(o.options.map((x) => x.trim()));
  return uniq.size === 4;
}

// For Japanese, a real question must actually contain Japanese script somewhere
// (drops romaji-only questions and ones with empty/placeholder words).
function hasJapanese(q: QuizQuestion): boolean {
  return JP_SCRIPT.test(q.q) || q.options.some((o) => JP_SCRIPT.test(o));
}

// Accuracy pass: a strict examiner re-checks each question and drops or fixes
// any that are wrong. Errors in a learning app cascade, so we verify before use.
async function verify(
  languageName: string,
  level: string,
  questions: QuizQuestion[],
): Promise<QuizQuestion[]> {
  if (questions.length === 0) return [];
  try {
    const text = await aiChat({
      json: true,
      maxTokens: 2600,
      system:
        `You are a strict ${languageName} (JLPT ${level}) examiner reviewing quiz questions for a learner. ` +
        `For EACH question verify: the ${languageName} is correct and natural; the question is unambiguous; ` +
        `EXACTLY ONE option is correct; and the "answer" index points to that correct option. ` +
        `Correct the "answer" index if it is wrong. DROP any question that has an error, is ambiguous, or has ` +
        `zero or multiple correct options. Do not invent new questions. ` +
        'Return ONLY JSON: { "questions": [ ...the kept and corrected questions, same shape... ] }',
      messages: [{ role: "user", content: JSON.stringify({ level, questions }) }],
    });
    const body = parseJson<{ questions: unknown[] }>(text);
    return (body.questions ?? []).filter(valid);
  } catch {
    // If verification fails, fall back to the strongly-validated raw set.
    return questions;
  }
}

// Generate a fresh, verified quiz each call (no cache — variety is the point).
export async function generateQuiz(input: {
  languageName: string;
  level: string;
  focus: string;
  count?: number;
}): Promise<{ available: boolean; questions: QuizQuestion[] }> {
  if (!isAiConfigured()) return { available: false, questions: [] };
  const count = Math.min(10, Math.max(4, input.count ?? 8));
  const focus = FOCUS_HINT[input.focus] ?? FOCUS_HINT.mixed;

  try {
    // Over-generate so the verification pass can drop weak items and still hit count.
    const text = await aiChat({
      json: true,
      maxTokens: 3000,
      system:
        `You write ${input.languageName} quiz questions for a learner at JLPT-style level ${input.level}. ` +
        `Create ${count + 4} DISTINCT multiple-choice questions focused on ${focus}. ` +
        `Each question must be answerable and have EXACTLY ONE correct option; the other three must be clearly wrong. ` +
        `Write all Japanese in real script (hiragana/katakana/kanji at the level) — NOT romaji. ` +
        `Never leave a word blank or use empty placeholders; every question must contain the actual Japanese it asks about. ` +
        `Keep language at the level, natural and correct. Double-check every answer. Never use emoji. ` +
        'Return ONLY a JSON object: { "questions": [ { "q": string (the question, containing the Japanese it is about; ' +
        `the instruction may be in English), "options": [4 strings], "answer": integer 0-3, ` +
        '"explanation": string (short), "skill": "vocab"|"grammar"|"reading" } ] }',
      messages: [{ role: "user", content: `Generate ${count + 4} fresh ${input.level} questions in Japanese script. Vary the topics.` }],
    });
    const body = parseJson<{ questions: unknown[] }>(text);
    let raw = (body.questions ?? []).filter(valid);
    if (input.languageName === "Japanese") raw = raw.filter(hasJapanese);
    const verified = await verify(input.languageName, input.level, raw);
    const final = input.languageName === "Japanese" ? verified.filter(hasJapanese) : verified;
    return { available: true, questions: final.slice(0, count) };
  } catch {
    return { available: true, questions: [] };
  }
}
