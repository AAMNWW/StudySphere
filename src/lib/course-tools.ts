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

import type { IconTileColor } from "@/components/icon-tile";
import type { CourseSidebarCounts } from "@/lib/course-sidebar-counts";

/**
 * Every section that lives inside a course, in the order they appear in
 * CourseSidebar. Kept here rather than in the sidebar because two places
 * need the same list: the sidebar itself, and the top-level /tools/[tool]
 * pages that let you reach a section *before* picking a course. Adding a
 * section in one place and forgetting the other is exactly the drift this
 * avoids.
 */
export interface CourseTool {
  label: string;
  /** Path under /courses/[id]; empty string is the course overview. */
  segment: string;
  icon: React.ComponentType<{ className?: string }>;
  color: IconTileColor;
  /** Which CourseSidebar count to show in the sidebar, if any. */
  countKey?: keyof CourseSidebarCounts;
  /** Overview matches its href exactly; everything else matches by prefix. */
  exact?: boolean;
  /**
   * Reachable at /tools/<globalSlug> without a course selected, which then
   * asks which course to open it for. Omitted for sections that only make
   * sense once you're already inside a course (overview, settings).
   */
  globalSlug?: string;
  /** Shown on that /tools page under the heading. */
  description?: string;
  /** Also listed under "Study tools" in the main app sidebar. */
  primary?: boolean;
}

export const COURSE_TOOLS: CourseTool[] = [
  { label: "Overview", segment: "", icon: LayoutDashboard, color: "gray", exact: true },
  {
    label: "Documents",
    segment: "documents",
    icon: FileText,
    color: "blue",
    countKey: "documents",
    globalSlug: "documents",
    description: "Upload course material and search across everything you've added.",
    primary: true,
  },
  {
    label: "Notes",
    segment: "notes",
    icon: StickyNote,
    color: "yellow",
    countKey: "notes",
    globalSlug: "notes",
    description: "Write and revisit your own notes for a course.",
    primary: true,
  },
  {
    label: "Assignments",
    segment: "assignments",
    icon: ListTodo,
    color: "yellow",
    countKey: "assignments",
    globalSlug: "assignments",
    description: "Track what's due and tick things off as you finish them.",
    primary: true,
  },
  {
    label: "Exams",
    segment: "exams",
    icon: GraduationCap,
    color: "red",
    countKey: "exams",
    globalSlug: "exams",
    description: "Keep exam dates in one place and prepare against them.",
    primary: true,
  },
  {
    label: "Quiz",
    segment: "quiz",
    icon: SquareStack,
    color: "purple",
    countKey: "quizzes",
    globalSlug: "quiz",
    description: "Generate a quiz from your course material and test yourself.",
    primary: true,
  },
  {
    label: "Flashcards",
    segment: "flashcards",
    icon: Layers3,
    color: "blue",
    countKey: "flashcardSets",
    globalSlug: "flashcards",
    description: "Build flashcard sets and review them until they stick.",
    primary: true,
  },
  {
    label: "Chat",
    segment: "chat",
    icon: MessageCircle,
    color: "pink",
    countKey: "chatThreads",
    globalSlug: "chat",
    description: "Ask questions about a course and get answers from its material.",
    primary: true,
  },
  {
    label: "Topics",
    segment: "topics",
    icon: CalendarDays,
    color: "green",
    countKey: "topics",
    globalSlug: "topics",
    description: "Break a course into topics and track what you've covered.",
    primary: true,
  },
  {
    label: "Study planner",
    segment: "planner",
    icon: Sparkles,
    color: "gray",
    globalSlug: "planner",
    description: "Turn a course's deadlines into a day-by-day study plan.",
    primary: true,
  },
  {
    label: "History",
    segment: "history",
    icon: History,
    color: "red",
    globalSlug: "history",
    description: "Review every quiz question you've gotten wrong in a course.",
    primary: true,
  },
  {
    label: "Analytics",
    segment: "analytics",
    icon: BarChart3,
    color: "purple",
    globalSlug: "analytics",
    description: "See how your quiz scores and study time in a course are trending.",
    primary: true,
  },
];

export const COURSE_SETTINGS_TOOL: CourseTool = {
  label: "Settings",
  segment: "settings",
  icon: Settings,
  color: "gray",
};

export function courseToolHref(tool: CourseTool, courseId: string): string {
  return tool.segment ? `/courses/${courseId}/${tool.segment}` : `/courses/${courseId}`;
}

/** The tools offered at the top level, in sidebar order. */
export const GLOBAL_TOOLS = COURSE_TOOLS.filter((tool) => tool.globalSlug);

/** The subset listed under "Study tools" in the main app sidebar. */
export const PRIMARY_GLOBAL_TOOLS = GLOBAL_TOOLS.filter((tool) => tool.primary);

export function findGlobalTool(slug: string): CourseTool | undefined {
  return GLOBAL_TOOLS.find((tool) => tool.globalSlug === slug);
}
