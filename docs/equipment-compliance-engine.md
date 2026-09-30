# Equipment Compliance Engine

Central service: `EquipmentComplianceService` (`backend/src/modules/equipment-compliance/`).

## Denormalized fields on `Equipment`

| Field | Description |
|-------|-------------|
| `complianceStatus` | `COMPLIANT`, `NEEDS_ATTENTION`, `NON_COMPLIANT`, `LOCKED_OUT` |
| `lastInspectionAt` | Latest completed inspection |
| `nextInspectionAt` | Next due from inspection scheduling |
| `lockoutStatus` | `CLEAR` or `LOCKED_OUT` |
| `competencyRequired` | Asset has competency rules |
| `trainingRequired` | Asset has training requirements |
| `complianceUpdatedAt` | Last engine run |

History remains in `EquipmentComplianceStatus` and `EquipmentLink.complianceStatus`.

## Triggers

`recalculate(equipmentId, { trigger })` runs after:

- Inspection submit / unlock (`INSPECTION`, `UNLOCK`)
- Competency evaluation (`COMPETENCY`)
- Training ingest / pipeline (`TRAINING`)
- Equipment lockout / unlock (`LOCKOUT`, `UNLOCK`)
- Maintenance record (`MAINTENANCE`)
- Calibration (`CALIBRATION`)

## API

- `GET /api/v1/equipment-compliance/dashboard?companyId=`
- `POST /api/v1/equipment-compliance/equipment/:id/recalculate`
- `GET /api/v1/equipment?compliant=true|false&complianceStatus=`

## UI

- `/admin/equipment/compliance` — compliance dashboard
- Equipment list — compliance filter + badges
- Equipment detail — compliance badge + next inspection
