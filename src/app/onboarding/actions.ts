"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function saveOnboarding(formData: FormData) {
  const session = await requireSession();
  const dailyGoalMinutes = Number(formData.get("goal")) || 15;
  const reason = (formData.get("reason") as string) || null;

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: session.user.name,
      dailyGoalMinutes,
      learningReason: reason,
      onboardedAt: new Date(),
    },
    update: { dailyGoalMinutes, learningReason: reason, onboardedAt: new Date() },
  });

  redirect("/home");
}
