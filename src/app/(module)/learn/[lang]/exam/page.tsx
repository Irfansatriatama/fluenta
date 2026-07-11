import { notFound } from "next/navigation";
import { BookOpen, GraduationCap, Headphones, Languages, MessagesSquare, PenLine } from "lucide-react";
import cJa from "@/content/characters/ja.json";
import curriculum from "@/content/curriculum/ja.json";
import { getGrammar } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

type Level = {
  code: string; label: string; cefr: string;
  targets: { kanji: number; vocab: number; grammar: number };
  hours: string; pass: string; sections: string[]; canDo: string[];
};
type Exam = { id: string; name: string; fullName: string; note: string; levels: Level[] };

// How each JLPT/JFT test section maps to Fluenta practice.
const PRACTICE_MAP: { icon: typeof BookOpen; section: string; features: string }[] = [
  { icon: Languages, section: "Script & Vocabulary", features: "Flashcards + SRS · Characters · Stroke Order" },
  { icon: PenLine, section: "Grammar & Expression", features: "Grammar patterns · Particle Cloze · Conjugation Drill" },
  { icon: BookOpen, section: "Reading", features: "Graded Reading passages (news · conversation · story)" },
  { icon: Headphones, section: "Listening", features: "Listening lessons · Reading audio · Dialogs" },
  { icon: MessagesSquare, section: "Conversation", features: "Dialogs · Speaking · AI Tutor" },
];

// Count kanji the app teaches per JLPT level from the Characters content.
function appKanjiByLevel(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of (cJa as { groups: { title: string; items: unknown[] }[] }).groups) {
    const m = g.title.match(/N([1-5])/);
    if (m) out[`N${m[1]}`] = g.items.length;
  }
  return out;
}

function bar(covered: number, target: number) {
  const pct = target > 0 ? Math.min(100, Math.round((covered / target) * 100)) : 0;
  return { pct, covered, target };
}

export default async function ExamPrepPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  if (lang !== "ja") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{meta.name} Exam Prep</h1>
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Exam roadmaps are coming soon for this language.
        </p>
      </div>
    );
  }

  const exams = (curriculum as { exams: Exam[] }).exams;
  const kanjiApp = appKanjiByLevel();
  const grammarApp = getGrammar("ja").reduce<Record<string, number>>((acc, p) => {
    const code = (p.level || "").toUpperCase();
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  // Cumulative app coverage up to and including a JLPT level (N5→N1 order).
  const ORDER = ["N5", "N4", "N3", "N2", "N1"];
  const cum = (map: Record<string, number>, upto: string) => {
    const idx = ORDER.indexOf(upto);
    if (idx < 0) return map[upto] ?? 0;
    return ORDER.slice(0, idx + 1).reduce((s, c) => s + (map[c] ?? 0), 0);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Exam Prep</h1>
          <p className="text-sm text-ink-soft">Your roadmap to the JLPT and JFT-Basic — and how Fluenta covers each part.</p>
        </div>
      </div>

      {exams.map((exam) => (
        <section key={exam.id} className="mt-8">
          <h2 className="font-display text-xl font-extrabold text-ink">{exam.name}</h2>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{exam.fullName}</p>
          <p className="mt-2 text-sm text-ink-soft">{exam.note}</p>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {exam.levels.map((lv) => {
              const isJlpt = exam.id === "jlpt";
              const kanji = bar(isJlpt ? cum(kanjiApp, lv.code) : (kanjiApp["N5"] ?? 0) + (kanjiApp["N4"] ?? 0), lv.targets.kanji);
              const grammar = bar(isJlpt ? cum(grammarApp, lv.code) : (grammarApp["N5"] ?? 0) + (grammarApp["N4"] ?? 0), lv.targets.grammar);
              return (
                <div key={lv.code} className="rounded-2xl border hairline bg-paper p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-extrabold" style={{ color: "var(--accent)" }}>
                        {exam.id === "jlpt" ? lv.code : "JFT-Basic"}
                      </span>
                      <span className="text-sm font-semibold text-ink">{lv.label}</span>
                    </div>
                    <span className="rounded-full border hairline px-2.5 py-1 text-[0.7rem] font-bold text-ink-soft">CEFR {lv.cefr}</span>
                  </div>

                  {/* coverage */}
                  <div className="mt-4 flex flex-col gap-3">
                    {[
                      { name: "Kanji", d: kanji },
                      { name: "Grammar points", d: grammar },
                    ].map(({ name, d }) => (
                      <div key={name}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink-soft">{name}</span>
                          <span className="text-ink-faint">{d.covered} / {d.target}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-2">
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: "var(--accent)" }} />
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-ink-faint">
                      Target vocab ≈ {lv.targets.vocab.toLocaleString()}{lv.hours !== "—" ? ` · ~${lv.hours} study hours` : ""}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-paper-2 px-3 py-2 text-xs text-ink-soft">
                    <span className="font-semibold text-ink">Pass:</span> {lv.pass}
                  </div>

                  <div className="mt-3">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">Sections</p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {lv.sections.map((s) => (
                        <li key={s} className="rounded-lg border hairline px-2 py-1 text-[0.7rem] text-ink-soft">{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">Can-do</p>
                    <ul className="mt-1 list-disc pl-4 text-xs text-ink-soft">
                      {lv.canDo.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* practice mapping */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">How your practice maps to the test</h2>
        <div className="mt-3 flex flex-col gap-2">
          {PRACTICE_MAP.map(({ icon: Icon, section, features }) => (
            <div key={section} className="flex items-center gap-3 rounded-2xl border hairline bg-paper p-4 shadow-soft">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-ink">{section}</p>
                <p className="text-xs text-ink-soft">{features}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        JLPT counts are community estimates (the JLPT publishes no official lists since 2010); test structure and
        scoring are from jlpt.jp and jft-basic.jpf.go.jp. Coverage bars reflect the material currently in Fluenta.
      </p>
    </div>
  );
}
