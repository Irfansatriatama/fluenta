"use server";

import Anthropic from "@anthropic-ai/sdk";

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
  aiPowered: boolean; // false when ANTHROPIC_API_KEY is absent (fallback)
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer" },
    correct: { type: "boolean" },
    comment: { type: "string" },
    corrections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          original: { type: "string" },
          suggestion: { type: "string" },
          note: { type: "string" },
        },
        required: ["original", "suggestion", "note"],
      },
    },
    tips: { type: "array", items: { type: "string" } },
  },
  required: ["score", "correct", "comment", "corrections", "tips"],
};

// Grades a short writing exercise with Claude. Falls back gracefully to a
// non-AI acknowledgement when ANTHROPIC_API_KEY is not configured.
export async function gradeWriting(input: {
  languageName: string;
  prompt: string;
  answer: string;
  sample?: string;
}): Promise<WritingFeedback> {
  const answer = input.answer.trim();

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      score: answer.length > 0 ? 7 : 0,
      correct: answer.length > 0,
      comment: "Nice work! (AI grading is not configured yet — add ANTHROPIC_API_KEY for detailed feedback.)",
      corrections: [],
      tips: input.sample ? [`Compare with a sample: ${input.sample}`] : [],
      aiPowered: false,
    };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      thinking: { type: "adaptive" },
      system:
        "You are a warm, encouraging language tutor. Grade a beginner's short writing exercise. " +
        "Be supportive and specific. Score 0–10. Mark 'correct' true if the attempt is understandable and on-task, " +
        "even with small errors. List concrete corrections (original phrase -> suggestion, with a short note) and " +
        "2–3 improvement tips. Keep the comment to one or two sentences.",
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
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const text = response.content.find((b) => b.type === "text");
    const parsed = JSON.parse(text && "text" in text ? text.text : "{}") as Omit<
      WritingFeedback,
      "aiPowered"
    >;
    return { ...parsed, aiPowered: true };
  } catch {
    return {
      score: answer.length > 0 ? 7 : 0,
      correct: answer.length > 0,
      comment: "Saved your answer. (AI feedback is temporarily unavailable — please try again later.)",
      corrections: [],
      tips: input.sample ? [`Compare with a sample: ${input.sample}`] : [],
      aiPowered: false,
    };
  }
}

export type ChatTurn = { role: "user" | "assistant"; text: string };

// AI tutor reply. Replies in the target language with a short English gloss.
// Falls back to a helpful canned message when ANTHROPIC_API_KEY is absent.
export async function tutorReply(input: {
  languageName: string;
  history: ChatTurn[];
}): Promise<{ text: string; aiPowered: boolean }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      text: `I'd love to help you with ${input.languageName}! (Live AI tutoring turns on once ANTHROPIC_API_KEY is set.)`,
      aiPowered: false,
    };
  }

  // The Messages API must start with a user turn — drop any leading greeting.
  let start = 0;
  while (start < input.history.length && input.history[start].role !== "user") start += 1;
  const turns = input.history.slice(start);
  if (turns.length === 0) return { text: "Ask me anything!", aiPowered: true };

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 900,
      thinking: { type: "adaptive" },
      system:
        `You are a warm, patient ${input.languageName} tutor for a beginner. ` +
        `Reply primarily in ${input.languageName} using simple language, then give a short English ` +
        `translation on a new line. Keep replies to 1–3 short sentences. When explaining grammar, ` +
        `give one concrete example. Never use emoji.`,
      messages: turns.map((t) => ({ role: t.role, content: t.text })),
    });
    const block = response.content.find((b) => b.type === "text");
    return { text: block && "text" in block ? block.text : "…", aiPowered: true };
  } catch {
    return {
      text: "Sorry, I couldn't respond just now — please try again.",
      aiPowered: false,
    };
  }
}
