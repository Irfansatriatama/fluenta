import Link from "next/link";
import { Check, Gift } from "lucide-react";

const INCLUDED = [
  "All languages and every lesson",
  "Full kanji set (JLPT N5–N1 + Jōyō) with stroke order",
  "Vocabulary flashcards with spaced repetition",
  "Grammar, characters, dialogs & reading",
  "Particle cloze and conjugation drills",
  "Exam Prep roadmaps (JLPT & JFT-Basic)",
  "Daily streak, XP, achievements & leaderboard",
  "AI tutor & writing feedback (when enabled)",
];

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2 text-gold-deep">
        <Gift className="h-5 w-5 text-gold" />
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Everything is free</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Fluenta is fully free.
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Every feature is unlocked for everyone — no paywall, no limits, no subscription. Just learn.
      </p>

      <div className="mt-8 rounded-3xl border hairline bg-paper p-6 shadow-soft">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-lg font-bold text-ink">Your plan</p>
          <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-white">Free forever</span>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/home"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-deep"
      >
        Start learning
      </Link>
    </div>
  );
}
