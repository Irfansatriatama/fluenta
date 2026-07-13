import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { NewsBrowser } from "@/components/lesson/NewsBrowser";
import { getRecentNews } from "@/lib/news";
import { getLanguage } from "@/lib/theme";

export const revalidate = 3600;

// Japanese Wikinews categories → Indonesian labels.
const CATS = [
  { key: "社会", label: "Masyarakat" },
  { key: "政治", label: "Politik" },
  { key: "国際", label: "Dunia" },
  { key: "経済", label: "Ekonomi" },
  { key: "スポーツ", label: "Olahraga" },
  { key: "文化", label: "Budaya" },
];

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  if (lang !== "ja") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Berita</h1>
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Bacaan berita otentik segera hadir untuk bahasa ini.
        </p>
      </div>
    );
  }

  const items = await getRecentNews(6);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
          <Newspaper className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Berita</h1>
          <p className="text-sm text-ink-soft">Baca artikel berita asli dengan audio — latihan otentik setingkat penutur asli.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Berita sedang tidak tersedia. Coba lagi nanti.
        </p>
      ) : (
        <NewsBrowser lang={lang} items={items} cats={CATS} />
      )}

      <p className="mt-8 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        Artikel dari ウィキニュース (Japanese Wikinews), CC BY 2.5.
      </p>
    </div>
  );
}
