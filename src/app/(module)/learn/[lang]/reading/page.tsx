import { notFound } from "next/navigation";
import { ReadingBrowser, type ReadingItem } from "@/components/lesson/ReadingBrowser";
import { getReading } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const passages = getReading(lang);
  const items: ReadingItem[] = passages.map((p) => ({
    id: p.id,
    title: p.title,
    titleEn: p.titleEn,
    level: p.level,
    type: p.type,
    topic: p.topic,
    minutes: p.minutes,
  }));

  return (
    <div className="fl-enter mx-auto max-w-3xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Bacaan
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Teks berjenjang — berita, percakapan, dan cerita pendek dengan furigana, audio, dan uji pemahaman.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Teks bacaan segera hadir untuk bahasa ini.
        </p>
      ) : (
        <ReadingBrowser lang={lang} passages={items} />
      )}
    </div>
  );
}
