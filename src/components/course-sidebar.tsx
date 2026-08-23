"use client";

import {
  BarChart3,
  CalendarDays,
  FileText,
  GraduationCap,
  History,
  Layers3,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Settings,
  Sparkles,
  SquareStack,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { CourseProgressBar } from "@/components/course-progress-bar";
import { getTileColorClasses, type IconTileColor } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

export interface CourseSidebarCounts {
  documents: number;
  notes: number;
  assignments: number;
  exams: number;
  quizzes: number;
  flashcardSets: number;
  chatThreads: number;
  topics: number;
}

interface NavItem {
  label: string;
  href: (courseId: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  color: IconTileColor;
  countKey?: keyof CourseSidebarCounts;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: (id) => `/courses/${id}`, icon: LayoutDashboard, color: "gray", exact: true },
  { label: "Documents", href: (id) => `/courses/${id}/documents`, icon: FileText, color: "blue", countKey: "documents" },
  { label: "Notes", href: (id) => `/courses/${id}/notes`, icon: StickyNote, color: "yellow", countKey: "notes" },
  { label: "Assignments", href: (id) => `/courses/${id}/assignments`, icon: ListTodo, color: "yellow", countKey: "assignments" },
  { label: "Exams", href: (id) => `/courses/${id}/exams`, icon: GraduationCap, color: "red", countKey: "exams" },
  { label: "Quiz", href: (id) => `/courses/${id}/quiz`, icon: SquareStack, color: "purple", countKey: "quizzes" },
  { label: "Flashcards", href: (id) => `/courses/${id}/flashcards`, icon: Layers3, color: "blue", countKey: "flashcardSets" },
  { label: "Chat", href: (id) => `/courses/${id}/chat`, icon: MessageCircle, color: "pink", countKey: "chatThreads" },
  { label: "Topics", href: (id) => `/courses/${id}/topics`, icon: CalendarDays, color: "green", countKey: "topics" },
  { label: "Study planner", href: (id) => `/courses/${id}/planner`, icon: Sparkles, color: "gray" },
  { label: "History", href: (id) => `/courses/${id}/history`, icon: History, color: "red" },
  { label: "Analytics", href: (id) => `/courses/${id}/analytics`, icon: BarChart3, color: "purple" },
];

const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: (id) => `/courses/${id}/settings`,
  icon: Settings,
  color: "gray",
};

function isActive(pathname: string, item: NavItem, courseId: string) {
  const href = item.href(courseId);
  return item.exact ? pathname === href : pathname.startsWith(href);
}

function NavLink({
  item,
  courseId,
  active,
  count,
}: {
  item: NavItem;
  courseId: string;
  active: boolean;
  count?: number;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href(courseId)}
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
        <span className="text-sidebar-foreground/50 ml-auto text-xs tabular-nums">{count}</span>
      ) : null}
    </Link>
  );
}

/**
 * Persistent left nav for everything inside one course, so switching
 * features (Quiz, Flashcards, Chat, ...) is a single click from anywhere
 * instead of a trip back to the course root. Vertical list on md+, a
 * horizontally scrollable pill row on narrow screens (same shell, same
 * links — just a different flex direction).
 */
export function CourseSidebar({
  courseId,
  courseTitle,
  counts,
  progress,
}: {
  courseId: string;
  courseTitle: string;
  counts: CourseSidebarCounts;
  progress: { completed: number; total: number };
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Course sections"
      className="bg-sidebar border-sidebar-border flex shrink-0 flex-col gap-1 rounded-2xl border p-3 md:w-56"
    >
      <div className="px-1 pt-1 pb-3">
        <BackLink
          href="/courses"
          className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground -ml-1.5 py-1 pr-2 pl-1.5 text-xs"
        >
          Back to courses
        </BackLink>
        <p className="text-sidebar-foreground mt-1 truncate font-heading font-bold" title={courseTitle}>
          {courseTitle}
        </p>
        <CourseProgressBar
          completed={progress.completed}
          total={progress.total}
          className="mt-3"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            courseId={courseId}
            active={isActive(pathname, item, courseId)}
            count={item.countKey ? counts[item.countKey] : undefined}
          />
        ))}
      </div>

      <div className="mt-2 border-t pt-2">
        <NavLink
          item={SETTINGS_ITEM}
          courseId={courseId}
          active={isActive(pathname, SETTINGS_ITEM, courseId)}
        />
      </div>
    </nav>
  );
}
