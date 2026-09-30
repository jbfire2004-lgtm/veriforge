# Worker Safety Profile Engine — Developer-Ready Pack

Per-worker safety identity: training, competencies, equipment authorizations, medical restrictions, hazard exposure, incident history, corrective actions, access logs, scoring, enforcement gates, overrides, and offline field sync.

**Primary API:** `/api/v1/pm/worker-safety-profile`  
**Spec alias API:** `/api/v1/pm/worker/safety`  
**UI:** `/pm/worker-safety-profile`  
**Offline sync:** `pmWorkerSafetyProfile.sync` (download + upload)  
**Backend:** `backend/src/pm-worker-safety-profile/`  
**Prisma `@@map`:** `worker_profiles`, `worker_training`, `worker_authorizations`, etc.

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| worker-profile-service | `getOrCreateProfile`, `getFullProfile`, `rebuildProfile`, `updateWorkerIdentity` |
| worker-training-service | `WorkerTrainingEngine.syncFromRecords`, `upsertTrainingSnapshot`, `listTraining` |
| worker-competency-service | `upsertCompetency` → `PmWorkerSafetyCompetency` |
| worker-authorization-service | `syncAuthorizations`, `upsertAuthorization`, `listAuthorizations` |
| worker-medical-restriction-service | `addMedicalRestriction`, `listMedicalRestrictions`, `getMedicalBlocks` |
| worker-hazard-exposure-service | `syncHazardExposure`, `recordHazardExposure`, `listHazardExposure` |
| worker-incident-history-service | `syncIncidentHistory` (from `pm_safety_events`) |
| worker-corrective-action-service | `syncCorrectiveActions`, `linkCorrectiveAction` |
| worker-access-history-service | `syncAccessLogs`, `recordAccessFromValidation` |
| worker-safety-scoring-service | `WorkerScoringEngine`, `recalculateScore`, `getWorkerSafetyScore` |
| worker-enforcement-service | `enforcementGate` + `WorkerEnforcementEngine` |
| override-service | `createOverride`, `listOverrides` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmWorkerSafetyCailIntelligenceService` |
| audit-service | `worker_safety_audit` (`PmWorkerSafetyAuditLog`) |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Worker Profile Engine | `rebuildProfile` | Aggregate all domains + publish profile |
| Training & Competency Engine | `worker-training.engine.ts` | Sync from `training_record`, matrix gaps |
| Equipment Authorization Engine | `syncAuthorizations` | Bridge `pm_worker_equipment_authorization` |
| Medical Restriction Engine | `addMedicalRestriction`, `getMedicalBlocks` | Zone/equipment blocks |
| Hazard Exposure Engine | JHA/incident sync + manual record | Exposure timeline |
| Incident History Engine | `syncIncidentHistory` | Worker involvement in safety events |
| Corrective Action Engine | CAPA links with open/overdue status |
| Access History Engine | `PmAccessAttempt` → `PmWorkerAccessLog` |
| Worker Safety Scoring Engine | `worker-scoring.engine.ts` | 0–100 score, risk band, required actions |
| Worker Enforcement Engine | `worker-enforcement.engine.ts` | Compliant / override paths |
| Supervisor/Safety Override Engine | `worker_overrides` with signatures |
| Offline Worker Engine | `applyOfflineSync` | Field replay + rebuild |

### Module wiring

- Imports: `PmCompanySafetyContextModule`, `PmProjectSafetyContextModule`, `PmSiteAccessControlModule`
- Consumers: site access, project management, unified CAPA/intelligence, training module

---

## 2. Database schema

### `worker_profiles` → `PmWorkerSafetyProfile`

| Spec field | Vera column |
|------------|-------------|
| company_id | `companyId` |
| worker_id | `workerId` (unique) |
| role | `roleType` |
| trade | `tradeCode` |
| medical_restrictions | via `PmWorkerMedicalRestriction` rows (+ profile metadata) |
| safety_score | `safetyScore` |
| risk_level | `riskLevel` |
| updated_at | `updatedAt` |

### `worker_training` → `PmWorkerSafetyTraining`

| Spec field | Vera column |
|------------|-------------|
| course_id | `trainingCode` |
| completion_date | `completedAt` |
| expiry_date | `expiresAt` |
| competency_level | `competencyLevel` |
| certificate_path | legacy `training_record` / provider fields |

### `worker_competencies` → `PmWorkerSafetyCompetency`

| Spec field | Vera column |
|------------|-------------|
| competency_type | `competencyKey` |
| level | `level` |
| verified_by | `evaluatorId` |
| verified_at | `evaluatedAt` |

### `worker_authorizations` → `PmWorkerSafetyAuthorization`

| Spec field | Vera column |
|------------|-------------|
| equipment_type | `authType` (+ optional `equipmentId`) |
| authorization_type | `authType` |
| issue_date | `issuedAt` |
| expiry_date | `expiresAt` |

### `worker_medical_restrictions` → `PmWorkerMedicalRestriction`

| Spec field | Vera column |
|------------|-------------|
| restriction_type | `restrictionType` |
| description | `description` |
| expiry_date | `expiresAt` |

### `worker_hazard_exposure` → `PmWorkerHazardExposure`

| Spec field | Vera column |
|------------|-------------|
| hazard_id | `sourceId` |
| severity / likelihood | `severity`, `likelihood` |
| exposure_date | `exposedAt` |

### `worker_incident_history` → `PmWorkerIncidentHistory`

| Spec field | Vera column |
|------------|-------------|
| incident_id | `sourceId` |
| involvement_type | `eventType` |
| severity | `severity` |

### `worker_corrective_actions` → `PmWorkerCorrectiveActionLink`

| Spec field | Vera column |
|------------|-------------|
| corrective_action_id | `capaId` |
| status | `status` |
| due_date | `dueAt` |

### `worker_access_logs` → `PmWorkerAccessLog`

| Spec field | Vera column |
|------------|-------------|
| access_point_id | `sourceAttemptId` (links `PmAccessAttempt`) |
| timestamp | `createdAt` |
| result | `granted` + `decision` |
| reason | `denialReasons` (jsonb) |

### `worker_overrides` → `PmWorkerSafetyOverride`

| Spec field | Vera column |
|------------|-------------|
| override_type | `overrideType` |
| approved_by | `approvedById` |
| expiry | `expiresAt` |

### Supporting

- `worker_safety_scores` — score history snapshots
- `worker_safety_offline_cache` — offline bundle cache
- `worker_safety_audit` — audit trail

---

## 3. API contract

### Spec paths (`/api/v1/pm/worker/safety`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profile` | Get full profile, rebuild, or update role/trade |
| POST | `/training` | Upsert training snapshot |
| POST | `/authorization` | Create equipment authorization |
| POST | `/restriction` | Add medical restriction |
| POST | `/exposure` | Record hazard exposure |
| POST | `/corrective` | Link corrective action |
| POST | `/override` | Create worker override |
| POST | `/offline/sync` | Upload offline payload; returns `serverState` |
| GET | `/{id}/score` | Worker safety score + CAIL bundle |
| GET | `/{id}/analytics` | Trends and compliance metrics |
| GET | `/{id}/cail` | Insights + training/auth predictions |

### Primary paths (`/api/v1/pm/worker-safety-profile`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:workerId` | Full profile (`?projectId=` for access eval) |
| POST | `/:workerId/rebuild` | Re-aggregate all domains + score |
| GET | `/:workerId/training`, `/authorizations`, `/hazard-exposure`, `/medical-restrictions` |
| POST | `/:workerId/medical-restrictions`, `/training`, `/authorizations`, `/hazard-exposure`, `/corrective-actions` |
| GET/POST | `/:workerId/overrides` | Overrides |
| POST | `/enforcement/evaluate` | Gate simulation |
| GET | `/score/:workerId`, `/validate/:workerId`, `/:workerId/analytics` |
| GET/POST | `/sync/:workerId` | Offline download/upload |
| GET | `/:workerId/cail/insights` | CAIL insights |

### Frontend clients

- Spec: `vera-frontend/lib/pm-worker-safety.ts`
- Primary: `vera-frontend/lib/pm-worker-safety-profile.ts`

---

## 4. Frontend architecture

### Screens (`/pm/worker-safety-profile`)

| Screen | Purpose |
|--------|---------|
| Worker Profile | Identity, score, risk, required actions |
| Training Manager | Snapshots + matrix gaps |
| Authorization Manager | Equipment auth types, expiry |
| Medical Restriction Manager | Blocks for zones/equipment |
| Hazard Exposure Viewer | Timeline from JHA/incidents |
| Incident History Viewer | Safety event involvement |
| Corrective Action Viewer | Open/overdue CAPA links |
| Access Log Viewer | Grant/deny history |
| Override Manager | Supervisor/safety waivers |
| Worker Safety Dashboard | Full context + CAIL |
| Offline Worker Queue | Field sync |

### Components (recommended)

- `TrainingCard`, `AuthorizationCard`, `RestrictionBadge`, `ExposureTimeline`
- `CorrectiveActionCard`, `AccessHistoryList`, `SafetyScoreBadge`

---

## 5. Workflow logic

### Compliance states (`mapComplianceState`)

| Spec state | Condition |
|------------|-----------|
| Compliant | Score ≥ 60, no open CAPA, gate allowed |
| Non-Compliant | Violations, no override |
| Restricted | Active medical blocks without waiver |
| Override Required | High/critical risk or supervisor review flag |
| Override Approved | Active override + gate allowed |

### Validation (`GET /validate/:workerId`)

- Training must be current (no expired required rows)
- Authorizations must be valid (not past `expiresAt`)
- Medical restrictions enforced via `enforcementGate`
- Corrective actions must be resolved (no open/overdue links)

---

## 6. CAIL intelligence logic

| Capability | Method |
|------------|--------|
| Worker safety scoring | `getWorkerSafetyScore` / `WorkerScoringEngine` |
| Predictive incident likelihood | `predictIncidentLikelihood` |
| Predictive training needs | `predictTrainingNeeds` (company matrix vs snapshots) |
| Predictive authorization needs | `predictAuthorizationNeeds` (equipment assignments) |
| Chronic hazard exposure | `chronicHazardExposure` |
| Weak control detection | `weakControlSignals` (CAPA + denial patterns) |

Insights: missing profile, elevated risk, chronic denials, SIF exposure, overdue CAPA.

---

## 7. Offline mode

**Download:** `GET /sync/:workerId` or field handler without upload fields.

**Upload:** `POST /offline/sync` with:

```json
{
  "workerId": 42,
  "profile": { "roleType": "worker", "tradeCode": "ELECTRICIAN" },
  "training": [{ "trainingCode": "ORIENTATION", "courseName": "Site Orientation" }],
  "authorizations": [{ "authType": "forklift_operator", "expiresAt": "2027-01-01" }],
  "restrictions": [],
  "exposures": [{ "hazardType": "energy", "severity": 4 }],
  "correctiveActions": [],
  "overrides": []
}
```

Triggers `rebuildProfile` after apply. Field action `pmWorkerSafetyProfile.sync`.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Company Safety Context | `workerTrainingCheck`, `policyAckCheck` in scoring/gates |
| Project Safety Context | Project-scoped exposure/incident sync |
| JHA / FLHA | Hazard exposure from `jha_flha` hazards |
| Inspections / Incidents | Exposure forecast + incident history |
| Corrective Actions | `PmCorrectiveAction` links, scoring penalties |
| Equipment Safety | Authorization sync from equipment module |
| SDS / Policies | Gates via site access + company checks |
| Site Access | `enforcementGate`, `recordAccessFromValidation` |
| PM Module | Worker score rollups in project dashboards |
| Safety Stations | Access validation records in access logs |
| Training Module | `WorkerTrainingEngine.syncFromRecords` on rebuild |

---

## 9. Analytics

`GET /analytics/:workerId` returns:

| Metric | Source |
|--------|--------|
| Worker safety score trends | `worker_safety_scores` / profile `scoreHistory` |
| Training compliance | Valid vs expired snapshot counts |
| Authorization compliance | Active auths vs expired |
| Hazard exposure trends | 30d exposure count |
| Incident involvement trends | `worker_incident_history` |
| Corrective action performance | Open/overdue CAPA links |
| Access denial rate | 30d `worker_access_logs` |

---

## Quick start

```bash
POST /api/v1/pm/worker/safety/profile
{ "workerId": 42, "rebuild": true, "projectId": 1 }

GET /api/v1/pm/worker/safety/42/score?projectId=1

POST /api/v1/pm/worker/safety/enforcement/evaluate
# (primary path) POST /api/v1/pm/worker-safety-profile/enforcement/evaluate
{ "workerId": 42, "projectId": 1, "zoneCode": "SITE" }
```

See also: `docs/vera-pm-worker-safety-profile-system.md`
