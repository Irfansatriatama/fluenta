/*
  Warnings:

  - You are about to drop the column `dailyGoalXp` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "dailyGoalXp",
ADD COLUMN     "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "learningReason" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3);
