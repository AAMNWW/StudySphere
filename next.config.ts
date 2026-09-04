import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Study documents (PDF/DOCX/PPTX) run bigger than the 1MB default;
      // see src/lib/uploads.ts for the per-file limit enforced on top of
      // this framework-level cap.
      bodySizeLimit: "20mb",
    },
  },
  // Both packages do a native Node `require()` at runtime (pdfjs-dist for
  // @napi-rs/canvas's prebuilt platform binary, to polyfill DOMMatrix).
  // Left to the default bundling, Next tries to statically bundle that
  // require — which breaks native-binary resolution, so the binary silently
  // fails to load in the deployed function even though it's a real
  // dependency ("Cannot find module '@napi-rs/canvas'", then `DOMMatrix is
  // not defined` when pdfjs-dist's own fallback polyfill doesn't cover the
  // code path this app exercises). Excluding them here leaves the require
  // untouched so Vercel's file-tracer includes the real module instead.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
};

export default nextConfig;
