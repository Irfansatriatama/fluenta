/**
 * Regenerates the Japanese Characters browse page from the full kanji dataset
 * (scripts/data/kanji.json — KANJIDIC2 / EDRDG, CC BY-SA 4.0).
 *
 * Kana groups (Hiragana / Katakana) already written by gen-content.ts are kept;
 * the Kanji groups are rebuilt per JLPT level (N5→N1) plus a Jōyō-extra group.
 * Run with: npm run gen:kanji
 */
import fs from "node:fs";
import path from "node:path";

type Kanji = {
  char: string;
  jlpt: number | null;
  grade: number | null;
  freq: number | null;
  strokes: number | null;
  on: string[];
  kun: string[];
  meanings: string[];
};
type CharItem = { char: string; sub: string; meaning: string; example?: string };
type CharGroup = { title: string; items: CharItem[] };

const ROOT = process.cwd();
const DATA = path.join(ROOT, "scripts", "data", "kanji.json");
const OUT = path.join(ROOT, "src", "content", "characters", "ja.json");

const kanji: Kanji[] = JSON.parse(fs.readFileSync(DATA, "utf8"));

const readings = (k: Kanji): string => {
  const on = k.on.join("・");
  const kun = k.kun.join("・");
  return [on, kun].filter(Boolean).join("  |  ");
};

const toItem = (k: Kanji): CharItem => ({
  char: k.char,
  sub: readings(k),
  meaning: k.meanings.slice(0, 3).join(", "),
});

const LEVELS: { title: string; test: (k: Kanji) => boolean }[] = [
  { title: "Kanji · JLPT N5", test: (k) => k.jlpt === 5 },
  { title: "Kanji · JLPT N4", test: (k) => k.jlpt === 4 },
  { title: "Kanji · JLPT N3", test: (k) => k.jlpt === 3 },
  { title: "Kanji · JLPT N2", test: (k) => k.jlpt === 2 },
  { title: "Kanji · JLPT N1", test: (k) => k.jlpt === 1 },
  { title: "Kanji · Jōyō (extra)", test: (k) => k.jlpt == null },
];

const kanjiGroups: CharGroup[] = LEVELS.map((lv) => ({
  title: lv.title,
  items: kanji.filter(lv.test).map(toItem),
})).filter((g) => g.items.length > 0);

// Keep the existing kana groups, drop any previous kanji group, append the new ones.
const existing: { groups: CharGroup[] } = JSON.parse(fs.readFileSync(OUT, "utf8"));
const kanaGroups = existing.groups.filter((g) => !/kanji/i.test(g.title));

const merged = { groups: [...kanaGroups, ...kanjiGroups] };
fs.writeFileSync(OUT, JSON.stringify(merged, null, 0));

const total = kanjiGroups.reduce((n, g) => n + g.items.length, 0);
console.log(
  `wrote characters/ja.json — ${kanaGroups.length} kana groups + ${kanjiGroups.length} kanji groups (${total} kanji)`,
);
