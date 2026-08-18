"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCourseSchema } from "@/lib/validations/course";

import type { CourseFormState } from "./course-form-state";

export async function createCourse(
  previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  // Validate on the server. Client-side validation is a convenience for honest
  // users; anyone can post arbitrary data straight to this action.
  const parsed = createCourseSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await db.course.create({
      data: {
        userId,
        title: parsed.data.title,
        // Store absent descriptions as NULL rather than an empty string, so
        // "no description" has exactly one representation in the database.
        description: parsed.data.description || null,
      },
    });
  } catch (error) {
    console.error("Failed to create course", error);
    return {
      submission,
      status: "error",
      message: "Could not save the course. Please try again.",
      values,
    };
  }

  // Tell Next.js the cached data for this route is stale, so the list below
  // the form re-renders with the new course included.
  revalidatePath("/courses");

  return { submission, status: "success" };
}

export async function updateCourse(
  courseId: string,
  previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const parsed = createCourseSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    // `updateMany` rather than `update` because it takes a filter (not just
    // a unique id) — this doubles as the ownership check: it silently
    // matches zero rows for a course that doesn't belong to this user.
    const { count } = await db.course.updateMany({
      where: { id: courseId, userId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
      },
    });

    if (count === 0) {
      return {
        submission,
        status: "error",
        message: "Could not save the course. Please try again.",
        values,
      };
    }
  } catch (error) {
    console.error("Failed to update course", error);
    return {
      submission,
      status: "error",
      message: "Could not save the course. Please try again.",
      values,
    };
  }

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);

  // Unlike creating a course, editing should leave the saved values visible
  // rather than clearing the form.
  return { submission, status: "success", values };
}

export async function deleteCourse(courseId: string): Promise<void> {
  const userId = await requireUserId();

  await db.course.deleteMany({ where: { id: courseId, userId } });

  revalidatePath("/courses");
  redirect("/courses");
}
