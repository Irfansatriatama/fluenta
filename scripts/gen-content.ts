/**
 * One-time content generator: reads the user's own lingora + englishpath data
 * files and writes normalized JSON into src/content/. Run locally with tsx;
 * the JSON is committed so Vercel builds without the external files.
 */
import fs from "node:fs";
import path from "node:path";

const LINGORA = "D:/Download/Side Project/lingora/assets/js/data";
const ENGLISHPATH = "D:/Download/Side Project/englishpath/assets/js/data";
const OUT = path.join(process.cwd(), "src", "content");

function loadVar<T>(dir: string, file: string, varName: string): T {
  let code = fs.readFileSync(path.join(dir, file), "utf8");
  code = code.replace(/window\.[A-Za-z_]+\s*=\s*[A-Za-z_]+;?/g, "");
  return new Function(`${code}\n;return ${varName};`)() as T;
}

function write(rel: string, data: unknown) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 0));
  const n = Array.isArray(data) ? data.length : Object.keys(data as object).length;
  console.log(`wrote ${rel} (${n})`);
}

type Ex = { native: string; roman: string; gloss: string };
type Pattern = { id: string; pattern: string; reading?: string; meaning: string; level: string; category: string; explanation: string; examples: Ex[]; notes?: string };
type Dialog = { id: string; title: string; icon?: string; level?: string; description: string; lines: { speaker: string; native: string; roman: string; gloss: string }[] };
type CharItem = { char: string; sub: string; meaning: string; example?: string };
type CharGroup = { title: string; items: CharItem[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/* ---------------- GRAMMAR ---------------- */
function genGrammar() {
  const jp = loadVar<Any>(LINGORA, "jp-grammar.js", "JpGrammarData");
  const jpPat: Pattern[] = (jp.patterns ?? jp.getAll?.() ?? []).map((p: Any) => ({
    id: p.id, pattern: p.pattern, reading: p.reading, meaning: p.meaning, level: p.level, category: p.category ?? "",
    explanation: p.explanation, notes: p.notes,
    examples: (p.examples ?? []).map((e: Any) => ({ native: e.jp, roman: e.romaji, gloss: e.id })),
  }));
  write("grammar/ja.json", { patterns: jpPat });

  const kr = loadVar<Any>(LINGORA, "kr-grammar.js", "KrGrammarData");
  const krPat: Pattern[] = (kr.patterns ?? kr.getAll?.() ?? []).map((p: Any) => ({
    id: p.id, pattern: p.pattern, reading: p.reading, meaning: p.meaning, level: p.level, category: p.category ?? "",
    explanation: p.explanation, notes: p.notes,
    examples: (p.examples ?? []).map((e: Any) => ({ native: e.kr, roman: e.roman ?? e.romanization, gloss: e.id })),
  }));
  write("grammar/ko.json", { patterns: krPat });

  const en = loadVar<Any>(ENGLISHPATH, "grammar-data.js", "GRAMMAR_DATA");
  const topics: Any[] = en.getTopics?.() ?? en.topics ?? [];
  const enPat: Pattern[] = topics.map((t: Any) => ({
    id: t.id, pattern: t.title, meaning: t.shortDesc ?? "", level: t.level ?? "", category: t.category ?? "",
    explanation: (t.sections ?? []).map((s: Any) => `${s.heading ? s.heading + ": " : ""}${s.explanation}`).join("\n\n"),
    examples: (t.sections ?? []).flatMap((s: Any) => (s.examples ?? [])).slice(0, 4).map((e: Any) =>
      typeof e === "string" ? { native: e, roman: "", gloss: "" } : { native: e.en ?? e.text ?? e.sentence ?? "", roman: "", gloss: e.id ?? e.translation ?? "" }),
  }));
  write("grammar/en.json", { patterns: enPat });
}

/* ---------------- DIALOGS ---------------- */
function normDialogs(arr: Any[], nativeKey: string): Dialog[] {
  return (arr ?? []).map((d: Any) => ({
    id: d.id, title: d.situasi ?? d.title ?? d.id, icon: d.icon, level: d.level,
    description: d.deskripsi ?? d.description ?? "",
    lines: (d.lines ?? []).map((l: Any) => ({ speaker: l.speaker, native: l[nativeKey] ?? l.text ?? "", roman: l.romaji ?? l.roman ?? l.pinyin ?? "", gloss: l.id ?? l.translation ?? "" })),
  }));
}
function genDialogs() {
  write("dialogs/ja.json", { dialogs: normDialogs(loadVar<Any>(LINGORA, "jp-dialogs.js", "JP_DIALOGS"), "jp") });
  write("dialogs/ko.json", { dialogs: normDialogs(loadVar<Any>(LINGORA, "kr-dialogs.js", "KR_DIALOGS"), "kr") });
  write("dialogs/zh.json", { dialogs: normDialogs(loadVar<Any>(LINGORA, "zh-dialogs.js", "ZH_DIALOGS"), "zh") });
  const en = loadVar<Any>(ENGLISHPATH, "dialog-data.js", "DIALOG_DATA");
  const enArr: Any[] = en.getScenes?.() ?? en.dialogs ?? (Array.isArray(en) ? en : []);
  write("dialogs/en.json", { dialogs: normDialogs(enArr, "text") });
}

/* ---------------- CHARACTERS ---------------- */
function kanaGroup(title: string, data: Any): CharGroup {
  const all = data.all ?? [...(data.basic ?? []), ...(data.dakuten ?? []), ...(data.yoon ?? [])];
  return { title, items: all.map((c: Any) => ({ char: c.char, sub: c.romaji, meaning: c.example ? `${c.example.word} (${c.example.meaning})` : "", })) };
}
function genCharacters() {
  const hira = loadVar<Any>(LINGORA, "hiragana.js", "HiraganaData");
  const kata = loadVar<Any>(LINGORA, "katakana.js", "KatakanaData");
  const kanji = loadVar<Any>(LINGORA, "kanji.js", "KanjiData");
  const kanjiItems: CharItem[] = [...(kanji.n5 ?? []), ...(kanji.n4 ?? [])].map((k: Any) => ({
    char: k.char, sub: [...(k.onyomi ?? []), ...(k.kunyomi ?? [])].join(" · "),
    meaning: (k.meaning ?? []).join(", "), example: k.example ? `${k.example.word} (${k.example.reading}) — ${k.example.meaning}` : undefined,
  }));
  write("characters/ja.json", { groups: [kanaGroup("Hiragana", hira), kanaGroup("Katakana", kata), { title: "Kanji (N5–N4)", items: kanjiItems }] });

  const hangul = loadVar<Any>(LINGORA, "hangul.js", "HangulData");
  const hAll = hangul.getAll?.() ?? hangul.all ?? [];
  const hItems: CharItem[] = hAll.map((c: Any) => ({ char: c.jamo ?? c.char ?? c.hangul, sub: c.romanization ?? c.romaji ?? c.roman ?? "", meaning: c.name ?? c.type ?? (c.example ? `${c.example.word} (${c.example.meaning})` : "") }));
  write("characters/ko.json", { groups: [{ title: "Hangul", items: hItems }] });

  const hanzi = loadVar<Any>(LINGORA, "hanzi.js", "HanziData");
  const hzAll = [...(hanzi.hsk1 ?? []), ...(hanzi.hsk2 ?? [])];
  const hzItems: CharItem[] = hzAll.map((c: Any) => ({ char: c.char, sub: c.pinyin, meaning: (c.meaning ?? []).join(", "), example: c.example ? `${c.example.sentence} — ${c.example.meaning}` : undefined }));
  const pinyin = loadVar<Any>(LINGORA, "pinyin.js", "PinyinData");
  const initials: CharItem[] = (pinyin.initials ?? []).map((p: Any) => ({ char: p.symbol, sub: p.ipa, meaning: p.desc }));
  const finals: CharItem[] = (pinyin.finals ?? []).map((p: Any) => ({ char: p.symbol, sub: p.ipa ?? "", meaning: p.desc ?? "" }));
  const tones = loadVar<Any>(LINGORA, "zh-tones.js", "TonesData");
  const toneItems: CharItem[] = (tones.tones ?? []).map((t: Any) => ({ char: String(t.number), sub: t.name, meaning: t.description ?? t.desc ?? "" }));
  write("characters/zh.json", { groups: [{ title: "Hanzi (HSK 1–2)", items: hzItems }, { title: "Pinyin Initials", items: initials }, { title: "Pinyin Finals", items: finals }, { title: "Tones", items: toneItems }] });
}

genGrammar();
genDialogs();
genCharacters();
console.log("done.");
