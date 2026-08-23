-- CreateEnum
CREATE TYPE "AccentColor" AS ENUM ('GRAPHITE', 'PURPLE', 'BLUE', 'GREEN', 'ORANGE', 'PINK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accentColor" "AccentColor" NOT NULL DEFAULT 'GRAPHITE';
