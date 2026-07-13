"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export type NewsCard = { pageid: number; title: string; extract: string; category?: string };
export type NewsCat = { key: string; label: string };

export function NewsBrowser({ lang, items, cats }: { lang: string; items: NewsCard[]; cats: NewsCat[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const labelOf = useMemo(() => {
    const m = new Map(cats.map((c) => [c.key, c.label]));
    return (k?: string) => (k ? m.get(k) ?? k : "");
  }, [cats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (cat !== "all" && it.category !== cat) return false;
      if (!q) return true;
      return it.title.toLowerCase().includes(q) || it.extract.toLowerCase().includes(q);
    });
  }, [items, query, cat]);

  const tabs = [{ key: "all", label: "Semua" }, ...cats.filter((c) => items.some((it) => it.category === c.key))];

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita…"
            className="w-full rounded-xl border border-edge bg-paper py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-[color:var(--accent)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const on = t.key === cat;
            return (
              <button
                key={t.key}
                onClick={() => setCat(t.key)}
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
          Tidak ada berita yang cocok.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {filtered.map((it) => (
            <Link
              key={it.pageid}
              href={`/learn/${lang}/news/${it.pageid}`}
              className="rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]"
            >
              {it.category && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">
                  {labelOf(it.category)}
                </span>
              )}
              <p className="mt-0.5 font-display text-lg font-bold leading-snug text-ink" lang={lang}>{it.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft" lang={lang}>{it.extract}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
