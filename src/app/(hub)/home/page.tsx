import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import {
  LanguageModuleCard,
  type ModuleSummary,
} from "@/components/hub/LanguageModuleCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { levelProgress } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

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

  const modules: ModuleSummary[] = enrollments.flatMap((e) => {
    const language = getLanguage(e.language.code);
    if (!language) return [];
    return [{ language, level: e.track?.title ?? e.currentLevel ?? "", percent: 0, streak: 0 }];
  });

  return (
    <div className="mx-auto max-w-6xl">
      {/* header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Welcome back, {session!.user.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Your journey across languages continues.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-flame" />
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-wide text-ink-soft">
                Global streak
              </p>
              <p className="font-display text-lg font-bold text-ink">
                {globalStreak} <span className="text-xs font-medium text-ink-soft">days</span>
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

      {/* access modules */}
      <section className="mt-6 rounded-3xl border hairline bg-paper/50 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink">Access Modules / My Languages</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Continue learning in your activated languages or add a new one.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="font-display text-sm font-bold text-ink">Add a language</p>
            <p className="text-xs text-ink-soft">Take a placement test to get started.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
