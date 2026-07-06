import { notFound } from "next/navigation";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { getLanguage } from "@/lib/theme";
import { activateLanguage } from "./actions";

const LEVELS = [
  { value: "Beginner", label: "Complete beginner", sub: "Starting from zero" },
  { value: "Elementary", label: "I know a little", sub: "Some words & basics" },
  { value: "Intermediate", label: "I can hold basics", sub: "Simple conversations" },
];

export default async function PlacementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-6 text-center">
      <LanguageSeal language={language} size={96} showLabel={false} />
      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Start {language.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Tell us where you are so we can place you at the right level.
      </p>

      <form action={activateLanguage} className="mt-8 flex w-full flex-col gap-3 text-left">
        <input type="hidden" name="lang" value={lang} />
        {LEVELS.map((lvl, i) => (
          <label key={lvl.value} className="cursor-pointer">
            <input
              type="radio"
              name="level"
              value={lvl.value}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <div className="rounded-2xl border border-edge bg-paper p-4 transition-colors peer-checked:border-[color:var(--accent)] peer-checked:ring-1 peer-checked:ring-[color:var(--accent)]">
              <p className="font-display text-sm font-bold text-ink">{lvl.label}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{lvl.sub}</p>
            </div>
          </label>
        ))}

        <button
          type="submit"
          className="mt-4 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Start learning {language.name}
        </button>
      </form>
    </div>
  );
}
