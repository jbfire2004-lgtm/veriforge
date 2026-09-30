# VeriForge Multi-Site Command Center

Industrial-grade monitoring, coordination, and intelligence using the forged-metal identity.

## Features

- Multi-site monitoring
- Real-time alerts
- Cross-site incident management
- Workforce readiness overview
- Equipment health monitoring
- Compliance status per site
- Risk intelligence per region
- Emergency coordination
- Global KPI dashboards

## Components

| # | Panel | Behavior |
|---|-------|----------|
| 1 | Site Grid | Angular tiles · red glow critical · steel-grey stable |
| 2 | Global Alert Stream | Emergency flash · warning steel-grey · ack |
| 3 | Cross-Site Incidents | Severity indicators · escalate |
| 4 | Workforce Readiness | Per-site readiness bars · red for low |
| 5 | Equipment Health | Overdue glow · nominal steel-grey |
| 6 | Compliance Status | Progress bars · expiry risk alerts |
| 7 | Risk Intelligence | Per-site risk matrix cells |
| 8 | Emergency Coordination | Active emergency panels · muster tracking |
| 9 | Global KPI Dashboard | Charts · focus site sparkline |

## Logic rules

- Every site event includes metadata: `timestamp`, `siteId`, `region`
- Critical events trigger red metallic notifications
- Status syncs dynamically across dashboard and mobile

## Brand

Black panels `#1A1A1A` · Steel-grey `#424242` · Forge red `#C62828` · Angular metallic tiles · Orbitron typography

## Console & API

- UI: `/veriforge/command-center`
- API: `/veriforge/command-center`
- Sync: `veriforge.command-center.analytics`
