import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed uses the DIRECT connection (no pgbouncer).
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const LANGUAGES = [
  { code: "ja", name: "Japanese", nativeName: "日本語", accentHex: "#B23A2E", sortOrder: 1 },
  { code: "ko", name: "Korean", nativeName: "한국어", accentHex: "#3B5C99", sortOrder: 2 },
  { code: "zh", name: "Chinese", nativeName: "中文", accentHex: "#2F7D53", sortOrder: 3 },
  { code: "en", name: "English", nativeName: "English", accentHex: "#5B4B9E", sortOrder: 4 },
];

const TRACKS: Record<string, { code: string; framework: string; level: string; title: string }> = {
  ja: { code: "jlpt-n5", framework: "JLPT", level: "N5", title: "JLPT N5" },
  ko: { code: "topik-1", framework: "TOPIK", level: "1", title: "TOPIK I" },
  zh: { code: "hsk-1", framework: "HSK", level: "1", title: "HSK 1" },
  en: { code: "cefr-a1", framework: "CEFR", level: "A1", title: "CEFR A1" },
};

type Q = {
  id: string;
  kind: string;
  prompt: string;
  promptNative?: string;
  options?: unknown;
  answer: unknown;
  explanation?: string;
  sortOrder: number;
};

type L = {
  id: string;
  title: string;
  kind: string;
  xpReward: number;
  estMinutes: number;
  sortOrder: number;
  metadata?: unknown;
  questions: Q[];
};

// One starter unit for Japanese with a mix of lesson types.
const JA_UNIT = {
  id: "u-ja-everyday",
  title: "Everyday Life",
  sortOrder: 1,
  lessons: [
    {
      id: "l-ja-read1",
      title: "Self-introduction",
      kind: "reading",
      xpReward: 20,
      estMinutes: 5,
      sortOrder: 1,
      metadata: {
        passage:
          "私の名前はさくらです。大学生です。\n毎朝７時に起きて、朝ごはんを食べます。\n８時から授業が始まります。\n昼は学食を食べて、友達とはなします。\n夜はうちで勉強をします。",
        highlight: "昼は学食を食べて、友達とはなします。",
      },
      questions: [
        {
          id: "q-ja-read1-1",
          kind: "mcq",
          prompt: "What does the speaker do at lunch?",
          options: [
            { text: "She goes to class." },
            { text: "She eats at the cafeteria and talks with friends." },
            { text: "She studies at home." },
            { text: "She wakes up early." },
          ],
          answer: 1,
          explanation: "「昼は学食を食べて、友達とはなします」= at noon she eats at the cafeteria and talks with friends.",
          sortOrder: 1,
        },
      ],
    },
    {
      id: "l-ja-listen1",
      title: "At the station",
      kind: "listening",
      xpReward: 20,
      estMinutes: 5,
      sortOrder: 2,
      metadata: { transcript: "何時に出発しますか。" },
      questions: [
        {
          id: "q-ja-listen1-1",
          kind: "mcq",
          prompt: "What did you hear?",
          options: [
            { text: "駅はどこですか。", sub: "Where is the station?" },
            { text: "いくらですか。", sub: "How much is it?" },
            { text: "何時に出発しますか。", sub: "What time does it depart?" },
            { text: "トイレはどこですか。", sub: "Where is the restroom?" },
          ],
          answer: 2,
          sortOrder: 1,
        },
      ],
    },
    {
      id: "l-ja-write1",
      title: "Using は",
      kind: "writing",
      xpReward: 25,
      estMinutes: 6,
      sortOrder: 3,
      metadata: {
        example: "わたしは 学生です。 — I am a student.",
        focus: "は (topic particle)",
      },
      questions: [
        {
          id: "q-ja-write1-1",
          kind: "writing",
          prompt: "Write a sentence using は. Introduce a topic and add information.",
          answer: { sample: "わたしは コーヒーが すきです。" },
          sortOrder: 1,
        },
      ],
    },
    {
      id: "l-ja-quiz1",
      title: "Hiragana match",
      kind: "quiz",
      xpReward: 15,
      estMinutes: 4,
      sortOrder: 4,
      questions: [
        {
          id: "q-ja-quiz1-1",
          kind: "mcq",
          prompt: "Which romaji matches this?",
          promptNative: "か",
          options: [{ text: "ki" }, { text: "ka" }, { text: "ku" }, { text: "ko" }],
          answer: 1,
          sortOrder: 1,
        },
        {
          id: "q-ja-quiz1-2",
          kind: "mcq",
          prompt: "Which romaji matches this?",
          promptNative: "さ",
          options: [{ text: "sa" }, { text: "shi" }, { text: "su" }, { text: "so" }],
          answer: 0,
          sortOrder: 2,
        },
        {
          id: "q-ja-quiz1-3",
          kind: "mcq",
          prompt: "Which romaji matches this?",
          promptNative: "の",
          options: [{ text: "na" }, { text: "ni" }, { text: "no" }, { text: "nu" }],
          answer: 2,
          sortOrder: 3,
        },
      ],
    },
  ] as L[],
};

async function upsertLesson(unitId: string, lesson: L) {
  const { questions, ...data } = lesson;
  await prisma.lesson.upsert({
    where: { id: lesson.id },
    create: {
      ...data,
      metadata: (data.metadata ?? undefined) as object | undefined,
      unitId,
      isPublished: true,
    },
    update: {
      ...data,
      metadata: (data.metadata ?? undefined) as object | undefined,
      isPublished: true,
    },
  });

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        ...q,
        options: (q.options ?? undefined) as object | undefined,
        answer: q.answer as object,
        lessonId: lesson.id,
      },
      update: {
        ...q,
        options: (q.options ?? undefined) as object | undefined,
        answer: q.answer as object,
        lessonId: lesson.id,
      },
    });
  }
}

async function main() {
  let jaTrackId = "";

  for (const lang of LANGUAGES) {
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: lang,
    });

    const t = TRACKS[lang.code];
    const track = await prisma.track.upsert({
      where: { code: t.code },
      create: { ...t, languageId: language.id, isPublished: true },
      update: { ...t, languageId: language.id, isPublished: true },
    });
    if (lang.code === "ja") jaTrackId = track.id;
  }

  // Japanese starter content
  await prisma.unit.upsert({
    where: { id: JA_UNIT.id },
    create: { id: JA_UNIT.id, trackId: jaTrackId, title: JA_UNIT.title, sortOrder: JA_UNIT.sortOrder },
    update: { trackId: jaTrackId, title: JA_UNIT.title, sortOrder: JA_UNIT.sortOrder },
  });
  for (const lesson of JA_UNIT.lessons) {
    await upsertLesson(JA_UNIT.id, lesson);
  }

  console.log(`Seeded ${LANGUAGES.length} languages, tracks, and ${JA_UNIT.lessons.length} Japanese lessons.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
