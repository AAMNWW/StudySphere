import {
  ArrowRight,
  FileQuestion,
  Layers3,
  MessageCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { MotionPop, Reveal, RevealGroup, RevealItem } from "./reveal";

const CAPABILITIES = [
  {
    title: "Summarize documents",
    description: "Get a plain-language summary of any uploaded PDF, Word doc or slide deck.",
    icon: Sparkles,
    live: true,
  },
  {
    title: "Chat with your documents",
    description: "Ask follow-up questions and get answers grounded in what you uploaded.",
    icon: MessageCircle,
    live: true,
  },
  {
    title: "AI tutor",
    description: "Ask general study questions about a course and get a plain-language explanation.",
    icon: FileQuestion,
    live: true,
  },
  {
    title: "Generate quizzes & flashcards",
    description: "Turn any document into practice questions and flashcards automatically.",
    icon: Layers3,
    live: true,
  },
];

const WORKFLOW = [
  { label: "Upload", description: "PDF, Word or slides", live: true },
  { label: "AI processes it", description: "Gemini reads the content", live: true },
  { label: "Ask questions", description: "Chat with the material", live: true },
  { label: "Study material", description: "Quizzes & flashcards", live: true },
  { label: "Track progress", description: "See what you've covered", live: false },
];

export function AiAssistantSection() {
  return (
    <section id="ai-assistant" className="mx-auto w-full max-w-5xl px-6 py-16">
      <Reveal className="text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
          <Sparkles className="size-3.5" />
          AI Study Assistant
        </span>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your study material, understood
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm">
          Upload what you&apos;re studying and let AI do the first pass —
          summarize it, chat with it, or turn it into a quiz or a set of
          flashcards.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.08}>
        {CAPABILITIES.map(({ title, description, icon: Icon, live }) => (
          <RevealItem key={title}>
            <Card className={cn("h-full", !live && "opacity-70")}>
              <CardContent className="flex items-start gap-4">
                <IconTile color={live ? "pink" : "gray"}>
                  <Icon className="size-5" />
                </IconTile>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{title}</p>
                    {!live && <ComingSoonBadge />}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.1} className="mt-6 text-center">
        <MotionPop>
          <Button nativeButton={false} render={<Link href="/signup">Try it on your documents</Link>} />
        </MotionPop>
      </Reveal>

      <Reveal delay={0.1} className="mt-16">
        <h3 className="text-center text-lg font-bold tracking-tight">
          Upload → Understand → Study
        </h3>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {WORKFLOW.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex w-32 flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center",
                  step.live
                    ? "border-black/5 bg-card shadow-sm"
                    : "border-dashed border-black/10 bg-transparent",
                )}
              >
                <IconTile color={step.live ? "purple" : "gray"} size="sm">
                  {index === 0 ? <Upload className="size-4" /> : <Sparkles className="size-4" />}
                </IconTile>
                <p className="text-xs font-medium">{step.label}</p>
                <p className="text-muted-foreground text-[0.7rem]">{step.description}</p>
                {!step.live && <ComingSoonBadge />}
              </div>
              {index < WORKFLOW.length - 1 && (
                <ArrowRight className="text-muted-foreground/40 size-4 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
