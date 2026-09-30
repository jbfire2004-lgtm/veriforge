# Vera PM — Worker Safety Profile Engine

Production API: `/api/v1/pm/worker-safety-profile` · Spec alias: `/api/v1/pm/worker/safety` · UI: `/pm/worker-safety-profile`  
Developer pack: `docs/vera-pm-worker-safety-profile-developer-pack.md`  
Legacy: `/api/v1/pm/safety/context/worker/:id` delegates when module loaded.

## Database (`worker_*` tables)

| Table | Purpose |
|-------|---------|
| `worker_profiles` | Core profile, score 0–100, risk level, required actions |
| `worker_training` | Training snapshots synced from `TrainingRecord` |
| `worker_competencies` | Competency levels |
| `worker_authorizations` | Equipment auth types (crane, forklift, AWP, etc.) |
| `worker_medical_restrictions` | Physical/work limits, zone blocks |
| `worker_hazard_exposure` | JHA, inspection, incident, failure, emergency sources |
| `worker_incident_history` | PM safety events involvement |
| `worker_corrective_actions` | CAPA links per worker |
| `worker_access_logs` | Denormalized from `access_attempts` |
| `worker_overrides` | Training/equipment/medical/zone overrides |
| `worker_safety_scores` | Score history time series |
| `worker_safety_audit` | Full audit trail |
| `worker_safety_offline_cache` | Offline bundle |

## Scoring engine

Penalty-based score from 100:

- Expired/missing training (company matrix + snapshots)
- Open/overdue/SIF-linked CAPA
- Incidents 12m, SIF hazard exposure
- Access denial rate 30d
- Expired equipment authorizations
- Medical blocks, policy/SDS gaps, stale FLHA, meeting attendance

Outputs: `safetyScore`, `riskLevel` (low/medium/high/critical), `requiredActions`, `requiresSupervisorReview`.

## Enforcement

`POST /enforcement/evaluate` orchestrates:

1. Company training + policy checks
2. Site access validation (all PM gates)
3. Medical restriction blocks by zone type
4. Worker-level overrides
5. Actions: block / supervisor_override / safety_override / auto_capa

## Rebuild workflow

`POST /:workerId/rebuild` syncs training, authorizations, hazard exposure, incidents, CAPA, access logs → recalculates score → publishes profile version.

## CAIL

- Profile missing / elevated risk
- Chronic access denials
- SIF hazard exposure
- Overdue CAPA
- Incident likelihood forecast

## API

| Method | Path |
|--------|------|
| GET | `/:workerId` |
| POST | `/:workerId/rebuild` |
| POST | `/enforcement/evaluate` |
| GET | `/:workerId/training`, `/authorizations`, `/hazard-exposure`, `/medical-restrictions`, `/overrides` |
| POST | `/:workerId/medical-restrictions`, `/:workerId/overrides` |
| GET | `/score/:workerId`, `/validate/:workerId`, `/:workerId/analytics`, `/:workerId/cail/insights` |
| GET/POST | `/sync/:workerId` |
| POST | `/:workerId/training`, `/:workerId/authorizations`, `/:workerId/hazard-exposure`, `/:workerId/corrective-actions` |

Spec alias (`/api/v1/pm/worker/safety`): `POST profile|training|authorization|restriction|exposure|corrective|override|offline/sync`, `GET {id}/score|analytics|cail`.

## Offline

`GET /sync/:id` — full bundle in `worker_safety_offline_cache`.  
`POST /sync/:id` or spec `POST /worker/safety/offline/sync` — field upload + rebuild.  
Field action: `pmWorkerSafetyProfile.sync` (download default; upload when profile/training/authorizations/restrictions/exposures/correctiveActions/overrides present).

## Integrations

Company context (training matrix, policies), project context, site access, safety stations (access logs), JHA/FLHA, CAPA, equipment authorizations, emergency, SDS, meetings.

## Deploy

```powershell
cd c:\Vera\backend
npx prisma migrate dev --name pm_worker_safety_profile
npx prisma generate
```
