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

/**
 * Gate for src/app/admin — the actual security boundary (the Admin nav item
 * being conditionally rendered in AppSidebar is just a UX nicety on top of
 * this, not a substitute for it). Non-admins are bounced to the dashboard
 * rather than shown a 404, matching how signed-out visitors are bounced to
 * /login rather than seeing a broken page.
 */
export async function requireAdmin(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session.user.id;
}
