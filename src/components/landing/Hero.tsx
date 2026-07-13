import { ArrowRight, Sparkles } from "lucide-react";
import { Passport } from "./Passport";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
      {/* copy */}
      <div className="order-2 lg:order-1">
        <p className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
          Satu paspor untuk semua bahasa
        </p>

        <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink">
          Belajar bahasa apa pun.
          <br />
          Satu rumah untuk semua.
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">
          Jepang, Korea, Mandarin, Inggris — dan lebih menyusul. Satu jalur, satu
          paspor, ditemani seorang mentor yang tidak pernah meninggalkanmu.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_-10px_rgba(169,121,31,0.9)] transition-all hover:bg-gold-deep hover:shadow-[0_14px_30px_-10px_rgba(169,121,31,0.95)]"
          >
            Mulai — gratis
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#dunia"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-edge bg-paper px-7 py-3.5 text-base font-semibold text-ink shadow-soft transition-colors hover:border-gold/60"
          >
            Lihat dunianya
          </a>
        </div>

        <p className="mt-9 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Gratis selamanya.</span> Tanpa
          langganan. 4 bahasa hari ini, lebih menyusul.
        </p>
      </div>

      {/* visual */}
      <div className="order-1 lg:order-2">
        <Passport />
      </div>
    </section>
  );
}
