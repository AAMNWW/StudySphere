import Link from "next/link";

import { auth } from "@/auth";

export async function MainNav() {
  const session = await auth();

  if (!session?.user) {
    return (
      <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
        <Link
          href="/#features"
          className="text-foreground/70 transition-colors hover:text-foreground"
        >
          Features
        </Link>
        <Link
          href="/#how-it-works"
          className="text-foreground/70 transition-colors hover:text-foreground"
        >
          How it works
        </Link>
        <Link
          href="/#tools"
          className="text-foreground/70 transition-colors hover:text-foreground"
        >
          AI tools
        </Link>
        <Link
          href="/#pricing"
          className="text-foreground/70 transition-colors hover:text-foreground"
        >
          Pricing
        </Link>
      </nav>
    );
  }

  // Signed-in navigation now lives in the page-level sidebar (AppSidebar on
  // Dashboard/Courses, CourseSidebar inside a course) instead of here, so it
  // reads as one consistent nav pattern rather than two competing ones. The
  // header brand link (see layout.tsx) still doubles as a "go to Dashboard"
  // shortcut from anywhere.
  return null;
}
