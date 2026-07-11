import { notFound } from "next/navigation";
import { getLanguage } from "@/lib/theme";
import { PlacementTest } from "../PlacementTest";

export default async function PlacementTestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();
  return <PlacementTest lang={lang} languageName={meta.name} />;
}
