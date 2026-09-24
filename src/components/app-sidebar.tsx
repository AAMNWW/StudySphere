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
import { usePathname } from "next/navigation";

import type { IconTileColor } from "@/components/icon-tile";
import { MobileSectionNav } from "@/components/mobile-section-nav";
import { SidebarLink, SidebarSection, SidebarShell } from "@/components/sidebar-nav";
import { PRIMARY_GLOBAL_TOOLS } from "@/lib/course-tools";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "gray" as const },
  { label: "Courses", href: "/courses", icon: BookOpen, color: "purple" as const },
  { label: "Calendar", href: "/calendar", icon: Calendar, color: "green" as const },
  { label: "Grades", href: "/grades", icon: GraduationCap, color: "blue" as const },
  { label: "Career", href: "/career", icon: Briefcase, color: "yellow" as const },
];

/**
 * The course sections worth reaching before a course is picked (see
 * PRIMARY_GLOBAL_TOOLS in src/lib/course-tools.ts). Each opens
 * /tools/<slug>, which asks which course to open it for — previously these
 * lived only in CourseSidebar, so with no course open there was no way to
 * reach a quiz or a flashcard set at all.
 */
const TOOL_ITEMS = PRIMARY_GLOBAL_TOOLS.map((tool) => ({
  label: tool.label,
  href: `/tools/${tool.globalSlug}`,
  icon: tool.icon,
  color: tool.color,
}));

const SETTINGS_ITEM = { label: "Settings", href: "/settings", icon: Settings, color: "gray" as const };
const ADMIN_ITEM = { label: "Admin", href: "/admin", icon: ShieldCheck, color: "red" as const };

/**
 * Top-level counterpart to CourseSidebar: the same visual shell (the
 * shared pieces in src/components/sidebar-nav.tsx) one level up, for the
 * Dashboard, Courses, Calendar, and Settings pages that sit outside any
 * single course. `isAdmin` is passed down from whichever page renders this
 * (each already calls `auth()`) rather than fetched here — this component
 * itself has no session access, and the Admin item's visibility is only a
 * UX nicety anyway; the real gate is requireAdmin() on /admin itself.
 */
export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  function renderItem(item: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    color: IconTileColor;
  }) {
    return (
      <SidebarLink
        key={item.href}
        href={item.href}
        label={item.label}
        icon={item.icon}
        color={item.color}
        active={pathname === item.href}
      />
    );
  }

  const allItems = [
    ...NAV_ITEMS,
    ...TOOL_ITEMS,
    SETTINGS_ITEM,
    ...(isAdmin ? [ADMIN_ITEM] : []),
  ];

  return (
    <>
      <MobileSectionNav
        items={allItems.map((item) => ({
          ...item,
          active: pathname === item.href,
        }))}
      />
      <SidebarShell label="Main">
        <SidebarSection>{NAV_ITEMS.map(renderItem)}</SidebarSection>
        <SidebarSection title="Study tools">{TOOL_ITEMS.map(renderItem)}</SidebarSection>
        <SidebarSection title="Account">
          {renderItem(SETTINGS_ITEM)}
          {isAdmin ? renderItem(ADMIN_ITEM) : null}
        </SidebarSection>
      </SidebarShell>
    </>
  );
}
