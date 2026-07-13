import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getRecentNews } from "@/lib/news";
import { getLanguage } from "@/lib/theme";

export const revalidate = 3600;

const CAT_LABEL: Record<string, string> = {
  社会: "Masyarakat", 政治: "Politik", 国際: "Dunia", 経済: "Ekonomi", スポーツ: "Olahraga", 文化: "Budaya",
};

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

  const items = await getRecentNews(5);

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
        <div className="mt-6 grid grid-cols-1 gap-3">
          {items.map((it) => (
            <Link
              key={it.pageid}
              href={`/learn/${lang}/news/${it.pageid}`}
              className="rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]"
            >
              {it.category && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">
                  {CAT_LABEL[it.category] ?? it.category}
                </span>
              )}
              <p className="mt-0.5 font-display text-lg font-bold leading-snug text-ink" lang={lang}>{it.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft" lang={lang}>{it.extract}</p>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-8 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        Articles from ウィキニュース (Japanese Wikinews), CC BY 2.5.
      </p>
    </div>
  );
}
