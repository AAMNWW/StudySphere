export type CoverLetterToolFormState = {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  coverLetter?: string;
  values?: {
    resumeId: string;
    company: string;
    role: string;
    jobDescription: string;
  };
};

export const initialCoverLetterToolFormState: CoverLetterToolFormState = {
  submission: 0,
  status: "idle",
};
