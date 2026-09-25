"use client";

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  Mic,
  MessageCircle,
  Target,
  Wand2,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { BackLink } from "@/components/back-link";
import type { IconTileColor } from "@/components/icon-tile";
import { MobileSectionNav } from "@/components/mobile-section-nav";
import {
  SidebarHeader,
  SidebarLink,
  SidebarSection,
  SidebarShell,
  SidebarSignOut,
} from "@/components/sidebar-nav";

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
  { label: "ATS Check", href: "/career/ats-check", icon: Target, color: "green" },
  { label: "Cover Letter", href: "/career/cover-letter", icon: Mail, color: "pink" },
  { label: "Resume Maker", href: "/career/resume-maker", icon: Wand2, color: "yellow" },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/**
 * Same shell as CourseSidebar (src/components/sidebar-nav.tsx, plus a
 * "Back to..." link at top) for everything under /career — a section
 * outside any course, so it replaces AppSidebar rather than nesting under
 * it, matching how CourseSidebar does for /courses/[id].
 */
export function CareerSidebar({ counts }: { counts: CareerSidebarCounts }) {
  const pathname = usePathname();

  return (
    <>
      {/* `contents`, not a real box: the sticky MobileSectionNav inside can
          only stick within its parent, and this wrapper is short. */}
      <div className="contents md:hidden">
        {/* Own box (and -mb-4) so the layout's gap-6 doesn't push the nav away. */}
        <div className="-mb-4">
          <BackLink
            href="/"
            className="text-muted-foreground hover:text-foreground py-1 text-xs"
          >
            Back to dashboard
          </BackLink>
        </div>
        <MobileSectionNav
          title="Career"
          items={NAV_ITEMS.map((item) => ({
            ...item,
            active: isActive(pathname, item),
            count: item.countKey ? counts[item.countKey] : undefined,
          }))}
        />
      </div>

      <SidebarShell label="Career sections">
        <SidebarHeader>
          <BackLink
            href="/"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground -ml-1.5 py-1 pr-2 pl-1.5 text-xs"
          >
            Back to dashboard
          </BackLink>
          <p className="text-sidebar-foreground mt-1 font-heading font-semibold">
            Career
          </p>
        </SidebarHeader>

        <SidebarSection>
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              color={item.color}
              active={isActive(pathname, item)}
              count={item.countKey ? counts[item.countKey] : undefined}
            />
          ))}
        </SidebarSection>
        <SidebarSection>
          <SidebarSignOut />
        </SidebarSection>
      </SidebarShell>
    </>
  );
}
