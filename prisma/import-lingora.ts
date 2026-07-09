import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const DATA_DIR = "D:/Download/Side Project/lingora/assets/js/data";
const EP_DIR = "D:/Download/Side Project/englishpath/assets/js/data";

// Load a global `const X = ...` from a browser data file (no exports).
function loadVar<T>(file: string, varName: string, dir: string = DATA_DIR): T {
  let code = fs.readFileSync(path.join(dir, file), "utf8");
  code = code.replace(/window\.[A-Za-z_]+\s*=\s*[A-Za-z_]+;?/g, ""); // drop window assigns
  return new Function(`${code}\n;return ${varName};`)() as T;
}

type Theme = { id: string; label: string; icon?: string };
type VocabItem = {
  word: string;
  reading?: string;
  romaji?: string;
  romanization?: string;
  pinyin?: string;
  meaning: string;
  theme: string;
  level?: string;
  example?: Record<string, string>;
};

type LangSpec = {
  code: string;
  themes: Theme[];
  vocab: VocabItem[];
  reading: (v: VocabItem) => string | undefined;
  exNative: (v: VocabItem) => string | undefined;
  exMean: (v: VocabItem) => string | undefined;
};

function buildSpecs(): LangSpec[] {
  const jp = loadVar<{ themes: Theme[]; vocab: VocabItem[] }>("jp-vocab.js", "JpVocabData");
  const kr = loadVar<{ getAll: () => VocabItem[]; getThemes: () => Theme[] }>("kr-vocab.js", "KrVocabData");
  const zh = loadVar<{ themes: Theme[]; vocab: VocabItem[] }>("zh-vocab.js", "ZhVocabData");

  return [
    {
      code: "ja",
      themes: jp.themes,
      vocab: jp.vocab,
      reading: (v) => v.reading ?? v.romaji,
      exNative: (v) => v.example?.jp,
      exMean: (v) => v.example?.id,
    },
    {
      code: "ko",
      themes: kr.getThemes(),
      vocab: kr.getAll(),
      reading: (v) => v.romanization,
      exNative: (v) => v.example?.kr ?? v.example?.ko ?? v.example?.hangul,
      exMean: (v) => v.example?.id,
    },
    {
      code: "zh",
      themes: zh.themes,
      vocab: zh.vocab,
      reading: (v) => v.pinyin,
      exNative: (v) => v.example?.sentence,
      exMean: (v) => v.example?.meaning,
    },
  ];
}

async function main() {
  const specs = buildSpecs();

  // Reseed system vocab decks/cards idempotently.
  await prisma.cardReview.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.deck.deleteMany({ where: { isSystem: true } });

  let deckCount = 0;
  let cardCount = 0;

  for (const spec of specs) {
    const language = await prisma.language.findUnique({ where: { code: spec.code } });
    if (!language) continue;

    for (const theme of spec.themes) {
      const items = spec.vocab.filter((v) => v.theme === theme.id);
      if (items.length === 0) continue;

      const deckId = `deck-${spec.code}-${theme.id}`;
      await prisma.deck.create({
        data: {
          id: deckId,
          languageId: language.id,
          title: theme.label,
          description: `${items.length} words`,
          isSystem: true,
        },
      });
      deckCount += 1;

      let sort = 0;
      for (const v of items) {
        const exNative = spec.exNative(v);
        const exMean = spec.exMean(v);
        await prisma.card.create({
          data: {
            id: `card-${deckId}-${sort}`,
            deckId,
            front: v.word,
            back: v.meaning,
            reading: spec.reading(v) ?? null,
            example: exNative ? `${exNative}${exMean ? ` — ${exMean}` : ""}` : null,
            tags: [theme.id, v.level ?? ""].filter(Boolean),
            sortOrder: sort,
          },
        });
        sort += 1;
        cardCount += 1;
      }
    }
  }

  // English vocab from englishpath (themes with nested words).
  const enLang = await prisma.language.findUnique({ where: { code: "en" } });
  if (enLang) {
    type EnWord = { id: string; word: string; ipa?: string; translation: string; example?: string; level?: string };
    type EnTheme = { id: string; name?: string; nameID?: string; words: EnWord[] };
    const enVocab = loadVar<{ getThemes: () => EnTheme[] }>("vocabulary-data.js", "VocabData", EP_DIR);

    for (const theme of enVocab.getThemes()) {
      if (!theme.words?.length) continue;
      const deckId = `deck-en-${theme.id}`;
      await prisma.deck.create({
        data: { id: deckId, languageId: enLang.id, title: theme.name ?? theme.id, description: `${theme.words.length} words`, isSystem: true },
      });
      deckCount += 1;
      let sort = 0;
      for (const w of theme.words) {
        await prisma.card.create({
          data: {
            id: `card-${deckId}-${sort}`,
            deckId,
            front: w.word,
            back: w.translation,
            reading: w.ipa ?? null,
            example: w.example ?? null,
            tags: [theme.id, w.level ?? ""].filter(Boolean),
            sortOrder: sort,
          },
        });
        sort += 1;
        cardCount += 1;
      }
    }
  }

  console.log(`Imported ${deckCount} decks and ${cardCount} cards (JP/KO/ZH + EN).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
