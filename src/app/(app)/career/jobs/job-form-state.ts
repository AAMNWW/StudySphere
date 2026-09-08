export type JobApplicationFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so the
   * inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    company?: string[];
    role?: string[];
    status?: string[];
    jobUrl?: string[];
    jobDescription?: string[];
    notes?: string[];
    resumeId?: string[];
  };
  /** Echoed back on failure so the user does not lose what they typed. */
  values?: {
    company: string;
    role: string;
    status: string;
    jobUrl: string;
    jobDescription: string;
    notes: string;
    resumeId: string;
  };
};

export const initialJobApplicationFormState: JobApplicationFormState = {
  submission: 0,
  status: "idle",
};

/** Minimal shape for the ATS-check and cover-letter buttons — the actual
 * result/error is persisted on the JobApplication row and rendered by the
 * page after revalidation (mirrors SummarizeDocumentButton), so this only
 * needs to drive the pending label. */
export type AiActionFormState = {
  submission: number;
  status: "idle" | "success" | "error";
};

export const initialAiActionFormState: AiActionFormState = {
  submission: 0,
  status: "idle",
};
