import { BarChart3, Clock4, LineChart, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";

import { MotionPop, Reveal, RevealGroup, RevealItem } from "./reveal";

const METRICS = [
  { label: "Study time per course", icon: Clock4 },
  { label: "Accuracy by difficulty", icon: BarChart3 },
  { label: "Assignment completion rate", icon: Target },
  { label: "Weakest topics", icon: TrendingUp },
  { label: "Accuracy over time", icon: LineChart },
];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="mx-auto w-full max-w-4xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Study analytics
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
          Every course has its own analytics page, built from your actual quiz
          answers and study sessions.
        </p>
      </Reveal>

      <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={0.06}>
        {METRICS.map(({ label, icon: Icon }) => (
          <RevealItem key={label}>
            <div className="bg-card flex items-center gap-3 rounded-xl border border-black/5 px-4 py-3 shadow-sm">
              <IconTile color="purple" size="sm">
                <Icon className="size-4" />
              </IconTile>
              <span className="text-sm font-medium">{label}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.1} className="mt-6 text-center">
        <MotionPop>
          <Button nativeButton={false} render={<Link href="/signup">See it on your courses</Link>} />
        </MotionPop>
      </Reveal>
    </section>
  );
}
