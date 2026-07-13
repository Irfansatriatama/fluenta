/**
 * Japanese conjugation engine (rule-based, operates on the kana reading).
 * Covers godan / ichidan / する / 来る verbs and i- / na-adjectives.
 * Used by the Conjugation Drill practice. Grounded rules, not AI-generated —
 * every form is derived deterministically from the dictionary reading.
 */

export type WordType = "godan" | "ichidan" | "suru" | "kuru" | "i-adj" | "na-adj";

export type ConjWord = {
  dict: string; // dictionary form (may include kanji)
  reading: string; // kana dictionary form — conjugation is done on this
  meaning: string;
  type: WordType;
};

export type FormKey =
  | "polite" | "politePast" | "politeNeg" | "politePastNeg"
  | "te" | "nai" | "past" | "pastNeg"
  | "volitional" | "potential" | "passive" | "causative"
  | "imperative" | "conditionalBa" | "conditionalTara"
  | "progressive" | "tai"
  | "negative" | "adverb";

// Labels shown as the drill prompt. Keys shared by verbs AND adjectives
// (polite/politePast/politeNeg/past/te/conditionalBa) carry NO verb-only kana
// marker — e.g. adjective "polite" is 〜です, not 〜ます. Verb-only keys keep
// their marker.
export const FORM_LABEL: Record<FormKey, string> = {
  polite: "Bentuk sopan",
  politePast: "Sopan lampau",
  politeNeg: "Sopan negatif",
  politePastNeg: "Sopan lampau-negatif (〜ませんでした)",
  te: "Bentuk て",
  nai: "Negatif biasa (〜ない)",
  past: "Lampau biasa",
  pastNeg: "Lampau-negatif (〜なかった)",
  volitional: "Ajakan (〜よう)",
  potential: "Potensial / bisa (〜られる)",
  passive: "Pasif (〜られる)",
  causative: "Kausatif / menyuruh (〜せる)",
  imperative: "Perintah (命令形)",
  conditionalBa: "Syarat (andai)",
  conditionalTara: "Syarat (〜たら)",
  progressive: "Sedang (〜ている)",
  tai: "Ingin (〜たい)",
  negative: "Negatif",
  adverb: "Keterangan (〜く / 〜に)",
};

// u-row → other rows, for godan stem changes.
const I_ROW: Record<string, string> = { う: "い", く: "き", ぐ: "ぎ", す: "し", つ: "ち", ぬ: "に", ぶ: "び", む: "み", る: "り" };
const A_ROW: Record<string, string> = { う: "わ", く: "か", ぐ: "が", す: "さ", つ: "た", ぬ: "な", ぶ: "ば", む: "ま", る: "ら" };
const E_ROW: Record<string, string> = { う: "え", く: "け", ぐ: "げ", す: "せ", つ: "て", ぬ: "ね", ぶ: "べ", む: "め", る: "れ" };
const O_ROW: Record<string, string> = { う: "お", く: "こ", ぐ: "ご", す: "そ", つ: "と", ぬ: "の", ぶ: "ぼ", む: "も", る: "ろ" };

function godanTe(reading: string, past: boolean): string {
  const stem = reading.slice(0, -1);
  const last = reading.slice(-1);
  // 行く is the classic exception.
  if (reading === "いく") return past ? "いった" : "いって";
  if ("うつる".includes(last)) return stem + (past ? "った" : "って");
  if ("ぬぶむ".includes(last)) return stem + (past ? "んだ" : "んで");
  if (last === "く") return stem + (past ? "いた" : "いて");
  if (last === "ぐ") return stem + (past ? "いだ" : "いで");
  if (last === "す") return stem + (past ? "した" : "して");
  return stem + (past ? "った" : "って");
}

function godanForms(r: string): Partial<Record<FormKey, string>> {
  const last = r.slice(-1);
  const stem = r.slice(0, -1);
  const i = stem + (I_ROW[last] ?? last); // ます-stem
  const a = stem + (A_ROW[last] ?? last); // ない-stem
  const e = stem + (E_ROW[last] ?? last); // potential / imperative / ば
  const o = stem + (O_ROW[last] ?? last); // volitional
  const te = godanTe(r, false);
  const past = godanTe(r, true);
  return {
    polite: i + "ます", politePast: i + "ました", politeNeg: i + "ません", politePastNeg: i + "ませんでした",
    te, nai: a + "ない", past, pastNeg: a + "なかった",
    volitional: o + "う", potential: e + "る", passive: a + "れる", causative: a + "せる",
    imperative: e, conditionalBa: e + "ば", conditionalTara: past + "ら",
    progressive: te + "いる", tai: i + "たい",
  };
}

function ichidanForms(r: string): Partial<Record<FormKey, string>> {
  const s = r.slice(0, -1); // drop る
  return {
    polite: s + "ます", politePast: s + "ました", politeNeg: s + "ません", politePastNeg: s + "ませんでした",
    te: s + "て", nai: s + "ない", past: s + "た", pastNeg: s + "なかった",
    volitional: s + "よう", potential: s + "られる", passive: s + "られる", causative: s + "させる",
    imperative: s + "ろ", conditionalBa: s + "れば", conditionalTara: s + "たら",
    progressive: s + "ている", tai: s + "たい",
  };
}

function suruForms(r: string): Partial<Record<FormKey, string>> {
  const b = r.slice(0, -2); // drop する (compound: keep the noun prefix)
  return {
    polite: b + "します", politePast: b + "しました", politeNeg: b + "しません", politePastNeg: b + "しませんでした",
    te: b + "して", nai: b + "しない", past: b + "した", pastNeg: b + "しなかった",
    volitional: b + "しよう", potential: b + "できる", passive: b + "される", causative: b + "させる",
    imperative: b + "しろ", conditionalBa: b + "すれば", conditionalTara: b + "したら",
    progressive: b + "している", tai: b + "したい",
  };
}

function kuruForms(): Partial<Record<FormKey, string>> {
  return {
    polite: "きます", politePast: "きました", politeNeg: "きません", politePastNeg: "きませんでした",
    te: "きて", nai: "こない", past: "きた", pastNeg: "こなかった",
    volitional: "こよう", potential: "こられる", passive: "こられる", causative: "こさせる",
    imperative: "こい", conditionalBa: "くれば", conditionalTara: "きたら",
    progressive: "きている", tai: "きたい",
  };
}

function iAdjForms(r: string): Partial<Record<FormKey, string>> {
  if (r === "いい" || r === "よい") {
    return { negative: "よくない", past: "よかった", te: "よくて", polite: "いいです", politeNeg: "よくないです", politePast: "よかったです", conditionalBa: "よければ", adverb: "よく" };
  }
  const s = r.slice(0, -1); // drop い
  return {
    negative: s + "くない", past: s + "かった", te: s + "くて",
    polite: r + "です", politeNeg: s + "くないです", politePast: s + "かったです",
    conditionalBa: s + "ければ", adverb: s + "く",
  };
}

function naAdjForms(r: string): Partial<Record<FormKey, string>> {
  return {
    negative: r + "じゃない", past: r + "だった", te: r + "で",
    polite: r + "です", politeNeg: r + "じゃないです", politePast: r + "でした",
    conditionalBa: r + "なら", adverb: r + "に",
  };
}

/** Return every derivable form for a word. */
export function conjugate(word: ConjWord): Partial<Record<FormKey, string>> {
  const r = word.reading;
  switch (word.type) {
    case "godan": return godanForms(r);
    case "ichidan": return ichidanForms(r);
    case "suru": return suruForms(r);
    case "kuru": return kuruForms();
    case "i-adj": return iAdjForms(r);
    case "na-adj": return naAdjForms(r);
  }
}

const VERB_FORMS: FormKey[] = [
  "polite", "politePast", "politeNeg", "te", "nai", "past", "pastNeg",
  "volitional", "potential", "passive", "causative", "imperative",
  "conditionalBa", "conditionalTara", "progressive", "tai",
];
const ADJ_FORMS: FormKey[] = ["negative", "past", "te", "polite", "politeNeg", "politePast", "conditionalBa", "adverb"];

/** Which forms to quiz for a given word type. */
export function formsFor(type: WordType): FormKey[] {
  return type === "i-adj" || type === "na-adj" ? ADJ_FORMS : VERB_FORMS;
}
