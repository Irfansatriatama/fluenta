import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// The Mentor's voice — a characterful editorial serif used only where the
// product speaks *as Kei* to you. Variable weight + real italic.
const serif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fluenta — Learn 4 Languages. One Beautiful Journey.",
  description:
    "Japanese, Korean, Chinese, English — master them all in one place with a gamified path that keeps you motivated every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable} h-full`}>
      <body className="min-h-full bg-ivory font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
