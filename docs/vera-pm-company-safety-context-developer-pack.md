# Company Safety Context Engine — Developer-Ready Pack

Corporate safety standards: profile, hazard/control libraries, training matrix, policies, SDS, emergency plans, equipment rules, zone templates, enforcement gates, overrides, CAIL scoring, and offline field sync.

**Primary API:** `/api/v1/pm/company-safety-context`  
**Spec alias API:** `/api/v1/pm/company/safety`  
**UI:** `/pm/company-safety-context`  
**Offline sync:** `pmCompanySafetyContext.sync` (download + upload)  
**Backend:** `backend/src/pm-company-safety-context/`  
**Migration:** `20260521260000_pm_company_safety_context` (or bundled in company safety migration)

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| company-safety-profile-service | `getOrCreateProfile`, `updateProfile`, `autoGenerateProfile`, `publishProfile` |
| company-hazard-library-service | `listHazards`, `createHazard`, `publishHazard` |
| company-control-library-service | `listControls`, `createControl`, `publishControl` |
| company-training-matrix-service | `listTrainingMatrix`, `upsertTrainingRule`, `workerTrainingCheck` |
| company-policy-service | `listPolicies`, `createPolicy`, `publishPolicy`, `policyAckCheck` |
| company-sds-service | `listSds`, `createSds`, `importSdsFromLegacy` |
| company-emergency-plan-service | `listEmergencyPlans`, `createEmergencyPlan`, `importEmergencyFromLegacy` |
| company-equipment-rule-service | `listEquipmentRules`, `upsertEquipmentRule` |
| company-zone-template-service | `listZoneTemplates`, `upsertZoneTemplate`, `seedDefaultZoneTemplates` |
| company-enforcement-service | `enforcementGate`, `evaluate` via `company-enforcement.engine.ts` |
| override-service | `createOverride`, `listOverrides` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmCompanySafetyCailIntelligenceService` |
| audit-service | `company_safety_audit` (`PmCompanySafetyAuditLog`) |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Company Safety Profile Engine | `company-profile-generator.engine.ts` | Corporate risk, PPE standards, default training matrix |
| Company Hazard Library Engine | service + `hazard_library` mirror on publish | Corporate hazards with project sync |
| Company Control Library Engine | service + `control_library` mirror | Control strength, verification steps |
| Company Training Matrix Engine | `PmCompanyTrainingMatrix` | Role → course codes, expiry |
| Company Policy Engine | `PmCompanyPolicy` + ack table | Access-gated acknowledgments |
| Company SDS Engine | `PmCompanySdsLibrary` | WHMIS, PPE, expiry enforcement |
| Company Emergency Plan Engine | `PmCompanyEmergencyPlan` | Plan types, content JSON |
| Company Equipment Rule Engine | `PmCompanyEquipmentRule` | Certs, inspections, LOTO-style gates |
| Company Zone Template Engine | `PmCompanyZoneTemplate` | Templates → project `SiteAccessRule` on sync |
| Company Enforcement Engine | `company-enforcement.engine.ts` | Profile, training, policy, SDS, SIF gates |
| Supervisor/Safety Override Engine | `company_safety_overrides` | Signatures for high-risk waivers |
| Offline Company Safety Engine | `applyOfflineSync` | Replay corporate assets from field |

### Module wiring

- Imports: `PmProjectSafetyContextModule` (project sync on publish)
- Exported: `PmCompanySafetyContextService`, `PmCompanySafetyCailIntelligenceService`
- Consumers: site access, training, worker safety profile, project management, unified hazard/control

---

## 2. Database schema

Prisma `@@map` names match the spec table names.

### `company_safety_profiles` → `PmCompanySafetyProfile`

| Spec field | Vera column |
|------------|-------------|
| company_id | `companyId` (unique) |
| corporate_risk_level | `corporateRiskLevel` |
| corporate_policies | `policiesJson` + `PmCompanyPolicy` rows |
| corporate_ppe_standards | `ppeStandardsJson` |
| version | `version` |
| published_at | `publishedAt` |

Refs: `hazardLibraryRef`, `controlLibraryRef`, `trainingMatrixRef`, `sdsLibraryRef`, `equipmentRulesRef`, `zoneTemplatesRef`, `enforcementRulesJson`.

### `company_hazard_library` → `PmCompanyHazard`

| Spec field | Vera column |
|------------|-------------|
| hazard_id | `id` |
| severity / likelihood | `severity`, `likelihood` |
| sif_potential | `sifPotential` |
| heca_category | `hecaCategoryKey` |
| required_controls | `requiredControlIds` (jsonb) |
| required_training | `requiredTraining` (jsonb) |
| version | `version` |

### `company_control_library` → `PmCompanyControl`

| Spec field | Vera column |
|------------|-------------|
| control_strength | `controlStrength` (1–5) |
| verification_steps | `verificationSteps` (jsonb) |
| required_training | `requiredTraining` (jsonb) |

### `company_training_matrix` → `PmCompanyTrainingMatrix`

| Spec field | Vera column |
|------------|-------------|
| role | `roleType` |
| required_courses | `trainingCode` + `trainingName` per row (unique per role+code) |

### `company_policies` → `PmCompanyPolicy`

| Spec field | Vera column |
|------------|-------------|
| title | `title` |
| version | `version` |
| file_path | `storageKey` |
| published_at | `publishedAt` |

### `company_policy_acknowledgments` → `PmCompanyPolicyAcknowledgment`

| Spec field | Vera column |
|------------|-------------|
| policy_id | `policyId` |
| worker_id | `workerId` |
| acknowledged_at | `acknowledgedAt` |

### `company_sds_library` → `PmCompanySdsLibrary`

| Spec field | Vera column |
|------------|-------------|
| product_name | `productName` |
| cas_number | `casNumber` |
| whmis_classification | `whmisClass` |
| ppe_requirements | `ppeRequirements` (jsonb) |
| file_path | `legacySdsId` bridge + storage via SDS module |

### `company_emergency_plans` → `PmCompanyEmergencyPlan`

| Spec field | Vera column |
|------------|-------------|
| plan_type | `planType` |
| content | `contentJson` |
| published_at | `publishedAt` |

### `company_equipment_rules` → `PmCompanyEquipmentRule`

| Spec field | Vera column |
|------------|-------------|
| equipment_type | `ruleKey` |
| required_inspections | `requiredInspections` (jsonb) |
| required_certifications | `requiredCerts` (jsonb) |
| required_authorizations | `operatorAuthRequired` |
| required_controls | `requiredControls` (jsonb) |

### `company_zone_templates` → `PmCompanyZoneTemplate`

| Spec field | Vera column |
|------------|-------------|
| zone_type | `zoneType` |
| required_training | `requiredTraining` (jsonb) |
| required_ppe | `requiredPpe` (jsonb) |
| required_jha | `requiresJha` |
| required_permits | `requiresPermits` (jsonb) |
| required_sds | `requiresSdsAck` |

### Supporting tables

- `company_safety_profile_versions`, `company_policy_versions`, `company_sds_versions`, `company_emergency_plan_versions`
- `company_safety_overrides`, `company_safety_audit`, `company_safety_offline_cache`

---

## 3. API contract

### Spec paths (`/api/v1/pm/company/safety`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profile` | Get/create/update/auto-generate/publish (`companyId` in body) |
| POST | `/hazards` | Create corporate hazard |
| POST | `/controls` | Create corporate control |
| POST | `/training` | Upsert training matrix row |
| POST | `/policy` | Create policy |
| POST | `/sds` | Create SDS entry |
| POST | `/emergency` | Create emergency plan |
| POST | `/equipment` | Upsert equipment rule |
| POST | `/zones` | Upsert zone template |
| POST | `/override` | Create override (reason + expiry required) |
| POST | `/offline/sync` | Upload offline changes; returns `serverState` |
| GET | `/{companyId}/score` | Corporate safety score + CAIL metrics |
| GET | `/{companyId}/analytics` | Trends and compliance |
| GET | `/{companyId}/cail` | Insights + hazard forecast + score |

### Primary paths (`/api/v1/pm/company-safety-context`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/:companyId` | Dashboard context |
| GET | `/profile/:companyId` | Profile |
| POST | `/profile/:companyId/auto-generate` | Generator + default matrix/zones |
| POST | `/profile/:companyId/publish` | Publish + project sync |
| POST | `/profile/:companyId/sync-projects` | Push hazards/zones to active projects |
| GET/POST | `/hazards/:companyId`, POST `.../publish` | Hazard library |
| GET/POST | `/controls/:companyId`, POST `.../publish` | Control library |
| GET/PUT | `/training-matrix/:companyId` | Training matrix |
| GET/POST | `/policies/:companyId`, POST `.../publish` | Policies |
| GET/POST | `/sds/:companyId`, `/import-legacy` | SDS |
| GET/POST | `/emergency-plans/:companyId`, `/import-legacy` | Emergency |
| GET/PUT | `/equipment-rules/:companyId` | Equipment rules |
| PUT | `/zone-templates/:companyId` | Zone templates |
| GET/POST | `/overrides/:companyId` | Overrides |
| POST | `/enforcement/evaluate` | Gate simulation (`workerId`, `workerChecks`) |
| GET | `/validate/:companyId`, `/score/:companyId`, `/analytics/:companyId` |
| GET/POST | `/sync/company/:companyId` | Offline download/upload |
| GET | `/cail/insights/:companyId` | CAIL insights |

### Frontend clients

- Spec: `vera-frontend/lib/pm-company-safety.ts`
- Primary: `vera-frontend/lib/pm-company-safety-context.ts`

---

## 4. Frontend architecture

### Screens (`/pm/company-safety-context`)

| Screen | Purpose |
|--------|---------|
| Company Safety Profile | Corporate risk, PPE, publish + project sync |
| Hazard Library | Draft/publish, sync to projects |
| Control Library | Strength, verification, library mirror |
| Training Matrix Editor | Role/course/expiry rows |
| Policy Manager | Publish, ack requirements |
| SDS Library | Corporate SDS, expiry alerts |
| Emergency Plan Manager | Plan types, content |
| Equipment Rule Manager | Per equipment type (`ruleKey`) |
| Zone Template Manager | Templates for project zone sync |
| Override Manager | Supervisor/safety signatures |
| Company Safety Dashboard | Context + score + analytics |
| Offline Company Safety Queue | Field sync |

### Components (recommended)

- `PolicyCard`, `SDSCard`, `TrainingMatrixEditor`, `ZoneTemplateEditor`, `EmergencyPlanCard`, `OverrideApprovalCard`

---

## 5. Workflow logic

### States

| Spec | Vera `PmProjectSafetyPublishStatus` on profile/assets |
|------|------------------------------------------------------|
| Draft | `draft` |
| Published | `published` |
| Enforced | Published profile + `enforcementGate` active |
| Updated | Edits after publish reset asset rows to `draft` |

### Transitions

- Draft → Published: `publishProfile`, `publishHazard`, `publishControl`, `publishPolicy`
- Published → Enforced: Site access / training gates use published corporate profile
- Enforced → Updated: `updateProfile` or asset edits

### Validation (`GET /validate/:companyId`)

- Published hazards should have `requiredControlIds`
- Access-required policies should have acknowledgment activity
- No expired SDS entries
- Training matrix defines at least one role

---

## 6. CAIL intelligence logic

| Capability | Method |
|------------|--------|
| Predictive corporate risk | `generateCorporateSafetyScore`, `predictCorporateRisk` |
| Hazard forecasting | `hazardForecast` (inspections + incidents) |
| Control suggestion | `suggestControlsForHazard` |
| Weak control detection | `weakControls` in score bundle; `weakControlDetection` per control |
| Corporate safety score | `GET /{companyId}/score` |

Insights (`companyInsights`): unpublished profile, hazard backlog, SIF exposure, SDS expiry, project profile coverage gap.

---

## 7. Offline mode

**Download:** `GET /sync/company/:id` or field handler without upload payload.

Bundle: context, published hazards, controls, training, policies, SDS, emergency, equipment rules, zone templates, overrides.

**Upload:** `POST /offline/sync` with:

```json
{
  "companyId": 1,
  "profile": { "corporateRiskLevel": "high" },
  "hazards": [{ "title": "...", "description": "...", "category": "energy" }],
  "training": [{ "roleType": "worker", "trainingCode": "ORIENTATION", "trainingName": "...", "category": "orientation" }],
  "zoneTemplates": [{ "templateCode": "SITE", "zoneType": "general_work", "title": "Site" }]
}
```

Field action `pmCompanySafetyContext.sync` — upload when any of: `profile`, `hazards`, `controls`, `training`, `policies`, `sds`, `emergency`, `equipmentRules`, `zoneTemplates`, `overrides`.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Project Safety Context | `syncPublishedAssetsToProjects` — hazards, zones, auto project profiles |
| Worker Safety Profiles | Training matrix check, policy ack |
| JHA / FLHA | Hazard import at project level from corporate library |
| Inspections / Incidents | Hazard forecast sources |
| Corrective Actions | Score uses open/overdue CAPA |
| Equipment Safety | Equipment rules, enforcement actions |
| SDS / Document Control | Legacy import, expiry in gate |
| PM Module | Company profile on enterprise setup |
| Site Access Control | `enforcementGate` before project gate |
| Unified Safety Intelligence | Aggregated company scores from project profiles |

---

## 9. Analytics

`GET /analytics/:companyId` returns:

| Metric | Source |
|--------|--------|
| Corporate safety score trends | `safetyScore`, `scoreBand`, `predictedRisk` from CAIL engine |
| Hazard trends | Group by `status` on `company_hazard_library` |
| Control effectiveness trends | Group by `status` on `company_control_library` |
| Training compliance | Published matrix rows per `roleType` |
| Policy acknowledgment trends | `policyAcknowledgmentTrend` (90d ack timestamps) |
| Leading indicators | Weak controls, expired SDS flag, profile published |

---

## Quick start

```bash
POST /api/v1/pm/company/safety/profile
{ "companyId": 1, "autoGenerate": true, "publish": true }

GET /api/v1/pm/company/safety/1/score

# Field sync
# action: pmCompanySafetyContext.sync
# payload: { companyId: 1 }
```

See also: `docs/vera-pm-company-safety-context-system.md`
