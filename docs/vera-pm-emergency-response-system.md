# Vera PM — Emergency Response Module

Production API: `/api/v1/pm/emergency-response` · UI: `/pm/emergency-response`

Legacy muster API remains at `/api/v1/pm/safety/emergency` (backward compatible with `companyId` on create).

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-emergency-response/` |
| Engines | `emergency-workflow.engine.ts`, `muster-geofence.engine.ts` |
| Intelligence | `pm-emergency-cail-intelligence.service.ts` |
| Migration | `20260521220000_pm_emergency_response` |

### Table mapping

| Spec table | Prisma / DB |
|------------|-------------|
| `emergency_plans` | `EmergencyPlan` (extended) |
| `emergency_plan_versions` | `PmEmergencyPlanVersion` |
| `muster_sessions` | `MusterEvent` (renamed from `muster_event`) |
| `muster_attendance` | `MusterCheckin` (renamed from `muster_checkin`) |
| `emergency_events` | `PmEmergencyEvent` |
| `emergency_event_people` | `PmEmergencyEventPerson` |
| `emergency_event_equipment` | `PmEmergencyEventEquipment` |
| `emergency_event_attachments` | `PmEmergencyEventAttachment` |
| `emergency_notifications` | `PmEmergencyNotification` |
| `emergency_equipment` | `PmEmergencyEquipment` |
| `emergency_equipment_inspections` | `PmEmergencyEquipmentInspection` |
| `emergency_audit` | `PmEmergencyAuditLog` |
| Site lock | `pm_site_emergency_lock` |

## Workflows

### Emergency declared → Notifications → Muster → Evacuation → All-clear

1. **POST** `/events/declare` — creates event, locks site (`pm_site_emergency_lock`), dispatches notifications (SMS/email/push/in-app/safety_station audit rows), auto-starts muster
2. Muster **activated → accounting** on check-ins; **missing workers** recalculated → escalation notifications
3. **POST** `/muster/:id/all-clear` — unlocks site, transitions linked event to `all_clear`

### Plan workflow

`draft → review → approved → published → archived` with version snapshot on publish.

### Muster geofencing

`MusterGeofenceEngine` — Haversine check against `musterPointsJson` on published plans; sets `identityVerified` on check-in within radius (default 75m).

## Site access

- Active `pm_site_emergency_lock` → deny
- Missing at active muster → deny
- Unacknowledged access-gated emergency plans → deny

## CAIL scoring

- **Muster compliance**: `checkedIn / expected * 100`
- **Response quality**: penalties for slow muster, missing workers, low equipment readiness
- **Project emergency score**: average of muster compliance and equipment readiness avg
- Insights: missing workers, low readiness equipment, plan ack gaps

## Integrations

| Module | Hook |
|--------|------|
| Notifications | `NotificationsService.notifyUsers` per channel |
| CAPA | Failed/expired emergency equipment → `fromDocumentDeficiency` |
| Site access | `workerAccessCheck` in `SiteAccessService` |
| Safety stations | `GET /station/:companyId?siteId=` |
| Offline | `pmEmergency.sync` |

## Frontend

- `src/pages/pm/emergency-response/dashboard.tsx` — tabs: Muster, Plans, Declare, CAIL insights
- `lib/pm-emergency-response.ts`
