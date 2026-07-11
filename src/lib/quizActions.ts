"use server";

import particlesData from "@/content/practice/particles-ja.json";
import { prisma } from "@/lib/prisma";
import { getGrammar } from "@/lib/staticContent";

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  skill?: string;
};

type ParticleItem = {
  id: string; level: string; before?: string; after?: string; sentence?: string;
  answer: string; options: string[]; en: string; explain: string;
};

const LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"];
const atOrBelow = (lvl: string, sel: string) => {
  const a = LEVEL_ORDER.indexOf(lvl.toUpperCase());
  const b = LEVEL_ORDER.indexOf(sel.toUpperCase());
  return a >= 0 && b >= 0 && a <= b;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Build a 4-option MCQ: the verified correct value + 3 distinct distractors
// drawn from the same verified pool. The correct answer is never invented.
function mcq(
  q: string,
  correct: string,
  distractorPool: string[],
  explanation: string,
  skill: string,
): QuizQuestion | null {
  const distractors: string[] = [];
  for (const d of shuffle(distractorPool)) {
    if (distractors.length >= 3) break;
    if (d !== correct && !distractors.includes(d) && d.trim().length > 0) distractors.push(d);
  }
  if (distractors.length < 3) return null;
  const options = shuffle([correct, ...distractors]);
  return { q, options, answer: options.indexOf(correct), explanation, skill };
}

type Card = { front: string; back: string; reading: string | null };

async function vocabPool(languageId: string): Promise<Card[]> {
  const decks = await prisma.deck.findMany({
    where: { languageId, isSystem: true },
    select: { id: true },
  });
  const ids = decks.map((d) => d.id).filter((id) => !/kanji|hanzi|pinyin/.test(id));
  const cards = await prisma.card.findMany({
    where: { deckId: { in: ids } },
    select: { front: true, back: true, reading: true },
    take: 600,
  });
  return cards.filter((c) => c.front && c.back);
}

async function kanjiPool(languageId: string, level: string): Promise<Card[]> {
  const deckIds = LEVEL_ORDER.filter((l) => atOrBelow(l, level)).map((l) => `deck-ja-kanji-${l.toLowerCase()}`);
  const cards = await prisma.card.findMany({
    where: { deckId: { in: deckIds } },
    select: { front: true, back: true, reading: true },
    take: 800,
  });
  return cards.filter((c) => c.front && c.back);
}

// Grounded quiz: every correct answer comes from verified content, so it is
// accurate on any AI provider (indeed, it needs no AI at all).
export async function buildQuiz(input: {
  languageName: string;
  level: string;
  focus: string;
  count?: number;
}): Promise<{ available: boolean; questions: QuizQuestion[] }> {
  const count = Math.min(12, Math.max(4, input.count ?? 8));
  if (input.languageName !== "Japanese") return { available: true, questions: [] };

  const language = await prisma.language.findUnique({ where: { code: "ja" } });
  const grammar = getGrammar("ja").filter((g) => atOrBelow(g.level || "N5", input.level));
  const particles = (particlesData.items as ParticleItem[]).filter((p) => atOrBelow(p.level, input.level));
  const vocab = language ? await vocabPool(language.id) : [];
  const kanji = language ? await kanjiPool(language.id, input.level) : [];

  // Which builders are usable given the pools + focus.
  const builders: (() => QuizQuestion | null)[] = [];

  const grammarMeaning = () => {
    if (grammar.length < 4) return null;
    const g = pick(grammar);
    return mcq(`「${g.pattern}」の意味は？`, g.meaning, grammar.map((x) => x.meaning), g.explanation ?? "", "grammar");
  };
  const grammarPattern = () => {
    if (grammar.length < 4) return null;
    const g = pick(grammar);
    return mcq(`Which grammar means: "${g.meaning}"?`, g.pattern, grammar.map((x) => x.pattern), g.explanation ?? "", "grammar");
  };
  const vocabMeaning = () => {
    if (vocab.length < 4) return null;
    const c = pick(vocab);
    const q = c.reading ? `${c.front}（${c.reading}）の意味は？` : `${c.front} の意味は？`;
    return mcq(q, c.back, vocab.map((x) => x.back), c.reading ? `${c.front} = ${c.reading}` : "", "vocab");
  };
  const vocabWord = () => {
    if (vocab.length < 4) return null;
    const c = pick(vocab);
    return mcq(`Which word means "${c.back}"?`, c.front, vocab.map((x) => x.front), c.reading ? `${c.front}（${c.reading}）` : "", "vocab");
  };
  const kanjiMeaning = () => {
    if (kanji.length < 4) return null;
    const c = pick(kanji);
    return mcq(`「${c.front}」の意味は？`, c.back, kanji.map((x) => x.back), c.reading ? `Reading: ${c.reading}` : "", "kanji");
  };
  const particleCloze = () => {
    if (particles.length === 0) return null;
    const p = pick(particles);
    const stem = p.sentence ? p.sentence.replace("＿", "（　）") : `${p.before ?? ""}（　）${p.after ?? ""}`;
    const ans = p.options.indexOf(p.answer);
    if (ans < 0 || p.options.length < 2) return null;
    return { q: `${stem}\n${p.en}`, options: p.options, answer: ans, explanation: p.explain, skill: "grammar" };
  };

  const byFocus: Record<string, (() => QuizQuestion | null)[]> = {
    grammar: [grammarMeaning, grammarPattern, particleCloze],
    vocab: [vocabMeaning, vocabWord],
    kanji: [kanjiMeaning],
    mixed: [grammarMeaning, grammarPattern, particleCloze, vocabMeaning, vocabWord, kanjiMeaning],
  };
  builders.push(...(byFocus[input.focus] ?? byFocus.mixed));

  const questions: QuizQuestion[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (questions.length < count && attempts < count * 12) {
    attempts += 1;
    const q = pick(builders)();
    if (q && !seen.has(q.q)) {
      seen.add(q.q);
      questions.push(q);
    }
  }
  return { available: true, questions };
}
