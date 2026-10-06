-- Training credential NFT lock + mint outbox (additive)
CREATE TYPE "VerifiedByVeraStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'VERIFIED_WITH_NFT');
CREATE TYPE "TrainingCredentialNftMintStatus" AS ENUM ('PENDING_MINT', 'MINTED', 'FAILED', 'REVOKED');
CREATE TYPE "NftMintJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

ALTER TABLE "regulatory_verification_decisions" ADD COLUMN "decision_hash" TEXT;

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

CREATE UNIQUE INDEX "training_credential_nfts_training_record_id_key"
  ON "training_credential_nfts"("training_record_id");
CREATE INDEX "training_credential_nft_worker_idx" ON "training_credential_nfts"("worker_id");
CREATE INDEX "training_credential_nft_mint_status_idx" ON "training_credential_nfts"("mint_status");

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

CREATE UNIQUE INDEX "nft_mint_jobs_idempotency_key_key" ON "nft_mint_jobs"("idempotency_key");
CREATE INDEX "nft_mint_job_status_created_idx" ON "nft_mint_jobs"("status", "created_at");

ALTER TABLE "training_credential_nfts"
  ADD CONSTRAINT "training_credential_nfts_training_record_id_fkey"
  FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_credential_nfts"
  ADD CONSTRAINT "training_credential_nfts_worker_id_fkey"
  FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "training_credential_nfts"
  ADD CONSTRAINT "training_credential_nfts_regulatory_verification_decision_id_fkey"
  FOREIGN KEY ("regulatory_verification_decision_id") REFERENCES "regulatory_verification_decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "nft_mint_jobs"
  ADD CONSTRAINT "nft_mint_jobs_training_record_id_fkey"
  FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
