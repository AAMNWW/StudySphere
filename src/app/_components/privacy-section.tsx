import { Lock, Server, Sparkles, UserCheck } from "lucide-react";

import { IconTile } from "@/components/icon-tile";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const POINTS = [
  {
    title: "Scoped to your account",
    description:
      "Every course, note, assignment, document, chat conversation, quiz and flashcard set you create is tied to your account and isn't visible to anyone else.",
    icon: UserCheck,
  },
  {
    title: "Uploads stay on the server",
    description:
      "Files you upload are stored on the server and aren't shared with any third party by default.",
    icon: Server,
  },
  {
    title: "AI only sees what you ask it to",
    description:
      "A document's content is sent to Google's Gemini API only when you use an AI feature on it — summarizing, chatting, or generating a quiz or flashcards. Nothing is sent automatically on upload, and questions you ask the AI tutor are sent without any document attached.",
    icon: Sparkles,
  },
  {
    title: "Still early",
    description:
      "There's no self-serve data export or account deletion yet, and no encryption-at-rest or compliance certification to point to. If you need either, reach out.",
    icon: Lock,
  },
];

export function PrivacySection() {
  return (
    <section id="privacy" className="mx-auto w-full max-w-4xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your data
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
          Straightforward, and no bigger claims than we can back up.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.08}>
        {POINTS.map(({ title, description, icon: Icon }) => (
          <RevealItem key={title}>
            <div className="bg-card h-full rounded-2xl border border-black/5 p-5 shadow-sm">
              <IconTile color="blue" size="sm">
                <Icon className="size-4" />
              </IconTile>
              <p className="mt-3 font-medium">{title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
