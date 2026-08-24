import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/uploads-shared";

// Authorizes client-side (browser-to-Blob) uploads for course documents. The
// bytes never pass through this function — only this small token exchange
// does — which is what lets a 15MB PDF get past Vercel's ~4.5MB Function
// request-body cap. See UploadDocumentForm for the client side of this flow.
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const userId = session.user.id;
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = clientPayload ? (JSON.parse(clientPayload) as { courseId?: string }) : null;
        const courseId = payload?.courseId;

        if (typeof courseId !== "string" || !courseId) {
          throw new Error("Missing course id.");
        }

        const course = await db.course.findFirst({
          where: { id: courseId, userId },
          select: { id: true },
        });

        if (!course) {
          throw new Error("Course not found.");
        }

        return {
          allowedContentTypes: Object.keys(ALLOWED_FILE_TYPES),
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not authorize upload." },
      { status: 400 },
    );
  }
}
