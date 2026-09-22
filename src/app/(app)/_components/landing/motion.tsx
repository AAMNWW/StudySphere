"use client";

/** Motion primitives shared by the landing page.
 *
 * The landing page's whole visual idea is vertical: everything enters by
 * travelling up the page, and several elements keep moving as you scroll.
 * These helpers keep that consistent (one easing curve, one travel distance,
 * one viewport trigger) instead of every section hand-rolling `whileInView`.
 *
 * Every helper can collapse to a static, instant render — see
 * `HONOUR_REDUCED_MOTION` below for when that happens. */

import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Soft "settle" curve — quick start, long glide in. Used page-wide. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Whether the landing page's motion bows to the operating system's
 * "reduce motion" setting.
 *
 * Deliberately `false`. On Windows, turning off Settings → Accessibility →
 * Visual effects → "Animation effects" (and the macOS "Reduce motion"
 * equivalent) makes the browser report `prefers-reduced-motion: reduce`,
 * which silently froze *every* animation on this page — the marquees, the
 * bobbing cards, the writing skeleton lines, all of it — with no other
 * symptom. The motion here is the product, so it plays for everyone.
 *
 * Flip this to `true` to honour the OS setting again; every landing
 * component reads it through `useStill()` and nothing else, so that one
 * change puts the whole page back to respecting it.
 */
const HONOUR_REDUCED_MOTION = false;

/** True when this page should render completely still. */
export function useStill() {
  const prefersReduced = useReducedMotion();
  return HONOUR_REDUCED_MOTION ? prefersReduced === true : false;
}

/** Fires a little before an element is fully on screen, so a section is
 * already animating by the time the reader's eye reaches it. */
const VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" } as const;

/** A block that rises into place when scrolled to. */
export function Rise({
  children,
  className,
  delay = 0,
  distance = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduce = useStill();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

/** Parent for a list whose children rise one after another. Pair with
 * `<StaggerItem>` for each child. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduce = useStill();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useStill();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={ITEM_VARIANTS}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Drifts its children vertically against the scroll direction. `distance`
 * is the total travel in px across the element's full pass through the
 * viewport; a negative value drifts the other way. */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useStill();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Springing the progress (rather than reading raw scroll) keeps the drift
  // from stuttering on trackpads with coarse scroll deltas.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const y = useTransform(smooth, [0, 1], [distance / 2, -distance / 2]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  duration = 1.6,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useStill();
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => Math.round(latest).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [count, duration, inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
    </span>
  );
}

/** Cycled across marquee pills so the scattered pile reads as colorful
 * rather than grey. */
const MARQUEE_DOTS = [
  "bg-purple-300",
  "bg-amber-300",
  "bg-emerald-300",
  "bg-sky-300",
  "bg-pink-300",
];

/** An endlessly scrolling column of pills. The list is rendered twice and
 * translated by exactly half its height, so the seam never lands on screen. */
export function VerticalMarquee({
  items,
  speed = 26,
  reverse = false,
  className,
}: {
  items: string[];
  /** Seconds for one full loop — higher is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduce = useStill();
  const doubled = [...items, ...items];

  return (
    <div
      aria-hidden
      className={cn(
        "relative h-72 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] sm:h-80",
        className,
      )}
    >
      <motion.ul
        className="flex flex-col gap-3"
        animate={
          reduce ? undefined : { y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
        }
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="bg-card text-muted-foreground flex items-center gap-2 rounded-xl border border-black/5 px-3 py-2.5 text-xs font-medium whitespace-nowrap shadow-sm dark:border-white/10"
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                MARQUEE_DOTS[index % MARQUEE_DOTS.length],
              )}
            />
            <span className="truncate">{item}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

/** An endlessly scrolling row. Same doubling trick as `VerticalMarquee`,
 * turned on its side — the page keeps moving horizontally as well as down. */
export function HorizontalMarquee({
  children,
  speed = 38,
  reverse = false,
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full loop — higher is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduce = useStill();

  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <motion.div
        className="flex w-max gap-3"
        animate={
          reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
        }
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {/* Only the first copy is exposed to assistive tech — the second
            exists purely to make the loop seamless. */}
        <div className="flex shrink-0 gap-3">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-3">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Never stops: a slow bob that keeps an element alive on the page. Give
 * neighbouring elements different `delay`s so they drift out of sync. */
export function Floating({
  children,
  className,
  distance = 10,
  duration = 5,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const reduce = useStill();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/** A skeleton line that writes itself, clears, and writes itself again —
 * what the mock cards use instead of dead grey bars. Animates `scaleX`
 * rather than `width` so it never touches layout. */
export function WritingBar({
  className,
  delay = 0,
  duration = 2.6,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduce = useStill();

  return (
    <div className={cn("bg-muted h-2 overflow-hidden rounded-full", className)}>
      <motion.div
        className="bg-foreground/20 h-full w-full origin-left rounded-full"
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={reduce ? undefined : { scaleX: [0, 1, 1, 0] }}
        transition={{
          duration,
          times: [0, 0.45, 0.85, 1],
          repeat: Infinity,
          repeatDelay: 0.6,
          delay,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/** A dot that breathes forever. */
export function PulseDot({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduce = useStill();

  return (
    <motion.span
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      animate={reduce ? undefined : { scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/** The three-dot "…is typing" bounce. */
export function TypingDots({ className }: { className?: string }) {
  const reduce = useStill();

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="bg-foreground/35 size-1.5 rounded-full"
          animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.15,
          }}
        />
      ))}
    </span>
  );
}

/** A band of light that sweeps across its parent on a loop. Put it inside a
 * `relative overflow-hidden` element. */
export function Shine({ className }: { className?: string }) {
  const reduce = useStill();

  if (reduce) return null;

  return (
    <motion.span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent",
        className,
      )}
      animate={{ x: ["-120%", "420%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
    />
  );
}

/** A soft ring that expands out of an element and fades, forever. */
export function PulseRing({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduce = useStill();

  if (reduce) return null;

  return (
    <motion.span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 rounded-2xl", className)}
      animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay }}
    />
  );
}

/** Swaps one word for the next, each sliding up through a one-line mask. */
export function WordRotator({
  words,
  interval = 2200,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useStill();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval, reduce, words.length]);

  if (reduce) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* An invisible copy of the longest word holds the box open, so the
          surrounding sentence never reflows as the words swap. */}
      <span
        aria-hidden
        className={cn("invisible col-start-1 row-start-1", className)}
      >
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      {/* Default (sync) mode on purpose: the outgoing and incoming words
          share one grid cell, so one rolls up and out while the next rolls
          up into place. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          className={cn("col-start-1 row-start-1 text-left", className)}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
