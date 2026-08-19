import { BarChart3, Clock4, LineChart, Target, TrendingUp } from "lucide-react";

import { ComingSoonBadge } from "@/components/coming-soon-badge";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const METRICS = [
  { label: "Study time", icon: Clock4 },
  { label: "Subject performance", icon: BarChart3 },
  { label: "Completion rate", icon: Target },
  { label: "Weak areas", icon: TrendingUp },
  { label: "Progress over time", icon: LineChart },
];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="mx-auto w-full max-w-4xl px-6 py-16">
      <Reveal className="text-center">
        <ComingSoonBadge className="mb-3" />
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Study analytics
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
          We&apos;re building analytics next, so you can see how your studying is
          actually going.
        </p>
      </Reveal>

      <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={0.06}>
        {METRICS.map(({ label, icon: Icon }) => (
          <RevealItem key={label}>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-black/10 px-4 py-3 opacity-70">
              <Icon className="text-muted-foreground size-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
