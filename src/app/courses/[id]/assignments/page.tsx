import { ListTodo } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

import { AssignmentCard } from "../_components/assignment-card";
import { CreateAssignmentForm } from "../_components/create-assignment-form";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/assignments">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Assignments — ${course.title}` : "Course not found" };
}

export default async function AssignmentsPage({
  params,
}: PageProps<"/courses/[id]/assignments">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    include: {
      assignments: {
        orderBy: [{ completed: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {course.title}
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <ListTodo className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground text-sm">
            Everything due for {course.title}. You&apos;ll get an email reminder before a
            deadline.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add an assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAssignmentForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="assignment-list-heading">
        <h2 id="assignment-list-heading" className="mb-4 text-lg font-bold">
          {course.assignments.length}{" "}
          {course.assignments.length === 1 ? "assignment" : "assignments"}
        </h2>

        {course.assignments.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No assignments yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.assignments.map((assignment) => (
              <li key={assignment.id}>
                <AssignmentCard
                  courseId={course.id}
                  assignment={assignment}
                  isOverdue={isAssignmentOverdue(assignment)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
