/**
 * Imports the full kanji set (JLPT N5→N1 + remaining Jōyō) into DB decks so it
 * is browsable and reviewable with spaced repetition.
 *
 * Source: scripts/data/kanji.json (KANJIDIC2 / EDRDG, CC BY-SA 4.0).
 * Example words for the beginner levels are enriched from the user's own
 * lingora kanji.js where a character overlaps.
 *
 * Run AFTER import-lingora (which wipes all system decks). Idempotent on its
 * own: it only clears the deck-ja-kanji-* decks before rebuilding them.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

type Kanji = {
  char: string;
  jlpt: number | null;
  grade: number | null;
  freq: number | null;
  strokes: number | null;
  on: string[];
  kun: string[];
  meanings: string[];
  tier: string;
};

const kanji: Kanji[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "scripts", "data", "kanji.json"), "utf8"),
);

const readings = (k: Kanji): string =>
  [k.on.join("・"), k.kun.join("・")].filter(Boolean).join("  |  ");

// Example words from lingora's kanji.js (char -> "word (reading) — meaning").
function loadLingoraExamples(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const file = "D:/Download/Side Project/lingora/assets/js/data/kanji.js";
    let code = fs.readFileSync(file, "utf8");
    code = code.replace(/window\.[A-Za-z_]+\s*=\s*[A-Za-z_]+;?/g, "");
    const data = new Function(`${code}\n;return KanjiData;`)() as Record<string, unknown[]>;
    for (const arr of Object.values(data)) {
      for (const raw of arr ?? []) {
        const k = raw as Record<string, unknown>;
        const ex = k.example as Record<string, unknown> | undefined;
        if (k.char && ex?.word) {
          map.set(String(k.char), `${ex.word} (${ex.reading ?? ""}) — ${ex.meaning ?? ""}`);
        }
      }
    }
  } catch {
    // lingora not present (e.g. CI) — examples are optional.
  }
  return map;
}

type DeckDef = { id: string; title: string; level: string; test: (k: Kanji) => boolean };

// Fixed tiers plus dynamically-chunked "extended" (rare) decks.
const EXT_CHUNK = 800;
function buildDeckDefs(kanji: Kanji[]): DeckDef[] {
  const defs: DeckDef[] = [
    { id: "deck-ja-kanji-n5", title: "Kanji N5", level: "N5", test: (k) => k.tier === "N5" },
    { id: "deck-ja-kanji-n4", title: "Kanji N4", level: "N4", test: (k) => k.tier === "N4" },
    { id: "deck-ja-kanji-n3", title: "Kanji N3", level: "N3", test: (k) => k.tier === "N3" },
    { id: "deck-ja-kanji-n2", title: "Kanji N2", level: "N2", test: (k) => k.tier === "N2" },
    { id: "deck-ja-kanji-n1", title: "Kanji N1", level: "N1", test: (k) => k.tier === "N1" },
    { id: "deck-ja-kanji-jouyou", title: "Kanji · Jōyō (extra)", level: "Jōyō", test: (k) => k.tier === "jouyo" },
    { id: "deck-ja-kanji-jinmeiyo", title: "Kanji · Jinmeiyō (names)", level: "Jinmeiyō", test: (k) => k.tier === "jinmeiyo" },
    { id: "deck-ja-kanji-common", title: "Kanji · Common (frequency)", level: "Common", test: (k) => k.tier === "common" },
  ];
  const ext = kanji.filter((k) => k.tier === "extended");
  const chunks = Math.ceil(ext.length / EXT_CHUNK);
  for (let i = 0; i < chunks; i += 1) {
    const set = new Set(ext.slice(i * EXT_CHUNK, (i + 1) * EXT_CHUNK).map((k) => k.char));
    defs.push({
      id: `deck-ja-kanji-ext-${i + 1}`,
      title: `Kanji · Extended ${i + 1}`,
      level: "Extended",
      test: (k) => set.has(k.char),
    });
  }
  return defs;
}

async function main() {
  const language = await prisma.language.findUnique({ where: { code: "ja" } });
  if (!language) throw new Error("Japanese language row not found — run db:seed first.");

  const examples = loadLingoraExamples();
  const decks = buildDeckDefs(kanji);

  // Clear ALL kanji decks (and dependents) by prefix so re-runs stay clean even
  // if the number of extended chunks changes.
  const oldDecks = await prisma.deck.findMany({ where: { id: { startsWith: "deck-ja-kanji" } }, select: { id: true } });
  const oldDeckIds = oldDecks.map((d) => d.id);
  const oldCards = await prisma.card.findMany({ where: { deckId: { in: oldDeckIds } }, select: { id: true } });
  if (oldCards.length) {
    await prisma.cardReview.deleteMany({ where: { cardId: { in: oldCards.map((c) => c.id) } } });
  }
  await prisma.card.deleteMany({ where: { deckId: { in: oldDeckIds } } });
  await prisma.deck.deleteMany({ where: { id: { in: oldDeckIds } } });

  let cardTotal = 0;
  for (const def of decks) {
    const items = kanji.filter(def.test);
    if (items.length === 0) continue;

    await prisma.deck.create({
      data: {
        id: def.id,
        languageId: language.id,
        title: def.title,
        description: `${items.length} kanji · ${def.level}`,
        isSystem: true,
      },
    });

    const rows = items.map((k, i) => ({
      id: `card-${def.id}-${i}`,
      deckId: def.id,
      front: k.char,
      back: k.meanings.slice(0, 4).join(", "),
      reading: readings(k) || null,
      example: examples.get(k.char) ?? null,
      tags: [def.level, k.strokes ? `${k.strokes} strokes` : ""].filter(Boolean),
      sortOrder: i,
    }));

    // Batch insert to keep round-trips low.
    for (let i = 0; i < rows.length; i += 500) {
      await prisma.card.createMany({ data: rows.slice(i, i + 500) });
    }
    cardTotal += rows.length;
    console.log(`  ${def.title}: ${rows.length} kanji`);
  }

  console.log(`Imported ${decks.length} kanji decks / ${cardTotal} kanji (JLPT + Jōyō + Jinmeiyō + Common + Extended).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
