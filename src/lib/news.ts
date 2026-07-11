/**
 * Japanese reading material from Wikinews (ja.wikinews.org).
 *
 * Wikinews text is licensed CC BY 2.5 — free to reuse with attribution — so,
 * unlike NHK/commercial news sites, it is legal to display in the app. The
 * project was archived in 2026, so this is a large body of real news articles
 * for reading practice (not a live feed). Attribution is shown in the UI.
 */

const API = "https://ja.wikinews.org/w/api.php";
const UA = "Fluenta/1.0 (language-learning app; contact via github.com/Irfansatriatama/fluenta)";

export const NEWS_CATEGORIES: { key: string; label: string }[] = [
  { key: "社会", label: "Society" },
  { key: "政治", label: "Politics" },
  { key: "国際", label: "World" },
  { key: "経済", label: "Economy" },
  { key: "スポーツ", label: "Sports" },
  { key: "文化", label: "Culture" },
];

export type NewsItem = {
  pageid: number;
  title: string;
  extract: string;
  url: string;
  category?: string;
};

type WikiPage = { pageid: number; title: string; extract?: string; fullurl?: string; canonicalurl?: string };

async function query(params: Record<string, string>): Promise<Record<string, WikiPage> | null> {
  const sp = new URLSearchParams({ action: "query", format: "json", ...params });
  try {
    const res = await fetch(`${API}?${sp.toString()}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    return json.query?.pages ?? null;
  } catch {
    return null;
  }
}

function toItems(pages: Record<string, WikiPage> | null, category?: string): NewsItem[] {
  if (!pages) return [];
  return Object.values(pages)
    .map((p) => ({
      pageid: p.pageid,
      title: p.title,
      extract: (p.extract ?? "").trim(),
      url: p.fullurl ?? p.canonicalurl ?? "",
      category,
    }))
    .filter((i) => i.extract.length > 0);
}

export async function getNewsByCategory(cat: string, limit = 8): Promise<NewsItem[]> {
  const pages = await query({
    generator: "categorymembers",
    gcmtitle: `Category:${cat}`,
    gcmtype: "page",
    gcmsort: "timestamp",
    gcmdir: "desc",
    gcmlimit: String(limit),
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
  });
  // Newer articles have higher pageids — a stable proxy for recency.
  return toItems(pages, cat).sort((a, b) => b.pageid - a.pageid);
}

export async function getRecentNews(perCat = 4): Promise<NewsItem[]> {
  const lists = await Promise.all(NEWS_CATEGORIES.map((c) => getNewsByCategory(c.key, perCat)));
  const seen = new Set<number>();
  const out: NewsItem[] = [];
  for (const list of lists) {
    for (const it of list) {
      if (!seen.has(it.pageid)) {
        seen.add(it.pageid);
        out.push(it);
      }
    }
  }
  return out.sort((a, b) => b.pageid - a.pageid);
}

export async function getNewsArticle(pageid: number): Promise<NewsItem | null> {
  const pages = await query({
    pageids: String(pageid),
    prop: "extracts|info",
    explaintext: "1",
    inprop: "url",
  });
  return toItems(pages)[0] ?? null;
}
