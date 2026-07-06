import Link from "next/link";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { ProgressRing } from "@/components/ui/ProgressRing";
import type { Language } from "@/lib/languages";

export type ModuleSummary = {
  language: Language;
  level: string; // "JLPT N5"
  percent: number;
  streak: number;
};

// A card in the hub's "Access Modules" grid. Themed in its language accent;
// clicking Continue enters the themed module space.
export function LanguageModuleCard({ summary }: { summary: ModuleSummary }) {
  const { language, level, percent, streak } = summary;
  const accent = language.accent;

  return (
    <div
      className="flex flex-col items-center rounded-2xl border bg-paper p-5 text-center shadow-soft"
      style={{ borderColor: `color-mix(in srgb, ${accent} 30%, transparent)` }}
    >
      <LanguageSeal language={language} size={78} showLabel={false} />
      <p className="mt-3 font-display text-lg font-bold text-ink">{language.name}</p>
      <p className="text-xs text-ink-soft">{level}</p>

      <div className="mt-4 flex w-full items-center justify-center gap-4">
        <ProgressRing percent={percent} size={54} stroke={5} color={accent}>
          <span className="text-xs font-bold text-ink">{percent}%</span>
        </ProgressRing>
        <div className="text-left">
          <p className="text-xs text-ink-soft">Streak</p>
          <p className="font-display text-sm font-bold" style={{ color: accent }}>
            {streak} days
          </p>
        </div>
      </div>

      <Link
        href={`/learn/${language.code}`}
        className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        Continue
      </Link>
    </div>
  );
}
