export interface NewCareerChatFormState {
  /**
   * Incremented on every submission. The form uses it as a React `key` so
   * the inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "success" | "error";
  message?: string;
  values?: {
    resumeId?: string;
  };
}

export const initialNewCareerChatFormState: NewCareerChatFormState = {
  submission: 0,
  status: "idle",
};
