import { z } from "zod";

export const resumeTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(100, "Title must be 100 characters or fewer.");
