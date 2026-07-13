import { ArrowRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border hairline bg-paper px-6 py-14 text-center shadow-lift sm:px-10 sm:py-20">
        <h2 className="mentor-voice mx-auto max-w-2xl text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-tight text-ink">
          Rumahmu sudah siap.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
          Mulai dari satu kata. Kei menunggumu di dalam.
        </p>
        <a
          href="/register"
          className="group mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-8 py-4 text-base font-bold text-white shadow-[0_12px_28px_-10px_rgba(169,121,31,0.9)] transition-all hover:bg-gold-deep"
        >
          Mulai — gratis, selamanya
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
