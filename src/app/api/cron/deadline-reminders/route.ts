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
 * due within the next 48h that hasn't been reminded about yet. Triggered
 * daily by Vercel Cron (see vercel.json); protected by CRON_SECRET so only
 * Vercel's scheduler can invoke it.
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

  const byUser = new Map<
    string,
    { name: string | null; email: string; groups: Map<string, ReminderCourseGroup> }
  >();

  for (const assignment of dueAssignments) {
    if (!assignment.dueDate) continue;

    const { user, title: courseTitle } = assignment.course;
    let entry = byUser.get(user.id);

    if (!entry) {
      entry = { name: user.name, email: user.email, groups: new Map() };
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
  const successfulUserIds = new Set<string>();

  if (byUser.size > 0) {
    const transporter = getMailTransporter();

    for (const [userId, { name, email, groups }] of byUser) {
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
        successfulUserIds.add(userId);
      } catch (error) {
        console.error(`Failed to send deadline reminder to ${email}`, error);
      }
    }
  }

  // Only mark assignments whose owner's email actually succeeded — a failed
  // send should be retried on the next cron run, not silently dropped.
  const remindedAssignments = dueAssignments.filter((assignment) =>
    successfulUserIds.has(assignment.course.user.id),
  );
  const remindedAssignmentIds = remindedAssignments.map((assignment) => assignment.id);
  const assignmentsReminded = remindedAssignmentIds.length;

  if (remindedAssignmentIds.length > 0) {
    await db.assignment.updateMany({
      where: { id: { in: remindedAssignmentIds } },
      data: { reminderSentAt: new Date() },
    });

    // In-app counterpart to the email above, one per reminded assignment.
    await Promise.all(
      remindedAssignments.map((assignment) =>
        createNotification({
          userId: assignment.course.user.id,
          type: "ASSIGNMENT_DUE_SOON",
          title: `${assignment.title} is due soon`,
          link: `/courses/${assignment.courseId}/assignments`,
        }),
      ),
    );
  }

  return NextResponse.json({ ok: true, usersNotified, assignmentsReminded });
}
