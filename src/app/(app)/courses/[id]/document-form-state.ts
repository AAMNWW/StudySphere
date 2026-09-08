export type DocumentFormState = {
  /**
   * Incremented on every submission. The form uses it as a React `key` so
   * the file input clears after a successful upload.
   */
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialDocumentFormState: DocumentFormState = {
  submission: 0,
  status: "idle",
};
