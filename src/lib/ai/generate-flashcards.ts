import { createUserContent, Type } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentContent } from "./document-content";
import { requireText } from "./summarize-document";

export interface GeneratedFlashcard {
  front: string;
  back: string;
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

/** Generates a set of flashcards over a document's content with Gemini. */
export async function generateFlashcards(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<GeneratedFlashcard[]> {
  const ai = getClient();
  const document = await getDocumentContent(bytes, mimeType, fileName);

  const prompt =
    `Create ${CARD_COUNT} flashcards covering this document's key ` +
    `concepts. Each card has a short term or question on the front and its ` +
    `definition or answer on the back.`;

  const contents =
    document.kind === "part"
      ? createUserContent([prompt, document.part])
      : `${prompt}\n\n---\n\n${document.text}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
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
