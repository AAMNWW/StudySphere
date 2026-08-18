import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

import { logout } from "./logout-action";

export async function NavUser() {
  const session = await auth();

  if (!session?.user) {
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/login">Login</Link>}
        />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/signup">Start for free</Link>}
        />
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
