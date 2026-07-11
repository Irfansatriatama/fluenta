import { notFound } from "next/navigation";
import { ConjugationDrill } from "@/components/lesson/ConjugationDrill";
import verbs from "@/content/practice/verbs-ja.json";
import type { ConjWord } from "@/lib/conjugation";

export default async function ConjugationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "ja") notFound();
  return <ConjugationDrill words={verbs.words as ConjWord[]} />;
}
