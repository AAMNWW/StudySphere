"use server";

import { revalidatePath } from "next/cache";

import { generateStudyPlan } from "@/lib/agent/study-planner";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

import type { StudyPlanFormState } from "./study-plan-form-state";

export async function generateStudyPlanAction(
  courseId: string,
  previousState: StudyPlanFormState,
): Promise<StudyPlanFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    return { submission, status: "error", message: "Course not found." };
  }

  let plan: string;

  try {
    plan = await generateStudyPlan(courseId, course.title);
  } catch (error) {
    console.error("Failed to generate study plan", error);
    return {
      submission,
      status: "error",
      message: "Could not generate a study plan. Please try again.",
    };
  }

  await createNotification({
    userId,
    type: "STUDY_PLAN_READY",
    title: `Your study plan for ${course.title} is ready`,
    link: `/courses/${courseId}/topics`,
  });

  // The agent may have added Topic rows — the Topics page needs to reflect
  // that on next visit.
  revalidatePath(`/courses/${courseId}/topics`);
  revalidatePath(`/courses/${courseId}/planner`);

  return { submission, status: "success", plan };
}
