import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import {
  LanguageModuleCard,
  type ModuleSummary,
} from "@/components/hub/LanguageModuleCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { getLanguage } from "@/lib/theme";

// --- Placeholder data (wired to Enrollment in Task 8). ---
const learner = {
  name: "Kei",
  globalStreak: 32,
  totalXp: 24680,
  level: 18,
  toNext: "6,320 XP to Lv. 19",
  levelPct: 58,
};

const modules: ModuleSummary[] = [
  { language: getLanguage("ja")!, level: "JLPT N5", percent: 62, streak: 12 },
  { language: getLanguage("ko")!, level: "TOPIK I", percent: 48, streak: 8 },
  { language: getLanguage("zh")!, level: "HSK 2", percent: 70, streak: 15 },
];

const week = {
  minutes: 312,
  accuracy: 86,
  sessions: 18,
  sessionsDelta: "+12% vs last week",
  activity: [40, 55, 48, 70, 95, 30, 62],
  sessionBars: [50, 65, 45, 80, 60, 70, 90],
};

const achievements = [
  { native: "日本", color: "#b23a2e", title: "First Steps", sub: "Earned 2 days ago" },
  { native: "한글", color: "#3b5c99", title: "Hangul Explorer", sub: "Earned 4 days ago" },
  { native: "汉语", color: "#2f7d53", title: "HSK 2 Achiever", sub: "Earned 1 week ago" },
  { native: "达人", color: "#c1912e", title: "Consistent Learner", sub: "30-day streak" },
  { native: "世界", color: "#23201b", title: "Global Explorer", sub: "3 languages" },
];

const card = "rounded-2xl border hairline bg-paper p-5 shadow-soft";

function MiniBars({ values, color }: { values: number[]; color: string }) {
  return (
    <div className="flex h-16 items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${v}%`, backgroundColor: color, opacity: 0.85 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Good morning, {learner.name}
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
                {learner.globalStreak} <span className="text-xs font-medium text-ink-soft">days</span>
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-ink-soft">Total XP</p>
            <p className="font-display text-lg font-bold text-ink">
              {learner.totalXp.toLocaleString()}
            </p>
          </div>
          <ProgressRing percent={learner.levelPct} size={72} stroke={6}>
            <div className="text-center leading-none">
              <p className="text-[0.5rem] font-semibold uppercase tracking-wide text-ink-soft">
                Level
              </p>
              <p className="font-display text-base font-extrabold text-ink">Lv. {learner.level}</p>
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
            href="/onboarding"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed hairline bg-transparent p-5 text-center transition-colors hover:bg-paper"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full border border-dashed text-gold-deep" style={{ borderColor: "rgba(169,121,31,0.6)" }}>
              <Plus className="h-6 w-6" />
            </span>
            <p className="font-display text-sm font-bold text-ink">Add a language</p>
            <p className="text-xs text-ink-soft">Take a placement test to get started.</p>
          </Link>
        </div>
      </section>

      {/* this week */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink">
          This Week <span className="text-sm font-medium text-ink-soft">(All Languages)</span>
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={card}>
            <p className="text-sm font-semibold text-ink">Activity</p>
            <p className="text-xs text-ink-soft">Minutes practiced</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{week.minutes} min</p>
            <div className="mt-3">
              <MiniBars values={week.activity} color="var(--color-gold)" />
            </div>
          </div>
          <div className={`${card} flex flex-col`}>
            <p className="text-sm font-semibold text-ink">Accuracy</p>
            <p className="text-xs text-ink-soft">Average</p>
            <div className="mt-2 flex flex-1 items-center justify-center">
              <ProgressRing percent={week.accuracy} size={96} stroke={9} color="var(--color-gold)">
                <span className="font-display text-xl font-extrabold text-ink">{week.accuracy}%</span>
              </ProgressRing>
            </div>
          </div>
          <div className={card}>
            <p className="text-sm font-semibold text-ink">Sessions</p>
            <p className="text-xs text-ink-soft">Completed</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{week.sessions}</p>
            <p className="text-xs font-medium" style={{ color: "#2f7d53" }}>
              {week.sessionsDelta}
            </p>
            <div className="mt-2">
              <MiniBars values={week.sessionBars} color="var(--color-gold)" />
            </div>
          </div>
        </div>
      </section>

      {/* recent achievements */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink">Recent achievements</h2>
        <ul className="mt-4 flex gap-5 overflow-x-auto pb-2">
          {achievements.map((a) => (
            <li key={a.title} className="flex min-w-[7rem] flex-col items-center gap-2 text-center">
              <span
                className="grid h-14 w-14 place-items-center rounded-full font-display text-sm font-bold"
                style={{
                  color: a.color,
                  border: `2px solid ${a.color}`,
                  boxShadow: `inset 0 0 0 1px ${a.color}`,
                }}
                lang="ja"
              >
                {a.native}
              </span>
              <div>
                <p className="text-xs font-bold text-ink">{a.title}</p>
                <p className="text-[0.65rem] text-ink-soft">{a.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
