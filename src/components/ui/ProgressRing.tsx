// Generic circular progress ring — used for levels, module progress, accuracy.
export function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
  color = "var(--color-gold)",
  track = "var(--color-edge)",
  children,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const center = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(100, Math.max(0, percent)) / 100)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {children && (
        <span className="absolute inset-0 grid place-items-center">{children}</span>
      )}
    </div>
  );
}
