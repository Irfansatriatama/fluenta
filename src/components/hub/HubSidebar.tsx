"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { HUB_NAV } from "@/lib/nav";

export function HubSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const initial = user.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r hairline bg-paper/60 px-4 py-6 md:flex">
      <div className="px-2">
        <Logo />
        <p className="mt-1 pl-8 text-xs text-ink-soft">Rumah untuk semua bahasa.</p>
      </div>

      <p className="mt-8 px-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink-faint">
        Umum
      </p>
      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {HUB_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors data-[active=false]:text-ink-soft data-[active=false]:hover:bg-paper-2"
              data-active={active}
              style={
                active
                  ? { color: "var(--color-gold-deep)", backgroundColor: "rgba(193,145,46,0.12)" }
                  : undefined
              }
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/home/profile"
        className="mt-4 flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-paper-2"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-ivory">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
          <span className="block truncate text-xs text-ink-soft">{user.email}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-soft" />
      </Link>
    </aside>
  );
}
