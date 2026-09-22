"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  LayoutGrid,
  PanelsTopLeft,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { CountUp, Floating, Shine, Stagger, StaggerItem, useStill } from "./motion";

const STATS: {
  prefix?: string;
  value: number;
  label: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  {
    value: 11,
    label: "tools inside every course, from notes to analytics",
    icon: LayoutGrid,
    tint: "bg-purple-200 text-purple-800",
  },
  {
    value: 7,
    label: "career tools for when the coursework is done",
    icon: Briefcase,
    tint: "bg-sky-200 text-sky-800",
  },
  {
    prefix: "$",
    value: 0,
    label: "to start. No card, no trial countdown",
    icon: Wallet,
    tint: "bg-emerald-200 text-emerald-800",
  },
  {
    value: 1,
    label: "tab open instead of the usual ten",
    icon: PanelsTopLeft,
    tint: "bg-amber-200 text-amber-800",
  },
];

export function StatsSection() {
  const reduce = useStill();

  return (
    <section className="bg-foreground text-background relative overflow-hidden">
      <Shine />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:py-14">
        <Stagger
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {STATS.map((stat, index) => (
            <StaggerItem key={stat.label} className="h-full">
              <div className="bg-background/5 h-full rounded-2xl border border-white/10 p-5">
                <Floating delay={index * 0.6} distance={7} duration={5.5}>
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${stat.tint}`}
                  >
                    <stat.icon className="size-5" />
                  </span>
                </Floating>
                <p className="mt-4 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                  {stat.prefix}
                  <CountUp value={stat.value} />
                </p>
                <p className="text-background/60 mt-2 text-sm text-balance">
                  {stat.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <motion.div
        aria-hidden
        className="h-2 bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-[length:200%_100%]"
        animate={
          reduce
            ? undefined
            : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
    </section>
  );
}
