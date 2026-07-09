import { Flame, Languages, Star } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { levelProgress } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session!.user;

  const [profile, enrollments, xpAgg, streak] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.enrollment.findMany({ where: { userId: user.id }, include: { language: true, track: true } }),
    prisma.xpEvent.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;
  const { level } = levelProgress(totalXp);
  const initial = user.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink font-display text-2xl font-bold text-ivory">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{user.name}</h1>
          <p className="truncate text-sm text-ink-soft">{user.email}</p>
          <p className="mt-0.5 text-xs font-semibold text-gold-deep">Free Plan · Level {level}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${card} flex items-center gap-3`}>
          <Star className="h-6 w-6 text-gold" />
          <div>
            <p className="font-display text-xl font-extrabold text-ink">{totalXp.toLocaleString()}</p>
            <p className="text-xs text-ink-soft">Total XP</p>
          </div>
        </div>
        <div className={`${card} flex items-center gap-3`}>
          <Flame className="h-6 w-6 text-flame" />
          <div>
            <p className="font-display text-xl font-extrabold text-ink">{streak?.current ?? 0}</p>
            <p className="text-xs text-ink-soft">Day streak</p>
          </div>
        </div>
        <div className={`${card} flex items-center gap-3`}>
          <Languages className="h-6 w-6 text-ink-soft" />
          <div>
            <p className="font-display text-xl font-extrabold text-ink">{enrollments.length}</p>
            <p className="text-xs text-ink-soft">Languages</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-display text-base font-bold text-ink">My languages</h2>
          {enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No languages yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {enrollments.map((e) => {
                const meta = getLanguage(e.language.code);
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    {meta && <LanguageSeal language={meta} size={40} showLabel={false} />}
                    <div>
                      <p className="text-sm font-semibold text-ink">{e.language.name}</p>
                      <p className="text-xs text-ink-soft">{e.track?.title ?? e.currentLevel ?? ""}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={card}>
          <h2 className="font-display text-base font-bold text-ink">Preferences</h2>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Daily goal</dt>
              <dd className="font-semibold text-ink">{profile?.dailyGoalMinutes ?? 15} min</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Learning for</dt>
              <dd className="font-semibold text-ink">{profile?.learningReason ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Timezone</dt>
              <dd className="font-semibold text-ink">{profile?.timezone ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
