// A layered, theme-aware hero illustration. The sky, sun and clouds are the
// shared "template"; the landmark + foreground layer changes per passport, so
// each country looks like itself — not Mt Fuji everywhere. Colours flow from
// --accent; motion is gentle and CSS-only. One template, different world.

function LandmarkJa() {
  return (
    <>
      {/* far range */}
      <path d="M0 150 L70 104 L130 150 Z" style={{ fill: "color-mix(in srgb, var(--accent) 28%, #E7DCC6)" }} opacity="0.7" />
      <path d="M300 150 L360 108 L420 150 Z" style={{ fill: "color-mix(in srgb, var(--accent) 28%, #E7DCC6)" }} opacity="0.7" />
      {/* Mt Fuji */}
      <path d="M120 158 L205 60 L290 158 Z" style={{ fill: "color-mix(in srgb, var(--accent) 45%, #C9BCA0)" }} />
      <path d="M180 96 L205 60 L232 96 Q218 88 205 92 Q192 88 180 96 Z" fill="#FBF7EF" />
      {/* torii gate */}
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
    </>
  );
}

function LandmarkKo() {
  return (
    <>
      {/* rounded far ridges (Seoul's hills) */}
      <path d="M0 152 Q55 116 110 152 T220 152 Z" style={{ fill: "color-mix(in srgb, var(--accent) 26%, #E7DCC6)" }} opacity="0.65" />
      <path d="M210 152 Q280 108 350 152 T460 152 Z" style={{ fill: "color-mix(in srgb, var(--accent) 30%, #C9BCA0)" }} opacity="0.8" />
      {/* hanok hall — a wide roof with upturned eaves, on a low base */}
      <g style={{ fill: "color-mix(in srgb, var(--accent) 82%, #2f3d63)" }}>
        <path d="M150 150 C158 132 176 126 205 126 C234 126 252 132 260 150 C250 146 242 145 205 145 C168 145 160 146 150 150 Z" />
        <path d="M146 151 q4 -8 12 -9 l-2 6 q-6 1 -10 3 z" />
        <path d="M264 151 q-4 -8 -12 -9 l2 6 q6 1 10 3 z" />
        <rect x="170" y="150" width="70" height="12" opacity="0.9" />
      </g>
      {/* still foreground band */}
      <path d="M0 176 Q210 168 420 176 L420 220 L0 220 Z" style={{ fill: "color-mix(in srgb, var(--accent) 12%, #F1EADB)" }} />
    </>
  );
}

function LandmarkZh() {
  const peak = (x: number, w: number, h: number, mix: number, op: number) => (
    <path
      d={`M${x} 154 C${x + w * 0.18} ${154 - h} ${x + w * 0.82} ${154 - h} ${x + w} 154 Z`}
      style={{ fill: `color-mix(in srgb, var(--accent) ${mix}%, #C9BCA0)` }}
      opacity={op}
    />
  );
  return (
    <>
      {/* karst peaks — tall rounded columns (Guilin) at varying depth */}
      {peak(20, 70, 58, 24, 0.55)}
      {peak(250, 90, 74, 26, 0.6)}
      {peak(150, 60, 92, 42, 0.9)}
      {peak(95, 46, 66, 34, 0.75)}
      {/* small pagoda tiers on the right */}
      <g style={{ fill: "color-mix(in srgb, var(--accent) 80%, #1f4d34)" }}>
        <path d="M334 118 h28 l-6 8 h-16 z" />
        <path d="M337 128 h22 l-5 8 h-12 z" />
        <rect x="343" y="136" width="10" height="16" />
      </g>
      {/* calm water */}
      <path d="M0 178 Q210 172 420 178 L420 220 L0 220 Z" style={{ fill: "color-mix(in srgb, var(--accent) 12%, #EFE9DB)" }} />
    </>
  );
}

function LandmarkEn() {
  return (
    <>
      {/* rolling downs */}
      <path d="M0 150 Q110 122 210 150 T420 150 L420 220 L0 220 Z" style={{ fill: "color-mix(in srgb, var(--accent) 22%, #E7DCC6)" }} opacity="0.7" />
      <path d="M0 168 Q140 146 300 166 T420 168 L420 220 L0 220 Z" style={{ fill: "color-mix(in srgb, var(--accent) 30%, #D8CDB4)" }} opacity="0.85" />
      {/* distant clock tower */}
      <g style={{ fill: "color-mix(in srgb, var(--accent) 80%, #3a2f63)" }}>
        <rect x="86" y="104" width="12" height="48" />
        <path d="M85 104 h14 l-7 -12 z" />
        <rect x="88" y="112" width="8" height="8" fill="#FBF7EF" opacity="0.8" />
      </g>
      {/* lone tree on a rise */}
      <g style={{ fill: "color-mix(in srgb, var(--accent) 55%, #6a5a3a)" }}>
        <rect x="309" y="140" width="4" height="14" />
        <circle cx="311" cy="134" r="12" />
      </g>
    </>
  );
}

const LANDMARKS: Record<string, () => React.ReactElement> = {
  ja: LandmarkJa,
  ko: LandmarkKo,
  zh: LandmarkZh,
  en: LandmarkEn,
};

export function HeroScene({ className, lang = "ja" }: { className?: string; lang?: string }) {
  const Landmark = LANDMARKS[lang] ?? LandmarkJa;
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

      {/* per-passport landmark + foreground */}
      <Landmark />

      <rect x="0" y="196" width="420" height="24" style={{ fill: "color-mix(in srgb, var(--accent) 14%, #F7F2E8)" }} />
    </svg>
  );
}
