export type StudyPlanFormState = {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  /** The agent's final explanation, shown on success. */
  plan?: string;
};

export const initialStudyPlanFormState: StudyPlanFormState = {
  submission: 0,
  status: "idle",
};
