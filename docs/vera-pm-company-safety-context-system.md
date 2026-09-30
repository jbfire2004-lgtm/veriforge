# Vera PM — Company Safety Context Engine

Production API: `/api/v1/pm/company-safety-context` · Spec alias: `/api/v1/pm/company/safety` · UI: `/pm/company-safety-context`  
Developer pack: `docs/vera-pm-company-safety-context-developer-pack.md`

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-company-safety-context/` |
| Engines | `company-profile-generator`, `company-enforcement`, `company-project-sync` |
| Intelligence | `pm-company-safety-cail-intelligence.service.ts` |
| Prisma models | `@@map` to `company_*` tables per spec |

## Database tables

| Table | Model |
|-------|-------|
| `company_safety_profiles` | `PmCompanySafetyProfile` |
| `company_safety_profile_versions` | `PmCompanySafetyProfileVersion` |
| `company_hazard_library` | `PmCompanyHazard` |
| `company_control_library` | `PmCompanyControl` |
| `company_training_matrix` | `PmCompanyTrainingMatrix` |
| `company_policies` | `PmCompanyPolicy` |
| `company_policy_versions` | `PmCompanyPolicyVersion` |
| `company_policy_acknowledgments` | `PmCompanyPolicyAcknowledgment` |
| `company_sds_library` | `PmCompanySdsLibrary` |
| `company_sds_versions` | `PmCompanySdsVersion` |
| `company_emergency_plans` | `PmCompanyEmergencyPlan` |
| `company_emergency_plan_versions` | `PmCompanyEmergencyPlanVersion` |
| `company_equipment_rules` | `PmCompanyEquipmentRule` |
| `company_zone_templates` | `PmCompanyZoneTemplate` |
| `company_safety_overrides` | `PmCompanySafetyOverride` |
| `company_safety_audit` | `PmCompanySafetyAuditLog` |
| `company_safety_offline_cache` | `PmCompanySafetyOfflineCache` |

Multi-company isolation: all rows keyed by `companyId`. Soft delete on profile, hazards, controls, policies.

## Workflows

### Company setup

`pending` profile → **auto-generate** (risk, training matrix, zone templates) → **publish** → version snapshot → **sync to projects** (hazards → `pm_project_hazards`, zones → `access_zone_rules`, project profiles auto-generated).

### Hazard / control publish

`draft` → validate → `published` → mirror to `hazard_library` / `control_library` → optional project sync.

### Enforcement (site access)

`PmSiteAccessControlService.validateAccess` calls `PmCompanySafetyContextService.enforcementGate`:

- Published corporate profile required
- Orientation, policy acks, training matrix expiry
- SDS expiry flags
- Overrides waive specific rule keys
- Actions: `block_access`, `supervisor_override`, `safety_override`, `auto_capa`

### Overrides

Types: temporary, one_time, policy, training, equipment, zone. Requires reason + expiry; SIF/high-risk requires `safetySig`.

## CAIL

- Unpublished corporate profile
- Hazard publish backlog
- SIF corporate exposure
- SDS expiry
- Project profile coverage gap
- Corporate risk forecast from incidents + denial rate

## API summary

| Method | Path |
|--------|------|
| GET | `/company/:companyId` |
| POST | `/profile/:companyId/auto-generate`, `/publish`, `/sync-projects` |
| GET/POST | `/hazards/:companyId`, POST `/hazards/:id/publish` |
| GET/POST | `/controls/:companyId`, POST `/controls/:id/publish` |
| GET/PUT | `/training-matrix/:companyId` |
| GET/POST | `/policies/:companyId`, POST `/policies/:id/publish` |
| GET/POST | `/sds/:companyId/import-legacy` |
| GET/POST | `/emergency-plans/:companyId/import-legacy` |
| GET | `/equipment-rules/:companyId`, `/zone-templates/:companyId` |
| GET/POST | `/overrides/:companyId` |
| POST | `/enforcement/evaluate` |
| GET | `/validate/:companyId`, `/score/:companyId`, `/analytics/:companyId`, `/cail/insights/:companyId` |
| GET/POST | `/sync/company/:companyId` |
| PUT | `/equipment-rules/:companyId`, `/zone-templates/:companyId` |
| POST | `/sds/:companyId`, `/emergency-plans/:companyId` |

Spec alias (`/api/v1/pm/company/safety`): `POST profile|hazards|controls|training|policy|sds|emergency|equipment|zones|override|offline/sync`, `GET {companyId}/score|analytics|cail`.

## Integrations

| Module | Integration |
|--------|-------------|
| Project safety context | Hazard merge, zone sync, auto project profiles |
| Site access | Company + project enforcement gates |
| JHA/FLHA | Hazard import from JHA |
| Inspections / incidents / equipment failures | Hazard import |
| SDS / policies / emergency | Legacy import + publish bridges |
| Safety stations / emergency | Inherited via site access |

## Deploy

```powershell
cd c:\Vera\backend
npx prisma migrate dev --name pm_company_safety_context
npx prisma generate
```

Run migrate after stopping the backend dev server if Windows reports EPERM on the Prisma engine binary.

## Offline

`GET /sync/company/:id` — full bundle in `company_safety_offline_cache`.  
`POST /sync/company/:id` or spec `POST /company/safety/offline/sync` — upload replay.  
Field sync: `pmCompanySafetyContext.sync` with `companyId` (download default; upload when payload includes profile/hazards/controls/training/policies/sds/emergency/equipmentRules/zoneTemplates/overrides).
