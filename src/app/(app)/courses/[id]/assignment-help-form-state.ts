export type AssignmentHelpFormState = {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialAssignmentHelpFormState: AssignmentHelpFormState = {
  submission: 0,
  status: "idle",
};
