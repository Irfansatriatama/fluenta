import { type ReactNode } from "react";

// Cohesive custom line-art icons per lesson kind — a stronger identity than
// generic library icons. Stroke = currentColor so they inherit --accent/ink.
type GlyphProps = { className?: string; strokeWidth?: number };

function Svg({ className, strokeWidth = 1.8, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const ReadingGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M12 6c-1.6-1-4-1.6-6.5-1.6V17c2.5 0 4.9.6 6.5 1.6 1.6-1 4-1.6 6.5-1.6V4.4C16 4.4 13.6 5 12 6Z" />
    <path d="M12 6v12.6" />
  </Svg>
);

export const ListeningGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M6 9.5v5" />
    <path d="M9.5 6.5v11" />
    <path d="M13 8v8" />
    <path d="M16.5 5.5v13" />
    <path d="M20 9.5v5" />
  </Svg>
);

export const WritingGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M15 4l5 5" />
    <path d="M4.5 19.5l1.2-4.2L16 5l3 3L8.7 18.3 4.5 19.5Z" />
    <path d="M3.5 20.5h6" />
  </Svg>
);

export const QuizGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5.1" />
  </Svg>
);

export const FlashcardGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <rect x="8" y="4" width="12" height="14" rx="2.4" />
    <path d="M5 7.5v9.5A2.5 2.5 0 0 0 7.5 19.5H15" />
  </Svg>
);

export const DialogGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M4 5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    <path d="M8.5 10h.01M12 10h.01M15.5 10h.01" />
  </Svg>
);

export const SpeakingGlyph = (p: GlyphProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.8 19c0-3 2.3-5.2 5.2-5.2s5.2 2.2 5.2 5.2" />
    <path d="M17.5 8.2c1.1 1.7 1.1 5.9 0 7.6" />
    <path d="M20 6c1.8 2.6 1.8 9.4 0 12" />
  </Svg>
);
