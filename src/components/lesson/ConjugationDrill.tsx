"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Volume2, X } from "lucide-react";
import { awardGameXp } from "@/lib/gameActions";
import { conjugate, formsFor, FORM_LABEL, type ConjWord, type FormKey } from "@/lib/conjugation";

type Question = {
  word: ConjWord;
  form: FormKey;
  answer: string;
  options: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function buildQuestions(words: ConjWord[], count: number): Question[] {
  const qs: Question[] = [];
  for (const word of shuffle(words)) {
    const forms = conjugate(word);
    const keys = formsFor(word.type).filter((k) => forms[k]);
    if (keys.length === 0) continue;
    const form = shuffle(keys)[0];
    const answer = forms[form]!;
    // Distractors: this word's other forms, then plain-past/te of unrelated words.
    const others = keys.map((k) => forms[k]!).filter((v) => v !== answer);
    const pool = shuffle([...new Set(others)]).slice(0, 3);
    const options = shuffle([answer, ...pool]);
    if (options.length < 2) continue;
    qs.push({ word, form, answer, options });
    if (qs.length >= count) break;
  }
  return qs;
}

export function ConjugationDrill({ words }: { words: ConjWord[] }) {
  const router = useRouter();
  const questions = useMemo(() => buildQuestions(words, 10), [words]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [, startTransition] = useTransition();

  const q = questions[index];

  function choose(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      startTransition(async () => {
        await awardGameXp(questions.length * 2);
      });
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  if (questions.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-soft">No conjugation words available.</p>;
  }

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl font-extrabold" style={{ color: "var(--accent)" }}>Drill complete!</h1>
        <p className="mt-2 text-sm text-ink-soft">{score}/{questions.length} correct · +{questions.length * 2} XP</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => router.refresh()} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>Again</button>
          <button onClick={() => router.push("games")} className="rounded-xl border border-edge px-5 py-2.5 text-sm font-bold text-ink">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${(index / questions.length) * 100}%`, backgroundColor: "var(--accent)" }} />
        </div>
        <span className="text-xs font-semibold text-ink-soft">{index + 1}/{questions.length}</span>
        <button onClick={() => router.push("games")} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit"><X className="h-5 w-5" /></button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Conjugate to</p>
        <p className="mt-1 font-display text-lg font-bold" style={{ color: "var(--accent)" }}>{FORM_LABEL[q.form]}</p>
        <div className="mt-4 inline-flex items-center gap-2">
          <p className="font-display text-4xl font-bold text-ink" lang="ja">{q.word.dict}</p>
          <button onClick={() => speak(q.word.reading)} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-paper-2" aria-label="Play"><Volume2 className="h-5 w-5" /></button>
        </div>
        <p className="mt-1 text-sm text-ink-faint" lang="ja">{q.word.reading}</p>
        <p className="text-sm text-ink-soft">{q.word.meaning}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2.5">
        {q.options.map((opt) => {
          const isAnswer = opt === q.answer;
          const isPicked = picked === opt;
          let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
          if (picked && isAnswer) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
          else if (picked && isPicked && !isAnswer) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={!!picked}
              className="rounded-xl border px-4 py-3 text-center font-display text-lg font-bold text-ink transition-colors disabled:cursor-default"
              style={style}
              lang="ja"
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <button onClick={next} className="mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
          {index + 1 >= questions.length ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}
