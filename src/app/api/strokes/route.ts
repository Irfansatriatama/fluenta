import strokes from "@/content/strokes/ja.json";

const DATA = strokes as Record<string, string[]>;

// Returns the KanjiVG stroke paths for one character: /api/strokes?c=日
export function GET(request: Request) {
  const c = new URL(request.url).searchParams.get("c") ?? "";
  const paths = DATA[c] ?? null;
  return Response.json(
    { char: c, paths },
    { headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
