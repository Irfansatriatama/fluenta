"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, Pencil, Target, Volume2, X } from "lucide-react";
import { completeLesson } from "@/lib/lessonActions";

export type DialogTurn = { native: string; gloss: string };
export type DialogReply = { native: string; gloss: string; correct?: boolean };

export type DialogData = {
  id: string;
  xpReward: number;
  scenario: string;
  description: string;
  goal: string;
  turns: DialogTurn[];
  replies: DialogReply[];
  tips: string[];
};

export function DialogRunner({
  lang,
  data,
}: {
  lang: string;
  data: DialogData;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [pending, startTransition] = useTransition();

  const canContinue = selected !== null || custom.trim().length > 0;

  function finish() {
    startTransition(async () => {
      await completeLesson({ lessonId: data.id, correct: 1, total: 1 });
      router.push(`/learn/${lang}/journey`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Dialog / Roleplay</p>
          <h1 className="mt-1 font-display text-xl font-extrabold text-ink">{data.scenario}</h1>
        </div>
        <button
          onClick={() => router.push(`/learn/${lang}/journey`)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
          aria-label="Exit"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="mt-4 rounded-2xl border bg-paper p-5 shadow-soft"
        style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
      >
        <p className="text-sm text-ink-soft">{data.description}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1 text-xs font-semibold" style={{ color: "var(--accent)" }}>
          <Target className="h-3.5 w-3.5" /> Goal: {data.goal}
        </p>
      </div>

      {/* npc turns */}
      <div className="mt-4 flex flex-col gap-3">
        {data.turns.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ivory text-ink-soft ring-1 ring-edge">
              <Volume2 className="h-3.5 w-3.5" />
            </span>
            <div className="max-w-[85%] rounded-2xl bg-paper px-4 py-2.5 shadow-soft">
              <p className="font-display text-base text-ink" lang={lang}>
                {t.native}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">{t.gloss}</p>
            </div>
          </div>
        ))}
      </div>

      {/* replies */}
      <div className="mt-5 rounded-2xl border hairline bg-paper p-5 shadow-soft">
        <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>Choose your reply</p>
        <div className="mt-3 flex flex-col gap-2">
          {data.replies.map((r, i) => {
            const active = selected === i;
            return (
              <button
                key={i}
                onClick={() => {
                  setSelected(i);
                  setCustom("");
                }}
                className="flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors"
                style={active ? { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" } : { borderColor: "var(--color-edge)" }}
              >
                <span>
                  <span className="block font-display text-sm font-semibold text-ink" lang={lang}>
                    {r.native}
                  </span>
                  <span className="block text-xs text-ink-soft">{r.gloss}</span>
                </span>
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full border"
                  style={active ? { borderColor: "var(--accent)" } : { borderColor: "var(--color-edge)" }}
                >
                  {active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />}
                </span>
              </button>
            );
          })}

          <div className="flex items-center gap-2 rounded-xl border border-edge px-3 py-2">
            <Pencil className="h-4 w-4 text-ink-soft" />
            <input
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(null);
              }}
              placeholder="Type your own reply"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              lang={lang}
            />
          </div>
        </div>
      </div>

      {data.tips.length > 0 && (
        <div className="mt-4 rounded-2xl border hairline bg-paper-2/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
            <Lightbulb className="h-4 w-4 text-gold" /> Tips
          </p>
          <ul className="mt-1.5 flex list-inside list-disc flex-col gap-1 text-xs text-ink-soft">
            {data.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={finish}
        disabled={!canContinue || pending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {pending ? "Saving…" : "Continue"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}
