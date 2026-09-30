# VeriForge Industrial Iconography System

Angular, metallic, industrial-strength icons for the forged-metal identity.

## Style

- Angular geometry (triangles, hexagons, beveled edges)
- Metallic gradients (steel / iron / forged metal)
- Red accent lines (`#C62828`)
- Black base (`#1A1A1A`)
- Steel-grey outlines (`#424242`)
- Bold geometric silhouette
- Heavy industrial lines, thick strokes, angular corners (no rounded edges)

## Usage rules

| Signal | Meaning |
|--------|---------|
| Red | Active, critical, or selected |
| Steel-grey | Neutral |
| White | High contrast on black |

- Monochrome except red accents
- Scale cleanly from **16px → 128px**

## Icon layers

1. Base shape (angular)
2. Metallic gradient fill
3. Steel-grey outline
4. Red accent stroke (active/critical)
5. Industrial shadow

## Categories (34 icons)

| Category | Icons |
|----------|-------|
| Training | Module, Progress, Certification |
| Verification | forgeCheck, forgeStatus, Workflow |
| Compliance | Document, Expiry, Requirement |
| Incidents | Severity, Investigation, Corrective Action |
| Equipment | Inspection, Defect, Certification |
| FieldOps | Task, Hazard, GPS, Check-in |
| Risk | Hazard, Control, Scoring |
| Audit | Log, Evidence, Scoring |
| Culture | Behavior, Engagement, Campaign |
| Emergency | Alert, Evacuation, Muster |
| Contractor | Badge, Onboarding, Access |

## Components

- Shell: `IndustrialIcon` in `components/veriforge/icons.tsx`
- Catalog: `VERIFORGE_ICON_CATALOG` / `VeriForgeIcon`
- Console: `VeriForgeIndustrialIconographySystem`
- Tokens: `veriforgeTokens.iconography` + CSS `.vf-icon*`

## Console & API

- UI: `/veriforge/iconography`
- API: `/veriforge/iconography`
- Sync: `veriforge.iconography.analytics`
