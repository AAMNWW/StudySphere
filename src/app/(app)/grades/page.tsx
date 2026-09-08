import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { IconTile } from "@/components/icon-tile";
import { Card, CardContent } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeGradePercent, computeOverallGpa, percentToGrade } from "@/lib/grades";

export const metadata: Metadata = {
  title: "Grades",
};

export default async function GradesPage() {
  const userId = await requireUserId();
  const session = await auth();

  const courses = await db.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      creditHours: true,
      assignments: { select: { earnedPoints: true, maxPoints: true } },
      exams: { select: { earnedPoints: true, maxPoints: true } },
    },
  });

  const courseGrades = courses.map((course) => {
    const gradePercent = computeGradePercent([...course.assignments, ...course.exams]);
    return { ...course, gradePercent };
  });

  const overallGpa = computeOverallGpa(
    courseGrades.map((course) => ({
      gradePercent: course.gradePercent,
      creditHours: course.creditHours,
    })),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin={session?.user?.role === "ADMIN"} />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex items-center gap-3">
          <IconTile color="blue">
            <GraduationCap className="size-5" />
          </IconTile>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
            <p className="text-muted-foreground text-sm">
              Computed from grades entered on assignments and exams.
            </p>
          </div>
        </header>

        <Card className="mb-8">
          <CardContent className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold tabular-nums">
                {overallGpa !== null ? overallGpa.toFixed(2) : "—"}
              </p>
              <p className="text-muted-foreground text-sm">
                Overall GPA
                {overallGpa === null ? " — set credit hours and grades to see this" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {courseGrades.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No courses yet.{" "}
            <Link href="/courses" className="underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {courseGrades.map((course) => {
              const grade = course.gradePercent !== null ? percentToGrade(course.gradePercent) : null;

              return (
                <li key={course.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/courses/${course.id}`}
                          className="font-medium hover:underline"
                        >
                          {course.title}
                        </Link>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {course.creditHours != null
                            ? `${course.creditHours} credit hour${course.creditHours === 1 ? "" : "s"}`
                            : (
                              <Link
                                href={`/courses/${course.id}/settings`}
                                className="underline underline-offset-4"
                              >
                                Set credit hours
                              </Link>
                            )}
                        </p>
                      </div>
                      <div className="text-right">
                        {grade ? (
                          <>
                            <p className="text-xl leading-none font-bold tabular-nums">
                              {grade.letter}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                              {Math.round(course.gradePercent!)}%
                            </p>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-sm">No grades yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
