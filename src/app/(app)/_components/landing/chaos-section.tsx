"use client";

import { DoodleArrowDown } from "./doodles";
import { Floating, Rise, VerticalMarquee } from "./motion";
import { SectionHeading } from "./ui";

/** The scattered places a semester normally ends up living. Three columns,
 * drifting at different speeds, so the pile never stops moving. */
const COLUMNS: string[][] = [
  [
    "Lecture slides (2).pdf",
    "Notes app",
    "Group chat pins",
    "Untitled doc",
    "Printed handouts",
    "Screenshot 04-11",
  ],
  [
    "Calendar reminder",
    "Sticky note on desk",
    "Downloads folder",
    "Another AI tab",
    "Email from tutor",
    "Whiteboard photo",
  ],
  [
    "Flashcard app trial",
    "Past paper .zip",
    "To-do list app",
    "Shared drive link",
    "Bookmarks bar",
    "Reading list",
  ],
];

export function ChaosSection() {
  return (
    <section
      id="problem"
      className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeading
            align="start"
            eyebrow="Sound familiar?"
            title="Your semester is scattered across nine open tabs."
            description="Notes in one app, deadlines in another, PDFs buried in Downloads, and a separate AI tool for every single thing you want to do with them. Nothing knows about anything else."
          />

          <Rise delay={0.1} className="mt-8 flex items-center gap-3">
            <Floating distance={6} duration={2.8} className="shrink-0">
              <DoodleArrowDown className="text-primary/60 h-14 w-9" />
            </Floating>
            <p className="text-sm font-medium text-balance">
              Academique collapses all of it into one workspace that actually
              knows what you&apos;re studying.
            </p>
          </Rise>
        </div>

        <Rise delay={0.1}>
          <div className="grid grid-cols-3 gap-3">
            <VerticalMarquee items={COLUMNS[0]} speed={28} />
            <VerticalMarquee items={COLUMNS[1]} speed={34} reverse />
            <VerticalMarquee items={COLUMNS[2]} speed={24} />
          </div>
        </Rise>
      </div>
    </section>
  );
}
