"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Volume2, X } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { completeLesson } from "@/lib/lessonActions";
import type { Dialog } from "@/lib/staticContent";

const TTS_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] ?? "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

// A conversation lesson: read/listen through a scripted dialog, then finish.
export function ConversationRunner({
  dialog,
  lang,
  backHref,
  lessonId,
}: {
  dialog: Dialog;
  lang: string;
  backHref: string;
  lessonId?: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);
  const [, startTransition] = useTransition();

  const firstSpeaker = dialog.lines[0]?.speaker;

  function finish() {
    startTransition(async () => {
      if (lessonId) {
        const res = await completeLesson({ lessonId, correct: 1, total: 1 });
        setXp(res.ok ? res.xp : 0);
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <Celebration
        title="Conversation done!"
        subtitle="よくできました！"
        score={100}
        stats={[{ icon: <Volume2 className="h-5 w-5" />, value: xp || dialog.lines.length, label: "XP", prefix: xp ? "+" : "", countUp: true }]}
        onContinue={() => {
          router.push(backHref);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          Conversation{dialog.level ? ` · ${dialog.level}` : ""}
        </span>
        <button onClick={() => router.push(backHref)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit">
          <X className="h-5 w-5" />
        </button>
      </div>

      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink" lang={lang}>{dialog.title}</h1>
      {dialog.description && <p className="mt-1 text-sm text-ink-soft">{dialog.description}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => speak(dialog.lines.map((l) => l.native).join(" "), lang)}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[color:var(--accent)]"
          style={{ borderColor: "var(--color-edge)" }}
        >
          <Volume2 className="h-3.5 w-3.5" /> Play all
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {dialog.lines.map((line, i) => {
          const right = line.speaker !== firstSpeaker;
          return (
            <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
              <div
                className="group flex max-w-[88%] items-start gap-2 rounded-2xl px-4 py-3 shadow-soft"
                style={
                  right
                    ? { backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)" }
                    : { backgroundColor: "var(--color-paper)", border: "1px solid var(--color-edge)" }
                }
              >
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">{line.speaker}</p>
                  <p className="mt-0.5 font-display text-base leading-relaxed text-ink" lang={lang}>{line.native}</p>
                  {line.roman && <p className="text-xs text-ink-faint">{line.roman}</p>}
                  {line.gloss && <p className="mt-0.5 text-xs text-ink-soft">{line.gloss}</p>}
                </div>
                <button onClick={() => speak(line.native, lang)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Play line">
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={finish}
        className="mt-8 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Finish
      </button>
    </div>
  );
}
