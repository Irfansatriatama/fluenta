import Link from "next/link";
import { Flame, LineChart, Plus, Stamp, Trophy } from "lucide-react";
import {
  LanguageModuleCard,
  type ModuleSummary,
} from "@/components/hub/LanguageModuleCard";
import { ContinueCard } from "@/components/hub/ContinueCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MentorGreeting } from "@/components/mentor/Mentor";
import { daysSince, keiGreeting } from "@/lib/mentor";
import { getModuleData } from "@/lib/content";
import { levelProgress } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

// The rooms of the home — doorways that are meaningful even at zero progress,
// so a brand-new hub still feels lived-in rather than empty.
const ROOMS = [
  { href: "/home/achievements", icon: Stamp, title: "Paspor", desc: "Cap & lencana perjalananmu" },
  { href: "/home/reports", icon: LineChart, title: "Progres", desc: "Sejauh mana kamu melangkah" },
  { href: "/home/leaderboard", icon: Trophy, title: "Papan", desc: "Di antara pembelajar lain" },
];

export default async function HomePage() {
  const session = await getSession();
  const userId = session!.user.id; // guaranteed by (hub) layout

  const [enrollments, xpAgg, streak] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: { language: true, track: true },
      orderBy: { startedAt: "asc" },
    }),
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.streak.findUnique({ where: { userId } }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;
  const { level, percent: levelPct } = levelProgress(totalXp);
  const globalStreak = streak?.current ?? 0;

  const daysAway = daysSince(streak?.lastActiveDate);
  const isNew = enrollments.length === 0 && totalXp === 0;
  const greeting = keiGreeting({
    name: session!.user.name,
    isNew,
    daysAway,
    streak: globalStreak,
  });

  // Real progress per enrolled language — one source (getModuleData) feeds both
  // the "continue" invitation and the module cards. No placeholder zeros.
  const summaries = (
    await Promise.all(
      enrollments.map(async (e) => {
        const language = getLanguage(e.language.code);
        if (!language) return null;
        const data = await getModuleData(e.language.code, userId);
        if (!data) return null;
        let nextTitle: string | null = null;
        let nextKind: string | null = null;
        for (const u of data.units) {
          const cur = u.lessons.find((l) => l.state === "current");
          if (cur) {
            nextTitle = cur.title;
            nextKind = cur.kind;
            break;
          }
        }
        return {
          language,
          level: e.track?.title ?? e.currentLevel ?? language.name,
          trackTitle: data.trackTitle,
          percent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
          completed: data.completed,
          total: data.total,
          nextLessonId: data.nextLessonId,
          nextTitle,
          nextKind,
        };
      }),
    )
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  // The one thing to continue: the furthest-along unfinished language, else any
  // startable one, else the first — so there is always a single clear next step.
  const primary =
    [...summaries]
      .filter((s) => s.nextLessonId && s.completed > 0)
      .sort((a, b) => b.completed - a.completed)[0] ??
    summaries.find((s) => s.nextLessonId) ??
    summaries[0];

  const modules: ModuleSummary[] = summaries.map((s) => ({
    language: s.language,
    level: s.level,
    percent: s.percent,
    completed: s.completed,
    total: s.total,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      {/* header — Kei welcomes you home, your standing at a glance */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <MentorGreeting line={greeting.line} sub={greeting.sub} />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-flame" />
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-wide text-ink-soft">
                Runtun
              </p>
              <p className="font-display text-lg font-bold text-ink">
                {globalStreak} <span className="text-xs font-medium text-ink-soft">hari</span>
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-ink-soft">Total XP</p>
            <p className="font-display text-lg font-bold text-ink">{totalXp.toLocaleString()}</p>
          </div>
          <ProgressRing percent={levelPct} size={72} stroke={6}>
            <div className="text-center leading-none">
              <p className="text-[0.5rem] font-semibold uppercase tracking-wide text-ink-soft">Level</p>
              <p className="font-display text-base font-extrabold text-ink">Lv. {level}</p>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* primary: the one invitation to keep going */}
      {primary && (
        <ContinueCard
          language={primary.language}
          trackTitle={primary.trackTitle}
          nextLessonId={primary.nextLessonId}
          nextTitle={primary.nextTitle}
          nextKind={primary.nextKind}
          completed={primary.completed}
          total={primary.total}
        />
      )}

      {/* your languages */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="fl-heading font-display text-lg font-bold text-ink">Bahasamu</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Satu paspor, tiap bahasa dunianya sendiri.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <LanguageModuleCard key={m.language.code} summary={m} />
          ))}
          <Link
            href="/home/add"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed hairline bg-transparent p-5 text-center transition-colors hover:bg-paper"
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-full border border-dashed text-gold-deep"
              style={{ borderColor: "rgba(169,121,31,0.6)" }}
            >
              <Plus className="h-6 w-6" />
            </span>
            <p className="font-display text-sm font-bold text-ink">Tambah bahasa</p>
            <p className="text-xs text-ink-soft">Ikuti tes penempatan untuk mulai.</p>
          </Link>
        </div>
      </section>

      {/* rooms of the home — doorways that mean something even at zero */}
      <section>
        <h2 className="fl-heading font-display text-lg font-bold text-ink">Ruang lain</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ROOMS.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="fl-lift flex items-center gap-4 rounded-2xl border hairline bg-paper p-4 shadow-soft"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-gold-deep">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-ink">{r.title}</p>
                  <p className="text-xs text-ink-soft">{r.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
