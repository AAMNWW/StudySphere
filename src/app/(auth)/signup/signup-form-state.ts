export type SignupFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so the
   * inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error";
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  /**
   * Echoed back on failure so the user does not lose what they typed.
   * Deliberately excludes the password.
   */
  values?: {
    name: string;
    email: string;
  };
};

export const initialSignupFormState: SignupFormState = {
  submission: 0,
  status: "idle",
};
