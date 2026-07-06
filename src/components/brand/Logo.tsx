// Fluenta wordmark — a gold "quill leaf" mark + display wordmark.
// Kept as a single inline SVG so it stays crisp and swappable.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M21 4C11 4 5 10 5 19c0 1 .2 2 .5 3C7 15 12 10 21 8c-4 3-7 6-9 11 7-.5 12-6 12-15V4h-3Z"
          fill="var(--color-gold)"
        />
        <path
          d="M5.5 22C7 15 12 10 21 8"
          stroke="var(--color-gold-deep)"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <span className="font-display text-[1.35rem] font-bold tracking-tight text-ink">
        Fluenta
      </span>
    </span>
  );
}
