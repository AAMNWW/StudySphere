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
  // pdfjs-dist's Node fallback resolves its worker via a bare specifier
  // (see src/lib/pdf.ts) — left to Next's default bundling that require got
  // rewritten to the wrong location. Excluding it here leaves the require
  // untouched so Node's normal module resolution finds the real file.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
