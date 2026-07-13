import { KeiSigil } from "@/components/mentor/Mentor";
import { KEI } from "@/lib/mentor";

// The soul lever on the public face: introduce Kei so the mentor's presence is
// felt before signup, not discovered later. Serif = her voice (same rule as
// in-app). No mascot, no face — a voice and a mark.
export function MentorIntro() {
  return (
    <section id="mentor" className="border-y hairline bg-paper/70">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-24">
        <div className="flex justify-center">
          <KeiSigil size={52} />
        </div>
        <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Sang Mentor
        </p>
        <h2 className="mentor-voice mx-auto mt-3 max-w-2xl text-[clamp(1.7rem,3.6vw,2.4rem)] font-semibold leading-tight text-ink">
          Kamu tidak akan pernah belajar sendirian.
        </h2>
        <p className="mentor-voice mx-auto mt-5 max-w-xl text-lg italic leading-relaxed text-ink-soft">
          &ldquo;Aku menemanimu di tiap paspor — menyapa saat kamu datang, menegur saat
          kamu keliru, dan menunggu saat kamu pergi. Tempatmu tidak akan pernah
          kutinggalkan.&rdquo;
        </p>
        <p className="mt-6 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink-faint">
          {KEI.name} · {KEI.epithet}
        </p>
      </div>
    </section>
  );
}
