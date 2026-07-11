import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock, Star } from "lucide-react";
import { Mascot } from "@/components/lesson/Mascot";
import { Pattern } from "@/components/brand/Pattern";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getModuleData, type LessonNode } from "@/lib/content";

// The level ladder per framework — the journey covers one level at a time.
const FRAMEWORK_LEVELS: Record<string, string[]> = {
  JLPT: ["N5", "N4", "N3", "N2", "N1"],
  TOPIK: ["1", "2", "3", "4", "5", "6"],
  HSK: ["1", "2", "3", "4", "5", "6"],
  CEFR: ["A1", "A2", "B1", "B2", "C1", "C2"],
};
import { kindMeta } from "@/lib/lessonKind";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

// Zig-zag horizontal offsets (px) that make the trail wind like a game map.
const WAVE = [0, 46, 64, 46, 0, -46, -64, -46];

function starCount(score: number | null): number {
  if (score === null) return 0;
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function Stars({ score }: { score: number | null }) {
  const filled = starCount(score);
  return (
    <div className="fl-pop mb-1 flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          style={{
            color: i < filled ? "#D9A441" : "var(--color-edge)",
            fill: i < filled ? "#D9A441" : "transparent",
          }}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

function MapNode({ lang, lesson, offset, first }: { lang: string; lesson: LessonNode; offset: number; first: boolean }) {
  const { icon: Icon, label } = kindMeta(lesson.kind);
  const locked = lesson.state === "locked";
  const completed = lesson.state === "completed";
  const current = lesson.state === "current";

  const circle = (
    <span
      className={`relative grid h-16 w-16 place-items-center rounded-full border-[3px] shadow-lift transition-transform hover:scale-105 ${current ? "fl-unlock" : ""}`}
      style={
        completed
          ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
          : current
            ? { backgroundColor: "var(--color-paper, #fff)", borderColor: "var(--accent)", color: "var(--accent)" }
            : { backgroundColor: "var(--color-paper, #fff)", borderColor: "var(--color-edge)", color: "var(--color-ink-faint)" }
      }
    >
      {current && (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-60"
          style={{ boxShadow: "0 0 0 4px color-mix(in srgb, var(--accent) 45%, transparent)" }}
        />
      )}
      {completed ? <Check className="h-7 w-7" strokeWidth={3} /> : locked ? <Lock className="h-6 w-6" /> : <Icon className="h-7 w-7" strokeWidth={1.9} />}
    </span>
  );

  return (
    <div className="flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {!first && (
        <span
          className="h-9 border-l-[3px] border-dashed"
          style={{ borderColor: completed || current ? "color-mix(in srgb, var(--accent) 55%, transparent)" : "var(--color-edge)" }}
        />
      )}
      {completed ? <Stars score={lesson.score} /> : current ? <Mascot className="fl-bob mb-1" /> : <div className="mb-1 h-4" />}

      {locked ? (
        <div className="opacity-70">{circle}</div>
      ) : (
        <Link href={`/learn/${lang}/lesson/${lesson.id}`} aria-label={lesson.title}>
          {circle}
        </Link>
      )}

      <p className={`mt-2 max-w-[10rem] text-center text-xs font-semibold ${locked ? "text-ink-faint" : "text-ink"}`}>{lesson.title}</p>
      <p className="text-[0.6rem] uppercase tracking-wide text-ink-faint">{completed ? label : locked ? "Locked" : `${label} · +${lesson.xpReward}`}</p>
    </div>
  );
}

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  const session = await getSession();
  const data = await getModuleData(lang, session!.user.id);
  const percent = data && data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{language.name} Journey</h1>
          {data?.trackTitle && (
            <span className="mt-1.5 inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
              {data.trackTitle} level
            </span>
          )}
        </div>
        <ProgressRing percent={percent} size={64} color="var(--accent)">
          <span className="text-xs font-bold text-ink">{percent}%</span>
        </ProgressRing>
      </div>

      {!data || data.total === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">Lessons for this language are coming soon.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {/* level ladder — the journey covers one level at a time */}
          {(() => {
            const levels = FRAMEWORK_LEVELS[data.trackFramework] ?? [];
            const activeIdx = levels.indexOf(data.trackLevel);
            if (levels.length === 0) return null;
            const labelOf = (lv: string) =>
              data.trackFramework === "JLPT" || data.trackFramework === "CEFR" ? lv : `${data.trackFramework} ${lv}`;
            return (
              <div className="relative overflow-hidden rounded-2xl border hairline bg-paper p-4 shadow-soft">
                <Pattern variant="seigaiha" className="pointer-events-none absolute -right-4 -top-4 h-24 w-40 text-[color:var(--accent)]" opacity={0.09} />
                <p className="relative text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">{data.trackFramework} path</p>
                <div className="relative mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {levels.map((lv, i) => {
                    const active = i === activeIdx;
                    const future = i > activeIdx;
                    return (
                      <div key={lv} className="flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold"
                          style={
                            active
                              ? { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }
                              : { borderColor: "var(--color-edge)", color: "var(--color-ink-faint)" }
                          }
                        >
                          {future && <Lock className="h-3 w-3" />}
                          {labelOf(lv)}
                        </span>
                        {i < levels.length - 1 && <span className="h-px w-3 shrink-0" style={{ backgroundColor: "var(--color-edge)" }} />}
                      </div>
                    );
                  })}
                </div>
                <p className="relative mt-2 text-xs text-ink-soft">
                  You&apos;re on <span className="font-semibold text-ink">{labelOf(data.trackLevel)}</span>. Finish it to open the next level.
                </p>
              </div>
            );
          })()}
          {data.units.map((unit) => {
            const done = unit.lessons.filter((l) => l.state === "completed").length;
            return (
              <section key={unit.id}>
                {/* chapter banner */}
                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1" style={{ backgroundColor: "var(--color-edge)" }} />
                  <span
                    className="rounded-full border px-4 py-1.5 text-xs font-bold text-ink shadow-soft"
                    style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", backgroundColor: "var(--color-paper, #fff)" }}
                  >
                    {unit.title} <span className="text-ink-faint">· {done}/{unit.lessons.length}</span>
                  </span>
                  <span className="h-px flex-1" style={{ backgroundColor: "var(--color-edge)" }} />
                </div>

                <Stagger className="flex flex-col items-center" gap={0.05}>
                  {unit.lessons.map((lesson, i) => (
                    <StaggerItem key={lesson.id}>
                      <MapNode lang={lang} lesson={lesson} offset={WAVE[i % WAVE.length]} first={i === 0} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            );
          })}

          {percent === 100 && (
            <div className="mt-6 rounded-2xl border p-5 text-center" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <p className="font-display text-lg font-extrabold" style={{ color: "var(--accent)" }}>Track complete!</p>
              <p className="mt-1 text-sm text-ink-soft">You finished every lesson here. Replay any node to earn 3 stars.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
