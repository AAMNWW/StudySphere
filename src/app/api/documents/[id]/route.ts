import { readFile } from "node:fs/promises";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUploadedFilePath } from "@/lib/uploads";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/documents/[id]">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;

  const document = await db.document.findFirst({
    where: { id, course: { userId: session.user.id } },
  });

  if (!document) {
    return new Response(null, { status: 404 });
  }

  let bytes: Buffer;

  try {
    bytes = await readFile(
      getUploadedFilePath(document.courseId, document.storedName),
    );
  } catch (error) {
    console.error("Failed to read uploaded file", error);
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      "Content-Length": String(document.sizeBytes),
    },
  });
}
