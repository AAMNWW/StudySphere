export type ForgotPasswordFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so the
   * inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    email?: string[];
  };
  values?: {
    email: string;
  };
};

export const initialForgotPasswordFormState: ForgotPasswordFormState = {
  submission: 0,
  status: "idle",
};
