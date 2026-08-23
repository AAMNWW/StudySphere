export type NewInterviewFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so
   * the inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    role?: string[];
    company?: string[];
  };
  /** Echoed back on failure so the user does not lose what they typed. */
  values?: {
    role: string;
    company: string;
    resumeId: string;
  };
};

export const initialNewInterviewFormState: NewInterviewFormState = {
  submission: 0,
  status: "idle",
};

/** Minimal shape for the "End interview" button — the actual feedback/error
 * is persisted on the InterviewSession row and rendered by the page after
 * revalidation, so this only needs to drive the pending label. */
export type AiActionFormState = {
  submission: number;
  status: "idle" | "success" | "error";
};

export const initialAiActionFormState: AiActionFormState = {
  submission: 0,
  status: "idle",
};
