# Kanji dataset

`kanji.json` — 2,383 kanji covering the full JLPT progression (N5→N1) plus the
remaining Jōyō kanji. Each entry: `char`, `jlpt` (5–1 or null), `grade`, `freq`
(newspaper frequency rank), `strokes`, `on`/`kun` readings, and English
`meanings`.

Derived from **KANJIDIC2**, © the Electronic Dictionary Research and
Development Group (EDRDG), used under the
[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
licence. The set was filtered to JLPT + Jōyō and sorted by JLPT level then
frequency. WaniKani-derived fields from the upstream aggregate were dropped;
only KANJIDIC2 fields are kept.

Consumed by:
- `scripts/gen-kanji.ts` → `src/content/characters/ja.json` (browse grids)
- `prisma/import-kanji.ts` → DB decks `deck-ja-kanji-n5 … n1 / jouyou` (SRS + journey)
