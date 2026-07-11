/**
 * Japanese conjugation engine (rule-based, operates on the kana reading).
 * Covers godan / ichidan / する / 来る verbs and i- / na-adjectives.
 * Used by the Conjugation Drill practice.
 */

export type WordType = "godan" | "ichidan" | "suru" | "kuru" | "i-adj" | "na-adj";

export type ConjWord = {
  dict: string; // dictionary form (may include kanji)
  reading: string; // kana dictionary form — conjugation is done on this
  meaning: string;
  type: WordType;
};

export type FormKey = "polite" | "te" | "nai" | "past" | "negative";

export const FORM_LABEL: Record<FormKey, string> = {
  polite: "Polite (〜ます)",
  te: "て-form",
  nai: "Plain negative (〜ない)",
  past: "Plain past (〜た)",
  negative: "Negative",
};

// u-row → i-row (for ます stem) and → a-row (for ない).
const I_ROW: Record<string, string> = { う: "い", く: "き", ぐ: "ぎ", す: "し", つ: "ち", ぬ: "に", ぶ: "び", む: "み", る: "り" };
const A_ROW: Record<string, string> = { う: "わ", く: "か", ぐ: "が", す: "さ", つ: "た", ぬ: "な", ぶ: "ば", む: "ま", る: "ら" };

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

/** Return every drillable form for a word. */
export function conjugate(word: ConjWord): Partial<Record<FormKey, string>> {
  const r = word.reading;
  switch (word.type) {
    case "ichidan": {
      const stem = r.slice(0, -1); // drop る
      return { polite: stem + "ます", te: stem + "て", nai: stem + "ない", past: stem + "た" };
    }
    case "godan": {
      const last = r.slice(-1);
      const stem = r.slice(0, -1);
      return {
        polite: stem + (I_ROW[last] ?? last) + "ます",
        te: godanTe(r, false),
        nai: stem + (A_ROW[last] ?? last) + "ない",
        past: godanTe(r, true),
      };
    }
    case "suru": {
      const base = r.slice(0, -2); // drop する
      return { polite: base + "します", te: base + "して", nai: base + "しない", past: base + "した" };
    }
    case "kuru": {
      return { polite: "きます", te: "きて", nai: "こない", past: "きた" };
    }
    case "i-adj": {
      if (r === "いい" || r === "よい") return { negative: "よくない", past: "よかった", te: "よくて" };
      const stem = r.slice(0, -1); // drop い
      return { negative: stem + "くない", past: stem + "かった", te: stem + "くて" };
    }
    case "na-adj": {
      return { negative: r + "じゃない", past: r + "だった", te: r + "で" };
    }
  }
}

/** Which forms to quiz for a given word type. */
export function formsFor(type: WordType): FormKey[] {
  if (type === "i-adj" || type === "na-adj") return ["negative", "past", "te"];
  return ["polite", "te", "nai", "past"];
}
