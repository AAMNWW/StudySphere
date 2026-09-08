export type LoginFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so the
   * inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error";
  message?: string;
  /** Set when the credentials matched but the account hasn't verified its
   * email yet — shows a "resend verification email" link instead of a
   * plain error. See EmailNotVerifiedError in src/auth.ts. */
  needsVerification?: boolean;
  errors?: {
    email?: string[];
    password?: string[];
  };
  /**
   * Echoed back on failure so the user does not lose what they typed.
   * Deliberately excludes the password.
   */
  values?: {
    email: string;
  };
};

export const initialLoginFormState: LoginFormState = {
  submission: 0,
  status: "idle",
};
