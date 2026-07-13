"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, MessagesSquare, Newspaper, ScrollText, Search } from "lucide-react";

export type ReadingItem = {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  type: string;
  topic: string;
  minutes: number;
};

const TYPE_ICON: Record<string, typeof BookOpen> = {
  news: Newspaper,
  conversation: MessagesSquare,
  story: ScrollText,
};

const TYPE_TABS = [
  { key: "all", label: "Semua" },
  { key: "news", label: "Berita" },
  { key: "conversation", label: "Percakapan" },
  { key: "story", label: "Cerita" },
];

const LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"];

export function ReadingBrowser({ lang, passages }: { lang: string; passages: ReadingItem[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return passages.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        (p.topic ?? "").toLowerCase().includes(q)
      );
    });
  }, [passages, query, type]);

  const levels = LEVEL_ORDER.filter((lv) => filtered.some((p) => p.level === lv));

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bacaan…"
            className="w-full rounded-xl border border-edge bg-paper py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-[color:var(--accent)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPE_TABS.map((t) => {
            const on = t.key === type;
            return (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors"
                style={
                  on
                    ? { borderColor: "var(--accent)", backgroundColor: "var(--accent)", color: "#fff" }
                    : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-center text-sm text-ink-soft">
          Tidak ada bacaan yang cocok.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {levels.map((level) => (
            <section key={level}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                JLPT {level} <span className="text-ink-faint">({filtered.filter((p) => p.level === level).length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered
                  .filter((p) => p.level === level)
                  .map((p) => {
                    const Icon = TYPE_ICON[p.type] ?? BookOpen;
                    return (
                      <Link
                        key={p.id}
                        href={`/learn/${lang}/reading/${p.id}`}
                        className="flex items-start gap-3 rounded-2xl border hairline bg-paper p-4 shadow-soft transition-colors hover:border-[color:var(--accent)]"
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ivory ring-1 ring-edge"
                          style={{ color: "var(--accent)" }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-bold text-ink" lang={lang}>
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-ink-soft">{p.titleEn}</p>
                          <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-ink-faint">
                            {p.topic} · {p.minutes} min
                          </p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
