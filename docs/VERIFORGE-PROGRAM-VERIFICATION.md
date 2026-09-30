# Program Verification System (PVS)

Written safety program verification with a category → required-elements safety matrix, exemption approval workflow, and 15% contribution to Contractor Directory compliance.

**Prerequisite:** Contractor Directory profile.

---

## File structure

```
services/veriforge-saas-service/
  prisma/schema.prisma
    # ProgramVerification, PvsMatrixElement + enums
  prisma/migrations/20260826130000_program_verification/
  src/pvs/safety-matrix.ts                    # category → elements
  src/compliance/contractor-directory-score.ts # weights include pvs: 0.15
  src/services/program-verification.service.ts
  src/routes/pvs.routes.ts                    # mounted at /pvs

vera-frontend/
  app/api/pvs/[...path]/route.ts
  lib/pvs-api.ts
  src/components/pvs/
    PvsDashboard.tsx
    ProgramViewer.tsx
    PvsExemptionModal.tsx
    PvsAnalyticsPanel.tsx
    QuickCheckPanel.tsx
    PvsStatusBadge.tsx
  app/verihub/pvs/page.tsx
  app/verihub/analytics/page.tsx
  app/verihub/quickcheck/page.tsx
```

---

## Schema

| Field | Source |
|-------|--------|
| `pvs_id` | `ProgramVerification.id` |
| `contractor_id` | org / directory profile id |
| `program_category` | enum (hazard assessment, ERP, PPE, …) |
| `verification_status` | `draft \| submitted \| in_review \| verified \| rejected \| exempt \| missing` |
| `exemption_flag` | + reason + approval status (`none/pending/approved/rejected`) |
| `reviewer_id` | assigned reviewer |
| `safety_matrix[]` | JSON snapshot + `PvsMatrixElement` rows |

Unique per `(contractorId, programCategory)`.

---

## Safety matrix

Defined in `safety-matrix.ts`. Required categories (for coverage score): hazard assessment, emergency response, incident investigation, PPE, substance abuse, orientation & training. Optional: heights, confined space, LOTO, environmental, other.

Each category lists required/optional elements (policy, forms, training, …) with per-element status.

---

## Compliance scoring

```
documents×0.35 + audits×0.35 + insurance×0.15 + pvs×0.15
```

`calculatePvsScore` averages required-category status (verified/exempt = 100; missing = 0). Recalculates on PVS writes.

---

## API (`/pvs`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/pvs/matrix` | Category definitions |
| GET | `/pvs/dashboard/:contractorId` | Coverage + indicators |
| GET | `/pvs/analytics/:contractorId` | Dashboard + element stats |
| GET | `/pvs/quickcheck/:contractorId` | PVS + docs + open findings |
| GET | `/pvs/:contractorId` | List programs |
| POST | `/pvs/:contractorId` | Create program (+ matrix seed) |
| POST | `/pvs/:contractorId/ensure-required` | Seed all required categories |
| GET/PATCH | `/pvs/:contractorId/:pvsId` | Get / update written program |
| POST | `…/submit` | Submit for review |
| POST | `…/assign` | Assign reviewer |
| POST | `…/matrix` | Update element statuses |
| POST | `…/verify` | `{ decision: verified\|rejected, elements? }` |
| POST | `…/exempt` | Request exemption |
| POST | `…/exempt/decide` | Approve / reject |
| POST | `…/exempt/clear` | Clear exemption |

Next proxy: `/api/pvs/*` → SaaS `/pvs/*`.

---

## Workflows

1. **Create / seed** — matrix elements initialized from category definition  
2. **Edit written program** → **submit** → **assign reviewer** → **verify matrix elements** → **verify / reject**  
3. **Exemption** — request (pending) → approve (status `exempt`, counts as satisfied) or reject  

---

## Analytics & QuickCheck

| UI | Route | Source |
|----|-------|--------|
| Analytics dashboard | `/verihub/analytics` | PVS analytics + QuickCheck trends |
| QuickCheck | `/verihub/quickcheck` | Dedicated module — see `docs/VERIFORGE-QUICKCHECK.md` |
| PVS console | `/verihub/pvs` | Dashboard + program viewer + exemption modal |

`GET /pvs/quickcheck/:id` remains as a legacy alias that delegates to `/quickcheck`.

---

## Integration steps

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

1. Create Contractor Directory profile if missing  
2. Open **VeriHub → PVS** → **Seed required programs**  
3. Fill written programs, mark matrix elements, submit / verify (or request exemption)  
4. Confirm compliance breakdown shows **PVS 15%** on Directory profile  
5. Use **Analytics** and **QuickCheck** for readiness signals  

---

## UI (Vera nav)

Features under VeriHub: **PVS**, **Analytics**, **QuickCheck** (`vera-nav-config.ts`). Shell: `VeriHubConsoleShell`.
