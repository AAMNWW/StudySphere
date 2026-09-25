"use client";

import { usePathname } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { CourseProgressBar } from "@/components/course-progress-bar";
import { MobileSectionNav } from "@/components/mobile-section-nav";
import {
  SidebarHeader,
  SidebarLink,
  SidebarSection,
  SidebarShell,
  SidebarSignOut,
} from "@/components/sidebar-nav";
import type { CourseSidebarCounts } from "@/lib/course-sidebar-counts";
import {
  COURSE_SETTINGS_TOOL,
  COURSE_TOOLS,
  courseToolHref,
  type CourseTool,
} from "@/lib/course-tools";

export type { CourseSidebarCounts };

function isActive(pathname: string, item: CourseTool, courseId: string) {
  const href = courseToolHref(item, courseId);
  return item.exact ? pathname === href : pathname.startsWith(href);
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
      {/* `contents`, not a real box: the sticky MobileSectionNav inside can
          only stick within its parent, and this wrapper is short. */}
      <div className="contents md:hidden">
        {/* -mb-3 pulls the nav closer than the layout's gap-6. */}
        <div className="-mb-3">
          <BackLink
            href="/courses"
            className="text-muted-foreground hover:text-foreground py-1 text-xs"
          >
            Back to courses
          </BackLink>
          <p className="mt-1 truncate font-heading font-bold" title={courseTitle}>
            {courseTitle}
          </p>
          <CourseProgressBar completed={progress.completed} total={progress.total} className="mt-3" />
        </div>
        <MobileSectionNav
          title={courseTitle}
          items={allItems.map((item) => ({
            ...item,
            href: courseToolHref(item, courseId),
            active: isActive(pathname, item, courseId),
            count: item.countKey ? counts[item.countKey] : undefined,
          }))}
        />
      </div>

      <SidebarShell label="Course sections">
        <SidebarHeader>
          <BackLink
            href="/courses"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground -ml-1.5 py-1 pr-2 pl-1.5 text-xs"
          >
            Back to courses
          </BackLink>
          <p className="text-sidebar-foreground mt-1 truncate font-heading font-semibold" title={courseTitle}>
            {courseTitle}
          </p>
          <CourseProgressBar
            completed={progress.completed}
            total={progress.total}
            className="mt-3"
          />
        </SidebarHeader>

        <SidebarSection>
          {COURSE_TOOLS.map((item) => (
            <SidebarLink
              key={item.label}
              href={courseToolHref(item, courseId)}
              label={item.label}
              icon={item.icon}
              color={item.color}
              active={isActive(pathname, item, courseId)}
              count={item.countKey ? counts[item.countKey] : undefined}
            />
          ))}
        </SidebarSection>

        <SidebarSection>
          <SidebarLink
            href={courseToolHref(COURSE_SETTINGS_TOOL, courseId)}
            label={COURSE_SETTINGS_TOOL.label}
            icon={COURSE_SETTINGS_TOOL.icon}
            color={COURSE_SETTINGS_TOOL.color}
            active={isActive(pathname, COURSE_SETTINGS_TOOL, courseId)}
          />
          <SidebarSignOut />
        </SidebarSection>
      </SidebarShell>
    </>
  );
}
