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

type Unit = { id: string; title: string; sortOrder: number; lessons: L[] };

// One starter "Everyday Life" unit per language: reading / listening / writing / quiz.
const UNITS: Record<string, Unit> = {
  ja: {
    id: "u-ja-everyday",
    title: "Everyday Life",
    sortOrder: 1,
    lessons: [
      {
        id: "l-ja-read1", title: "Self-introduction", kind: "reading", xpReward: 20, estMinutes: 5, sortOrder: 1,
        metadata: {
          passage: "私の名前はさくらです。大学生です。\n毎朝７時に起きて、朝ごはんを食べます。\n８時から授業が始まります。\n昼は学食を食べて、友達とはなします。\n夜はうちで勉強をします。",
          highlight: "昼は学食を食べて、友達とはなします。",
        },
        questions: [{
          id: "q-ja-read1-1", kind: "mcq", prompt: "What does the speaker do at lunch?",
          options: [
            { text: "She goes to class." },
            { text: "She eats at the cafeteria and talks with friends." },
            { text: "She studies at home." },
            { text: "She wakes up early." },
          ],
          answer: 1, explanation: "「昼は学食を食べて、友達とはなします」= at noon she eats at the cafeteria and talks with friends.", sortOrder: 1,
        }],
      },
      {
        id: "l-ja-listen1", title: "At the station", kind: "listening", xpReward: 20, estMinutes: 5, sortOrder: 2,
        metadata: { transcript: "何時に出発しますか。" },
        questions: [{
          id: "q-ja-listen1-1", kind: "mcq", prompt: "What did you hear?",
          options: [
            { text: "駅はどこですか。", sub: "Where is the station?" },
            { text: "いくらですか。", sub: "How much is it?" },
            { text: "何時に出発しますか。", sub: "What time does it depart?" },
            { text: "トイレはどこですか。", sub: "Where is the restroom?" },
          ],
          answer: 2, sortOrder: 1,
        }],
      },
      {
        id: "l-ja-write1", title: "Using は", kind: "writing", xpReward: 25, estMinutes: 6, sortOrder: 3,
        metadata: { example: "わたしは 学生です。 — I am a student.", focus: "は (topic particle)" },
        questions: [{
          id: "q-ja-write1-1", kind: "writing",
          prompt: "Write a sentence using は. Introduce a topic and add information.",
          answer: { sample: "わたしは コーヒーが すきです。" }, sortOrder: 1,
        }],
      },
      {
        id: "l-ja-quiz1", title: "Hiragana match", kind: "quiz", xpReward: 15, estMinutes: 4, sortOrder: 4,
        questions: [
          { id: "q-ja-quiz1-1", kind: "mcq", prompt: "Which romaji matches this?", promptNative: "か", options: [{ text: "ki" }, { text: "ka" }, { text: "ku" }, { text: "ko" }], answer: 1, sortOrder: 1 },
          { id: "q-ja-quiz1-2", kind: "mcq", prompt: "Which romaji matches this?", promptNative: "さ", options: [{ text: "sa" }, { text: "shi" }, { text: "su" }, { text: "so" }], answer: 0, sortOrder: 2 },
          { id: "q-ja-quiz1-3", kind: "mcq", prompt: "Which romaji matches this?", promptNative: "の", options: [{ text: "na" }, { text: "ni" }, { text: "no" }, { text: "nu" }], answer: 2, sortOrder: 3 },
        ],
      },
    ],
  },

  ko: {
    id: "u-ko-everyday", title: "Everyday Life", sortOrder: 1,
    lessons: [
      {
        id: "l-ko-read1", title: "Self-introduction", kind: "reading", xpReward: 20, estMinutes: 5, sortOrder: 1,
        metadata: {
          passage: "제 이름은 지민입니다. 대학생이에요.\n매일 아침 7시에 일어나요.\n8시에 수업이 시작해요.\n점심은 학생 식당에서 먹어요.\n저녁에는 집에서 공부해요.",
          highlight: "점심은 학생 식당에서 먹어요.",
        },
        questions: [{
          id: "q-ko-read1-1", kind: "mcq", prompt: "What does the speaker do at lunch?",
          options: [
            { text: "수업을 들어요.", sub: "Attends class." },
            { text: "학생 식당에서 먹어요.", sub: "Eats at the student cafeteria." },
            { text: "집에서 자요.", sub: "Sleeps at home." },
            { text: "일찍 일어나요.", sub: "Wakes up early." },
          ],
          answer: 1, sortOrder: 1,
        }],
      },
      {
        id: "l-ko-listen1", title: "At the station", kind: "listening", xpReward: 20, estMinutes: 5, sortOrder: 2,
        metadata: { transcript: "지하철역이 어디예요?" },
        questions: [{
          id: "q-ko-listen1-1", kind: "mcq", prompt: "What did you hear?",
          options: [
            { text: "지하철역이 어디예요?", sub: "Where is the subway station?" },
            { text: "얼마예요?", sub: "How much is it?" },
            { text: "몇 시예요?", sub: "What time is it?" },
            { text: "화장실이 어디예요?", sub: "Where is the restroom?" },
          ],
          answer: 0, sortOrder: 1,
        }],
      },
      {
        id: "l-ko-write1", title: "Using 은/는", kind: "writing", xpReward: 25, estMinutes: 6, sortOrder: 3,
        metadata: { example: "저는 학생이에요. — I am a student.", focus: "은/는 (topic particle)" },
        questions: [{
          id: "q-ko-write1-1", kind: "writing",
          prompt: "Write a sentence introducing yourself using 은/는.",
          answer: { sample: "저는 커피를 좋아해요." }, sortOrder: 1,
        }],
      },
      {
        id: "l-ko-quiz1", title: "Hangul match", kind: "quiz", xpReward: 15, estMinutes: 4, sortOrder: 4,
        questions: [
          { id: "q-ko-quiz1-1", kind: "mcq", prompt: "Which romanization matches this?", promptNative: "가", options: [{ text: "ga" }, { text: "na" }, { text: "da" }, { text: "ma" }], answer: 0, sortOrder: 1 },
          { id: "q-ko-quiz1-2", kind: "mcq", prompt: "Which romanization matches this?", promptNative: "나", options: [{ text: "na" }, { text: "ma" }, { text: "ba" }, { text: "sa" }], answer: 0, sortOrder: 2 },
          { id: "q-ko-quiz1-3", kind: "mcq", prompt: "Which romanization matches this?", promptNative: "다", options: [{ text: "ta" }, { text: "da" }, { text: "ga" }, { text: "ha" }], answer: 1, sortOrder: 3 },
        ],
      },
    ],
  },

  zh: {
    id: "u-zh-everyday", title: "Everyday Life", sortOrder: 1,
    lessons: [
      {
        id: "l-zh-read1", title: "Self-introduction", kind: "reading", xpReward: 20, estMinutes: 5, sortOrder: 1,
        metadata: {
          passage: "我叫小明。我是大学生。\n我每天早上七点起床。\n八点开始上课。\n中午我在食堂吃饭。\n晚上我在家学习。",
          highlight: "中午我在食堂吃饭。",
        },
        questions: [{
          id: "q-zh-read1-1", kind: "mcq", prompt: "What does he do at noon?",
          options: [
            { text: "上课。", sub: "Attends class." },
            { text: "在食堂吃饭。", sub: "Eats in the cafeteria." },
            { text: "在家睡觉。", sub: "Sleeps at home." },
            { text: "早起。", sub: "Wakes up early." },
          ],
          answer: 1, sortOrder: 1,
        }],
      },
      {
        id: "l-zh-listen1", title: "At the station", kind: "listening", xpReward: 20, estMinutes: 5, sortOrder: 2,
        metadata: { transcript: "火车几点出发？" },
        questions: [{
          id: "q-zh-listen1-1", kind: "mcq", prompt: "What did you hear?",
          options: [
            { text: "车站在哪里？", sub: "Where is the station?" },
            { text: "多少钱？", sub: "How much is it?" },
            { text: "火车几点出发？", sub: "What time does the train leave?" },
            { text: "厕所在哪里？", sub: "Where is the restroom?" },
          ],
          answer: 2, sortOrder: 1,
        }],
      },
      {
        id: "l-zh-write1", title: "Using 是", kind: "writing", xpReward: 25, estMinutes: 6, sortOrder: 3,
        metadata: { example: "我是学生。 — I am a student.", focus: "是 (to be)" },
        questions: [{
          id: "q-zh-write1-1", kind: "writing",
          prompt: "Write a sentence using 是 (to be).",
          answer: { sample: "我是学生。" }, sortOrder: 1,
        }],
      },
      {
        id: "l-zh-quiz1", title: "Pinyin match", kind: "quiz", xpReward: 15, estMinutes: 4, sortOrder: 4,
        questions: [
          { id: "q-zh-quiz1-1", kind: "mcq", prompt: "Which pinyin matches this?", promptNative: "好", options: [{ text: "hǎo" }, { text: "hào" }, { text: "hē" }, { text: "hé" }], answer: 0, sortOrder: 1 },
          { id: "q-zh-quiz1-2", kind: "mcq", prompt: "Which pinyin matches this?", promptNative: "水", options: [{ text: "shuǐ" }, { text: "shuí" }, { text: "shū" }, { text: "shǒu" }], answer: 0, sortOrder: 2 },
          { id: "q-zh-quiz1-3", kind: "mcq", prompt: "Which pinyin matches this?", promptNative: "人", options: [{ text: "rén" }, { text: "rěn" }, { text: "lín" }, { text: "nín" }], answer: 0, sortOrder: 3 },
        ],
      },
    ],
  },

  en: {
    id: "u-en-everyday", title: "Everyday Life", sortOrder: 1,
    lessons: [
      {
        id: "l-en-read1", title: "Self-introduction", kind: "reading", xpReward: 20, estMinutes: 5, sortOrder: 1,
        metadata: {
          passage: "My name is Emma. I am a student.\nEvery morning I wake up at seven.\nClasses start at eight.\nAt noon I eat lunch in the cafeteria with my friends.\nIn the evening I study at home.",
          highlight: "At noon I eat lunch in the cafeteria with my friends.",
        },
        questions: [{
          id: "q-en-read1-1", kind: "mcq", prompt: "What does Emma do at noon?",
          options: [
            { text: "She goes to class." },
            { text: "She eats lunch in the cafeteria with friends." },
            { text: "She studies at home." },
            { text: "She wakes up early." },
          ],
          answer: 1, sortOrder: 1,
        }],
      },
      {
        id: "l-en-listen1", title: "At the bus stop", kind: "listening", xpReward: 20, estMinutes: 5, sortOrder: 2,
        metadata: { transcript: "What time does the bus leave?" },
        questions: [{
          id: "q-en-listen1-1", kind: "mcq", prompt: "What did you hear?",
          options: [
            { text: "Where is the station?" },
            { text: "How much is it?" },
            { text: "What time does the bus leave?" },
            { text: "Where is the restroom?" },
          ],
          answer: 2, sortOrder: 1,
        }],
      },
      {
        id: "l-en-write1", title: "Present simple", kind: "writing", xpReward: 25, estMinutes: 6, sortOrder: 3,
        metadata: { example: "I wake up at seven every day.", focus: "present simple" },
        questions: [{
          id: "q-en-write1-1", kind: "writing",
          prompt: "Write a sentence about your daily routine using the present simple.",
          answer: { sample: "I study English every evening." }, sortOrder: 1,
        }],
      },
      {
        id: "l-en-quiz1", title: "Grammar: to be", kind: "quiz", xpReward: 15, estMinutes: 4, sortOrder: 4,
        questions: [
          { id: "q-en-quiz1-1", kind: "mcq", prompt: "Choose the correct word: She ___ a student.", options: [{ text: "is" }, { text: "are" }, { text: "am" }, { text: "be" }], answer: 0, sortOrder: 1 },
          { id: "q-en-quiz1-2", kind: "mcq", prompt: "Choose the correct word: They ___ my friends.", options: [{ text: "is" }, { text: "are" }, { text: "am" }, { text: "be" }], answer: 1, sortOrder: 2 },
          { id: "q-en-quiz1-3", kind: "mcq", prompt: "Choose the correct word: I ___ happy.", options: [{ text: "is" }, { text: "are" }, { text: "am" }, { text: "be" }], answer: 2, sortOrder: 3 },
        ],
      },
    ],
  },
};

async function createLesson(unitId: string, lesson: L) {
  const { questions, ...data } = lesson;
  await prisma.lesson.create({
    data: { ...data, metadata: (data.metadata ?? undefined) as object | undefined, unitId, isPublished: true },
  });

  for (const q of questions) {
    await prisma.question.create({
      data: { ...q, options: (q.options ?? undefined) as object | undefined, answer: q.answer as object, lessonId: lesson.id },
    });
  }
}

async function main() {
  let lessonCount = 0;

  // Reseed content (deterministic ids). Clear dependents first — relationMode
  // "prisma" blocks deleting a Lesson that still has questions or progress.
  await prisma.question.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.unit.deleteMany({});

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

    const unit = UNITS[lang.code];
    if (unit) {
      await prisma.unit.upsert({
        where: { id: unit.id },
        create: { id: unit.id, trackId: track.id, title: unit.title, sortOrder: unit.sortOrder },
        update: { trackId: track.id, title: unit.title, sortOrder: unit.sortOrder },
      });
      for (const lesson of unit.lessons) {
        await createLesson(unit.id, lesson);
        lessonCount += 1;
      }
    }
  }

  console.log(`Seeded ${LANGUAGES.length} languages, tracks, and ${lessonCount} lessons across all languages.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
