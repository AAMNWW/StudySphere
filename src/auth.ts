import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import type { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { googleOAuthCredentials } from "@/lib/google-oauth";
import { loginSchema } from "@/lib/validations/auth";

// Auth.js's default Session shape doesn't carry the database id or role —
// this augmentation makes `session.user.id`/`session.user.role` available
// and typed. The JWT type already has a `Record<string, unknown>` index
// signature (see @auth/core/jwt), so `token.id`/`token.role` need a cast on
// read but not their own augmentation.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

/** Thrown from `authorize` below when the password matched but the account
 * hasn't clicked its verification email yet — distinguished from a generic
 * wrong-password `CredentialsSignin` so the login form
 * (src/app/(auth)/login/actions.ts) can show a "verify your email" message
 * with a resend link instead of "Invalid email or password." Checked after
 * the password compare, not before, so a wrong-password guess against an
 * unverified account still gets the generic message rather than confirming
 * the account exists and is unverified. */
export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

const googleCredentials = googleOAuthCredentials();

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        // No password means this is a Google-only account (see the
        // `signIn` callback below) — nothing to compare against.
        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );

        if (!passwordsMatch) {
          return null;
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
    // Registered only when GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are set.
    // Auth.js accepts a blank clientId without complaint and redirects to
    // Google with `client_id=`, which dead-ends on Google's
    // "Error 401: invalid_client" page; leaving the provider out instead
    // makes the misconfiguration visible in the app itself (the sign-in
    // button is hidden — see isGoogleOAuthConfigured in
    // src/lib/google-oauth.ts).
    ...(googleCredentials
      ? [
          Google({
            // Deliberately no extra `authorization.params.scope` here — this
            // provider is sign-in only (openid email profile, Google's
            // default). Google Calendar access is a separate, explicit
            // "Connect Google Calendar" OAuth flow from /settings (see
            // src/lib/google-calendar.ts) so signing in with Google never
            // silently grants calendar access.
            clientId: googleCredentials.clientId,
            clientSecret: googleCredentials.clientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Backs src/proxy.ts: `false` sends signed-out visitors to `pages.signIn`
    // for every route the proxy's matcher covers (already narrowed to
    // protected pages there, so this just needs to check for a session).
    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
    // Credentials already resolves to a real User row in `authorize`. For
    // Google, there's no Account/adapter table linking provider identities
    // to users (session strategy is plain JWT) — so link by email here
    // instead: reuse the existing row if one matches, or create a
    // password-less, pre-verified one (Google already confirmed the email).
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      const existing = await db.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
      });

      if (existing) {
        user.id = existing.id;
        (user as { role?: UserRole }).role = existing.role;
        return true;
      }

      const created = await db.user.create({
        data: {
          email: user.email,
          name: user.name,
          emailVerified: new Date(),
        },
        select: { id: true, role: true },
      });
      user.id = created.id;
      (user as { role?: UserRole }).role = created.role;
      return true;
    },
    // The default JWT/session only carry what the provider returns from
    // `authorize`, plus name/email/image. The database id and role have to
    // be copied across explicitly to be available on `session.user`.
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});
