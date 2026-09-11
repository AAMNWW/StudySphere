# Local-development image only — production still deploys on Vercel.
# Runs `next dev` against the docker-compose `postgres` service, with the
# repo bind-mounted for hot reload (see docker-compose.yml).
FROM node:24-slim

# Prisma's engine binaries need OpenSSL, which the slim base image doesn't
# ship with.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copied ahead of the rest of the source so `npm install` (and its
# `postinstall` -> `prisma generate`, which needs the schema) is cached in
# its own layer and only reruns when dependencies actually change.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000

# Regenerates the Prisma client on every start (cheap) rather than relying
# on the one baked in at image-build time, which the bind mount in
# docker-compose.yml would otherwise shadow with whatever (or nothing) the
# host's src/generated/prisma contains. migrate deploy applies whatever
# committed migrations the postgres container's volume doesn't have yet —
# a no-op once it's caught up, so it's safe to run on every start.
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]
