const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export interface ReminderAssignment {
  title: string;
  dueDate: Date;
}

export interface ReminderCourseGroup {
  courseTitle: string;
  assignments: ReminderAssignment[];
}

export interface ReminderEmail {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Builds a single digest email for one student, grouped by course. */
export function buildDeadlineReminderEmail(
  userName: string | null,
  groups: ReminderCourseGroup[],
): ReminderEmail {
  const total = groups.reduce((count, group) => count + group.assignments.length, 0);
  const subject = `${total} assignment${total === 1 ? "" : "s"} due soon`;
  const greeting = userName ? `Hi ${userName},` : "Hi,";

  const textSections = groups.map((group) => {
    const lines = group.assignments
      .map((a) => `  - ${a.title} (due ${dateFormatter.format(a.dueDate)})`)
      .join("\n");
    return `${group.courseTitle}\n${lines}`;
  });

  const text = `${greeting}\n\nYou have ${total} assignment${total === 1 ? "" : "s"} due in the next couple of days:\n\n${textSections.join("\n\n")}\n\n— Academique`;

  const htmlSections = groups
    .map(
      (group) => `
        <h2 style="font-size:16px;margin:24px 0 8px;color:#111827;">${escapeHtml(group.courseTitle)}</h2>
        <ul style="margin:0;padding-left:20px;color:#374151;">
          ${group.assignments
            .map(
              (a) =>
                `<li style="margin-bottom:4px;">${escapeHtml(a.title)} — due ${dateFormatter.format(a.dueDate)}</li>`,
            )
            .join("")}
        </ul>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p style="color:#111827;">${escapeHtml(greeting)}</p>
      <p style="color:#374151;">You have <strong>${total}</strong> assignment${total === 1 ? "" : "s"} due in the next couple of days:</p>
      ${htmlSections}
      <p style="margin-top:24px;color:#9ca3af;font-size:13px;">— Academique</p>
    </div>`;

  return { subject, html, text };
}
