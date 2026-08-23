import { NextResponse } from "next/server";

import { getMailTransporter, REMINDER_FROM_ADDRESS } from "@/lib/email/client";
import { buildDeadlineReminderEmail, type ReminderCourseGroup } from "@/lib/email/deadline-reminders";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

// Wide window rather than "due tomorrow" — Vercel Cron's free tier only
// runs once daily, so a narrower window could skip a deadline that falls
// just outside two consecutive runs. reminderSentAt dedupes across runs.
const DUE_SOON_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Sends one digest email per student listing every assignment of theirs
 * due within the next 48h that hasn't been reminded about yet (skipping
 * anyone who's turned email reminders off in Settings), and creates the
 * in-app counterpart notification for everyone regardless of that
 * preference. Triggered daily by Vercel Cron (see vercel.json); protected
 * by CRON_SECRET so only Vercel's scheduler can invoke it.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(null, { status: 401 });
  }

  const cutoff = new Date(Date.now() + DUE_SOON_WINDOW_MS);

  const dueAssignments = await db.assignment.findMany({
    where: { completed: false, reminderSentAt: null, dueDate: { lte: cutoff } },
    include: { course: { include: { user: true } } },
  });

  if (dueAssignments.length === 0) {
    return NextResponse.json({ ok: true, usersNotified: 0, assignmentsReminded: 0 });
  }

  const byUser = new Map<
    string,
    {
      name: string | null;
      email: string;
      emailRemindersEnabled: boolean;
      groups: Map<string, ReminderCourseGroup>;
    }
  >();

  for (const assignment of dueAssignments) {
    if (!assignment.dueDate) continue;

    const { user, title: courseTitle } = assignment.course;
    let entry = byUser.get(user.id);

    if (!entry) {
      entry = {
        name: user.name,
        email: user.email,
        emailRemindersEnabled: user.emailRemindersEnabled,
        groups: new Map(),
      };
      byUser.set(user.id, entry);
    }

    let group = entry.groups.get(courseTitle);

    if (!group) {
      group = { courseTitle, assignments: [] };
      entry.groups.set(courseTitle, group);
    }

    group.assignments.push({ title: assignment.title, dueDate: assignment.dueDate });
  }

  let usersNotified = 0;
  const transporter = getMailTransporter();

  for (const [, { name, email, emailRemindersEnabled, groups }] of byUser) {
    if (!emailRemindersEnabled) continue;

    const digest = buildDeadlineReminderEmail(name, [...groups.values()]);

    try {
      await transporter.sendMail({
        from: REMINDER_FROM_ADDRESS,
        to: email,
        subject: digest.subject,
        html: digest.html,
        text: digest.text,
      });
      usersNotified += 1;
    } catch (error) {
      // Logged, not fatal to the rest of this run — the in-app notification
      // below is a second, independent channel, so a failed send no longer
      // means this student was never told at all.
      console.error(`Failed to send deadline reminder to ${email}`, error);
    }
  }

  // reminderSentAt and the in-app notification apply to every due
  // assignment regardless of email outcome or preference — the in-app
  // notification is the guaranteed channel now; email is best-effort on
  // top of it, not a prerequisite for "this student was reminded."
  await db.assignment.updateMany({
    where: { id: { in: dueAssignments.map((assignment) => assignment.id) } },
    data: { reminderSentAt: new Date() },
  });

  await Promise.all(
    dueAssignments.map((assignment) =>
      createNotification({
        userId: assignment.course.user.id,
        type: "ASSIGNMENT_DUE_SOON",
        title: `${assignment.title} is due soon`,
        link: `/courses/${assignment.courseId}/assignments`,
      }),
    ),
  );

  return NextResponse.json({
    ok: true,
    usersNotified,
    assignmentsReminded: dueAssignments.length,
  });
}
