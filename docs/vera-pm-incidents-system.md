# Vera PM Incidents, Near Miss & Observation System

Unified safety event management with intake wizard, injury/medical tracking, RCA engines, SIF/HECA integration, CAIL CAPA, equipment lockout, site access gates, and offline sync.

**API base:** `/api/v1/pm/incidents`  
**UI base:** `/pm/incidents`

---

## 1. Database schema

| Table | Maps to spec | Purpose |
|-------|----------------|---------|
| `pm_safety_event` | `incidents` | Main event record |
| `pm_safety_event_version` | `incident_versions` | Version snapshots on edit |
| `pm_safety_event_injury` | `incident_injuries` | Body part, WCB, medical aid, lost time |
| `pm_safety_event_person` | `incident_people` | Involved parties |
| `pm_safety_event_equipment` | `incident_equipment` | Equipment links + lockout flag |
| `pm_safety_event_witness` | `incident_witnesses` | Witness registry |
| `pm_safety_event_statement` | `incident_statements` | Signed statements |
| `pm_safety_event_attachment` | `incident_attachments` | Media |
| `pm_safety_event_root_cause` | `incident_root_causes` | 5-Why / fishbone / TapRoot JSON |
| `pm_safety_event_contributing_factor` | `incident_contributing_factors` | Factors |
| `pm_safety_event_corrective_action` | `incident_corrective_actions` | CAPA + CAIL link |
| `pm_safety_event_audit` | `incident_audit` | Audit trail |
| `pm_root_cause_library` | — | Company root cause library |
| `pm_contributing_factor_library` | — | Contributing factor library |
| `pm_safety_event_type_library` | — | Custom company event types |

**Migration:** `20260519200000_pm_safety_events`

---

## 2. Event types (`PmSafetyEventType`)

- `incident_injury`, `incident_property`, `incident_environmental`, `incident_equipment`
- `near_miss`, `hazard_observation`, `positive_observation`, `behavioral_observation`
- `equipment_failure`, `security_event`, `custom` (+ `PmSafetyEventTypeLibrary`)

---

## 3. Workflow

```
draft → submit → [review_required | submitted]
review_required → approve → locked (+ closedAt)
                 → reject → rejected
                 → request_changes → draft
```

**Supervisor review required when:**
- `severity` high or critical
- `requiresSupervisorReview` from risk engine
- Medical aid or lost time injury
- Equipment failure type

---

## 4. Engines

| Engine | Function |
|--------|----------|
| `EventClassificationEngine` | Keyword auto-type + HECA energy hint |
| `SeverityRiskEngine` | Severity × likelihood → riskScore 0–100 |
| `RcaEngine` | Suggest root causes; build 5-Why chain |
| `PmSafetyEventsIngestionService` | High/critical / injury / near_miss → SIF/HECA |
| `PmSafetyEventsEquipmentService` | Lockout linked equipment on failure/critical |
| `PmSafetyEventsIntelligenceService` | Project score, trends, worker risk |

---

## 5. API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List events |
| POST | `/` | Create draft (auto classify + score) |
| GET | `/:id` | Full detail |
| PUT | `/:id` | Update draft + version snapshot |
| POST | `/:id/submit` | Submit → CAIL + SIF + lockout |
| POST | `/:id/review` | Supervisor approve/reject |
| POST | `/:id/injuries` | Add injury |
| POST | `/:id/rca` | Add root cause + auto CAPA |
| GET | `/:id/rca/suggest` | Suggested root causes |
| POST | `/:id/witnesses`, `/statements`, `/attachments` | Witness & media |
| POST | `/sync` | Offline idempotent sync |
| GET | `/analytics/project/:id` | Dashboard KPIs |
| GET | `/access/worker` | Site access gate |

---

## 6. Integrations

| Module | Behavior |
|--------|----------|
| **CAIL** | Submit + each root cause CAPA → `sourceType: incident` |
| **SIF/HECA** | Ingest on submit for high/critical, injury, near_miss |
| **Site access** | Block if critical involvement or open event CAPA |
| **Equipment** | Lockout on equipment_failure / high severity |
| **Legacy `Incident`** | Optional `legacyIncidentId` for bridge |
| **VSI investigations** | Remain at `/pm/safety-intelligence/incidents` |

---

## 7. Frontend

| Route | UI |
|-------|-----|
| `/pm/incidents` | Dashboard + analytics |
| `/pm/incidents/new` | 4-step intake wizard |
| `/pm/incidents/[id]` | Detail, RCA, supervisor review |

**Offline:** `pmIncidents.sync` field handler.

---

## 8. Risk scoring

```
riskScore = min(100, severityScore×12 + likelihood×8)
```

Injury + medical aid + lost time → severity 5, supervisor review mandatory.

**Project incident score:** `100 - injuries×15 - critical×20 - nearMiss×2`
