import Link from "next/link";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { ProgressRing } from "@/components/ui/ProgressRing";
import type { Language } from "@/lib/languages";

export type ModuleSummary = {
  language: Language;
  level: string; // "JLPT N5"
  percent: number;
  completed: number;
  total: number;
};

// A card in the hub's "Bahasamu" grid. Themed in its language accent;
// clicking enters the themed module space. Numbers are real progress, not
// placeholder zeros — an empty-looking card reads as a dead one.
export function LanguageModuleCard({ summary }: { summary: ModuleSummary }) {
  const { language, level, percent, completed, total } = summary;
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
          <p className="text-xs text-ink-soft">Pelajaran</p>
          <p className="font-display text-sm font-bold" style={{ color: accent }}>
            {completed}/{total}
          </p>
        </div>
      </div>

      <Link
        href={`/learn/${language.code}`}
        className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        {completed === 0 ? "Masuk" : "Lanjut"}
      </Link>
    </div>
  );
}
