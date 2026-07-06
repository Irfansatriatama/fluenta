import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

export default async function AddLanguagePage() {
  const session = await requireSession();

  const [languages, enrollments] = await Promise.all([
    prisma.language.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.enrollment.findMany({ where: { userId: session.user.id }, select: { languageId: true } }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.languageId));
  const available = languages.filter((l) => !enrolledIds.has(l.id));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/home" className="text-sm font-semibold text-ink-soft hover:text-ink">
        ← Back to home
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Add a language
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Pick a language and take a quick placement to get started.
      </p>

      {available.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          You have already activated every available language. More coming soon.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {available.map((l) => {
            const meta = getLanguage(l.code);
            return (
              <Link
                key={l.id}
                href={`/learn/${l.code}/placement`}
                className="flex items-center gap-4 rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-gold/50"
              >
                {meta && <LanguageSeal language={meta} size={56} showLabel={false} />}
                <div className="flex-1">
                  <p className="font-display text-base font-bold text-ink">{l.name}</p>
                  <p className="text-xs text-ink-soft" lang={l.code}>
                    {l.nativeName}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-ink-soft" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
