import { redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * Every protected page and mutating Server Action calls this first. Proxy
 * (src/proxy.ts) already redirects signed-out visitors away from protected
 * pages, but that's an optimistic check only — Server Actions are POSTs to
 * the page route and can bypass a proxy matcher, so this is the check that
 * actually matters.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}
