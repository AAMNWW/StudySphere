import { getClient, MODEL, withGeminiRetry } from "./client";
import { requireText } from "./summarize-document";

/**
 * Suggests a short, concrete way to get started on an assignment — not a
 * generated answer, just a plan. No document content is involved, so this
 * (like the AI tutor) sends only the assignment's own title/description.
 */
export async function getAssignmentHelp(
  courseTitle: string,
  assignmentTitle: string,
  assignmentDescription: string | null,
): Promise<string> {
  const ai = getClient();

  const prompt =
    `A student studying "${courseTitle}" has this assignment: "${assignmentTitle}".` +
    (assignmentDescription ? `\n\nDescription: ${assignmentDescription}` : "") +
    "\n\nSuggest a short, concrete way to get started — break it into 3-5 " +
    "actionable steps as a plain numbered list. Don't do the assignment for " +
    "them; help them see how to approach it.";

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({ model: MODEL, contents: prompt }),
  );
  return requireText(response);
}
