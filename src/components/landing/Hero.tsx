import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";
import { Passport } from "./Passport";

const AVATARS = [
  { tone: "#e7c9a3", initial: "A" },
  { tone: "#cdd7c0", initial: "M" },
  { tone: "#e3b9b2", initial: "S" },
  { tone: "#c3cee0", initial: "K" },
];

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
      {/* copy */}
      <div className="order-2 lg:order-1">
        <p className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
          One passport, endless possibilities
        </p>

        <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink">
          Learn Every Language.
          <br />
          One Beautiful Journey.
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">
          Japanese, Korean, Chinese, English—and more on the way. One gamified
          path, one passport, and progress you&apos;ll actually feel every day.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_-10px_rgba(169,121,31,0.9)] transition-all hover:bg-gold-deep hover:shadow-[0_14px_30px_-10px_rgba(169,121,31,0.95)]"
          >
            Start free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-edge bg-paper px-7 py-3.5 text-base font-semibold text-ink shadow-soft transition-colors hover:border-gold/60"
          >
            Take a quick tour
            <PlayCircle className="h-5 w-5 text-ink-soft" strokeWidth={1.6} />
          </a>
        </div>

        <div className="mt-9 flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {AVATARS.map((a) => (
              <span
                key={a.initial}
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-ivory font-display text-sm font-bold text-ink/70"
                style={{ backgroundColor: a.tone }}
              >
                {a.initial}
              </span>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              Loved by <span className="font-semibold text-ink">50,000+</span>{" "}
              learners worldwide
            </p>
          </div>
        </div>
      </div>

      {/* visual */}
      <div className="order-1 lg:order-2">
        <Passport />
      </div>
    </section>
  );
}
