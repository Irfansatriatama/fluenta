import { Plane } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { LANGUAGES, UPCOMING_LANGUAGES, UPCOMING_MORE } from "@/lib/languages";

// The signature hero object: a warm passport booklet you stamp as you learn.
export function Passport() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] [perspective:1400px]">
      {/* back page peeking out → booklet depth */}
      <div className="absolute inset-0 translate-x-3 translate-y-4 rotate-[5deg] rounded-[1.75rem] bg-paper-2 shadow-soft" />

      <div
        className="relative rotate-[2deg] rounded-[1.75rem] bg-paper p-7 shadow-lift ring-1 ring-gold/40 sm:p-9"
        style={{ boxShadow: "var(--shadow-lift), inset 0 0 0 6px rgba(193,145,46,0.12)" }}
      >
        {/* postmark */}
        <svg
          className="absolute right-6 top-6 text-ink-faint"
          width="52"
          height="30"
          viewBox="0 0 52 30"
          fill="none"
          aria-hidden="true"
        >
          {[6, 13, 20].map((y) => (
            <path
              key={y}
              d={`M2 ${y}q6 -4 12 0t12 0 12 0 12 0`}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.5"
            />
          ))}
        </svg>

        <header className="text-center">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-ink-soft">
            Language Passport
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold tracking-[0.14em] text-ink">
            FLUENTA
          </p>
          <p className="mt-1 text-[0.58rem] uppercase tracking-[0.3em] text-ink-faint">
            Your Journey, Your Story
          </p>
        </header>

        <div className="mx-auto mt-7 grid max-w-[19rem] grid-cols-2 gap-x-6 gap-y-6">
          {LANGUAGES.map((language) => (
            <LanguageSeal key={language.code} language={language} size={112} />
          ))}
        </div>

        {/* coming-soon stamps → signals the platform's breadth */}
        <div className="mt-7 border-t border-dashed hairline pt-4">
          <p className="text-center text-[0.55rem] font-bold uppercase tracking-[0.28em] text-ink-faint">
            More languages coming
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {UPCOMING_LANGUAGES.map((u) => (
              <span
                key={u.label}
                title={u.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-dashed text-ink-faint opacity-70"
                style={{ borderColor: "var(--color-ink-faint)", transform: `rotate(${u.rotate}deg)` }}
              >
                <span className="font-display text-xs font-bold">{u.glyph}</span>
              </span>
            ))}
            <span className="font-display text-xs font-bold text-gold-deep">+{UPCOMING_MORE} more</span>
          </div>
        </div>

        <footer className="mt-6 flex items-end justify-between gap-4 border-t border-dashed hairline pt-5">
          <p className="font-display text-[0.95rem] italic leading-snug text-ink-soft">
            Collect stamps. Build fluency.
            <br />
            Open new worlds.
          </p>
          <span
            className="grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-full border border-dashed text-gold-deep"
            style={{ borderColor: "rgba(169,121,31,0.6)" }}
          >
            <Plane className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
        </footer>
      </div>
    </div>
  );
}
