export type ResourceFormState = {
  /** Incremented on every submission; used as the form's React `key`. */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: { url?: string[]; title?: string[]; note?: string[] };
  /** Echoed back on failure so the user does not lose what they typed. */
  values?: { url: string; title: string; note: string };
};

export const initialResourceFormState: ResourceFormState = {
  submission: 0,
  status: "idle",
};
