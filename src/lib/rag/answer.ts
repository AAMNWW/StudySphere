import { getClient, MODEL } from "@/lib/ai/client";
import { requireText } from "@/lib/ai/summarize-document";

export interface AnswerChunk {
  content: string;
  fileName: string;
  pageNumber: number | null;
}

const SYSTEM_PROMPT =
  "You are a study assistant answering a student's question using only the " +
  "provided source excerpts. Answer only using their content; if the " +
  "answer isn't in the material, say so plainly. Keep answers concise, " +
  "and mention which source(s) you drew from.";

/**
 * Generates the final answer from retrieved chunks — the "generation" half
 * of Retrieval-Augmented Generation, after src/lib/rag/retrieve.ts has done
 * the "retrieval" half. Uses Gemini, same as the rest of the app — the
 * retrieval pipeline (chunking, embedding, vector search) is what actually
 * defines "RAG"; the generation call at the end is provider-agnostic and
 * could just as easily be swapped for any other chat-completion API by
 * changing only this one file.
 */
export async function answerFromChunks(
  chunks: AnswerChunk[],
  question: string,
): Promise<string> {
  const ai = getClient();

  const context = chunks
    .map((chunk) => {
      const location = chunk.pageNumber ? `, page ${chunk.pageNumber}` : "";
      return `Source: ${chunk.fileName}${location}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");

  const prompt = `${SYSTEM_PROMPT}\n\n${context}\n\n---\n\nQuestion: ${question}`;

  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return requireText(response);
}
