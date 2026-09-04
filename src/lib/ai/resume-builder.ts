import { Type } from "@google/genai";

import { EMPTY_RESUME_DRAFT, type ResumeDraft } from "@/lib/validations/resume-builder";

import { getClient, MODEL, withGeminiRetry } from "./client";
import { requireText } from "./summarize-document";

const DRAFT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: "Full name, or \"\" if not given." },
    email: { type: Type.STRING, description: "Email address, or \"\" if not given." },
    phone: { type: Type.STRING, description: "Phone number, or \"\" if not given." },
    location: { type: Type.STRING, description: "City/region, or \"\" if not given." },
    summary: {
      type: Type.STRING,
      description: "2-3 sentence professional summary tailored to the target role.",
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "8-15 relevant skills/technologies, most relevant to the target role first.",
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          dates: { type: Type.STRING, description: "e.g. \"Jun 2022 - Present\"." },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-4 achievement-focused bullets, quantified where the background supports it.",
          },
        },
        required: ["title", "company", "dates", "bullets"],
      },
      description: "Most recent role first. Only include roles mentioned in the background.",
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          dates: { type: Type.STRING },
        },
        required: ["school", "degree", "dates"],
      },
    },
  },
  required: ["fullName", "email", "phone", "location", "summary", "skills", "experience", "education"],
};

/**
 * Turns loose, unstructured background text into a structured resume
 * draft. Never invents employers, schools or dates that aren't implied by
 * the background — it only rewrites/organizes what's given, the same
 * "don't invent experience" rule as generateCoverLetter.
 */
export async function draftResumeContent(
  background: string,
  targetRole: string,
): Promise<ResumeDraft> {
  const ai = getClient();

  const prompt =
    "You are helping a student turn loose notes about themselves into a " +
    "structured resume draft" +
    (targetRole ? ` targeting a "${targetRole}" role` : "") +
    ". Organize and rewrite what's below into resume language (concise, " +
    "achievement-focused bullets) — do not invent employers, schools, " +
    "dates, or skills that aren't stated or clearly implied. Leave a field " +
    'empty ("" or []) rather than guessing.' +
    `\n\nBackground:\n${background}`;

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: DRAFT_SCHEMA },
    }),
  );

  const parsed = JSON.parse(requireText(response)) as Partial<ResumeDraft>;

  return {
    ...EMPTY_RESUME_DRAFT,
    ...parsed,
  };
}
