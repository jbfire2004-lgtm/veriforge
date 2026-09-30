# VeriForge Orientation — Frontend Architecture

Companion to [orientation-module-architecture.md](./orientation-module-architecture.md) and the Backend SOA.
Target UI: Next.js App Router (Vera) with a shared player kit for web + React Native (WebView / native shell) via Delivery deep links.

---

## 1. Top-level modules

| Module | Routes | Shell | Primary components |
|--------|--------|-------|--------------------|
| **Company Orientation Admin** | `/companies/[id]/orientation/*` | WorkspaceShell + company context | Dashboard, Editor, RequirementManager |
| **Project Orientation Admin** | `/pm/orientation/*` | WorkspaceShell + VeraModuleBar (PM) | Dashboard, Editor, RequirementManager |
| **Worker Orientation Experience** | `/onboarding/orientation`, `/o/[token]`, `/workers/me/orientations` | SignedInVeraLayout or minimal player chrome | WorkerOrientationList, OrientationPlayer |
| **AI Orientation Builder** | Embedded in Editor (+ optional drafts) | Same admin shell | AiBuilderSidebar |

Admin surfaces must use the unified Vera navigation (GlobalNav + ModuleBar). Do not add sidebars or module tab chrome.

---

## 2. Component hierarchy

```
OrientationAdminShell          # company | project scope providers
├── OrientationDashboard       # list · filters · stats · CTAs
├── OrientationEditor
│   ├── BlockCanvas            # DnD contentBlocks
│   ├── AssetPreviewPane       # PDF / PPT / video (uploaded | hybrid)
│   ├── AiBuilderSidebar       # AIOrientationBuilderService
│   └── VersionPanel           # major.minor · changelog · publish
├── OrientationRequirementManager
└── OrientationStatsDrawer

WorkerOrientationShell         # app + web
├── WorkerOrientationList      # profile · Start / Resume / Cert
├── OrientationPlayer          # block runners · progress · complete
└── OrientationCertificateView
```

### Core components

#### A. OrientationDashboard

- Lists `OrientationDefinition`s for company or project
- Filters: `type`, `status`, `version`, `contentMode`
- Actions: create, upload, edit, publish/unpublish, completion stats
- Subviews: `FilterBar`, `DefinitionTable`, `StatsStrip`, `EmptyState`

#### B. OrientationEditor

| Mode | Behavior |
|------|----------|
| **uploaded** | Preview assets; edit metadata only |
| **native** | Full block editor |
| **hybrid** | Asset preview + additional `contentBlocks` |

- Drag-and-drop blocks: `slide` | `text` | `video` | `quiz` | `policy_ack`
- AI sidebar actions:
  - Generate module from description
  - Convert uploaded file to blocks
  - Generate quiz from content
  - Improve this block
- Saves via `OrientationDefinitionService`; AI via `AIOrientationBuilderService`
- Versioning UI: current version, changelog, publish / unpublish

#### C. OrientationRequirementManager

- Attach orientations to: company, project, site, trade, union dispatch type
- Rule builder (who / what / by when), `mustCompleteBefore` selector
- Preview affected workers (`resolve` API)
- Integrates with `OrientationRequirementService`

#### D. WorkerOrientationList (App + Web)

- Required orientations, status (`pending` | `completed` | `expired`), due before (arrival/dispatch)
- Actions: Start, Resume, View certificate
- Integrates with `WorkerOrientationProfileService` + `DeliveryIntegrationService`

#### E. OrientationPlayer

- Mobile-first; PDF, video, slides, quiz, policy acknowledgment (checkbox + signature)
- Tracks progress, time spent, quiz answers
- On finish → `OrientationCompletionService`
- Composition: `SessionHeader` → `BlockRunner` → `SessionFooter`

---

## 3. State management

### Global (lightweight context)

- `currentCompany`, `currentProject`, `currentWorker`
- Sourced from route params + auth session via `OrientationScopeProvider`

### Orientation server state (React Query)

| Query key | Params |
|-----------|--------|
| `orientation.definitions` | companyId, projectId?, filters |
| `orientation.definition` | id |
| `orientation.requirements` | companyId, projectId?, workerId? |
| `orientation.completions` | workerId, orientationId? |
| `orientation.profile` | workerId, companyId, projectId? |
| `orientation.deliveryLinks` | workerId |
| `orientation.stats` | definitionId |

Hold **editor drafts** and **player progress** in local component/editor store — not in the React Query cache until save/complete succeeds.

---

## 4. Routing

| Path | Screen |
|------|--------|
| `/companies/[id]/orientation` | Company dashboard |
| `/companies/[id]/orientation/new` | Create / upload |
| `/companies/[id]/orientation/[orientationId]` | Editor / detail |
| `/companies/[id]/orientation/requirements` | RequirementManager |
| `/pm/orientation` | PM dashboard |
| `/pm/orientation/new` | Create (project context) |
| `/pm/orientation/[orientationId]` | Editor / detail |
| `/pm/orientation/requirements` | RequirementManager |
| `/onboarding/orientation` | Worker gate list |
| `/o/[token]` | Player (Delivery share URL) |
| `/workers/me/orientations` | Worker hub list |

Legacy `[packageId]` routes alias to `[orientationId]` during migration. RN opens `veriforge://orientation/{id}` into the same player surface.

---

## 5. API integration

| UI | Backend |
|----|---------|
| Dashboard | `GET/POST` definitions, publish, stats |
| Editor | `GET/PUT` definition, assets, AI generate/* |
| RequirementManager | CRUD requirements, resolve preview |
| Worker list | Profile + delivery links |
| Player | `POST` completions |

**Libs**

- `lib/orientation/api.ts` — fetch wrappers + Zod (`vera-api-contract`)
- `lib/orientation/queries.ts` — React Query hooks
- `lib/orientation/types.ts` — shared FE types
- `lib/orientation/scope.tsx` — `OrientationScopeProvider`

Patterns: invalidate related keys on mutation; optimistic publish toggle; `409` version conflict → refetch + toast; map `gatingStatus` to banners.

---

## 6. UX principles

| Principle | Practice |
|-----------|----------|
| Admin vs worker | Dense tables + Sms/Page layout vs single-column list + full-bleed player |
| Minimal friction | One primary CTA (Start/Resume); Delivery deep link opens first incomplete block |
| Strong feedback | Completion banners; gating warning strips on PM assignment when `blocked` |
| Accessibility | Landmarks, focus management, labeled controls, 44px targets, keyboard move up/down for blocks |
| Mobile-first | Player designed for small viewports first; admin progressive enhancement |

---

## 7. Folder structure

```
components/orientation/
  admin/
    OrientationDashboard.tsx
    OrientationEditor/
    OrientationRequirementManager.tsx
    AiBuilderSidebar.tsx
  worker/
    WorkerOrientationList.tsx
  player/
    OrientationPlayer.tsx
    blocks/
lib/orientation/
  api.ts
  queries.ts
  types.ts
  scope.tsx
app/companies/[id]/orientation/**
app/pm/orientation/**
app/onboarding/orientation/**
app/o/[token]/**
```

---

## 8. Evolve existing components

| Today | Target |
|-------|--------|
| `OrientationDashboard` | Keep; add `contentMode` / status filters |
| `OrientationBuilderUpload` / `OrientationBuilderAI` | Fold into `OrientationEditor` + `AiBuilderSidebar` |
| `OrientationAssignmentPanel` | → `OrientationRequirementManager` |
| `OrientationViewer` + `OrientationQuiz` | → `OrientationPlayer` block runners |
| `OrientationWorkerList` / `CompleteView` | → Worker list + certificate |
| `lib/orientation/api.ts` | Extend for definitions, requirements, profile, delivery |

---

## 9. FE delivery phases

| Phase | Scope |
|-------|--------|
| **P0** | Scope provider, React Query keys, Dashboard filters, profile-backed onboarding list |
| **P1** | Unified Editor + AI sidebar, RequirementManager, version UI |
| **P2** | Mobile player parity, `/o/[token]`, wallet card actions, RN WebView |

---

## Related

- Backend SOA: service endpoints for Definition, Requirement, Completion, Profile, AI, Delivery
- System architecture: domains Core / PM / Delivery
- Implementation index: see [orientation-module-architecture.md](./orientation-module-architecture.md) § File index
