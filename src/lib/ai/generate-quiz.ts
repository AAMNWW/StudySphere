import { createUserContent, Type } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentContent } from "./document-content";
import { requireText } from "./summarize-document";

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTION_COUNT = 5;
const OPTION_COUNT = 4;

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: String(OPTION_COUNT),
            maxItems: String(OPTION_COUNT),
          },
          correctIndex: {
            type: Type.INTEGER,
            description: `Index (0-${OPTION_COUNT - 1}) of the correct option in \`options\`.`,
          },
        },
        required: ["question", "options", "correctIndex"],
      },
    },
  },
  required: ["questions"],
};

/** Generates a multiple-choice quiz over a document's content with Gemini. */
export async function generateQuizQuestions(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<GeneratedQuizQuestion[]> {
  const ai = getClient();
  const document = await getDocumentContent(bytes, mimeType, fileName);

  const prompt =
    `Write ${QUESTION_COUNT} multiple-choice quiz questions testing ` +
    `understanding of this document's key points. Each question needs ` +
    `exactly ${OPTION_COUNT} options with exactly one correct answer.`;

  const contents =
    document.kind === "part"
      ? createUserContent([prompt, document.part])
      : `${prompt}\n\n---\n\n${document.text}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { responseMimeType: "application/json", responseSchema: QUIZ_SCHEMA },
  });

  const parsed = JSON.parse(requireText(response)) as {
    questions: GeneratedQuizQuestion[];
  };

  const questions = parsed.questions.filter(
    (q) =>
      typeof q.question === "string" &&
      q.question.trim().length > 0 &&
      Array.isArray(q.options) &&
      q.options.length === OPTION_COUNT &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex < OPTION_COUNT,
  );

  if (questions.length === 0) {
    throw new Error("Gemini did not return any usable quiz questions.");
  }

  return questions.slice(0, QUESTION_COUNT);
}
