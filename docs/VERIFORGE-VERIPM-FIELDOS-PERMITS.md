# VERIPM ↔ FieldOS Permit Integration — Full Architecture

**Status:** Implemented  
**Surfaces:** `/pm/permits`, `/field/permits`, `/pm/dashboard`, `/core/dashboard`, `/core/contractor-scores`

---

## 1. Microservice architecture

Logical services (co-located in Nest today; split-ready via EventBus):

```
┌─────────────────┐     create      ┌──────────────────────────┐
│  VERIPM Service │ ───────────────▶│ FieldOS Integration Svc  │
│  PmPermitsSvc   │                 │ FieldOsPermitClient      │
│  veripm_permits │◀── webhook ─────│ VeripmFieldosPermitsSvc  │
└────────┬────────┘                 └────────────┬─────────────┘
         │                                       │
         │ activity + events                     │ fieldos_task_id
         ▼                                       ▼
┌─────────────────┐                 ┌──────────────────────────┐
│ Activity Ledger │                 │ FieldOS Permit Tasks UI  │
│ veripm_permit_  │                 │ /field/permits           │
│ activity        │                 └──────────────────────────┘
└────────┬────────┘
         │ DomainEvent bus
         ├──────────────────▶ VERICore Safety (FLHA/JHA link, incidents)
         ├──────────────────▶ CSS Impact (risk-weighted Δ on performance)
         └──────────────────▶ Dashboard Analytics (revision invalidate)
```

| Service | Responsibility | Nest entry |
|---------|----------------|------------|
| VERIPM Permits | Lifecycle CRUD on `PmPermit` + `veripm_permits` | `PmPermitsService` |
| FieldOS Integration | Outbound task create, inbound webhook, field map | `FieldOsPermitClient`, `VeripmFieldosPermitsService` |
| VERICore Safety | High-risk FLHA/JHA link, incident-in-window | `linkOrCreateSafetyForms`, `linkIncidentsInWindow` |
| Activity + Pipeline | Append-only activity, event fan-out | `VeripmPermitActivityService`, `VeripmPermitEventPipeline` |
| Dashboard Analytics | Metric recalc on `permit.dashboard.invalidate` | frontend stores + `emitAnalyticsEvent` |
| CSS Scoring | Risk-weighted permit deltas on performance pillar | `computePermitCssDelta` + `applyPermitCssImpact` |

### Event bus names

| Event | When |
|-------|------|
| `permit.created` | VERIPM permit registry row created |
| `permit.fieldos.pushed` | FieldOS task created, `fieldos_task_id` stored |
| `permit.fieldos.updated` | Webhook applied |
| `permit.closed` | Status → closed |
| `permit.safety.linked` | FLHA/JHA link evaluated |
| `permit.css.impact` | Contractor score delta emitted |
| `permit.dashboard.invalidate` | Dashboards should refresh |
| `compliance.recalc` | Downstream CSS / compliance |

---

## 2. SQL schema

### `veripm_permits`

See Prisma `VeripmPermit` / migration `20260712000000_veripm_fieldos_permits`.

Key columns: `permit_id`, `company_id`, `project_id`, `job_id`, `asset_id`, `contractor_id`, `pm_permit_id`, `fieldos_task_id`, `permit_type`, `risk_level`, `status`, `required_signatures`, `required_documents`, `required_ppe`, `start_time`, `end_time`, `created_by_user_id`, `fieldos_metadata_json`, `safety_links_json`, `work_order_ids_json`, timestamps.

### `veripm_permit_activity`

Migration `20260712010000_veripm_permit_activity`:

| Column | Purpose |
|--------|---------|
| `activity_id` | PK |
| `permit_id` | FK → veripm_permits |
| `kind` | created, fieldos_pushed, fieldos_webhook, signature, photo, note, hazard_control, safety_linked, work_order_updated, incident_linked, css_impact, closed, status_changed |
| `source` | veripm \| fieldos \| vericore \| css \| system |
| `status_from` / `status_to` | Transition |
| `fieldos_task_id` | Correlation |
| `summary` | Human-readable |
| `payload_json` | Full event body |
| `photo_url`, `signature_role`, `signature_name` | Field evidence |
| `css_delta` | Score impact applied |
| `occurred_at` | Event time |

```bash
cd backend
npx prisma generate
npx prisma db execute --file prisma/migrations/20260712010000_veripm_permit_activity/migration.sql
```

---

## 3. API definitions

Base (Nest, proxied via `api/v1/pm`): `/api/v1/pm/fieldos-permits`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create VERIPM permit + push FieldOS |
| GET | `/` | List + `countsByStatus` |
| GET | `/metrics` | Aggregates for dashboards |
| GET | `/tasks` | In-process FieldOS task list |
| GET | `/revision` | Dashboard poll token |
| GET | `/:permitId` | Detail + FieldOS task + activities |
| GET | `/:permitId/drill` | Drill-down: formula, mapping, activity, links |
| POST | `/:permitId/push` | Re-push to FieldOS |
| POST | `/webhook` | FieldOS → VERIPM (optional `x-vera-signature`) |

Preview BFF (no Nest auth): `/api/v1/veripm-fieldos-permits/*`

Classic PM permits still create via `POST /api/v1/permits` and auto-bridge to FieldOS.

### Webhook body

```json
{
  "task_id": "fos-…",
  "external_permit_id": "uuid",
  "status": "closed",
  "signatures": [{ "role": "issuer", "name": "…", "signedAt": "…" }],
  "photos": [{ "id": "…", "url": "…", "caption": "…" }],
  "notes": ["…"],
  "hazard_controls_applied": ["…"],
  "completed_at": "ISO-8601"
}
```

---

## 4. FieldOS mapping

| VERIPM (`veripm_permits`) | FieldOS Permit Task |
|---------------------------|---------------------|
| `permit_id` | `external_permit_id` |
| `company_id` | `company_id` |
| `project_id` | `project_id` |
| `job_id` | `job_id` |
| `asset_id` | `asset_id` |
| `contractor_id` | `contractor_id` |
| `permit_type` | `permit_type` |
| `risk_level` | `risk_level` |
| `required_signatures` | `required_signatures` |
| `required_documents` | `required_documents` |
| `required_ppe` | `required_ppe` |
| `start_time` / `end_time` | `start_time` / `end_time` |
| title (request) | `title` |
| ← `fieldos_task_id` | `task_id` (response) |

Constant: `FIELDOS_PERMIT_FIELD_MAP` in Nest + frontend.

Env: `FIELDOS_PERMIT_API_URL`, `FIELDOS_PERMIT_API_KEY`, `FIELDOS_WEBHOOK_SECRET`.

---

## 5. Dashboard bindings

### VERIPM (`/pm/dashboard`)

| Metric key | Binding |
|------------|---------|
| `pm.permits_active` | Open/active FieldOS-linked permits |
| `pm.permits_high_risk` | High/critical open |
| `pm.permits_by_status` | FieldOS-linked count + by-status table |
| Project view `projectPermits` | load, risk distribution, contractor compliance %, permit-related incidents, PM readiness score |

### VERICore (`/core/dashboard`)

| Metric key | Binding |
|------------|---------|
| `sms.permits_protected` | Permit-protected work count |
| `sms.permits_high_risk` | High-risk open permits |
| Drill | Routes to permit drill items (FLHA/JHA + FieldOS) |

---

## 6. Contractor Safety Score impact

Risk weights: low 0.5 · medium 1.0 · high 1.5 · critical 2.0

| Event | Base Δ | Applied |
|-------|--------|---------|
| `closed_clean` | +4 | × risk |
| `signatures_complete` | +1.5 | × risk |
| `hazard_controls_logged` | +1 | × risk |
| `sync_error` | −3 | × risk |
| `cancelled` | −2 | × risk |
| `closed_with_incident` | −12 | × risk |

Applied to CSS **performance** pillar via `applyPermitCssImpact` (preview) and `permit.css.impact` events (Nest). Evidence type: `permit_performance`.

---

## 7. Project dashboard integration

`projectPermitLoad(projectId)` → `VeriPmProjectDashboard.projectPermits`:

- Permit load (open/total)
- Risk distribution
- Contractor compliance % (contractors without sync_error / permit-window incidents)
- Permit-related incidents
- PM readiness score / blockers (high-risk open blocks readiness)

UI: project scope on `/pm/dashboard?projectId=1`.

---

## Key files

| Area | Path |
|------|------|
| Schema | `backend/prisma/schema.prisma` |
| Nest integration | `backend/src/pm-permits/veripm-fieldos-*.ts`, `veripm-permit-activity.service.ts` |
| Preview store | `vera-frontend/lib/veripm-fieldos-permits/` |
| CSS impact | `…/css-impact.ts`, `contractor-safety-score/store.ts` |
| Dashboards | `veripm-dashboard/*`, `vericore-dashboard/*` |
| Field UI | `app/field/permits`, `components/field/FieldOsPermitsView.tsx` |
