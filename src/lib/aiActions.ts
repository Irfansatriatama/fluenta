"use server";

import { aiChat, isAiConfigured, parseJson } from "@/lib/ai";

export type WritingCorrection = {
  original: string;
  suggestion: string;
  note: string;
};

export type WritingFeedback = {
  score: number; // 0–10
  correct: boolean; // acceptable attempt?
  comment: string;
  corrections: WritingCorrection[];
  tips: string[];
  aiPowered: boolean; // false when no AI provider is configured (fallback)
};

// Grades a short writing exercise with the configured AI provider. Falls back
// gracefully to a non-AI acknowledgement when no provider key is set.
export async function gradeWriting(input: {
  languageName: string;
  prompt: string;
  answer: string;
  sample?: string;
}): Promise<WritingFeedback> {
  const answer = input.answer.trim();

  const fallback = (comment: string): WritingFeedback => ({
    score: answer.length > 0 ? 7 : 0,
    correct: answer.length > 0,
    comment,
    corrections: [],
    tips: input.sample ? [`Compare with a sample: ${input.sample}`] : [],
    aiPowered: false,
  });

  if (!isAiConfigured()) {
    return fallback("Nice work! (AI grading is not configured yet — add a GROQ_API_KEY for detailed feedback.)");
  }

  try {
    const text = await aiChat({
      system:
        "You are a warm, encouraging language tutor. Grade a beginner's short writing exercise. " +
        "Be supportive and specific. Return ONLY a JSON object with these keys: " +
        '"score" (integer 0-10), "correct" (boolean — true if the attempt is understandable and on-task, ' +
        'even with small errors), "comment" (one or two sentences), "corrections" (array of ' +
        '{"original","suggestion","note"}), and "tips" (array of 2-3 short strings).',
      json: true,
      maxTokens: 1500,
      messages: [
        {
          role: "user",
          content:
            `Language: ${input.languageName}\n` +
            `Task: ${input.prompt}\n` +
            `Learner's answer: ${answer || "(empty)"}\n` +
            (input.sample ? `A sample answer: ${input.sample}\n` : ""),
        },
      ],
    });
    const parsed = parseJson<Omit<WritingFeedback, "aiPowered">>(text);
    return { ...parsed, aiPowered: true };
  } catch {
    return fallback("Saved your answer. (AI feedback is temporarily unavailable — please try again later.)");
  }
}

export type ChatTurn = { role: "user" | "assistant"; text: string };

// AI tutor reply. Replies in the target language with a short English gloss.
// Falls back to a helpful canned message when no AI provider is configured.
export async function tutorReply(input: {
  languageName: string;
  history: ChatTurn[];
}): Promise<{ text: string; aiPowered: boolean }> {
  if (!isAiConfigured()) {
    return {
      text: `I'd love to help you with ${input.languageName}! (Live AI tutoring turns on once an AI key, e.g. GROQ_API_KEY, is set.)`,
      aiPowered: false,
    };
  }

  // The conversation must start with a user turn — drop any leading greeting.
  let start = 0;
  while (start < input.history.length && input.history[start].role !== "user") start += 1;
  const turns = input.history.slice(start);
  if (turns.length === 0) return { text: "Ask me anything!", aiPowered: true };

  try {
    const text = await aiChat({
      system:
        `You are a warm, patient ${input.languageName} tutor for a beginner. ` +
        `Reply primarily in ${input.languageName} using simple language, then give a short English ` +
        `translation on a new line. Keep replies to 1–3 short sentences. When explaining grammar, ` +
        `give one concrete example. Never use emoji.`,
      maxTokens: 900,
      messages: turns.map((t) => ({ role: t.role, content: t.text })),
    });
    return { text: text || "…", aiPowered: true };
  } catch {
    return { text: "Sorry, I couldn't respond just now — please try again.", aiPowered: false };
  }
}
