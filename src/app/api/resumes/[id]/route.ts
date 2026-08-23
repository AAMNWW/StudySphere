import { auth } from "@/auth";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/resumes/[id]">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;

  const resume = await db.resume.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!resume) {
    return new Response(null, { status: 404 });
  }

  let bytes: Buffer;

  try {
    bytes = await readResumeFile(resume);
  } catch (error) {
    console.error("Failed to read resume file", error);
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": resume.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(resume.fileName)}"`,
      "Content-Length": String(resume.sizeBytes),
    },
  });
}
