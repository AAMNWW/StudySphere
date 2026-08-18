export { auth as proxy } from "@/auth";

// Optimistic pass only — reads the session cookie to redirect signed-out
// users away from protected pages before a render is attempted. Every
// mutating Server Action still checks auth itself (see requireUserId in
// src/lib/auth.ts): Next.js only runs Proxy for routes matched below, and
// Server Actions are POSTs to the page route, so a matcher gap here would
// silently stop protecting them otherwise.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
  ],
};
