import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Gamepad2,
  PencilRuler,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getLanguage } from "@/lib/theme";

// --- Placeholder data (wired to progress models next). ---
const stats = { streak: 12, xp: 3240, level: 14, levelTitle: "Apprentice", levelPct: 66 };
const goal = { done: 23, target: 30 };

const plan: { icon: LucideIcon; title: string; sub: string; done: boolean }[] = [
  { icon: BookOpen, title: "Flashcards", sub: "Review 20 cards", done: true },
  { icon: Sparkles, title: "Vocabulary", sub: "New words", done: false },
  { icon: PencilRuler, title: "Grammar", sub: "Particle は", done: false },
  { icon: Gamepad2, title: "Practice", sub: "Quick quiz", done: false },
];

const bottom = [
  { label: "Words learned", value: "128", delta: "+18 today" },
  { label: "Minutes studied", value: "32", delta: "+6 today" },
  { label: "Accuracy", value: "87%", delta: "+6%" },
];

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";

export default async function ModuleHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Continue your {language.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            One lesson at a time — keep the momentum going.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border hairline bg-paper px-3.5 py-2 shadow-soft">
          <Flame className="h-5 w-5 text-flame" />
          <span className="font-display text-lg font-bold text-ink">{stats.streak}</span>
          <span className="text-xs leading-tight text-ink-soft">
            day
            <br />
            streak
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">XP</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-ink">
            {stats.xp.toLocaleString()}
          </p>
          <p className="text-xs text-ink-soft">Total XP</p>
        </div>
        <div className={`${card} flex items-center gap-4`}>
          <ProgressRing percent={stats.levelPct} size={64} color="var(--accent)">
            <span className="font-display text-lg font-bold text-ink">{stats.level}</span>
          </ProgressRing>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Level</p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink">{stats.level}</p>
            <p className="text-xs text-ink-soft">{stats.levelTitle}</p>
          </div>
        </div>
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Daily Goal</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">
            {goal.done} <span className="text-base font-semibold text-ink-soft">/ {goal.target} min</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, (goal.done / goal.target) * 100)}%`, backgroundColor: "var(--accent)" }}
            />
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-flame">
            <Flame className="h-3.5 w-3.5" /> You&apos;re on fire!
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div
          className="relative overflow-hidden rounded-2xl border bg-paper p-6 shadow-soft"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
            {language.name}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">Hiragana Basics</h2>
          <p className="mt-1 text-sm text-ink-soft" lang={lang}>
            Lesson 12 · あ行・か行
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 opacity-90">
            <LanguageSeal language={language} size={110} showLabel={false} />
          </div>
        </div>

        <div className={card}>
          <h3 className="font-display text-base font-bold text-ink">Today&apos;s Plan</h3>
          <ul className="mt-3 flex flex-col gap-1">
            {plan.map(({ icon: Icon, title, sub, done }) => (
              <li key={title} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ivory ring-1 ring-edge text-ink-soft">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="truncate text-xs text-ink-soft">{sub}</p>
                </div>
                <span
                  className="grid h-5 w-5 place-items-center rounded-full border"
                  style={
                    done
                      ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)" }
                      : { borderColor: "var(--color-edge)" }
                  }
                >
                  {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {bottom.map((b) => (
          <div key={b.label} className={card}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{b.label}</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink">{b.value}</p>
            <p className="text-xs font-medium" style={{ color: "#2f7d53" }}>
              {b.delta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
