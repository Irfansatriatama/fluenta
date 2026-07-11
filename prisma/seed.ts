import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import readingJa from "../src/content/reading/ja.json";

// Seed uses the DIRECT connection (no pgbouncer).
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const LANGUAGES = [
  { code: "ja", name: "Japanese", nativeName: "日本語", accentHex: "#B23A2E", sortOrder: 1 },
  { code: "ko", name: "Korean", nativeName: "한국어", accentHex: "#3B5C99", sortOrder: 2 },
  { code: "zh", name: "Chinese", nativeName: "中文", accentHex: "#2F7D53", sortOrder: 3 },
  { code: "en", name: "English", nativeName: "English", accentHex: "#5B4B9E", sortOrder: 4 },
];

type TrackDef = {
  code: string;
  framework: string;
  level: string;
  title: string;
  sortOrder: number;
  scriptDeckIds: string[]; // decks that become the "Script & Characters" unit
  vocab: boolean; // include a "Core Vocabulary" unit from theme decks
};

// A language may have several level tracks; the journey shows one at a time and
// the next unlocks when the previous is complete.
const TRACKS: Record<string, TrackDef[]> = {
  ja: [
    { code: "jlpt-n5", framework: "JLPT", level: "N5", title: "JLPT N5", sortOrder: 1, scriptDeckIds: ["deck-ja-hiragana", "deck-ja-katakana", "deck-ja-kanji-n5"], vocab: true },
    { code: "jlpt-n4", framework: "JLPT", level: "N4", title: "JLPT N4", sortOrder: 2, scriptDeckIds: ["deck-ja-kanji-n4"], vocab: false },
  ],
  ko: [{ code: "topik-1", framework: "TOPIK", level: "1", title: "TOPIK I", sortOrder: 1, scriptDeckIds: ["deck-ko-hangul"], vocab: true }],
  zh: [{ code: "hsk-1", framework: "HSK", level: "1", title: "HSK 1", sortOrder: 1, scriptDeckIds: ["deck-zh-hanzi-hsk1"], vocab: true }],
  en: [{ code: "cefr-a1", framework: "CEFR", level: "A1", title: "CEFR A1", sortOrder: 1, scriptDeckIds: [], vocab: true }],
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
  "jlpt-n5": {
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
      {
        id: "l-ja-dialog1", title: "Café — order a coffee", kind: "dialog", xpReward: 30, estMinutes: 6, sortOrder: 5,
        metadata: {
          scenario: "Café — order a coffee",
          description: "You are at a café in Tokyo. Practice ordering a coffee and making a small request.",
          goal: "Order naturally and politely",
          turns: [
            { native: "いらっしゃいませ。ご注文はお決まりですか？", gloss: "Welcome! Have you decided on your order?" },
            { native: "かしこまりました。他に何かご注文されますか？", gloss: "Certainly. Would you like to order anything else?" },
          ],
          replies: [
            { native: "ホットコーヒーをお願いします。", gloss: "I'll have a hot coffee, please.", correct: true },
            { native: "アイスコーヒーをください。", gloss: "I'd like an iced coffee, please." },
            { native: "カフェラテをお願いします。", gloss: "I'll have a café latte, please." },
          ],
          tips: ["Use 「お願いします」 to make polite requests.", "Add 「〜を」 before the item you want."],
        },
        questions: [],
      },
      {
        id: "l-ja-speak1", title: "Say it: order a coffee", kind: "speaking", xpReward: 20, estMinutes: 4, sortOrder: 6,
        metadata: {
          phrase: "コーヒーをください。",
          reading: "こーひー を ください。",
          gloss: "Please give me a coffee.",
          tokens: [
            { native: "コーヒー", reading: "koohii" },
            { native: "を", reading: "wo" },
            { native: "ください", reading: "kudasai" },
          ],
          tip: "Make the final 「ください」 clear and polite. Keep your 「コーヒー」 long and natural.",
        },
        questions: [],
      },
    ],
  },

  "jlpt-n4": {
    id: "u-ja-n4-everyday", title: "Everyday Life", sortOrder: 1,
    lessons: [
      {
        id: "l-ja-n4-read1", title: "週末の予定", kind: "reading", xpReward: 25, estMinutes: 6, sortOrder: 1,
        metadata: {
          passage: "今週の週末、友達と京都に行くことにしました。\n朝早く電車に乗って、古いお寺やお城を見る予定です。\n昼ごはんは有名なうどん屋で食べようと思っています。\nもし時間があれば、着物を借りて写真も撮りたいです。\n日曜日の夜には帰らなければなりません。",
          highlight: "昼ごはんは有名なうどん屋で食べようと思っています。",
        },
        questions: [{
          id: "q-ja-n4-read1-1", kind: "mcq", prompt: "昼ごはんはどこで食べる予定ですか。",
          options: [{ text: "お寺" }, { text: "うどん屋" }, { text: "家" }, { text: "ホテル" }],
          answer: 1, explanation: "「有名なうどん屋で食べようと思っています」。", sortOrder: 1,
        }],
      },
      {
        id: "l-ja-n4-listen1", title: "電車の案内", kind: "listening", xpReward: 25, estMinutes: 5, sortOrder: 2,
        metadata: { transcript: "この電車は各駅停車です。お急ぎの方は次の駅で特急にお乗り換えください。" },
        questions: [{
          id: "q-ja-n4-listen1-1", kind: "mcq", prompt: "急ぐ人はどうすればいいですか。",
          options: [
            { text: "この電車に乗り続ける", sub: "Stay on this train" },
            { text: "次の駅で特急に乗り換える", sub: "Transfer to the express at the next station" },
            { text: "すぐに降りる", sub: "Get off immediately" },
            { text: "バスに乗る", sub: "Take a bus" },
          ],
          answer: 1, sortOrder: 1,
        }],
      },
      {
        id: "l-ja-n4-write1", title: "できる形を使う", kind: "writing", xpReward: 30, estMinutes: 7, sortOrder: 3,
        metadata: { example: "私は漢字が少し読めるようになりました。", focus: "potential form (〜られる / 〜える)" },
        questions: [{
          id: "q-ja-n4-write1-1", kind: "writing",
          prompt: "Write a sentence using the potential form (can do / became able to).",
          answer: { sample: "私は日本料理が作れます。" }, sortOrder: 1,
        }],
      },
      {
        id: "l-ja-n4-quiz1", title: "文法チェック", kind: "quiz", xpReward: 20, estMinutes: 5, sortOrder: 4,
        questions: [
          { id: "q-ja-n4-quiz1-1", kind: "mcq", prompt: "正しい助詞を選んでください：雨が降っている（　）、試合は中止です。", options: [{ text: "ので" }, { text: "のに" }, { text: "ながら" }, { text: "たり" }], answer: 0, explanation: "「ので」＝理由（because）。", sortOrder: 1 },
          { id: "q-ja-n4-quiz1-2", kind: "mcq", prompt: "「病院」の読み方は？", options: [{ text: "びょういん" }, { text: "びょうき" }, { text: "へいいん" }, { text: "びよういん" }], answer: 0, sortOrder: 2 },
          { id: "q-ja-n4-quiz1-3", kind: "mcq", prompt: "正しい形を選んでください：宿題をしなければ（　）。", options: [{ text: "なりません" }, { text: "いいです" }, { text: "ください" }, { text: "ましょう" }], answer: 0, explanation: "「〜なければなりません」＝must.", sortOrder: 3 },
        ],
      },
    ],
  },

  "topik-1": {
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
      {
        id: "l-ko-dialog1", title: "Café — order a coffee", kind: "dialog", xpReward: 30, estMinutes: 6, sortOrder: 5,
        metadata: {
          scenario: "Café — order a coffee",
          description: "You are at a café in Seoul. Practice ordering a coffee politely.",
          goal: "Order naturally and politely",
          turns: [
            { native: "어서 오세요. 주문하시겠어요?", gloss: "Welcome! Would you like to order?" },
            { native: "알겠습니다. 더 필요한 거 있으세요?", gloss: "Got it. Anything else?" },
          ],
          replies: [
            { native: "따뜻한 커피 주세요.", gloss: "A hot coffee, please.", correct: true },
            { native: "아이스 커피 주세요.", gloss: "An iced coffee, please." },
            { native: "카페라테 한 잔 주세요.", gloss: "One café latte, please." },
          ],
          tips: ["Use 「주세요」 to ask politely.", "Add 「~을/를」 before the item you want."],
        },
        questions: [],
      },
      {
        id: "l-ko-speak1", title: "Say it: order a coffee", kind: "speaking", xpReward: 20, estMinutes: 4, sortOrder: 6,
        metadata: {
          phrase: "커피 주세요.",
          reading: "keopi juseyo.",
          gloss: "A coffee, please.",
          tokens: [
            { native: "커피", reading: "keopi" },
            { native: "주세요", reading: "juseyo" },
          ],
          tip: "Keep 「주세요」 clear and polite.",
        },
        questions: [],
      },
    ],
  },

  "hsk-1": {
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
      {
        id: "l-zh-dialog1", title: "Café — order a coffee", kind: "dialog", xpReward: 30, estMinutes: 6, sortOrder: 5,
        metadata: {
          scenario: "Café — order a coffee",
          description: "You are at a café in Beijing. Practice ordering a coffee politely.",
          goal: "Order naturally and politely",
          turns: [
            { native: "欢迎光临！您想点什么？", gloss: "Welcome! What would you like to order?" },
            { native: "好的。还要别的吗？", gloss: "Okay. Anything else?" },
          ],
          replies: [
            { native: "我要一杯热咖啡。", gloss: "I'll have a hot coffee.", correct: true },
            { native: "请给我一杯冰咖啡。", gloss: "An iced coffee, please." },
            { native: "我要一杯拿铁。", gloss: "I'll have a latte." },
          ],
          tips: ["Use 「请」 to be polite.", "「一杯」 = one cup / glass."],
        },
        questions: [],
      },
      {
        id: "l-zh-speak1", title: "Say it: order a coffee", kind: "speaking", xpReward: 20, estMinutes: 4, sortOrder: 6,
        metadata: {
          phrase: "我要咖啡。",
          reading: "wǒ yào kāfēi.",
          gloss: "I want coffee.",
          tokens: [
            { native: "我", reading: "wǒ" },
            { native: "要", reading: "yào" },
            { native: "咖啡", reading: "kāfēi" },
          ],
          tip: "Give each tone its full shape — 咖啡 is first tone + first tone.",
        },
        questions: [],
      },
    ],
  },

  "cefr-a1": {
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
      {
        id: "l-en-dialog1", title: "Café — order a coffee", kind: "dialog", xpReward: 30, estMinutes: 6, sortOrder: 5,
        metadata: {
          scenario: "Café — order a coffee",
          description: "You are at a café. Practice ordering a coffee politely in English.",
          goal: "Order naturally and politely",
          turns: [
            { native: "Welcome! What can I get for you?", gloss: "The barista asks for your order." },
            { native: "Sure! Anything else?", gloss: "The barista asks if you want more." },
          ],
          replies: [
            { native: "I'll have a hot coffee, please.", gloss: "polite order", correct: true },
            { native: "Can I get an iced coffee?", gloss: "casual order" },
            { native: "A latte, please.", gloss: "short order" },
          ],
          tips: ["Use 'please' to sound polite.", "'Can I get…' is common in cafés."],
        },
        questions: [],
      },
      {
        id: "l-en-speak1", title: "Say it: order a coffee", kind: "speaking", xpReward: 20, estMinutes: 4, sortOrder: 6,
        metadata: {
          phrase: "I'd like a coffee, please.",
          reading: "",
          gloss: "Ordering politely",
          tokens: [
            { native: "I'd like", reading: "" },
            { native: "a coffee", reading: "" },
            { native: "please", reading: "" },
          ],
          tip: "Stress 'coffee' and end politely with 'please'.",
        },
        questions: [],
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

    for (const t of TRACKS[lang.code]) {
      const data = { framework: t.framework, level: t.level, title: t.title, sortOrder: t.sortOrder, languageId: language.id, isPublished: true };
      const track = await prisma.track.upsert({
        where: { code: t.code },
        create: { code: t.code, ...data },
        update: data,
      });

      const unit = UNITS[t.code];
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
  }

  // Build flashcard-lesson units from the imported decks (script first, then vocab).
  // Large decks are chunked into sets of CHUNK cards so a lesson stays bite-sized
  // and the journey shows real progression instead of one giant lesson.
  const CHUNK = 12;
  const makeFlashUnit = async (
    trackId: string,
    unitId: string,
    title: string,
    sortOrder: number,
    deckList: { id: string; title: string; count: number }[],
  ) => {
    const withCards = deckList.filter((d) => d.count > 0);
    if (withCards.length === 0) return;
    await prisma.unit.create({ data: { id: unitId, trackId, title, sortOrder } });
    let so = 1;
    for (const deck of withCards) {
      const sets = Math.max(1, Math.ceil(deck.count / CHUNK));
      for (let s = 0; s < sets; s += 1) {
        const label = sets > 1 ? `${deck.title} · Set ${s + 1}` : deck.title;
        await prisma.lesson.create({
          data: {
            id: `${unitId}-l${so}`,
            unitId,
            title: `Flashcards: ${label}`,
            kind: "flashcard",
            xpReward: 15,
            estMinutes: 5,
            sortOrder: so,
            isPublished: true,
            metadata: { deckId: deck.id, offset: s * CHUNK, limit: CHUNK },
          },
        });
        so += 1;
        lessonCount += 1;
      }
    }
  };

  // Each track surfaces its own beginner script (from scriptDeckIds); higher-level
  // kanji stay browsable in Characters + reviewable via SRS without flooding the map.
  const isCharDeck = (id: string) => /hiragana|katakana|hangul|kanji|hanzi|pinyin/.test(id);

  for (const lang of LANGUAGES) {
    const language = await prisma.language.findUnique({ where: { code: lang.code } });
    if (!language) continue;

    const decks = await prisma.deck.findMany({
      where: { languageId: language.id, isSystem: true },
      include: { _count: { select: { cards: true } } },
      orderBy: { title: "asc" },
    });
    const deckById = new Map(decks.map((d) => [d.id, { id: d.id, title: d.title, count: d._count.cards }]));
    const themeDecks = decks
      .filter((d) => !isCharDeck(d.id) && d._count.cards >= 6)
      .slice(0, 4)
      .map((d) => ({ id: d.id, title: d.title, count: d._count.cards }));

    for (const t of TRACKS[lang.code]) {
      const track = await prisma.track.findFirst({ where: { code: t.code } });
      if (!track) continue;
      const scriptDecks = t.scriptDeckIds.map((id) => deckById.get(id)).filter((d): d is { id: string; title: string; count: number } => !!d);
      await makeFlashUnit(track.id, `u-${t.code}-script`, "Script & Characters", 2, scriptDecks);
      if (t.vocab) await makeFlashUnit(track.id, `u-${t.code}-vocab`, "Core Vocabulary", 3, themeDecks);
    }
  }

  // Weave authored reading passages into the JP journey, matched to each level.
  const jaLanguage = await prisma.language.findUnique({ where: { code: "ja" } });
  if (jaLanguage) {
    const passages = readingJa.passages as { id: string; level: string; titleEn: string; minutes: number }[];
    for (const t of TRACKS.ja) {
      const track = await prisma.track.findFirst({ where: { code: t.code } });
      if (!track) continue;
      const levelPassages = passages.filter((p) => p.level === t.level);
      if (levelPassages.length === 0) continue;
      const unitId = `u-${t.code}-reading`;
      await prisma.unit.create({ data: { id: unitId, trackId: track.id, title: "Reading", sortOrder: 4 } });
      let so = 1;
      for (const p of levelPassages) {
        await prisma.lesson.create({
          data: {
            id: `${unitId}-l${so}`,
            unitId,
            title: `Read: ${p.titleEn}`,
            kind: "passage",
            xpReward: 20,
            estMinutes: p.minutes ?? 5,
            sortOrder: so,
            isPublished: true,
            metadata: { readingId: p.id },
          },
        });
        so += 1;
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
