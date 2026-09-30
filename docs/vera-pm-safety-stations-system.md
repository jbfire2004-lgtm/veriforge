# Vera PM — Safety Stations Integration System

Production module for multi-company safety station hardware: registration, heartbeat monitoring, worker/equipment validation, JHA sync, muster, emergency mode, offline cache, CAIL intelligence, and PM integrations.

## Architecture

| Layer | Path |
|-------|------|
| API | `/api/v1/pm/safety-stations` |
| Legacy heartbeat | `/api/v1/pm/safety/stations` (delegates to PM service) |
| Module | `backend/src/pm-safety-stations/` |
| UI | `/pm/safety-stations` |
| Client | `vera-frontend/lib/pm-safety-stations.ts` |
| Migration | `20260521240000_pm_safety_stations` |

### Station types

`gate`, `zone`, `equipment`, `muster`, `emergency`, `mobile`, `vehicle`, `confined_space`, `custom`

### Status workflow

`pending` → `active` (requires `hardwareId` + `projectId`) → `offline` / `maintenance` → `deactivated` (soft delete)

### Engines

- `station-registration.engine.ts` — register / activate / deactivate validation
- `station-heartbeat.engine.ts` — offline, battery, sensor, firmware alerts
- `station-jha.engine.ts` — FLHA window, JHA signatures, controls, PPE
- `pm-safety-stations-cail-intelligence.service.ts` — denial trends, chronic non-compliance, risk scores

### Orchestration (`PmSafetyStationsService`)

- Worker validation → `PmSiteAccessControlService.stationValidate` + JHA engine
- Equipment validation → `PmEquipmentSafetyService.validateAssignment`
- Emergency payload → `PmEmergencyResponseService.stationPayload` + site lock
- Offline bundle → workers, equipment, JHA, zone rules, SDS (`PmDocumentControlService.stationSyncPayload`)

## Database

Extended `SafetyStation` and `safety_station_heartbeat`.

| Table | Model |
|-------|-------|
| `safety_station_access_logs` | `PmSafetyStationAccessLog` |
| `safety_station_equipment_logs` | `PmSafetyStationEquipmentLog` |
| `safety_station_muster_logs` | `PmSafetyStationMusterLog` |
| `safety_station_offline_cache` | `PmSafetyStationOfflineCache` |
| `safety_station_attachments` | `PmSafetyStationAttachment` |
| `safety_station_audit` | `PmSafetyStationAuditLog` |

Multi-company isolation via `companyId` on stations; soft delete via `deletedAt`.

## API (selected)

### Device (no JWT)

- `POST device/heartbeat/:code`
- `POST device/validate-worker`
- `POST device/validate-equipment`
- `POST device/muster-check-in`
- `GET device/offline-bundle/:stationId`
- `POST device/offline-sync/:stationId`

### Admin (JWT + PM roles)

- `POST register`, `PUT :id/activate`, `PUT :id/deactivate`
- `GET /`, `GET health`, `GET analytics`, `GET cail/insights`
- `POST validate-worker`, `POST validate-equipment`
- `POST muster/check-in`, `GET muster/status`
- `PUT :id/emergency-mode`

## Workflows

1. **Startup**: register → assign company/project/zone → activate → `buildOfflineBundle`
2. **Worker scan**: validate access + JHA → grant/deny → `safety_station_access_logs`
3. **Equipment scan**: operational status + assignment rules → equipment log
4. **Emergency**: `setEmergencyMode` blocks sign-in; muster check-in updates `muster_attendance`
5. **Offline**: cache bundle → field events → `applyOfflineSync` (clientSyncId dedupe)

## CAIL

- Worker risk: denials + CAPA + training gaps
- Equipment risk: LOTO, failures, inspections
- Zone risk: zone type + high-risk flag
- Predictive denial from failed checks map
- Project insights: denial rate, offline stations, chronic workers

## Integrations

| Module | Integration |
|--------|-------------|
| Site access | Full `validateAccess` gate |
| JHA/FLHA | Station JHA engine + offline JHA payload |
| Equipment safety | Assignment validation |
| Emergency | Plans, lock, muster attendance |
| Document control | SDS/policy offline payload |
| Inspections / CAPA / Incidents | Via site access orchestration |

## Frontend

Dashboard tabs: Heartbeat, Validate worker, Stations, Muster, CAIL, access log feed.

Offline sync action: `pmSafetyStations.sync` with `stationId` and optional `events`.

## Operations

Run migration, then `npx prisma generate` (stop backend if EPERM on Windows).
