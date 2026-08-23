import {
  Calendar,
  ListChecks,
  Layers3,
  MessageCircle,
  Sparkles,
  SquareStack,
} from "lucide-react";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { IconTile, type IconTileColor } from "@/components/icon-tile";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const TOOLS: {
  title: string;
  description: string;
  icon: typeof Sparkles;
  color: IconTileColor;
  live: boolean;
}[] = [
  {
    title: "AI Summarizer",
    description: "Instant plain-language summaries of uploaded documents.",
    icon: Sparkles,
    color: "pink",
    live: true,
  },
  {
    title: "Assignment tracking",
    description: "Due dates, completion, and automatic overdue flags.",
    icon: ListChecks,
    color: "purple",
    live: true,
  },
  {
    title: "AI Chat",
    description: "Ask questions and get answers grounded in your own documents, or ask an AI tutor general study questions.",
    icon: MessageCircle,
    color: "blue",
    live: true,
  },
  {
    title: "Quiz Generator",
    description: "Turn a document into a multiple-choice practice quiz.",
    icon: SquareStack,
    color: "green",
    live: true,
  },
  {
    title: "Flashcards",
    description: "Auto-generated flashcards from your uploaded documents.",
    icon: Layers3,
    color: "yellow",
    live: true,
  },
  {
    title: "Study Planner",
    description: "A suggested schedule built around your deadlines.",
    icon: Calendar,
    color: "gray",
    live: true,
  },
];

export function StudyToolsSection() {
  return (
    <section id="tools" className="mx-auto w-full max-w-5xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Smart study tools
        </h2>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {TOOLS.map(({ title, description, icon: Icon, color, live }) => (
          <RevealItem key={title}>
            <Card className={cn("h-full", !live && "opacity-70")}>
              <CardContent className="flex items-start gap-4">
                <IconTile color={color}>
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
    </section>
  );
}
