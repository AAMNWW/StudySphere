export interface AsyncActionFormState {
  submission: number;
  status: "idle" | "success" | "error";
  message?: string;
}

export const initialAsyncActionFormState: AsyncActionFormState = {
  submission: 0,
  status: "idle",
};
