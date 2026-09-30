# Training Verification Engine — Integration Guide

## Overview

The **Training Verification Engine** is Vera Core module #2. It orchestrates provider ingest, authenticity validation, regulatory/jurisdictional alignment, expiry rules, verified record generation, blockchain credential minting, and propagation to worker wallets, company profiles, project profiles, and union hall rosters.

## API surface

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/training/verify/ingest` | Ingest provider payload + run full pipeline |
| `POST` | `/api/v1/training/verify/:id/run` | Validate existing record (no attestation) |
| `POST` | `/api/v1/training/verify/:id/finalize` | Validate + attest + propagate |
| `GET` | `/api/v1/training/verify/:id` | Latest verified record (or live run if none) |
| `GET` | `/api/v1/training/verify/:id/runs` | Audit history (`TrainingVerificationRun`) |

Legacy Core routes remain available:

- `GET /api/v1/core/verification/training/:id` — structured checks (public kiosk)
- `POST /api/v1/core/verification/training/:id/complete` — supervisor attestation
- `GET /api/v1/core/verification/training/:id/snapshot` — persisted snapshot + NFT status

## Provider API integration

### Webhook / REST push (recommended)

```http
POST /api/v1/training/verify/ingest
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "workerEmail": "alex@example.com",
  "companyId": 1,
  "projectId": 12,
  "certificationId": 5,
  "trainingProviderId": 3,
  "certificateNumber": "FP-2026-001",
  "issuedAt": "2026-05-01",
  "expiresAt": "2027-05-01",
  "jurisdictionCode": "ON"
}
```

### Bulk file ingest

Use `/api/v1/training-ingestion/...` to create `TrainingIngestionRun` rows, then call:

```http
POST /api/v1/training/verify/:trainingRecordId/finalize
```

### Provider portal (TrainingPipeline)

`POST /api/v1/core/training/ingest` creates records via `TrainingPipelineService`. Wrap with the engine:

```typescript
await trainingVerificationEngine.ingestAndVerify({
  ...providerPayload,
  jurisdictionCode: company.province,
});
```

## Event bus topics

| Topic | When emitted |
|-------|----------------|
| `training.uploaded` | Record created from provider ingest |
| `training.verification.run` | Engine run persisted (`TrainingVerificationRun`) |
| `training.verification_attention` | Status `ATTENTION` or `INVALID` |
| `verification.completed` | Attestation + close loop |
| `training.validated` | Successful validation close |
| `wallet.synced` | Worker wallet item updated |
| `training.credential.minted` | NFT mint completed |
| `compliance.recalc` | Company/project compliance refresh |
| `training_ingestion.completed` / `training_ingestion.failed` | Bulk ingest terminal state |

Subscribe via `EventBusService.on(topic, handler)` in-process. External NATS/Kafka bridges can fan out from the same payload shape (`DomainEventPayload`).

## Validation layers

1. **Authenticity** — `VerificationService` (provider, worker identity, certificate #, expiry, completion)
2. **Regulatory alignment** — `RegulatoryDecisionService` (standards + equivalency)
3. **Jurisdiction** — `TrainingStandardsComplianceService` + `JurisdictionMatchingEngine`
4. **Expiry rules** — `ExpiryRuleEngine` + structured expiry checks

## Blockchain credentials

Mint is scheduled when:

- Regulatory status is `COMPLIANT`
- Training attestation exists (`completedAt` set)
- `VERA_NFT_MINT_ENABLED=true` (see `training-credential-nft.config.ts`)

Stub chain provider is default; swap `BlockchainCredentialProvider` binding for Polygon/production.

## Propagation targets

| Target | Mechanism |
|--------|-----------|
| Worker Wallet | `TrainingWalletIntegrationService.syncAfterTrainingRecord` → `WorkerWalletItem` |
| Company Profile | `CompanyTrainingComplianceService.refreshAfterTrainingRecord` |
| Project Profile | Project assignment compliance via wallet integration |
| Union Hall | `UnionHallTrainingService.ensurePendingReceiptsForRecord` |

## Database

- `TrainingRecord.lastVerificationStatus`, `lastVerificationChecks`, `verifiedAt` — fast UI snapshot
- `TrainingVerificationRun` — full engine audit trail per run

## Notifications

Supervisors receive in-app notifications (`TRAINING_VERIFICATION_ATTENTION`) when status is not `VERIFIED`. Ingestion terminal states emit `TRAINING_INGESTION_COMPLETED` / `TRAINING_INGESTION_FAILED`.

## Source files

| File | Role |
|------|------|
| `backend/src/services/trainingVerification.ts` | Engine orchestrator |
| `backend/src/routes/training.ts` | HTTP routes |
| `backend/src/services/training-verification.module.ts` | Nest module |
| `backend/src/verification/verification.service.ts` | Authenticity + close loop |
| `backend/src/modules/training-standards-compliance/` | Regulatory/jurisdiction |
| `backend/src/modules/training-credential-nft/` | Blockchain mint |
| `backend/src/modules/vera-core/training-wallet-integration.service.ts` | Wallet/company/project/union propagation |
