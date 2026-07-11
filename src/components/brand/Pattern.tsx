// Subtle decorative SVG patterns (Japanese-inspired) used to furnish surfaces.
// Tinted via `color` (currentColor) so each language's --accent flows through.
type PatternProps = { variant?: "seigaiha" | "wave" | "dots" | "asanoha"; className?: string; opacity?: number };

export function Pattern({ variant = "seigaiha", className, opacity = 0.12 }: PatternProps) {
  const id = `pat-${variant}`;
  return (
    <svg className={className} style={{ opacity }} aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        {variant === "seigaiha" && (
          <pattern id={id} width="44" height="22" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.1">
              <path d="M-22 22a22 22 0 0 1 44 0" />
              <path d="M0 22a22 22 0 0 1 44 0" />
              <path d="M22 22a22 22 0 0 1 44 0" />
              <path d="M-22 22a14 14 0 0 1 44 0" transform="translate(0 0)" opacity="0.6" />
              <path d="M0 22a14 14 0 0 1 44 0" opacity="0.6" />
              <path d="M22 22a14 14 0 0 1 44 0" opacity="0.6" />
            </g>
          </pattern>
        )}
        {variant === "wave" && (
          <pattern id={id} width="28" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 7Q7 0 14 7T28 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </pattern>
        )}
        {variant === "dots" && (
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="currentColor" />
          </pattern>
        )}
        {variant === "asanoha" && (
          <pattern id={id} width="24" height="42" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.9">
              <path d="M12 0v21M0 10.5 12 21l12-10.5M0 31.5 12 21l12 10.5M12 21v21M0 10.5 12 0M24 10.5 12 0M0 31.5 12 42M24 31.5 12 42" />
            </g>
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
