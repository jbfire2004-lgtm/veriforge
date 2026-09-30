# Inspection Module — API Contract

Base path: `/api/v1/inspections`  
Auth: Bearer JWT. Roles noted per endpoint.

Shared enums: `InspectionType`, `InspectionChecklistCategory` (see `@vera/api-contract`).

---

## Checklists

### `GET /checklists`

Query: `inspectionType?`, `category?`, `activeOnly?` (default true)

**Response `200`:** `InspectionChecklist[]`

```json
{
  "id": 1,
  "name": "Pre-use — mobile equipment",
  "category": "MOBILE_EQUIPMENT",
  "inspectionType": "PRE_USE",
  "items": [{ "id": "visual", "label": "Visual walk-around", "required": true }],
  "intervalDays": null,
  "intervalHours": null,
  "active": true,
  "createdAt": "2026-05-15T22:00:00.000Z",
  "updatedAt": "2026-05-15T22:00:00.000Z"
}
```

### `GET /checklists/:id`

**Response `200`:** `InspectionChecklist`

### `POST /checklists` (company admin)

**Body:**

```json
{
  "name": "Custom crane checklist",
  "category": "CRANE",
  "inspectionType": "CRANE_LIFT",
  "items": [{ "id": "wire", "label": "Wire rope condition", "required": true }],
  "intervalDays": 30,
  "intervalHours": null,
  "active": true
}
```

**Response `201`:** `InspectionChecklist`

### `PUT /checklists/:id` (company admin)

**Body:** partial of create. **Response `200`:** `InspectionChecklist`

---

## Submit inspection

### `POST /`

Roles: supervisor, worker.

**Body:**

```json
{
  "equipmentId": 42,
  "workerId": 7,
  "siteId": 3,
  "checklistId": 1,
  "inspectionType": "PRE_USE",
  "kind": "PRE_USE",
  "checklist": {
    "visual": { "passed": true },
    "controls": { "passed": false, "notes": "Gauge stuck" }
  },
  "passed": false,
  "photos": ["https://cdn.example/inspection/1.jpg"],
  "correctiveActions": "Replace gauge before use",
  "notes": "Cold start",
  "meterReading": 1250.5,
  "signature": "data:image/png;base64,..."
}
```

**Response `201`:** `Inspection` (+ side effects below)

```json
{
  "id": 100,
  "equipmentId": 42,
  "workerId": 7,
  "inspectorId": 12,
  "inspector": { "id": 12, "email": "super@co.com", "username": "super" },
  "supervisorId": 12,
  "checklistId": 1,
  "inspectionType": "PRE_USE",
  "kind": "PRE_USE",
  "checklist": { "visual": { "passed": true } },
  "passed": false,
  "status": "FAILED",
  "photos": ["https://cdn.example/inspection/1.jpg"],
  "correctiveActions": "Replace gauge before use",
  "lockoutTriggered": true,
  "nextInspectionDate": null,
  "completedAt": "2026-05-16T10:00:00.000Z",
  "createdAt": "2026-05-16T10:00:00.000Z",
  "equipment": { "id": 42, "name": "Excavator 01", "catalogTypeKey": "excavator" },
  "worker": { "id": 7, "firstName": "Jane", "lastName": "Doe" }
}
```

**Side effects on fail (`passed: false`):**

- Equipment lockout (`lockedOutAt`, `safetyStatus: UNSAFE`)
- `EquipmentLockout` audit row
- `EquipmentLink.complianceStatus` → `LOCKED_OUT`
- `EquipmentComplianceStatus` snapshot with `inspectionId`
- In-app notifications (`INSPECTION_FAILED`) to company admins/supervisors

**Side effects on pass:**

- `nextInspectionDate` from checklist `intervalDays` / `intervalHours` or type defaults
- `EquipmentComplianceStatus` → `COMPLIANT` (when company-linked)
- Clears lockout if previously `UNSAFE`
- Updates `meterHours` when `meterReading` provided
- **Worker wallet:** upserts `WorkerWalletItem` when `workerId` set (`ACTIVE` / `FAILED`)

---

## Queries

### `GET /dashboard`

Query: `companyId?`  
**Response `200`:**

```json
{
  "totalInspections": 120,
  "passed": 100,
  "failed": 8,
  "lockedOutEquipment": 2,
  "dueWithin7Days": 5,
  "recent": [/* Inspection[] */]
}
```

### `GET /due`

Query: `companyId?`, `withinDays?` (default 7)  
**Response `200`:** `Inspection[]` with upcoming `nextInspectionDate`

### `GET /equipment/:equipmentId`

**Response `200`:** `Inspection[]` history

### `GET /:id`

**Response `200`:** single `Inspection`

---

## Unlock after failed inspection

### `POST /equipment/:equipmentId/unlock`

**Body:** `{ "notes": "Repairs verified" }`  
**Response `200`:** `{ "equipmentId": 42, "unlocked": true }`

Clears equipment lockout, closes open `EquipmentLockout`, writes `EquipmentComplianceStatus` → `COMPLIANT`.

---

## Due notifications (cron / admin)

### `POST /notify-due`

Query: `companyId?`, `withinDays?` (default 7)  
**Response `200`:** `{ "notified": 10, "equipmentCount": 3 }`

Creates `INSPECTION_DUE` in-app notifications (idempotent per equipment per day).

---

## Integration endpoints

| System | Endpoint | Field |
|--------|----------|-------|
| Equipment wallet | `GET /api/v1/core/wallets/equipment/:id` | `inspectionHistory`, `complianceStatus`, `lockedOut` |
| Equipment wallet | `GET /api/v1/equipment/:id/wallet` | same |
| Worker wallet | `GET /api/v1/core/wallets/worker/:id` | `walletItems` (updated on inspection with `workerId`) |
| Legacy alias | `POST /api/v1/core/inspections` | delegates to submit |
| Compliance history | Prisma `EquipmentComplianceStatus` | `inspectionId`, `status`, `notes` |

---

## Inspection types (seeded checklists)

| Type | Use |
|------|-----|
| `PRE_USE` | Daily operator check |
| `SCHEDULED` | Formal periodic |
| `PME` | Preventive maintenance (hours-based) |
| `CRANE_LIFT` | Crane / lift |
| `LIFTING_GEAR` | Rigging / slings |
| `VEHICLE` | Pre-trip |
| `TOOL` | Hand/power tools |
| `HYDRAULIC_PNEUMATIC` | Hydraulic / pneumatic |

Zod schemas: `packages/vera-api-contract/src/schemas/inspection.ts`.
