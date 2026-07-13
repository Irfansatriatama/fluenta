import { LANGUAGES } from "@/lib/languages";
import { Pattern } from "@/components/brand/Pattern";

// The passport metaphor made visible: four languages, four worlds you visit —
// each anchored by its own script (the real artefact), not a stock icon. One
// template, different "paint" — but all still Fluenta.
const BLURB: Record<string, string> = {
  ja: "Aksara yang mengalir, kesantunan yang berlapis.",
  ko: "Hangeul yang logis, budaya yang sedang mendunia.",
  zh: "Ribuan tahun dalam tiap guratan hanzi.",
  en: "Bahasa dunia — kunci ke hampir semua pintu.",
};

export function FourWorlds() {
  return (
    <section id="dunia" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Paspormu
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight tracking-tight text-ink">
          Satu paspor, empat dunia.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Kamu memegang satu paspor — Fluenta. Tiap bahasa adalah negara yang kamu
          kunjungi, dengan budaya dan nuansanya sendiri. Empat dulu; lebih menyusul.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANGUAGES.map((lang) => (
          <article
            key={lang.code}
            className="fl-lift group relative overflow-hidden rounded-3xl border bg-paper p-6 shadow-soft"
            style={{ borderColor: `color-mix(in srgb, ${lang.accent} 28%, transparent)` }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 block h-28 w-40"
              style={{ color: lang.accent }}
            >
              <Pattern variant="seigaiha" className="h-full w-full" opacity={0.08} />
            </span>
            <div className="relative">
              <p
                className="font-display text-4xl font-extrabold leading-none"
                style={{ color: lang.accent }}
                lang={lang.code}
              >
                {lang.nativeName}
              </p>
              <p className="mt-4 font-display text-base font-bold text-ink">{lang.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{BLURB[lang.code]}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
