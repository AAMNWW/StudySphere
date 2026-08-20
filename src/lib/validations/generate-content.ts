import { z } from "zod";

import { QuizDifficulty } from "@/generated/prisma/enums";
import { MAX_SELECTABLE_DOCUMENTS } from "@/lib/generation-limits";

/**
 * Shared rules for the "generate quiz / flashcards / chat" forms: a
 * document selection (required for quiz/flashcards, optional for chat —
 * see `generateChatSchema`) and an optional free-text topic focus.
 */
const documentIdsField = z
  .array(z.string().min(1))
  .max(MAX_SELECTABLE_DOCUMENTS, `Choose at most ${MAX_SELECTABLE_DOCUMENTS} documents.`);

const topicField = z
  .string()
  .trim()
  .max(200, "Topic must be 200 characters or fewer.")
  .optional();

export const generateQuizSchema = z.object({
  documentIds: documentIdsField.min(1, "Choose at least one document."),
  topic: topicField,
  difficulty: z.enum(QuizDifficulty),
});
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;

export const generateFlashcardsSchema = z.object({
  documentIds: documentIdsField.min(1, "Choose at least one document."),
  topic: topicField,
});
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

export const generateChatSchema = z.object({
  // Empty selection is valid here — it means a general, ungrounded chat
  // ("AI tutor" style) rather than one grounded in specific documents.
  // Ignored entirely when ragMode is true (RAG search spans every indexed
  // document in the course, not a hand-picked subset).
  documentIds: documentIdsField,
  topic: topicField,
  ragMode: z.boolean(),
});
export type GenerateChatInput = z.infer<typeof generateChatSchema>;
