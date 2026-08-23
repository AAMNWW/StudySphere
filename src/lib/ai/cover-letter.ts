import { createUserContent } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentContent } from "./document-content";
import { requireText } from "./summarize-document";

/** Drafts a cover letter from a resume plus the target role — same
 * getDocumentContent reuse as ats-check.ts, since a resume's content is
 * resolved identically to a course Document's. */
export async function generateCoverLetter(
  resumeBytes: Buffer,
  resumeMimeType: string,
  resumeFileName: string,
  company: string,
  role: string,
  jobDescription: string | null,
): Promise<string> {
  const ai = getClient();
  const resumeContent = await getDocumentContent(resumeBytes, resumeMimeType, resumeFileName);

  const prompt =
    `Write a concise, professional cover letter (3-4 short paragraphs) for ` +
    `a student applying to the "${role}" role at "${company}", based on the ` +
    `resume below.` +
    (jobDescription ? `\n\nJob description:\n${jobDescription}` : "") +
    "\n\nDon't invent experience, skills or credentials that aren't in the " +
    'resume. Address it generically (e.g. "Dear Hiring Manager") rather ' +
    "than guessing a name.";

  const contents =
    resumeContent.kind === "part"
      ? createUserContent([prompt, resumeContent.part])
      : `${prompt}\n\nResume:\n${resumeContent.text}`;

  const response = await ai.models.generateContent({ model: MODEL, contents });
  return requireText(response);
}
