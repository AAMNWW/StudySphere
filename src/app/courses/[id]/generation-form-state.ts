/**
 * Shared form state for the "generate quiz / flashcards / chat" forms,
 * which need field-level errors (unlike the lighter AsyncActionFormState
 * used by the single-document generate/regenerate buttons they replace).
 */
export interface GenerationFormState {
  /**
   * Incremented on every submission. The form uses it as a React `key` so
   * the inputs remount and pick up the values echoed back below.
   */
  submission: number;
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    documentIds?: string[];
    topic?: string[];
    difficulty?: string[];
  };
  /** Echoed back on failure so the user does not lose what they picked. */
  values?: {
    documentIds?: string[];
    topic?: string;
    difficulty?: string;
  };
}

export const initialGenerationFormState: GenerationFormState = {
  submission: 0,
  status: "idle",
};
