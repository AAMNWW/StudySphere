import Link from "next/link";

import { auth } from "@/auth";

export async function MainNav() {
  const session = await auth();

  if (!session?.user) {
    return null;
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
