import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import { LanguageSeal } from "@/components/brand/LanguageSeal";
import { ModuleMobileNav } from "@/components/module/ModuleMobileNav";
import { ModuleSidebar } from "@/components/module/ModuleSidebar";
import { accentVars, getLanguage } from "@/lib/theme";

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div style={accentVars(lang)} className="min-h-screen md:pl-64">
      <ModuleSidebar lang={lang} />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b hairline bg-ivory/90 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <LanguageSeal language={language} size={30} showLabel={false} />
          <span className="font-display text-base font-bold text-ink">{language.name}</span>
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 lg:px-12">{children}</main>

      <ModuleMobileNav lang={lang} />
    </div>
  );
}
