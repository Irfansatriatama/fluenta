import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { getPaspor } from "@/lib/paspor";
import { getLanguage } from "@/lib/theme";
import { activateLanguage } from "./actions";

const LEVELS = [
  { value: "Beginner", label: "Pemula total", sub: "Mulai dari nol" },
  { value: "Elementary", label: "Tahu sedikit", sub: "Beberapa kata & dasar" },
  { value: "Intermediate", label: "Bisa dasar", sub: "Percakapan sederhana" },
];

export default async function PlacementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();
  const world = getPaspor(lang).world || language.name;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-6 text-center">
      <LanguageSeal language={language} size={96} showLabel={false} />
      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Mulai bahasa {world}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Ceritakan levelmu supaya kami tempatkan di posisi yang pas.
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
          Mulai belajar bahasa {world}
        </button>
      </form>

      {lang === "ja" && (
        <div className="mt-6 w-full">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-edge)" }} />
            <span className="text-xs text-ink-faint">atau</span>
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-edge)" }} />
          </div>
          <Link
            href={`/learn/${lang}/placement/test`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-[color:var(--accent)]"
            style={{ borderColor: "var(--color-edge)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
            Belum yakin? Ikuti tes level 2 menit
          </Link>
        </div>
      )}
    </div>
  );
}
