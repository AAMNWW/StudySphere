import { auth } from "@/auth";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/documents/[id]">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;

  // The owner can always download; anyone else needs the course's sharing
  // to be turned on (see src/app/courses/[id]/actions.ts's
  // enable/disableCourseShare) — the specific share token isn't checked
  // here, since a cuid document id is already effectively a bearer secret,
  // same trust model as the share link itself.
  const document = await db.document.findFirst({
    where: {
      id,
      course: { OR: [{ userId: session.user.id }, { share: { isNot: null } }] },
    },
  });

  if (!document) {
    return new Response(null, { status: 404 });
  }

  let bytes: Buffer;

  try {
    bytes = await readUploadedFile(document);
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
