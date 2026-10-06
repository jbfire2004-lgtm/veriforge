-- Phase 1 / 1.5: refresh tokens, password reset, ingestion OCR metadata

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

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainingIngestionRun" ADD COLUMN "sourceChannel" TEXT NOT NULL DEFAULT 'upload';
ALTER TABLE "TrainingIngestionRun" ADD COLUMN "coreFileId" INTEGER;
ALTER TABLE "TrainingIngestionRun" ADD COLUMN "ocrExtracted" JSONB;
ALTER TABLE "TrainingIngestionRun" ADD COLUMN "ocrConfidence" DOUBLE PRECISION;

CREATE INDEX "TrainingIngestionRun_sourceChannel_createdAt_idx" ON "TrainingIngestionRun"("sourceChannel", "createdAt");

ALTER TABLE "TrainingIngestionRun" ADD CONSTRAINT "TrainingIngestionRun_coreFileId_fkey" FOREIGN KEY ("coreFileId") REFERENCES "CoreFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
