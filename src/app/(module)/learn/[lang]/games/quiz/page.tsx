import { notFound } from "next/navigation";
import { AiQuiz } from "@/components/lesson/AiQuiz";
import { getLanguage } from "@/lib/theme";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();
  return <AiQuiz lang={lang} languageName={meta.name} />;
}
