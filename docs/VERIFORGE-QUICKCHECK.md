# QuickCheck

Instant contractor compliance snapshot: **compliance score**, **missing items**, and **risk level** (green / yellow / red), aggregated from Document Center, Audit & Evaluation, PVS, and Insurance. Every run is logged for analytics.

---

## File structure

```
services/veriforge-saas-service/
  prisma/schema.prisma                 # QuickCheckRun, QuickCheckRiskLevel
  prisma/migrations/20260826140000_quickcheck_runs/
  src/quickcheck/risk-levels.ts
  src/services/quickcheck.service.ts
  src/routes/quickcheck.routes.ts      # mounted at /quickcheck

vera-frontend/
  app/api/quickcheck/…                 # Next → SaaS proxy
  lib/quickcheck-api.ts
  src/components/quickcheck/
    QuickCheckModal.tsx                # modal + QuickCheckTrigger
    QuickCheckResultsPanel.tsx         # instant results
    InstantQuickCheckPanel.tsx         # full page panel + run history
  app/verihub/quickcheck/page.tsx
  # Triggers also on:
  #   ContractorProfileView (source=profile)
  #   /verihub/analytics (source=analytics)
```

---

## API

| Method | Path | Body / query | Output |
|--------|------|--------------|--------|
| POST | `/quickcheck` | `{ contractorId, source? }` | Full result + creates `QuickCheckRun` |
| GET | `/quickcheck/:contractorId` | `?source=` | Same (default source `page`) |
| GET | `/quickcheck/:contractorId/runs` | pagination | Logged runs |
| GET | `/quickcheck/:contractorId/analytics` | — | 30-day trend / risk mix |

**Result shape**

```json
{
  "runId": "…",
  "contractorId": "…",
  "complianceScore": 72,
  "riskLevel": "yellow",
  "riskLabel": "Medium risk",
  "riskDescription": "…",
  "missingItems": [
    { "code": "…", "label": "…", "severity": "critical|major|minor", "source": "documents|audits|pvs|insurance" }
  ],
  "breakdown": {
    "documentsScore": 0,
    "auditsScore": 0,
    "insuranceScore": 0,
    "pvsScore": 0,
    "insuranceStatus": "…",
    "weights": { "documents": 0.35, "audits": 0.35, "insurance": 0.15, "pvs": 0.15 }
  },
  "checks": [],
  "source": "profile",
  "generatedAt": "…"
}
```

Legacy: `GET /pvs/quickcheck/:id` delegates to this module (`source=pvs_legacy`).

---

## Scoring & risk

Compliance score = directory formula (Documents + Audits + Insurance + PVS). Recalculated on each QuickCheck.

| Risk | Rule |
|------|------|
| **green** (low) | Score ≥ 80 and no critical/major missing items |
| **yellow** (medium) | Score ≥ 60 with major gaps, or score &lt; 80 |
| **red** (high) | Any **critical** missing item, or score &lt; 60 |

Missing items include: insurance expired/missing, required docs, expired/expiring docs, open findings / failed audits / open CAs, PVS required coverage gaps.

---

## UI

| Surface | How |
|---------|-----|
| Modal | `QuickCheckTrigger` / `QuickCheckModal` |
| Results | `QuickCheckResultsPanel` |
| Page | `/verihub/quickcheck` → `InstantQuickCheckPanel` |
| Contractor Profile | **Run QuickCheck** on profile header (`source=profile`) |
| Analytics Dashboard | Trigger + 30-day stats (`source=analytics`) |

---

## Integration steps

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

1. Ensure Contractor Directory profile exists for `contractor_id`.
2. `POST /quickcheck` with `{ "contractorId": "<uuid>", "source": "api" }`.
3. Open **VeriHub → QuickCheck**, or use **Run QuickCheck** on Directory profile / Analytics.
4. Inspect logged runs via `GET /quickcheck/:id/runs` or Analytics 30-day mix.

---

## Vera nav

Feature: VeriHub → **QuickCheck** (`/verihub/quickcheck`). Shell: `VeriHubConsoleShell`.
