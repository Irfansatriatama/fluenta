import { requireSession } from "@/lib/session";
import { saveOnboarding } from "./actions";

const GOALS = [
  { value: 10, label: "Casual", sub: "10 min / day" },
  { value: 15, label: "Regular", sub: "15 min / day" },
  { value: 30, label: "Serious", sub: "30 min / day" },
  { value: 60, label: "Intense", sub: "60 min / day" },
];

const REASONS = ["Travel", "Career", "Culture", "Family", "Just for fun"];

export default async function OnboardingPage() {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Welcome, {session.user.name}.
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          A couple of quick choices and your passport is ready.
        </p>

        <form action={saveOnboarding} className="mt-8 flex flex-col gap-7">
          <fieldset>
            <legend className="text-sm font-bold text-ink">Your daily goal</legend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GOALS.map((g, i) => (
                <label key={g.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="goal"
                    value={g.value}
                    defaultChecked={i === 1}
                    className="peer sr-only"
                  />
                  <div className="rounded-2xl border border-edge bg-paper p-4 text-center transition-colors peer-checked:border-gold peer-checked:bg-gold/10">
                    <p className="font-display text-sm font-bold text-ink">{g.label}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{g.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink">Why are you learning?</span>
            <select
              name="reason"
              defaultValue="Just for fun"
              className="rounded-xl border border-edge bg-ivory px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-deep"
          >
            Start learning
          </button>
        </form>
      </div>
    </div>
  );
}
