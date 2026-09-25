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
  // officeparser: bundled, its `OfficeConverter` export came through as
  // undefined, which broke "Index for search" (src/lib/rag/chunk.ts) —
  // loading it with Node's own resolution keeps the full export set.
  serverExternalPackages: ["pdfjs-dist", "officeparser"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No embedding in other sites' frames (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
