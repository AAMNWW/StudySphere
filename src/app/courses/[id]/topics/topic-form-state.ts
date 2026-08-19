export type TopicFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so the
   * inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    title?: string[];
    description?: string[];
    weekNumber?: string[];
  };
  /** Echoed back on failure so the user does not lose what they typed. */
  values?: {
    title: string;
    description: string;
    weekNumber: string;
  };
};

export const initialTopicFormState: TopicFormState = {
  submission: 0,
  status: "idle",
};
