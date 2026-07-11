// Shimmering placeholder block for loading states.
export function Skeleton({ className }: { className?: string }) {
  return <div className={`fl-skeleton rounded-xl ${className ?? ""}`} aria-hidden />;
}
