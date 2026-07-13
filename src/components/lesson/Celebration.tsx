"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Trophy } from "lucide-react";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/motion";

function starCount(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

export type CelebrationStat = {
  icon: ReactNode;
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  countUp?: boolean;
};

// The app's one deliberately big moment, shared by every runner and module.
// Pass `score` (0–100) to show a 3-star rating, or omit it for a trophy.
export function Celebration({
  title = "Lesson complete!",
  voice,
  subtitle,
  score = null,
  stats,
  onContinue,
  continueLabel = "Continue",
  secondaryLabel,
  onSecondary,
}: {
  title?: string;
  // Kei's meaning-of-completion line — when set, it becomes the serif headline
  // and `title` demotes to a small eyebrow. Ties celebration to meaning, not +XP.
  voice?: string;
  subtitle?: string;
  score?: number | null;
  stats: CelebrationStat[];
  onContinue: () => void;
  continueLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const reduce = useReducedMotion();
  const stars = score === null ? 0 : starCount(score);
  const cols = stats.length >= 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
      {/* stars (scored) or a trophy, over a soft gold burst */}
      <div className="relative grid h-24 place-items-center">
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute h-24 w-24 rounded-full"
            style={{ background: "radial-gradient(circle, #D9A44155 0%, transparent 70%)" }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />
        )}
        {score === null ? (
          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 13 }}
          >
            <Trophy className="h-12 w-12" style={{ color: "#D9A441", fill: "#D9A44133" }} strokeWidth={1.8} />
          </motion.span>
        ) : (
          <div className="flex items-end gap-1.5">
            {[0, 1, 2].map((i) => {
              const filled = i < stars;
              const mid = i === 1;
              return (
                <motion.span
                  key={i}
                  initial={reduce ? false : { scale: 0, y: 8, rotate: -25, opacity: 0 }}
                  animate={{ scale: mid ? 1.15 : 1, y: mid ? -6 : 0, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.18, type: "spring", stiffness: 420, damping: 13 }}
                >
                  <Star
                    className={mid ? "h-11 w-11" : "h-9 w-9"}
                    style={{ color: filled ? "#D9A441" : "var(--color-edge)", fill: filled ? "#D9A441" : "transparent" }}
                    strokeWidth={1.8}
                  />
                </motion.span>
              );
            })}
          </div>
        )}
      </div>

      {voice && (
        <motion.p
          className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink-faint"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {title}
        </motion.p>
      )}
      <motion.h1
        className={`mentor-voice font-semibold leading-tight ${
          voice ? "mt-1.5 text-[1.9rem]" : "mt-4 text-[2.15rem]"
        }`}
        style={{ color: "var(--accent)" }}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {voice ?? title}
      </motion.h1>
      {subtitle && (
        <motion.p
          className="mt-2 text-ink-soft"
          lang="ja"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          {subtitle}
        </motion.p>
      )}

      <Stagger className={`mt-8 grid w-full gap-3 ${cols}`} delayChildren={0.75} gap={0.1}>
        {stats.map((s, i) => (
          <StaggerItem key={i}>
            <div className="rounded-2xl border hairline bg-paper p-4">
              <div className="flex justify-center text-gold">{s.icon}</div>
              <div className="mt-1">
                {s.countUp && typeof s.value === "number" ? (
                  <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} className="font-display text-xl font-extrabold text-ink" />
                ) : (
                  <p className="font-display text-xl font-extrabold text-ink">
                    {s.prefix}
                    {s.value}
                    {s.suffix}
                  </p>
                )}
                <p className="text-[0.65rem] text-ink-soft">{s.label}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <motion.button
        onClick={onContinue}
        className="mt-8 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        {continueLabel}
      </motion.button>
      {onSecondary && secondaryLabel && (
        <motion.button
          onClick={onSecondary}
          className="mt-3 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
        >
          {secondaryLabel}
        </motion.button>
      )}
    </div>
  );
}
