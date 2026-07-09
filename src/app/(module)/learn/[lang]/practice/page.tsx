import { redirect } from "next/navigation";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/learn/${lang}/journey`);
}
