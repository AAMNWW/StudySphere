import { createUserContent, Type } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentContent } from "./document-content";
import { requireText } from "./summarize-document";

export interface AtsCheckResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
}

const ATS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "How well the resume matches the job description for an ATS keyword scan, 0-100.",
    },
    matchedKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Important keywords/skills from the job description the resume already covers.",
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Important keywords/skills from the job description missing from the resume.",
    },
    feedback: {
      type: Type.STRING,
      description: "2-4 sentences of concrete, actionable feedback on improving the match.",
    },
  },
  required: ["score", "matchedKeywords", "missingKeywords", "feedback"],
};

/**
 * Simulates an ATS (Applicant Tracking System) keyword scan of a resume
 * against one job description. Reuses getDocumentContent — a resume is
 * handled identically to a course Document, just from a different table.
 */
export async function checkAtsMatch(
  resumeBytes: Buffer,
  resumeMimeType: string,
  resumeFileName: string,
  jobDescription: string,
): Promise<AtsCheckResult> {
  const ai = getClient();
  const resumeContent = await getDocumentContent(resumeBytes, resumeMimeType, resumeFileName);

  const prompt =
    "You are simulating an ATS (Applicant Tracking System) keyword scan. " +
    "Compare the resume below against the job description and score how " +
    "well it would match, the way an ATS keyword-matches a resume against " +
    `a posting.\n\nJob description:\n${jobDescription}`;

  const contents =
    resumeContent.kind === "part"
      ? createUserContent([prompt, resumeContent.part])
      : `${prompt}\n\nResume:\n${resumeContent.text}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { responseMimeType: "application/json", responseSchema: ATS_SCHEMA },
  });

  const parsed = JSON.parse(requireText(response)) as AtsCheckResult;

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    matchedKeywords: parsed.matchedKeywords ?? [],
    missingKeywords: parsed.missingKeywords ?? [],
    feedback: parsed.feedback ?? "",
  };
}
