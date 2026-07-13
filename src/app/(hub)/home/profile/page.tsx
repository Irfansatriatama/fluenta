import { Flame, GraduationCap, Star, Target } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { KeiSigil } from "@/components/mentor/Mentor";
import { levelProgress } from "@/lib/gamification";
import { learnerRank } from "@/lib/rank";
import { PROGRESS_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session!.user;

  const [profile, enrollments, xpAgg, streak, lessonsCompleted, accuracyAgg, dbUser] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.enrollment.findMany({ where: { userId: user.id }, include: { language: true, track: true } }),
      prisma.xpEvent.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
      prisma.streak.findUnique({ where: { userId: user.id } }),
      prisma.lessonProgress.count({ where: { userId: user.id, status: PROGRESS_STATUS.COMPLETED } }),
      prisma.lessonProgress.aggregate({
        where: { userId: user.id, status: PROGRESS_STATUS.COMPLETED, score: { not: null } },
        _avg: { score: true },
      }),
      prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } }),
    ]);

  const totalXp = xpAgg._sum.amount ?? 0;
  const { level } = levelProgress(totalXp);
  const rank = learnerRank(level);
  const accuracy = Math.round(accuracyAgg._avg.score ?? 0);
  const initial = user.name?.trim().charAt(0).toUpperCase() || "?";
  const joined = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const tiles = [
    { icon: Star, label: "Total XP", value: totalXp.toLocaleString() },
    { icon: Flame, label: "Runtun", value: `${streak?.current ?? 0} hari` },
    { icon: GraduationCap, label: "Pelajaran", value: `${lessonsCompleted}` },
    { icon: Target, label: "Akurasi", value: `${accuracy}%` },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* gradient hero */}
      <section
        className="relative overflow-hidden rounded-3xl border p-6 shadow-lift sm:p-7"
        style={{
          borderColor: "color-mix(in srgb, var(--color-gold) 32%, transparent)",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 16%, var(--color-paper)) 0%, var(--color-paper) 65%)",
        }}
      >
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink font-display text-2xl font-bold text-ivory shadow-soft">
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{user.name}</h1>
            <p className="truncate text-sm text-ink-soft">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border px-2.5 py-1 text-[0.7rem] font-bold text-gold-deep" style={{ borderColor: "color-mix(in srgb, var(--color-gold) 45%, transparent)" }}>
                {rank.name} · Lv. {level}
              </span>
              {joined && <span className="text-xs text-ink-soft">Bergabung {joined}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* stat tiles */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className={card}>
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-2 font-display text-xl font-extrabold text-ink">{value}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-display text-base font-bold text-ink">Bahasaku</h2>
          {enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Belum ada bahasa.</p>
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
          <h2 className="font-display text-base font-bold text-ink">Preferensi</h2>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Target harian</dt>
              <dd className="font-semibold text-ink">{profile?.dailyGoalMinutes ?? 15} mnt</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Alasan belajar</dt>
              <dd className="font-semibold text-ink">{profile?.learningReason ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Zona waktu</dt>
              <dd className="font-semibold text-ink">{profile?.timezone ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Kei tip — a warm word instead of a generic banner */}
      <div className="mt-4 flex items-start gap-3.5 rounded-2xl border hairline bg-paper-2/50 p-5">
        <KeiSigil size={34} />
        <div>
          <p className="mentor-voice text-[1.05rem] italic leading-snug text-ink">
            Konsistensi mengalahkan intensitas. Sepuluh menit tiap hari membawamu lebih jauh
            daripada sejam sekali seminggu.
          </p>
          <p className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-faint">Kei</p>
        </div>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
