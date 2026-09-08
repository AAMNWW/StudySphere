import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { getSiteUrl } from "@/lib/site-url";

const STATE_COOKIE = "google_calendar_oauth_state";

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  const siteUrl = getSiteUrl();

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${siteUrl}/settings?calendar=error`);
  }

  try {
    const tokens = await exchangeCodeForTokens(siteUrl, code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      // Google omits refresh_token when the user has already granted this
      // app calendar access before and consent wasn't forced — buildAuthUrl
      // always passes prompt: "consent" specifically to avoid this, but
      // guard anyway rather than saving a connection that can't refresh.
      return NextResponse.redirect(`${siteUrl}/settings?calendar=error`);
    }

    await db.googleCalendarConnection.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
      },
    });
  } catch (error) {
    console.error("Failed to connect Google Calendar", error);
    return NextResponse.redirect(`${siteUrl}/settings?calendar=error`);
  }

  return NextResponse.redirect(`${siteUrl}/settings?calendar=connected`);
}
