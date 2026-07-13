"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

// Real anchors into the page — no "Pricing"/"For Schools" on a free, one-home app.
const LINKS = [
  { label: "Bahasa", href: "#dunia" },
  { label: "Sang Mentor", href: "#mentor" },
  { label: "Kenapa gratis", href: "#kenapa" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-ivory/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-ink transition-colors hover:bg-paper-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="md:mr-6">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">EN</span>
            <ChevronDown className="hidden h-3.5 w-3.5 sm:inline" />
          </button>
          <a
            href="/login"
            className="rounded-xl border border-edge bg-paper px-4 py-1.5 text-sm font-semibold text-ink shadow-soft transition-colors hover:border-gold/60"
          >
            Masuk
          </a>
        </div>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t hairline bg-ivory px-5 py-3 text-sm font-medium text-ink-soft md:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-lg px-3 py-2 transition-colors hover:bg-paper-2 hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
