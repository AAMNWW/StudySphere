"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getTileColorClasses, type IconTileColor } from "@/components/icon-tile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
 * Small phone-width stand-in for a section sidebar (AppSidebar,
 * CareerSidebar, CourseSidebar) — those render a vertical link list on
 * `md`+, which used to fall back to a horizontally-scrolling pill row below
 * `md`. With CourseSidebar's 13 destinations that row was a wall of
 * sideways-scrolling chips, so this collapses the same links into a single
 * "current section" button that opens a proper dropdown list instead.
 */
export function MobileSectionNav({
  items,
  className,
}: {
  items: MobileNavEntry[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.active) ?? items[0];
  const CurrentIcon = current?.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "bg-sidebar border-sidebar-border text-sidebar-foreground flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left text-sm font-medium md:hidden",
          className,
        )}
      >
        {current && CurrentIcon ? (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              getTileColorClasses(current.color),
            )}
          >
            <CurrentIcon className="size-3.5" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{current?.label ?? "Menu"}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </PopoverTrigger>

      <PopoverContent align="start" className="max-h-[70vh] w-64 overflow-y-auto">
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
                  item.active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent/60 hover:text-foreground",
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
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.count !== undefined && item.count > 0 ? (
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </PopoverContent>
    </Popover>
  );
}
