"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AiAssistantSection } from "./ai-assistant-section";
import { AnalyticsSection } from "./analytics-section";
import { AssignmentManagementSection } from "./assignment-management-section";
import { DashboardPreviewSection } from "./dashboard-preview-section";
import { FaqSection } from "./faq-section";
import { FeatureShowcase } from "./feature-showcase";
import { PrivacySection } from "./privacy-section";
import { ProblemSection } from "./problem-section";
import { MotionPop, Reveal, RevealGroup, RevealItem } from "./reveal";
import { StudyToolsSection } from "./study-tools-section";
import { SubjectsFlowSection } from "./subjects-flow-section";
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
        className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-28"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
      >
        <motion.span
          variants={HERO_ITEM}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
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
          Your entire study life, powered by AI.
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
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
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
      </motion.section>

      <ProblemSection />
      <WorkspaceSection />

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

      <AiAssistantSection />
      <StudyToolsSection />
      <DashboardPreviewSection />

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
              <div className="bg-card mx-auto flex size-12 items-center justify-center rounded-full border border-black/5 shadow-sm">
                <Icon className="text-muted-foreground size-5" />
              </div>
              <p className="text-muted-foreground mt-3 text-xs font-medium">
                Step {index + 1}
              </p>
              <p className="mt-1 font-medium">{title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <SubjectsFlowSection />
      <AssignmentManagementSection />
      <AnalyticsSection />

      <WhySection />

      <PrivacySection />
      <FaqSection />

      <section className="px-6 py-16">
        <Reveal className="mx-auto w-full max-w-4xl">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
              <h2 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">
                Stop studying across ten different tools.
              </h2>
              <p className="text-muted-foreground max-w-md text-sm">
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
