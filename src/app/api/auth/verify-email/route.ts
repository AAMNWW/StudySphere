import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

/** Consumes a verification-email link. Doesn't sign the user in — the
 * plaintext password from signup isn't available in this later request, so
 * this just marks the account verified and sends them to /login to sign in
 * normally (see src/app/(auth)/signup/actions.ts for why). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const siteUrl = getSiteUrl();

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/verify-email?error=missing`);
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const verificationToken = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return NextResponse.redirect(`${siteUrl}/verify-email?error=expired`);
  }

  await db.$transaction([
    db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationToken.delete({ where: { id: verificationToken.id } }),
  ]);

  return NextResponse.redirect(`${siteUrl}/login?verified=1`);
}
