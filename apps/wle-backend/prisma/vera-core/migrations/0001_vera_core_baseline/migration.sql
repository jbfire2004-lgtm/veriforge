-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'UNION_HALL_ADMIN', 'COMPANY_ADMIN', 'ADMIN', 'SUPERVISOR', 'PROJECT_MANAGER', 'WORKER', 'CONTRACTOR_ADMIN', 'CONTRACTOR_USER', 'TRAINING_PROVIDER_ADMIN', 'TRAINING_INSTRUCTOR');

-- CreateEnum
CREATE TYPE "ProviderApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InstructorQualificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TrainingValidationOutcome" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "TrainingValidationSubject" AS ENUM ('TRAINING_RECORD', 'PROVIDER', 'INSTRUCTOR', 'CERTIFICATE', 'COURSE');

-- CreateEnum
CREATE TYPE "RegulatoryComplianceStatus" AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TrainingCredentialNftMintStatus" AS ENUM ('PENDING_MINT', 'MINTED', 'FAILED', 'REVOKED');

-- CreateEnum
CREATE TYPE "NftMintJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'REMOVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LinkComplianceStatus" AS ENUM ('COMPLIANT', 'NEEDS_ATTENTION', 'NON_COMPLIANT', 'LOCKED_OUT');

-- CreateEnum
CREATE TYPE "UnionMembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ENDED');

-- CreateEnum
CREATE TYPE "TrainingAttestationRole" AS ENUM ('SUPERVISOR', 'WORKER', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "UnionHallTrainingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PUSHED');

-- CreateEnum
CREATE TYPE "EventOutboxStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'DLQ');

-- CreateEnum
CREATE TYPE "CoreOfflineSyncStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "AcpTenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'WORKER',
    "companyId" INTEGER,
    "unionHallId" INTEGER,
    "trainingProviderId" INTEGER,
    "acp_tenant_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "city" TEXT,
    "province" TEXT,
    "industry" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLink" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "role" TEXT,
    "trade" TEXT,
    "visibilityRules" JSONB,

    CONSTRAINT "CompanyLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "companyId" INTEGER,
    "photoUrl" TEXT,
    "userId" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "qrToken" TEXT,
    "unionNumber" TEXT,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "providerId" INTEGER,
    "trainingProviderId" INTEGER,
    "courseId" INTEGER,
    "instructorId" INTEGER,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateNumber" TEXT,
    "certificateUrl" TEXT,
    "certificateQrToken" TEXT,
    "certificateSignedAt" TIMESTAMP(3),
    "certificateSignedByInstructorId" INTEGER,
    "completedAt" TIMESTAMP(3),
    "lastVerificationStatus" TEXT,
    "lastVerificationChecks" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "ingestionRunId" INTEGER,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingVerificationRun" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "authenticityStatus" TEXT NOT NULL,
    "regulatoryStatus" TEXT,
    "standardsOutcome" TEXT,
    "jurisdictionCode" TEXT,
    "checks" JSONB,
    "propagation" JSONB,
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingVerificationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAttestation" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "attestedByWorkerId" INTEGER NOT NULL,
    "role" "TrainingAttestationRole" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingAttestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "qrToken" TEXT,
    "approvalStatus" "ProviderApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSyncConfig" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "syncMode" TEXT NOT NULL DEFAULT 'webhook',
    "pollUrl" TEXT,
    "pollIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "apiKeyEnvVar" TEXT,
    "webhookSecret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastPollAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderSyncConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSyncRun" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsVerified" INTEGER NOT NULL DEFAULT 0,
    "recordsPushed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingInstructor" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "qualifiedCourseCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualificationExpiresAt" TIMESTAMP(3),
    "qualificationStatus" "InstructorQualificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCourse" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "certificationId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationHours" DOUBLE PRECISION,
    "validityDays" INTEGER,
    "contentText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingValidationResult" (
    "id" SERIAL NOT NULL,
    "subjectType" "TrainingValidationSubject" NOT NULL,
    "outcome" "TrainingValidationOutcome" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "jurisdictionCode" TEXT,
    "matchedStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "details" JSONB,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedBy" INTEGER,
    "trainingRecordId" INTEGER,
    "trainingProviderId" INTEGER,
    "instructorId" INTEGER,
    "courseId" INTEGER,
    "certificateQrToken" TEXT,

    CONSTRAINT "TrainingValidationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_verification_decisions" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "regulatory_compliance_status" "RegulatoryComplianceStatus" NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "jurisdiction_code" TEXT NOT NULL,
    "matched_standards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jurisdiction_coverage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validation_result_id" INTEGER,
    "recommended_action" TEXT NOT NULL,
    "decision_hash" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulatory_verification_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerWalletItem" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "catalogTypeKey" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "trainingRecordId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerWalletItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_wallet_bundles" (
    "id" TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "bundle_hash" TEXT NOT NULL,
    "qr_payload" TEXT,
    "payload" JSONB NOT NULL,
    "device_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_wallet_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificationId" INTEGER,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_credential_nfts" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "regulatory_verification_decision_id" INTEGER NOT NULL,
    "nft_token_id" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'vera-stub',
    "transaction_hash" TEXT,
    "mint_status" "TrainingCredentialNftMintStatus" NOT NULL DEFAULT 'PENDING_MINT',
    "regulatory_decision_hash" TEXT NOT NULL,
    "original_document_hash" TEXT,
    "metadata" JSONB,
    "minted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_credential_nfts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_mint_jobs" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "status" "NftMintJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "nft_mint_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "localNumber" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnionHall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionMembership" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "memberNumber" TEXT,
    "status" "UnionMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "UnionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionDispatch" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "dispatchedBy" INTEGER,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recalledAt" TIMESTAMP(3),

    CONSTRAINT "UnionDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHallProviderLink" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingProviderId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnionHallProviderLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHallTrainingReceipt" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "status" "UnionHallTrainingStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" INTEGER,
    "validatedAt" TIMESTAMP(3),
    "pushedAt" TIMESTAMP(3),
    "pushedCompanyId" INTEGER,
    "pushedProjectId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnionHallTrainingReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "type" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "readAt" TIMESTAMP(3),
    "dedupeKey" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "userId" INTEGER NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inspectionDue" BOOLEAN NOT NULL DEFAULT true,
    "competencyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "ppeExpiry" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceDue" BOOLEAN NOT NULL DEFAULT true,
    "calibrationDue" BOOLEAN NOT NULL DEFAULT true,
    "assignmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "phone" TEXT,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "natsSubject" TEXT NOT NULL,
    "partitionKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" "EventOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_dead_letter" (
    "id" TEXT NOT NULL,
    "outboxId" TEXT,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumerGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_dead_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "tenantId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_offline_sync_batches" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "worker_id" INTEGER,
    "company_id" INTEGER,
    "module_type" TEXT NOT NULL,
    "status" "CoreOfflineSyncStatus" NOT NULL DEFAULT 'PENDING',
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "submitted_by_id" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "core_offline_sync_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_offline_sync_conflicts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "module_type" TEXT NOT NULL,
    "record_key" TEXT NOT NULL,
    "local_value" JSONB NOT NULL DEFAULT '{}',
    "server_value" JSONB NOT NULL DEFAULT '{}',
    "resolved_value" JSONB,
    "resolved_by_id" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_offline_sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vera_api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "company_id" INTEGER,
    "training_provider_id" INTEGER,
    "scopes" TEXT[] DEFAULT ARRAY['read']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vera_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" INTEGER,
    "status" "AcpTenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_user_roles" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'access',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "acp_role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "_CourseInstructors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "idx_company_link_company_active" ON "CompanyLink"("companyId", "active");

-- CreateIndex
CREATE INDEX "idx_company_link_worker_active" ON "CompanyLink"("workerId", "active");

-- CreateIndex
CREATE INDEX "idx_company_link_worker_company" ON "CompanyLink"("workerId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_email_key" ON "Worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_qrToken_key" ON "Worker"("qrToken");

-- CreateIndex
CREATE INDEX "idx_worker_company" ON "Worker"("companyId");

-- CreateIndex
CREATE INDEX "idx_worker_name" ON "Worker"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "idx_worker_phone" ON "Worker"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");

-- CreateIndex
CREATE INDEX "idx_project_company_status" ON "Project"("companyId", "status");

-- CreateIndex
CREATE INDEX "idx_project_site" ON "Project"("siteId");

-- CreateIndex
CREATE INDEX "idx_project_assignment_project_status" ON "ProjectAssignment"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_project_assignment_worker_status" ON "ProjectAssignment"("workerId", "status");

-- CreateIndex
CREATE INDEX "idx_project_assignment_company" ON "ProjectAssignment"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRecord_certificateQrToken_key" ON "TrainingRecord"("certificateQrToken");

-- CreateIndex
CREATE INDEX "TrainingRecord_workerId_expiresAt_idx" ON "TrainingRecord"("workerId", "expiresAt");

-- CreateIndex
CREATE INDEX "TrainingRecord_certificationId_idx" ON "TrainingRecord"("certificationId");

-- CreateIndex
CREATE INDEX "TrainingRecord_providerId_idx" ON "TrainingRecord"("providerId");

-- CreateIndex
CREATE INDEX "TrainingRecord_trainingProviderId_idx" ON "TrainingRecord"("trainingProviderId");

-- CreateIndex
CREATE INDEX "TrainingRecord_courseId_idx" ON "TrainingRecord"("courseId");

-- CreateIndex
CREATE INDEX "TrainingRecord_companyId_idx" ON "TrainingRecord"("companyId");

-- CreateIndex
CREATE INDEX "TrainingRecord_projectId_idx" ON "TrainingRecord"("projectId");

-- CreateIndex
CREATE INDEX "TrainingRecord_ingestionRunId_idx" ON "TrainingRecord"("ingestionRunId");

-- CreateIndex
CREATE INDEX "TrainingRecord_certificateQrToken_idx" ON "TrainingRecord"("certificateQrToken");

-- CreateIndex
CREATE INDEX "TrainingRecord_lastVerificationStatus_idx" ON "TrainingRecord"("lastVerificationStatus");

-- CreateIndex
CREATE INDEX "TrainingVerificationRun_trainingRecordId_createdAt_idx" ON "TrainingVerificationRun"("trainingRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_training_attestation_record_created" ON "TrainingAttestation"("trainingRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingAttestation_attestedByWorkerId_idx" ON "TrainingAttestation"("attestedByWorkerId");

-- CreateIndex
CREATE INDEX "TrainingAttestation_createdAt_idx" ON "TrainingAttestation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_code_key" ON "TrainingProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_email_key" ON "TrainingProvider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_qrToken_key" ON "TrainingProvider"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSyncConfig_providerId_key" ON "ProviderSyncConfig"("providerId");

-- CreateIndex
CREATE INDEX "ProviderSyncRun_providerId_startedAt_idx" ON "ProviderSyncRun"("providerId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingInstructor_userId_key" ON "TrainingInstructor"("userId");

-- CreateIndex
CREATE INDEX "TrainingInstructor_providerId_active_idx" ON "TrainingInstructor"("providerId", "active");

-- CreateIndex
CREATE INDEX "TrainingCourse_providerId_active_idx" ON "TrainingCourse"("providerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCourse_providerId_code_key" ON "TrainingCourse"("providerId", "code");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_subjectType_outcome_validatedAt_idx" ON "TrainingValidationResult"("subjectType", "outcome", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_trainingRecordId_validatedAt_idx" ON "TrainingValidationResult"("trainingRecordId", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_trainingProviderId_validatedAt_idx" ON "TrainingValidationResult"("trainingProviderId", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_certificateQrToken_idx" ON "TrainingValidationResult"("certificateQrToken");

-- CreateIndex
CREATE INDEX "regulatory_decision_record_created_idx" ON "regulatory_verification_decisions"("training_record_id", "created_at");

-- CreateIndex
CREATE INDEX "regulatory_decision_status_idx" ON "regulatory_verification_decisions"("regulatory_compliance_status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerWalletItem_trainingRecordId_key" ON "WorkerWalletItem"("trainingRecordId");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_workerId_status_idx" ON "WorkerWalletItem"("workerId", "status");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_companyId_catalogTypeKey_idx" ON "WorkerWalletItem"("companyId", "catalogTypeKey");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_trainingRecordId_idx" ON "WorkerWalletItem"("trainingRecordId");

-- CreateIndex
CREATE INDEX "worker_wallet_bundles_worker_id_synced_at_idx" ON "worker_wallet_bundles"("worker_id", "synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "worker_wallet_bundles_worker_id_version_key" ON "worker_wallet_bundles"("worker_id", "version");

-- CreateIndex
CREATE INDEX "idx_credential_worker" ON "Credential"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "training_credential_nfts_training_record_id_key" ON "training_credential_nfts"("training_record_id");

-- CreateIndex
CREATE INDEX "training_credential_nft_worker_idx" ON "training_credential_nfts"("worker_id");

-- CreateIndex
CREATE INDEX "training_credential_nft_mint_status_idx" ON "training_credential_nfts"("mint_status");

-- CreateIndex
CREATE UNIQUE INDEX "nft_mint_jobs_idempotency_key_key" ON "nft_mint_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "nft_mint_job_status_created_idx" ON "nft_mint_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_union_membership_worker_status" ON "UnionMembership"("workerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "union_membership_hall_worker" ON "UnionMembership"("unionHallId", "workerId");

-- CreateIndex
CREATE INDEX "idx_union_dispatch_hall_date" ON "UnionDispatch"("unionHallId", "dispatchedAt");

-- CreateIndex
CREATE INDEX "idx_union_dispatch_worker" ON "UnionDispatch"("workerId");

-- CreateIndex
CREATE INDEX "UnionHallProviderLink_unionHallId_active_idx" ON "UnionHallProviderLink"("unionHallId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "union_hall_provider_unique" ON "UnionHallProviderLink"("unionHallId", "trainingProviderId");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_status_idx" ON "UnionHallTrainingReceipt"("unionHallId", "status");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_createdAt_idx" ON "UnionHallTrainingReceipt"("unionHallId", "createdAt");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_trainingRecordId_idx" ON "UnionHallTrainingReceipt"("trainingRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "union_hall_training_receipt_unique" ON "UnionHallTrainingReceipt"("unionHallId", "trainingRecordId");

-- CreateIndex
CREATE INDEX "idx_notification_user_created" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_notification_user_read" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_dedupe_key" ON "Notification"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "event_outbox_idempotencyKey_key" ON "event_outbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "event_outbox_status_nextRetryAt_createdAt_idx" ON "event_outbox"("status", "nextRetryAt", "createdAt");

-- CreateIndex
CREATE INDEX "event_outbox_eventName_createdAt_idx" ON "event_outbox"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "event_dead_letter_eventName_createdAt_idx" ON "event_dead_letter"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_log_user_created" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant_created" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_log_entity" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "acp_audit_logs_tenant_id_created_at_idx" ON "acp_audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "acp_audit_logs_entity_type_entity_id_idx" ON "acp_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "core_offline_sync_batches_device_id_status_idx" ON "core_offline_sync_batches"("device_id", "status");

-- CreateIndex
CREATE INDEX "core_offline_sync_batches_company_id_module_type_submitted__idx" ON "core_offline_sync_batches"("company_id", "module_type", "submitted_at");

-- CreateIndex
CREATE INDEX "core_offline_sync_conflicts_device_id_resolved_at_idx" ON "core_offline_sync_conflicts"("device_id", "resolved_at");

-- CreateIndex
CREATE INDEX "core_offline_sync_conflicts_module_type_record_key_idx" ON "core_offline_sync_conflicts"("module_type", "record_key");

-- CreateIndex
CREATE UNIQUE INDEX "vera_api_keys_key_hash_key" ON "vera_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "vera_api_keys_key_prefix_active_idx" ON "vera_api_keys"("key_prefix", "active");

-- CreateIndex
CREATE INDEX "vera_api_keys_company_id_active_idx" ON "vera_api_keys"("company_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "acp_tenants_slug_key" ON "acp_tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "acp_tenants_company_id_key" ON "acp_tenants"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_roles_tenant_id_key_key" ON "acp_roles"("tenant_id", "key");

-- CreateIndex
CREATE INDEX "acp_user_roles_user_id_idx" ON "acp_user_roles"("user_id");

-- CreateIndex
CREATE INDEX "acp_user_roles_tenant_id_idx" ON "acp_user_roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_user_roles_user_id_role_id_tenant_id_key" ON "acp_user_roles"("user_id", "role_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_permissions_key_key" ON "acp_permissions"("key");

-- CreateIndex
CREATE INDEX "acp_permissions_module_idx" ON "acp_permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseInstructors_AB_unique" ON "_CourseInstructors"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseInstructors_B_index" ON "_CourseInstructors"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_acp_tenant_id_fkey" FOREIGN KEY ("acp_tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificateSignedByInstructorId_fkey" FOREIGN KEY ("certificateSignedByInstructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingVerificationRun" ADD CONSTRAINT "TrainingVerificationRun_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_attestedByWorkerId_fkey" FOREIGN KEY ("attestedByWorkerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSyncConfig" ADD CONSTRAINT "ProviderSyncConfig_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSyncRun" ADD CONSTRAINT "ProviderSyncRun_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_verification_decisions" ADD CONSTRAINT "regulatory_verification_decisions_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_verification_decisions" ADD CONSTRAINT "regulatory_verification_decisions_validation_result_id_fkey" FOREIGN KEY ("validation_result_id") REFERENCES "TrainingValidationResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_wallet_bundles" ADD CONSTRAINT "worker_wallet_bundles_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_wallet_bundles" ADD CONSTRAINT "worker_wallet_bundles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_regulatory_verification_decision__fkey" FOREIGN KEY ("regulatory_verification_decision_id") REFERENCES "regulatory_verification_decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_mint_jobs" ADD CONSTRAINT "nft_mint_jobs_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_dispatchedBy_fkey" FOREIGN KEY ("dispatchedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_dead_letter" ADD CONSTRAINT "event_dead_letter_outboxId_fkey" FOREIGN KEY ("outboxId") REFERENCES "event_outbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_conflicts" ADD CONSTRAINT "core_offline_sync_conflicts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "core_offline_sync_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_conflicts" ADD CONSTRAINT "core_offline_sync_conflicts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_training_provider_id_fkey" FOREIGN KEY ("training_provider_id") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenants" ADD CONSTRAINT "acp_tenants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_roles" ADD CONSTRAINT "acp_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "acp_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_A_fkey" FOREIGN KEY ("A") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
