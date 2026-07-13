"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { MODULE_NAV, moduleHref } from "@/lib/nav";
import { getLanguage } from "@/lib/theme";

export function ModuleSidebar({ lang }: { lang: string }) {
  const pathname = usePathname();
  const language = getLanguage(lang);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r hairline bg-paper/60 px-4 py-6 md:flex">
      <Link
        href="/home"
        className="flex items-center gap-1.5 px-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Semua bahasa
      </Link>

      {language && (
        <div className="mt-4 flex items-center gap-3 px-2">
          <LanguageSeal language={language} size={44} showLabel={false} />
          <div>
            <p className="font-display text-base font-bold text-ink">{language.name}</p>
            <p className="text-xs text-ink-soft" lang={lang}>
              {language.nativeName}
            </p>
          </div>
        </div>
      )}

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {MODULE_NAV.map(({ label, segment, icon: Icon }) => {
          const href = moduleHref(lang, segment);
          const active = segment === "" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors data-[active=false]:text-ink-soft data-[active=false]:hover:bg-paper-2"
              data-active={active}
              style={
                active
                  ? {
                      color: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 11%, transparent)",
                    }
                  : undefined
              }
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
