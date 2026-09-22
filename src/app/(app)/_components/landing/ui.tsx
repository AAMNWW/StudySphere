"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Rise, useStill } from "./motion";

/** The landing page's own call-to-action button.
 *
 * The app's `Button` is sized for dense product UI (32–40px tall, small
 * radius). Marketing CTAs need more presence and need to match the rounded,
 * pill-and-card language the rest of this page uses, so they get their own
 * component rather than a pile of overrides at each call site. */
const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
  secondary:
    "bg-card text-foreground border border-black/10 hover:bg-muted dark:border-white/15",
  inverse:
    "bg-background text-foreground shadow-sm hover:bg-background/90",
} as const;

const SIZES = {
  md: "h-10 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-7 text-[0.95rem]",
} as const;

export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "lg",
  arrow = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  arrow?: boolean;
  className?: string;
}) {
  const still = useStill();

  return (
    <motion.span
      className="inline-block"
      whileHover={still ? undefined : { y: -2 }}
      whileTap={still ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        href={href}
        className={cn(
          "focus-visible:ring-ring inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3",
          SIZES[size],
          VARIANTS[variant],
          className,
        )}
      >
        {children}
        {arrow ? <ArrowRight className="size-4" /> : null}
      </Link>
    </motion.span>
  );
}

/** Every section header on the page, so the eyebrow size, heading size and
 * the gaps between them are decided in one place instead of drifting section
 * by section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <Rise
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]"
      >
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 text-balance">{description}</p>
      ) : null}
    </Rise>
  );
}
