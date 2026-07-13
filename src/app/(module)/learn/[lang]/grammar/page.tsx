import { notFound } from "next/navigation";
import particlesData from "@/content/practice/particles-ja.json";
import { GrammarBrowser, type ParticleGroup } from "@/components/lesson/GrammarBrowser";
import { getGrammar } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

type ParticleItem = { level: string; before?: string; after?: string; sentence?: string; answer: string; en: string; explain: string };

const PARTICLE_ORDER = ["は", "が", "を", "に", "で", "へ", "と", "も", "から", "まで", "の", "か", "や"];
const PARTICLE_INFO: Record<string, { role: string; desc: string }> = {
  は: { role: "Topik", desc: "Menandai topik — tentang apa kalimatnya." },
  が: { role: "Subjek", desc: "Menandai subjek; juga keberadaan, kemampuan, dan suka/tidak suka." },
  を: { role: "Objek", desc: "Menandai objek langsung sebuah aksi, atau jalur yang dilalui." },
  に: { role: "Tujuan / Waktu", desc: "Tujuan, objek tidak langsung, atau titik waktu tertentu." },
  で: { role: "Tempat / Cara", desc: "Tempat aksi terjadi, atau alat/cara yang dipakai." },
  へ: { role: "Arah", desc: "Arah gerakan (sering bisa ditukar dengan に)." },
  と: { role: "Dengan / Dan", desc: "'Dengan' seseorang, atau 'dan' menggabungkan daftar benda yang lengkap." },
  も: { role: "Juga", desc: "'Juga', menggantikan は atau が." },
  から: { role: "Dari", desc: "Titik awal waktu atau tempat; juga 'karena'." },
  まで: { role: "Sampai", desc: "Titik akhir gerakan atau waktu." },
  の: { role: "Kepemilikan", desc: "Menghubungkan benda: kepemilikan atau keterangan (A の B = B milik A)." },
  か: { role: "Tanya / Atau", desc: "Membuat pertanyaan, atau 'atau' antar benda." },
  や: { role: "Dan (sebagian)", desc: "'Dan' untuk daftar contoh yang tidak lengkap." },
};

function particleSentence(it: ParticleItem): string {
  if (it.sentence) return it.sentence.replace("＿", it.answer);
  return `${it.before ?? ""}${it.answer}${it.after ?? ""}`;
}

function particleGroups(): ParticleGroup[] {
  const items = particlesData.items as ParticleItem[];
  const byParticle = new Map<string, { native: string; en: string }[]>();
  for (const it of items) {
    const list = byParticle.get(it.answer) ?? [];
    list.push({ native: particleSentence(it), en: it.en });
    byParticle.set(it.answer, list);
  }
  const ordered = [...byParticle.keys()].sort((a, b) => {
    const ia = PARTICLE_ORDER.indexOf(a);
    const ib = PARTICLE_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return ordered.map((particle) => ({
    particle,
    role: PARTICLE_INFO[particle]?.role,
    desc: PARTICLE_INFO[particle]?.desc,
    examples: byParticle.get(particle)!,
  }));
}

export default async function GrammarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const patterns = getGrammar(lang);
  const levels = LEVELS.map((level) => ({
    level,
    items: patterns.filter((p) => (p.level || "").toUpperCase() === level),
  })).filter((g) => g.items.length > 0);
  const other = patterns.filter((p) => !LEVELS.includes((p.level || "").toUpperCase()));
  const particles = lang === "ja" ? particleGroups() : [];

  return (
    <div className="fl-enter mx-auto max-w-3xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Tata Bahasa
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {patterns.length} pola{levels.length > 0 ? " dari JLPT N5–N1" : ""}, tiap pola dengan contoh.
      </p>

      {patterns.length === 0 && particles.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Referensi tata bahasa untuk bahasa ini segera hadir.
        </p>
      ) : (
        <GrammarBrowser lang={lang} particles={particles} levels={levels} other={other} />
      )}
    </div>
  );
}
