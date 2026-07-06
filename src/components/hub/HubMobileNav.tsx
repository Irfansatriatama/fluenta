"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HUB_NAV } from "@/lib/nav";

export function HubMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-paper/95 backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {HUB_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5"
                style={{
                  color: active ? "var(--color-gold-deep)" : "var(--color-ink-soft)",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[0.6rem] font-semibold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
