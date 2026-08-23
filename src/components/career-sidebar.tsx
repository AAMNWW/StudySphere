"use client";

import { Briefcase, FileText, LayoutDashboard, Mic, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { getTileColorClasses, type IconTileColor } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

export interface CareerSidebarCounts {
  resumes: number;
  jobApplications: number;
  careerChatThreads: number;
  interviewSessions: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: IconTileColor;
  countKey?: keyof CareerSidebarCounts;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/career", icon: LayoutDashboard, color: "gray", exact: true },
  { label: "Resumes", href: "/career/resumes", icon: FileText, color: "blue", countKey: "resumes" },
  {
    label: "Job Tracker",
    href: "/career/jobs",
    icon: Briefcase,
    color: "purple",
    countKey: "jobApplications",
  },
  {
    label: "Chat",
    href: "/career/chat",
    icon: MessageCircle,
    color: "pink",
    countKey: "careerChatThreads",
  },
  {
    label: "Mock Interviews",
    href: "/career/interviews",
    icon: Mic,
    color: "red",
    countKey: "interviewSessions",
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/**
 * Same shell as CourseSidebar (bg-sidebar card, icon-tile nav rows,
 * "Back to..." link at top) for everything under /career — a section
 * outside any course, so it replaces AppSidebar rather than nesting under
 * it, matching how CourseSidebar does for /courses/[id].
 */
export function CareerSidebar({ counts }: { counts: CareerSidebarCounts }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Career sections"
      className="bg-sidebar border-sidebar-border flex shrink-0 flex-col gap-1 rounded-2xl border p-3 md:w-56"
    >
      <div className="px-1 pt-1 pb-3">
        <BackLink
          href="/"
          className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground -ml-1.5 py-1 pr-2 pl-1.5 text-xs"
        >
          Back to dashboard
        </BackLink>
        <p className="text-sidebar-foreground mt-1 font-heading font-bold">Career</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          const count = item.countKey ? counts[item.countKey] : undefined;

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
              {count !== undefined && count > 0 ? (
                <span className="text-sidebar-foreground/50 ml-auto text-xs tabular-nums">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
