# Vera PM Safety Meetings & Toolbox Talks System

**API:** `/api/v1/pm/safety-meetings`  
**UI:** `/pm/safety-meetings`  
**Migration:** `20260521120000_pm_safety_meetings`  
**Module:** `backend/src/pm-safety-meetings/`

Unified PM safety meeting engine replacing fragmented `CoreMeetingRecord`, orphan `ToolboxTalk`, and form-only `toolbox-talk` paths. Project-scoped, CAIL-integrated, offline-capable, with site-access gates and safety-station linking.

---

## 1. Backend architecture

### 1.1 Module layout

```
pm-safety-meetings/
├── pm-safety-meetings.module.ts          # Nest wiring
├── pm-safety-meetings.controller.ts      # REST /api/v1/pm/safety-meetings
├── pm-safety-meetings.service.ts         # Meeting lifecycle, attendance, CAPA bridge
├── pm-safety-meetings-templates.service.ts
├── pm-safety-meetings-topic-library.service.ts
├── pm-safety-meetings-intelligence.service.ts
├── pm-safety-meetings-cail.service.ts
├── meeting-workflow.engine.ts            # State machine + review gates
├── topic-suggest.engine.ts               # Cross-module topic suggestions
└── pm-safety-meetings.constants.ts
```

### 1.2 Dependencies

| Dependency | Use |
|------------|-----|
| `PrismaModule` | All persistence |
| `SafetyIntelligenceModule` | `CailEmitterService` |
| `PmCorrectiveActionsModule` | CAPA create from meetings |

### 1.3 Multi-tenant isolation

- Every row carries `companyId` + `projectId` (meetings) or `companyId` + optional `projectId` (library/templates).
- Queries always filter `deletedAt: null` on meetings/topics.
- `CompanyScopeGuard` / `ProjectScopeGuard` apply at API platform layer (same as other PM modules).

### 1.4 RBAC

| Role | Permissions |
|------|-------------|
| `WORKER`, `PROJECT_MANAGER` | List, create draft, start, check-in self, sign, offline sync |
| `SUPERVISOR`, `ADMIN`, `COMPANY_ADMIN`, `SUPER_ADMIN` | Publish template, supervisor review, lock meeting, run analytics |
| `SUPER_ADMIN` | Cross-company (bypass scope) |

Controller decorators: `@Roles(...PM_ROLES)` default; `@Roles(...SUPERVISOR_ROLES)` on publish template, review, lock.

### 1.5 Audit

Every mutation writes `safety_meeting_audit` with `eventType`, `actorId`, `payload` JSON. Event types: `created`, `started`, `status_*`, `attendee_added`, `attendee_checked_in`, `review_*`, `capa_created`.

### 1.6 Service responsibilities

| Service | Responsibility |
|---------|----------------|
| `PmSafetyMeetingsService` | CRUD meetings, workflow transitions, attendance, signatures, CAPA link, offline sync, site-access worker check |
| `PmSafetyMeetingsTemplatesService` | Template CRUD, versioned publish (parent → archived, child published) |
| `PmSafetyMeetingsTopicLibraryService` | Categories seed, topic CRUD, CAIL topic suggestions from incidents/inspections/JHA/SIF |
| `PmSafetyMeetingsIntelligenceService` | Quality/engagement scoring, project analytics, cross-form correlation IDs |
| `PmSafetyMeetingsCailService` | Emit `CailEntry` when meeting completes with high-risk topics or CAPA |

---

## 2. Database schema

### 2.1 Tables (mapped names)

| Prisma model | Table | Purpose |
|--------------|-------|---------|
| `SafetyMeeting` | `safety_meetings` | Live meeting instance |
| `SafetyMeetingTemplate` | `safety_meeting_templates` | Versioned agendas |
| `SafetyMeetingTopic` | `safety_meeting_topics` | Agenda items per meeting |
| `SafetyMeetingAttendee` | `safety_meeting_attendees` | Worker attendance |
| `SafetyMeetingSignature` | `safety_meeting_signatures` | Digital sign-off |
| `SafetyMeetingAttachment` | `safety_meeting_attachments` | Photos/PDF/video |
| `SafetyMeetingCorrectiveAction` | `safety_meeting_corrective_actions` | M:N meeting ↔ CAPA |
| `SafetyMeetingAuditLog` | `safety_meeting_audit` | Immutable audit |
| `TopicLibraryEntry` | `topic_library` | Reusable topics |
| `TopicLibraryCategory` | `topic_library_categories` | PPE, fall protection, etc. |
| `SiteAccessMeetingRequirement` | `site_access_meeting_requirement` | Access gate rules |

### 2.2 `safety_meetings` (core fields)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID PK | |
| `companyId`, `projectId` | INT FK | Tenant isolation |
| `siteId` | INT? FK | Auto-filled from project |
| `templateId` | UUID? FK | Source template |
| `meetingType` | enum | 10 types + `custom` |
| `customMeetingTypeLabel` | TEXT? | When type = custom |
| `status` | enum | draft → locked |
| `title`, `locationNote` | TEXT | |
| `scheduledAt`, `startedAt`, `completedAt`, `lockedAt` | TIMESTAMP | |
| `facilitatorWorkerId`, `supervisorUserId` | INT? FK | |
| `requiresSupervisorReview` | BOOL | Derived |
| `reviewStatus` | enum | not_required / pending / approved / rejected / changes_requested |
| `qualityScore`, `engagementScore` | INT 0–100 | CAIL intelligence |
| `cailEntryId` | UUID? UNIQUE | CAIL link |
| `safetyStationId` | INT? FK | Station sync |
| `discussionNotes` | TEXT | |
| `hazardsDiscussed`, `controlsDiscussed` | JSONB | Arrays |
| `metadata` | JSONB | Extensibility |
| `clientSyncId` | TEXT? UNIQUE | Offline dedup |
| `clientVersion` | INT | Conflict resolution |
| `deletedAt` | TIMESTAMP? | Soft delete |

**Indexes:** `(projectId, status)`, `(companyId, meetingType)`, `(scheduledAt)`, `(siteId, status)`, unique `clientSyncId`, unique `cailEntryId`.

### 2.3 Meeting types (enum `SafetyMeetingType`)

`toolbox_talk`, `tailgate_meeting`, `safety_stand_down`, `pre_task_meeting`, `daily_safety_briefing`, `weekly_safety_meeting`, `monthly_safety_meeting`, `project_kickoff_safety`, `incident_review_meeting`, `custom`.

### 2.4 Topic library categories

`ppe`, `fall_protection`, `confined_space`, `hot_work`, `electrical_safety`, `equipment_operation`, `housekeeping`, `environmental`, `behavioral_safety`, `sif_heca`, `general`.

Company-level categories: `projectId IS NULL`. Project-level: unique `(companyId, projectId, code)`.

### 2.5 Partitioning strategy (production)

| Table | Strategy |
|-------|----------|
| `safety_meeting_audit` | Range partition by `createdAt` monthly; retain 7 years |
| `safety_meetings` | Optional hash on `projectId` when >10M rows |
| `safety_meeting_attachments` | Large `dataUrl` → object storage; table stores `storageKey` only |

### 2.6 Relations

- Meeting → Project, Company, Site, Template, Workers, Users, CailEntry, SafetyStation
- CAPA link → `pm_corrective_action` (1:N links per meeting)
- Attachments → optional topic or CAPA FK

---

## 3. API contract

**Base:** `GET|POST /api/v1/pm/safety-meetings`  
**Auth:** Bearer JWT + `RolesGuard`

### 3.1 Meetings

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | PM | List. Query: `projectId`, `companyId`, `status`, `meetingType` |
| GET | `/:id` | PM | Full meeting + topics + attendees + CAPA links |
| POST | `/` | PM | Create draft. Body: `companyId`, `projectId`, `meetingType`, `title`, `topicIds[]`, `inlineTopics[]`, `templateId`, `siteId`, `facilitatorWorkerId` |
| POST | `/:id/publish` | PM | `draft` → `published` |
| POST | `/:id/start` | PM | Set `in_progress`, `startedAt` |
| POST | `/:id/complete` | PM | `completed`; validates signatures |
| POST | `/:id/lock` | Supervisor | `locked` after review |
| POST | `/:id/review` | Supervisor | Body: `{ outcome, notes }` |
| POST | `/:id/attendees` | PM | Body: `{ workerId }` |
| POST | `/:id/attendees/:workerId/check-in` | PM | Present + training/equipment validation |
| POST | `/:id/signatures` | PM | Body: `{ role, signerWorkerId, signatureData, clientSyncId }` |
| POST | `/:id/corrective-actions` | PM | Body: `{ title, description, topicId?, origin }` → CAPA |
| GET | `/:id/intelligence/score` | PM | Run quality engine |
| PUT | `/:id/station/:stationId` | PM | Link safety station |

### 3.2 Topic library

| Method | Path | Description |
|--------|------|-------------|
| GET | `/topics` | List. Query: `companyId`, `projectId?`, `category` |
| POST | `/topics` | Create topic |
| GET | `/topics/suggest` | CAIL suggestions. Query: `projectId`, `companyId` |

### 3.3 Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List company/project templates |
| POST | `/templates` | Create draft template |
| POST | `/templates/:id/publish` | Version bump + archive parent |

### 3.4 Analytics & access

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/project/:projectId` | 30-day KPIs |
| GET | `/access/worker` | Query: `workerId`, `projectId` |
| POST | `/sync` | Offline batch create |

### 3.5 Validation & errors

| Code | When |
|------|------|
| 400 | Invalid workflow transition, missing attendees/signatures, review not approved |
| 404 | Meeting not found or soft-deleted |
| 409 | Duplicate `clientSyncId` on sync — body includes `{ code: 'SYNC_DUPLICATE', meetingId }` |
| 403 | Role or company/project scope failure |

Response shape follows `@vera/api-contract` via global `HttpExceptionFilter`.

### 3.6 Example: create meeting

```json
POST /api/v1/pm/safety-meetings
{
  "companyId": 1,
  "projectId": 42,
  "meetingType": "toolbox_talk",
  "title": "Fall protection — east scaffold",
  "inlineTopics": [
    { "title": "Review: Near miss at grid B", "isHighRisk": true, "sourceModule": "incident", "sourceId": "evt-uuid" }
  ]
}
```

---

## 4. Frontend architecture

### 4.1 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/pm/safety-meetings` | `dashboard.tsx` | KPIs + meeting list |
| `/pm/safety-meetings/new` | `new.tsx` | Type picker + CAIL topic suggestions |
| `/pm/safety-meetings/[id]` | `detail.tsx` | Execute: publish → start → complete, score |
| `/pm/safety-meetings/topics` | (planned) | Topic library admin |

### 4.2 Client library

`vera-frontend/lib/pm-safety-meetings.ts` — typed fetch wrappers mirroring API.

### 4.3 UI components (layout)

**Meeting builder (`new.tsx`):**
- Header: title input, meeting type `<select>`
- Panel: CAIL suggested topics (checkbox list, priority badge, high-risk flag)
- Footer: Create draft CTA

**Execution (`detail.tsx`):**
- Status chip + review banner
- Action bar: Publish | Start | Complete | CAIL score
- Sections: Topics (bullets), Attendees (name + status), Linked CAPA (links to `/pm/corrective-actions/[id]`)

**Dashboard:**
- 4 KPI cards: meetings 30d, attendance %, CAPA count, avg quality
- Data table: title link, type, status, attendee count, quality score

### 4.4 Offline UI

- Banner when `navigator.onLine === false`
- Queue `pmSafetyMeetings.sync` via `SyncEngine`
- Local cache keys (IndexedDB): `topic_library`, `meeting_templates`, `worker_profiles`, `project_profiles` (extend `FIELD_DB_VERSION`)

### 4.5 Signature UI (field)

- Canvas or data-URL capture component (reuse CAPA/JHA signature pattern)
- POST `/:id/signatures` with `clientSyncId` per signer

---

## 5. Workflow logic

### 5.1 State machine

```
draft ──publish──► published ──start──► in_progress ──complete──► completed
  ▲                    │                      │                      │
  └──── (supervisor) ──┘                      └──── (re-open) ───────┘
                                                      │
                                              reviewed ◄── supervisor approve
                                                      │
                                                   locked
```

### 5.2 Transitions (`MeetingWorkflowEngine`)

| From | To | Validation | Permission |
|------|-----|------------|------------|
| draft | published | Title set | PM |
| published | in_progress | — | PM |
| in_progress | completed | ≥1 attendee; all `present` have signature | PM |
| completed | reviewed | Supervisor review approved OR not required | Supervisor |
| reviewed | locked | Review approved if required | Supervisor |

### 5.3 Supervisor review triggers

Required when ANY:
- `meetingType` ∈ `{ safety_stand_down, incident_review_meeting }`
- Any topic `isHighRisk = true`
- Any linked CAPA
- Topic title contains SIF/HECA indicator

Outcomes: `approved` → status `reviewed`; `rejected` / `changes_requested` → stays completed, blocks lock.

### 5.4 Attendance → access control

`SiteAccessMeetingRequirement` defines `(projectId, meetingType, zoneCode, windowHours)`.

Worker `evaluateAccess` fails if no `present` attendance on completed/reviewed/locked meeting within window.

### 5.5 CAPA workflow

Discussion/hazard → `POST .../corrective-actions` → `PmCorrectiveAction` + CAIL + `safety_meeting_corrective_actions` link → forces `reviewStatus = pending`.

---

## 6. CAIL intelligence logic

### 6.1 Topic suggestions (`TopicSuggestEngine`)

**Inputs (14-day window):**
- Recent `pm_safety_event` (incidents)
- Open `pm_inspection_deficiency`
- `jha_flha` with `sifPotentialScore >= 60`
- Active `equipment_lockout`
- `sif_heca_event` category tags
- `projectRiskScore` = f(open CAPA, SIF events, open deficiencies)

**Output:** `{ title, categoryCode, reason, sourceModule, sourceId, priority, isHighRisk }[]` sorted by priority, max 15.

### 6.2 Meeting quality score

```
qualityScore_base = 50
+ 10 if topics >= 2
+ 15 if discussionNotes.length > 80
+ 10 if attachments > 0
- 15 if hazardsDiscussed.length > controlsDiscussed.length
engagementScore = 40 + round(signRate * 35)
signRate = signatures / presentAttendees
```

**Explainable factors[]:** `{ name, impact, explanation }` returned to UI.

### 6.3 Hazard pattern detection

Unique values from `hazardsDiscussed` JSON array → `hazardPatterns[]`.

### 6.4 Weak control detection

If `hazards.length > controls.length` → add weak control warning string.

### 6.5 Cross-form correlation

From meeting topics' `sourceModule` / `sourceId`:
- `jha_flha` → jhaIds
- `inspection` → inspectionIds
- `incident` → incidentIds
- Linked CAPA → capaIds

### 6.6 CAIL emission

On `completed` or `reviewed` when high-risk topics OR CAPA exist:
- `sourceType: safety_meeting`
- `sourceId: meeting.id`
- `severity: high` if any high-risk topic else `medium`
- Tags: `['safety_meeting', meetingType]`

---

## 7. Offline mode logic

### 7.1 Local storage registry

| Entity | Store | TTL |
|--------|-------|-----|
| Topic library | IndexedDB `topic_library` | 7 days |
| Templates | `meeting_templates` | 7 days |
| Workers | `worker` (existing) | session |
| Projects | `project` (existing) | session |

### 7.2 Offline meeting creation

1. User creates meeting in UI → write local draft UUID
2. Enqueue `SyncQueueItem { type: 'pmSafetyMeetings.sync', payload, clientSyncId }`
3. On connectivity: `POST /sync` with full payload

### 7.3 Sync payload

```json
{
  "clientSyncId": "uuid-client",
  "companyId": 1,
  "projectId": 42,
  "meetingType": "toolbox_talk",
  "title": "...",
  "createdByUserId": 5,
  "attendees": [{ "workerId": 10 }],
  "signatures": [{ "signerWorkerId": 10, "signatureData": "data:image/png...", "clientSyncId": "sig-1" }],
  "complete": true
}
```

### 7.4 Conflict resolution

- Server wins on `clientVersion` mismatch (increment on each server update)
- Duplicate `clientSyncId` → 409 with existing `meetingId` (idempotent retry)
- Attachment blobs: upload via `core-upload` first, sync references `storageKey`

### 7.5 Background sync

`SyncEngine` triggers: online event, foreground, manual pull, 5-minute interval when pending queue > 0.

---

## 8. Integration map

| Module | Integration point | Behavior |
|--------|-------------------|----------|
| **JHA/FLHA** | Topic suggest + correlation | High SIF JHAs surface as topics; sourceModule `jha_flha` |
| **SIF/HECA** | Topic suggest + review gate | SIF tags → topics; open SIF still blocks site access separately |
| **Inspections** | Topic suggest | Open deficiencies → suggested topics |
| **Incidents** | Topic suggest + incident_review meeting type | Recent events → topics |
| **Corrective Actions** | `createCapaFromMeeting`, link table | sourceModule `safety_meetings`; CAIL type `safety_meeting` |
| **Training** | Attendance check-in | `trainingValid` from non-expired `trainingRecord` |
| **Equipment** | Attendance check-in | `equipmentAuthorized` false if worker equipment lockout active |
| **Site Access** | `site_access_meeting_requirement` + evaluate | Block if required meeting type missing in window |
| **Safety Stations** | `PUT .../station/:id`, `safetyStationId` | Station displays active meeting; heartbeat unchanged |
| **CAIL** | `PmSafetyMeetingsCailService` | Emit on complete; intelligence score stored on meeting |
| **Core Meeting Record** | Legacy read-only | Historical toolbox minutes; no write path |
| **Safety Form `toolbox-talk`** | Parallel | Form submissions still valid; optional future bridge to PM meeting |

---

## 9. Analytics & scoring models

### 9.1 Project dashboard (`GET /analytics/project/:id`)

| Metric | Formula |
|--------|---------|
| `meetingCount` | Count meetings 30d, not deleted |
| `byType` | Histogram by `meetingType` |
| `attendanceRate` | present / total attendees |
| `capaFromMeetings` | Sum `correctiveLinks` |
| `avgQualityScore` | Mean of non-null `qualityScore` |
| `leadingIndicators.meetingsPerWeek` | count / 4.3 |
| `leadingIndicators.capaPerMeeting` | capa / meetings |

### 9.2 Worker engagement score (per meeting)

Stored as `engagementScore` 0–100. Primary driver: signature completion rate among present attendees.

### 9.3 Project meeting score (composite)

```
projectMeetingScore = 0.4 * avgQualityScore
                    + 0.3 * (attendanceRate * 100)
                    + 0.2 * min(100, meetingsPerWeek * 20)
                    + 0.1 * max(0, 100 - capaPerMeeting * 25)
```

### 9.4 SIF/HECA-linked topic rate

```
sifTopicRate = meetingsWithSifTopic / totalMeetings
```
where `meetingsWithSifTopic` = any topic `category.code = sif_heca` OR `requiresSifReview`.

### 9.5 Topic usage trends

`topic_library.usageCount` incremented on each meeting topic copy from library. Dashboard (planned): top 10 topics 90d.

---

## Implementation status

| Area | Status |
|------|--------|
| Prisma schema + migration | ✅ |
| NestJS module + API | ✅ |
| Site access meeting gate | ✅ |
| CAIL emit + intelligence | ✅ |
| Frontend dashboard/new/detail | ✅ |
| Offline sync action | ✅ |
| Topic library admin UI | Planned |
| Attachment upload UI | Planned |
| Station real-time push | Planned (link FK ready) |

---

## Coexistence with legacy surfaces

| Surface | Recommendation |
|---------|----------------|
| `CoreMeetingRecord` | Read/export only; new minutes → PM Safety Meetings |
| `ToolboxTalk` (orphan table) | Migrate data → `safety_meetings` via one-time script |
| Form `toolbox-talk` | Keep for quick field capture; optional webhook to create PM meeting |
