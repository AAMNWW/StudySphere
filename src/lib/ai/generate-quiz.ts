import { createUserContent, Type } from "@google/genai";

import type { QuizDifficulty } from "@/generated/prisma/enums";

import { getClient, MODEL } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";
import { requireText } from "./summarize-document";

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GenerateQuizOptions {
  difficulty: QuizDifficulty;
  /** Optional free-text focus, e.g. "the French Revolution". */
  topic?: string;
}

const QUESTION_COUNT = 5;
const OPTION_COUNT = 4;

const DIFFICULTY_PROMPTS: Record<QuizDifficulty, string> = {
  EASY:
    "Easy difficulty: test only the most basic recall of explicitly stated " +
    "facts and definitions. Avoid multi-step reasoning or trick options.",
  MEDIUM:
    "Medium difficulty: test solid understanding of the material, including " +
    "straightforward application of a concept, not just verbatim recall.",
  HARD:
    "Hard difficulty: require connecting two or more ideas from the " +
    "material, careful reading, and plausible-but-wrong distractor options.",
  PRO:
    "Pro difficulty: require synthesis across the whole material, edge " +
    "cases, and distractors that reflect common misconceptions an expert " +
    "would catch.",
  MASTER:
    "Master difficulty: graduate/expert-level rigor — require deep " +
    "inference beyond what's explicitly stated and nuanced distinctions " +
    "between very similar options. No purely factual recall questions.",
};

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

/** Generates a multiple-choice quiz over one or more documents with Gemini. */
export async function generateQuizQuestions(
  documents: SourceDocument[],
  options: GenerateQuizOptions,
): Promise<GeneratedQuizQuestion[]> {
  const ai = getClient();
  const parts = await getDocumentsContent(documents);

  const scope =
    documents.length > 1
      ? `across the ${documents.length} provided documents`
      : "in the provided document";
  const topicClause = options.topic
    ? ` Focus specifically on this topic: "${options.topic}". Draw questions ` +
      `only from material relevant to it; ignore unrelated sections.`
    : "";

  const prompt =
    `Write ${QUESTION_COUNT} multiple-choice quiz questions testing ` +
    `understanding of the key points ${scope}. ` +
    `${DIFFICULTY_PROMPTS[options.difficulty]}${topicClause} ` +
    `Each question needs exactly ${OPTION_COUNT} options with exactly one ` +
    `correct answer.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent([prompt, ...parts]),
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
