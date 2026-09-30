# VeriForge Safety Scorecard Engine

Contractor safety scorecards integrate **compliance artifact weighting** into an org-level score cached in `OrgComplianceScorecard`.

## Model (`Scorecard` → `org_compliance_scorecards`)

| Field | Type | Description |
|-------|------|-------------|
| `compliance_score` | int | 0–100 compliance-weighted score |
| `compliance_breakdown` | JSON | Per-type buckets, weights, and rule snapshot |
| `global_score` | int | Global safety score (kept in sync with overall) |
| `overall_score` | int | Blended score (legacy alias) |
| `project_scores` | JSON | Per-project score slices |
| `calculated_at` | timestamp | Last recalculation |

Migration: `20260826060000_scorecard_compliance_breakdown` renames `breakdown` → `compliance_breakdown`.

## Compliance weighting rules

| Artifact | State | Weight |
|----------|-------|--------|
| **Insurance** | valid | +10 |
| | expiring (≤30 days) | +5 |
| | expired | −15 |
| **WCB** | valid | +10 |
| | expired | −20 |
| **COR** | valid | +15 |
| | expired | −10 |
| **SCSA** | active | +10 |
| | inactive | −10 |

Missing artifacts use type-specific missing penalties (insurance −25, wcb −20, cor −25). Pending review = 0.

Base score **50**; result clamped 0–100.

Rules live in `src/compliance/weights.ts`. Calculation in `compliance-scorecard.service.ts`.

## Automatic recalculation

Scorecards refresh when:

- Compliance artifact **uploaded** (`compliance.service.upload`)
- Artifact **approved/rejected** (`compliance.service.review`)
- Artifact **updated** (`compliance.service.update`)
- Artifact **expires** (`compliance.service.checkExpiries` via hourly/daily cron)

## API (`/scorecard`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/scorecard/:org_id` | Org (same tenant) or hiring-client JWT |
| POST | `/scorecard/recalculate` | Org JWT + `scorecards` module |

## UI

- `/verihub/scorecards` — compliance score, breakdown table, manual recalculate
- Client: `vera-frontend/lib/scorecard-api.ts`
- Proxy: `/api/scorecard/[...path]`

## Bridges

- Nest tRPC: `scorecard.getByOrg`, `scorecard.recalculate`

```powershell
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

See also [VERIFORGE-COMPLIANCE-MODULE.md](./VERIFORGE-COMPLIANCE-MODULE.md).
