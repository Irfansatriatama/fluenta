/**
 * Downloads KanjiVG stroke paths for the kana + Kanji N5/N4 set and writes
 * src/content/strokes/ja.json as { [char]: [pathD, ...] } in stroke order.
 *
 * KanjiVG © Ulrich Apel / kanjivg.tagaini.net, CC BY-SA 3.0.
 * Run with: node scripts/gen-strokes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KANJI = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/data/kanji.json"), "utf8"));
const CHARS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/characters/ja.json"), "utf8"));

const set = new Set();
for (const g of CHARS.groups) {
  if (/hiragana|katakana/i.test(g.title)) for (const it of g.items) set.add(it.char);
}
// All JLPT kanji (N5→N1) so every level can be traced.
for (const k of KANJI) if (k.jlpt) set.add(k.char);

const chars = [...set].filter((c) => c && [...c].length === 1);
const hex = (c) => c.codePointAt(0).toString(16).padStart(5, "0");
const PATH_RE = /<path\b[^>]*\bd="([^"]+)"/g;

async function fetchOne(c) {
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex(c)}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [c, null];
    const svg = await res.text();
    const paths = [...svg.matchAll(PATH_RE)].map((m) => m[1]);
    return [c, paths.length ? paths : null];
  } catch {
    return [c, null];
  }
}

const out = {};
let missing = 0;
const CONC = 24;
for (let i = 0; i < chars.length; i += CONC) {
  const results = await Promise.all(chars.slice(i, i + CONC).map(fetchOne));
  for (const [c, paths] of results) {
    if (paths) out[c] = paths;
    else missing++;
  }
}

const outPath = path.join(ROOT, "src/content/strokes/ja.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`wrote strokes/ja.json — ${Object.keys(out).length} characters, ${missing} missing`);
