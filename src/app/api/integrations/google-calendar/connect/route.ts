import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/google-calendar";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { getSiteUrl } from "@/lib/site-url";

const STATE_COOKIE = "google_calendar_oauth_state";

/** Starts the "Connect Google Calendar" flow from /settings — deliberately
 * separate from NextAuth's own Google provider (src/auth.ts), which never
 * requests calendar scope. */
export async function GET() {
  await requireUserId();

  // /settings hides the Connect button when the OAuth client isn't
  // configured, so this is only reachable by hitting the URL directly (a
  // stale link, say) — still worth handling, since building the auth URL
  // anyway would send the user to Google with an empty `client_id` and a bare
  // "invalid_client". Bouncing back to /settings is enough of an answer: the
  // Google Calendar card there explains the missing configuration in place.
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${getSiteUrl()}/settings`);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthUrl(getSiteUrl(), state));
}
