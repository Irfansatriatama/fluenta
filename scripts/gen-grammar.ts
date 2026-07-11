/**
 * Generates additional grammar points with Claude into
 * src/content/grammar/ja-extra.json (the hand-authored supplement that
 * gen-content never overwrites). Original explanations/examples — safe to own.
 * Requires ANTHROPIC_API_KEY.
 *
 *   ANTHROPIC_API_KEY=... npx tsx scripts/gen-grammar.ts --level=N3 --count=20
 *
 * Existing pattern strings are skipped, so re-running only fills gaps toward the
 * JLPT targets (~N5 80 · N4 150 · N3 200 · N2 200 · N1 200).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    patterns: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          pattern: { type: "string" },
          reading: { type: "string" },
          meaning: { type: "string" },
          category: { type: "string" },
          explanation: { type: "string" },
          examples: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: { native: { type: "string" }, roman: { type: "string" }, gloss: { type: "string" } },
              required: ["native", "roman", "gloss"],
            },
          },
          notes: { type: "string" },
        },
        required: ["pattern", "reading", "meaning", "category", "explanation", "examples"],
      },
    },
  },
  required: ["patterns"],
};

const slug = (s: string) => "ja-gen-" + s.replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 24);

async function main() {
  const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
  const level = arg("level", "N3");
  const count = parseInt(arg("count", "20"), 10);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env to generate grammar.");
    process.exit(1);
  }

  const outPath = path.join(process.cwd(), "src", "content", "grammar", "ja-extra.json");
  const existing: { patterns: Record<string, unknown>[] } = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : { patterns: [] };
  const have = new Set(existing.patterns.map((p) => String(p.pattern).replace(/[〜～\s]/g, "")));

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system:
      `You are a JLPT grammar author. Produce ${count} DISTINCT, high-frequency JLPT ${level} grammar points ` +
      `that a learner must know. For each: the pattern (use 〜 for blanks), its kana reading, a short English meaning, ` +
      `a category, a one-sentence explanation, and 1–2 natural example sentences with romaji and English gloss. ` +
      `Avoid the most basic N5 points. Never use emoji. Keep examples correct and idiomatic.`,
    messages: [
      {
        role: "user",
        content:
          `Give ${count} JLPT ${level} grammar points. Avoid these already-covered patterns: ` +
          `${[...have].slice(0, 120).join("、")}`,
      },
    ],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  });

  const block = response.content.find((b) => b.type === "text");
  const body = JSON.parse(block && "text" in block ? block.text : "{}") as {
    patterns: Record<string, unknown>[];
  };

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
