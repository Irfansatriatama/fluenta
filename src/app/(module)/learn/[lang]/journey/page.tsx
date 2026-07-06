import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getModuleData, type LessonNode } from "@/lib/content";
import { kindMeta } from "@/lib/lessonKind";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

function Node({ lang, lesson }: { lang: string; lesson: LessonNode }) {
  const { icon: Icon, label } = kindMeta(lesson.kind);
  const locked = lesson.state === "locked";
  const completed = lesson.state === "completed";

  const stamp = (
    <div className="flex items-center gap-4">
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 transition-transform"
        style={
          completed
            ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
            : locked
              ? { borderColor: "var(--color-edge)", color: "var(--color-ink-faint)" }
              : { borderColor: "var(--accent)", color: "var(--accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent)" }
        }
      >
        {completed ? (
          <Check className="h-6 w-6" strokeWidth={3} />
        ) : locked ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="font-display text-base font-bold text-ink">{lesson.title}</p>
        <p className="text-xs text-ink-soft">
          {completed ? "Completed" : locked ? "Locked" : `+${lesson.xpReward} XP`}
        </p>
      </div>
    </div>
  );

  if (locked) {
    return <li className="rounded-2xl border hairline bg-paper/60 p-4 opacity-70">{stamp}</li>;
  }
  return (
    <li>
      <Link
        href={`/learn/${lang}/lesson/${lesson.id}`}
        className="block rounded-2xl border hairline bg-paper p-4 shadow-soft transition-colors hover:border-[color:var(--accent)]"
      >
        {stamp}
      </Link>
    </li>
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
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {language.name} Journey
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{data?.trackTitle}</p>
        </div>
        <ProgressRing percent={percent} size={64} color="var(--accent)">
          <span className="text-xs font-bold text-ink">{percent}%</span>
        </ProgressRing>
      </div>

      {!data || data.total === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Lessons for this language are coming soon.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {data.units.map((unit) => (
            <section key={unit.id}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                {unit.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {unit.lessons.map((lesson) => (
                  <Node key={lesson.id} lang={lang} lesson={lesson} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
