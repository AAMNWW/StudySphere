"use client";

import { motion } from "framer-motion";
import { Clock3, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MotionPop, Reveal, RevealGroup, RevealItem } from "./reveal";

const VALUES = [
  {
    title: "Everything in one place",
    description: "Courses, notes, assignments and documents — no more juggling five different apps.",
    icon: Layers,
  },
  {
    title: "AI when you need it",
    description: "Generate a plain-language summary of any uploaded document in a couple of clicks.",
    icon: Sparkles,
  },
  {
    title: "Nothing falls through the cracks",
    description: "Overdue assignments are flagged automatically, right on your dashboard.",
    icon: Clock3,
  },
];

export function WhySection() {
  return (
    <section className="bg-foreground text-background overflow-hidden">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:py-24">
        <Reveal>
          <p className="text-background/50 text-xs font-medium tracking-wide uppercase">
            Why it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Built to keep your coursework <em>organized</em>.
          </h2>
          <div className="mt-6">
            <MotionPop>
              <Button
                variant="secondary"
                nativeButton={false}
                render={<Link href="/signup">Start for free</Link>}
              />
            </MotionPop>
          </div>
        </Reveal>

        <RevealGroup className="space-y-6" stagger={0.12}>
          {VALUES.map(({ title, description, icon: Icon }, index) => (
            <RevealItem key={title}>
              {index > 0 ? <div className="bg-background/10 mb-6 h-px" /> : null}
              <div className="flex items-start gap-3">
                <Icon className="text-background/60 mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-background/60 mt-1 text-sm">{description}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <motion.div
        aria-hidden
        className="h-2 bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-[length:200%_100%]"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </section>
  );
}
