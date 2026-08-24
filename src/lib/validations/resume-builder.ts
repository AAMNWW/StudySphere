import { z } from "zod";

const experienceEntrySchema = z.object({
  title: z.string().trim().max(150),
  company: z.string().trim().max(150),
  dates: z.string().trim().max(100),
  bullets: z.array(z.string().trim().max(400)),
});

const educationEntrySchema = z.object({
  school: z.string().trim().max(150),
  degree: z.string().trim().max(150),
  dates: z.string().trim().max(100),
});

/**
 * The structured content of a builder-made resume — both the AI draft
 * endpoint and the PDF-render/save endpoint speak this shape, so the
 * builder form's state maps onto it directly.
 */
export const resumeDraftSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(150),
  email: z.string().trim().max(150),
  phone: z.string().trim().max(50),
  location: z.string().trim().max(150),
  summary: z.string().trim().max(2000),
  skills: z.array(z.string().trim().max(60)),
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
});

export type ResumeDraft = z.infer<typeof resumeDraftSchema>;

export const EMPTY_RESUME_DRAFT: ResumeDraft = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
};
