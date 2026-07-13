"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Zap } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { awardGameXp } from "@/lib/gameActions";

export type ClozeItem = {
  id: string;
  level: string;
  before?: string;
  after?: string;
  sentence?: string;
  answer: string;
  options: string[];
  en: string;
  explain: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Split an item into the text before and after the blank.
function parts(item: ClozeItem): { before: string; after: string } {
  if (item.sentence) {
    const [before, after = ""] = item.sentence.split("＿");
    return { before, after };
  }
  return { before: item.before ?? "", after: item.after ?? "" };
}

export function ParticleCloze({ items }: { items: ClozeItem[] }) {
  const router = useRouter();
  const questions = useMemo(() => shuffle(items).slice(0, 10), [items]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [, startTransition] = useTransition();

  const q = questions[index];
  const { before, after } = q ? parts(q) : { before: "", after: "" };

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
    return <p className="py-16 text-center text-sm text-ink-soft">No cloze items available.</p>;
  }

  if (finished) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <Celebration
        title="Bagus sekali!"
        score={pct}
        stats={[
          { icon: <Check className="h-5 w-5" />, value: `${score}/${questions.length}`, label: "benar" },
          { icon: <Zap className="h-5 w-5" />, value: questions.length * 2, label: "XP", prefix: "+", countUp: true },
        ]}
        continueLabel="Main lagi"
        onContinue={() => router.refresh()}
        secondaryLabel="Kembali ke permainan"
        onSecondary={() => router.push("games")}
      />
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

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">Choose the correct particle · {q.level}</p>

      <div className="mt-4 rounded-2xl border hairline bg-paper p-6 text-center shadow-soft">
        <p className="font-display text-2xl leading-relaxed text-ink" lang="ja">
          {before}
          <span
            className="mx-1 inline-block min-w-[2.5rem] rounded-lg border-b-2 px-2 text-center font-bold"
            style={{
              borderColor: picked ? (picked === q.answer ? "#2F7D53" : "#B23A2E") : "var(--accent)",
              color: picked ? "var(--accent)" : "transparent",
            }}
          >
            {picked ? q.answer : "＿"}
          </span>
          {after}
        </p>
        <p className="mt-3 text-sm text-ink-soft">{q.en}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
              className="rounded-xl border px-4 py-3 text-center font-display text-xl font-bold text-ink transition-colors disabled:cursor-default"
              style={style}
              lang="ja"
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4">
          <p className="rounded-xl bg-paper-2 px-4 py-3 text-sm text-ink-soft">{q.explain}</p>
          <button onClick={next} className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
            {index + 1 >= questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
