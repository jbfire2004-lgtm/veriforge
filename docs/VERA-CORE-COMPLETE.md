# Vera Core — Complete System

Production-ready worker/equipment registry, training ingestion, OCR, readiness, documents, verification, and digital twins.

## Architecture

```
Vera Core (api/v1/core)
├── Registry          workers/search, workers/:id/profile, equipment/*
├── Readiness Engine  readiness/summary, readiness/workers/:id, readiness/equipment/:id
├── Training          training/ingest, training/runs, training/verification-queue
├── Documents         documents (CoreFile library)
├── Verification      core/verification/training/* (via verification-core)
├── Digital Twins     twins/hydrate, twins/dashboard
└── Platform          platform/summary
```

## Backend modules

| Module | Path | Purpose |
|--------|------|---------|
| Vera Core | `backend/src/modules/vera-core/` | Registry, links, wallets, readiness, documents facade |
| Training Ingestion | `backend/src/training-ingestion/` | Upload, OCR, runs, verification queue |
| Core Upload | `backend/src/modules/core-upload/` | S3/local CoreFile storage |
| Digital Twin | `backend/src/modules/digital-twin/` | Twin engine hydration |
| Reporting Core | `backend/src/modules/reporting-core/` | Compliance scoring pipelines |
| Verification | `backend/src/verification/` | Worker/training validation |

### New services (this build)

- `core-readiness.service.ts` — unified worker/equipment/training/project readiness
- `core-documents.service.ts` — CoreFile document library

## API routes

### Worker profiles
- `GET /api/v1/core/workers/search`
- `GET /api/v1/core/workers/:id/profile`
- `GET /api/v1/core/readiness/workers/:id`
- `GET /api/v1/core/wallets/worker/:id`

### Equipment profiles
- `GET /api/v1/core/equipment/search`
- `GET /api/v1/core/equipment/:id/profile`
- `GET /api/v1/core/readiness/equipment/:id`

### Readiness engine
- `GET /api/v1/core/readiness/summary?companyId=`

### Training ingestion
- `POST /api/v1/training-ingestion/upload` — OCR + classification
- `GET /api/v1/core/training/runs?companyId=`
- `GET /api/v1/core/training/verification-queue?companyId=`

### Document storage
- `GET /api/v1/core/documents?companyId=&purpose=`
- `POST /api/v1/core/uploads`

### Digital twins
- `POST /api/v1/core/twins/hydrate?companyId=`
- `GET /api/v1/core/twins/dashboard`
- `GET /api/v1/twins/:type/:id`

## Frontend pages (`/core`)

| Route | Component |
|-------|-----------|
| `/core` | Hub + workflow |
| `/core/workers` | `CoreWorkersView` |
| `/core/workers/[id]` | `CoreWorkerProfileView` |
| `/core/equipment` | `CoreEquipmentView` |
| `/core/equipment/[id]` | `CoreEquipmentProfileView` |
| `/core/readiness` | `CoreReadinessDashboard` |
| `/core/training-ingest` | `TrainingIngestPipeline` (OCR upload) |
| `/core/verification` | `CoreVerificationHub` (queue + lookup) |
| `/core/documents` | `CoreDocumentLibrary` |
| `/core/twins` | `CoreTwinDashboard` |
| `/core/upload` | Core file upload |

## Client SDK

- `lib/api/vera-core.ts` — registry CRUD
- `lib/core/vera-core-platform.ts` — readiness, documents, twins, queue
- `lib/training-ingestion-v1.ts` — upload + OCR runs
- `lib/digital-twin/api.ts` — twin timeline/dashboard

## Data flow

1. **Upload** → CoreFile + TrainingIngestionRun → OCR extraction → TrainingRecord
2. **Verification** → TrainingValidationResult queue → approve/reject
3. **Readiness** → VerificationService + DashboardWidgets → scores
4. **Digital twin** → hydrate from reporting + widgets → in-memory twin state

## Setup

```bash
cd backend && npx prisma migrate deploy && npm run start:dev
cd vera-frontend && npm run dev
```

Visit `/core` → workers, equipment, readiness, training ingest, verification, documents, twins.
