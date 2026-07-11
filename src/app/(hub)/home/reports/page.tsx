import { Flame, GraduationCap, Star, Target } from "lucide-react";
import { getModuleData } from "@/lib/content";
import { PROGRESS_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function ReportsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const weekStart = startOfDay(new Date());
  weekStart.setDate(weekStart.getDate() - 6);

  const [enrollments, streak, xpAgg, lessonsCompleted, accuracyAgg, weekEvents] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId }, include: { language: true } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.lessonProgress.count({ where: { userId, status: PROGRESS_STATUS.COMPLETED } }),
    prisma.lessonProgress.aggregate({
      where: { userId, status: PROGRESS_STATUS.COMPLETED, score: { not: null } },
      _avg: { score: true },
    }),
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gte: weekStart } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;
  const accuracy = Math.round(accuracyAgg._avg.score ?? 0);

  // weekly XP buckets
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { label: WEEKDAYS[d.getDay()], sum: 0 };
  });
  for (const e of weekEvents) {
    const idx = Math.round((startOfDay(e.createdAt).getTime() - weekStart.getTime()) / 86_400_000);
    if (idx >= 0 && idx < 7) days[idx].sum += e.amount;
  }
  const maxSum = Math.max(1, ...days.map((d) => d.sum));

  const perLanguage = (
    await Promise.all(
      enrollments.map(async (e) => {
        const data = await getModuleData(e.language.code, userId);
        const meta = getLanguage(e.language.code);
        if (!data || !meta) return null;
        const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        return { meta, completed: data.completed, total: data.total, percent };
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  const tiles = [
    { icon: Star, label: "Total XP", value: totalXp.toLocaleString() },
    { icon: Flame, label: "Current streak", value: `${streak?.current ?? 0} d` },
    { icon: GraduationCap, label: "Lessons done", value: `${lessonsCompleted}` },
    { icon: Target, label: "Avg accuracy", value: `${accuracy}%` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Reports</h1>
      <p className="mt-1 text-sm text-ink-soft">Your progress across every language.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className={card}>
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <p className="text-sm font-semibold text-ink">This week</p>
          <p className="text-xs text-ink-soft">XP earned per day</p>
          <div className="mt-4 flex h-32 items-end gap-2">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gold"
                    style={{ height: `${(d.sum / maxSum) * 100}%`, opacity: d.sum ? 0.9 : 0.25, minHeight: 2 }}
                  />
                </div>
                <span className="text-[0.6rem] text-ink-faint">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <p className="text-sm font-semibold text-ink">By language</p>
          {perLanguage.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No languages yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {perLanguage.map(({ meta, completed, total, percent }) => (
                <li key={meta.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{meta.name}</span>
                    <span className="text-ink-soft">
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: meta.accent }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
