export type ResetPasswordFormState = {
  submission: number;
  status: "idle" | "error";
  message?: string;
  errors?: {
    password?: string[];
    confirmPassword?: string[];
  };
};

export const initialResetPasswordFormState: ResetPasswordFormState = {
  submission: 0,
  status: "idle",
};
