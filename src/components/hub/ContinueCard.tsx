import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { Pattern } from "@/components/brand/Pattern";
import { kindMeta } from "@/lib/lessonKind";
import type { Language } from "@/lib/languages";

// The hub's ONE dominant invitation: pick up where you belong. For a returning
// learner it continues the next lesson; for a new one it opens the first step.
// This is the primary tier of the home's card hierarchy — everything else is
// secondary. Deep-links straight into the lesson so "home → learning" is 1 tap.
export function ContinueCard({
  language,
  trackTitle,
  nextLessonId,
  nextTitle,
  nextKind,
  completed,
  total,
}: {
  language: Language;
  trackTitle: string;
  nextLessonId: string | null;
  nextTitle: string | null;
  nextKind: string | null;
  completed: number;
  total: number;
}) {
  const accent = language.accent;
  const isNew = completed === 0;
  const done = total > 0 && completed >= total;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const kindLabel = nextKind ? kindMeta(nextKind).label : null;

  const href = nextLessonId
    ? `/learn/${language.code}/lesson/${nextLessonId}`
    : `/learn/${language.code}/journey`;

  const eyebrow = isNew ? "Mulai di sini" : done ? "Ulangi & sempurnakan" : "Lanjutkan";
  const headline = done
    ? `${language.name} — semua tuntas`
    : nextTitle ?? `Mulai ${language.name}`;
  const cta = isNew ? "Mulai langkah pertama" : done ? "Buka peta" : "Lanjut belajar";

  return (
    <section
      className="relative overflow-hidden rounded-3xl border p-6 shadow-lift sm:p-7"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 32%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 7%, var(--color-paper)) 0%, var(--color-paper) 60%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 block h-40 w-64"
        style={{ color: accent }}
      >
        <Pattern variant="seigaiha" className="h-full w-full" opacity={0.08} />
      </span>
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <LanguageSeal language={language} size={72} showLabel={false} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[0.62rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {eyebrow} · {trackTitle || language.name}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ink">
            {headline}
          </h2>
          <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
            {kindLabel && !done && (
              <span
                className="rounded-full px-2 py-0.5 font-semibold"
                style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
              >
                {kindLabel}
              </span>
            )}
            {total > 0 && (
              <span className="font-medium text-ink">
                {completed}/{total} <span className="text-ink-soft">pelajaran</span>
              </span>
            )}
          </div>
          {total > 0 && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-edge)" }}>
              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
            </div>
          )}
        </div>

        <Link
          href={href}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-soft transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
