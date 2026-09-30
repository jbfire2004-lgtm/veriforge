# Vera Core Database

PostgreSQL schema for the Vera Core domain: workers, companies, projects, training verification, wallet credentials, provider sync, union hall rosters, notifications, events, audit, offline sync, API keys, and RBAC.

## Schema locations

| Artifact | Path |
|----------|------|
| **Canonical Vera Core reference** | [`backend/prisma/vera-core/schema.prisma`](../backend/prisma/vera-core/schema.prisma) |
| **Production merged schema** | [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) |
| **Greenfield baseline SQL** | [`backend/prisma/vera-core/migrations/0001_vera_core_baseline/migration.sql`](../backend/prisma/vera-core/migrations/0001_vera_core_baseline/migration.sql) |
| **Incremental migration (new tables)** | [`backend/prisma/migrations/20260612000000_vera_core_complete/migration.sql`](../backend/prisma/migrations/20260612000000_vera_core_complete/migration.sql) |
| **Seed script** | [`backend/prisma/seed-vera-core.ts`](../backend/prisma/seed-vera-core.ts) |

Validate the reference schema:

```bash
cd backend
npx prisma validate --schema=prisma/vera-core/schema.prisma
```

Apply migrations (production app):

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Seed Vera Core demo data:

```bash
cd backend
npm run seed:vera-core
```

## Entity map (40 models)

### Organization & workforce

| Model | Table | Purpose |
|-------|-------|---------|
| `Company` | `Company` | Employer / tenant anchor |
| `CompanyLink` | `CompanyLink` | Worker ↔ company employment roster |
| `Worker` | `Worker` | Global worker identity |
| `Site` | `Site` | Physical job site |
| `Project` | `Project` | Company job / project |
| `ProjectAssignment` | `ProjectAssignment` | Worker ↔ project assignment |

### Training & verification

| Model | Table | Purpose |
|-------|-------|---------|
| `Certification` | `Certification` | Training type catalog |
| `TrainingRecord` | `TrainingRecord` | Issued training (raw + verified state) |
| `TrainingVerificationRun` | `TrainingVerificationRun` | Immutable verification audit row |
| `TrainingAttestation` | `TrainingAttestation` | Supervisor/worker sign-off |
| `TrainingValidationResult` | `TrainingValidationResult` | Standards validation outcome |
| `RegulatoryVerificationDecision` | `regulatory_verification_decisions` | Regulatory compliance decision |

**Verified training** is represented by:
- `TrainingRecord.lastVerificationStatus = 'VERIFIED'` + `verifiedAt`
- One or more `TrainingVerificationRun` rows with `overallStatus = 'VERIFIED'`
- Optional `RegulatoryVerificationDecision` + `TrainingCredentialNft`

### Provider integrations

| Model | Table | Purpose |
|-------|-------|---------|
| `Provider` | `Provider` | Legacy issuer name registry |
| `TrainingProvider` | `TrainingProvider` | Full provider profile |
| `ProviderSyncConfig` | `ProviderSyncConfig` | Webhook/poll sync configuration |
| `ProviderSyncRun` | `ProviderSyncRun` | Sync run audit |
| `TrainingCourse` | `TrainingCourse` | Provider course catalog |
| `TrainingInstructor` | `TrainingInstructor` | Instructor qualifications |

### Wallet & blockchain credentials

| Model | Table | Purpose |
|-------|-------|---------|
| `WorkerWalletItem` | `WorkerWalletItem` | Wallet line item (training-linked) |
| `WorkerWalletBundle` | `worker_wallet_bundles` | Persisted offline bundle + QR payload |
| `Credential` | `Credential` | Legacy credential key/value |
| `TrainingCredentialNft` | `training_credential_nfts` | Blockchain credential lock |
| `NftMintJob` | `nft_mint_jobs` | Async mint outbox |

### Union hall rosters

| Model | Table | Purpose |
|-------|-------|---------|
| `UnionHall` | `UnionHall` | Union local |
| `UnionMembership` | `UnionMembership` | **Roster** — worker membership |
| `UnionDispatch` | `UnionDispatch` | Dispatch to company |
| `UnionHallProviderLink` | `UnionHallProviderLink` | Approved providers |
| `UnionHallTrainingReceipt` | `UnionHallTrainingReceipt` | Training accept/validate/push workflow |

### Notifications, events, audit

| Model | Table | Purpose |
|-------|-------|---------|
| `Notification` | `Notification` | User notifications |
| `UserNotificationPreference` | `UserNotificationPreference` | Channel preferences |
| `EventOutbox` | `event_outbox` | Transactional event outbox |
| `EventDeadLetter` | `event_dead_letter` | Failed publish DLQ |
| `AuditLog` | `AuditLog` | Core audit trail |
| `AcpAuditLog` | `acp_audit_logs` | Admin panel audit |

### Offline sync & API access

| Model | Table | Purpose |
|-------|-------|---------|
| `CoreOfflineSyncBatch` | `core_offline_sync_batches` | Device sync submission |
| `CoreOfflineSyncConflict` | `core_offline_sync_conflicts` | Conflict resolution |
| `VeraApiKey` | `vera_api_keys` | Programmatic API keys (hashed) |

### Roles & permissions (ACP)

| Model | Table | Purpose |
|-------|-------|---------|
| `AcpTenant` | `acp_tenants` | Tenant (linked to `Company`) |
| `AcpRole` | `acp_roles` | Named role |
| `AcpUserRole` | `acp_user_roles` | User ↔ role assignment |
| `AcpPermission` | `acp_permissions` | Permission key (`module.action`) |
| `AcpRolePermission` | `acp_role_permissions` | Role ↔ permission |

### Auth (supporting)

| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `User` | Login account |
| `RefreshToken` | `RefreshToken` | JWT refresh rotation |
| `PasswordResetToken` | `PasswordResetToken` | Password reset flow |

## Relationship diagrams

### Organization graph

```mermaid
erDiagram
  Company ||--o{ CompanyLink : employs
  Worker ||--o{ CompanyLink : linked
  Company ||--o{ Project : owns
  Project }o--o| Site : at
  Worker ||--o{ ProjectAssignment : assigned
  Project ||--o{ ProjectAssignment : has
  Company ||--o{ ProjectAssignment : scopes
  User |o--o| Worker : profile
  Company ||--o{ User : staff
```

### Training verification pipeline

```mermaid
erDiagram
  Worker ||--o{ TrainingRecord : holds
  Certification ||--o{ TrainingRecord : type
  TrainingProvider ||--o{ TrainingRecord : issued_by
  TrainingRecord ||--o{ TrainingVerificationRun : verified_by
  TrainingRecord ||--o{ TrainingValidationResult : validated
  TrainingRecord ||--o{ RegulatoryVerificationDecision : regulated
  TrainingRecord |o--o| TrainingCredentialNft : minted
  TrainingRecord |o--o| WorkerWalletItem : wallet_line
  Worker ||--o{ WorkerWalletBundle : offline_bundle
  TrainingProvider ||--|| ProviderSyncConfig : sync
  TrainingProvider ||--o{ ProviderSyncRun : runs
```

### Union hall roster

```mermaid
erDiagram
  UnionHall ||--o{ UnionMembership : roster
  Worker ||--o{ UnionMembership : member
  UnionHall ||--o{ UnionDispatch : dispatches
  Worker ||--o{ UnionDispatch : dispatched
  Company ||--o{ UnionDispatch : receives
  UnionHall ||--o{ UnionHallProviderLink : approves
  TrainingProvider ||--o{ UnionHallProviderLink : linked
  UnionHall ||--o{ UnionHallTrainingReceipt : receipts
  TrainingRecord ||--o{ UnionHallTrainingReceipt : source
```

### Events, notifications, audit

```mermaid
erDiagram
  User ||--o{ Notification : receives
  User ||--o| UserNotificationPreference : prefs
  EventOutbox ||--o{ EventDeadLetter : failed
  User ||--o{ AuditLog : actor
  AcpTenant ||--o{ AcpAuditLog : tenant_audit
```

### RBAC

```mermaid
erDiagram
  AcpTenant ||--o{ AcpRole : roles
  AcpRole ||--o{ AcpRolePermission : grants
  AcpPermission ||--o{ AcpRolePermission : granted
  User ||--o{ AcpUserRole : assigned
  AcpRole ||--o{ AcpUserRole : role
  Company |o--o| AcpTenant : tenant
  Company ||--o{ VeraApiKey : api_keys
```

### Offline sync

```mermaid
erDiagram
  CoreOfflineSyncBatch ||--o{ CoreOfflineSyncConflict : conflicts
  Worker ||--o{ CoreOfflineSyncBatch : submits
  Company ||--o{ CoreOfflineSyncBatch : scoped
  User ||--o{ CoreOfflineSyncBatch : submitted_by
```

## Key indexes

| Table | Index | Use |
|-------|-------|-----|
| `TrainingRecord` | `(workerId, expiresAt)` | Expiry notifications |
| `TrainingRecord` | `(lastVerificationStatus)` | Compliance dashboards |
| `TrainingVerificationRun` | `(trainingRecordId, createdAt)` | Verification history |
| `ProjectAssignment` | `(projectId, status)` | Active roster |
| `UnionMembership` | `(workerId, status)` | Union roster |
| `event_outbox` | `(status, nextRetryAt, createdAt)` | Outbox publisher |
| `vera_api_keys` | `(key_prefix, active)` | API key lookup |
| `worker_wallet_bundles` | `(workerId, version)` | Bundle versioning |

## Environment

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/vera
SHADOW_DATABASE_URL=postgresql://user:pass@localhost:5432/vera_shadow
SEED_USER_PASSWORD=hashedpassword123
```

## Related docs

- [Vera Event Bus](./vera-event-bus-integration.md)
- [Worker Wallet & Provider Sync](./worker-wallet-provider-sync-integration.md)
