// A global learner-rank ladder (Indonesian, thematic to the journey/passport).
// Distinct from the per-passport cultural ranks in lib/paspor.ts — this one is
// cross-language, driven by total level, and shown on the Progress page.

export const LEARNER_RANKS = [
  { min: 1, name: "Pemula" },
  { min: 3, name: "Penjelajah" },
  { min: 6, name: "Terampil" },
  { min: 10, name: "Mahir" },
  { min: 16, name: "Ahli" },
  { min: 25, name: "Cendekia" },
  { min: 40, name: "Master" },
] as const;

export type LearnerRank = { name: string; index: number; total: number };

export function learnerRank(level: number): LearnerRank {
  let index = 0;
  for (let i = 0; i < LEARNER_RANKS.length; i++) {
    if (level >= LEARNER_RANKS[i].min) index = i;
  }
  return { name: LEARNER_RANKS[index].name, index, total: LEARNER_RANKS.length };
}
