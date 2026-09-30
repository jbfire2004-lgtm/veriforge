# Vera PM — Project Safety Context Engine

Production API: `/api/v1/pm/project-safety-context` · Spec alias: `/api/v1/pm/project/safety` · UI: `/pm/project-safety-context`  
Developer pack: `docs/vera-pm-project-safety-context-developer-pack.md`  
Legacy context: `/api/v1/pm/safety/context/project/:id` delegates to PM engine when loaded.

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-project-safety-context/` |
| Engines | `profile-generator`, `hazard-import`, `publish-workflow`, `enforcement` |
| Intelligence | `pm-project-safety-cail-intelligence.service.ts` |
| Migration | `20260521250000_pm_project_safety_context` |

## 1. Project safety profile

Single profile per project (`pm_project_safety_profiles`):

| Field | Purpose |
|-------|---------|
| `riskLevel` | low / medium / high / critical |
| `requiredJhaTypes` | FLHA, JHA, TASK_JHA |
| `requiredInspections` | cadence by type |
| `requiredTraining` | training codes |
| `requiredEquipmentCerts` | cert requirements |
| `requiredPpe` | PPE list |
| `requiredEmergencyPlans` | plan ack gate |
| `requiredSdsAcks` | SDS ack gate |
| `requiredToolboxTalks` | frequency days |
| `enforcementRulesJson` | block FLHA, orientation, SIF gate |
| `zoneRulesJson` | synced to `access_zone_rules` on publish |
| `equipmentRulesJson` | inspection, LOTO, OOS blocks |
| `trainingRulesJson` | expiry enforcement |
| `emergencyRulesJson` | plan ack, auto-muster, site lock |

**Auto-generate** uses: equipment count, incidents (12m), SIF events, subcontractors, environmental flags.

**Publish workflow**: draft → published → version snapshot in `pm_project_safety_profile_versions`.

## 2. Project hazard library

`pm_project_hazards` — categories: energy, environmental, equipment, chemical, behavioral, site_specific.

Metadata: severity, likelihood, `sifPotential`, `hecaCategoryKey`, `requiredControlIds`.

**Import sources**: company_library, jha_flha, inspection, incident, equipment_failure.

**Publish**: draft → published (version increment).

## 3. Project control library

`pm_project_controls` — types: engineering, administrative, ppe, equipment.

Import from `control_library` (company + project entries).

## Enforcement & overrides

- `enforcement.engine` — profile published + rule checks + override waivers
- `pm_project_safety_overrides` — rule types: profile, zone, equipment, training, emergency, hazard, control
- **Site access integration**: `PmSiteAccessControlService.validateAccess` calls `enforcementGate`

## CAIL insights

- Unpublished profile warning
- Hazard publish backlog
- SIF-potential hazard exposure
- Risk level underestimated vs incident rate

## Offline

`GET /sync/project/:id` — full bundle cached in `pm_project_safety_offline_cache`.  
`POST /sync/project/:id` or spec `POST /project/safety/offline/sync` — upload replay.  
Field action: `pmProjectSafetyContext.sync` (download default; upload when payload includes profile/hazards/controls/overrides/zoneRules).

## API summary

| Method | Path |
|--------|------|
| GET | `/project/:projectId` |
| GET/PUT | `/profile/:projectId` |
| POST | `/profile/:projectId/auto-generate` |
| POST | `/profile/:projectId/publish` |
| GET/POST | `/hazards/:projectId`, `/hazards/:projectId/import` |
| POST | `/hazards/:hazardId/publish` |
| GET/POST | `/controls/:projectId`, `/controls/:projectId/import` |
| PUT | `/zones/:projectId`, `/equipment/:projectId`, `/training/:projectId`, `/emergency/:projectId` |
| GET/POST | `/overrides/:projectId` |
| POST | `/enforcement/:projectId/evaluate` |
| GET | `/validate/:projectId`, `/score/:projectId`, `/analytics/:projectId` |
| GET | `/cail/insights/:projectId` |
| GET/POST | `/sync/project/:projectId` |

Spec alias (`/api/v1/pm/project/safety`): `POST profile|hazards|controls|zones|equipment|training|emergency|override|offline/sync`, `GET {projectId}/score|analytics|cail`.

## Integrations

JHA/FLHA, SIF/HECA (via access gates), inspections, incidents, CAPA, equipment, SDS, training, site access (zone sync + enforcement), safety stations, emergency (rules JSON).
