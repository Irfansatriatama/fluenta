import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-3xl border hairline bg-paper p-7 shadow-lift sm:p-8">
        {children}
      </div>
      <p className="mt-6 text-xs text-ink-faint">Perjalananmu, kisahmu.</p>
    </div>
  );
}
