import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { NavUserMenu } from "@/components/nav-user-menu";

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
    <NavUserMenu
      name={session.user.name}
      email={session.user.email}
      logoutAction={logout}
    />
  );
}
