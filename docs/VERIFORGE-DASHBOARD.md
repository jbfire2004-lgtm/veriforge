# VeriForge Forged-Metal Dashboard

Canonical dashboard system: `vera-frontend/src/pages/dashboard/`

Live route: `/veriforge/dashboard` → `VeriForgeDashboard`

## Components

| Component | Role |
|-----------|------|
| `VFKpiCard` | Steel-grey card · red border · metallic header · card lift |
| `VFKpiBar` | Metallic progress · red glow critical · angular track |
| `VFDashboardSection` | Orbitron title · red underline · angularSlide |
| `VFDashboardGrid` | Angular responsive grid · steel dividers |
| `VFDashboardChart` | Steel charts · red lines · bar rise / line draw |
| `VFAlertsPanel` | Critical red glow · warning steel-grey |
| `VeriForgeDashboard` | Full industrial command overview |

## Motion

- Sections: `angularSlide`
- Charts: `metallicFade` + chart bar/line primitives
- Critical KPIs / alerts: `redGlowPulse`
- Cards: hover lift + metallic shadow

## Brand

Black `#0D0D0D` · Steel `#424242` · Red `#C62828` · Orbitron / Exo 2 · no border-radius
