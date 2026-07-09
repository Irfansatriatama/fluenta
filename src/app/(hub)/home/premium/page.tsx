import { Check, Feather, Sparkles } from "lucide-react";

const FREE = ["All 4 languages & lessons", "Vocabulary flashcards + review", "Grammar, characters & dialogs", "Daily streak & achievements"];
const PREMIUM = [
  "Unlimited AI tutor conversations",
  "AI writing feedback on every exercise",
  "Advanced progress reports & insights",
  "Priority access to new languages",
  "Offline study mode",
  "Support an indie project ✦",
];

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-2 text-gold-deep">
        <Feather className="h-5 w-5 text-gold" />
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Fluenta Premium</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Learn faster with Premium.
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Everything in Fluenta is free to start. Premium unlocks unlimited AI and deeper insights for
        serious learners.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <p className="font-display text-lg font-bold text-ink">Free</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-ink">Rp0</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {FREE.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-paper-2/60 px-4 py-2.5 text-center text-sm font-semibold text-ink-soft">
            Your current plan
          </p>
        </div>

        {/* Premium */}
        <div className="relative rounded-3xl border bg-paper p-6 shadow-lift" style={{ borderColor: "rgba(193,145,46,0.5)" }}>
          <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" /> Best value
          </span>
          <p className="font-display text-lg font-bold text-ink">Premium</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-ink">
            Rp49k <span className="text-sm font-semibold text-ink-soft">/ month</span>
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {PREMIUM.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                {f}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-xl bg-gold px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-deep">
            Upgrade — coming soon
          </button>
          <p className="mt-2 text-center text-xs text-ink-faint">Payments launch shortly. No charge yet.</p>
        </div>
      </div>
    </div>
  );
}
