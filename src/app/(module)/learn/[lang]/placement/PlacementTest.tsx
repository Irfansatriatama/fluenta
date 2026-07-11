"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, X } from "lucide-react";
import { buildPlacement, recommendPlacement, type PlacementQuestion } from "@/lib/quizActions";
import { activateLanguage } from "./actions";

const ORDER = ["N5", "N4", "N3"];
const ENUM: Record<string, string> = { N5: "Beginner", N4: "Elementary", N3: "Intermediate" };

export function PlacementTest({ lang, languageName }: { lang: string; languageName: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "test" | "scoring" | "done" | "unavailable">("loading");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tally, setTally] = useState<Record<string, { correct: number; total: number }>>({});
  const [result, setResult] = useState<{ startLevel: string; message: string } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await buildPlacement(languageName);
      if (res.questions.length < 4) setPhase("unavailable");
      else {
        setQuestions(res.questions);
        setPhase("test");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[index];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    setTally((prev) => {
      const cur = prev[q.level] ?? { correct: 0, total: 0 };
      return { ...prev, [q.level]: { correct: cur.correct + (i === q.answer ? 1 : 0), total: cur.total + 1 } };
    });
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    // finished — score deterministically, then ask AI for advice.
    setPhase("scoring");
    const perLevel = ORDER.map((lv) => ({ level: lv, ...(tally[lv] ?? { correct: 0, total: 0 }) }));
    let startLevel = "N3";
    for (const lv of ORDER) {
      const t = tally[lv] ?? { correct: 0, total: 0 };
      const acc = t.total ? t.correct / t.total : 0;
      if (acc < 0.6) {
        startLevel = lv;
        break;
      }
    }
    startTransition(async () => {
      const rec = await recommendPlacement({ languageName, startLevel, perLevel });
      setResult({ startLevel, message: rec.message });
      setPhase("done");
    });
  }

  const progress = useMemo(() => (questions.length ? (index / questions.length) * 100 : 0), [index, questions.length]);

  if (phase === "loading" || phase === "scoring") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 text-center">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
        <p className="text-sm text-ink-soft">{phase === "loading" ? "Preparing your placement…" : "Reviewing your answers…"}</p>
      </div>
    );
  }

  if (phase === "unavailable") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-ink-soft">The level test isn&apos;t available yet. Pick your level on the previous screen.</p>
        <button onClick={() => router.push(`/learn/${lang}/placement`)} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
          Back
        </button>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Recommended start</p>
        <p className="mt-1 font-display text-4xl font-extrabold" style={{ color: "var(--accent)" }}>JLPT {result.startLevel}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{result.message}</p>

        <form action={activateLanguage} className="mt-8 w-full">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="level" value={ENUM[result.startLevel] ?? "Beginner"} />
          <button type="submit" className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
            Start learning {languageName}
          </button>
        </form>
        <button onClick={() => router.push(`/learn/${lang}/placement`)} className="mt-3 text-sm font-semibold text-ink-soft hover:text-ink">
          Choose manually instead
        </button>
      </div>
    );
  }

  // test
  if (!q) return null;
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }} />
        </div>
        <span className="text-xs font-semibold text-ink-soft">{index + 1}/{questions.length}</span>
        <button onClick={() => router.push(`/learn/${lang}/placement`)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit"><X className="h-5 w-5" /></button>
      </div>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-wide text-ink-faint">Level check</p>
      <p className="mt-2 text-center font-display text-xl font-bold text-ink" lang={lang}>{q.q}</p>

      <div className="mt-6 grid grid-cols-1 gap-2.5">
        {q.options.map((opt, oi) => {
          const isAns = q.answer === oi;
          const isPicked = picked === oi;
          let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
          if (picked !== null && isAns) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
          else if (picked !== null && isPicked && !isAns) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
          const fx = picked !== null && isAns ? "fl-pop" : picked !== null && isPicked && !isAns ? "fl-shake" : "";
          return (
            <button key={oi} onClick={() => choose(oi)} disabled={picked !== null} className={`rounded-xl border px-4 py-3 text-left text-sm text-ink transition-colors disabled:cursor-default ${fx}`} style={style} lang={lang}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button onClick={next} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
          {index + 1 >= questions.length ? <><Check className="h-4 w-4" /> See result</> : "Next"}
        </button>
      )}
    </div>
  );
}
