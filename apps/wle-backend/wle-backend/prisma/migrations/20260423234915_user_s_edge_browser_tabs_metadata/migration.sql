/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `allowed` on the `SiteAccess` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `SiteAccess` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentId` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contractor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Credential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LedgerEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserProjects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiryDays` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grantedAt` to the `SiteAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteName` to the `SiteAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificationId` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuedAt` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Certification" DROP CONSTRAINT "Certification_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_userId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_contractorId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_courseId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingRecord" DROP CONSTRAINT "TrainingRecord_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingRecord" DROP CONSTRAINT "TrainingRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserProjects" DROP CONSTRAINT "_UserProjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserProjects" DROP CONSTRAINT "_UserProjects_B_fkey";

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "expiresAt",
DROP COLUMN "issuedAt",
DROP COLUMN "workerId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiryDays" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "SiteAccess" DROP COLUMN "allowed",
DROP COLUMN "reason",
ADD COLUMN     "grantedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "siteName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TrainingRecord" DROP COLUMN "assignmentId",
DROP COLUMN "completedAt",
DROP COLUMN "notes",
DROP COLUMN "score",
DROP COLUMN "userId",
ADD COLUMN     "certificationId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "qrCodeUrl" TEXT;

-- DropTable
DROP TABLE "Assignment";

-- DropTable
DROP TABLE "Contractor";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Credential";

-- DropTable
DROP TABLE "LedgerEntry";

-- DropTable
DROP TABLE "Module";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "QuizAttempt";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_UserProjects";

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
