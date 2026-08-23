import bcrypt from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
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

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );

        if (!passwordsMatch) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Backs src/proxy.ts: `false` sends signed-out visitors to `pages.signIn`
    // for every route the proxy's matcher covers (already narrowed to
    // protected pages there, so this just needs to check for a session).
    authorized({ auth: session }) {
      return Boolean(session?.user);
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
