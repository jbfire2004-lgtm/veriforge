# VeriForge Safety Digital Twin System

Industrial-grade real-time modeling, hazard simulation, and predictive intelligence using the forged-metal identity.

## Features

- Real-time site modeling
- Hazard overlays
- Equipment state visualization
- Workforce readiness mapping
- Incident simulation
- Risk forecasting
- Control effectiveness modeling
- Digital twin dashboards

## Components

| # | Layer | Behavior |
|---|-------|----------|
| 1 | Site Model | Angular 3D-style zones · metallic surfaces · red glow critical |
| 2 | Hazard Overlay | Density heatmap · angular hazard icons |
| 3 | Equipment State | Steel-grey normal · red glow defects/overdue |
| 4 | Workforce Readiness | Worker nodes · red for missing training/verification · path lines |
| 5 | Incident Simulation | Origin + metallic propagation · affected zones |
| 6 | Risk Forecasting | Angular risk matrix · predicted high-risk highlights |
| 7 | Control Effectiveness | Effectiveness bars · red for ineffective |
| 8 | Twin Dashboard | KPI cards · event stream · steel-grey charts |

## Logic rules

- Every twin event includes metadata: `timestamp`, `siteId`, `hazardId`
- Critical hazards trigger red metallic notifications
- Status syncs dynamically across dashboard and mobile

## Brand

Black canvas `#1A1A1A` · Steel-grey `#424242` · Forge red `#C62828` · Angular geometry · Metallic gradients · Orbitron typography

## Console & API

- UI: `/veriforge/digital-twin`
- API: `/veriforge/digital-twin`
- Sync: `veriforge.digital-twin.analytics`
