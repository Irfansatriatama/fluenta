import gJa from "@/content/grammar/ja.json";
import gKo from "@/content/grammar/ko.json";
import gZh from "@/content/grammar/zh.json";
import gEn from "@/content/grammar/en.json";
import dJa from "@/content/dialogs/ja.json";
import dKo from "@/content/dialogs/ko.json";
import dZh from "@/content/dialogs/zh.json";
import dEn from "@/content/dialogs/en.json";
import cJa from "@/content/characters/ja.json";
import cKo from "@/content/characters/ko.json";
import cZh from "@/content/characters/zh.json";
import rJa from "@/content/reading/ja.json";

export type Example = { native: string; roman: string; gloss: string };
export type GrammarPattern = {
  id: string;
  pattern: string;
  reading?: string;
  meaning: string;
  level: string;
  category: string;
  explanation: string;
  examples: Example[];
  notes?: string;
};
export type DialogLine = { speaker: string; native: string; roman: string; gloss: string };
export type Dialog = {
  id: string;
  title: string;
  icon?: string;
  level?: string;
  description: string;
  lines: DialogLine[];
};
export type CharItem = { char: string; sub: string; meaning: string; example?: string };
export type CharGroup = { title: string; items: CharItem[] };
export type ReadingBlock = { speaker?: string; jp: string; reading: string; en: string };
export type ReadingVocab = { word: string; reading: string; meaning: string };
export type ReadingQuestion = { q: string; options: string[]; answer: number; explanation?: string };
export type ReadingPassage = {
  id: string;
  type: "news" | "conversation" | "story";
  level: string;
  title: string;
  titleEn: string;
  topic: string;
  summary: string;
  minutes: number;
  blocks: ReadingBlock[];
  vocab: ReadingVocab[];
  questions: ReadingQuestion[];
};

const GRAMMAR: Record<string, { patterns: GrammarPattern[] }> = {
  ja: gJa as { patterns: GrammarPattern[] },
  ko: gKo as { patterns: GrammarPattern[] },
  zh: gZh as { patterns: GrammarPattern[] },
  en: gEn as { patterns: GrammarPattern[] },
};
const DIALOGS: Record<string, { dialogs: Dialog[] }> = {
  ja: dJa as { dialogs: Dialog[] },
  ko: dKo as { dialogs: Dialog[] },
  zh: dZh as { dialogs: Dialog[] },
  en: dEn as { dialogs: Dialog[] },
};
const CHARACTERS: Record<string, { groups: CharGroup[] }> = {
  ja: cJa as { groups: CharGroup[] },
  ko: cKo as { groups: CharGroup[] },
  zh: cZh as { groups: CharGroup[] },
};
const READING: Record<string, { passages: ReadingPassage[] }> = {
  ja: rJa as { passages: ReadingPassage[] },
};

export function getGrammar(lang: string): GrammarPattern[] {
  return GRAMMAR[lang]?.patterns ?? [];
}
export function getDialogs(lang: string): Dialog[] {
  return DIALOGS[lang]?.dialogs ?? [];
}
export function getDialog(lang: string, id: string): Dialog | null {
  return getDialogs(lang).find((d) => d.id === id) ?? null;
}
export function getCharacters(lang: string): CharGroup[] {
  return CHARACTERS[lang]?.groups ?? [];
}
export function getReading(lang: string): ReadingPassage[] {
  return READING[lang]?.passages ?? [];
}
export function getReadingPassage(lang: string, id: string): ReadingPassage | null {
  return getReading(lang).find((p) => p.id === id) ?? null;
}

// Which study tools have content for a language (for the home grid).
export function studyTools(lang: string) {
  return {
    grammar: getGrammar(lang).length,
    dialogs: getDialogs(lang).length,
    characters: getCharacters(lang).reduce((n, g) => n + g.items.length, 0),
    reading: getReading(lang).length,
  };
}
