# VeriSuite Intelligence System

**Codename:** VISI-X (VeriSuite Intelligence System — Extended)  
**Status:** Architecture + preview engines implemented  
**Entry:** `/hub/verisuite-intelligence`  
**Builds on:** VISI (`/hub/industry-safety`), VeriForge dashboards, FieldOS, VERICore/VERIPM

---

## 1. Full architecture

```
                    ┌──────────────────────────────────────────┐
                    │     VeriSuite Intelligence Hub (UI)      │
                    │  Selectors · Regional drill · AI insights │
                    │  Module dashboards: Hub · PM · Field · Core│
                    └────────────────────┬─────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌─────────────────┐           ┌─────────────────────┐         ┌──────────────────┐
│ Dual Dashboards │           │ Regional Drilldown  │         │ AI Insight Engine│
│ Project · Company│           │ Global→…→Site band  │         │ Trends·Anomalies │
└────────┬────────┘           └──────────┬──────────┘         └────────┬─────────┘
         │                               │                              │
         └───────────────┬───────────────┴──────────────────────────────┘
                         ▼
              ┌──────────────────────────┐
              │ Blind Aggregation Layer  │  n≥5 · plane isolation · k-anon
              └────────────┬─────────────┘
                           ▼
              ┌──────────────────────────┐
              │ Normalize · Tokenize     │
              │ Anonymize · Strip PII    │
              └────────────┬─────────────┘
                           ▲
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────────────┐ ┌───────────────┐ ┌──────────────────┐
│ Industry Ingest│ │ Tenant modules│ │ Cross-industry   │
│ mining·const.  │ │ Core·PM·Field │ │ rollup (gated)   │
│ manufacturing  │ │ Hub feeds     │ │                  │
└────────────────┘ └───────────────┘ └──────────────────┘
```

### Logical microservices

| Service | Responsibility |
|---------|----------------|
| **Industry Data Aggregation Engine** | Continuous ingest from mining, construction, manufacturing (+ energy/utilities); normalize to common metric schema |
| **Anonymization Service** | Strip PII → tokenize → region band coarsening → plane tagging |
| **Blind Aggregation Service** | Cohort means only; suppress n&lt;5; optional cross-industry with elevated k |
| **Regional Drilldown Engine** | Hierarchy rollups Global → Continent → Country → Province/State → Region → City-band → Site-band |
| **Dual Dashboard Router** | Project-scale vs Company-scale plane isolation |
| **AI Insight Engine** | Trend slopes, anomaly z-scores, risk pattern flags |
| **Module Dashboard Facades** | VeriHub / VeriPM / FieldOS / VeriCore bindings |

### Event-driven refresh

| Event | Effect |
|-------|--------|
| `visi.fact.contributed` | Rebuild cohort + regional caches |
| `permit.dashboard.invalidate` | Module dashboard revision bump |
| `compliance.recalc` | CSS + intelligence overlays |
| `visi.insight.detected` | Surface AI cards on Hub |

---

## 2. Full data model

### Geo hierarchy (`GeoNode`)

| Level | Code | Example | Industry pool? |
|-------|------|---------|----------------|
| `global` | `GLB` | Earth | Yes (cross-region) |
| `continent` | `NA` | North America | Yes |
| `country` | `CA` | Canada | Yes |
| `province_state` | `CA-AB` | Alberta | Yes |
| `region` | `CA-AB-north` | Northern AB | Yes if n≥5 |
| `city_band` | `CA-AB-edm` | Edmonton metro (banded) | Yes if n≥5 |
| `site_band` | `site_*` | Anonymized site token only | **Tenant drill only** — never industry pool with address |

**Rule:** Industry aggregates never expose site addresses. Site-level views are tenant-owned (VeriCore/PM/FieldOS), not VISI public cohorts.

### Contribution fact (`IndustryFact`)

```
fact_id, plane (project|company), industry, subtype, scale,
period, region_path[], region_band, token,
metrics { TRIF, LTIF, near_miss, HECA[], leading[], capa_days, training_pct, downtime? },
source_module (hub|pm|fieldos|core|external),
contributed_at, quality_score
```

### Cohort key (extended)

```
industry + plane + subtype + scale + period + region_level? + region_code?
```

### Dual plane stores

- `plane:project` — project-scale cohorts  
- `plane:company` — company-scale cohorts  
- Cross-plane compare only with audited consent  

### AI insight record

```
insight_id, scope (module|cohort|region), kind (trend|anomaly|risk_pattern),
severity, metric_id, summary, evidence_refs[], confidence, detected_at
```

Prisma VISI models (`VisiIndustry*`, `VisiTrendCache`) remain the durable store; preview engines use in-memory seeds until ETL is wired.

---

## 3. Full dashboard logic

### Dual scale

| Dashboard | Plane | Primary metrics |
|-----------|-------|-----------------|
| Project-Scale | `project` | HECA mix, FLHA/JHA density, SIF potential, permit load, TRIF proxies |
| Company-Scale | `company` | TRIF/LTIF, training compliance, CAPA closure, CSS distribution, multi-site risk |

### Module-specific dashboards

| Module | Route focus | Intelligence overlay |
|--------|-------------|----------------------|
| **VeriHub** | `/hub/verisuite-intelligence`, `/hub/industry-safety` | Industry cohorts, regional drill, AI insights |
| **VeriPM** | `/pm/dashboard` | PM completion vs industry, permit risk, maint incidents |
| **FieldOS** | `/field/permits` + Field readiness | Field task completion vs regional norms |
| **VeriCore** | `/core/dashboard` | Training/SMS vs industry percentile, permit-protected work |

### Smart behaviors

1. Selector change → refetch cohort with region filter  
2. Contribution / webhook → bump analytics revision  
3. AI engine runs on cohort series → emit insight cards when |z|&gt;2 or slope adverse  
4. Drill-down: metric → formula + underlying documents (tenant) or anonymized cohort members count only (industry)

---

## 4. Full selector system

Cascading selectors (order fixed):

1. **Scale plane** — Project | Company  
2. **Industry** — mining | construction | manufacturing | energy | …  
3. **Subtype** — plane-aware (civil / EPC / contractor / …)  
4. **Scale band** — small | medium | large | mega  
5. **Period** — YYYY-Qn or trailing 12m  
6. **Region ladder** — Global → … → City-band (Site-band only on tenant views)  
7. **Module lens** — Hub | PM | FieldOS | Core (filters insight + KPI set)

Availability API suppresses options with n&lt;5 (same as VISI `selectors/availability`).

---

## 5. Full anonymization rules

| Step | Rule |
|------|------|
| Strip | Remove names, emails, phones, exact addresses, worker IDs, GPS |
| Tokenize | `proj_*` / `co_*` HMAC tokens; never reverse in Hub |
| Region coarsen | Exact city → city_band; site → site_band token only |
| Normalize | Industry/subtype/scale enums; rates per 200k hours |
| Blind aggregate | Means only; n≥5; hide exact count when suppressed |
| Cross-industry | Requires admin + consent; k≥10 entities across ≥2 industries |
| Cross-plane | Denied by default (`VISI_CROSS_DENIED`) |
| Export | No raw facts; cohort metrics + suppressed flags only |

---

## 6. Full industry ingestion logic

```
Sources (mining / construction / manufacturing / …)
  → Adapter (map local schema → IndustryFactRaw)
  → Quality gate (hours present, period valid)
  → Anonymize pipeline
  → Store in plane repository
  → Invalidate cohort + regional + trend caches
  → AI Insight Engine recompute
```

Adapters (preview + Nest contribute):

| Industry | Primary signals |
|----------|-----------------|
| Construction | TRIF, falls, excavation permits, FLHA density |
| Mining | Ground control, LOTO, confined space, fatigue leading |
| Manufacturing | Machine guarding, LOTO, recordables, PM downtime coupling |

Continuous: scheduled poll + `POST /api/v1/hub/industry-safety/contribute` + VeriForge event bus.

---

## 7. Full regional drilldown logic

```
GET /api/v1/verisuite-intelligence/regional
  ?plane=company&industry=construction&level=country&code=CA

Response:
  node { level, code, label }
  breadcrumbs [global, continent, …]
  children [{ code, label, entityCountVisible, suppressed, metrics? }]
  selfMetrics (if not suppressed)
  insights []
```

Rollup: child metrics weighted by hours (or equal weight when hours missing). Suppression evaluated **at each node**. Descending into a suppressed child returns empty metrics + reason.

Tenant site drill uses dashboard-analytics `scopeType` chain company → project → asset/worker — **not** industry pool.

---

## 8. Module-specific dashboards (bindings)

| Module | Metrics bound to intelligence |
|--------|-------------------------------|
| Hub | Cohort TRIF/LTIF, regional tree, AI insights, dual plane |
| VeriPM | `pm.*` + industry percentile from VISI construction/mining cohorts |
| FieldOS | Permit task completion vs regional high-risk norms |
| VeriCore | `sms.*` + `training.*` vs industry; permit-protected work |

Preview engines live in `vera-frontend/lib/verisuite-intelligence/`. Production path: Nest VISI module + Prisma + `@vera/hub-industry-safety`.

---

## Related

- `verihub/INDUSTRY-SAFETY-INTELLIGENCE/*` — VISI pack  
- `docs/VERIFORGE-DASHBOARD-SYSTEM.md` — VeriForge dashboards  
- `docs/VERIFORGE-VERIPM-FIELDOS-PERMITS.md` — Permit ↔ FieldOS  
- Package `@vera/hub-industry-safety` — privacy pipeline
