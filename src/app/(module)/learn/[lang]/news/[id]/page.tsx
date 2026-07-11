import { notFound } from "next/navigation";
import { NewsReader } from "@/components/lesson/NewsReader";
import { getNewsArticle } from "@/lib/news";
import { getLanguage } from "@/lib/theme";

export const revalidate = 3600;

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!getLanguage(lang) || lang !== "ja") notFound();

  const pageid = Number(id);
  if (!Number.isFinite(pageid)) notFound();

  const article = await getNewsArticle(pageid);
  if (!article) notFound();

  return <NewsReader article={article} lang={lang} backHref={`/learn/${lang}/news`} />;
}
