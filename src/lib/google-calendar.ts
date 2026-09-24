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
    let credentials;
    try {
      ({ credentials } = await client.refreshAccessToken());
    } catch (error) {
      // `invalid_grant` means the refresh token is dead for good — the user
      // revoked access from their Google account, or it expired unused. The
      // stored connection can never work again, so drop it: /settings then
      // offers Connect instead of claiming a sync that silently fails. Any
      // other error (network, Google outage) is transient — keep the tokens.
      if (isInvalidGrant(error)) {
        await db.googleCalendarConnection.deleteMany({ where: { userId } });
      } else {
        console.error("Failed to refresh Google Calendar token", error);
      }
      return null;
    }
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

function isInvalidGrant(error: unknown): boolean {
  const data = (error as { response?: { data?: { error?: unknown } } })?.response?.data;
  return data?.error === "invalid_grant";
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

    const nextDay = new Date(params.date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const requestBody = {
      summary: params.title,
      description: params.description ?? undefined,
      // All-day event — assignments/exams are tracked by date, not a
      // specific time slot. Google's all-day `end.date` is *exclusive*, so a
      // one-day event ends the following day; start === end is rejected as
      // an empty time range.
      start: { date: params.date.toISOString().slice(0, 10) },
      end: { date: nextDay.toISOString().slice(0, 10) },
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

/** Pushes every upcoming, not-yet-synced assignment and exam to Google
 * Calendar. Run once right after a user connects, since the per-row sync
 * hooks in the course actions only fire on create/update — without this,
 * everything that already existed before connecting would never appear in
 * Google. Rows with an existing CalendarSyncLink (e.g. from an earlier
 * connection) are skipped so reconnecting doesn't duplicate events. */
export async function backfillCalendarEvents(userId: string): Promise<void> {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [assignments, exams, links] = await Promise.all([
      db.assignment.findMany({
        where: { course: { userId }, completed: false, dueDate: { gte: today } },
        select: { id: true, title: true, dueDate: true },
      }),
      db.exam.findMany({
        where: { userId, examDate: { gte: today } },
        select: { id: true, title: true, examDate: true },
      }),
      db.calendarSyncLink.findMany({
        where: { userId },
        select: { sourceType: true, sourceId: true },
      }),
    ]);

    const linked = new Set(links.map((link) => `${link.sourceType}:${link.sourceId}`));

    // Sequential on purpose — a student's upcoming work is a handful of rows,
    // and firing them all at once invites Google's per-user rate limit.
    for (const assignment of assignments) {
      if (linked.has(`assignment:${assignment.id}`)) continue;
      await syncCalendarEvent({
        userId,
        sourceType: "assignment",
        sourceId: assignment.id,
        title: assignment.title,
        date: assignment.dueDate!,
      });
    }
    for (const exam of exams) {
      if (linked.has(`exam:${exam.id}`)) continue;
      await syncCalendarEvent({
        userId,
        sourceType: "exam",
        sourceId: exam.id,
        title: exam.title,
        date: exam.examDate,
      });
    }
  } catch (error) {
    console.error("Failed to backfill calendar events", error);
  }
}
