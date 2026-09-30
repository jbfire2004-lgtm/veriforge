# Vera Safety Intelligence (VSI) — Architecture Specification

**Version:** 1.0  
**Status:** Build-ready  
**Integrates with:** Vera PM (`Project`, `Company`, `ProjectAssignment`), Unified Safety Forms (`/api/v1/pm/safety-forms`), `Inspection`, `Incident`, `SafetyObservation`, `autonomous-safety`

---

## 1. Executive Summary

**Vera Safety Intelligence (VSI)** is a closed-loop, project-centric safety ecosystem centered on a single entity: the **Corrective Action Intelligence Log (CAIL)**. Every hazard, at-risk condition, failed inspection item, incident corrective action, and form-derived follow-up becomes a CAIL entry with a typed `source_type`, unified lifecycle, and AI-enriched metadata.

**Design principle:** Sources are many; intelligence is one.

```
[Inspection] [BBO] [Incident] [Equipment] [JHA/FLHA/HECA/SIF/Forms]
        \         |         |          |              /
         \        |         |          |             /
          v       v         v          v            v
              ┌─────────────────────────────┐
              │  CAIL (unified hub)         │
              │  open → resolved → verified │
              └──────────────┬──────────────┘
                             │
              ┌──────────────┴──────────────┐
              v                             v
    [Lessons Learned Log]        [Dashboards / AI Presentations]
```

---

## 2. Integration with Existing Vera PM

| PM entity | VSI usage |
|-----------|-----------|
| `Project` | Required scope for all CAIL entries; dashboard partition key |
| `Company` | `owner_company_id`; prime sees all, subs see own |
| `ProjectAssignment` | Validates worker ↔ project; auto-suggest owners |
| `Site` | Optional `site_id` / location on inspections |
| `Equipment` | Links equipment inspections and CAIL |
| `User` / `UserRole` | Creator, assignee, verifier; RBAC enforcement |
| `SafetyForm` (unified forms) | Emits CAIL via `source_type` = jha, flha, heca, sif, training, general |
| `Inspection` (equipment-core) | Emits CAIL on fail/at-risk checklist items |
| `Incident` | Parent for investigation; multiple CAIL children |
| `SafetyObservation` | **Migrate/evolve** into BBO module or alias |
| `CoreActionItem` | **Deprecate for safety** — new writes go to CAIL; optional sync bridge during migration |
| `autonomous-safety` (`@vera/autonomous-safety`) | Consumes CAIL + forms for scoring; returns suggestions stored on CAIL JSON fields |

**New API base:** `/api/v1/pm/safety-intelligence/`  
**New frontend shell:** `/pm/safety-intelligence/` (extends existing `/pm/safety-forms` premium UI)

---

## 3. Data Model

### 3.1 Enumerations

```sql
CREATE TYPE cail_source_type AS ENUM (
  'inspection', 'bbo', 'incident', 'equipment',
  'jha', 'flha', 'heca', 'sif', 'training', 'general'
);

CREATE TYPE cail_status AS ENUM (
  'open', 'in_progress', 'overdue', 'resolved', 'verified', 'cancelled'
);

CREATE TYPE cail_severity AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE cail_risk_category AS ENUM (
  'behavior', 'equipment', 'environment', 'process', 'ppe', 'ergonomic', 'other'
);

CREATE TYPE observation_polarity AS ENUM ('safe', 'at_risk');
```

### 3.2 CAIL — Core Table

```sql
CREATE TABLE cail_entry (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                  INT NOT NULL REFERENCES "Project"(id),
  owner_company_id            INT NOT NULL REFERENCES "Company"(id),
  assigned_user_id            INT REFERENCES "User"(id),
  source_type                 cail_source_type NOT NULL,
  source_id                   VARCHAR(128) NOT NULL,  -- polymorphic FK as string
  source_item_id              VARCHAR(128),           -- optional sub-item (photo line, checklist row)
  title                       VARCHAR(500) NOT NULL,
  description                 TEXT,
  status                      cail_status NOT NULL DEFAULT 'open',
  severity                    cail_severity NOT NULL DEFAULT 'medium',
  risk_category               cail_risk_category,
  due_date                    TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at                   TIMESTAMPTZ,
  verified_at                 TIMESTAMPTZ,
  created_by_user_id          INT REFERENCES "User"(id),
  verified_by_user_id         INT REFERENCES "User"(id),
  -- Evidence (normalized via cail_attachment; denormalized IDs optional)
  evidence_before             JSONB DEFAULT '[]',  -- [{ attachmentId, caption }]
  evidence_after              JSONB DEFAULT '[]',
  -- Root cause & AI
  root_cause_category         VARCHAR(100),
  root_cause_notes            TEXT,
  ai_root_cause_suggestions   JSONB,
  ai_corrective_action_suggestions JSONB,
  ai_classification           JSONB,  -- { hazardType, behaviorType, confidence }
  lessons_learned_generated   BOOLEAN NOT NULL DEFAULT false,
  lessons_learned_id          UUID REFERENCES lessons_learned_entry(id),
  tags                        JSONB DEFAULT '[]',
  -- PM context
  site_id                     INT REFERENCES "Site"(id),
  work_package_id             INT,  -- future: WorkPackage FK
  location_note               VARCHAR(500),
  equipment_id                INT REFERENCES "Equipment"(id),
  worker_id                   INT REFERENCES "Worker"(id),
  -- SLA / metrics
  overdue_at                  TIMESTAMPTZ,
  time_to_resolve_hours       FLOAT,
  UNIQUE (source_type, source_id, source_item_id)  -- idempotent creation
);

CREATE INDEX idx_cail_project_status ON cail_entry (project_id, status);
CREATE INDEX idx_cail_owner_status ON cail_entry (owner_company_id, status);
CREATE INDEX idx_cail_due ON cail_entry (due_date) WHERE status IN ('open','in_progress','overdue');
CREATE INDEX idx_cail_source ON cail_entry (source_type, source_id);
```

**Extensions beyond minimum spec:** `source_item_id`, `ai_classification`, `site_id`, `equipment_id`, `worker_id`, `lessons_learned_id`, SLA fields.

### 3.3 CAIL Attachments & Activity

```sql
CREATE TABLE cail_attachment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cail_id       UUID NOT NULL REFERENCES cail_entry(id) ON DELETE CASCADE,
  phase         VARCHAR(16) NOT NULL,  -- 'before' | 'after'
  file_name     VARCHAR(255) NOT NULL,
  storage_key   VARCHAR(500),
  mime_type     VARCHAR(100),
  uploaded_by   INT REFERENCES "User"(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cail_activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cail_id       UUID NOT NULL REFERENCES cail_entry(id) ON DELETE CASCADE,
  event_type    VARCHAR(64) NOT NULL,
  actor_user_id INT,
  payload       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Module 1 — Safety Inspections (Walk-around)

```sql
CREATE TABLE safety_inspection (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        INT NOT NULL REFERENCES "Project"(id),
  inspector_user_id INT NOT NULL REFERENCES "User"(id),
  company_id        INT REFERENCES "Company"(id),  -- inspector's company
  title             VARCHAR(255),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  site_id           INT REFERENCES "Site"(id),
  location_note     VARCHAR(500),
  status            VARCHAR(32) NOT NULL DEFAULT 'in_progress',  -- in_progress | completed
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE safety_inspection_item (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id         UUID NOT NULL REFERENCES safety_inspection(id) ON DELETE CASCADE,
  polarity              observation_polarity NOT NULL,
  photo_attachment_id   UUID,  -- core file / blob ref
  photo_data_url        TEXT,  -- offline staging
  caption               TEXT,
  owner_company_id      INT REFERENCES "Company"(id),
  assigned_user_id      INT REFERENCES "User"(id),
  equipment_id          INT REFERENCES "Equipment"(id),
  category              cail_risk_category,
  severity              cail_severity,
  notes                 TEXT,
  cail_entry_id         UUID REFERENCES cail_entry(id),  -- set when at_risk
  ai_suggestions        JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.5 Module 2 — BBO

Industry ABC / STOP-style observations. UI: `/pm/safety-intelligence/bbo`.

```sql
CREATE TABLE bbo_observation (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          INT NOT NULL REFERENCES "Project"(id),
  observed_by_user_id INT NOT NULL REFERENCES "User"(id),
  observer_company_id INT REFERENCES "Company"(id),
  polarity            observation_polarity NOT NULL,
  behavior_description TEXT NOT NULL,
  location_note       VARCHAR(500),
  work_activity       VARCHAR(500),
  workers_observed_count INT,
  behavior_category   bbo_behavior_category, -- body_position|ppe|tools_equipment|procedures|housekeeping|line_of_fire|other
  safe_behaviors      TEXT,
  at_risk_behaviors   TEXT,
  antecedents         JSONB,                 -- ABC triggers
  feedback_given      BOOLEAN NOT NULL DEFAULT false,
  feedback_notes      TEXT,
  worker_response     TEXT,
  action_agreed       TEXT,
  action_owner_user_id INT REFERENCES "User"(id),
  action_due_at       TIMESTAMPTZ,
  steering_escalate   BOOLEAN NOT NULL DEFAULT false,
  site_id             INT REFERENCES "Site"(id),
  equipment_id        INT REFERENCES "Equipment"(id),
  worker_id           INT REFERENCES "Worker"(id),
  owner_company_id    INT REFERENCES "Company"(id),
  assigned_user_id    INT REFERENCES "User"(id),
  severity            cail_severity,
  risk_category       cail_risk_category,
  cail_entry_id       UUID REFERENCES cail_entry(id),
  ai_analysis         JSONB,
  observed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.5b Worker PPE pre-use kit

Personal daily kit inspection (not serialized inventory). UI: `/pm/inspections/ppe-preuse`. API: `/api/v1/pm/ppe-preuse`.

```sql
CREATE TABLE ppe_pre_use_inspection (
  id UUID PRIMARY KEY,
  project_id INT NOT NULL,
  company_id INT NOT NULL,
  worker_user_id INT NOT NULL,
  overall_result ppe_pre_use_overall_result NOT NULL, -- pass|fail|conditional
  items JSONB NOT NULL, -- checklist id → pass|fail|na + notes
  removed_from_service BOOLEAN NOT NULL DEFAULT false,
  acknowledged_safe_to_work BOOLEAN NOT NULL DEFAULT false,
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Visible to company and project management via scoped list/detail.

### 3.6 Module 3 — Incidents (extends existing `Incident`)

```sql
-- Extend Incident via metadata JSON or new table:
CREATE TABLE incident_investigation (
  id                    INT PRIMARY KEY REFERENCES "Incident"(id) ON DELETE CASCADE,
  project_id            INT NOT NULL REFERENCES "Project"(id),
  investigation_status  VARCHAR(32) NOT NULL DEFAULT 'open',
  narrative             TEXT,
  immediate_actions     TEXT,
  witness_statements    JSONB DEFAULT '[]',
  ai_investigation_pack   JSONB,  -- root causes, similar incidents, CAPA list
  lead_investigator_id  INT REFERENCES "User"(id),
  closed_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incident_corrective_action_plan (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id       INT NOT NULL REFERENCES "Incident"(id),
  cail_entry_id     UUID NOT NULL REFERENCES cail_entry(id),
  action_type       VARCHAR(32) NOT NULL,  -- corrective | preventive
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.7 Module 4 — Equipment Inspection Bridge

Reuse `Inspection` model; add bridge:

```sql
CREATE TABLE equipment_inspection_cail_link (
  inspection_id     INT NOT NULL REFERENCES "Inspection"(id),
  checklist_item_id VARCHAR(64) NOT NULL,
  cail_entry_id     UUID NOT NULL REFERENCES cail_entry(id),
  PRIMARY KEY (inspection_id, checklist_item_id)
);
```

**Rule:** On `Inspection` submit where `passed = false` or item `passed = false`, emit CAIL per failed item.

### 3.8 Module 5 — Safety Form → CAIL Bridge

```sql
CREATE TABLE safety_form_cail_link (
  safety_form_id    UUID NOT NULL REFERENCES safety_forms(id),
  field_id          VARCHAR(64),
  cail_entry_id     UUID NOT NULL REFERENCES cail_entry(id),
  PRIMARY KEY (safety_form_id, cail_entry_id)
);
```

**Generic emission rules** (configured per form definition):

| Trigger | CAIL `source_type` |
|---------|-------------------|
| FLHA / JHA hazard + inadequate controls | `flha` / `jha` |
| HECA observation, at-risk BBO form | `heca` |
| SIF potential flag | `sif` |
| Training gap form | `training` |
| General inspection / corrective action form | `general` / `inspection` |

Extend `SafetyFormDefinition.workflow`:

```json
{
  "autoGenerateCail": true,
  "cailSourceType": "flha",
  "cailTriggers": [
    { "field": "controlsAdequate", "equals": "no" },
    { "field": "sifPotential", "equals": true }
  ]
}
```

### 3.9 Module 6 — Lessons Learned

```sql
CREATE TABLE lessons_learned_entry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cail_id             UUID NOT NULL UNIQUE REFERENCES cail_entry(id),
  project_id          INT NOT NULL REFERENCES "Project"(id),
  company_id          INT NOT NULL REFERENCES "Company"(id),
  source_type         cail_source_type NOT NULL,
  title               VARCHAR(500) NOT NULL,
  summary             TEXT NOT NULL,
  root_cause          TEXT,
  corrective_action   TEXT,
  before_evidence     JSONB,
  after_evidence      JSONB,
  severity            cail_severity,
  time_to_close_hours FLOAT,
  tags                JSONB DEFAULT '[]',
  ai_cluster_id       VARCHAR(64),
  ai_insights         JSONB,
  published_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.10 Permissions (RBAC)

```sql
CREATE TABLE project_safety_role (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  INT NOT NULL REFERENCES "Project"(id),
  user_id     INT NOT NULL REFERENCES "User"(id),
  company_id  INT REFERENCES "Company"(id),
  role        VARCHAR(32) NOT NULL,
  -- prime_admin | company_safety_manager | supervisor | worker | client_readonly
  UNIQUE (project_id, user_id)
);
```

---

## 4. CAIL Lifecycle State Machine

```
open ──assign──> in_progress ──submit resolution──> resolved ──verify──> verified
  │                    │                              │
  │                    └── overdue (scheduler) ───────┤
  └── cancel ───────────────────────────────────────> cancelled
```

**Overdue job:** Daily cron sets `status = overdue` when `due_date < now()` and status ∈ (`open`, `in_progress`).

**Lessons Learned trigger:** On transition to `verified`, async job creates `lessons_learned_entry` if `lessons_learned_generated = false`.

---

## 5. API Design (`/api/v1/pm/safety-intelligence`)

### 5.1 CAIL

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cail` | List (filtered by project, company scope, status, source_type) |
| POST | `/cail` | Manual CAIL create (general) |
| GET | `/cail/:id` | Detail + activity + attachments |
| PATCH | `/cail/:id` | Update assignment, due date, severity |
| POST | `/cail/:id/assign` | Assign user/company |
| POST | `/cail/:id/resolve` | Submit resolution + after evidence |
| POST | `/cail/:id/verify` | PM/safety lead verification |
| POST | `/cail/:id/cancel` | Cancel with reason |
| POST | `/cail/:id/attachments` | Upload before/after evidence |
| POST | `/cail/:id/ai/analyze` | Trigger AI root cause / CAPA suggestions |

### 5.2 Inspections

| Method | Path | Description |
|--------|------|-------------|
| POST | `/inspections` | Start walk-around |
| POST | `/inspections/:id/items` | Add photo item (safe/at_risk) |
| PATCH | `/inspections/:id/items/:itemId` | Tag owner, severity, category |
| POST | `/inspections/:id/complete` | Complete; auto-create CAIL for at_risk |
| GET | `/inspections` | List by project |

### 5.3 BBO

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bbo` | Submit ABC observation (category, antecedents, feedback, follow-up) |
| GET | `/bbo` | List (company-scoped); filter `polarity`, `behaviorCategory` |
| GET | `/bbo/metrics` | Positive ratio + at-risk-by-category |

### 5.3b PPE pre-use kit

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/pm/ppe-preuse/checklist` | Kit checklist definitions |
| POST | `/api/v1/pm/ppe-preuse` | Worker submits pre-use kit inspection |
| GET | `/api/v1/pm/ppe-preuse` | Company/project management list |
| GET | `/api/v1/pm/ppe-preuse/:id` | Detail |

### 5.4 Incidents

| Method | Path | Description |
|--------|------|-------------|
| POST | `/incidents/:id/investigation` | Open investigation |
| POST | `/incidents/:id/investigation/ai` | Run AI pack |
| POST | `/incidents/:id/corrective-actions` | Bulk create CAIL from AI/manual |
| GET | `/incidents/:id/cail` | List linked CAIL entries |

### 5.5 Equipment

| Method | Path | Description |
|--------|------|-------------|
| POST | `/equipment-inspections/:inspectionId/emit-cail` | Bridge from Inspection submit |
| GET | `/equipment/:id/cail` | Equipment-scoped CAIL |

### 5.6 Lessons Learned & Dashboards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lessons-learned` | List (project/company filtered) |
| GET | `/lessons-learned/clusters` | AI cluster view |
| GET | `/dashboards/project/:projectId` | Prime dashboard |
| GET | `/dashboards/company/:companyId` | Sub dashboard |
| POST | `/presentations/generate` | AI slide narrative |

---

## 6. Permission Enforcement Strategy

**Query filter injection** (NestJS guard + Prisma middleware):

```typescript
// Pseudocode — applied to every CAIL query
function cailScope(user, query) {
  if (user.role === 'PRIME_ADMIN' || user.projectRole === 'prime_admin')
    return { ...query, project_id: allowedProjectIds(user) };
  if (user.role === 'CLIENT_READONLY')
    return { ...query, project_id, status: { not: 'cancelled' }, severity: { in: ['high','critical'] } }; // summary only
  // Subcontractor
  return { ...query, project_id, owner_company_id: user.companyId };
}
```

| Actor | CAIL read | CAIL write | Verify | Dashboard |
|-------|-----------|------------|--------|-----------|
| Prime PM / safety lead | All on project | All | Yes | Full + cross-company |
| Sub safety manager | Own company | Own company resolve | No | Company-only |
| Sub supervisor | Assigned + own co | Assigned resolve | No | Team view |
| Worker | Assigned only | Submit evidence | No | Minimal |
| Client owner | Aggregates | None | No | Read-only executive |

---

## 7. Workflow Descriptions

### 7.1 Inspection → CAIL → Close → Lesson

1. Inspector starts `safety_inspection` on mobile.
2. For each photo: `polarity = safe | at_risk`.
3. If `at_risk`: select `owner_company_id`, severity; optional AI classifies photo.
4. On item save: **CailEmitterService** creates `cail_entry` (`source_type=inspection`, `source_id=inspection_item.id`).
5. **NotificationEngine** sends push/email to owner assignee.
6. Owner uploads after photo + notes → `POST /cail/:id/resolve`.
7. PM verifies → `verified` → **LessonsLearnedService** materializes entry.

### 7.2 BBO → CAIL

Same as inspection item flow; `source_type=bbo`. Safe BBOs increment positive metrics only.

### 7.3 Incident → AI → CAIL

1. Incident logged (existing `/incidents`).
2. Investigation opened; AI receives narrative + photos + related CAIL/BBO/inspections.
3. AI returns ranked root causes + CAPA list → stored in `ai_investigation_pack`.
4. User selects CAPAs → bulk create CAIL entries with owners.
5. Each CAPA tracked through standard CAIL lifecycle.

### 7.4 Equipment Inspection → CAIL

On `Inspection` submit: parse `checklist` JSON; for each `passed: false`, emit CAIL with `owner_company_id = equipment.companyId`.

### 7.5 Safety Form → CAIL

On form submit (existing `SafetyFormSubmissionsService`): evaluate `workflow.cailTriggers`; emit CAIL; link via `safety_form_cail_link`. **Migrate** from current `CoreActionItem` bridge.

---

## 8. AI Integration Points

| Trigger | Input | Output | Storage |
|---------|-------|--------|---------|
| Inspection photo upload | Image + project context | polarity, hazard type, severity | `safety_inspection_item.ai_suggestions` |
| BBO submit | Text + metadata | behavior class, risk, CAPA | `bbo_observation.ai_analysis`, CAIL JSON |
| Incident investigation | Narrative, photos, related CAIL | 5-Whys, fishbone, CAPA list | `incident_investigation.ai_investigation_pack` |
| CAIL analyze (manual) | Description + evidence | root cause, CAPA | `cail_entry.ai_*` |
| Lesson cluster (batch) | Verified CAIL set | clusters, systemic issues | `lessons_learned_entry.ai_*` |
| Presentation | Dashboard metrics + lessons | Markdown/slide JSON | ephemeral / `presentation_run` table |

**Service:** Extend `AutonomousSafetyService` + new `SafetyIntelligenceAiService` calling `@vera/autonomous-safety` or LLM provider with structured JSON schema responses.

---

## 9. Dashboards & Metrics

**Primary metrics (from CAIL):**

- Open / in_progress / overdue / verified counts
- Mean time to resolve (MTTR) by company, source_type, severity
- Source mix pie (inspection vs bbo vs incident…)
- Repeat offender tags (same `risk_category` + `equipment_id` within 30d)
- Positive ratio: safe observations / total observations
- Leading: BBO + inspection counts per week
- Lagging: incident-linked CAIL, SIF-tagged entries

**Layouts:**

- **Prime:** Project heatmap by company; overdue table; trend lines; company comparison (PM only).
- **Sub:** My open actions; my overdue; my MTTR; positive recognition feed.
- **Client:** Executive summary; incident count; verified lessons highlights.

---

## 10. Implementation Scaffolding

```
backend/src/safety-intelligence/
  safety-intelligence.module.ts
  cail/
    cail.controller.ts
    cail.service.ts
    cail-emitter.service.ts      # idempotent create from sources
    cail-scope.guard.ts            # company/project RBAC
    cail-state.machine.ts
  inspections/
  bbo/
  incidents/
  equipment-bridge/
  lessons-learned/
  dashboards/
  ai/
  notifications/
  dto/

packages/vera-api-contract/src/schemas/safety-intelligence.ts

vera-frontend/
  app/pm/safety-intelligence/
  src/pages/pm/safety-intelligence/
  lib/safety-intelligence/
  src/components/safety-intelligence/   # reuses sf-theme from safety-forms
```

**Migration path:**

1. Deploy `cail_entry` + services.
2. Bridge new inspections/BBO to CAIL.
3. Redirect `SafetyFormCorrectiveActionsService` to CAIL emitter.
4. Backfill `CoreActionItem` safety rows into CAIL (optional).
5. Deprecate direct `CoreActionItem` creation for safety modules.

---

## 11. Scalability & Extensibility

- **New form types:** Add `cail_source_type` enum value + trigger config in form definition JSON.
- **New modules (permits, crane, LOTO):** Implement `CailEmitter` adapter interface:

```typescript
interface CailEmitterAdapter {
  sourceType: CailSourceType;
  shouldEmit(payload: unknown): boolean;
  buildEntries(payload: unknown, ctx: EmitContext): Promise<CreateCailDto[]>;
}
```

- **Partitioning:** `cail_entry` partitioned by `project_id` at scale.
- **Event bus:** Emit `DomainEvent.CAIL_CREATED`, `CAIL_VERIFIED` for autonomous-safety, command-center, digital-twin.

---

## 12. Example Payloads

### Create inspection item (at-risk)

```json
POST /api/v1/pm/safety-intelligence/inspections/{id}/items
{
  "polarity": "at_risk",
  "coreFileId": 1234,
  "caption": "Unprotected excavation edge",
  "ownerCompanyId": 7,
  "assignedUserId": 101,
  "severity": "high",
  "riskCategory": "environment",
  "locationNote": "Grid B, north trench"
}
```

### CAIL resolve

```json
POST /api/v1/pm/safety-intelligence/cail/{id}/resolve
{
  "resolutionNotes": "Installed barricades and signage",
  "evidenceAfter": [{ "storageKey": "...", "caption": "After barricades" }]
}
```

---

## 13. Optional follow-ups (implemented)

| Feature | Notes |
|---------|--------|
| Photo upload + preview | `coreFileId` on inspection items; `VsiPhotoUpload` + Core uploads (local / S3 / presigned direct) |
| Evidence galleries | CAIL `evidenceBefore` / `evidenceAfter` JSON on detail page |
| AI classify photo | Vision → optional LLM → VASE pipeline |
| CAIL overdue job | Hourly cron marks past-due open items + in-app notifications |
| CAIL due-soon job | Daily reminders for items due within 3 days |
| Server-side photo classify | `coreFileId` → read bytes → OCR → Vision/LLM/VASE |
| CoreActionItem backfill | `POST .../admin/backfill-core-actions` (admin) |
| CAIL AI analyze | `POST /cail/:id/ai/analyze` |
| Project safety roles | `GET/POST /project-roles` |
| Predictive risk snapshots | Nightly job + dashboard card |
| CAIL assigned notifications | On assign |

**Master index:** [vera-safety-intelligence-master.md](./vera-safety-intelligence-master.md)  
**Copilot engine:** [vsi-copilot-engine.md](./vsi-copilot-engine.md)  
**Configuration:** [vsi-configuration.md](./vsi-configuration.md).

---

*End of specification.*
