import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";

import { chunkDocument } from "./chunk";
import { embedTexts } from "./embed";

// pgvector accepts a vector as the text literal "[0.1,0.2,...]" cast to
// ::vector — there's no native JS type for it, so the embedding array gets
// serialized to this string before being passed as a raw-SQL parameter.
function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

/**
 * Chunks and embeds a document, storing the results so "ask across my
 * whole course" chat (src/lib/rag/retrieve.ts) can find it. Safe to call
 * again on an already-indexed document — prior chunks are replaced.
 */
export async function indexDocument(documentId: string): Promise<{ chunkCount: number }> {
  const document = await db.document.findUniqueOrThrow({ where: { id: documentId } });

  const bytes = await readUploadedFile(document);
  const chunks = await chunkDocument(bytes, document.mimeType, document.fileName);
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));

  await db.$transaction(async (tx) => {
    // Plain Prisma delete works fine here — it never touches the
    // Unsupported embedding column, only raw SQL needs to for that.
    await tx.documentChunk.deleteMany({ where: { documentId } });

    for (const [index, chunk] of chunks.entries()) {
      // Prisma's cuid() default only fires through the normal Prisma
      // Client write path; this insert bypasses that, so the id is
      // generated here instead — any unique string works, cuid format
      // isn't required.
      const id = randomUUID();
      const vectorLiteral = toVectorLiteral(embeddings[index]);

      // Tagged-template $executeRaw parameterizes every ${...} value —
      // never string-interpolate raw SQL, which would be a SQL injection
      // hole the moment any of this text came from user input (it does:
      // chunk.text is extracted from an uploaded file).
      await tx.$executeRaw`
        INSERT INTO "DocumentChunk"
          (id, "documentId", "courseId", "chunkIndex", content, "pageNumber", embedding, "createdAt")
        VALUES
          (${id}, ${document.id}, ${document.courseId}, ${index}, ${chunk.text}, ${chunk.pageNumber ?? null}, ${vectorLiteral}::vector, now())
      `;
    }

    await tx.document.update({ where: { id: documentId }, data: { indexedAt: new Date() } });
  });

  return { chunkCount: chunks.length };
}
