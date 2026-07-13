import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { CharacterGrid } from "@/components/lesson/CharacterGrid";
import { getCharacters } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const groups = getCharacters(lang);

  return (
    <div className="fl-enter mx-auto max-w-4xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Aksara {meta.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Sistem tulisan, cara baca, dan contoh.</p>

      {lang === "ja" && (
        <Link
          href={`/learn/${lang}/strokes`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border hairline bg-paper px-4 py-2.5 text-sm font-bold text-ink shadow-soft transition-colors hover:border-[color:var(--accent)]"
        >
          <PenLine className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Latih urutan goresan
        </Link>
      )}

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          {meta.name} memakai alfabet Latin — tidak ada set aksara terpisah untuk dipelajari di sini.
        </p>
      ) : (
        <CharacterGrid groups={groups} lang={lang} />
      )}

      {lang === "ja" && groups.length > 0 && (
        <p className="mt-8 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
          Kanji readings &amp; meanings derived from KANJIDIC2, © the Electronic
          Dictionary Research and Development Group, used under CC BY-SA 4.0.
        </p>
      )}
    </div>
  );
}
