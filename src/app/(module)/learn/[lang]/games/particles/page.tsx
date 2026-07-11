import { notFound } from "next/navigation";
import { ParticleCloze, type ClozeItem } from "@/components/lesson/ParticleCloze";
import particles from "@/content/practice/particles-ja.json";

export default async function ParticlesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "ja") notFound();
  return <ParticleCloze items={particles.items as ClozeItem[]} />;
}
