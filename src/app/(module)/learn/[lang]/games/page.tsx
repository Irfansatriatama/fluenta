import Link from "next/link";
import { notFound } from "next/navigation";
import { Grid3x3, Repeat, Shuffle, Sparkles, SquareStack } from "lucide-react";
import { getLanguage } from "@/lib/theme";

const GAMES = [
  { href: "games/quiz", icon: Sparkles, title: "Practice Quiz", sub: "Endless questions, always accurate", langs: ["ja"] },
  { href: "games/memory", icon: Grid3x3, title: "Memory Match", sub: "Match words with meanings" },
  { href: "games/scramble", icon: Shuffle, title: "Word Scramble", sub: "Unscramble the letters" },
  { href: "games/particles", icon: SquareStack, title: "Particle Cloze", sub: "Fill in は・が・を・に…", langs: ["ja"] },
  { href: "games/conjugation", icon: Repeat, title: "Conjugation Drill", sub: "ます・て・ない・た forms", langs: ["ja"] },
];

export default async function GamesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const games = GAMES.filter((g) => !g.langs || g.langs.includes(lang));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{meta.name} Games</h1>
      <p className="mt-1 text-sm text-ink-soft">Quick games and drills to sharpen your skills.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {games.map((g) => (
          <Link
            key={g.href}
            href={`/learn/${lang}/${g.href}`}
            className="flex items-center gap-4 rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: "var(--accent)" }}>
              <g.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-base font-bold text-ink">{g.title}</p>
              <p className="text-xs text-ink-soft">{g.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
