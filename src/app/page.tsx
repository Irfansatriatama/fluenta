import { Logo } from "@/components/brand/Logo";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ComingSoon } from "@/components/landing/ComingSoon";
import { FourWorlds } from "@/components/landing/FourWorlds";
import { Hero } from "@/components/landing/Hero";
import { MentorIntro } from "@/components/landing/MentorIntro";
import { Navbar } from "@/components/landing/Navbar";
import { Origin } from "@/components/landing/Origin";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FourWorlds />
        <MentorIntro />
        <Origin />
        <ComingSoon />
        <ClosingCta />
      </main>
      <footer className="border-t hairline bg-ivory">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} Fluenta. Rumahmu untuk semua bahasa.</p>
        </div>
      </footer>
    </>
  );
}
