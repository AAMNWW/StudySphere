import { AlertTriangle, Bell, Check, ListPlus, Sparkles, CalendarClock } from "lucide-react";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { IconTile } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const ITEMS = [
  { title: "Create assignments", icon: ListPlus, live: true },
  { title: "Due dates", icon: CalendarClock, live: true },
  { title: "Mark complete & auto-flag overdue", icon: Check, live: true },
  { title: "Priority levels", icon: AlertTriangle, live: false },
  { title: "Reminders", icon: Bell, live: false },
  { title: "AI assistance", icon: Sparkles, live: false },
];

export function AssignmentManagementSection() {
  return (
    <section id="assignment-management" className="mx-auto w-full max-w-4xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Assignment & deadline management
        </h2>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2" stagger={0.06}>
        {ITEMS.map(({ title, icon: Icon, live }) => (
          <RevealItem key={title}>
            <div
              className={cn(
                "bg-card flex items-center gap-3 rounded-xl border border-black/5 px-4 py-3 shadow-sm",
                !live && "opacity-70",
              )}
            >
              <IconTile color={live ? "purple" : "gray"} size="sm">
                <Icon className="size-4" />
              </IconTile>
              <span className="text-sm font-medium">{title}</span>
              {!live && <ComingSoonBadge className="ml-auto" />}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
