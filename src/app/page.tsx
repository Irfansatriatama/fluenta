import { Logo } from "@/components/brand/Logo";
import { ComingSoon } from "@/components/landing/ComingSoon";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ComingSoon />
      </main>
      <footer className="border-t hairline bg-ivory">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} Fluenta. Your journey, your story.</p>
        </div>
      </footer>
    </>
  );
}
