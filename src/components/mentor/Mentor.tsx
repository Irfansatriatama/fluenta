import { KEI, type MentorLine } from "@/lib/mentor";

// Kei hadir sebagai SUARA lewat serif, bukan wajah/maskot.
// Sigil = seal monogram kecil (menyambung motif LanguageSeal),
// mengikat suara ke tipografinya sendiri.

export function KeiSigil({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full border bg-paper"
      style={{
        width: size,
        height: size,
        borderColor: "color-mix(in srgb, var(--color-gold) 55%, transparent)",
      }}
    >
      <span
        className="font-serif italic leading-none text-gold-deep"
        style={{ fontSize: size * 0.5 }}
      >
        K
      </span>
    </span>
  );
}

// Sapaan bertekstur — dipakai di /home sebagai "masuk ke rumah".
export function MentorGreeting({ line, sub }: MentorLine) {
  return (
    <div className="flex items-start gap-3.5">
      <KeiSigil size={38} />
      <div>
        <p className="mentor-voice text-xl font-medium leading-snug text-ink sm:text-[1.7rem]">
          {line}
        </p>
        {sub && (
          <p className="mentor-voice mt-1.5 text-[0.98rem] italic leading-snug text-ink-soft">
            {sub}
          </p>
        )}
        <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-faint">
          {KEI.name} · {KEI.epithet}
        </p>
      </div>
    </div>
  );
}

// Catatan inline — dipakai saat Kei mengoreksi/menemani (mis. di lesson).
export function MentorNote({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "correct" | "wrong";
}) {
  const bar =
    tone === "correct"
      ? "var(--color-zh)"
      : tone === "wrong"
        ? "var(--color-jp)"
        : "var(--color-gold)";
  return (
    <div
      className="flex items-start gap-3 rounded-2xl bg-paper-2/70 py-3 pl-4 pr-4"
      style={{ borderLeft: `2px solid ${bar}` }}
    >
      <KeiSigil size={24} />
      <p className="mentor-voice text-[0.98rem] italic leading-snug text-ink">{children}</p>
    </div>
  );
}
