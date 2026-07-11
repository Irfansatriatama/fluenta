/**
 * Provider-agnostic AI client. Picks whichever provider has a key configured,
 * so the app's AI features (tutor, writing feedback, content generators) work
 * with a free Groq key, Google Gemini, OpenAI, or Anthropic — no code changes.
 *
 * Preference order (first key found wins): GROQ → GEMINI → OPENAI → ANTHROPIC.
 * Override the model per provider with AI_MODEL.
 *
 * Groq is the default recommendation: free tier, fast, OpenAI-compatible.
 * Get a key at https://console.groq.com/keys and set GROQ_API_KEY.
 */
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type Provider = "groq" | "gemini" | "openai" | "anthropic";

type OpenAICompat = { baseURL?: string; envKey: string; model: string };

const OPENAI_COMPAT: Record<Exclude<Provider, "anthropic">, OpenAICompat> = {
  groq: { baseURL: "https://api.groq.com/openai/v1", envKey: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
  gemini: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", envKey: "GEMINI_API_KEY", model: "gemini-2.0-flash" },
  openai: { envKey: "OPENAI_API_KEY", model: "gpt-4o-mini" },
};

export function detectProvider(): Provider | null {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function isAiConfigured(): boolean {
  return detectProvider() !== null;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Single-shot chat completion. Returns the assistant's text (JSON string when json=true). */
export async function aiChat(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  json?: boolean;
}): Promise<string> {
  const provider = detectProvider();
  if (!provider) throw new Error("No AI provider configured");
  const maxTokens = opts.maxTokens ?? 1024;

  if (provider === "anthropic") {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.AI_MODEL ?? "claude-opus-4-8",
      max_tokens: maxTokens,
      system: opts.system + (opts.json ? " Respond with ONLY valid JSON, no prose or code fences." : ""),
      messages: opts.messages,
    });
    const block = res.content.find((b) => b.type === "text");
    return block && "text" in block ? block.text : "";
  }

  const cfg = OPENAI_COMPAT[provider];
  const client = new OpenAI({ apiKey: process.env[cfg.envKey]!, baseURL: cfg.baseURL });
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL ?? cfg.model,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: opts.system }, ...opts.messages],
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return res.choices[0]?.message?.content ?? "";
}

/** Parse a JSON object from a model reply, tolerating code fences / stray prose. */
export function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("Could not parse JSON from model reply");
  }
}
