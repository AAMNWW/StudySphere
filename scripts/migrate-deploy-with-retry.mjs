// `prisma migrate deploy` runs on every production build (see package.json
// "build"), which means a single transient DB connection blip fails the
// entire deployment even when there's no new migration to apply. That's
// been happening repeatedly against this app's db.prisma.io database.
// Retrying a few times with a short backoff absorbs exactly that kind of
// blip without masking a real, persistent connection problem — it still
// exits non-zero (failing the build, as it should) if the DB stays
// unreachable across every attempt.
import { spawnSync } from "node:child_process";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status === 0) {
    process.exit(0);
  }

  if (attempt < MAX_ATTEMPTS) {
    console.error(
      `prisma migrate deploy failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${RETRY_DELAY_MS / 1000}s...`,
    );
    await sleep(RETRY_DELAY_MS);
  }
}

console.error(`prisma migrate deploy failed after ${MAX_ATTEMPTS} attempts.`);
process.exit(1);
