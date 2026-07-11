/**
 * Generates additional grammar points into src/content/grammar/ja-extra.json
 * (the hand-authored supplement that gen-content never overwrites). Uses
 * whichever AI provider is configured (Groq / Gemini / OpenAI / Anthropic).
 *
 *   GROQ_API_KEY=... npx tsx scripts/gen-grammar.ts --level=N3 --count=20
 *
 * Existing pattern strings are skipped, so re-running only fills gaps toward the
 * JLPT targets (~N5 80 · N4 150 · N3 200 · N2 200 · N1 200).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { aiChat, isAiConfigured, parseJson } from "../src/lib/ai";

const slug = (s: string) => "ja-gen-" + s.replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 24);

async function main() {
  const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
  const level = arg("level", "N3");
  const count = parseInt(arg("count", "20"), 10);

  if (!isAiConfigured()) {
    console.error("No AI provider configured. Set GROQ_API_KEY (or GEMINI/OPENAI/ANTHROPIC) in .env.");
    process.exit(1);
  }

  const outPath = path.join(process.cwd(), "src", "content", "grammar", "ja-extra.json");
  const existing: { patterns: Record<string, unknown>[] } = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : { patterns: [] };
  const have = new Set(existing.patterns.map((p) => String(p.pattern).replace(/[〜～\s]/g, "")));

  const text = await aiChat({
    json: true,
    maxTokens: 8000,
    system:
      `You are a JLPT grammar author. Produce ${count} DISTINCT, high-frequency JLPT ${level} grammar points ` +
      `that a learner must know. Avoid the most basic N5 points. Never use emoji. Keep examples correct and idiomatic. ` +
      `Return ONLY a JSON object: { "patterns": [ { "pattern": string (use 〜 for blanks), "reading": string (kana), ` +
      `"meaning": string (short English), "category": string, "explanation": string (one sentence), ` +
      `"examples": [ { "native": string, "roman": string, "gloss": string } ], "notes"?: string } ] }`,
    messages: [
      {
        role: "user",
        content:
          `Give ${count} JLPT ${level} grammar points. Avoid these already-covered patterns: ` +
          `${[...have].slice(0, 120).join("、")}`,
      },
    ],
  });
  const body = parseJson<{ patterns: Record<string, unknown>[] }>(text);

  let added = 0;
  for (const p of body.patterns ?? []) {
    const key = String(p.pattern).replace(/[〜～\s]/g, "");
    if (have.has(key)) continue;
    have.add(key);
    existing.patterns.push({ id: slug(key), level, ...p });
    added += 1;
  }

  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`added ${added} ${level} patterns — ${existing.patterns.length} total in ja-extra.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
