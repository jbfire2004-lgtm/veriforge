# Vera Safety Intelligence — Master Architecture (v2)

**Canonical reference** for the intelligent, project-based safety management ecosystem.  
**Implementation:** `backend/src/safety-intelligence/` · **Spec detail:** [vera-safety-intelligence.md](./vera-safety-intelligence.md) · **Config:** [vsi-configuration.md](./vsi-configuration.md)

---

## 1. System objective

Vera Safety Intelligence (VSI) connects inspections, BBO, incidents, equipment checks, and safety forms into a **single Corrective Action Intelligence Log (CAIL)** with AI enrichment, automated notifications, lessons learned, and executive dashboards.

**Design principle:** Sources are many; intelligence is one.

---

## 2. PM integration

Every safety record attaches to `project_id` and `owner_company_id`, with optional `site_id`, `equipment_id`, `worker_id`, and `location_note`.

| PM entity | VSI usage |
|-----------|-----------|
| Project | Required scope; dashboard partition |
| Company | Owner accountability; sub visibility |
| User / Role | Actor, assignee, verifier |
| Site / Equipment | Context on observations |
| SafetyForm | Emits CAIL via form bridge |
| CoreFile | Photo evidence (local/S3/presign) |

**API base:** `/api/v1/pm/safety-intelligence/`

---

## 3. Unified CAIL

### Source types
`inspection` · `bbo` · `incident` · `equipment` · `jha` · `flha` · `heca` · `sif` · `training` · `general`

### Lifecycle
`open` → `in_progress` → `resolved` → `verified` (+ `overdue`, `cancelled`)

### Idempotency
`UNIQUE (source_type, source_id, source_item_id)` via `CailEmitterService`

### Key endpoints
| Method | Path |
|--------|------|
| GET/POST | `/cail` |
| GET/PATCH | `/cail/:id` |
| POST | `/cail/:id/assign` · `/resolve` · `/verify` · `/cancel` |
| POST | `/cail/:id/ai/analyze` |

---

## 4. Modules (summary)

| # | Module | Emits CAIL when | API prefix |
|---|--------|-----------------|------------|
| 1 | Walk-around inspections | `at_risk` item | `/inspections` |
| 2 | BBO | `at_risk` observation | `/bbo` |
| 3 | Incident investigation | CAPA approved | `/incidents` |
| 4 | Equipment inspections | Failed checklist item | `/equipment-inspections` |
| 5 | Safety forms | Workflow triggers | Form bridge |
| 6 | Lessons learned | CAIL verified | `/lessons-learned` |
| 7 | RBAC | Query scope | `/project-roles` |
| 8 | Dashboards | Aggregates | `/dashboards` |

Full schemas and workflows: [vera-safety-intelligence.md](./vera-safety-intelligence.md).

---

## 5. AI engines

| Engine | Service | Trigger |
|--------|---------|---------|
| **Permanent Copilot** | `VsiCopilotEngineService` | `POST /ai/copilot/run` + all module routes |
| CAIL Intelligence | `SafetyIntelligenceAiService` → Copilot | `POST /cail/:id/ai/analyze` |
| Photo classifier | Copilot `inspection` module | `POST /inspections/ai/classify-photo` |
| Incident pack | `buildInvestigationPack` | `POST /incidents/:id/investigation/ai` |
| Lessons generator | `buildLessonInsights` | On verify |
| Presentation | `VsiPresentationsService` | `POST /presentations/generate/project/:id` |
| Predictive risk | `PredictiveRiskService` | Nightly cron + dashboard |

---

## 6. Phase 6 capabilities (current)

| Feature | Status |
|---------|--------|
| `POST /cail/:id/ai/analyze` | ✅ |
| `project_safety_role` per-project RBAC | ✅ |
| `project_safety_risk_snapshot` + nightly job | ✅ |
| `CAIL_ASSIGNED` notifications | ✅ |
| Lesson clusters + meeting topics | ✅ |
| Predictive risk on project dashboard | ✅ |
| CoreActionItem backfill admin API | ✅ |
| Domain events + dashboard revision | ✅ |
| Lesson embedding clusters | ✅ |
| Project roles admin UI | ✅ |

---

## 7. Permissions

**Global roles:** Prime (`ADMIN`, `PROJECT_MANAGER`, …) see all project CAIL; subs see `owner_company_id = self`.

**Project roles** (`project_safety_role`):

| Role | Effect |
|------|--------|
| `prime_admin` | Verify + full access on project |
| `company_safety_manager` | Verify on project |
| `supervisor` | Team access |
| `worker` | Assigned CAIL only |
| `client_readonly` | High/critical summary view |

Manage roles: `GET/POST /project-roles?projectId=`

---

## 8. Events & notifications

| Event | Channel |
|-------|---------|
| CAIL assigned | `CAIL_ASSIGNED` |
| CAIL overdue | `CAIL_OVERDUE` (hourly) |
| CAIL due soon | `CAIL_DUE_SOON` (daily) |

---

## 9. Migrations (apply in order)

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

Includes: `20260524120000_vsi_phase6_predictive_rbac`

---

## 10. Engineering checklist

- [ ] Configure Core uploads and optional LLM ([vsi-configuration.md](./vsi-configuration.md))
- [ ] Assign `project_safety_role` rows for each project team
- [ ] Run backfill for legacy CoreActionItems (`POST /admin/backfill-core-actions`)
- [ ] Trigger predictive compute: `POST /dashboards/project/:id/predictive-risk/compute`
- [ ] Validate sub vs prime accounts on CAIL list and verify actions

---

*This document is the executive index; extend module-specific detail in vera-safety-intelligence.md as the system evolves.*
