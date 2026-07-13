/**
 * Surgical character generator for Korean + Chinese ONLY — regenerates
 * src/content/characters/{ko,zh}.json from the user's lingora data, structured
 * into category groups that the CharacterGrid tabs on. Does NOT touch ja.json
 * (Japanese is maintained separately by gen-kanji and has hand-fixed accuracy).
 * Run: node scripts/gen-chars-kozh.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DIR = "D:/Download/Side Project/lingora/assets/js/data";
const OUT = path.join(process.cwd(), "src", "content", "characters");

function loadVar(file, varName) {
  let code = fs.readFileSync(path.join(DIR, file), "utf8");
  code = code.replace(/window\.[A-Za-z_]+\s*=\s*[A-Za-z_]+;?/g, "");
  return new Function(`${code}\n;return ${varName};`)();
}
function write(f, groups) {
  fs.writeFileSync(path.join(OUT, f), JSON.stringify({ groups }, null, 0));
  const n = groups.reduce((s, g) => s + g.items.length, 0);
  console.log(`wrote characters/${f}: ${groups.length} groups, ${n} items`);
}

/* ---- Korean ---- */
const H = loadVar("hangul.js", "HangulData");
const jamo = (c) => ({
  char: c.jamo,
  sub: c.romanization,
  meaning: c.name || "",
  example: c.example ? `${c.example.syllable} · ${c.example.word} (${c.example.meaning})` : undefined,
});
const syl = (s) => ({ char: s.block, sub: s.romanization, meaning: `${s.consonant} + ${s.vowel}` });
write("ko.json", [
  { title: "Konsonan", items: H.getConsonants().map(jamo) },
  { title: "Vokal", items: H.getVowels().map(jamo) },
  { title: "Suku Kata", items: H.getSyllables().map(syl) },
]);

/* ---- Chinese ---- */
const HZ = loadVar("hanzi.js", "HanziData");
const P = loadVar("pinyin.js", "PinyinData");
const T = loadVar("zh-tones.js", "TonesData");
const hz = (c) => ({
  char: c.char,
  sub: c.pinyin,
  meaning: (c.meaning || []).join(", "),
  example: c.example ? `${c.example.sentence} (${c.example.pinyin}) — ${c.example.meaning}` : undefined,
});
const py = (p) => ({
  char: p.symbol,
  sub: p.ipa || "",
  meaning: p.desc || "",
  example: p.example ? `${p.example.hanzi} ${p.example.word} — ${p.example.meaning}` : undefined,
});
write("zh.json", [
  { title: "Hanzi · HSK 1", items: (HZ.hsk1 || []).map(hz) },
  { title: "Hanzi · HSK 2", items: (HZ.hsk2 || []).map(hz) },
  { title: "Hanzi · HSK 3", items: (HZ.hsk3 || []).map(hz) },
  { title: "Pinyin · Awal", items: (P.initials || []).map(py) },
  { title: "Pinyin · Akhir", items: (P.finals || []).map(py) },
  { title: "Nada", items: (T.tones || []).map((t) => ({ char: t.mark || String(t.number), sub: t.name, meaning: t.desc || t.description || "" })) },
]);

console.log("done.");
