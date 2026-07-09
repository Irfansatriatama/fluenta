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

// Which study tools have content for a language (for the home grid).
export function studyTools(lang: string) {
  return {
    grammar: getGrammar(lang).length,
    dialogs: getDialogs(lang).length,
    characters: getCharacters(lang).reduce((n, g) => n + g.items.length, 0),
  };
}
