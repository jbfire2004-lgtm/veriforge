# Analytics Dashboard

Aggregated contractor KPIs and charts across **Document Center**, **Audit & Evaluation**, **PVS**, **Insurance**, and **QuickCheck**, with role-based views and date-range filters.

Charts use **Chart.js** / `react-chartjs-2` (already in `vera-frontend`).

---

## File structure

```
services/veriforge-saas-service/
  src/services/analytics-dashboard.service.ts   # aggregation layer
  src/routes/analytics.routes.ts                # /analytics

vera-frontend/
  app/api/analytics/[...path]/route.ts
  lib/analytics-dashboard-api.ts
  src/components/analytics-dashboard/
    AnalyticsDashboardView.tsx   # filters + KPI + charts + table
    AnalyticsCharts.tsx          # Chart.js widgets
  app/verihub/analytics/page.tsx           # Contractor view
  app/verihub/analytics/admin/page.tsx     # Platform admin (global)
  app/client/analytics/page.tsx            # Hiring client (connected contractors)
```

---

## Role-based views

| Role | Route | API | Data |
|------|-------|-----|------|
| **Contractor** | `/verihub/analytics` | `GET /analytics/contractor` | Own org KPIs + charts |
| **Client** | `/client/analytics` | `GET /analytics/client` | Approved connected contractors |
| **Admin** | `/verihub/analytics/admin` | `GET /analytics/admin` | Global listed contractors (platform admin) |

Also: `GET /analytics/dashboard?scope=contractor|client|admin`.

---

## API query params

| Param | Description |
|-------|-------------|
| `from` / `to` | ISO8601 date range (default last 30 days) |
| `skip` / `take` | Pagination for contractor table (max 100) |
| `q` | Name search (client/admin) |
| `region` | Region filter (client/admin) |
| `contractorId` | Optional focus filter |

**Response includes**

- `kpis` — avg compliance, doc expiry counts, audit/PVS/QC counters, risk mix  
- `charts` — document expiry series, audit trends, PVS coverage, insurance doughnut, QuickCheck risk, score components, compliance histogram (client/admin)  
- `contractors` — paginated list  
- `weights` — current directory scoring weights  

---

## Integrations

| Source | Metrics |
|--------|---------|
| Contractor Directory | Compliance scores, insurance status, regions |
| Document Center | Expiry buckets, expired/expiring counts |
| Audit & Evaluation | Score trends, open findings / CAs |
| PVS | Verification coverage by category |
| QuickCheck | Risk distribution (green/yellow/red), run counts |

---

## Integration steps

1. Ensure SaaS routes are mounted (`app.use('/analytics', analyticsRouter)`).
2. Restart SaaS API.
3. Contractor: sign in to VeriHub → **Analytics**.
4. Client: sign in to Hiring Client → **Analytics** (approved connections only).
5. Admin: platform admin email / `platform.admin` → **Admin analytics**.

No new migration required (reads existing tables).

---

## UI

- KPI cards, Chart.js bar/line/doughnut charts, date + search filters, paginated contractor table  
- QuickCheck trigger on contractor view  
- Vera nav: VeriHub Analytics / Admin analytics; Hiring Client Analytics  

Shells: `VeriHubConsoleShell`, `HiringClientShell`.
