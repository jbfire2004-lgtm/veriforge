# VeriForge Contextual Document Views

**Version:** 1.0.0  
**Scope:** Document tabs on **Worker**, **Job/Project**, and **Asset** pages  
**Principle:** One global document model · contextual queries · no duplicated storage  
**Depends on:** Document Service · Completed Documents Hub · Form Template Engine  

---

## 1. Goals

- Surface the same `documents` rows in context of a person, job, or asset.
- Reuse Document Service APIs and indexes — **no per-entity document tables**.
- Group and sort for operational scanning (safety vs maintenance, timeline for assets).
- Deep-link to the global document viewer / Completed Documents hub.

---

## 2. Shared architecture (no data duplication)

```
┌─────────────┐     query params      ┌──────────────────────┐
│ Worker Tab  │ ───────────────────►  │                      │
│ Job Tab     │ ───────────────────►  │  Document Service    │
│ Asset Tab   │ ───────────────────►  │  documents table     │
└─────────────┘                       │  + signatures        │
       │                              └──────────────────────┘
       │ open / export / link
       ▼
┌──────────────────────────┐
│ GET /documents/{id}      │  ← single source of truth
│ Completed Documents Hub  │  ← “View all in hub” with prefilled filters
└──────────────────────────┘
```

**Rules**
1. Contextual tabs are **read models** over `GET /api/v1/documents` (or thin wrappers).
2. Create/edit/complete always go through Document Service; tabs only list + navigate.
3. Display names (worker, job, asset) come from existing entity APIs / joins in the summary DTO — not copied onto documents beyond IDs already stored.
4. “Open in hub” = navigate to `/documents/completed?worker_id=…` (or job/asset) with the same filters.

### Shared list item DTO

Reuse the Completed Documents **summary** shape (no `content_data`):

```json
{
  "document_id": "uuid",
  "domain": "VERICORE",
  "document_type": "FLHA",
  "status": "Completed",
  "title": "string",
  "worker_id": "uuid?",
  "worker_name": "string?",
  "job_id": "uuid?",
  "job_name": "string?",
  "project_id": "uuid?",
  "asset_id": "uuid?",
  "asset_name": "string?",
  "location_label": "string?",
  "completed_at": "ISO-8601?",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

---

## 3. Worker document view

### 3.1 Query definition

**Endpoint**
```
GET /api/v1/workers/{worker_id}/documents
```

**Implementation** (wrapper over Document Service — same SQL, fixed involvement predicate):

```http
GET /api/v1/documents?
  involvement_worker_id={worker_id}
  &group_by=document_type
  &status=Draft,InProgress,Completed,RequiresReview,Archived
  &page=1&page_size=50
  &sort=updated_at_desc
```

**Involvement predicate** (creator, assignee, or signer):

```sql
WHERE d.company_id = $company_id
  AND (
    d.worker_id = $worker_id                          -- assignee / primary
    OR d.created_by = $worker_user_id                 -- creator (map worker → user)
    OR $worker_id = ANY (d.crew_ids)                  -- crew member
    OR EXISTS (
         SELECT 1 FROM document_signatures s
          WHERE s.document_id = d.document_id
            AND (
              s.user_id = $worker_user_id
              OR s.user_id IN (SELECT user_id FROM worker_user_map WHERE worker_id = $worker_id)
            )
       )
  )
```

**Query params (tab-local)**

| Param | Default | Notes |
|---|---|---|
| `document_type` | all | Optional filter within tab |
| `domain` | all | |
| `status` | all non-cancelled | Optional; include Draft for “in progress” |
| `completed_from` / `to` | — | Optional |
| `group_by` | `document_type` | Server may return flat list; client groups |

**Grouped response** (preferred for this tab):

```json
{
  "worker_id": "uuid",
  "groups": [
    {
      "document_type": "FLHA",
      "domain": "VERICORE",
      "label": "FLHA",
      "count": 12,
      "items": [ /* summary DTOs, newest first */ ]
    },
    {
      "document_type": "JHA",
      "domain": "VERICORE",
      "label": "JHA",
      "count": 4,
      "items": []
    },
    {
      "document_type": "Incident",
      "domain": "VERICORE",
      "label": "Incident",
      "count": 1,
      "items": []
    },
    {
      "document_type": "TrainingRecord",
      "domain": "VERICORE",
      "label": "Training",
      "count": 8,
      "items": []
    },
    {
      "document_type": "WorkOrder",
      "domain": "VERIPM",
      "label": "PM Work Order",
      "count": 3,
      "items": []
    }
  ],
  "total": 28,
  "applied_scope": "worker | supervisor | admin"
}
```

**Group order (fixed UX):** FLHA → JHA → Incident → TrainingRecord → WorkOrder → other types alphabetically.

Empty groups: omit by default; optional `include_empty_groups=true` for supervisors configuring expectations.

### 3.2 UI structure — Worker tab

**Placement:** Worker profile → tab **Documents** (alongside credentials / training as applicable).

```
Worker · A. Nguyen
[Overview] [Credentials] [Documents] …

Documents
  Involved as assignee, crew, creator, or signer
  [Open in Completed Hub ↗]     Status [All ▾]  Domain [All ▾]

  ▼ FLHA (12)
    | Title              | Job/Location      | Status    | Updated / Completed | ⋮ |
    | FLHA — Line 4 AM   | Turnaround U2     | Completed | 10 Jul 2026         |   |

  ▼ JHA (4)
    …

  ▼ Incident (1)
    …

  ▼ Training (8)
    …

  ▼ PM Work Order (3)
    …
```

**Key fields per row:** Title · Job or Asset · Location · Status badge · Date (`completed_at` else `updated_at`) · Actions (View, Export if permitted).

**Sorting within group:** `completed_at DESC NULLS LAST`, then `updated_at DESC`.

**RBAC:** Same as hub — workers see only self; supervisors/admins see this worker if in scope.

---

## 4. Job / Project document view

### 4.1 Query definition

**Endpoints**
```
GET /api/v1/jobs/{job_id}/documents
GET /api/v1/projects/{project_id}/documents
```

**Predicates**

Job:
```sql
WHERE d.company_id = $company_id
  AND d.job_id = $job_id
```

Project (includes child jobs if desired):
```sql
WHERE d.company_id = $company_id
  AND (
    d.project_id = $project_id
    OR d.job_id IN (SELECT job_id FROM jobs WHERE project_id = $project_id)
  )
```

Use a query flag `include_job_documents=true` (default **true** on project view).

**Sectioned response:**

```json
{
  "context": { "type": "job", "job_id": "uuid", "name": "Turnaround Unit 2" },
  "sections": [
    {
      "id": "safety",
      "domain": "VERICORE",
      "label": "Safety",
      "count": 40,
      "items": [ /* summaries */ ]
    },
    {
      "id": "maintenance",
      "domain": "VERIPM",
      "label": "Maintenance",
      "count": 18,
      "items": []
    }
  ],
  "total": 58,
  "page": 1,
  "page_size": 50
}
```

**Per-section sort:** `completed_at DESC NULLS LAST`, `updated_at DESC`.  
**Optional sub-group** inside section by `document_type` (client-side accordion).

**Filters:** `status`, `document_type`, date range on `completed_at` / `created_at`.

### 4.2 UI structure — Job/Project tab

**Placement:** Job or Project page → tab **Documents**.

```
Job · Turnaround Unit 2
[Overview] [Crew] [Documents] …

Documents                          [Open in Hub ↗ filters: job_id]

┌─ Safety (VERICore) ─────────────────────────────────────────────┐
│ Type   | Worker/Crew | Location | Status      | Completed | ⋮  │
│ FLHA   | A. Nguyen   | Bay 3    | Completed   | 10 Jul    |    │
│ JHA    | Crew B      | Bay 3    | InProgress  | —         |    │
│ Incident| …          | …        | RequiresRev | 08 Jul    |    │
└─────────────────────────────────────────────────────────────────┘

┌─ Maintenance (VERIPM) ──────────────────────────────────────────┐
│ Type        | Asset     | Worker | Status    | Completed | ⋮   │
│ WorkOrder   | PUMP-104  | …      | Completed | 09 Jul    |     │
│ AssetInsp.  | PUMP-104  | …      | Completed | 09 Jul    |     │
└─────────────────────────────────────────────────────────────────┘
```

**Key fields**
- Safety: Type · Worker/crew · Location · Status · Completed · Actions  
- Maintenance: Type · Asset · Worker · Status · Completed · Actions  

**Secondary UX:** Section counts in headers; “View all safety in hub” deep link with `domain=VERICORE&job_id=…`.

---

## 5. Asset document view (VERIPM)

### 5.1 Query definition

**Endpoint**
```
GET /api/v1/assets/{asset_id}/documents
```

**Predicate**
```sql
WHERE d.company_id = $company_id
  AND d.asset_id = $asset_id
```

**Timeline response** (chronological history):

```http
GET /api/v1/assets/{asset_id}/documents?view=timeline&sort=event_at_desc&page_size=50
```

```json
{
  "asset_id": "uuid",
  "asset_tag": "PUMP-104",
  "timeline": [
    {
      "event_at": "2026-07-09T16:00:00Z",
      "document_id": "uuid",
      "document_type": "AssetInspection",
      "domain": "VERIPM",
      "status": "Completed",
      "title": "Quarterly inspection",
      "headline": "Inspection · Pass",
      "result_summary": "12 checks · 0 fail",
      "worker_name": "M. Cole"
    },
    {
      "event_at": "2026-07-01T10:00:00Z",
      "document_id": "uuid",
      "document_type": "FailureReport",
      "headline": "Failure · Seal leak",
      "result_summary": null,
      "status": "Completed"
    },
    {
      "event_at": "2026-06-15T08:00:00Z",
      "document_type": "PMTask",
      "headline": "PM Task · Lubrication",
      "status": "Completed"
    },
    {
      "event_at": "2026-05-20T14:00:00Z",
      "document_type": "VendorServiceReport",
      "headline": "Vendor · OEM service",
      "status": "Archived"
    }
  ],
  "page": 1,
  "total": 64,
  "next_cursor": "2026-05-20T14:00:00Z|uuid"
}
```

**`event_at` resolution**
```
COALESCE(completed_at, created_at)
```

**Type emphasis on timeline:**  
`AssetInspection` · `PMTask` · `FailureReport` · `VendorServiceReport` · `WorkOrder` · `WarrantyDocument`

Optional filter: `document_type` csv for “Inspections only”.

### 5.2 UI structure — Asset tab

**Placement:** Asset detail (VERIPM) → tab **Documents** / **History**.

```
Asset · PUMP-104 · Centrifugal Pump
[Overview] [PM Schedule] [Documents] …

Document history                    [Open in Hub ↗ asset_id]

  ● 09 Jul 2026  Inspection · Pass
    | Quarterly inspection · M. Cole · Completed     [View]

  ● 01 Jul 2026  Failure · Seal leak
    | Failure report · Completed                     [View]

  ● 15 Jun 2026  PM Task · Lubrication
    | …                                              [View]

  ● 20 May 2026  Vendor · OEM service
    | Archived                                       [View]

  [Load more]
```

**Visual rules**
- Vertical timeline rail (graphite); dots use status color (green completed, blue review, amber in progress, muted archived).
- Failure / critical inspection fail: controlled red **text or dot only**, not red row fills.
- Key fields: event date · type headline · result summary · worker · status · View.
- Sort: newest first (operational default); toggle “Oldest first” for investigations.

---

## 6. Linking back to Document Service

| UI action | Target |
|---|---|
| View / row click | `GET /documents/{id}` → read-only viewer (frozen template version) |
| Export | `POST /documents/{id}/export` |
| Open in hub | `/documents/completed?worker_id=` / `job_id=` / `project_id=` / `asset_id=` |
| Create document | `POST /documents` with context prefilled (`worker_id` / `job_id` / `asset_id`) from the page |
| Link incident/job/asset | Existing `document_links` API from hub design |

**Prefill on create (from contextual page)**
```json
{
  "template_id": "…",
  "worker_id": "<from worker page>",
  "job_id": "<from job page>",
  "project_id": "<from project page>",
  "asset_id": "<from asset page>",
  "location_id": "<page default location if any>"
}
```

No local caches of document bodies on Worker/Job/Asset aggregates — only IDs already on `documents`.

---

## 7. Indexes (reuse + small additions)

Already planned in Document Service / Hub:
- `(company_id, worker_id, created_at DESC)`
- GIN `(crew_ids)`
- `(company_id, job_id, created_at DESC)`
- `(company_id, project_id, created_at DESC)`
- `(company_id, asset_id, created_at DESC)`
- Hub partial index on `completed_at`

**Add for worker signer involvement (optional materialization if EXISTS is hot):**

```sql
-- Prefer querying document_signatures with:
CREATE INDEX idx_signatures_user_document
  ON document_signatures (user_id, document_id);
```

Avoid storing duplicate “worker_documents” tables.

---

## 8. RBAC (contextual)

| Page | Worker | Supervisor | Admin |
|---|---|---|---|
| Own worker Documents tab | Yes | Yes | Yes |
| Other worker tab | No | If in crew/job scope | Yes |
| Job/Project tab | If assigned to job | If supervises job/project | Yes |
| Asset tab | If assigned WO/crew | If site/job scope includes asset | Yes |

All list endpoints inject the same scope predicates as the Completed Documents hub, **plus** the contextual ID filter.

---

## 9. Front-end composition

```
WorkerDocumentsTab
  useQuery(['worker-docs', workerId, filters])
  → GroupedDocList (by document_type)

JobDocumentsTab
  useQuery(['job-docs', jobId, filters])
  → DomainSections (Safety | Maintenance)

AssetDocumentsTab
  useQuery(['asset-docs', assetId, cursor])
  → DocumentTimeline

Shared:
  DocumentSummaryRow
  DocumentDetailDrawer (same as hub)
  linkToHub(filters)
  linkToDocument(id)
```

Industrial chrome: slate panels, graphite section headers, teal eyebrows (“Safety”, “Maintenance”), blue row hover, status badges per design system.

---

## 10. Summary

| View | Query focus | UI pattern |
|---|---|---|
| **Worker** | Involved via worker_id, created_by, crew_ids, signatures | Accordion by document type |
| **Job/Project** | `job_id` / `project_id` (+ child jobs) | Two sections: Safety · Maintenance |
| **Asset** | `asset_id` | Timeline by `COALESCE(completed_at, created_at)` |

**One model:** `documents` (+ signatures). Contextual tabs are filtered lenses, not separate stores.

---

*Contextual Document Views v1.0.0 — VeriForge · VERICore · VERIPM*
