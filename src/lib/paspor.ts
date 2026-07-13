// ============================================================
//  Paspor — the cultural identity of each language "country".
// ------------------------------------------------------------
//  The engine stays one template; the SOUL is specific. Each passport
//  gets its own arrival — a native greeting, an Indonesian sense of the
//  place, and its OWN writing system as texture (an honest artefact, never
//  a flag or stereotype). Same passport, different world — still Fluenta.
//
//  Identity is DATA, not forked components. Tune freely.
// ============================================================

export type Paspor = {
  greeting: string; // native "welcome"
  greetingSub: string; // romanization / reading
  world: string; // Indonesian name of the country/world
  ethos: string; // a short cultural sense of the place (Indonesian)
  script: string; // one representative character — the watermark glyph
};

const PASPOR: Record<string, Paspor> = {
  ja: {
    greeting: "ようこそ",
    greetingSub: "yōkoso",
    world: "Jepang",
    ethos: "Tanah presisi dan kesantunan — tiap aksara punya bentuk dan ritmenya sendiri.",
    script: "あ",
  },
  ko: {
    greeting: "환영합니다",
    greetingSub: "hwan-yeong",
    world: "Korea",
    ethos: "Hangeul yang dirancang untuk semua orang — logis, cepat, dan hidup.",
    script: "가",
  },
  zh: {
    greeting: "欢迎",
    greetingSub: "huānyíng",
    world: "Tiongkok",
    ethos: "Ribuan tahun makna terlipat rapi dalam tiap guratan.",
    script: "字",
  },
  en: {
    greeting: "Welcome",
    greetingSub: "",
    world: "Inggris",
    ethos: "Bahasa penghubung dunia — satu pintu menuju hampir semua tempat.",
    script: "A",
  },
};

// -- Cultural rank ladder per passport (lingora-style 入門→達人). Rank is a
//    sense of standing in that world — dignified native terms, glossed in
//    Indonesian, tied to REAL progress (the framework level you're on). The
//    entry rank is honourable, never "rank zero". ------------------------------
export type Rank = { native: string; gloss: string };

const LEVELS_BY_FRAMEWORK: Record<string, string[]> = {
  JLPT: ["N5", "N4", "N3", "N2", "N1"],
  TOPIK: ["1", "2", "3", "4", "5", "6"],
  HSK: ["1", "2", "3", "4", "5", "6"],
  CEFR: ["A1", "A2", "B1", "B2", "C1", "C2"],
};

const RANKS: Record<string, Rank[]> = {
  ja: [
    { native: "入門", gloss: "Pemula" },
    { native: "初級", gloss: "Dasar" },
    { native: "中級", gloss: "Menengah" },
    { native: "上級", gloss: "Lanjut" },
    { native: "達人", gloss: "Ahli" },
  ],
  ko: [
    { native: "입문", gloss: "Pemula" },
    { native: "초급", gloss: "Dasar" },
    { native: "중급", gloss: "Menengah" },
    { native: "고급", gloss: "Lanjut" },
    { native: "유창", gloss: "Fasih" },
    { native: "달인", gloss: "Ahli" },
  ],
  zh: [
    { native: "入门", gloss: "Pemula" },
    { native: "初级", gloss: "Dasar" },
    { native: "中级", gloss: "Menengah" },
    { native: "高级", gloss: "Lanjut" },
    { native: "精通", gloss: "Mahir" },
    { native: "大师", gloss: "Ahli" },
  ],
  en: [
    { native: "Beginner", gloss: "Pemula" },
    { native: "Elementary", gloss: "Dasar" },
    { native: "Intermediate", gloss: "Menengah" },
    { native: "Advanced", gloss: "Lanjut" },
    { native: "Fluent", gloss: "Fasih" },
    { native: "Proficient", gloss: "Ahli" },
  ],
};

export type RankInfo = { native: string; gloss: string; step: number; total: number };

// The current rank for a passport, from its framework level. Falls back to the
// entry rank when the level is unknown — a new learner still has a name.
export function getRank(langCode: string, framework: string, level: string): RankInfo | null {
  const ranks = RANKS[langCode];
  const levels = LEVELS_BY_FRAMEWORK[framework];
  if (!ranks || ranks.length === 0) return null;
  const found = levels ? levels.indexOf(level) : -1;
  const idx = Math.min(Math.max(found, 0), ranks.length - 1);
  const r = ranks[idx];
  return { native: r.native, gloss: r.gloss, step: idx + 1, total: ranks.length };
}

const FALLBACK: Paspor = {
  greeting: "Selamat datang",
  greetingSub: "",
  world: "",
  ethos: "Dunia baru menantimu.",
  script: "◈",
};

export function getPaspor(code: string): Paspor {
  return PASPOR[code] ?? FALLBACK;
}
