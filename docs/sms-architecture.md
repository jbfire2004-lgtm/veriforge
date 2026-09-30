# Vera Safety Management System (SMS) — Architecture

## Overview

The Vera SMS is a **monolith-first** integrated safety ecosystem built on the NestJS backend (`backend/`) and Next.js frontend (`vera-frontend/`). All PM safety modules share:

| Pillar | Purpose |
|--------|---------|
| **SCL** | Safe / Conditional / Loss classification for leading indicators |
| **HECA** | Human & Equipment Critical Activities library and tagging |
| **Energy Wheel** | Energy types + control state for hazard analysis |

The **`pm-sms-core`** module (`backend/src/pm-sms-core/`) is the canonical integration layer. Existing modules remain the system of record for their domains.

## Module map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Safety Hub (/pm/safety-hub)           │
│  Dashboard · Evidence · Notifications · Cross-domain timeline    │
└────────────────────────────┬────────────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────────┐      ┌──────────────────┐
│ pm-sms-core │◄────►│ Event bus       │◄────►│ Notification     │
│ SCL/HECA/   │      │ (DomainEvent)   │      │ router + engine  │
│ Energy      │      └─────────────────┘      └──────────────────┘
└──────┬──────┘
       │
   ┌───┴───┬──────────┬────────────┬─────────────┬──────────────┐
   ▼       ▼          ▼            ▼             ▼              ▼
Inspections Investigations CAPA    Contractor   Substance      Predictive
(pm-        (pm-safety-  (pm-      Portal       Testing        Analytics
inspections) events)     corrective) (pm-       (pm-substance) (pm-predictive)
                         actions)   contractor-
                                    portal)
```

## Data model

### Shared risk context — `PmSmsRiskContext`

Polymorphic attachment keyed by `(entityType, entityId)`:

- `inspection_finding`, `corrective_action`, `safety_event`, `investigation`, etc.
- Stores SCL, HECA, energy profile, escalation score, `requiresInvestigation`

### Domain extensions

| Table | SMS fields |
|-------|------------|
| `pm_inspection_photo_finding` | `scl_state`, `heca_*`, `energy_*`, `requires_investigation` |
| `pm_safety_event` | `scl_state`, triggers/precursors, `energy_profile_json`, `mandatory_investigation` |
| `pm_safety_event_investigation` | `scl_classification_json`, `heca_verification_json`, `energy_wheel_json` |

### HECA library — `PmSmsHecaLibraryEntry`

Company-scoped critical tasks/equipment with required controls, verification steps, training codes, and default energy types.

### Analytics — `PmSmsWeeklyRiskForecast`

Weekly forecast with SCL breakdown, HECA hotspots, and energy control gaps.

## API surface

Base path: **`/api/v1/pm/sms`**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/meta` | SCL states, energy catalog |
| GET | `/heca-library` | List HECA entries |
| POST | `/heca-library/seed` | Seed default HECA library |
| GET | `/risk-context` | Filter risk contexts |
| PUT | `/inspections/findings/:id/tags` | Apply SCL/HECA/Energy + escalation |
| PUT | `/investigations/:id/scl` | Classify incident SCL |
| PUT | `/investigations/:id/energy-wheel` | Save energy profile |
| PUT | `/investigations/:id/heca-verification` | HECA verification Q&A |
| GET | `/analytics/leading-indicators` | SCL/HECA/Energy leading indicators |

Existing module APIs remain unchanged; SMS core augments them.

## Inspection workflow (photo pipeline)

1. **Capture** → `PmInspectionPhotoPipelineService.captureAndAnalyze`
2. Vision + LLM → structured findings
3. **Auto CAPA** → `PmInspectionFindingCapaService`
4. **SMS auto-tag** → `SmsInspectionIntegrationService.autoTagFromAnalysis`
5. **Escalation engine** → severity bump, due date compression, mandatory investigation flag
6. **Contractor dispatch** when `responsibleParty = contractor`

Escalation rule: **HECA + high energy + SCL conditional/loss** → critical severity, investigation required, notification `heca.high_energy.escalation`.

## Investigation workflow

- TapRooT-style pathways via `RcaEngine` (existing)
- SMS-extended guided questions when SCL/HECA/energy data present
- SCL classification required for incidents, near misses, high-potential events
- Energy wheel profile stored on event + investigation
- CAPA integration via `PmInvestigationCapaIntegrationService` (existing)

## Predictive analytics

`RiskScoringModelEngine` weights:

- SCL conditional/loss counts
- HECA exposure
- High-energy exposure

Feature extraction includes `sclState`, `hecaInvolved`, `highEnergyFlag` on photo findings and safety events.

## Contractor portal

Inbox items include `smsRiskContext` for each corrective action dispatch — SCL/HECA/Energy visible to subcontractors.

## Notifications

`PmSmsNotificationRoute` per company defines channels, roles, and templates. Default routes seeded for CAPA overdue, critical findings, contractor dispatch, mandatory investigation, substance non-negative, predictive alerts, HECA escalation.

Channels: `in_app`, `email`, `push` (SMS channel stub in core notifications).

## Offline mode

- `clientSyncId` on risk context and photo findings
- Existing `pm-offline-mode` engine queues inspection captures; SMS tags sync on replay via standard field sync

## Security & permissions

- SMS API: `WORKER`, `SUPERVISOR`, `ADMIN`, `COMPANY_ADMIN`, `PROJECT_MANAGER`, `CONTRACTOR_ADMIN`, `CONTRACTOR_USER`
- Contractor portal: scoped to `PmContractorPortalMembership` and dispatch access assertions

## Frontend

| Path | Component |
|------|-----------|
| `/pm/sms` | SMS core dashboard |
| `/pm/safety-hub` | Unified hub (SCL/HECA KPIs) |
| `components/sms/SclHecaEnergyPanel.tsx` | Reusable tagging UI |

API client: `vera-frontend/lib/pm-sms-core.ts`

## Events

Domain events (`domain-events.ts`):

- `sms.scl_classified`
- `sms.heca_escalation`
- `sms.mandatory_investigation`
- `sms.weekly_forecast`

Hub invalidation via `SafetyEcosystemEventsService.invalidateHub`.

## Migration

Run: `npm run migrate` (applies `20260528120000_sms_core_scl_heca_energy`).

## Integration with Vera Core

Workers, companies, projects, and equipment link through existing FK relationships on PM entities. HECA competency ties to `pm-worker-safety-profile` and training modules via `trainingCodesJson` on HECA library entries.
