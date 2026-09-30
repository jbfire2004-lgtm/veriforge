# Project Safety Context Engine — Developer-Ready Pack

Project-level safety profile, hazard/control libraries, zone and equipment rules, training and emergency requirements, enforcement gates, supervisor overrides, CAIL scoring, and offline field sync.

**Primary API:** `/api/v1/pm/project-safety-context`  
**Spec alias API:** `/api/v1/pm/project/safety`  
**UI:** `/pm/project-safety-context`  
**Offline sync:** `pmProjectSafetyContext.sync` (download + upload)  
**Backend:** `backend/src/pm-project-safety-context/`  
**Migration:** `20260521250000_pm_project_safety_context`  
**Legacy:** `/api/v1/pm/safety/context/project/:id` delegates when PM module loaded

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| project-safety-profile-service | `getOrCreateProfile`, `updateProfile`, `autoGenerateProfile`, `publishProfile` |
| project-hazard-library-service | `listHazards`, `createHazard`, `publishHazard`, `importHazards` |
| project-control-library-service | `listControls`, `createControl`, `publishControl`, `importControlsFromCompanyLibrary` |
| project-zone-engine-service | `upsertZoneRules`, `syncZoneRulesFromProfile` → `SiteAccessRule` |
| project-equipment-rules-service | `upsertEquipmentRules` (`equipmentRulesJson`) |
| project-training-requirements-service | `upsertTrainingRequirements` (`trainingRulesJson`) |
| project-emergency-requirements-service | `upsertEmergencyRequirements` (`emergencyRulesJson`) |
| project-safety-scoring-service | `getProjectSafetyScore` + `PmProjectSafetyCailIntelligenceService` |
| project-enforcement-service | `evaluateEnforcement`, `enforcementGate` |
| override-service | `createOverride`, `listOverrides` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmProjectSafetyCailIntelligenceService` |
| audit-service | `pm_project_safety_context_audit` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Project Safety Profile Engine | `profile-generator.engine.ts` | Risk level, JHA/training/PPE requirements from project signals |
| Project Hazard Library Engine | `hazard-import.engine.ts` | Import from company library, JHA, inspections, incidents, equipment failures |
| Project Control Library Engine | service + company `control_library` | Project controls linked to hazard categories |
| Project Zone Rule Engine | `syncZoneRulesFromProfile` | Profile `zoneRulesJson` → `access_zone_rules` |
| Project Equipment Rule Engine | `equipmentRulesJson` on profile | Inspection/cert/LOTO enforcement config |
| Project Training Engine | `trainingRulesJson` + `requiredTraining` | Role/course gates |
| Project Emergency Engine | `emergencyRulesJson` | Plan ack, muster, site lock flags |
| Project Safety Scoring Engine | CAIL `generateProjectSafetyScore` | 0–100 score, band, zone/equipment/worker sub-scores |
| Project Enforcement Engine | `enforcement.engine.ts` | Published profile + FLHA/orientation/JHA checks |
| Supervisor/Safety Override Engine | `pm_project_safety_overrides` | Waive profile/zone/training/emergency rules |
| Offline Project Safety Engine | `applyOfflineSync` | Replay profile, hazards, controls, overrides, zones |

### Module wiring

- Exported: `PmProjectSafetyContextService`, `PmProjectSafetyCailIntelligenceService`
- Consumers: `PmSiteAccessControlModule` (`enforcementGate`), `PmProjectManagementModule` (auto-publish on project setup)

---

## 2. Database schema

Vera consolidates spec tables into a **profile-centric** model (zone/equipment/training/emergency rules stored as JSON on the profile and synced to access rules where applicable).

### `project_safety_profiles` → `PmProjectSafetyProfile` (`pm_project_safety_profiles`)

| Spec field | Vera column |
|------------|-------------|
| company_id | `companyId` |
| project_id | `projectId` (unique) |
| risk_level | `riskLevel` |
| required_jha_types | `requiredJhaTypes` (jsonb) |
| required_inspections | `requiredInspections` (jsonb) |
| required_training | `requiredTraining` (jsonb) |
| required_equipment_certifications | `requiredEquipmentCerts` (jsonb) |
| required_ppe | `requiredPpe` (jsonb) |
| required_emergency_plans | `requiredEmergencyPlans` (jsonb) |
| required_sds | `requiredSdsAcks` (jsonb) |
| version | `version` |
| published_at | `publishedAt` |
| zone rules (spec `project_zones` + `project_zone_rules`) | `zoneRulesJson` + `SiteAccessRule` rows |
| equipment rules | `equipmentRulesJson` |
| training rules | `trainingRulesJson` |
| emergency rules | `emergencyRulesJson` |

### `project_hazard_library` → `PmProjectHazard` (`pm_project_hazards`)

| Spec field | Vera column |
|------------|-------------|
| hazard_id | `id` (UUID) |
| severity / likelihood | `severity`, `likelihood` |
| sif_potential | `sifPotential` |
| heca_category | `hecaCategoryKey` |
| required_controls | `requiredControlIds` (jsonb) |
| version | `version` |
| status | `status` (draft / published / archived) |

### `project_control_library` → `PmProjectControl` (`pm_project_controls`)

| Spec field | Vera column |
|------------|-------------|
| control_id | `id` |
| control_strength | `controlType` (engineering / administrative / ppe / equipment) |
| verification_steps | `description` + metadata JSON |
| version | `version` |

### `project_safety_overrides` → `PmProjectSafetyOverride`

| Spec field | Vera column |
|------------|-------------|
| override_type | `ruleType` |
| reason | `reason` |
| approved_by | `approvedById` |
| expiry | `expiresAt` |

### Supporting tables

- `pm_project_safety_profile_versions` — publish snapshots
- `pm_project_safety_offline_cache` — last downloaded bundle per project
- `pm_project_safety_context_audit` — audit trail
- `project_safety_risk_snapshots` — score history (CAIL + predictive engine)

---

## 3. API contract

### Spec paths (`/api/v1/pm/project/safety`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profile` | Get/create/update/auto-generate/publish profile (`projectId` in body) |
| POST | `/hazards` | Create project hazard |
| POST | `/controls` | Create project control |
| POST | `/zones` | Upsert zone rules + sync to site access |
| POST | `/equipment` | Upsert equipment rules JSON |
| POST | `/training` | Upsert training rules JSON |
| POST | `/emergency` | Upsert emergency rules JSON |
| POST | `/override` | Create safety override |
| POST | `/offline/sync` | Upload offline changes; returns `serverState` bundle |
| GET | `/{project_id}/score` | Project safety score + CAIL sub-metrics |
| GET | `/{project_id}/analytics` | Trends and compliance leading indicators |
| GET | `/{project_id}/cail` | Insights + hazard forecast + score summary |

### Primary paths (`/api/v1/pm/project-safety-context`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/project/:projectId` | Full context dashboard payload |
| GET/PUT | `/profile/:projectId` | Profile CRUD |
| POST | `/profile/:projectId/auto-generate` | Profile generator engine |
| POST | `/profile/:projectId/publish` | Publish + version snapshot + zone sync |
| GET/POST | `/hazards/:projectId` | List/create hazards |
| POST | `/hazards/:projectId/import` | Multi-source hazard import |
| POST | `/hazards/:hazardId/publish` | Publish hazard |
| GET/POST | `/controls/:projectId` | List/create controls |
| POST | `/controls/:projectId/import` | Company control library import |
| PUT | `/zones/:projectId` | Zone rules bundle |
| PUT | `/equipment/:projectId` | Equipment rules |
| PUT | `/training/:projectId` | Training rules |
| PUT | `/emergency/:projectId` | Emergency rules |
| GET/POST | `/overrides/:projectId` | Overrides |
| POST | `/enforcement/:projectId/evaluate` | Enforcement simulation |
| GET | `/validate/:projectId` | Publish readiness (hazards↔controls, zones, etc.) |
| GET | `/score/:projectId` | Safety score |
| GET | `/analytics/:projectId` | Analytics bundle |
| GET | `/cail/insights/:projectId` | CAIL insights |
| GET | `/sync/project/:projectId` | Offline download bundle |
| POST | `/sync/project/:projectId` | Offline upload |

### Frontend clients

- Spec: `vera-frontend/lib/pm-project-safety.ts`
- Primary: `vera-frontend/lib/pm-project-safety-context.ts`

---

## 4. Frontend architecture

### Screens (UI routes under `/pm/project-safety-context`)

| Screen | Purpose |
|--------|---------|
| Project Safety Profile | Risk level, required JHA/training/PPE, publish workflow |
| Hazard Library | Draft/publish hazards, SIF/HECA flags, import |
| Control Library | Engineering/admin/PPE controls, company import |
| Zone Rule Manager | Zone codes, FLHA/JHA/high-risk flags (synced to access) |
| Equipment Rule Manager | Inspection/cert/LOTO JSON rules |
| Training Requirement Manager | Role → courses mapping |
| Emergency Requirement Manager | Plan type, equipment, training gates |
| Override Manager | Supervisor/safety waivers with expiry |
| Project Safety Dashboard | Context API + score + CAIL insights |
| Offline Project Safety Queue | Field sync download/upload |

### Components (recommended / partial in dashboard)

- `HazardCard`, `ControlCard`, `ZoneRuleEditor`, `EquipmentRuleCard`
- `TrainingRequirementCard`, `EmergencyPlanCard`, `OverrideApprovalCard`

Nav: `PmModuleNav.tsx` → Project Safety Context

---

## 5. Workflow logic

### States (spec → Vera)

| Spec state | Vera mapping |
|------------|--------------|
| Draft | `PmProjectSafetyPublishStatus.draft` |
| Published | `published` on profile/hazard/control |
| Enforced | Published profile + active `enforcementGate` / site access integration |
| Updated | Draft edits after publish (profile returns to draft on PUT) |

### Transitions

- Draft → Published: `POST .../publish` (profile, hazard, control)
- Published → Enforced: Site access / PM gates call `enforcementGate`
- Enforced → Updated: Profile/library edits set status back to `draft`

### Validation (`GET /validate/:projectId`)

- All published hazards should have `requiredControlIds`
- At least one zone rule (profile JSON or `SiteAccessRule`)
- Equipment, training, and emergency rule objects must be non-empty on profile

---

## 6. CAIL intelligence logic

`PmProjectSafetyCailIntelligenceService`:

| Capability | Method |
|------------|--------|
| Predictive project risk modeling | `generateProjectSafetyScore` → `predictedRisk` |
| Hazard forecasting | `hazardForecast` (inspection deficiencies, equipment failures) |
| Control suggestion | `suggestControlsForHazard` |
| Weak control detection | `weakControlDetection` |
| Zone risk scoring | `zoneRiskScore` per `SiteAccessRule` |
| Equipment risk scoring | `equipmentRiskScore` from `equipmentRulesJson` |
| Worker risk scoring | `workerExposureScore` in score bundle |
| Project safety score generation | `GET /{projectId}/score` persists `project_safety_risk_snapshots` |

Insights (`projectInsights`): unpublished profile, hazard backlog, SIF exposure, underestimated risk level.

---

## 7. Offline mode

**Download:** `GET /sync/project/:id` or field handler without upload payload.

Bundle: profile, published hazards/controls, overrides, zone rules, `syncedAt`.

**Upload:** `POST /offline/sync` or `POST /sync/project/:id` with:

```json
{
  "projectId": 1,
  "profile": { "riskLevel": "high" },
  "hazards": [{ "title": "...", "description": "...", "category": "energy" }],
  "controls": [],
  "overrides": [],
  "zoneRules": [{ "zoneCode": "ZONE_A", "highRisk": true }]
}
```

Field action `pmProjectSafetyContext.sync` — download by default; upload when `profile`, `hazards`, `controls`, `overrides`, or `zoneRules` present.

Cache table: `pm_project_safety_offline_cache` (`cacheKey: full_context`).

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Company Safety Context | Company hazard/control library import |
| Worker Safety Profiles | Training/orientation checks in enforcement |
| JHA / FLHA | Hazard import source; required JHA types on profile |
| Inspections | Deficiency → hazard import; inspection cadence on profile |
| Incidents | Incident → hazard import; score uses `pm_safety_events` |
| Corrective Actions | CAPA open/overdue in safety score |
| Equipment Safety | Equipment failure import; equipment rules JSON |
| SDS | `requiredSdsAcks` on profile |
| PM Module | Auto-generate + publish profile on project provisioning |
| Safety Stations | Context flags; enforcement via shared gates |
| Site Access Control | `enforcementGate`, zone rule sync to `SiteAccessRule` |
| Emergency Response | `emergencyRulesJson` (muster, site lock) |
| SIF / HECA | SIF-potential hazards; risk elevation signals |
| Unified Safety Intelligence | Aggregated `projectSafetyScore` in company intel |

---

## 9. Analytics

`GET /analytics/:projectId` and score endpoint return:

| Metric | Source |
|--------|--------|
| Project safety score trends | `project_safety_risk_snapshots` (90d) |
| Hazard trends | Group by `status` on `pm_project_hazards` |
| Control effectiveness trends | Group by `status` on `pm_project_controls` |
| Zone compliance | Active/high-risk zone counts |
| Equipment compliance | Keys in `equipmentRulesJson` |
| Training compliance | `requiredTraining` + `trainingRulesJson` roles |
| Leading indicators | Profile published, draft hazard backlog, weak controls, `predictedRisk` |

---

## Quick start

```bash
# Auto-generate and publish profile
POST /api/v1/pm/project/safety/profile
{ "projectId": 1, "autoGenerate": true, "publish": true }

# Safety score
GET /api/v1/pm/project/safety/1/score

# Offline sync (field)
# action: pmProjectSafetyContext.sync
# payload: { projectId: 1 }  # download
# payload: { projectId: 1, hazards: [...] }  # upload
```

See also: `docs/vera-pm-project-safety-context-system.md`
