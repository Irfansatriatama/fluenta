"use client";

/**
 * Small, reusable motion primitives for the whole app. Every language module
 * inherits these — keep them calm and consistent. All respect reduced motion.
 */
import { animate, motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Fade + rise in on mount.
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Orchestrated list entrance — pair with StaggerItem.
export function Stagger({
  children,
  className,
  gap = 0.07,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delayChildren?: number;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    show: { transition: { staggerChildren: reduce ? 0 : gap, delayChildren: reduce ? 0 : delayChildren } },
  };
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={variants}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 16 }: { children: ReactNode; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

// Count a number up to its target once on mount.
export function CountUp({
  to,
  className,
  duration = 0.9,
  prefix = "",
  suffix = "",
}: {
  to: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, duration, reduce]);
  return (
    <span className={className}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
