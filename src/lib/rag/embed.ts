import { getClient } from "@/lib/ai/client";

const EMBEDDING_MODEL = "gemini-embedding-001";

// gemini-embedding-001 supports Matryoshka representation learning — it can
// natively produce 3072, 1536, or 768 dimensions from the same underlying
// model, trading a little accuracy for a smaller, cheaper-to-search vector.
// 768 is pinned explicitly here because it must match the `vector(768)`
// column in prisma/schema.prisma exactly — pgvector's distance operators
// require both sides of a comparison to have the same dimensionality.
const OUTPUT_DIMENSIONALITY = 768;

/**
 * Converts text into embeddings: each string becomes a 768-number vector
 * positioned so that semantically similar text ends up numerically close
 * (measured by cosine distance — see src/lib/rag/retrieve.ts). One batched
 * API call regardless of how many texts are passed.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const ai = getClient();

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { outputDimensionality: OUTPUT_DIMENSIONALITY },
  });

  const embeddings = response.embeddings;

  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error("Gemini did not return an embedding for every text.");
  }

  return embeddings.map((embedding) => {
    if (!embedding.values) {
      throw new Error("Gemini returned an embedding with no values.");
    }
    return embedding.values;
  });
}
