// XP → level model. 500 XP per level (tune later).
const XP_PER_LEVEL = 500;

export function levelProgress(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const into = totalXp - (level - 1) * XP_PER_LEVEL;
  const percent = Math.round((into / XP_PER_LEVEL) * 100);
  const toNext = XP_PER_LEVEL - into;
  return { level, percent, toNext };
}
