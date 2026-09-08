import type { AtsCheckResult } from "@/lib/ai/ats-check";

export type AtsCheckToolFormState = {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  result?: AtsCheckResult;
  values?: {
    resumeId: string;
    jobDescription: string;
  };
};

export const initialAtsCheckToolFormState: AtsCheckToolFormState = {
  submission: 0,
  status: "idle",
};
