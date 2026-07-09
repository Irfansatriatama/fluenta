import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { HubMobileNav } from "@/components/hub/HubMobileNav";
import { HubSidebar } from "@/components/hub/HubSidebar";
import { requireSession } from "@/lib/session";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="min-h-screen md:pl-64">
      <HubSidebar user={{ name: session.user.name, email: session.user.email }} />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b hairline bg-ivory/90 px-4 backdrop-blur-md md:hidden">
        <Logo />
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 lg:px-12">{children}</main>

      <HubMobileNav />
    </div>
  );
}
