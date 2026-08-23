-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "earnedPoints" DOUBLE PRECISION,
ADD COLUMN     "maxPoints" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "creditHours" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "earnedPoints" DOUBLE PRECISION,
ADD COLUMN     "maxPoints" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CourseShare" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseShare_courseId_key" ON "CourseShare"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseShare_token_key" ON "CourseShare"("token");

-- AddForeignKey
ALTER TABLE "CourseShare" ADD CONSTRAINT "CourseShare_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
