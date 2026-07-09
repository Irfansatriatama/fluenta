import { notFound } from "next/navigation";
import { TutorChat } from "@/components/lesson/TutorChat";
import { getLanguage } from "@/lib/theme";

const GREETINGS: Record<string, string> = {
  ja: "こんにちは！日本語について何でも聞いてください。\nHello! Ask me anything about Japanese.",
  ko: "안녕하세요! 한국어에 대해 무엇이든 물어보세요.\nHello! Ask me anything about Korean.",
  zh: "你好！关于中文，随便问我。\nHi! Ask me anything about Chinese.",
  en: "Hi! I'm your English tutor — ask me anything about grammar, words, or practice.",
};

export default async function TutorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <TutorChat
      lang={lang}
      languageName={language.name}
      greeting={GREETINGS[lang] ?? `Hi! Ask me anything about ${language.name}.`}
    />
  );
}
