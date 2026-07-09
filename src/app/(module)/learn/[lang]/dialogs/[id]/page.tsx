import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDialog } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function DialogDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const dialog = getDialog(lang, id);
  if (!dialog) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/learn/${lang}/dialogs`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> All dialogs
      </Link>

      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">{dialog.title}</h1>
      {dialog.description && <p className="mt-1 text-sm text-ink-soft">{dialog.description}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {dialog.lines.map((line, i) => {
          const right = line.speaker === "B";
          return (
            <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 shadow-soft"
                style={
                  right
                    ? { backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)" }
                    : { backgroundColor: "var(--color-paper)", border: "1px solid var(--color-edge)" }
                }
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">{line.speaker}</p>
                <p className="mt-0.5 font-display text-base text-ink" lang={lang}>{line.native}</p>
                {line.roman && <p className="text-xs text-ink-faint">{line.roman}</p>}
                {line.gloss && <p className="mt-0.5 text-xs text-ink-soft">{line.gloss}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
