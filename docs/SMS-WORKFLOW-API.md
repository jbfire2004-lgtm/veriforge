# SMS Workflow API

Unified REST facade for Vera PM SMS field tools. The workflow API delegates to existing domain modules; granular operations (hazards, photos, signatures, SCL tags) remain on legacy routes.

## Base path

```
/api/v1/pm/sms/workflows
```

Discover supported entities and status enums:

```
GET /api/v1/pm/sms/workflows
```

## Entities

| Entity slug | Domain | Legacy base path |
|-------------|--------|------------------|
| `flha` | Field Level Hazard Assessment | `/api/v1/pm/jha-flha` (kind=FLHA) |
| `jha` | Job Hazard Analysis | `/api/v1/pm/jha-flha` (kind=JHA) |
| `inspection` | Checklist / smart-site inspections | `/api/v1/pm/inspections` |
| `audit` | Focus audits | `/api/v1/pm/inspections` (focus_audit templates) |
| `corrective-action` | CAPA | `/api/v1/pm/corrective-actions` |
| `investigation` | Incident investigation | `/api/v1/pm/incidents/:eventId/investigation` |

SCL / HECA / Energy Wheel tagging:

```
GET  /api/v1/pm/sms/energy-wheel/catalog
GET  /api/v1/pm/sms/heca-library
GET  /api/v1/pm/sms/risk-context/:entityType/:entityId
PUT  /api/v1/pm/sms/risk-context/:entityType/:entityId
PUT  /api/v1/pm/sms/inspections/findings/:findingId/tags
PUT  /api/v1/pm/sms/investigations/:eventId/scl
PUT  /api/v1/pm/sms/investigations/:eventId/energy-wheel
PUT  /api/v1/pm/sms/investigations/:eventId/heca-verification
```

## Standard operations

For each entity slug `{entity}`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workflows/{entity}` | List records (query: `companyId`, `projectId`, `status`, `limit`) |
| `POST` | `/workflows/{entity}` | Create draft |
| `GET` | `/workflows/{entity}/:id` | Get by id |
| `PATCH` | `/workflows/{entity}/:id` | Update draft / in-progress overview & answers |
| `POST` | `/workflows/{entity}/:id/submit` | Submit or advance to verification/review |

## Create body (required fields)

### `flha` / `jha`

```json
{
  "companyId": 1,
  "projectId": 1,
  "taskDescription": "Install guardrail at level 3"
}
```

### `inspection` / `audit`

```json
{
  "companyId": 1,
  "projectId": 1,
  "templateId": "uuid-of-published-template",
  "title": "Site walk — June 15"
}
```

### `corrective-action`

```json
{
  "companyId": 1,
  "projectId": 1,
  "title": "Replace damaged guard",
  "sourceModule": "inspection",
  "sourceId": "inspection-uuid"
}
```

### `investigation`

```json
{
  "companyId": 1,
  "projectId": 1,
  "eventId": "incident-uuid"
}
```

## PATCH body (workflow sections)

The UI workflow steps map to PATCH fields:

| Step | PATCH fields |
|------|----------------|
| Overview | `overview`, `taskDescription`, `workScope`, `locationNote`, `answers`, `title`, `narrative` |
| Hazards / Findings | **501** — use `POST /pm/jha-flha/:id/hazards` or inspection photo capture |
| Controls / Actions | **501** — use CAPA or control endpoints |
| Signatures | **501** — use entity signature endpoints |
| Attachments | **501** — use entity attachment upload endpoints |

Bulk section arrays (`hazards`, `findings`, `controls`, etc.) return `501 NOT_IMPLEMENTED` with guidance to legacy routes.

## Status enums (shared with Prisma)

- **FLHA/JHA:** `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `LOCKED`, `REJECTED`
- **Inspection:** `draft`, `in_progress`, `submitted`, `review_required`, `approved`, `rejected`, `closed`
- **Corrective action:** `draft`, `open`, `assigned`, `in_progress`, `verification_pending`, `verified`, `closed`, `cancelled`
- **Investigation:** `not_started`, `evidence_gathering`, `analysis`, `root_cause`, `capa_planning`, `review`, `closed`

Types are exported from `@vera/api-contract` (`SmsWorkflowEntitySchema`, status schemas).

## Error envelope

All errors use the canonical API envelope via `HttpExceptionFilter`:

```json
{
  "status": "error",
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "taskDescription is required to create an FLHA/JHA draft",
  "errors": [{ "code": "VALIDATION_ERROR", "message": "...", "details": { "field": "taskDescription" } }],
  "timestamp": "2026-06-15T12:00:00.000Z"
}
```

`501 NOT_IMPLEMENTED` is returned when a workflow PATCH section is not yet supported on the facade.

## Frontend mapping

| Frontend lib | Primary API |
|--------------|-------------|
| `lib/jha-flha.ts` | `/api/v1/pm/jha-flha` |
| `lib/pm-inspections.ts` | `/api/v1/pm/inspections` |
| `lib/pm-corrective-actions.ts` | `/api/v1/pm/corrective-actions` |
| `lib/pm-incidents.ts` | `/api/v1/pm/incidents` |
| `lib/pm-sms-core.ts` | `/api/v1/pm/sms` (SCL/HECA/Energy) |
| `lib/sms-workflow.ts` | `/api/v1/pm/sms/workflows` (unified facade) |

The SMS workflow UI pages continue to use domain libs for granular operations; the facade is available for list/create/get/patch/submit consistency and future consolidation.

## Logging

Workflow operations emit structured logs:

```json
{ "type": "sms.workflow", "operation": "create", "entity": "flha", "companyId": 1, "projectId": 1, "actorId": 42 }
```

## Not yet implemented

| Feature | Response |
|---------|----------|
| `POST /api/v1/hazards/ai-identify` (full LLM) | Returns `source: "stub"` with rule-engine fallback until vision/LLM is configured |
| Bulk workflow PATCH for hazards/signatures/attachments | `501` with legacy route hints |
