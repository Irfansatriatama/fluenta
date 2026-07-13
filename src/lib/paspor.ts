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
