-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "atsError" TEXT,
ADD COLUMN     "atsFeedback" TEXT,
ADD COLUMN     "atsMatchedKeywords" TEXT[],
ADD COLUMN     "atsMissingKeywords" TEXT[],
ADD COLUMN     "atsScore" INTEGER,
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "coverLetterError" TEXT;
