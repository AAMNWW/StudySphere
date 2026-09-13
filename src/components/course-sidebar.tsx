"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { CourseProgressBar } from "@/components/course-progress-bar";
import { getTileColorClasses } from "@/components/icon-tile";
import { MobileSectionNav } from "@/components/mobile-section-nav";
import type { CourseSidebarCounts } from "@/lib/course-sidebar-counts";
import {
  COURSE_SETTINGS_TOOL,
  COURSE_TOOLS,
  courseToolHref,
  type CourseTool,
} from "@/lib/course-tools";
import { cn } from "@/lib/utils";

export type { CourseSidebarCounts };

function isActive(pathname: string, item: CourseTool, courseId: string) {
  const href = courseToolHref(item, courseId);
  return item.exact ? pathname === href : pathname.startsWith(href);
}

function NavLink({
  item,
  courseId,
  active,
  count,
}: {
  item: CourseTool;
  courseId: string;
  active: boolean;
  count?: number;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={courseToolHref(item, courseId)}
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
 * instead of a trip back to the course root. Vertical list on md+; below
 * that it collapses into a horizontally-scrolling tab strip
 * (MobileSectionNav) instead.
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
  const allItems = [...COURSE_TOOLS, COURSE_SETTINGS_TOOL];

  return (
    <>
      <div className="md:hidden">
        <BackLink
          href="/courses"
          className="text-muted-foreground hover:text-foreground py-1 text-xs"
        >
          Back to courses
        </BackLink>
        <p className="mt-1 truncate font-heading font-bold" title={courseTitle}>
          {courseTitle}
        </p>
        <CourseProgressBar completed={progress.completed} total={progress.total} className="mt-3 mb-3" />
        <MobileSectionNav
          items={allItems.map((item) => ({
            ...item,
            href: courseToolHref(item, courseId),
            active: isActive(pathname, item, courseId),
            count: item.countKey ? counts[item.countKey] : undefined,
          }))}
        />
      </div>

      <nav
        aria-label="Course sections"
        className="bg-sidebar border-sidebar-border hidden shrink-0 flex-col gap-1 rounded-2xl border p-3 md:flex md:w-56"
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

        <div className="flex flex-col gap-1">
          {COURSE_TOOLS.map((item) => (
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
            item={COURSE_SETTINGS_TOOL}
            courseId={courseId}
            active={isActive(pathname, COURSE_SETTINGS_TOOL, courseId)}
          />
        </div>
      </nav>
    </>
  );
}
