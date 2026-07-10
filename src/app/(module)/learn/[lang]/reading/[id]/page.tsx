import { notFound } from "next/navigation";
import { ReadingRunner } from "@/components/lesson/ReadingRunner";
import { getReadingPassage } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function ReadingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!getLanguage(lang)) notFound();

  const passage = getReadingPassage(lang, id);
  if (!passage) notFound();

  return <ReadingRunner passage={passage} lang={lang} backHref={`/learn/${lang}/reading`} />;
}
