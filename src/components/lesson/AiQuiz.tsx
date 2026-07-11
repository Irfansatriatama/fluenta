"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Sparkles, X } from "lucide-react";
import { awardGameXp } from "@/lib/gameActions";
import { buildQuiz, type QuizQuestion } from "@/lib/quizActions";

const LEVELS = ["N5", "N4", "N3", "N2"];
const FOCUS = [
  { key: "mixed", label: "Mixed" },
  { key: "vocab", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
  { key: "kanji", label: "Kanji" },
];

export function AiQuiz({ lang, languageName }: { lang: string; languageName: string }) {
  const router = useRouter();
  const [level, setLevel] = useState("N5");
  const [focus, setFocus] = useState("mixed");
  const [phase, setPhase] = useState<"setup" | "loading" | "play" | "done" | "unavailable" | "empty">("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function start() {
    setPhase("loading");
    startTransition(async () => {
      const res = await buildQuiz({ languageName, level, focus });
      if (!res.available) setPhase("unavailable");
      else if (res.questions.length === 0) setPhase("empty");
      else {
        setQuestions(res.questions);
        setIndex(0);
        setPicked(null);
        setScore(0);
        setXp(null);
        setPhase("play");
      }
    });
  }

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[index].answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("done");
      startTransition(async () => {
        const res = await awardGameXp(questions.length * 2);
        setXp(res.ok ? Math.min(30, questions.length * 2) : null);
      });
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  const chip = "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors";
  const active = (on: boolean): React.CSSProperties =>
    on ? { borderColor: "var(--accent)", color: "var(--accent)" } : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" };

  if (phase === "setup" || phase === "loading") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
          <Sparkles className="h-4 w-4" /> Practice Quiz
        </div>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Fresh questions every time</h1>
        <p className="mt-1 text-sm text-ink-soft">A new quiz drawn from your verified material — every answer is accurate.</p>

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ink-soft">Level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={chip} style={active(level === l)}>{l}</button>
          ))}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-soft">Focus</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOCUS.map((f) => (
            <button key={f.key} onClick={() => setFocus(f.key)} className={chip} style={active(focus === f.key)}>{f.label}</button>
          ))}
        </div>

        <button onClick={start} disabled={phase === "loading"} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "var(--accent)" }}>
          {phase === "loading" ? <><RefreshCw className="h-4 w-4 animate-spin" /> Building your quiz…</> : "Start quiz"}
        </button>
        <p className="mt-3 text-center text-[0.7rem] text-ink-faint">Questions are built from Fluenta&apos;s verified grammar, vocabulary, and kanji.</p>
      </div>
    );
  }

  if (phase === "unavailable") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-ink-soft">The AI Quiz needs an AI key (e.g. GROQ_API_KEY) to generate questions.</p>
        <button onClick={() => router.push(`/learn/${lang}/games`)} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>Back to games</button>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-ink-soft">Couldn&apos;t build a clean quiz just now. Please try again.</p>
        <button onClick={() => setPhase("setup")} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>Try again</button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl font-extrabold" style={{ color: "var(--accent)" }}>Quiz complete!</h1>
        <p className="mt-2 text-sm text-ink-soft">{score}/{questions.length} correct{xp !== null ? ` · +${xp} XP` : ""}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={start} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
            <RefreshCw className="h-4 w-4" /> New set
          </button>
          <button onClick={() => setPhase("setup")} className="rounded-xl border border-edge px-5 py-2.5 text-sm font-bold text-ink">Change level</button>
        </div>
      </div>
    );
  }

  // play
  const qu = questions[index];
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${(index / questions.length) * 100}%`, backgroundColor: "var(--accent)" }} />
        </div>
        <span className="text-xs font-semibold text-ink-soft">{index + 1}/{questions.length}</span>
        <button onClick={() => router.push(`/learn/${lang}/games`)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit"><X className="h-5 w-5" /></button>
      </div>

      <p className="mt-6 text-center text-xs font-bold uppercase tracking-wide text-ink-faint">{level}{qu.skill ? ` · ${qu.skill}` : ""}</p>
      <p className="mt-2 text-center font-display text-xl font-bold text-ink" lang={lang}>{qu.q}</p>

      <div className="mt-6 grid grid-cols-1 gap-2.5">
        {qu.options.map((opt, oi) => {
          const isAns = qu.answer === oi;
          const isPicked = picked === oi;
          let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
          if (picked !== null && isAns) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
          else if (picked !== null && isPicked && !isAns) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
          return (
            <button key={oi} onClick={() => choose(oi)} disabled={picked !== null} className="rounded-xl border px-4 py-3 text-left text-sm text-ink transition-colors disabled:cursor-default" style={style} lang={lang}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4">
          {qu.explanation && <p className="rounded-xl bg-paper-2 px-4 py-3 text-sm text-ink-soft" lang={lang}>{qu.explanation}</p>}
          <button onClick={next} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
            {index + 1 >= questions.length ? <><Check className="h-4 w-4" /> Finish</> : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
