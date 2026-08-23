-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- Bootstrap the one admin account. One-time, by design: migrations apply
-- exactly once per database, so this can't be used as a general promotion
-- mechanism — see prisma/schema.prisma's UserRole doc comment.
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'ai@aurmak.com';
