import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed uses the DIRECT connection (no pgbouncer) to avoid prepared-statement
// issues with the transaction pooler.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const LANGUAGES = [
  { code: "ja", name: "Japanese", nativeName: "日本語", accentHex: "#B23A2E", sortOrder: 1 },
  { code: "ko", name: "Korean", nativeName: "한국어", accentHex: "#3B5C99", sortOrder: 2 },
  { code: "zh", name: "Chinese", nativeName: "中文", accentHex: "#2F7D53", sortOrder: 3 },
  { code: "en", name: "English", nativeName: "English", accentHex: "#5B4B9E", sortOrder: 4 },
];

// One starter track per language (framework + entry level).
const TRACKS: Record<string, { code: string; framework: string; level: string; title: string }> = {
  ja: { code: "jlpt-n5", framework: "JLPT", level: "N5", title: "JLPT N5" },
  ko: { code: "topik-1", framework: "TOPIK", level: "1", title: "TOPIK I" },
  zh: { code: "hsk-1", framework: "HSK", level: "1", title: "HSK 1" },
  en: { code: "cefr-a1", framework: "CEFR", level: "A1", title: "CEFR A1" },
};

async function main() {
  for (const lang of LANGUAGES) {
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: lang,
    });

    const t = TRACKS[lang.code];
    await prisma.track.upsert({
      where: { code: t.code },
      create: { ...t, languageId: language.id, isPublished: true },
      update: { ...t, languageId: language.id, isPublished: true },
    });
  }
  console.log(`Seeded ${LANGUAGES.length} languages + starter tracks.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
