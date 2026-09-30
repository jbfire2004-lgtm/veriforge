# VeriForge Completed Documents Hub

**Version:** 1.0.0  
**Scope:** Unified list + query layer for completed (and review/archived) documents across **VERICore** and **VERIPM**  
**Depends on:** Document Service · Form Template Engine · industrial design system  

---

## 1. Goals

- One hub for supervisors, admins, and workers to find finished safety and maintenance documents.
- Server-side filter + pagination for **tens of thousands** of rows per company.
- Role-scoped results (worker ⊂ supervisor ⊂ admin).
- Quick view without leaving the list; export and report-pack actions from the row.

**In-scope statuses:** `Completed` · `RequiresReview` · `Archived`  
**Out of scope for default hub:** `Draft` · `InProgress` · `Cancelled` (optional “include cancelled” admin toggle later).

---

## 2. Query API

### 2.1 Endpoint

```
GET /api/v1/documents/completed
```

Alias (same handler): `GET /api/v1/hub/completed-documents`

**Auth:** Bearer · tenant `company_id` from session  
**Performance:** Always filter `company_id` first; use composite indexes from Document Service.

### 2.2 Request — query parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `domain` | `VERICORE` \| `VERIPM` | no | Single domain |
| `document_type` | string / csv | no | e.g. `FLHA,JHA` or `AssetInspection` |
| `worker_id` | uuid | no | Primary worker on document |
| `crew_id` | uuid | no | Match any in `crew_ids` |
| `job_id` | uuid | no | |
| `project_id` | uuid | no | |
| `asset_id` | uuid | no | |
| `location_id` | uuid | no | Structured location ref |
| `location_q` | string | no | ILIKE against `content_data.metadata.location` (use sparingly) |
| `status` | string / csv | no | Default: `Completed,RequiresReview,Archived` |
| `completed_from` | ISO-8601 date/datetime | no | Inclusive lower bound on `completed_at` |
| `completed_to` | ISO-8601 date/datetime | no | Inclusive upper bound on `completed_at` |
| `q` | string | no | Title / `external_reference` ILIKE |
| `page` | int | no | Default `1` |
| `page_size` | int | no | Default `25`, max `100` |
| `sort` | enum | no | See below |

**Sort values**
- `completed_at_desc` (default)
- `completed_at_asc`
- `updated_at_desc`
- `document_type_asc`
- `status_asc`

**Implicit filters (server-applied)**
```
company_id = auth.company_id
status IN (requested ∩ hub_allowed)
+ RBAC scope predicate (see §4)
```

### 2.3 Response shape

```json
{
  "items": [
    {
      "document_id": "uuid",
      "domain": "VERICORE",
      "document_type": "FLHA",
      "status": "Completed",
      "title": "FLHA — Line 4 Morning",
      "version": 3,
      "template_id": "uuid",
      "template_version": 1,
      "external_reference": "COR-2026-0142",

      "worker_id": "uuid",
      "worker_name": "A. Nguyen",
      "crew_ids": ["uuid"],
      "crew_summary": "Crew B · 4 workers",

      "job_id": "uuid",
      "job_name": "Turnaround Unit 2",
      "project_id": "uuid",
      "project_name": "Q3 Turnaround",

      "asset_id": null,
      "asset_name": null,
      "asset_tag": null,

      "location_id": "uuid",
      "location_label": "North Yard · Bay 3",

      "completed_at": "2026-07-10T18:22:00Z",
      "completed_by_name": "J. Ortiz",
      "locked_at": "2026-07-10T18:22:00Z",

      "actions": {
        "can_view": true,
        "can_export": true,
        "can_add_to_report_pack": true,
        "can_link_incident": true,
        "can_link_job": true,
        "can_link_asset": false
      }
    }
  ],
  "page": 1,
  "page_size": 25,
  "total": 18402,
  "total_pages": 737,
  "facets": {
    "domain": { "VERICORE": 12100, "VERIPM": 6302 },
    "status": { "Completed": 16001, "RequiresReview": 890, "Archived": 1511 }
  },
  "applied_scope": "supervisor"
}
```

**Notes**
- List payload is a **summary DTO** — no `content_data`, no full signatures.
- Names (`worker_name`, `job_name`, …) resolved via join/cache; never N+1 per row.
- `actions` flags are RBAC-aware so the UI can hide dead controls.
- `facets` optional (computed on filtered set or approximate); enable when needed for filter chips.

### 2.4 Detail (quick view)

```
GET /api/v1/documents/{document_id}?view=summary
```

**Response**
```json
{
  "document": {
    /* summary fields above */
    "signatures": [
      {
        "user_id": "uuid",
        "user_name": "J. Ortiz",
        "role": "Supervisor",
        "signed_at": "2026-07-10T18:22:00Z",
        "method": "Drawn"
      }
    ],
    "attachment_count": 2,
    "content_preview": {
      "metadata": { "date": "2026-07-10", "location": "North Yard" },
      "task_step_count": 5,
      "check_item_count": 0,
      "highest_risk": "High"
    }
  },
  "links": {
    "worker_url": "/core/workers/{id}",
    "job_url": "/pm/jobs/{id}",
    "asset_url": null,
    "incident_url": null
  }
}
```

Full content: `GET /api/v1/documents/{document_id}` (existing Document Service).

### 2.5 Actions APIs

| Action | Method | Path | Body / notes |
|---|---|---|---|
| Export | `POST` | `/api/v1/documents/{id}/export` | `{ "format": "pdf" \| "json" }` → job id or signed URL; audit `exported` |
| Add to report pack | `POST` | `/api/v1/report-packs/{pack_id}/documents` | `{ "document_id": "uuid" }` |
| Create pack + add | `POST` | `/api/v1/report-packs` | `{ "name", "document_ids": [] }` |
| Link to incident | `POST` | `/api/v1/documents/{id}/links` | `{ "link_type": "incident", "target_id": "uuid" }` |
| Link to job | `POST` | `/api/v1/documents/{id}/links` | `{ "link_type": "job", "target_id": "uuid" }` |
| Link to asset | `POST` | `/api/v1/documents/{id}/links` | `{ "link_type": "asset", "target_id": "uuid" }` |

**Link table (minimal)**
```sql
CREATE TABLE document_links (
  link_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL,
  document_id    UUID NOT NULL REFERENCES documents(document_id),
  link_type      TEXT NOT NULL CHECK (link_type IN ('incident','job','asset','project')),
  target_id      UUID NOT NULL,
  created_by     UUID NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, link_type, target_id)
);
```

### 2.6 SQL sketch (performance)

```sql
SELECT d.document_id, d.domain, d.document_type, d.status, d.title,
       d.worker_id, d.crew_ids, d.job_id, d.project_id, d.asset_id,
       d.location_id, d.completed_at, d.external_reference, d.version,
       d.template_id, d.template_version
  FROM documents d
 WHERE d.company_id = $company_id
   AND d.status = ANY($statuses::document_status[])
   AND d.completed_at IS NOT NULL
   AND ($domain::document_domain IS NULL OR d.domain = $domain)
   AND ($types::document_type[] IS NULL OR d.document_type = ANY($types))
   AND ($worker_id::uuid IS NULL OR d.worker_id = $worker_id
        OR $worker_id = ANY(d.crew_ids))          -- worker self-scope helper
   AND ($job_id::uuid IS NULL OR d.job_id = $job_id)
   AND ($project_id::uuid IS NULL OR d.project_id = $project_id)
   AND ($asset_id::uuid IS NULL OR d.asset_id = $asset_id)
   AND ($location_id::uuid IS NULL OR d.location_id = $location_id)
   AND ($from::timestamptz IS NULL OR d.completed_at >= $from)
   AND ($to::timestamptz IS NULL OR d.completed_at <= $to)
   AND /* RBAC predicate injected here */
 ORDER BY d.completed_at DESC NULLS LAST
 LIMIT $page_size OFFSET $offset;
```

**Indexes used (from Document Service)**
- `(company_id, domain, document_type, status, created_at DESC)` — extend usage with `completed_at`
- Add dedicated hub index:

```sql
CREATE INDEX idx_documents_hub_completed
  ON documents (company_id, completed_at DESC)
  WHERE status IN ('Completed', 'RequiresReview', 'Archived')
    AND completed_at IS NOT NULL;

CREATE INDEX idx_documents_hub_completed_domain_type
  ON documents (company_id, domain, document_type, completed_at DESC)
  WHERE status IN ('Completed', 'RequiresReview', 'Archived')
    AND completed_at IS NOT NULL;
```

**Pagination:** keyset optional for deep pages:

```
WHERE (completed_at, document_id) < ($cursor_completed_at, $cursor_id)
ORDER BY completed_at DESC, document_id DESC
LIMIT 25
```

Return `next_cursor` when `page_size` fills.

---

## 3. UI layout

### 3.1 Route & chrome

- Route: `/documents/completed` (Hub) · also linked from VERICore and VERIPM module nav as “Completed documents”
- Shell: unified Vera nav — **Global header** + **Module bar** (Documents / Compliance) + `ContentContainer` + `PageLayout`
- Aesthetic: industrial — slate/graphite filters, high-contrast table, safety-blue hover/selection, status badges per design system

### 3.2 Wireframe (desktop)

```
┌─ VeraGlobalHeader ─────────────────────────────────────────────────────────┐
├─ VeraModuleBar · Documents · [Completed] [Templates] [Report packs] ───────┤
│                                                                             │
│  COMPLETED DOCUMENTS                                                        │
│  Finished safety & maintenance records across VERICore and VERIPM           │
│                                                                             │
│  ┌─ Filter panel (left, 280px) ─┐  ┌─ Results ───────────────────────────┐ │
│  │ Domain        [ All ▾ ]      │  │ 18,402 results · page 1/737          │ │
│  │ Document type [ Multi ▾ ]    │  │ [Export CSV] [New report pack]       │ │
│  │ Status        ☑ Completed    │  ├─────────────────────────────────────┤ │
│  │               ☑ Review       │  │ Type │ Dom │ Worker │ Job/Asset │ … │ │
│  │               ☑ Archived     │  │ FLHA │Core │ A.Ng… │ Turnaround │ … │ │
│  │ Worker        [ Picker ]     │  │ …    │     │        │           │ ⋮ │ │
│  │ Job/Project   [ Picker ]     │  │                                     │ │
│  │ Asset         [ Picker ]     │  │          « 1 2 3 … 737 »            │ │
│  │ Location      [ Picker ]     │  └─────────────────────────────────────┘ │
│  │ Completed     [From] [To]    │                                           │
│  │ Keyword       [________]     │                                           │
│  │ [Apply] [Reset]              │                                           │
│  └──────────────────────────────┘                                           │
│                                                                             │
│  ┌─ Detail drawer (right, 420px) — opens on View ─────────────────────────┐ │
│  │ FLHA · VERICore · Completed                                            │ │
│  │ Title · completed date · worker · job · location                       │ │
│  │ Preview: 5 steps · highest risk High                                   │ │
│  │ Signatures list                                                        │ │
│  │ [Open full] [Export PDF] [Add to pack] [Link…]                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Filter panel

| Control | Component | Notes |
|---|---|---|
| Domain | Select (All / VERICore / VERIPM) | Clears incompatible type chips |
| Document type | Multi-select | Options filtered by domain |
| Status | Checkbox group | Defaults all three hub statuses |
| Worker | Async entity picker | Hidden or locked for Worker role (self) |
| Job / project | Cascading or dual picker | Supervisor list scoped to assigned jobs |
| Asset | Async picker | Primarily VERIPM |
| Location | Async picker | |
| Date range | From / To on `completed_at` | Presets: Today, 7d, 30d, Quarter |
| Keyword | Text | Title / external ref |

- **Apply** runs query (or debounce 300ms on change for pickers).
- **Reset** restores defaults.
- Active filters shown as removable chips above the table.
- Mobile: filters collapse into a “Filters” sheet.

### 3.4 Results table

| Column | Source | Width hint |
|---|---|---|
| Document type | `document_type` | 120 |
| Domain | badge Core / PM | 88 |
| Worker / crew | `worker_name` + `crew_summary` | 160 |
| Job / asset | job name **or** asset tag/name | 180 |
| Location | `location_label` | 140 |
| Completed | `completed_at` (date strong, time muted) | 140 |
| Status | badge | 120 |
| Actions | icon/button menu | 72 |

**Row interaction**
- Click row or **View** → opens detail drawer (does not navigate away).
- Hover: safety-blue wash (design system).
- Selected row: blue tint + 3px blue rail.
- Status badges: green Completed · blue RequiresReview · graphite/amber Archived (Archived = muted; not critical red).

**Actions menu (⋮)**
1. View  
2. Export (PDF / JSON)  
3. Add to Report Pack  
4. Link to Incident (VERICore)  
5. Link to Job  
6. Link to Asset (VERIPM)  

Disable items when `actions.can_*` is false.

### 3.5 Detail drawer / modal

- **Desktop:** right drawer 400–480px over the table.  
- **Mobile:** full-screen modal.

**Sections**
1. Header — type, domain, status badge, title  
2. Context strip — worker, job/asset, location, completed timestamp  
3. Preview — counts from template engine (`task_step_count` / `check_item_count`, highest risk or fail count)  
4. Signatures — role, name, time, method  
5. Attachments — count + open list  
6. Footer actions — Open full document · Export · Add to pack · Link  

**Open full** → `/documents/{id}` read-only viewer (frozen template version).

### 3.6 Empty & loading

- Loading: industrial skeleton rows (no consumer shimmer abuse).  
- Empty: “No completed documents match these filters” + Reset.  
- Error: amber alert, retry.

---

## 4. Role-based access rules

Roles are evaluated **server-side** on every list/detail/action. UI hiding is not security.

### 4.1 Role matrix

| Capability | Worker | Supervisor | Admin |
|---|---|---|---|
| List hub | Yes (scoped) | Yes (scoped) | Yes (company) |
| Filter by any worker | No (fixed to self) | Yes (within scope) | Yes |
| Filter any job/asset | Limited | Assigned only | Yes |
| View document detail | If involved | If in scope | Yes |
| Export | Own / involved | In scope | Yes |
| Add to report pack | No* | Yes | Yes |
| Link incident/job/asset | No | Yes (in scope) | Yes |
| See Draft/InProgress in this hub | No | No | No |

\*Workers may be granted “add to pack” later for personal packs; default **deny**.

### 4.2 Scope predicates

**Worker** — documents they are involved in:

```sql
d.worker_id = $auth_user_worker_id
OR $auth_user_worker_id = ANY (d.crew_ids)
OR EXISTS (
  SELECT 1 FROM document_signatures s
   WHERE s.document_id = d.document_id
     AND s.user_id = $auth_user_id
)
```

- Worker filter control is locked to self (or hidden).
- Cannot open documents outside predicate → `403`.

**Supervisor** — jobs/crews they supervise:

```sql
d.job_id = ANY ($supervisor_job_ids)
OR d.project_id = ANY ($supervisor_project_ids)
OR d.crew_ids && $supervisor_crew_ids                 -- array overlap
OR d.worker_id = ANY ($supervisor_direct_report_ids)
OR /* same involvement as worker for their own docs */
```

- Job/project/asset pickers only return entities in supervisor scope.
- Cross-scope deep link → `403`.

**Admin** (company admin / compliance / document admin):

```sql
d.company_id = $auth_company_id
-- no additional row filter
```

- Full filter panel.
- Can manage report packs and links company-wide.

### 4.3 Action authorization

| Action | Rule |
|---|---|
| `can_view` | Passes scope predicate |
| `can_export` | `can_view` + role has `documents:export` |
| `can_add_to_report_pack` | Supervisor+ with `report_packs:write` |
| `can_link_incident` | Supervisor+ · domain VERICore or linked safety role |
| `can_link_job` | Supervisor+ · job in scope (admin: any) |
| `can_link_asset` | Supervisor+ · asset in scope · typically VERIPM |

### 4.4 `applied_scope` in response

Return `"worker" | "supervisor" | "admin"` so the UI can:
- Lock worker picker for workers  
- Show scope banner: “Showing documents for your crews and jobs”  
- Avoid implying company-wide completeness to non-admins  

---

## 5. Front-end data flow

```
FilterState (URL query sync)
    ↓
GET /documents/completed?...
    ↓
CompletedDocumentsPage
  ├─ FilterPanel (RBAC-aware controls)
  ├─ ResultsTable (virtualize if page_size high; default pagination)
  └─ DocumentDetailDrawer
         ↓ View
       GET /documents/{id}?view=summary
```

**URL sync** — all filters in query string for shareable supervisor links  
Example:  
`/documents/completed?domain=VERICORE&status=Completed&completed_from=2026-07-01&page=1`

**Caching** — React Query: key = serialized filters; staleTime 30s; invalidate on export/link mutations.

---

## 6. Performance checklist

- [ ] Partial index on `(company_id, completed_at DESC)` for hub statuses  
- [ ] Summary DTO only (no `content_data` in list)  
- [ ] Batch-resolve worker/job/asset display names  
- [ ] `page_size` capped at 100  
- [ ] Prefer keyset cursor for page > 20 if offset degrades  
- [ ] Avoid `location_q` ILIKE on JSON by default; prefer `location_id`  
- [ ] RBAC predicates use indexed columns (`job_id`, `crew_ids` GIN, `worker_id`)  
- [ ] Facets optional / async so they don’t block first paint  

---

## 7. Industrial UI notes

- Filter panel: graphite/slate controls, 3px radius, safety-blue focus.  
- Table: alternating row tones; blue hover; status badges green/blue/muted.  
- No consumer animations; drawer slides subtly or appears instantly.  
- Destructive-looking actions unused here; Export/Link use Action (blue) / Secondary (graphite).

---

## 8. Implementation order

1. Hub SQL indexes + `GET /documents/completed` with RBAC predicates  
2. Summary DTO + name joins  
3. Hub page: filters + table + URL sync  
4. Detail drawer + export  
5. Report pack + document links  
6. Keyset pagination if volume requires  

---

*Completed Documents Hub v1.0.0 — VeriForge · VERICore · VERIPM*
