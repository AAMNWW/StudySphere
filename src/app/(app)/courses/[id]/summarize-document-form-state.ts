export type SummarizeDocumentFormState = {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialSummarizeDocumentFormState: SummarizeDocumentFormState = {
  submission: 0,
  status: "idle",
};
