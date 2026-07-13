import { Flame } from "lucide-react";
import { getPaspor } from "@/lib/paspor";
import type { Language } from "@/lib/languages";

// The "you have arrived" moment — replaces the flat "Continue your Japanese"
// header so each module feels like entering its own country, not an accent
// swap. Textured by the language's OWN script (authentic per culture).
export function PasporArrival({ language, streak }: { language: Language; streak: number }) {
  const p = getPaspor(language.code);
  const accent = language.accent;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border p-6 shadow-soft sm:p-7"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 8%, var(--color-paper)) 0%, var(--color-paper) 62%)`,
      }}
    >
      {/* the country's own writing system as texture — not a flag, not a cliché */}
      <span
        aria-hidden
        lang={language.code}
        className="pointer-events-none absolute -top-10 right-2 select-none font-display font-black leading-none sm:right-6"
        style={{ fontSize: "11rem", color: accent, opacity: 0.08 }}
      >
        {p.script}
      </span>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p
            className="flex items-baseline gap-2 font-display text-xl font-bold"
            style={{ color: accent }}
            lang={language.code}
          >
            {p.greeting}
            {p.greetingSub && (
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-ink-faint">
                {p.greetingSub}
              </span>
            )}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Selamat datang di dunia {p.world}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{p.ethos}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border hairline bg-paper px-3.5 py-2 shadow-soft">
          <Flame className="h-5 w-5 text-flame" />
          <span className="font-display text-lg font-bold text-ink">{streak}</span>
          <span className="text-xs leading-tight text-ink-soft">
            hari
            <br />
            runtun
          </span>
        </div>
      </div>
    </section>
  );
}
