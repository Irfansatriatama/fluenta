import { notFound } from "next/navigation";
import { StrokeOrder, type StrokeGroup } from "@/components/lesson/StrokeOrder";
import cJa from "@/content/characters/ja.json";
import strokeData from "@/content/strokes/ja.json";
import { getLanguage } from "@/lib/theme";

const STROKES = strokeData as Record<string, string[]>;

// Which character groups to offer, mapped from the Characters content titles.
const WANT: { src: RegExp; title: string }[] = [
  { src: /hiragana/i, title: "Hiragana" },
  { src: /katakana/i, title: "Katakana" },
  { src: /n5/i, title: "Kanji N5" },
  { src: /n4/i, title: "Kanji N4" },
  { src: /n3/i, title: "Kanji N3" },
  { src: /n2/i, title: "Kanji N2" },
  { src: /n1/i, title: "Kanji N1" },
];

export default async function StrokesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const source = (cJa as { groups: { title: string; items: { char: string }[] }[] }).groups;
  const groups: StrokeGroup[] =
    lang === "ja"
      ? WANT.map(({ src, title }) => {
          const g = source.find((x) => src.test(x.title));
          const chars = (g?.items ?? []).map((it) => it.char).filter((c) => STROKES[c]);
          return { title, chars };
        }).filter((g) => g.chars.length > 0)
      : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Stroke Order
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Tap a character to watch how it&apos;s written, stroke by stroke.
      </p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Stroke-order animations are coming soon for this language.
        </p>
      ) : (
        <div className="mt-6">
          <StrokeOrder groups={groups} />
        </div>
      )}

      {lang === "ja" && groups.length > 0 && (
        <p className="mt-8 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
          Stroke data from KanjiVG © Ulrich Apel, used under CC BY-SA 3.0 (kanjivg.tagaini.net).
        </p>
      )}
    </div>
  );
}
