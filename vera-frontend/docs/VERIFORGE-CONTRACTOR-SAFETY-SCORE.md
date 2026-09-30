# Contractor Safety Program Assessment Score Service

**Product name:** Contractor Safety Score (CSS)  
**Analogy:** ISNetworld-style prequalification / ongoing program score  
**Status:** Preview implemented (in-memory compute + Next.js API + UI at `/core/contractor-scores`)  
**Domain owner:** Shared VeriForge service (consumed by VERICore, VERIPM, contractor portal)  
**Code:** `lib/contractor-safety-score/*`, `app/api/v1/contractor-scores/*`, `components/contractor-safety-score/*`  
**Entities:** contractor · company (prime) · project  

**Related:**  
- [`VERIFORGE-VERICORE-DASHBOARD.md`](./VERIFORGE-VERICORE-DASHBOARD.md) — `contractor.program_score`  
- [`VERIFORGE-VERIPM-DASHBOARD.md`](./VERIFORGE-VERIPM-DASHBOARD.md) — shared assessment, do not duplicate  
- Live today: `contractor-compliance-engine`, AI verification, VeriForge demo scores (converge into CSS)

---

## 1. Product intent

Give primes a **single, explainable 0–100 score** (plus letter grade) for each contractor they hire — based on submitted program documents, worker training, incidents, CAPA responsiveness, audits/inspections, and safety-meeting participation.

The score must be:

1. **Transparent** — every point traces to documents and metrics  
2. **Scoped** — prime↔contractor, optionally project-overlaid  
3. **Fresh** — recalculates on new incidents, training, audits, CAPA, policy updates  
4. **Reusable** — one service powers company dashboards, project dashboards, and contractor profiles  

This service **replaces fragmented scores** (VeriForge demo compliance/performance, ad-hoc AI compliance bars) as the **canonical program score**. The compliance engine’s approve/conditional/reject and predictive risk scores remain complementary signals, not substitutes.

---

## 2. Score model (outputs)

### 2.1 Overall

| Field | Definition |
|-------|------------|
| `overallScore` | 0–100, weighted sum of pillar scores |
| `grade` | A / B / C / D (see §2.3) |
| `status` | `current` \| `stale` \| `insufficient_data` \| `suspended` |
| `scoredAt` | Last successful calculation |
| `period` | Lookback window used (e.g. rolling 12 months) |
| `dataSources` | List of source systems / document types used |

### 2.2 Pillars (subscores 0–100)

| Pillar id | Label | Default weight | Primary inputs |
|-----------|-------|----------------|----------------|
| `program_completeness` | Program completeness | 25% | Policies, procedures, HSE manual, orientations, insurance/WCB docs |
| `performance` | Performance (incidents / near misses) | 25% | Incident frequency, severity, recency; near-miss reporting quality |
| `responsiveness` | Responsiveness (corrective actions) | 20% | CAPA open/overdue, avg closure time, verification rate |
| `training_competency` | Training and competency | 20% | Contractor worker training compliance, expiry, role coverage |
| `audit_inspection` | Audit & inspection results | 10% | Inspection findings severity, closeout, audit scores |
| *(leading)* | Safety meetings / toolbox talks | *folded into program or leading overlay* | Meeting attendance / toolbox completion rate |

**Leading participation** (safety meetings, toolbox talks) is modeled as either:

- **Option A (recommended):** sub-dimension under `program_completeness` (weight 30% of that pillar), or  
- **Option B:** sixth pillar at 5–10% with other weights renormalized  

Default = **Option A** so the four required subscores stay primary in the UI.

```
overallScore = Σ (pillarScore_i × weight_i)
weights configurable per prime company (must sum to 1.0)
```

### 2.3 Grades

| Grade | Score range | Meaning |
|-------|-------------|---------|
| **A** | 90–100 | Preferred / unrestricted (subject to scope risk) |
| **B** | 75–89 | Acceptable with monitoring |
| **C** | 60–74 | Conditional — remediation plan required |
| **D** | 0–59 | High concern — elevated approval / block new awards |

Optional hard gates (override grade downward regardless of math):

- Open critical CAPA &gt; N days → max grade **C**  
- Fatality / SIF in lookback without closed investigation → max grade **D**  
- Missing mandatory policy set → `status = insufficient_data`, score capped at 59  

### 2.4 Pillar formulas (canonical)

#### Program completeness (`program_completeness`)

```
requiredDocs = prime’s required policy/procedure checklist for contractor trade/scope
submittedValid = count(docs with status valid|approved and not expired)
docScore = submittedValid / requiredDocs × 100

meetingScore = toolbox_and_safety_meeting_attendance_pct   // 0–100
pillar = docScore × 0.70 + meetingScore × 0.30
```

#### Performance (`performance`)

```
// lower incident burden = higher score; near-miss reporting rewarded separately
severityWeightedRate = Σ(incident_weight × recency_decay) / contractor_hours × 200000
incidentScore = clamp(100 - f(severityWeightedRate, industry_or_prime_benchmark), 0, 100)

nearMissScore = near_miss_reporting_index  // higher reporting culture → higher (capped)

pillar = incidentScore × 0.75 + nearMissScore × 0.25
```

Recency decay example: events &lt;90d ×1.0, 90–180d ×0.7, 180–365d ×0.4, &gt;365d ×0.2.

#### Responsiveness (`responsiveness`)

```
closureScore = score_from_avg_capa_closure_days  // e.g. ≤7d→100, 14d→85, 30d→60, 60d→30
overduePenalty = min(40, overdue_capa_count × 8)
verificationBonus = verified_capa_pct × 10  // 0–10 points
pillar = clamp(closureScore - overduePenalty + verificationBonus, 0, 100)
```

#### Training & competency (`training_competency`)

```
pillar = workers_fully_compliant / workers_on_prime_sites × 100
// optional: blend expiring_soon penalty (−0.5 × expiring_pct)
```

Scope: workers employed by contractor with activity on **this prime’s** projects/sites (company score) or **this project** (project overlay).

#### Audit & inspection (`audit_inspection`)

```
findingBurden = weighted_open_findings / inspections_in_period
closeoutScore = on_time_closeout_pct
pillar = clamp(100 - findingBurden_scaled, 0, 70) × 0.6 + closeoutScore × 0.4
```

---

## 3. Data model

### 3.1 Core tables

```prisma
enum ContractorScoreGrade {
  A
  B
  C
  D
}

enum ContractorScoreStatus {
  current
  stale
  insufficient_data
  suspended
}

enum ContractorScoreScope {
  prime_contractor          // company-level: prime ↔ contractor
  project_overlay           // same pair, metrics scoped to one project
}

/// Prime-configurable rubric (weights + required docs + gates).
model ContractorScoreRubric {
  id              String   @id @default(uuid())
  primeCompanyId  Int      @map("prime_company_id")
  name            String   @default("default")
  version         Int      @default(1)
  weightsJson     Json     @map("weights_json")
  /// { program_completeness, performance, responsiveness, training_competency, audit_inspection }
  requiredDocsJson Json    @map("required_docs_json")
  /// [{ code, label, documentType, mandatory }]
  gatesJson       Json     @default("{}") @map("gates_json")
  lookbackDays    Int      @default(365) @map("lookback_days")
  active          Boolean  @default(true)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@unique([primeCompanyId, name, version])
  @@index([primeCompanyId, active])
  @@map("contractor_score_rubric")
}

/// Latest score card (materialized).
model ContractorSafetyScore {
  id                    String   @id @default(uuid())
  primeCompanyId        Int      @map("prime_company_id")
  contractorCompanyId   Int      @map("contractor_company_id")
  projectId             Int?     @map("project_id") // null = prime-level
  scope                 ContractorScoreScope @default(prime_contractor)
  rubricId              String   @map("rubric_id")
  rubricVersion         Int      @map("rubric_version")

  overallScore          Float    @map("overall_score")
  grade                 ContractorScoreGrade
  status                ContractorScoreStatus @default(current)

  programCompleteness   Float    @map("program_completeness")
  performance           Float
  responsiveness        Float
  trainingCompetency    Float    @map("training_competency")
  auditInspection       Float    @map("audit_inspection")

  periodStart           DateTime @map("period_start")
  periodEnd             DateTime @map("period_end")
  scoredAt              DateTime @map("scored_at")
  dataSourcesJson       Json     @default("[]") @map("data_sources_json")
  inputsJson            Json     @default("{}") @map("inputs_json") // raw counts used
  gatesTriggeredJson    Json     @default("[]") @map("gates_triggered_json")
  revision              Int      @default(1)

  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  rubric ContractorScoreRubric @relation(fields: [rubricId], references: [id])

  @@unique([primeCompanyId, contractorCompanyId, projectId, scope])
  @@index([primeCompanyId, overallScore])
  @@index([contractorCompanyId, scoredAt])
  @@index([projectId, overallScore])
  @@map("contractor_safety_score")
}

/// Immutable history for trends.
model ContractorSafetyScoreHistory {
  id                    String   @id @default(uuid())
  scoreId               String   @map("score_id")
  primeCompanyId        Int      @map("prime_company_id")
  contractorCompanyId   Int      @map("contractor_company_id")
  projectId             Int?     @map("project_id")
  overallScore          Float    @map("overall_score")
  grade                 ContractorScoreGrade
  pillarsJson           Json     @map("pillars_json")
  scoredAt              DateTime @map("scored_at")
  triggerEvent          String?  @map("trigger_event")
  snapshotJson          Json     @default("{}") @map("snapshot_json")

  @@index([contractorCompanyId, scoredAt])
  @@index([primeCompanyId, contractorCompanyId, scoredAt])
  @@map("contractor_safety_score_history")
}

/// Evidence rows powering drill-down.
model ContractorScoreEvidence {
  id                    String   @id @default(uuid())
  scoreId               String   @map("score_id")
  pillar                String
  evidenceType          String   @map("evidence_type")
  /// policy_doc | training_record | incident | capa | inspection | meeting | metric
  title                 String
  subtitle              String?
  weightContribution    Float?   @map("weight_contribution") // approx points toward overall
  metricKey             String?  @map("metric_key")
  metricValue           Float?   @map("metric_value")
  documentId            String?  @map("document_id")
  entityType            String?  @map("entity_type")
  entityId              String?  @map("entity_id")
  href                  String?
  occurredAt            DateTime? @map("occurred_at")
  createdAt             DateTime @default(now()) @map("created_at")

  @@index([scoreId, pillar])
  @@index([documentId])
  @@map("contractor_score_evidence")
}

/// Submitted policies/procedures registry (if not solely Document Service).
model ContractorProgramDocument {
  id                    String   @id @default(uuid())
  contractorCompanyId   Int      @map("contractor_company_id")
  primeCompanyId        Int?     @map("prime_company_id") // null = contractor library
  docCode               String   @map("doc_code") // matches rubric requiredDocs
  documentId            String?  @map("document_id")
  title                 String
  status                String   // draft | submitted | approved | rejected | expired
  effectiveAt           DateTime? @map("effective_at")
  expiresAt             DateTime? @map("expires_at")
  reviewedAt            DateTime? @map("reviewed_at")
  reviewedByUserId      Int?     @map("reviewed_by_user_id")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@unique([contractorCompanyId, primeCompanyId, docCode])
  @@index([contractorCompanyId, status])
  @@map("contractor_program_document")
}
```

### 3.2 API response shape

```ts
type ContractorSafetyScoreDto = {
  id: string;
  primeCompanyId: number;
  contractorCompanyId: number;
  contractorName: string;
  projectId: number | null;
  scope: "prime_contractor" | "project_overlay";
  overallScore: number;
  grade: "A" | "B" | "C" | "D";
  status: "current" | "stale" | "insufficient_data" | "suspended";
  pillars: {
    programCompleteness: PillarDto;
    performance: PillarDto;
    responsiveness: PillarDto;
    trainingCompetency: PillarDto;
    auditInspection: PillarDto;
  };
  scoredAt: string;
  period: { start: string; end: string };
  dataSources: Array<{ id: string; label: string; count?: number }>;
  gatesTriggered: Array<{ code: string; label: string; effect: string }>;
  revision: number;
  href: string; // contractor profile
};

type PillarDto = {
  id: string;
  label: string;
  score: number;
  weight: number;
  weightedContribution: number; // score × weight
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
};
```

---

## 4. API endpoints

Base: `/api/v1/contractor-scores`  
Guards: JWT + module permission `pm.contractor-scores` (primes) / contractor self-read limited  
Tenant: prime can only see contractors linked via membership or project link.

### 4.1 Fetch

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/contractor-scores` | List scores for prime (`?projectId=&grade=&minScore=`) |
| `GET` | `/api/v1/contractor-scores/:contractorCompanyId` | Prime-level score for one contractor |
| `GET` | `/api/v1/contractor-scores/:contractorCompanyId/project/:projectId` | Project overlay score |
| `GET` | `/api/v1/contractor-scores/:contractorCompanyId/history` | Trend points (`?from=&to=&projectId=`) |
| `GET` | `/api/v1/contractor-scores/:contractorCompanyId/evidence` | Drill-down evidence (`?pillar=`) |
| `GET` | `/api/v1/contractor-scores/:contractorCompanyId/pillars/:pillarId` | Single pillar detail + formula + evidence |
| `GET` | `/api/v1/projects/:projectId/contractor-scores` | All companies/contractors on project |
| `GET` | `/api/v1/companies/:companyId/hired-contractor-scores` | Company dashboard feed |

### 4.2 Recalculate

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/contractor-scores/:contractorCompanyId/recalculate` | Force recompute (prime) |
| `POST` | `/api/v1/contractor-scores/recalculate-batch` | `{ contractorCompanyIds?, projectId? }` |
| `POST` | `/api/v1/contractor-scores/internal/invalidate` | Event-bus / internal only |

### 4.3 Rubric & documents

| Method | Path | Purpose |
|--------|------|---------|
| `GET/PUT` | `/api/v1/contractor-scores/rubric` | Active rubric for prime |
| `GET` | `/api/v1/contractor-scores/:id/program-documents` | Policy/procedure checklist status |
| `POST` | `/api/v1/contractor-scores/:id/program-documents` | Submit/link document |
| `PATCH` | `/api/v1/contractor-scores/program-documents/:docId` | Approve/reject/expire |

### 4.4 Compatibility aliases (dashboards)

```
GET  /api/v1/core/dashboard/.../contractors → embeds ContractorSafetyScoreDto
GET  /api/v1/pm/dashboard/.../contractors   → same DTO
PUT  /api/v1/core/dashboard/.../assessment  → deprecated; proxy to recalculate + optional manual override note
```

Manual score overrides are **discouraged**; if needed, store as `gatesTriggered` / adjustment evidence with auditor id — never silent.

---

## 5. Recalculation & smart behavior

### 5.1 Triggers → `contractor_score.invalidate`

| Event | Pillars affected |
|-------|------------------|
| Policy/procedure upload, approve, expire | program_completeness |
| Training record create/verify/expire | training_competency |
| Incident / near miss create/update | performance |
| CAPA create/close/verify/overdue | responsiveness |
| Inspection/audit finding create/close | audit_inspection |
| Safety meeting / toolbox attendance | program_completeness (meetings) |
| Membership create (new hire relationship) | full score bootstrap |
| Rubric weight change | full recompute for prime’s contractors |

### 5.2 Pipeline

```
event → enqueue (debounce 10–30s per prime+contractor[+project])
     → gather inputs (docs, training, incidents, CAPA, inspections, meetings)
     → compute pillars + gates
     → upsert ContractorSafetyScore
     → append ContractorSafetyScoreHistory
     → replace ContractorScoreEvidence rows
     → bump revision
     → emit contractor_score.updated
     → invalidate VERICore / VERIPM dashboard snapshots
```

### 5.3 Staleness

- If inputs change but recompute pending → `status = stale` (UI shows amber “Updating…”)  
- If mandatory docs missing → `insufficient_data`  
- Prime can suspend contractor scoring (`suspended`) without deleting history  

---

## 6. UI components

### 6.1 Placement

| Surface | Component | Behavior |
|---------|-----------|----------|
| Company dashboard (VERICore / VERIPM) | `ContractorScoreBadge` + table column | Sort/filter by grade; click → drill |
| Project dashboard | `ProjectContractorScoreRow` | All related companies/contractors |
| Contractor profile | `ContractorScoreHero` | Large score, grade, pillars, trend, evidence |
| Project companies panel | Replace ad-hoc AI bars with `ContractorScoreCompact` | Keep compliance-engine approval as secondary chip |
| Contractor portal (self) | Read-only score + gap list | What to fix |

### 6.2 Component specs (VeriForge industrial)

**`ContractorScoreBadge`**
- Props: `overallScore`, `grade`, `status`, `size: sm|md|lg`, `onClick`
- Visual: score number + grade pill (A teal/green, B blue, C amber, D controlled red)
- Stale: muted + “Updating”

**`ContractorScoreHero`**
- Overall + grade + scoredAt + dataSources chips  
- Five pillar meters with weight labels  
- Sparkline from history (12 points)  
- CTA: “View evidence”

**`ContractorScorePillarCard`**
- Pillar score, weight, formula ⓘ, top 3 evidence links  
- Click → pillar drill sheet

**`ContractorScoreEvidenceSheet`**
- Tabs by pillar  
- Table: title, type, date, contribution, open document  
- Formula strip for selected pillar  

**`ContractorScoreTrendChart`**
- overallScore over time; optional pillar series toggle  

**`ContractorProgramChecklist`**
- Required docs vs submitted/approved/expired  
- Upload / link Document Service  

### 6.3 Drill-down UX

1. Click score → sheet with hero + pillars  
2. Click pillar → evidence filtered to that pillar + formula/inputs  
3. Click evidence row → document or entity (incident, CAPA, training, meeting)  
4. Trend tab → history; click point → that revision’s evidence snapshot  

Every pillar card shows:

```
formula + inputs (same pattern as VERICore/VERIPM metric cards)
```

### 6.4 Wireframe (profile)

```
┌─────────────────────────────────────────────────────────┐
│ Northline Electrical          Score 82  Grade B  Current │
│ Last updated 2026-07-10 21:14 · Sources: 6               │
│ [████████░░] 12-mo trend                                 │
├───────────────┬───────────────┬───────────────┬─────────┤
│ Program 88    │ Performance 79│ Respond 84    │ Train 90│
│ (25%)         │ (25%)         │ (20%)         │ (20%)   │
├───────────────┴───────────────┴───────────────┴─────────┤
│ Evidence · Program completeness                          │
│ ✓ HSE Policy (approved)  ·  ✓ Orientation packet         │
│ ✗ Confined space procedure (expired)  −4.2 pts           │
│ Meetings attendance 92%                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Integration map

```
                    ┌──────────────────────────┐
  Policies/docs ───►│                          │
  Training ────────►│  Contractor Score Service │──► VERICore dashboard
  Incidents ───────►│  (rubric → score →        │──► VERIPM dashboard
  CAPA ────────────►│   evidence → history)     │──► Project companies panel
  Inspections ─────►│                          │──► Contractor profile
  Meetings ────────►│                          │──► Contractor portal (self)
                    └────────────┬─────────────┘
                                 │
              complements (not replaced):
              compliance-engine approval,
              AI authenticity, predictive risk
```

**Membership anchor:** `PmContractorPortalMembership` (and/or `VeriCoreProjectCompanyLink`) defines which pairs are scored.

**Document Service:** program docs and evidence `documentId`s; VERIPM/VERICORE domains as applicable.

---

## 8. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **A** | Prisma models + rubric defaults + score compute from existing training/incident/CAPA/inspection queries |
| **B** | Fetch APIs + evidence materialization + history |
| **C** | UI: Badge, Hero, Evidence sheet on contractor profile + project companies panel |
| **D** | Event invalidation + dashboard embedding (VERICore/VERIPM) |
| **E** | Program document checklist + prime rubric editor |
| **F** | Deprecate/alias VeriForge demo scores; show CSS as canonical |

---

## 9. Acceptance criteria

- [ ] Overall 0–100 + grade A–D for prime↔contractor (optional project overlay)  
- [ ] Four primary subscores (+ audit pillar) with weights and formulas exposed  
- [ ] Metadata: `scoredAt`, `dataSources`, `status`  
- [ ] Shown on company dashboards, project dashboards, contractor profiles  
- [ ] Drill-down to contributing documents/metrics + trend history  
- [ ] Recalculates on incidents, training, audits, CAPA, policy updates (≤30s debounce)  
- [ ] Hard gates documented and visible when triggered  
- [ ] Single service consumed by VERICore and VERIPM (no duplicate score tables)  
