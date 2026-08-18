import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

import { logout } from "./logout-action";

export async function NavUser() {
  const session = await auth();

  if (!session?.user) {
    return (
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/login" className="hover:underline">
          Sign in
        </Link>
        <Link href="/signup" className="hover:underline">
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      <span className="text-muted-foreground">
        {session.user.name ?? session.user.email}
      </span>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </nav>
  );
}
