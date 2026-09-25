"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { resourceSchema } from "@/lib/validations/resource";

import type { ResourceFormState } from "./resource-form-state";

export async function createResource(
  courseId: string,
  previousState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? ""),
    note: String(formData.get("note") ?? ""),
  };

  const parsed = resourceSchema.safeParse(values);

  if (!parsed.success) {
    return { submission, status: "error", errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const course = await db.course.findFirst({ where: { id: courseId, userId }, select: { id: true } });

  if (!course) {
    return { submission, status: "error", message: "Could not save the link. Please try again.", values };
  }

  try {
    await db.courseResource.create({
      data: {
        courseId,
        url: parsed.data.url,
        // No title given: fall back to the site's name rather than fetching
        // the page server-side (which would let any URL be probed).
        title: parsed.data.title || new URL(parsed.data.url).hostname.replace(/^www\./, ""),
        note: parsed.data.note || null,
      },
    });
  } catch (error) {
    console.error("Failed to save resource", error);
    return { submission, status: "error", message: "Could not save the link. Please try again.", values };
  }

  revalidatePath(`/courses/${courseId}/resources`);
  revalidatePath(`/courses/${courseId}`);

  return { submission, status: "success" };
}

export async function deleteResource(courseId: string, resourceId: string): Promise<void> {
  const userId = await requireUserId();

  await db.courseResource.deleteMany({ where: { id: resourceId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/resources`);
  revalidatePath(`/courses/${courseId}`);
}
