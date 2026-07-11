"use server";

import { unstable_cache } from "next/cache";
import { aiChat, isAiConfigured, parseJson } from "@/lib/ai";
import { getNewsArticle } from "@/lib/news";

export type NewsExercise = {
  easy: { jp: string; en: string }[];
  vocab: { word: string; reading: string; meaning: string }[];
  questions: { q: string; options: string[]; answer: number; explanation: string }[];
};

const SHAPE =
  'Return ONLY a JSON object: { "easy": [ { "jp": string, "en": string } ] ' +
  '(4-6 short sentences that summarize the article in simple, correct Japanese, ~JLPT N4-N3), ' +
  '"vocab": [ { "word": string, "reading": string, "meaning": string } ] (5-7 key words), ' +
  '"questions": [ { "q": string (in Japanese), "options": [4 strings], "answer": integer (0-based), "explanation": string } ] (3 questions) }';

// Generate + cache a lesson for one article (a week; content is static).
const generate = unstable_cache(
  async (pageid: number): Promise<NewsExercise | null> => {
    const article = await getNewsArticle(pageid);
    if (!article) return null;
    const source = article.extract.slice(0, 1400);
    try {
      const text = await aiChat({
        json: true,
        maxTokens: 2500,
        system:
          "You turn a real Japanese news article into a graded reading lesson for learners. " +
          "Rewrite the key points in simple, correct Japanese (do not copy the original wording), " +
          "add furigana readings, key vocabulary, and comprehension questions. Never use emoji. " +
          SHAPE,
        messages: [{ role: "user", content: `Title: ${article.title}\n\nArticle:\n${source}` }],
      });
      return parseJson<NewsExercise>(text);
    } catch {
      return null;
    }
  },
  ["news-exercise"],
  { revalidate: 604800 },
);

export async function buildNewsExercise(
  pageid: number,
): Promise<{ available: boolean; exercise: NewsExercise | null }> {
  if (!isAiConfigured()) return { available: false, exercise: null };
  const exercise = await generate(pageid);
  return { available: true, exercise };
}
