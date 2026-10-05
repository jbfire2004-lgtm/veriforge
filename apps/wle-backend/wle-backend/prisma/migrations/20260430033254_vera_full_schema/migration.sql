/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `certificationId` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `isSafe` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Worker` table. All the data in the column will be lost.
  - The primary key for the `WorkerSiteAccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved` on the `WorkerSiteAccess` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WorkerSiteAccess` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `WorkerSiteAccess` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `WorkerSiteAccess` table. All the data in the column will be lost.
  - You are about to drop the `DigitalSignoff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentCertificationRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SafetyStation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EquipmentSafetyStatus" AS ENUM ('OK', 'NEEDS_INSPECTION', 'UNSAFE');

-- CreateEnum
CREATE TYPE "WorkerSiteStatus" AS ENUM ('ALLOWED', 'BANNED');

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "DigitalSignoff" DROP CONSTRAINT "DigitalSignoff_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "DigitalSignoff" DROP CONSTRAINT "DigitalSignoff_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "DigitalSignoff" DROP CONSTRAINT "DigitalSignoff_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentAssignment" DROP CONSTRAINT "EquipmentAssignment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentAssignment" DROP CONSTRAINT "EquipmentAssignment_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentAssignment" DROP CONSTRAINT "EquipmentAssignment_workerId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentCertificationRequirement" DROP CONSTRAINT "EquipmentCertificationRequirement_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentCertificationRequirement" DROP CONSTRAINT "EquipmentCertificationRequirement_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_siteId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_workerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_workerId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationLog" DROP CONSTRAINT "VerificationLog_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationLog" DROP CONSTRAINT "VerificationLog_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationLog" DROP CONSTRAINT "VerificationLog_workerId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationSession" DROP CONSTRAINT "VerificationSession_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationSession" DROP CONSTRAINT "VerificationSession_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Worker" DROP CONSTRAINT "Worker_companyId_fkey";

-- DropIndex
DROP INDEX "User_emailVerificationToken_key";

-- DropIndex
DROP INDEX "User_resetToken_key";

-- DropIndex
DROP INDEX "User_workerId_key";

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "logoUrl",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "certificationId",
DROP COLUMN "expiresAt",
DROP COLUMN "issuedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "isSafe",
DROP COLUMN "updatedAt",
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "safetyStatus" "EquipmentSafetyStatus" NOT NULL DEFAULT 'OK',
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "type",
ADD COLUMN     "assignedToId" INTEGER,
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "siteId" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "severity" SET DEFAULT 'LOW';

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "isActive",
DROP COLUMN "location",
DROP COLUMN "updatedAt",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TrainingRecord" DROP COLUMN "createdAt",
DROP COLUMN "issuedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "providerId" INTEGER,
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerified",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiresAt",
DROP COLUMN "updatedAt",
DROP COLUMN "workerId",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "createdAt",
DROP COLUMN "photoUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkerSiteAccess" DROP CONSTRAINT "WorkerSiteAccess_pkey",
DROP COLUMN "approved",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "notes",
ADD COLUMN     "status" "WorkerSiteStatus" NOT NULL DEFAULT 'ALLOWED',
ADD CONSTRAINT "WorkerSiteAccess_pkey" PRIMARY KEY ("workerId", "siteId");

-- DropTable
DROP TABLE "DigitalSignoff";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "EquipmentAssignment";

-- DropTable
DROP TABLE "EquipmentCertificationRequirement";

-- DropTable
DROP TABLE "IncidentReport";

-- DropTable
DROP TABLE "SafetyStation";

-- DropTable
DROP TABLE "VerificationLog";

-- DropTable
DROP TABLE "VerificationSession";

-- DropEnum
DROP TYPE "StationMode";

-- DropEnum
DROP TYPE "VerificationResult";

-- CreateTable
CREATE TABLE "IncidentComment" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "siteId" INTEGER,
    "companyId" INTEGER,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "autoStarted" BOOLEAN NOT NULL DEFAULT false,
    "autoEnded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentTrainingRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,

    CONSTRAINT "EquipmentTrainingRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreUseSignoff" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "supervisorId" INTEGER,
    "checklist" JSONB NOT NULL,
    "workerSignature" TEXT,
    "supervisorSignature" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PreUseSignoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "siteId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "investigatorId" INTEGER,
    "findings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readBy" JSONB,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatFile" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModerationEvent" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatModerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReaction" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "messageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_slug_key" ON "ChatChannel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_roomId_key" ON "ChatChannel"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentComment" ADD CONSTRAINT "IncidentComment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentComment" ADD CONSTRAINT "IncidentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTrainingRequirement" ADD CONSTRAINT "EquipmentTrainingRequirement_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTrainingRequirement" ADD CONSTRAINT "EquipmentTrainingRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreUseSignoff" ADD CONSTRAINT "PreUseSignoff_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreUseSignoff" ADD CONSTRAINT "PreUseSignoff_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreUseSignoff" ADD CONSTRAINT "PreUseSignoff_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatFile" ADD CONSTRAINT "ChatFile_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationEvent" ADD CONSTRAINT "ChatModerationEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationEvent" ADD CONSTRAINT "ChatModerationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
