# Validation Rules

## 1. Selector validation

| Field | Rule |
|-------|------|
| `industry` | Required; must be in taxonomy |
| `entityType` | Required; `project` \| `company` |
| `subtype` | Required for `/cohort`; must belong to `entityType` enum |
| `scale` | Required; `small` \| `medium` \| `large` \| `mega` |
| `period` | Required; match `^\d{4}-(0[1-9]|1[0-2])$` or `^\d{4}-Q[1-4]$` |

### Plane integrity

```
assert(subtype ∈ subtypesFor(entityType))
assert(query.planes.length === 1) unless cross-compare
reject(entityType=project && companyId filter)
reject(entityType=company && projectId filter)
```

## 2. Blind aggregation rules

1. Aggregation grain = `IndustryCohortKey` only.  
2. **Minimum sample:** `entityCount >= MIN_SAMPLE` where `MIN_SAMPLE = 5`.  
3. If below threshold:  
   - Do not return metric values  
   - Do not return exact `entityCount` to clients **optional hardening:** return `entityCount: null` and `suppressed: true` only (recommended for Hub UI)  
   - Recommended public meta: `{ suppressed: true, minSample: 5, entityCountVisible: false }`  
4. No top-N entity lists, no outliers that identify a single site.  
5. Free-text facets banned in Hub responses.  
6. Geographic rollups no finer than region/state band approved by policy (default: industry + scale only).  

## 3. Cross-category validation

| Rule | Enforcement |
|------|-------------|
| Permission | `HUB_INDUSTRY_SAFETY_CROSS_COMPARE` |
| Consent | `explicitConsent: true` in body |
| Align | Same `industry`, `scale`, `period` |
| Separation | Two cohort fetches; no SQL `UNION` of fact rows across planes for blended stats |
| Audit | Write audit event with userId, timestamp, selectors |

## 4. Contribution validation

- Contributor’s tenant may only push **their** entities  
- Fields allowlisted (KPIs, counts, hours) — no names, emails, phone, precise GPS  
- `entityType` required; row routed to one plane  
- Duplicate tokens in same period upserted, not doubled  

## 5. Metric validation

| Metric | Rule |
|--------|------|
| TRIF / LTIF | ≥ 0; finite; denominator hours &gt; 0 else null |
| Rates | Clamp 0–1 or 0–100 consistently (document unit in schema) |
| HECA | Rates 0–1; bucket counts only if n ≥ 5 |
| Seasonal | Each period point respects threshold independently |
| Predictive | `confidence` ∈ [0,1]; drivers max 10; no entity tokens in drivers |

## 6. API rejection matrix

| Input | HTTP | Code |
|-------|------|------|
| Project subtype on company query | 400 | `VISI_PLANE_MISMATCH` |
| Missing industry | 400 | validation |
| Cross-compare without consent | 403 | `VISI_CROSS_DENIED` |
| Mixed plane query param | 400 | `VISI_MIXED_PLANE` |
| Unknown scale | 400 | `VISI_INVALID_SCALE` |

## 7. UI validation

- Entity type change clears subtype  
- Cross-compare toggle off by default  
- Cannot pin project metrics onto company dashboard via URL without `entityType=company`  
- Deep links must include `entityType`; default `project`  

## 8. Config knobs

```ts
{
  minSample: 5,
  hideExactCountWhenSuppressed: true,
  scaleBands: { /* per industry overrides */ },
  crossCompareSessionTtlMinutes: 60
}
```
