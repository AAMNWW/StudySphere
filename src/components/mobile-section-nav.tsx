"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getTileColorClasses, type IconTileColor } from "@/components/icon-tile";
import { logout } from "@/components/logout-action";
import { cn } from "@/lib/utils";

export interface MobileNavEntry {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: IconTileColor;
  active: boolean;
  count?: number;
  /** Heading this entry sits under in the drawer ("Study tools", …);
   * consecutive entries with the same value are grouped. */
  section?: string;
}

function Tile({ entry, small = false }: { entry: MobileNavEntry; small?: boolean }) {
  const Icon = entry.icon;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        small ? "size-6" : "size-7",
        getTileColorClasses(entry.color),
      )}
    >
      <Icon className={small ? "size-3.5" : "size-4"} />
    </span>
  );
}

/**
 * Phone-width stand-in for a section sidebar (AppSidebar, CareerSidebar,
 * CourseSidebar) — those render a vertical list on `md`+. A slim sticky bar
 * under the header shows where you are, and its Menu button slides the full
 * list in from the left as a drawer (with Sign out at the bottom), instead
 * of a sideways-scrolling strip that cut half the destinations off-screen.
 *
 * The bar's `top` is the header's height (h-16 / sm:h-[4.5rem], plus the 1px
 * border) in rem, so it tucks exactly under the header at any root font
 * size; `-mx-6` matches the page wrappers' px-6 so it runs edge to edge.
 */
export function MobileSectionNav({
  items,
  title = "Menu",
  className,
}: {
  items: MobileNavEntry[];
  /** Shown at the top of the drawer — the course name, "Career", etc. */
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.active);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-[calc(4rem+1px)] z-30 -mx-6 flex items-center gap-3 border-b px-6 py-2 backdrop-blur-sm sm:top-[calc(4.5rem+1px)] md:hidden",
          className,
        )}
      >
        <Dialog.Trigger className="hover:bg-muted flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors">
          <Menu className="size-4" />
          Menu
        </Dialog.Trigger>
        {current ? (
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <Tile entry={current} small />
            <span className="truncate">{current.label}</span>
          </span>
        ) : null}
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
        <Dialog.Popup className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-xl transition-transform duration-200 ease-out outline-none data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full md:hidden">
          <div className="flex items-center justify-between border-b px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
            <Dialog.Title className="truncate font-heading text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="hover:bg-sidebar-accent -mr-1 flex size-8 cursor-pointer items-center justify-center rounded-md"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <nav aria-label="Section" className="flex-1 overflow-y-auto px-2 py-3">
            {items.map((item, index) => {
              const startsSection = item.section && item.section !== items[index - 1]?.section;
              return (
                <div key={item.href}>
                  {startsSection ? (
                    <p className="text-sidebar-foreground/45 px-2.5 pt-4 pb-1 text-[0.68rem] font-semibold tracking-wider uppercase">
                      {item.section}
                    </p>
                  ) : null}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                      item.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground before:bg-primary font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Tile entry={item} />
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 ? (
                      <span className="text-sidebar-foreground/55 bg-sidebar-foreground/5 ml-auto rounded px-1.5 text-[0.7rem] tabular-nums">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </nav>

          <form action={logout} className="border-t px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent/60 flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <LogOut className="size-4" />
              </span>
              Sign out
            </button>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
