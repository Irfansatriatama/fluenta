import { Crown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MEDAL = ["#C1912E", "#9AA0A6", "#B87333"]; // gold / silver / bronze

export default async function LeaderboardPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const grouped = await prisma.xpEvent.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 25,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(users.map((u) => [u.id, u.name]));

  const rows = grouped.map((g, i) => ({
    rank: i + 1,
    userId: g.userId,
    name: nameOf.get(g.userId) ?? "Learner",
    xp: g._sum.amount ?? 0,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Leaderboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Top learners by total XP.</p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          No XP earned yet. Complete a lesson to get on the board.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {rows.map((r) => {
            const isMe = r.userId === userId;
            const medal = r.rank <= 3 ? MEDAL[r.rank - 1] : null;
            return (
              <li
                key={r.userId}
                className="flex items-center gap-4 rounded-2xl border bg-paper px-4 py-3 shadow-soft"
                style={isMe ? { borderColor: "var(--color-gold)", backgroundColor: "rgba(193,145,46,0.08)" } : { borderColor: "var(--color-edge)" }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold"
                  style={
                    medal
                      ? { color: "#fff", backgroundColor: medal }
                      : { color: "var(--color-ink-soft)", backgroundColor: "var(--color-paper-2)" }
                  }
                >
                  {r.rank <= 3 ? <Crown className="h-4 w-4" /> : r.rank}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-ivory">
                  {r.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {r.name}
                  {isMe && <span className="ml-2 text-xs font-medium text-gold-deep">You</span>}
                </span>
                <span className="font-display text-sm font-bold text-ink">{r.xp.toLocaleString()} XP</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
