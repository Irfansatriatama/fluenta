// A layered, theme-aware illustration (Mt Fuji, torii, sun, drifting clouds,
// seigaiha waves) used as a rich hero backdrop. Colors flow from --accent so
// each language gets its own scene. Motion is gentle and CSS-only.
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 220"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ color: "var(--accent)" }}
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in srgb, var(--accent) 26%, #F5EFE3)" }} />
          <stop offset="0.7" style={{ stopColor: "color-mix(in srgb, var(--accent) 8%, #F7F2E8)" }} />
          <stop offset="1" style={{ stopColor: "#F7F2E8" }} />
        </linearGradient>
        <radialGradient id="hs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4D06A" />
          <stop offset="0.6" stopColor="#E8B84B" />
          <stop offset="1" stopColor="#E8B84B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect width="420" height="220" fill="url(#hs-sky)" />

      {/* sun with a soft pulsing glow */}
      <g className="fl-sun" style={{ transformOrigin: "320px 62px" }}>
        <circle cx="320" cy="62" r="46" fill="url(#hs-sun)" opacity="0.5" />
        <circle cx="320" cy="62" r="26" fill="#F1CB63" />
      </g>

      {/* drifting clouds */}
      <g fill="#FBF7EF" opacity="0.85">
        <g className="fl-drift">
          <ellipse cx="90" cy="54" rx="34" ry="11" />
          <ellipse cx="120" cy="50" rx="24" ry="9" />
        </g>
        <g className="fl-drift-slow">
          <ellipse cx="250" cy="34" rx="26" ry="8" />
          <ellipse cx="275" cy="31" rx="18" ry="7" />
        </g>
      </g>

      {/* far mountain range */}
      <path d="M0 150 L70 104 L130 150 Z" style={{ fill: "color-mix(in srgb, var(--accent) 28%, #E7DCC6)" }} opacity="0.7" />
      <path d="M300 150 L360 108 L420 150 Z" style={{ fill: "color-mix(in srgb, var(--accent) 28%, #E7DCC6)" }} opacity="0.7" />

      {/* Mt Fuji */}
      <path d="M120 158 L205 60 L290 158 Z" style={{ fill: "color-mix(in srgb, var(--accent) 45%, #C9BCA0)" }} />
      <path d="M180 96 L205 60 L232 96 Q218 88 205 92 Q192 88 180 96 Z" fill="#FBF7EF" />

      {/* torii gate silhouette */}
      <g style={{ fill: "color-mix(in srgb, var(--accent) 85%, #8a2c22)" }}>
        <rect x="58" y="118" width="7" height="52" />
        <rect x="92" y="118" width="7" height="52" />
        <path d="M48 112 h61 l-5 9 h-51 z" />
        <rect x="52" y="126" width="53" height="6" />
      </g>

      {/* seigaiha waves */}
      <g className="fl-wave" style={{ stroke: "color-mix(in srgb, var(--accent) 60%, transparent)" }} fill="none" strokeWidth="1.4">
        {Array.from({ length: 12 }).map((_, col) =>
          [0, 1].map((row) => (
            <g key={`${col}-${row}`} transform={`translate(${col * 40 - 20 + (row ? 20 : 0)} ${172 + row * 16})`}>
              <path d="M0 12a20 20 0 0 1 40 0" />
              <path d="M8 12a12 12 0 0 1 24 0" opacity="0.6" />
            </g>
          )),
        )}
      </g>
      <rect x="0" y="196" width="420" height="24" style={{ fill: "color-mix(in srgb, var(--accent) 14%, #F7F2E8)" }} />
    </svg>
  );
}
