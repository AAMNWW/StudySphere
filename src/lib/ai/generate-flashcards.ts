import { createUserContent, Type } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";
import { requireText } from "./summarize-document";

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export interface GenerateFlashcardsOptions {
  /** Optional free-text focus, e.g. "the French Revolution". */
  topic?: string;
}

const CARD_COUNT = 10;

const FLASHCARD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    cards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING, description: "A short term or question." },
          back: { type: Type.STRING, description: "The definition or answer." },
        },
        required: ["front", "back"],
      },
    },
  },
  required: ["cards"],
};

/** Generates a set of flashcards over one or more documents with Gemini. */
export async function generateFlashcards(
  documents: SourceDocument[],
  options: GenerateFlashcardsOptions = {},
): Promise<GeneratedFlashcard[]> {
  const ai = getClient();
  const parts = await getDocumentsContent(documents);

  const scope =
    documents.length > 1
      ? `across the ${documents.length} provided documents`
      : "in the provided document";
  const topicClause = options.topic
    ? ` Focus specifically on this topic: "${options.topic}"; draw cards ` +
      `only from material relevant to it.`
    : "";

  const prompt =
    `Create ${CARD_COUNT} flashcards covering the key concepts ${scope}.` +
    `${topicClause} Each card has a short term or question on the front and ` +
    `its definition or answer on the back.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent([prompt, ...parts]),
    config: { responseMimeType: "application/json", responseSchema: FLASHCARD_SCHEMA },
  });

  const parsed = JSON.parse(requireText(response)) as {
    cards: GeneratedFlashcard[];
  };

  const cards = parsed.cards.filter(
    (card) =>
      typeof card.front === "string" &&
      card.front.trim().length > 0 &&
      typeof card.back === "string" &&
      card.back.trim().length > 0,
  );

  if (cards.length === 0) {
    throw new Error("Gemini did not return any usable flashcards.");
  }

  return cards.slice(0, CARD_COUNT);
}
