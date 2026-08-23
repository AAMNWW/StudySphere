export type ResumeFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so
   * the inputs clear after a successful upload and pick up defaultValue
   * again after a validation error.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    title?: string[];
  };
  values?: {
    title: string;
  };
};

export const initialResumeFormState: ResumeFormState = {
  submission: 0,
  status: "idle",
};
