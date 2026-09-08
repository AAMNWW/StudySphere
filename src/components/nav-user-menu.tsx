"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Avatar-initials trigger opening a small menu (name/email, Settings,
 * Sign out) — replaces the old bare name + "Sign out" button pair with the
 * standard SaaS pattern. `logoutAction` is a Server Action reference passed
 * down from the async server component that renders this. */
export function NavUserMenu({
  name,
  email,
  logoutAction,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const label = name ?? email ?? "Account";
  const initials = getInitials(label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-full outline-none",
          "focus-visible:ring-ring/50 focus-visible:ring-3",
        )}
        aria-label="Account menu"
      >
        <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {initials}
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{name ?? "Student"}</p>
          {email ? (
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          ) : null}
        </div>
        <div className="my-1 border-t" />
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="hover:bg-muted flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm"
        >
          <Settings className="text-muted-foreground size-4" />
          Settings
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="hover:bg-muted flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm"
          >
            <LogOut className="text-muted-foreground size-4" />
            Sign out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
