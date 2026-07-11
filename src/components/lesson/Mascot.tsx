// A small friendly guide that sits above the current node on the journey map.
// Uses --accent so each language gets its own colour. Shared across modules.
export function Mascot({ className }: { className?: string }) {
  return (
    <span className={className} style={{ color: "var(--accent)" }} aria-hidden>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* body */}
        <path
          d="M20 5c6.5 0 11 4.8 11 12.5C31 27 26.5 34 20 34S9 27 9 17.5C9 9.8 13.5 5 20 5Z"
          fill="currentColor"
        />
        {/* little tuft */}
        <path d="M20 5c.6-2 2-3 3.4-3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* eyes */}
        <circle cx="16" cy="18" r="3" fill="#fff" />
        <circle cx="24" cy="18" r="3" fill="#fff" />
        <circle cx="16.6" cy="18.4" r="1.3" fill="#23201b" />
        <circle cx="24.6" cy="18.4" r="1.3" fill="#23201b" />
        {/* smile */}
        <path d="M17 24c1.2 1.2 4.8 1.2 6 0" stroke="#23201b" strokeWidth="1.6" strokeLinecap="round" />
        {/* cheeks */}
        <circle cx="12.5" cy="22" r="1.4" fill="#fff" opacity="0.5" />
        <circle cx="27.5" cy="22" r="1.4" fill="#fff" opacity="0.5" />
      </svg>
    </span>
  );
}
