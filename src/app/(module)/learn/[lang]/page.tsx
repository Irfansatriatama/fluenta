import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, BookText, Check, Flame, Gamepad2, Languages, Layers, Lock, MessagesSquare, PenLine, Repeat2 } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getModuleData } from "@/lib/content";
import { kindMeta } from "@/lib/lessonKind";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { studyTools } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";

export default async function ModuleHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  const session = await getSession();
  const userId = session!.user.id;

  const [data, xpAgg, streak, profile] = await Promise.all([
    getModuleData(lang, userId),
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;
  const completed = data?.completed ?? 0;
  const total = data?.total ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const goal = profile?.dailyGoalMinutes ?? 15;
  const nextId = data?.nextLessonId ?? null;
  const flatLessons = data?.units.flatMap((u) => u.lessons) ?? [];
  const nextLesson = flatLessons.find((l) => l.id === nextId);

  const t = studyTools(lang);
  const toolCards = [
    { href: `/learn/${lang}/vocab`, icon: Layers, title: "Vocabulary", sub: "Flashcards + SRS", show: true },
    { href: `/learn/${lang}/review`, icon: Repeat2, title: "Review", sub: "Due cards", show: true },
    { href: `/learn/${lang}/reading`, icon: BookOpen, title: "Reading", sub: `${t.reading} passages`, show: t.reading > 0 },
    { href: `/learn/${lang}/grammar`, icon: BookText, title: "Grammar", sub: `${t.grammar} patterns`, show: t.grammar > 0 },
    { href: `/learn/${lang}/characters`, icon: Languages, title: "Characters", sub: `${t.characters} characters`, show: t.characters > 0 },
    { href: `/learn/${lang}/strokes`, icon: PenLine, title: "Stroke Order", sub: "Trace kana & kanji", show: lang === "ja" },
    { href: `/learn/${lang}/dialogs`, icon: MessagesSquare, title: "Dialogs", sub: `${t.dialogs} conversations`, show: t.dialogs > 0 },
    { href: `/learn/${lang}/games`, icon: Gamepad2, title: "Games", sub: "Play & practice", show: true },
  ].filter((c) => c.show);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Continue your {language.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">One lesson at a time — keep the momentum going.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border hairline bg-paper px-3.5 py-2 shadow-soft">
          <Flame className="h-5 w-5 text-flame" />
          <span className="font-display text-lg font-bold text-ink">{streak?.current ?? 0}</span>
          <span className="text-xs leading-tight text-ink-soft">
            day
            <br />
            streak
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${card} flex items-center gap-4`}>
          <ProgressRing percent={percent} size={64} color="var(--accent)">
            <span className="text-xs font-bold text-ink">{percent}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Progress</p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink">
              {completed}/{total}
            </p>
            <p className="text-xs text-ink-soft">lessons</p>
          </div>
        </div>
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">XP</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-ink">
            {totalXp.toLocaleString()}
          </p>
          <p className="text-xs text-ink-soft">Total XP</p>
        </div>
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Daily Goal</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">
            {goal} <span className="text-base font-semibold text-ink-soft">min</span>
          </p>
          <p className="mt-1 text-xs text-ink-soft">Keep your streak alive.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div
          className="relative overflow-hidden rounded-2xl border bg-paper p-6 shadow-soft"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
            {nextLesson ? kindMeta(nextLesson.kind).label : language.name}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
            {nextLesson ? nextLesson.title : "All caught up!"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {nextLesson ? `+${nextLesson.xpReward} XP` : "You've completed every lesson here."}
          </p>
          {nextLesson ? (
            <Link
              href={`/learn/${lang}/lesson/${nextLesson.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/learn/${lang}/journey`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-edge px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-gold/60"
            >
              View journey
            </Link>
          )}
          <div className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 opacity-90">
            <LanguageSeal language={language} size={110} showLabel={false} />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Today&apos;s Plan</h3>
            <Link href={`/learn/${lang}/journey`} className="text-xs font-semibold text-ink-soft hover:text-ink">
              View all
            </Link>
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {flatLessons.slice(0, 4).map((l) => {
              const { icon: Icon, label } = kindMeta(l.kind);
              const locked = l.state === "locked";
              const done = l.state === "completed";
              const row = (
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ivory ring-1 ring-edge text-ink-soft">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{l.title}</p>
                    <p className="truncate text-xs text-ink-soft">{label}</p>
                  </div>
                  {done ? (
                    <span className="grid h-5 w-5 place-items-center rounded-full" style={{ backgroundColor: "var(--accent)" }}>
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  ) : locked ? (
                    <Lock className="h-4 w-4 text-ink-faint" />
                  ) : null}
                </div>
              );
              return (
                <li key={l.id}>
                  {locked ? (
                    <div className="opacity-60">{row}</div>
                  ) : (
                    <Link href={`/learn/${lang}/lesson/${l.id}`} className="block transition-colors hover:bg-paper-2 rounded-xl">
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* study tools */}
      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">Study tools</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {toolCards.map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-2 rounded-2xl border hairline bg-paper p-4 shadow-soft transition-colors hover:border-[color:var(--accent)]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-ink-soft">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
