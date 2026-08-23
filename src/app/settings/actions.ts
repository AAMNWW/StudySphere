"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { colorPaletteSchema, type ColorPaletteValue } from "@/lib/validations/color-palette";
import { updateProfileSchema } from "@/lib/validations/profile";

import type { ProfileFormState } from "./settings-form-state";

export async function updateProfile(
  previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = { name: String(formData.get("name") ?? "") };
  const parsed = updateProfileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  await db.user.update({ where: { id: userId }, data: { name: parsed.data.name } });

  revalidatePath("/settings", "layout");

  return { submission, status: "success", values: parsed.data };
}

export async function updateEmailReminders(enabled: boolean): Promise<void> {
  const userId = await requireUserId();

  await db.user.update({ where: { id: userId }, data: { emailRemindersEnabled: enabled } });

  revalidatePath("/settings");
}

export async function updateColorPalette(colorPalette: ColorPaletteValue): Promise<void> {
  const userId = await requireUserId();
  const parsed = colorPaletteSchema.safeParse(colorPalette);

  if (!parsed.success) {
    return;
  }

  await db.user.update({ where: { id: userId }, data: { colorPalette: parsed.data } });

  // "layout" so the data-palette attribute set in the root layout picks up
  // the change immediately, not just the /settings page itself.
  revalidatePath("/", "layout");
}
