import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { getDialogs } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function DialogsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const dialogs = getDialogs(lang);

  return (
    <div className="fl-enter mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Dialogs
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Real situational conversations with translations.</p>

      {dialogs.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">Dialogs are coming soon.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dialogs.map((d) => (
            <Link
              key={d.id}
              href={`/learn/${lang}/dialogs/${d.id}`}
              className="flex items-center gap-4 rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
                <MessagesSquare className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-ink">{d.title}</p>
                <p className="truncate text-xs text-ink-soft">{d.description || `${d.lines.length} lines`}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
