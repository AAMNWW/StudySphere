import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the three section sidebars (AppSidebar,
 * CourseSidebar, CareerSidebar), so they stay visually identical: a sticky
 * card on md+, monochrome icons, and an accent bar marking the active row.
 * Phone widths use MobileSectionNav instead.
 */
export function SidebarShell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "bg-sidebar border-sidebar-border hidden shrink-0 flex-col gap-4 self-start rounded-xl border p-2 shadow-xs md:sticky md:top-20 md:flex md:w-56",
        className,
      )}
    >
      {children}
    </nav>
  );
}

export function SidebarSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {title ? (
        <p className="text-sidebar-foreground/45 px-2.5 pb-1 text-[0.68rem] font-semibold tracking-wider uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  count,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium before:bg-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active
            ? "text-primary"
            : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/75",
        )}
      />
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 ? (
        <span className="text-sidebar-foreground/55 bg-sidebar-foreground/5 ml-auto rounded px-1.5 text-[0.7rem] tabular-nums">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

/** Title block at the top of a sidebar (course name, "Career", …). */
export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-sidebar-border border-b px-2.5 pt-1.5 pb-3">{children}</div>;
}
