// The honest angle that beats a fabricated "50,000+ learners": why Fluenta
// exists at all. Editorial and text-driven — no stock-icon feature row.
const PROMISES = [
  { lead: "Gratis, selamanya.", body: "Tanpa langganan, tanpa paywall, tanpa gerbang pembayaran." },
  { lead: "Semua di satu tempat.", body: "Bahasa, kurikulum, latihan — tak perlu berpindah aplikasi." },
  { lead: "Satu paspor.", body: "Empat bahasa hari ini, satu identitas belajar yang kamu bawa." },
];

export function Origin() {
  return (
    <section id="kenapa" className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Kenapa Fluenta ada
        </p>
        <h2 className="mentor-voice mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-ink">
          Lahir dari kelelahan langganan.
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
          Capek berlangganan aplikasi bahasa sana-sini, membayar berulang untuk hal
          yang tercerai-berai. Fluenta menyatukannya jadi satu rumah — lengkap, rapi,
          dan terbuka untuk siapa saja. Bukan sekadar aplikasi. Tempat pulang.
        </p>
      </div>

      <ul className="flex flex-col divide-y hairline border-y hairline">
        {PROMISES.map((p) => (
          <li key={p.lead} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-6">
            <p className="font-display text-lg font-bold text-ink sm:w-52 sm:shrink-0">
              {p.lead}
            </p>
            <p className="text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
