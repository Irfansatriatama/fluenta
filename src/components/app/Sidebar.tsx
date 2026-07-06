"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r hairline bg-paper/60 px-4 py-6 md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
              style={
                active
                  ? { color: "#b23a2e", backgroundColor: "rgba(178,58,46,0.09)" }
                  : undefined
              }
              data-active={active}
            >
              <Icon
                className="h-5 w-5 data-[muted=true]:text-ink-soft"
                strokeWidth={active ? 2.2 : 1.8}
                data-muted={!active}
              />
              <span className={active ? "" : "text-ink-soft"}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border hairline bg-ivory p-4">
        <div className="flex items-center gap-2 text-gold-deep">
          <Sparkles className="h-4 w-4" />
          <p className="font-display text-sm font-bold text-ink">Go Premium</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          Unlock all languages and premium features.
        </p>
        <button className="mt-3 w-full rounded-xl bg-gold px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-gold-deep">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
