# Anonymization Logic

## Pipeline stages

### Stage A — Anonymize (strip)

Remove or redact from ingress payloads:

| Remove | Examples |
|--------|----------|
| Direct identifiers | company legal name, project name, contract # |
| Personal data | worker name, email, phone, badge ID, userId |
| Precise location | street address, exact lat/lon (optional region code OK) |
| Free text | incident narratives, comments (replace with keyword aggregates only) |
| Stable public IDs | external permit numbers |

Retain for tokenization only (in memory): `projectId` / `companyId`, industry, subtype cues, scale inputs, metric numerators/denominators.

### Stage B — Tokenize

Reuse / extend `hashId` from `packages/vera-global-network`:

```ts
import { hashId } from "@vera/global-network"; // pattern

const PROJECT_SALT = process.env.VISI_PROJECT_SALT ?? "visi-project-v1";
const COMPANY_SALT = process.env.VISI_COMPANY_SALT ?? "visi-company-v1";

function tokenForProject(projectId: string | number): string {
  return `proj_${hashId(projectId, PROJECT_SALT).replace(/^anon-/, "")}`;
}

function tokenForCompany(companyId: string | number): string {
  return `co_${hashId(companyId, COMPANY_SALT).replace(/^anon-/, "")}`;
}
```

**Rules:**

- Different salts per plane → same numeric id in different planes ≠ linkable  
- Tokens **never** returned to Hub Industry Safety UI  
- Tokens used only inside plane stores for upsert/dedup  
- Salt rotation requires full re-token batch (versioned salts `v1`, `v2`)  

### Stage C — Normalize

1. Map industry → `IndustryCode`  
2. Map subtype → plane-specific enum  
3. Compute `scale` from band config  
4. Convert metrics to canonical units (e.g. TRIF per 200,000 hours)  
5. Clamp rates; drop non-finite values  
6. Attach `period` grain  

Output row:

```ts
{
  plane: "project" | "company",
  token: string,              // internal only
  industry: IndustryCode,
  subtype: string,
  scale: ScaleBand,
  period: string,
  metrics: NormalizedMetrics  // no PII
}
```

## Blind aggregation

```ts
function aggregate(rows: NormalizedFact[]): CohortResult {
  const groups = groupBy(rows, cohortKey);
  return groups.map((g) => {
    const entityCount = distinctTokens(g);
    if (entityCount < MIN_SAMPLE) {
      return { key: g.key, suppressed: true, metrics: null, entityCount };
    }
    return {
      key: g.key,
      suppressed: false,
      entityCount,
      metrics: computeMetrics(g.rows), // means/rates only
    };
  });
}
```

Never emit min/max that collapse to one entity when n is small (e.g. skip min/max unless n ≥ 10).

## Keyword aggregation (narratives)

If hazard text is contributed, use aggregate keyword counts (see `aggregateHazardKeywords` in global-network) — never raw sentences in Hub responses.

## Predictive features

Allowed: cohort means/rates, seasonal indices, industry one-hots, scale one-hots.  
Forbidden: tokens, tenant IDs, single-entity residuals when n &lt; 10.

## Threat controls

| Threat | Control |
|--------|---------|
| Link project↔company | Separate salts + no cross-plane token join |
| Small-n re-ID | Suppress n &lt; 5; hide exact counts optionally |
| Insider raw export | Contribute allowlist + RBAC + audit |
| Cache leak | Cache keys by plane; no raw ID in keys |
| Cross-compare abuse | Permission + consent + audit + TTL |

## Implementation

Canonical engine: **`@vera/hub-industry-safety`**  
Docs: [`anonymization-engine.md`](./anonymization-engine.md)

```ts
import { VeriHubAnonymizationNormalizationEngine } from "@vera/hub-industry-safety";
```

Nest facade: `VisiAnonymizationEngineService`  
Contribute: `POST /api/v1/hub/industry-safety/contribute`
