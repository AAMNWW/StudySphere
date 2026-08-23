"use client";

import {
  BookOpen,
  Briefcase,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTileColorClasses } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "gray" as const },
  { label: "Courses", href: "/courses", icon: BookOpen, color: "purple" as const },
  { label: "Calendar", href: "/calendar", icon: Calendar, color: "green" as const },
  { label: "Grades", href: "/grades", icon: GraduationCap, color: "blue" as const },
  { label: "Career", href: "/career", icon: Briefcase, color: "yellow" as const },
];

const SETTINGS_ITEM = { label: "Settings", href: "/settings", icon: Settings, color: "gray" as const };
const ADMIN_ITEM = { label: "Admin", href: "/admin", icon: ShieldCheck, color: "red" as const };

/**
 * Top-level counterpart to CourseSidebar: the same visual shell (bg-sidebar
 * card, icon-tile nav rows, active-link highlighting) one level up, for the
 * Dashboard, Courses, Calendar, and Settings pages that sit outside any
 * single course. `isAdmin` is passed down from whichever page renders this
 * (each already calls `auth()`) rather than fetched here — this component
 * itself has no session access, and the Admin item's visibility is only a
 * UX nicety anyway; the real gate is requireAdmin() on /admin itself.
 */
export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  function renderItem(item: { label: string; href: string; icon: typeof LayoutDashboard; color: "gray" | "purple" | "green" | "blue" | "yellow" | "red" }) {
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
  }

  return (
    <nav
      aria-label="Main"
      className="bg-sidebar border-sidebar-border flex shrink-0 flex-col gap-1 rounded-2xl border p-3 md:w-56"
    >
      <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV_ITEMS.map(renderItem)}
      </div>

      <div className="mt-2 flex gap-1 border-t pt-2 md:flex-col">
        {renderItem(SETTINGS_ITEM)}
        {isAdmin ? renderItem(ADMIN_ITEM) : null}
      </div>
    </nav>
  );
}
