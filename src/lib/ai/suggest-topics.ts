import { createUserContent, Type } from "@google/genai";

import { getClient, MODEL, withGeminiRetry } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";
import { requireText } from "./summarize-document";

export interface SuggestedTopic {
  title: string;
  description: string;
}

const MIN_TOPICS = 3;
const MAX_TOPICS = 8;

const TOPIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A short topic name, e.g. 'Cellular respiration'.",
          },
          description: {
            type: Type.STRING,
            description: "One or two sentences on what to study and why it matters.",
          },
        },
        required: ["title", "description"],
      },
      minItems: String(MIN_TOPICS),
      maxItems: String(MAX_TOPICS),
    },
  },
  required: ["topics"],
};

/**
 * Proposes a weekly study roadmap for a course from its documents' content.
 * Purely a suggestion — callers decide which (if any) to save as Topic rows.
 */
export async function suggestCourseTopics(
  documents: SourceDocument[],
): Promise<SuggestedTopic[]> {
  const ai = getClient();
  const parts = await getDocumentsContent(documents);

  const prompt =
    "Based on the material below, propose the main topics a student should " +
    `study for this course, ordered roughly the way they'd naturally be ` +
    `covered week to week. Return between ${MIN_TOPICS} and ${MAX_TOPICS} ` +
    "topics. Each topic needs a short title and a one-to-two sentence " +
    "description of what to focus on and why it matters.";

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([prompt, ...parts]),
      config: { responseMimeType: "application/json", responseSchema: TOPIC_SCHEMA },
    }),
  );

  const parsed = JSON.parse(requireText(response)) as { topics: SuggestedTopic[] };

  const topics = parsed.topics.filter(
    (topic) => topic.title?.trim().length > 0 && topic.description?.trim().length > 0,
  );

  if (topics.length === 0) {
    throw new Error("Gemini did not return any usable topics.");
  }

  return topics;
}
