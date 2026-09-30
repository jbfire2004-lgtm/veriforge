# API Endpoints

Base: `/api/v1/hub/industry-safety`  
Auth: session/JWT + RBAC  
Envelope (Hub style, align with existing `/api/v1` modules):

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-07-10T06:00:00.000Z",
    "plane": "project",
    "suppressed": false,
    "entityCount": 12,
    "minSample": 5
  }
}
```

---

## Selectors & metadata

### `GET /selectors`

Query: `entityType=project|company`

Returns industries, subtypes for that entity type, scale bands, periods available.

**Validation:** `entityType` required. Does not return the other type’s subtypes.

---

### `GET /cohort`

Primary aggregate for a dashboard.

Query:

| Param | Required | Notes |
|-------|----------|-------|
| `entityType` | yes | `project` \| `company` |
| `industry` | yes | |
| `subtype` | yes | Must match entityType enum |
| `scale` | yes | `small\|medium\|large\|mega` |
| `period` | yes | `YYYY-MM` or `YYYY-Qn` |

**Response `data`:** `IndustryCohortAggregate` (see `types.ts`)

**Rules:**

- Router selects plane from `entityType` only  
- If `entityCount < 5` → `data.metrics = null`, `meta.suppressed = true`  
- Reject if subtype enum mismatches entityType (`400`)  

---

### `GET /metrics/heca` · `/metrics/trif-ltif` · `/metrics/leading` · `/metrics/corrective-actions` · `/metrics/competency` · `/metrics/seasonal`

Same query params as `/cohort`.  
Optional split endpoints for panel-level loading.  
Each enforces the same plane + threshold rules.

---

### `POST /predictive/risk`

Body:

```json
{
  "entityType": "project",
  "industry": "construction",
  "subtype": "infrastructure",
  "scale": "large",
  "period": "2026-Q2"
}
```

Returns cohort-level `PredictiveRiskResult` or suppressed payload.  
**Does not** accept entity ID lists.

Permission: `HUB_INDUSTRY_SAFETY_VIEW` (+ model entitlement if any).

---

### `POST /cross-compare`

Permission: `HUB_INDUSTRY_SAFETY_CROSS_COMPARE`

Body:

```json
{
  "industry": "energy",
  "scale": "mega",
  "period": "2026-Q2",
  "project": { "subtype": "energy_project" },
  "company": { "subtype": "owner_operator" },
  "explicitConsent": true
}
```

**Validation:**

- `explicitConsent === true` required  
- Industry, scale, period required and shared  
- Loads project + company cohorts separately  
- Returns `{ project, company, deltas? }` — no silent blend  

Audit log on every call.

---

### `POST /contribute`

Permission: `HUB_INDUSTRY_SAFETY_CONTRIBUTE`

Body: tenant-scoped contribution job request (`entityType`, period range).  
Triggers privacy pipeline; returns job id.

---

### `GET /contribute/jobs/:id`

Status of contribution / anonymization job.

---

## Error codes

| Code | Meaning |
|------|---------|
| `VISI_PLANE_MISMATCH` | Subtype/entityType mismatch |
| `VISI_MIXED_PLANE` | Attempt to query both planes without cross-compare |
| `VISI_SUPPRESSED` | n &lt; 5 (also expressed via meta) |
| `VISI_CROSS_DENIED` | Missing permission or consent |
| `VISI_INVALID_SCALE` | Unknown scale band |

---

## Example — project cohort

`GET /api/v1/hub/industry-safety/cohort?entityType=project&industry=construction&subtype=infrastructure&scale=large&period=2026-Q2`

```json
{
  "data": {
    "cohort": {
      "industry": "construction",
      "entityType": "project",
      "subtype": "infrastructure",
      "scale": "large",
      "period": "2026-Q2"
    },
    "metrics": {
      "heca": { "highEnergyRate": 0.12, "controlsVerifiedRate": 0.81 },
      "trif": 1.4,
      "ltif": 0.35,
      "leading": { "nearMissRate": 2.1, "inspectionCompletion": 0.92 },
      "correctiveActions": { "onTimeRate": 0.78, "overdueCountAvg": 3.2 },
      "competency": { "currentRate": 0.88, "expiring30dRate": 0.07 },
      "seasonal": [],
      "predictive": null
    }
  },
  "meta": {
    "plane": "project",
    "entityCount": 14,
    "minSample": 5,
    "suppressed": false,
    "timestamp": "2026-07-10T06:00:00.000Z"
  }
}
```
