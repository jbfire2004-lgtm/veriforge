# Vera PM — Site Access Control System

Production API: `/api/v1/pm/site-access-control` · UI: `/pm/site-access-control`

Legacy API `/api/v1/pm/safety/site-access` delegates `evaluate` to this engine when `PmSiteAccessControlModule` is loaded.

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-site-access-control/` |
| Engines | `access-decision.engine.ts`, `zone-access-rules.engine.ts` |
| Intelligence | `pm-site-access-cail-intelligence.service.ts` |
| Zone rules table | `access_zone_rules` (renamed from `site_access_rule`) |
| Migration | `20260521230000_pm_site_access_control` |

## Access decision outputs

| Decision | Meaning |
|----------|---------|
| `granted` | All gates pass or valid override |
| `denied` | Multiple failures |
| `denied_with_reason` | Single clear failure |
| `requires_supervisor_override` | Training/FLHA/orientation gaps — supervisor may override |
| `requires_safety_override` | High-risk/SIF/confined failures — safety signature required |

## Validation gates (worker)

1. Zone time window
2. Site orientation
3. Required training codes (expiry checked)
4. FLHA/JHA recency (`requiresFlhaHours`)
5. Zone JHA + supervisor signature (`requiresJha`)
6. SDS ack (`requiresSdsAck` + document control)
7. Emergency lock / muster missing
8. SIF/HECA, inspections, safety events, CAPA
9. Policy/SDS acknowledgments (document control)
10. Equipment fleet assignment rules
11. Equipment-specific validation when `equipmentId` provided
12. Safety meeting attendance requirements
13. Site ban (`WorkerSiteAccess`)

## Zone types

`general_work`, `high_risk`, `confined_space`, `hot_work`, `electrical_hazard`, `chemical_storage`, `equipment_operation`, `sif_high_energy`

## Override workflow

- Types: `temporary`, `one_time`, `zone_specific`, `equipment_specific`
- Requires: reason, `expiresAt`, supervisor signature
- High-risk zones: safety signature required
- Logged in `access_overrides` + `access_audit`
- Active override forces `granted` on next validation

## Tables

- `access_points` — gate definitions
- `access_zone_rules` — zone requirements (extends former site_access_rule)
- `access_attempts` + `access_denials` — every validation audit
- `access_overrides`, `access_attachments`
- `worker_access_requirements`, `equipment_access_requirements`
- `access_audit`

## API summary

| Method | Path |
|--------|------|
| POST | `/validate` |
| GET/POST | `/access-points` |
| GET/POST | `/zone-rules` |
| GET/POST | `/overrides`, POST `/overrides/:id/revoke` |
| GET | `/analytics/project/:id`, `/intelligence/project/:id` |
| GET | `/sync/project/:id` |
| POST | `/station/validate` |

## Analytics

- 30-day compliance %, denial rate, override rate
- Project access score = compliance %
- CAIL: high denial rate, chronic non-compliance workers

## Offline

`pmSiteAccess.sync` — downloads points, zone rules, roster, active overrides
