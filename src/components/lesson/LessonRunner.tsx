"use client";

import { type CSSProperties, type ReactNode, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Flame, Play, RotateCcw, Sparkles, Star, Target, X } from "lucide-react";
import { completeLesson } from "@/lib/lessonActions";
import { gradeWriting, type WritingFeedback } from "@/lib/aiActions";

export type RunnerQuestion = {
  id: string;
  kind: string;
  prompt: string;
  promptNative: string | null;
  options: { text: string; sub?: string }[] | null;
  answer: number | { sample?: string } | null;
  explanation: string | null;
};

export type RunnerLesson = {
  id: string;
  title: string;
  kind: string;
  xpReward: number;
  passage: string | null;
  highlight: string | null;
  transcript: string | null;
  example: string | null;
};

const GREEN = "#2f7d53";
const RED = "#b23a2e";

function Passage({ text, highlight }: { text: string; highlight: string | null }) {
  const parts = highlight ? text.split(highlight) : [text];
  return (
    <div className="rounded-2xl border hairline bg-paper p-5 text-[1.05rem] leading-loose text-ink" lang="ja">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {highlight && i < parts.length - 1 && (
            <mark className="rounded bg-gold/25 px-0.5 text-ink">{highlight}</mark>
          )}
        </span>
      ))}
    </div>
  );
}

const SR_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SR_LANG[lang] ?? "en-US";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function ListeningPlayer({ lang, transcript }: { lang: string; transcript: string | null }) {
  return (
    <div className="rounded-2xl border hairline bg-paper p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => transcript && speak(transcript, lang)}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
          aria-label="Play audio"
        >
          <Play className="h-6 w-6 fill-current" />
        </button>
        <div className="flex-1">
          <div className="flex h-8 items-end gap-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-full"
                style={{ height: `${20 + ((i * 37) % 80)}%`, backgroundColor: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => transcript && speak(transcript, lang)}
          className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <RotateCcw className="h-4 w-4" /> Replay
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-faint">Tap play and choose what you heard.</p>
    </div>
  );
}

export function LessonRunner({
  lang,
  languageName,
  lesson,
  questions,
}: {
  lang: string;
  languageName: string;
  lesson: RunnerLesson;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [writing, setWriting] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [result, setResult] = useState<{ xp: number; streakCurrent: number; score: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const total = questions.length;
  const q = questions[index];
  const isMcq = q.kind === "mcq";
  const answerIndex = typeof q.answer === "number" ? q.answer : null;
  const stepsDone = index + (revealed ? 1 : 0);

  function check() {
    if (isMcq) {
      if (selected === null) return;
      if (selected === answerIndex) setCorrect((c) => c + 1);
      setRevealed(true);
      return;
    }
    if (writing.trim().length === 0) return;
    startTransition(async () => {
      const fb = await gradeWriting({
        languageName,
        prompt: q.prompt,
        answer: writing,
        sample: typeof q.answer === "object" && q.answer ? q.answer.sample : undefined,
      });
      setFeedback(fb);
      if (fb.correct) setCorrect((c) => c + 1);
      setRevealed(true);
    });
  }

  function next() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setWriting("");
      setRevealed(false);
      setFeedback(null);
      return;
    }
    startTransition(async () => {
      const res = await completeLesson({ lessonId: lesson.id, correct, total });
      if (res.ok) setResult({ xp: res.xp, streakCurrent: res.streakCurrent, score: res.score });
    });
  }

  const canCheck = isMcq ? selected !== null : writing.trim().length > 0;

  if (result) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
          Lesson complete!
        </h1>
        <p className="mt-2 text-ink-soft" lang="ja">
          よくがんばりました！
        </p>
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          <Stat icon={<Star className="h-5 w-5" />} value={`+${result.xp}`} label="XP" />
          <Stat icon={<Flame className="h-5 w-5 text-flame" />} value={`${result.streakCurrent}`} label="day streak" />
          <Stat icon={<Target className="h-5 w-5" />} value={`${result.score}%`} label="Accuracy" />
        </div>
        <button
          onClick={() => {
            router.push(`/learn/${lang}/journey`);
            router.refresh();
          }}
          className="mt-8 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* shell header */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(stepsDone / total) * 100}%`, backgroundColor: "var(--accent)" }}
          />
        </div>
        <button
          onClick={() => router.push(`/learn/${lang}/journey`)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
          aria-label="Exit lesson"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-5 text-sm font-semibold text-ink">{q.prompt}</p>

      <div className="mt-4 flex flex-col gap-4">
        {lesson.passage && <Passage text={lesson.passage} highlight={lesson.highlight} />}
        {lesson.kind === "listening" && <ListeningPlayer lang={lang} transcript={lesson.transcript} />}

        {q.promptNative && (
          <div className="grid place-items-center rounded-2xl border hairline bg-paper py-10">
            <span className="font-display text-6xl font-bold text-ink" lang="ja">
              {q.promptNative}
            </span>
          </div>
        )}

        {isMcq ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.options?.map((opt, i) => {
              const isSelected = selected === i;
              const isAnswer = i === answerIndex;
              let style: CSSProperties = { borderColor: "var(--color-edge)" };
              if (revealed && isAnswer) style = { borderColor: GREEN, backgroundColor: `${GREEN}12` };
              else if (revealed && isSelected && !isAnswer) style = { borderColor: RED, backgroundColor: `${RED}12` };
              else if (isSelected) style = { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" };
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className="rounded-2xl border bg-paper p-4 text-left transition-colors"
                  style={style}
                >
                  <span className="font-display text-base font-semibold text-ink" lang="ja">
                    {opt.text}
                  </span>
                  {opt.sub && <span className="mt-0.5 block text-xs text-ink-soft">{opt.sub}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              value={writing}
              onChange={(e) => setWriting(e.target.value)}
              disabled={revealed}
              rows={4}
              placeholder="Write your answer…"
              className="w-full rounded-2xl border border-edge bg-paper p-4 text-sm text-ink outline-none focus:border-[color:var(--accent)]"
              lang="ja"
            />
            {revealed && feedback && (
              <div className="mt-3 rounded-2xl border hairline bg-paper p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-deep">
                    <Sparkles className="h-4 w-4 text-gold" /> AI Feedback
                  </p>
                  <span className="rounded-full bg-ivory px-2.5 py-1 font-display text-sm font-bold text-ink ring-1 ring-edge">
                    {feedback.score}/10
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink">{feedback.comment}</p>

                {feedback.corrections.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {feedback.corrections.map((c, i) => (
                      <li key={i} className="text-sm">
                        <span className="text-jp line-through" lang={lang}>
                          {c.original}
                        </span>{" "}
                        <span className="font-semibold" style={{ color: "#2f7d53" }} lang={lang}>
                          {c.suggestion}
                        </span>
                        {c.note && <span className="block text-xs text-ink-soft">{c.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}

                {feedback.tips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Tips</p>
                    <ol className="mt-1 flex list-inside list-decimal flex-col gap-1 text-xs text-ink-soft">
                      {feedback.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {!feedback.aiPowered && (
                  <p className="mt-3 text-[0.65rem] text-ink-faint">
                    Detailed AI grading activates once ANTHROPIC_API_KEY is set.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {revealed && q.explanation && (
        <p className="mt-4 rounded-xl bg-paper-2 p-3 text-sm text-ink-soft">{q.explanation}</p>
      )}

      <div className="mt-6">
        {!revealed ? (
          <button
            onClick={check}
            disabled={!canCheck || pending}
            className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {pending ? "Grading…" : "Check"}
          </button>
        ) : (
          <button
            onClick={next}
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {pending ? "Saving…" : index < total - 1 ? "Continue" : "Finish"}
            {!pending && index < total - 1 && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border hairline bg-paper p-4">
      <div className="flex justify-center text-gold">{icon}</div>
      <p className="mt-1 font-display text-xl font-extrabold text-ink">{value}</p>
      <p className="text-[0.65rem] text-ink-soft">{label}</p>
    </div>
  );
}
