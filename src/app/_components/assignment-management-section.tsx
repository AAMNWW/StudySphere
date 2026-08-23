import { AlertTriangle, Bell, Check, ListPlus, Sparkles, CalendarClock } from "lucide-react";

import { IconTile } from "@/components/icon-tile";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const ITEMS = [
  { title: "Create assignments", icon: ListPlus },
  { title: "Due dates", icon: CalendarClock },
  { title: "Mark complete & auto-flag overdue", icon: Check },
  { title: "Priority levels", icon: AlertTriangle },
  { title: "Email & in-app reminders", icon: Bell },
  { title: "AI assistance to get started", icon: Sparkles },
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
        {ITEMS.map(({ title, icon: Icon }) => (
          <RevealItem key={title}>
            <div className="bg-card flex items-center gap-3 rounded-xl border border-black/5 px-4 py-3 shadow-sm">
              <IconTile color="purple" size="sm">
                <Icon className="size-4" />
              </IconTile>
              <span className="text-sm font-medium">{title}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
