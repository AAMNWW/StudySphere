import { Check, Clock, FileText, Flame, TrendingUp } from "lucide-react";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { IconTile } from "@/components/icon-tile";

import { Reveal } from "./reveal";

export function DashboardPreviewSection() {
  return (
    <section id="dashboard-preview" className="mx-auto w-full max-w-5xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          A dashboard that keeps you on track
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
          Everything due soon and everything you&apos;ve uploaded recently, in one
          view.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="bg-card rounded-3xl border border-black/5 p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Clock className="text-muted-foreground size-4" />
                Due soon
              </p>
              <ul className="space-y-2">
                {[
                  { title: "Problem set 6", due: "Tomorrow" },
                  { title: "Reading response", due: "Fri" },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Check className="size-3.5 text-emerald-600" />
                      {item.title}
                    </span>
                    <span className="text-muted-foreground text-xs">{item.due}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                <FileText className="text-muted-foreground size-4" />
                Recent documents
              </p>
              <ul className="space-y-2">
                {["Lecture-12-slides.pdf", "Chapter-4-notes.docx"].map((name) => (
                  <li
                    key={name}
                    className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 p-4">
              <IconTile color="yellow">
                <Flame className="size-5" />
              </IconTile>
              <div>
                <p className="text-sm font-medium">Study streak</p>
                <p className="text-muted-foreground text-xs">Grows every day you visit</p>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 p-6 text-center">
              <IconTile color="gray">
                <TrendingUp className="size-5" />
              </IconTile>
              <p className="text-sm font-medium">Subject progress</p>
              <ComingSoonBadge />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
