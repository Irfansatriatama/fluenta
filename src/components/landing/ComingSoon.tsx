// A gold laurel branch — mirrored on both sides of the closing line.
function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="46"
      height="60"
      viewBox="0 0 46 60"
      fill="none"
      aria-hidden="true"
      className="text-gold"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M34 58C22 50 16 38 16 24 16 15 19 7 24 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[10, 18, 26, 34, 42].map((y, i) => (
        <path
          key={y}
          d={`M${16 + i * 0.4} ${y}c-6 -2 -11 1 -13 6 6 2 11 -1 13 -6Z`}
          fill="currentColor"
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

export function ComingSoon() {
  return (
    <section className="relative overflow-hidden bg-paper-2">
      {/* faint horizon glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gold/10 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center gap-6 px-5 py-14 sm:gap-10 sm:px-8">
        <Laurel />
        <p className="text-center font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
          More languages coming soon.
          <br />
          <span className="text-ink-soft">
            Your passport is just getting started.
          </span>
        </p>
        <Laurel flip />
      </div>
    </section>
  );
}
