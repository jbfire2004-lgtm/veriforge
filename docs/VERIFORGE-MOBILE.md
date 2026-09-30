# VeriForge Forged-Metal Mobile UI

Canonical mobile system: `vera-frontend/src/mobile/`  
App helper: `vera-frontend/src/app/mobile/`  
Live shell: `/veriforge/mobile/*` via `VeriForgeMobileShell`

## Components

| Component | Role |
|-----------|------|
| `VFMobileNav` | Angular bottom nav · red glow active · steel icons |
| `VFMobileCard` | Angular cards · steel/red · card lift |
| `VFMobilePanel` | Black panels · metallic header · angularSlide |
| `VFMobileInput` | Iron-black · steel border · red focus glow |
| `VFMobileStatus` | pass green pulse · fail redGlowPulse · pending shimmer |
| `VFMobileChart` | Bar rise · line draw · red highlight |
| `VFMobileHeader` | Orbitron title · red underline |
| `VFMobilePage` | angularSlide + metallicFade page transitions |
| `VFMobileModal` | industrialDrop / collapse |
| `VFMobileEmblem` | Forged splash mark |
| `VeriForgeMobileShell` | Full field chrome + RBAC + toasts |

## Motion

- Page transitions: `angularSlide` + `metallicFade`
- Modals: `industrialDrop`
- Active tabs / critical: `redGlowPulse`

## Icons

Bottom nav and status chrome use `veriforge-icons.ts` categories (training, verification, incidents, contractor, emergency).

## Compat

`@/components/veriforge` still exports `MobileAngularCard`, `MobileScreenHeader`, `MobileStatusChip`, `MobileQuickLink`, etc. — backed by the new system.
