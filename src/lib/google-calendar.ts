import { auth as googleAuth, calendar } from "@googleapis/calendar";

import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

const REDIRECT_PATH = "/api/integrations/google-calendar/callback";

export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function newOAuthClient(redirectUri: string) {
  return new googleAuth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
}

/** Builds the OAuth client used for the initial "Connect Google Calendar"
 * consent-screen redirect and the code exchange right after — kept apart
 * from {@link getConnectedCalendarClient} below, which is for making
 * authenticated Calendar API calls with an *existing* connection's tokens. */
export function buildAuthUrl(siteUrl: string, state: string): string {
  const client = newOAuthClient(`${siteUrl}${REDIRECT_PATH}`);
  return client.generateAuthUrl({
    access_type: "offline",
    // Google only returns a refresh_token on the *first* consent for a
    // given user+client; forcing the consent screen again guarantees one
    // even if this account previously connected and disconnected.
    prompt: "consent",
    scope: [GOOGLE_CALENDAR_SCOPE],
    state,
  });
}

export async function exchangeCodeForTokens(siteUrl: string, code: string) {
  const client = newOAuthClient(`${siteUrl}${REDIRECT_PATH}`);
  const { tokens } = await client.getToken(code);
  return tokens;
}

/** Loads `userId`'s stored Calendar connection and returns an authenticated
 * `calendar` client, refreshing (and persisting) the access token first if
 * it's expired or about to. Returns null if the user hasn't connected
 * Google Calendar — every call site should treat that as "skip silently",
 * never as an error, since Calendar sync is optional. */
export async function getConnectedCalendarClient(userId: string) {
  const connection = await db.googleCalendarConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    return null;
  }

  const client = newOAuthClient(`${getSiteUrl()}${REDIRECT_PATH}`);
  client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiresAt.getTime(),
  });

  // Refresh a little ahead of actual expiry so the API call below never
  // races an access token that dies mid-request.
  if (connection.expiresAt.getTime() <= Date.now() + 60_000) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);

    if (credentials.access_token && credentials.expiry_date) {
      await db.googleCalendarConnection.update({
        where: { userId },
        data: {
          accessToken: credentials.access_token,
          expiresAt: new Date(credentials.expiry_date),
        },
      });
    }
  }

  return calendar({ version: "v3", auth: client });
}

export type CalendarSourceType = "assignment" | "exam";

/** Creates or updates the Google Calendar event exported for one local
 * Assignment/Exam row, recording the mapping in CalendarSyncLink so a later
 * call updates the same event instead of creating a duplicate. No-ops
 * silently if the user hasn't connected Google Calendar. Never throws —
 * every call site wraps a local action that must succeed regardless of
 * whether Google's API is reachable. */
export async function syncCalendarEvent(params: {
  userId: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  title: string;
  description?: string | null;
  date: Date;
}): Promise<void> {
  try {
    const client = await getConnectedCalendarClient(params.userId);
    if (!client) {
      return;
    }

    const existingLink = await db.calendarSyncLink.findUnique({
      where: { sourceType_sourceId: { sourceType: params.sourceType, sourceId: params.sourceId } },
    });

    const dateString = params.date.toISOString().slice(0, 10);
    const requestBody = {
      summary: params.title,
      description: params.description ?? undefined,
      // All-day event — assignments/exams are tracked by date, not a
      // specific time slot.
      start: { date: dateString },
      end: { date: dateString },
    };

    if (existingLink) {
      await client.events.update({
        calendarId: "primary",
        eventId: existingLink.googleEventId,
        requestBody,
      });
      return;
    }

    const { data } = await client.events.insert({
      calendarId: "primary",
      requestBody,
    });

    if (data.id) {
      await db.calendarSyncLink.create({
        data: {
          userId: params.userId,
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          googleEventId: data.id,
        },
      });
    }
  } catch (error) {
    console.error("Failed to sync calendar event", error);
  }
}

/** Deletes the Google Calendar event linked to a local Assignment/Exam (on
 * that row's own deletion or completion). No-ops if there's no connection
 * or no link — never throws, same reasoning as {@link syncCalendarEvent}. */
export async function deleteCalendarEvent(params: {
  userId: string;
  sourceType: CalendarSourceType;
  sourceId: string;
}): Promise<void> {
  try {
    const link = await db.calendarSyncLink.findUnique({
      where: { sourceType_sourceId: { sourceType: params.sourceType, sourceId: params.sourceId } },
    });
    if (!link) {
      return;
    }

    const client = await getConnectedCalendarClient(params.userId);
    if (client) {
      await client.events.delete({ calendarId: "primary", eventId: link.googleEventId }).catch(() => {
        // Already deleted on Google's side (e.g. removed manually) — fine,
        // still clean up the local link below.
      });
    }

    await db.calendarSyncLink.delete({ where: { id: link.id } });
  } catch (error) {
    console.error("Failed to delete synced calendar event", error);
  }
}
