"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function activateLanguage(formData: FormData) {
  const session = await requireSession();
  const lang = String(formData.get("lang"));
  const level = String(formData.get("level") || "Beginner");

  const language = await prisma.language.findUnique({ where: { code: lang } });
  if (!language) redirect("/home");

  const track = await prisma.track.findFirst({
    where: { languageId: language.id },
    orderBy: { sortOrder: "asc" },
  });

  await prisma.enrollment.upsert({
    where: { userId_languageId: { userId: session.user.id, languageId: language.id } },
    create: {
      userId: session.user.id,
      languageId: language.id,
      trackId: track?.id ?? null,
      currentLevel: level,
    },
    update: { currentLevel: level },
  });

  redirect(`/learn/${lang}`);
}
