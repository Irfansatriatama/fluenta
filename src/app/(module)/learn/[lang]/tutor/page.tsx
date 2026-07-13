import { notFound } from "next/navigation";
import { TutorChat } from "@/components/lesson/TutorChat";
import { getLanguage } from "@/lib/theme";

const GREETINGS: Record<string, string> = {
  ja: "こんにちは！日本語について何でも聞いてください。\nHalo, aku Kei. Tanya apa saja soal bahasa Jepang — grammar, kata, atau latihan.",
  ko: "안녕하세요! 한국어에 대해 무엇이든 물어보세요.\nHalo, aku Kei. Tanya apa saja soal bahasa Korea.",
  zh: "你好！关于中文，随便问我。\nHalo, aku Kei. Tanya apa saja soal bahasa Mandarin.",
  en: "Halo, aku Kei — pemandu bahasa Inggrismu. Tanya apa saja soal grammar, kata, atau latihan.",
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
      greeting={GREETINGS[lang] ?? `Halo, aku Kei. Tanya apa saja soal ${language.name}.`}
    />
  );
}
