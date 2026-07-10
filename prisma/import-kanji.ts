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

const DECKS: { id: string; title: string; test: (k: Kanji) => boolean; level: string }[] = [
  { id: "deck-ja-kanji-n5", title: "Kanji N5", level: "N5", test: (k) => k.jlpt === 5 },
  { id: "deck-ja-kanji-n4", title: "Kanji N4", level: "N4", test: (k) => k.jlpt === 4 },
  { id: "deck-ja-kanji-n3", title: "Kanji N3", level: "N3", test: (k) => k.jlpt === 3 },
  { id: "deck-ja-kanji-n2", title: "Kanji N2", level: "N2", test: (k) => k.jlpt === 2 },
  { id: "deck-ja-kanji-n1", title: "Kanji N1", level: "N1", test: (k) => k.jlpt === 1 },
  { id: "deck-ja-kanji-jouyou", title: "Kanji · Jōyō (extra)", level: "Jōyō", test: (k) => k.jlpt == null },
];

async function main() {
  const language = await prisma.language.findUnique({ where: { code: "ja" } });
  if (!language) throw new Error("Japanese language row not found — run db:seed first.");

  const examples = loadLingoraExamples();

  // Clear only the kanji decks (and dependents) so this is safe to re-run.
  const deckIds = DECKS.map((d) => d.id);
  const oldCards = await prisma.card.findMany({ where: { deckId: { in: deckIds } }, select: { id: true } });
  if (oldCards.length) {
    await prisma.cardReview.deleteMany({ where: { cardId: { in: oldCards.map((c) => c.id) } } });
  }
  await prisma.card.deleteMany({ where: { deckId: { in: deckIds } } });
  await prisma.deck.deleteMany({ where: { id: { in: deckIds } } });

  let cardTotal = 0;
  for (const def of DECKS) {
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

  console.log(`Imported ${DECKS.length} kanji decks / ${cardTotal} kanji (JLPT N5→N1 + Jōyō).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
