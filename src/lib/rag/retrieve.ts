import { db } from "@/lib/db";

import { embedTexts } from "./embed";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  similarity: number;
}

const DEFAULT_TOP_K = 6;

/**
 * Finds the chunks most relevant to a question, scoped to one course.
 *
 * `<=>` is pgvector's cosine *distance* operator — 0 for identical
 * direction, 2 for opposite. `1 - distance` turns that into a similarity
 * score where higher is better, matching how everyone talks about search
 * relevance. Ordering by the raw distance (ascending) and computing
 * similarity only for display is equivalent and marginally cheaper, but
 * returning similarity directly keeps the call site simple.
 *
 * One query does both the nearest-neighbor search AND the content fetch —
 * a genuine simplification pgvector gives you over a separate vector-DB
 * design, which would need a second round trip to fetch text by id.
 */
export async function retrieveRelevantChunks(
  courseId: string,
  query: string,
  topK: number = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const [queryEmbedding] = await embedTexts([query]);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  return db.$queryRaw<RetrievedChunk[]>`
    SELECT
      id,
      "documentId",
      content,
      "pageNumber",
      1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE "courseId" = ${courseId}
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;
}
