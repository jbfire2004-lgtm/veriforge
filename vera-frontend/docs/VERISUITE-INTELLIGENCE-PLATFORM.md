# VeriSuite Intelligence Platform

**Version:** 2.0.0  
**Modules:** VeriHub · VeriPM · FieldOS · VeriCore  
**Industries:** Mining · Construction · Utilities · Manufacturing  

AI-powered industrial intelligence for safety performance. Unifies ingestion, anonymization, dual-plane analytics, regional drilldown, Action Management, smart AI, and module dashboards under one dark industrial design language.

> **Terminology (mandatory):** Do not use “CAPA” in VeriSuite Intelligence surfaces. Use **Corrective Actions**, **Preventive Actions**, and **Action Management**.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SELECTOR SYSTEM                                   │
│  Industry · Entity Type · Subtype · Scale · Region (Global→Site)         │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│                    AI INDUSTRY INGESTION ENGINE                           │
│  Search → LLM/Vision/Scrape → Normalize → Anonymize → Daily benchmarks   │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│              ANONYMIZATION + NORMALIZATION ENGINE                         │
│  Tokenize IDs · Strip PII · /200k · Severity · Categories · Blind agg    │
└───────────────────────────────┬──────────────────────────────────────────┘
        ┌───────────────────────┼───────────────────────┬──────────────────┐
        ▼                       ▼                       ▼                  ▼
┌───────────────┐     ┌─────────────────┐     ┌────────────────┐  ┌────────────────┐
│ REGIONAL      │     │ DUAL-SCALE      │     │ SMART AI       │  │ ACTION MGMT    │
│ DRILLDOWN     │     │ PROJECT|COMPANY │     │ Anomaly·Trend  │  │ CA · PA · Aging│
│ Global→Site   │     │ (opt-in mix)    │     │ Forecast·Narr. │  │ Effectiveness  │
└───────┬───────┘     └────────┬────────┘     └───────┬────────┘  └───────┬────────┘
        └──────────────────────┼───────────────────────┴──────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  MODULE DASHBOARDS — VeriHub · VeriPM · FieldOS · VeriCore               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Live routes

| Surface | Path | API |
|---------|------|-----|
| Platform hub | `/hub/verisuite-platform` | — |
| Industry Intelligence | `/hub/industry-intelligence` | `/api/v1/industry-intelligence` |
| AI Aggregation | `/hub/verisuite-aggregation` | `/api/v1/verisuite-aggregation` |
| Regional Drilldown | `/hub/regional-drilldown` | `/api/v1/regional-drilldown` |
| Dual-scale | `/hub/dual-scale-dashboards` | `/api/v1/dual-scale-dashboards` |
| **Action Management** | `/pm/action-management` | `/api/v1/corrective-action-management` |
| Anon & Norm | `/hub/anonymization-normalization` | `/api/v1/anonymization-normalization` |
| Selector System | `/hub/selector-system` | `/api/v1/selector-system` |
| Smart Dashboard | `/hub/smart-dashboard` | `/api/v1/smart-dashboard` |
| VeriPM Project Safety | `/pm/project-safety` | `/api/v1/veripm-project-safety` |
| FieldOS Operations | `/field/operations` | `/api/v1/fieldos-operations` |
| VeriCore Training | `/core/training-competency` | `/api/v1/vericore-training-competency` |

---

## 2. Design language

| Token | Hex | Role |
|-------|-----|------|
| `--vs-navy` | `#0D1B2A` | Page canvas |
| `--vs-slate` | `#1B263B` | Panels |
| `--vs-blue` | `#00A3FF` | Primary accent |
| `--vs-orange` | `#FF7A00` | Caution / Preventive |
| `--vs-emerald` | `#00C98D` | Positive trends |
| `--vs-white` | `#F5F7FA` | Primary text |
| `--vs-muted` | `#8B9BB4` | Secondary text |
| `--vs-critical` | `#FF4D6A` | Critical only |

**Visuals:** high-contrast KPI tiles, animated trend lines with anomaly markers, geographic drilldown, heatmaps, radial gauges, bubble risk charts, Action aging histograms, root-cause → action flow (Sankey-style).

Hierarchy on every dashboard: **Controls → KPI → Trend → Detail → Narrative**.

---

## 3. Component library

| Component | Purpose |
|-----------|---------|
| `KpiTile` | Value + Δ + sparkline + tone |
| `TrendPanel` | Series + forecast + anomaly markers |
| `AiInsightPanel` | Narratives with confidence |
| `InsightStrip` | First-viewport key insights (one-click deep links) |
| `RegionalMapPanel` | Global→Site breadcrumb drilldown |
| `ComparisonPanel` | Project/company/industry/region deltas + bars |
| `SeverityBars` | Stacked severity / aging share |
| `ActionAgingHistogram` | Corrective vs Preventive aging bins |
| `RootCauseActionFlow` | Root cause → Action Management linkage |
| `LeadingHeatmap` / `CompetencyHeatmap` | Matrix heatmaps |
| `RiskGauge` | Radial risk / training score |
| `InspectionTrendCard` | Inspection completion + AI flags |
| `VsDashboardShell` / `VsSection` | Dark industrial shell + band hierarchy |

---

## 4. KPI dictionary

All count rates: **(count / hours) × 200,000**. Min sample **n ≥ 5**.

| KPI | Formula | Plane |
|-----|---------|-------|
| TRIF | recordables / hours × 200k | both |
| LTIF | lost-time / hours × 200k | both |
| Near-miss rate | near-misses / hours × 200k | both |
| Severity index | weighted severity 0–10 | both |
| HECA mix | standardized energy category % | both |
| Leading maturity | 0–100 control scores | both |
| Observation / toolbox / inspection / training | leading rates or % | project / field / core |
| **Action aging** | days open by bucket + /200k | project / company |
| **Action effectiveness** | post-close review score 0–100 | both |
| **On-time closure %** | closed ≤30d / closed | both |
| Training completion % | completed / assigned × 100 | company / core |
| Competency % | current / required × 100 | company / core |
| Risk score | composite 0–100 | all |

---

## 5. Action Management (replaces CAPA)

**Program name:** Action Management  
**Action types:**
- **Corrective Actions** — incident / finding / near-miss driven
- **Preventive Actions** — risk assessment / HECA / trend driven

**Capabilities:**
- Action aging (days open) with histogram bins `0-7d` … `90d+`
- Effectiveness scoring after close-out review
- Close-out workflow: assigned → implemented → verified → effectiveness_reviewed → closed
- Root cause → action linkage (tokenized)
- Project-scale and company-scale dashboards (planes never mixed without opt-in)
- Project vs company and project vs industry comparison panels

**Code:** `lib/corrective-action-management/` · UI `/pm/action-management` · API `/api/v1/corrective-action-management`

---

## 6. Engines

### AI Industry Ingestion
`lib/verisuite-aggregation-engine/`  
Continuous search of mining/construction/manufacturing/utilities safety sources → extract HECA/TRIF/LTIF/severity/leading → normalize → tokenize/anonymize → daily benchmarks → narratives.

### Regional Drilldown
`lib/regional-drilldown-engine/`  
**Global → Continent → Country → Province/State → Region → City → Site.**  
Filter by region; normalize by band; compare regions-within-industry and industries-within-region. Site excluded from industry pools.

### Dual-scale
`lib/dual-scale-dashboards/`  
Isolated project / company planes. Cross-plane only with `crossPlaneOptIn`.

### Anonymization + Normalization
Tokenize IDs; strip PII; /200k; severity; categories; blind agg; n≥5.

### Selector System
Industry → Entity → Subtype → Scale → Region with contamination guards.

### Smart Dashboard AI
Trend detection · anomaly (z-score) · risk forecast (30d/90d/12m) · correlation · narrative generation.

### Aggregate cache
Server TTL (`aggregate-cache`) + client `useCachedAggregate` with stale-while-revalidate.

---

## 7. Module dashboards

### VeriHub — Industry Intelligence
Industry HECA, TRIF, LTIF trends; leading maturity benchmarks; regional heatmaps; mining/construction/manufacturing(/utilities) comparisons; company vs industry and project vs industry benchmarking; AI narratives; predictive risk (3–6 month); AI ingestion engine.

### VeriPM — Project Safety
Leading (inspections, toolbox, training); lagging (incidents, near-misses); /200k trends; focus audits; intelligent inspections; **Action Management** integration; risk profile; project vs industry; regional drilldown link.

### FieldOS — Field Operations
Inspection trends; hazard patterns; near-miss analytics; equipment alerts; competency signals; regional risk heatmaps; AI anomalies.

### VeriCore — Training & Competency
Completion trends; gaps by team/region; certification expiry 30/60/90; skill distribution; competency↔incident correlation; workforce risk; gauges + heatmaps + AI narrative.

---

## 8. Data model (canonical)

```
RawExternalRecord
  → stripIdentifiers()
  → tokenizeCompanyId / tokenizeProjectId / tokenizeAction
  → ratePer200k + normalizeSeverityIndex + standardizeCategories
  → NormalizedFact { token, plane, industryBand, regionBand, period, metrics… }

ManagedAction {
  actionToken, kind: corrective|preventive, status, closeOutStage,
  ageDays, effectivenessScore, rootCauses[], plane, entityToken…
}

BlindAggregate(key) → suppressed | published cohort metrics
CamDashboard { project, company, industryBenchmark, narratives }
SmartDashboard → anomalies[], trends[], narratives[], forecasts[], correlations[]
```

### Dual-plane rule

```
if !crossPlaneOptIn:
  facts = facts.filter(plane == selectedPlane)
if uniqueTokens(facts) < 5:
  suppress(metrics)
```

---

## 9. Ingestion workflow

1. Continuous search (dashboards, incident DBs, regs, KPIs)  
2. Multi-modal extract (scrape → vision → LLM)  
3. Anonymize + normalize  
4. Store facts by plane/industry/region/period  
5. Daily benchmark refresh  
6. Smart AI pass + Action Management recompute  
7. Module dashboards invalidate cached aggregates on revision bump  

---

## 10. Packages

- Tokens / cache / hooks: `vera-frontend/lib/verisuite-intelligence-ui/`
- Components: `vera-frontend/components/verisuite-intelligence-ui/`
- Action Management: `vera-frontend/lib/corrective-action-management/`
- Platform showcase: `/hub/verisuite-platform`
