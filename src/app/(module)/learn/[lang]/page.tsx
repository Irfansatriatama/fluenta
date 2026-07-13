import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, BookText, Check, Gamepad2, GraduationCap, Languages, Layers, Lock, MessagesSquare, Newspaper, PenLine, Repeat2 } from "lucide-react";
import { HeroScene } from "@/components/brand/HeroScene";
import { PasporArrival } from "@/components/module/PasporArrival";
import { CountUp } from "@/components/motion/motion";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getModuleData } from "@/lib/content";
import { kindMeta } from "@/lib/lessonKind";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { studyTools } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

const card = "fl-lift rounded-2xl border hairline bg-paper p-5 shadow-soft hover:shadow-lift";

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
    { href: `/learn/${lang}/vocab`, icon: Layers, title: "Kosakata", sub: "Flashcard + SRS", show: true },
    { href: `/learn/${lang}/review`, icon: Repeat2, title: "Ulasan", sub: "Kartu jatuh tempo", show: true },
    { href: `/learn/${lang}/exam`, icon: GraduationCap, title: "Persiapan Ujian", sub: "JLPT · JFT-Basic", show: lang === "ja" },
    { href: `/learn/${lang}/reading`, icon: BookOpen, title: "Bacaan", sub: `${t.reading} teks`, show: t.reading > 0 },
    { href: `/learn/${lang}/news`, icon: Newspaper, title: "Berita", sub: "Artikel asli + audio", show: lang === "ja" },
    { href: `/learn/${lang}/grammar`, icon: BookText, title: "Tata Bahasa", sub: `${t.grammar} pola`, show: t.grammar > 0 },
    { href: `/learn/${lang}/characters`, icon: Languages, title: "Aksara", sub: `${t.characters} karakter`, show: t.characters > 0 },
    { href: `/learn/${lang}/strokes`, icon: PenLine, title: "Urutan Goresan", sub: "Telusuri kana & kanji", show: lang === "ja" },
    { href: `/learn/${lang}/dialogs`, icon: MessagesSquare, title: "Dialog", sub: `${t.dialogs} percakapan`, show: t.dialogs > 0 },
    { href: `/learn/${lang}/games`, icon: Gamepad2, title: "Permainan", sub: "Main & berlatih", show: true },
  ].filter((c) => c.show);

  return (
    <div className="mx-auto max-w-5xl">
      <PasporArrival language={language} streak={streak?.current ?? 0} />

      <div className="fl-enter mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ animationDelay: "0.05s" }}>
        <div className={`${card} flex items-center gap-4`}>
          <ProgressRing percent={percent} size={64} color="var(--accent)">
            <span className="text-xs font-bold text-ink">{percent}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Progres</p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink">
              {completed}/{total}
            </p>
            <p className="text-xs text-ink-soft">pelajaran</p>
          </div>
        </div>
        <div className={`${card} relative overflow-hidden`}>
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)" }} />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">XP</p>
          <CountUp to={totalXp} className="mt-2 block font-display text-3xl font-extrabold text-ink" />
          <p className="text-xs text-ink-soft">Total XP</p>
        </div>
        <div className={`${card} relative overflow-hidden`}>
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-gold) 18%, transparent), transparent 70%)" }} />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Target harian</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">
            {goal} <span className="text-base font-semibold text-ink-soft">mnt</span>
          </p>
          <p className="mt-1 text-xs text-ink-soft">Jaga runtunmu tetap menyala.</p>
        </div>
      </div>

      <div className="fl-enter mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]" style={{ animationDelay: "0.12s" }}>
        <div
          className="relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-3xl border shadow-lift"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
        >
          <HeroScene lang={lang} className="pointer-events-none absolute inset-0 h-full w-full" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
            style={{ background: "linear-gradient(to top, var(--color-paper) 8%, color-mix(in srgb, var(--color-paper) 82%, transparent) 42%, transparent 100%)" }}
          />
          <div className="relative p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
            {nextLesson ? kindMeta(nextLesson.kind).label : language.name}
          </p>
          <h2 className="relative mt-2 font-display text-2xl font-extrabold text-ink">
            {nextLesson ? nextLesson.title : "Semua tuntas!"}
          </h2>
          <p className="relative mt-1 text-sm text-ink-soft">
            {nextLesson ? `+${nextLesson.xpReward} XP` : "Kamu sudah menyelesaikan semua di sini."}
          </p>
          {nextLesson ? (
            <Link
              href={`/learn/${lang}/lesson/${nextLesson.id}`}
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Lanjut
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/learn/${lang}/journey`}
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl border border-edge px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-gold/60"
            >
              Lihat peta
            </Link>
          )}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Rencana hari ini</h3>
            <Link href={`/learn/${lang}/journey`} className="text-xs font-semibold text-ink-soft hover:text-ink">
              Lihat semua
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
      <section className="fl-enter mt-6" style={{ animationDelay: "0.19s" }}>
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <span className="inline-block h-4 w-1 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          Alat belajar
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {toolCards.map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-2 rounded-2xl border hairline bg-paper p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:shadow-lift"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
              >
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
