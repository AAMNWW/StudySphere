"use client";

import { BookOpen, Calendar, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTileColorClasses } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "gray" as const },
  { label: "Courses", href: "/courses", icon: BookOpen, color: "purple" as const },
  { label: "Calendar", href: "/calendar", icon: Calendar, color: "green" as const },
];

/**
 * Top-level counterpart to CourseSidebar: the same visual shell (bg-sidebar
 * card, icon-tile nav rows, active-link highlighting) one level up, for the
 * Dashboard and Courses pages that sit outside any single course.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="bg-sidebar border-sidebar-border flex shrink-0 flex-col gap-1 rounded-2xl border p-3 md:w-56"
    >
      <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-lg",
                  getTileColorClasses(item.color),
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
