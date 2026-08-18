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
};

export default nextConfig;
