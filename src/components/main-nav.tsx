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
          href="/#ai-assistant"
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

  return (
    <nav className="flex items-center gap-5 text-sm font-medium">
      <Link
        href="/"
        className="text-foreground/70 transition-colors hover:text-foreground"
      >
        Dashboard
      </Link>
      <Link
        href="/courses"
        className="text-foreground/70 transition-colors hover:text-foreground"
      >
        Courses
      </Link>
    </nav>
  );
}
