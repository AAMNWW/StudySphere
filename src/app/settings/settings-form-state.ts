export interface ProfileFormState {
  submission: number;
  status: "idle" | "error" | "success";
  message?: string;
  errors?: {
    name?: string[];
  };
  values?: {
    name: string;
  };
}

export const initialProfileFormState: ProfileFormState = {
  submission: 0,
  status: "idle",
};
