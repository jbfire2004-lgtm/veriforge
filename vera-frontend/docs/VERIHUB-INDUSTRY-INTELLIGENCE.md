# VeriHub Industry Intelligence Dashboard

Industry-wide safety intelligence for **mining**, **construction**, and **manufacturing**.

## Route

- UI: `/hub/industry-intelligence`
- API: `GET|POST /api/v1/industry-intelligence`

## Capabilities

1. **AI ingest** of external sources (regulators, associations, public dashboards, government reports) — preview store in `lib/hub/industry-intelligence/ingest.ts`
2. **Normalize** HECA, TRIF, LTIF, severity, leading indicators before analytics (`normalize.ts`)
3. **Tokenize + anonymize** — org names, emails, addresses stripped; opaque tokens only
4. **Benchmarks** per industry × plane × period × region (`analytics.ts`)
5. **Dashboard** — HECA trends, TRIF/LTIF series, leading maturity, regional trends, industry comparisons, AI narratives, predictive risk (`ai.ts`, `dashboard.ts`)

## Rules (enforced)

| Rule | Behavior |
|------|----------|
| Never mix project/company planes | Default `crossPlaneOptIn: false`; mix only when UI checkbox / query `crossPlaneOptIn=1` |
| Minimum sample n≥5 | Categories with &lt;5 unique tokens return `suppressed: true` and null metrics |
| Normalize before analytics | Raw external records always pass `tokenizeAndAnonymize` before store queries |

## Query params

`plane` · `industry` · `period` · `regionCode` · `crossPlaneOptIn`

## POST body

Optional `sourceKind` (`regulator` \| `association` \| `public_dashboard` \| `government_report`) to simulate an external pull, then returns refreshed dashboard.
