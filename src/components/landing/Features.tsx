import { Flame, Heart, Sparkles, Stamp, type LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  accent: string;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Stamp,
    accent: "#b23a2e",
    title: "Passport Progress",
    body: "Your progress is a passport. Stamp every win.",
  },
  {
    icon: Flame,
    accent: "#e8862f",
    title: "Build Streaks",
    body: "Keep the flame alive. Consistency is power.",
  },
  {
    icon: Sparkles,
    accent: "#c1912e",
    title: "Smart & Personal",
    body: "Adaptive lessons that fit your level and goals.",
  },
  {
    icon: Heart,
    accent: "#b23a2e",
    title: "Real Results",
    body: "Track, improve, and see real growth.",
  },
];

export function Features() {
  return (
    <section className="border-y hairline bg-paper/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="mb-10 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-edge" />
          <h2 className="text-center font-display text-lg font-bold text-ink">
            Why learners love Fluenta
          </h2>
          <span className="h-px w-10 bg-edge" />
        </div>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, accent, title, body }) => (
            <li key={title} className="flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ivory ring-1 ring-edge"
                style={{ color: accent }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.7} />
              </span>
              <div>
                <h3 className="font-display text-[0.95rem] font-bold text-ink">
                  {title}
                </h3>
                <p className="mt-1 max-w-[15rem] text-sm leading-relaxed text-ink-soft">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
