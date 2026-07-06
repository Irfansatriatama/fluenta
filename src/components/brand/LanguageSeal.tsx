import type { Language } from "@/lib/languages";

// An ink-stamp seal for one language: double ring, native script, emblem,
// hand-stamped rotation. Reused on the passport hero and the language picker.
export function LanguageSeal({
  language,
  size = 120,
  showLabel = true,
}: {
  language: Language;
  size?: number;
  showLabel?: boolean;
}) {
  const { nativeName, label, accent, emblem: Emblem, rotate } = language;

  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        className="relative grid place-items-center rounded-full mix-blend-multiply"
        style={{
          width: size,
          height: size,
          transform: `rotate(${rotate}deg)`,
          color: accent,
          border: `2px solid ${accent}`,
          boxShadow: `inset 0 0 0 1px ${accent}`,
        }}
      >
        {/* inner ring → classic double-line stamp */}
        <span
          className="pointer-events-none absolute rounded-full"
          style={{ inset: size * 0.09, border: `1.5px solid ${accent}` }}
        />
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: size * 0.19 }}
        >
          {nativeName}
        </span>
        <Emblem
          strokeWidth={1.6}
          style={{ width: size * 0.26, height: size * 0.26, marginTop: size * 0.06 }}
          aria-hidden="true"
        />
      </div>
      {showLabel && (
        <figcaption className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
