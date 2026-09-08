"use client";

import Link from "next/link";

import { getTileColorClasses, type IconTileColor } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

export interface MobileNavEntry {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: IconTileColor;
  active: boolean;
  count?: number;
}

/**
 * Phone-width stand-in for a section sidebar (AppSidebar, CareerSidebar,
 * CourseSidebar) — those render a vertical link list on `md`+. A sticky
 * horizontally-scrolling icon+label strip under the header, so the section's
 * destinations are all one thumb-swipe away instead of hidden behind a
 * dropdown.
 */
export function MobileSectionNav({
  items,
  className,
}: {
  items: MobileNavEntry[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Section"
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-[57px] z-30 -mx-4 flex gap-1.5 overflow-x-auto border-b px-4 py-2 backdrop-blur-sm sm:top-[65px] sm:-mx-6 sm:px-6 md:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              item.active
                ? "bg-accent text-accent-foreground border-transparent"
                : "text-foreground/70 hover:bg-accent/60 hover:text-foreground border-transparent",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-md",
                getTileColorClasses(item.color),
              )}
            >
              <Icon className="size-3" />
            </span>
            {item.label}
            {item.count !== undefined && item.count > 0 ? (
              <span className="text-muted-foreground text-xs tabular-nums">
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
