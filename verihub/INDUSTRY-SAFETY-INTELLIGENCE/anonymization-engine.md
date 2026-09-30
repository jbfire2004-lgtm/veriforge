# VeriHub Anonymization & Normalization Engine

Package: `@vera/hub-industry-safety`  
Class: `VeriHubAnonymizationNormalizationEngine`

## Functions

| Function | Module |
|----------|--------|
| Tokenize company & project IDs | `tokenize.ts` → `proj_*` / `co_*` (separate salts) |
| Strip names, locations, identifiers | `strip.ts` |
| Normalize incidents per 200,000 hours | `normalize.ratePer200k` |
| Severity index (0–100) | `normalize.severityIndex` |
| Standardized HECA categories | `normalize.standardizeHeca*` |
| Standardized project/company types | `normalize.standardizeProjectType` / `standardizeCompanyType` |
| Blind aggregation | `aggregate.blindAggregate` |
| Minimum sample (n≥5) | `shouldSuppress` / aggregate suppress |
| Cross-category isolation | `isolation.ts` |

## Pipeline

```
RawEntityRecord
  → stripIdentifiers()          // remove PII / names / precise geo / narratives
  → tokenizeEntityId()          // proj_* or co_* (internal only)
  → standardize* + normalizeMetrics()
  → NormalizedPlaneFact
  → blindAggregate()            // suppress if distinct tokens < 5
  → public payload (no tokens)
```

## Usage

```ts
import { VeriHubAnonymizationNormalizationEngine } from "@vera/hub-industry-safety";

const engine = new VeriHubAnonymizationNormalizationEngine();
const result = engine.ingest(rawRecord);
if (result.ok) {
  const cohort = engine.aggregateCohort([result.fact], key);
  const publicView = engine.toPublicAggregate(cohort);
}
```

## Isolation rules

- Project APIs reject `companyType` / `companyId`
- Company APIs reject `projectType` / `projectId`
- Subtype must match plane enum
- Cross-compare requires `explicitConsent` (+ permission when provided)
- No cross-plane token joins

## Build

```bash
cd packages/vera-hub-industry-safety
npm install
npm run build
```
