-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'PRO', 'MASTER');

-- CreateEnum
CREATE TYPE "TopicSource" AS ENUM ('AI', 'MANUAL');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "sourceDocumentIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "storageUrl" TEXT;

-- AlterTable
ALTER TABLE "FlashcardSet" ADD COLUMN     "sourceDocumentIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topic" TEXT,
ALTER COLUMN "documentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "sourceDocumentIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topic" TEXT,
ALTER COLUMN "documentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weekNumber" INTEGER,
    "source" "TopicSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswerLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "quizId" TEXT,
    "topic" TEXT,
    "difficulty" "QuizDifficulty" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswerLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_courseId_idx" ON "Topic"("courseId");

-- CreateIndex
CREATE INDEX "QuizAnswerLog_userId_courseId_idx" ON "QuizAnswerLog"("userId", "courseId");

-- CreateIndex
CREATE INDEX "QuizAnswerLog_courseId_isCorrect_idx" ON "QuizAnswerLog"("courseId", "isCorrect");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswerLog" ADD CONSTRAINT "QuizAnswerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswerLog" ADD CONSTRAINT "QuizAnswerLog_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswerLog" ADD CONSTRAINT "QuizAnswerLog_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
