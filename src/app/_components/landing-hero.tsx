"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { DoodleUnderline } from "./doodle-accents";
import { FaqSection } from "./faq-section";
import { FeatureShowcase } from "./feature-showcase";
import { PrivacySection } from "./privacy-section";
import { ProblemSection } from "./problem-section";
import { RealStudentsSection } from "./real-students-section";
import { MotionPop, Reveal, RevealGroup, RevealItem } from "./reveal";
import { StudyToolsSection } from "./study-tools-section";
import { TrustStatsSection } from "./trust-stats-section";
import { WhySection } from "./why-section";
import { WorkspaceSection } from "./workspace-section";

const STEPS = [
  {
    title: "Create a course",
    description: "Add a subject you're studying with a title and short description.",
    icon: BookOpen,
  },
  {
    title: "Add your material",
    description: "Upload documents, write notes and track assignments as you go.",
    icon: UploadCloud,
  },
  {
    title: "Let AI help",
    description: "Summarize a document instantly whenever you need the key points fast.",
    icon: Sparkles,
  },
];

const HERO_ITEM = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function LandingHero() {
  return (
    <main>
      <motion.section
        className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
      >
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            variants={HERO_ITEM}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-secondary text-secondary-foreground mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
            >
              <Sparkles className="size-3.5" />
            </motion.span>
            AI-powered study workspace
          </motion.span>
          <motion.h1
            variants={HERO_ITEM}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            Your entire study life,{" "}
            <span className="relative inline-block">
              <span className="text-primary">powered by AI.</span>
              <DoodleUnderline className="text-primary/50 absolute inset-x-0 -bottom-2 h-3 w-full" />
            </span>
          </motion.h1>
          <motion.p
            variants={HERO_ITEM}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-muted-foreground mt-5 max-w-xl text-balance sm:text-lg"
          >
            Keep notes, assignments and course documents in one place — and get
            instant AI summaries whenever you upload something new.
          </motion.p>
          <motion.div
            variants={HERO_ITEM}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <MotionPop>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/signup">Get started free</Link>}
              />
            </MotionPop>
            <MotionPop>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="#how-it-works">See how it works</Link>}
              />
            </MotionPop>
          </motion.div>
          <motion.p
            id="pricing"
            variants={HERO_ITEM}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-muted-foreground mt-4 text-xs"
          >
            Free to use. No credit card required.
          </motion.p>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.92, y: 24 },
            visible: { opacity: 1, scale: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-4xl shadow-lg">
            <Image
              src="/photos/study-friends.jpg"
              alt="Three students smiling together on campus, carrying backpacks and notebooks"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              className="object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 16 }}
            className="bg-card absolute -bottom-5 -left-5 flex items-center gap-2.5 rounded-2xl border border-black/5 px-4 py-3 shadow-md"
          >
            <Logo className="h-8 w-auto" paper="var(--card)" />
            <div className="leading-tight">
              <p className="text-sm font-bold">Academique</p>
              <p className="text-muted-foreground text-xs">Study smarter, together</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <ProblemSection />
      <TrustStatsSection />
      <WorkspaceSection />
      <RealStudentsSection />

      <section
        id="features"
        aria-labelledby="features-heading"
        className="mx-auto w-full max-w-5xl px-6 py-16"
      >
        <Reveal className="text-center">
          <h2
            id="features-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Everything your study workflow needs
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <FeatureShowcase />
        </Reveal>
      </section>

      <StudyToolsSection />

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="mx-auto w-full max-w-4xl px-6 py-16"
      >
        <Reveal className="text-center">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            How it works
          </h2>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3" stagger={0.15}>
          {STEPS.map(({ title, description, icon: Icon }, index) => (
            <RevealItem key={title} className="text-center">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="bg-card mx-auto flex size-12 items-center justify-center rounded-full border border-black/5 shadow-sm"
              >
                <Icon className="text-muted-foreground size-5" />
              </motion.div>
              <p className="text-muted-foreground mt-3 text-xs font-medium">
                Step {index + 1}
              </p>
              <p className="mt-1 font-medium">{title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <WhySection />

      <PrivacySection />
      <FaqSection />

      <section className="px-6 py-16">
        <Reveal className="mx-auto w-full max-w-4xl">
          <Card className="bg-secondary border-transparent">
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <motion.div
                initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
              >
                <Logo className="h-20 w-auto" paper="var(--secondary)" />
              </motion.div>
              <h2 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">
                Stop studying across ten different tools.
              </h2>
              <p className="text-secondary-foreground/70 max-w-md text-sm">
                Bring your entire study life into one workspace — free to
                start, in under a minute.
              </p>
              <MotionPop>
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/signup">Get started free</Link>}
                />
              </MotionPop>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </main>
  );
}
