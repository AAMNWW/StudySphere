"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#tools", label: "AI tools" },
  { href: "/#pricing", label: "Pricing" },
];

/** Marketing-nav counterpart to MainNav's `hidden lg:flex` row — below `lg`
 * there's no room for the full link row, so it collapses into this button
 * instead of disappearing outright. */
export function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={open ? "Close menu" : "Open menu"}
        className="hover:bg-muted flex size-9 items-center justify-center rounded-full transition-colors lg:hidden"
      >
        {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-48 p-1">
        <nav className="flex flex-col">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-foreground/80 hover:bg-accent hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  );
}
