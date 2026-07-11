/**
 * Generates original graded reading passages (news / conversation / story) with
 * Claude and merges them into src/content/reading/{lang}.json.
 *
 * The content is model-authored and original — no copyrighted source text — so
 * it's safe to own and ship. Requires ANTHROPIC_API_KEY.
 *
 *   ANTHROPIC_API_KEY=... npx tsx scripts/gen-reading.ts            # default: ja
 *   ANTHROPIC_API_KEY=... npx tsx scripts/gen-reading.ts --lang=ko
 *
 * Edit SPECS below to control what gets generated. Existing passage ids are
 * skipped, so re-running only fills gaps.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

type Spec = { type: "news" | "conversation" | "story"; level: string; topic: string };

// What to generate. Add rows freely; ids are derived from type+topic.
const SPECS: Spec[] = [
  { type: "news", level: "N5", topic: "a new park opening" },
  { type: "conversation", level: "N5", topic: "asking for directions" },
  { type: "conversation", level: "N4", topic: "making a restaurant reservation" },
  { type: "news", level: "N4", topic: "a local summer festival" },
  { type: "story", level: "N4", topic: "a lost umbrella" },
  { type: "conversation", level: "N3", topic: "a doctor's appointment" },
  { type: "news", level: "N3", topic: "remote work becoming common" },
  { type: "story", level: "N3", topic: "moving to a new city" },
];

const LANG_NAME: Record<string, string> = { ja: "Japanese", ko: "Korean", zh: "Chinese", en: "English" };
const READING_NOTE: Record<string, string> = {
  ja: "hiragana reading (furigana) of the whole line, no kanji",
  ko: "romanization of the line",
  zh: "pinyin of the line",
  en: "leave as an empty string",
};

const PASSAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    titleEn: { type: "string" },
    summary: { type: "string" },
    minutes: { type: "integer" },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          speaker: { type: "string" },
          jp: { type: "string" },
          reading: { type: "string" },
          en: { type: "string" },
        },
        required: ["jp", "reading", "en"],
      },
    },
    vocab: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { word: { type: "string" }, reading: { type: "string" }, meaning: { type: "string" } },
        required: ["word", "reading", "meaning"],
      },
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "integer" },
          explanation: { type: "string" },
        },
        required: ["q", "options", "answer", "explanation"],
      },
    },
  },
  required: ["title", "titleEn", "summary", "minutes", "blocks", "vocab", "questions"],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const langArg = process.argv.find((a) => a.startsWith("--lang="));
  const lang = langArg ? langArg.split("=")[1] : "ja";
  const langName = LANG_NAME[lang] ?? "Japanese";

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env to generate reading content.");
    process.exit(1);
  }

  const outPath = path.join(process.cwd(), "src", "content", "reading", `${lang}.json`);
  const existing: { passages: Record<string, unknown>[] } = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : { passages: [] };
  const haveIds = new Set(existing.passages.map((p) => (p as { id: string }).id));

  const client = new Anthropic();

  for (const spec of SPECS) {
    const id = `${lang}-${spec.type}-${slug(spec.topic)}`;
    if (haveIds.has(id)) {
      console.log(`skip ${id} (exists)`);
      continue;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system:
        `You write graded ${langName} reading material for learners at JLPT-style levels. ` +
        `Produce ONE ${spec.type} at level ${spec.level} about "${spec.topic}". ` +
        `Constrain vocabulary and grammar to the level. For a conversation, set "speaker" on each block; ` +
        `for news/story, omit "speaker" and use sentences/short paragraphs. ` +
        `"jp" is the ${langName} text; "reading" is the ${READING_NOTE[lang] ?? "reading"}; "en" is a natural English translation. ` +
        `Add 5–7 vocab items and 3 comprehension questions (4 options each, "answer" is the 0-based index). ` +
        `Keep it culturally natural and never use emoji.`,
      messages: [{ role: "user", content: `Write the ${spec.level} ${spec.type} about: ${spec.topic}.` }],
      output_config: { format: { type: "json_schema", schema: PASSAGE_SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const body = JSON.parse(block && "text" in block ? block.text : "{}");
    existing.passages.push({ id, type: spec.type, level: spec.level, topic: spec.topic, ...body });
    haveIds.add(id);
    console.log(`+ ${id} — ${body.title}`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`wrote ${outPath} — ${existing.passages.length} passages total`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
