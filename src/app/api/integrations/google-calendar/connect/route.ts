import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/google-calendar";
import { getSiteUrl } from "@/lib/site-url";

const STATE_COOKIE = "google_calendar_oauth_state";

/** Starts the "Connect Google Calendar" flow from /settings — deliberately
 * separate from NextAuth's own Google provider (src/auth.ts), which never
 * requests calendar scope. */
export async function GET() {
  await requireUserId();

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
