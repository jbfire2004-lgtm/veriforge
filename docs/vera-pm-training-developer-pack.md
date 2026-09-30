# Training & Competency — Developer-Ready Pack

PM training management: company role matrix, worker assignments, completion/verification, expiry enforcement, site access gates, CAPA auto-generation, and offline sync.

**API base:** `/api/v1/pm/training`  
**UI:** `/pm/training`  
**Offline sync:** `pmTraining.sync`  
**Backend module:** `backend/src/pm-training/`  
**Related APIs:** `/training` (legacy), `/training-records`, `/api/v1/pm/company-safety-context/training-matrix`, `/api/v1/pm/worker-safety-profile/:id/training`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| training-service | `PmTrainingService` |
| training-matrix-service | `TrainingMatrixEngine` + `PmCompanySafetyContextService` |
| training-expiry-service | `TrainingExpiryEngine` |
| training-provider-service | `TrainingProvider` / `TrainingCourse` (provider module) |
| training-certificate-service | `verify()` + `TrainingRecord.certificateUrl` |
| worker-training-service | `getWorkerTraining()` + `WorkerTrainingEngine.syncFromRecords` |
| offline-sync-service | `syncOffline()` |
| cail-inference-service | `PmTrainingCailIntelligenceService` |
| audit-service | `PmWorkerSafetyAuditLog` (`entityType: training`) |

### Core engines (`backend/src/pm-training/`)

| Component | File | Responsibility |
|-----------|------|----------------|
| Training Matrix Engine | `training-matrix.engine.ts` | Group rules by role → `required_courses` JSON |
| Auto-Assignment Engine | `training-auto-assignment.engine.ts` | Matrix gaps → assign records |
| Training Expiry Engine | `training-expiry.engine.ts` | Status derivation, blocking |
| Competency Engine | Snapshot `competencyLevel` on `PmWorkerSafetyTraining` | Levels 1–4 from completion |
| Certificate Upload Engine | `verify()` | Requires certificate URL/number |
| Worker Training Validation Engine | `PmCompanySafetyContextService.workerTrainingCheck` | Matrix vs records |
| Training Enforcement Engine | Site access + worker profile scoring | Expired → deny |
| Offline Training Engine | `syncOffline()` | Idempotent worker+course sync |

### Module wiring

- `PmCompanySafetyContextModule` — matrix CRUD + compliance check
- `PmWorkerSafetyProfileModule` — training snapshots (via `WorkerTrainingEngine`)
- `PmSiteAccessControlModule` — `requiresTrainingCodes` on zones
- `PmCapaAutoGenerateService.fromTrainingGap` — expired/missing → CAPA
- Registered in `app.module.ts` as `PmTrainingModule`

---

## 2. Database schema

Spec tables map to Vera models (distributed design).

### Courses (spec: `training_courses`)

| Source | Table | Notes |
|--------|-------|-------|
| PM catalog | `company_training_matrix` (`PmCompanyTrainingMatrix`) | `trainingCode`, `trainingName`, `expiresInDays`, `category` |
| Cert catalog | `Certification` | Global cert definitions; `code` aligns with matrix `trainingCode` |
| Provider courses | `TrainingCourse` | Provider module; `durationHours`, `validityDays` |

**PM create course:** `POST /course` → `Certification` + matrix row.

### Matrix (spec: `training_matrix`)

| Field | Vera (`PmCompanyTrainingMatrix`) |
|-------|----------------------------------|
| id | UUID PK |
| companyId | company_id |
| role | `roleType` (worker, supervisor, equipment_operator, …) |
| required_courses | Multiple rows OR `GET /matrix` → `roles` JSON grouped by engine |

### Worker training (spec: `worker_training`)

| Field | Vera |
|-------|------|
| id | `TrainingRecord.id` (int) + snapshot `PmWorkerSafetyTraining.id` (uuid) |
| worker_id | `TrainingRecord.workerId` |
| course_id | `TrainingRecord.certificationId` |
| completion_date | `completedAt` |
| expiry_date | `expiresAt` |
| competency_level | `PmWorkerSafetyTraining.competencyLevel` |
| certificate_path | `certificateUrl` |
| verified_by | `certificateSignedByInstructorId` |
| verified_at | `certificateSignedAt` |

### Audit (spec: `training_audit`)

| Field | Vera (`PmWorkerSafetyAuditLog`) |
|-------|--------------------------------|
| worker_id | `workerId` |
| course_id | `entityId` (certification id) |
| event_type | `assigned`, `completed`, `verified` |
| event_data | `payload` JSON |
| timestamp | `createdAt` |

**Migration:** Matrix `20260519200000` company safety; worker training `worker_training` in worker profile migration.

---

## 3. API contract

Base: `/api/v1/pm/training` — JWT + PM roles (WORKER+ read/assign; SUPERVISOR+ course/matrix/verify).

### Spec path mapping

| Method | Spec path | Vera path |
|--------|-----------|-----------|
| POST | `/training/course` | `POST /course` |
| POST | `/training/matrix` | `POST /matrix` |
| POST | `/training/assign` | `POST /assign` |
| POST | `/training/complete` | `POST /complete` |
| POST | `/training/verify` | `POST /verify` |
| GET | `/training/worker/{id}` | `GET /worker/:workerId` |
| POST | `/training/offline/sync` | `POST /offline/sync` or `POST /sync` |

### Additional endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/courses?companyId=` | Matrix + certification + provider catalogs |
| GET | `/matrix?companyId=` | Role-grouped matrix |
| POST | `/auto-assign/:workerId` | Auto-create assignments from published matrix |
| GET | `/worker/:id/predict` | CAIL lapse risk + recommendations |
| GET | `/analytics/company/:companyId` | Compliance, expiry trends, competency |

### Assign body

```json
{
  "workerId": 12,
  "courseId": "FALL_PROTECTION",
  "courseName": "Fall protection awareness",
  "expiresInDays": 365
}
```

`courseId` may be certification id (number) or training code (string).

### Complete / verify

```json
{ "recordId": 42 }
```

```json
{
  "recordId": 42,
  "certificateUrl": "https://...",
  "certificateNumber": "CERT-2026-001"
}
```

### Worker training response

```json
{
  "workerId": 12,
  "records": [{ "id": 42, "status": "verified", "courseCode": "ORIENTATION", ... }],
  "snapshots": [{ "trainingCode": "ORIENTATION", "status": "valid" }],
  "matrixGaps": [],
  "compliance": { "complete": true, "missing": [] },
  "accessBlocked": false
}
```

### Offline sync

```json
{
  "clientSyncId": "uuid",
  "workerId": 12,
  "courseId": "ORIENTATION",
  "completed": true,
  "verified": true,
  "certificateUrl": "data:..."
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/training` | Training expiry dashboard + matrix summary | `training/dashboard.tsx` |
| `/pm/company-safety-context` | Training matrix editor | `company-safety-context/dashboard.tsx` |
| `/pm/worker-safety-profile` | Worker training profile | `worker-safety-profile/dashboard.tsx` |

**Lib:** `vera-frontend/lib/pm-training.ts`

| Function | API |
|----------|-----|
| `listPmTrainingCourses` | GET `/courses` |
| `createPmTrainingCourse` | POST `/course` |
| `upsertPmTrainingMatrix` | POST `/matrix` |
| `assignPmTraining` | POST `/assign` |
| `completePmTraining` | POST `/complete` |
| `verifyPmTraining` | POST `/verify` |
| `fetchPmWorkerTraining` | GET `/worker/:id` |
| `predictPmTrainingLapse` | GET `/worker/:id/predict` |
| `syncPmTrainingOffline` | POST `/sync` |

### Spec component mapping

| Component | Vera |
|-----------|------|
| CourseCard | Dashboard + company context list |
| MatrixRoleEditor | Company safety context training tab |
| CertificateUploader | `verifyPmTraining` + field `training.upload` |
| TrainingExpiryBadge | `status` + analytics expiringSoon |

---

## 5. Workflow logic

### States (derived — not a DB enum)

| Status | Condition |
|--------|-----------|
| Assigned | No `completedAt` |
| In Progress | Certificate uploaded, not completed |
| Completed | `completedAt` set |
| Verified | `certificateSignedAt` set |
| Expired | `expiresAt` < now |

### Transitions

```
assigned ──complete──► completed ──verify (+ certificate)──► verified
verified ──time──► expired
```

### Validation

| Rule | Enforcement |
|------|-------------|
| Certificate required for verification | `verify()` throws 400 without cert |
| Expired blocks access | `workerTrainingCheck`, site access training codes, profile score penalty |
| RCA N/A | N/A for training module |

---

## 6. CAIL intelligence logic

### `GET /worker/:id/predict`

| Output | Logic |
|--------|-------|
| lapseRisk | missing×20 + expiring×10 + expired snapshots×15 + hazards×5 |
| competencyScore | 100 − lapseRisk |
| recommendedTraining | Matrix gaps + hazard exposure context |
| workerRiskImpact | lapseRisk + hazard count |
| predictive recurrence | Same as lapseRisk cap 100 |

### Hazard-based recommendations

Uses recent `PmWorkerHazardExposure` rows to prioritize matrix courses still missing.

---

## 7. Offline mode

- Local training records keyed by `clientSyncId` + worker + course
- Certificates in sync payload (`certificateUrl`, `certificateNumber`)
- Background sync via `pmTraining.sync` field handler

Conflict: same worker+certification → update/complete/verify existing record.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Worker Safety Profiles | `WorkerTrainingEngine.syncFromRecords`; snapshots on `worker_training` |
| Site Access | Zone `requiresTrainingCodes` vs `TrainingRecord` |
| JHA/FLHA | Task gates may require training codes via PM enforcement |
| Equipment Authorization | `PmWorkerSafetyAuthorization.requiredTraining` JSON |
| PM Module | Project-scoped assign (`projectId` on record) |
| Corrective Actions | `fromTrainingGap` → `actionType: training_requirement` |
| Company Safety Context | Matrix publish + `workerTrainingCheck` |
| Training Provider | `TrainingCourse`, ingestion pipeline → `TrainingRecord` |
| Unified CAIL | Lapse predict feeds worker risk / compliance dashboards |

---

## 9. Analytics

**GET `/analytics/company/:companyId`**

| Metric | Description |
|--------|-------------|
| trainingCompliancePct | Leading indicator 0–100 |
| matrixRules | Active matrix row count |
| matrixByRole | `required_courses` per role |
| expiryTrends.expired / valid / expiringSoon | Lagging/leading expiry |
| competencyDistribution | level_1 … level_4 from snapshots |
| roleGaps | Required count per role |
| leadingIndicator | Same as compliance % |

### Leading indicators

- Compliance %
- Expiring within 30 days count

### Lagging indicators

- Expired snapshot count
- Role gap counts (missing assignments per matrix)

---

## File index

```
backend/src/pm-training/
  pm-training.service.ts
  pm-training.controller.ts
  pm-training-cail-intelligence.service.ts
  training-expiry.engine.ts
  training-matrix.engine.ts
  training-auto-assignment.engine.ts

backend/src/pm-company-safety-context/   (matrix source of truth)
backend/src/pm-worker-safety-profile/    (snapshots + scoring)
backend/src/training-records/            (legacy CRUD)
backend/src/training/                    (legacy aggregate API)

vera-frontend/
  lib/pm-training.ts
  src/pages/pm/training/dashboard.tsx
  app/pm/training/page.tsx
```

## Deploy

No new migration required (uses existing `TrainingRecord`, `company_training_matrix`, `worker_training`).

```bash
cd backend
npx prisma generate
```
