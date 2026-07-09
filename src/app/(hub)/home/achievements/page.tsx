import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { computeAchievements } from "@/lib/achievements";
import { PROGRESS_STATUS } from "@/lib/constants";
import { LANGUAGES } from "@/lib/languages";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function AchievementsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [enrollments, streak, xpAgg, lessonsCompleted] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId }, include: { language: true } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.lessonProgress.count({ where: { userId, status: PROGRESS_STATUS.COMPLETED } }),
  ]);

  const stat = {
    lessonsCompleted,
    languages: enrollments.length,
    streak: streak?.current ?? 0,
    longest: streak?.longest ?? 0,
    totalXp: xpAgg._sum.amount ?? 0,
  };

  const achievements = computeAchievements(stat);
  const earnedCount = achievements.filter((a) => a.code !== "collector" && a.earned).length;
  const withCollector = achievements.map((a) =>
    a.code === "collector" ? { ...a, earned: earnedCount >= 6 } : a,
  );

  const enrolledCodes = new Set(enrollments.map((e) => e.language.code));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Achievements
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Your passport of stamps and milestones.
      </p>

      {/* passport of language seals */}
      <section className="mt-6 rounded-3xl border hairline bg-paper/50 p-6">
        <h2 className="font-display text-base font-bold text-ink">Language Passport</h2>
        <p className="mt-1 text-sm text-ink-soft">Stamps you collect by starting each language.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-8 sm:justify-start">
          {LANGUAGES.map((language) => {
            const stamped = enrolledCodes.has(language.code);
            return (
              <div key={language.code} className={stamped ? "" : "opacity-30 grayscale"}>
                <LanguageSeal language={language} size={88} />
              </div>
            );
          })}
        </div>
      </section>

      {/* achievement badges */}
      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">
          Badges <span className="text-sm font-medium text-ink-soft">({earnedCount + (earnedCount >= 6 ? 1 : 0)}/{withCollector.length})</span>
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {withCollector.map(({ code, title, description, icon: Icon, color, earned }) => (
            <li
              key={code}
              className="flex flex-col items-center rounded-2xl border hairline bg-paper p-5 text-center shadow-soft"
            >
              <span
                className="grid h-16 w-16 place-items-center rounded-full"
                style={
                  earned
                    ? { color, border: `2px solid ${color}`, boxShadow: `inset 0 0 0 1px ${color}` }
                    : { color: "var(--color-ink-faint)", border: "2px dashed var(--color-edge)" }
                }
              >
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <p className="mt-3 font-display text-sm font-bold text-ink">{title}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
              {!earned && <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">Locked</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
