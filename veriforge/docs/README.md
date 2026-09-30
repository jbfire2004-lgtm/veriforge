# VeriForge Industrial Documentation System

Complete industrial documentation for the forged-metal VeriForge platform.

**Brand:** Iron black `#0D0D0D` · Steel grey `#424242` · Forge red `#C62828` · Safety white `#FAFAFA`  
**Typography:** Orbitron (headings) · Exo 2 (body)  
**Geometry:** Angular (`border-radius: 0`) · Metallic gradients · Red accent lines

## Live UI

Browse in-app: **`/veriforge/docs`**

Forged-metal docs shell: angular sidebar, steel panels, metallic headers, red active glow.

## Structure

```
veriforge/docs/
  README.md                 ← this file
  getting-started/
  design-system/
  components/
  motion/
  icons/
  architecture/
  systems/
  api/
  deployment/
  glossary/
```

| Section | Path | Description |
|---------|------|-------------|
| Getting Started | [`getting-started/`](./getting-started/) | Install, theme, components, motion setup |
| Design System | [`design-system/`](./design-system/) | Colors, type, geometry, gradients, shadows |
| Components | [`components/`](./components/) | VFButton, VFCard, VFPanel, VFModal, … |
| Motion | [`motion/`](./motion/) | angularSlide, metallicFade, industrialDrop, … |
| Icons | [`icons/`](./icons/) | Angular metallic iconography + a11y |
| Architecture | [`architecture/`](./architecture/) | Enterprise, multi-tenant, routing, layouts |
| Systems | [`systems/`](./systems/) | Training → Command Center engines |
| API | [`api/`](./api/) | REST endpoints, schemas, tenant meta |
| Deployment | [`deployment/`](./deployment/) | Build, env, global playbook |
| Glossary | [`glossary/`](./glossary/) | Forged-metal terms |

## Related packs

| Doc | Purpose |
|-----|---------|
| [`../INTEGRATION-CHECKLIST.md`](../INTEGRATION-CHECKLIST.md) | Activation checklist |
| [`../BUILD-PROMPT.md`](../BUILD-PROMPT.md) | Production build prompt |
| [`../THEME-DEBUG-TOOLKIT.md`](../THEME-DEBUG-TOOLKIT.md) | Visual debug classes |
| [`../QA-SUITE.md`](../QA-SUITE.md) | Industrial QA |
| [`../PERFORMANCE-PACK.md`](../PERFORMANCE-PACK.md) | Performance |
| [`../ACCESSIBILITY-SYSTEM.md`](../ACCESSIBILITY-SYSTEM.md) | WCAG compliance |

## Source of truth (code)

```
vera-frontend/src/theme/veriforge-tokens.ts
vera-frontend/src/styles/global.css
vera-frontend/src/motion/*
vera-frontend/src/icons/veriforge-icons.ts
vera-frontend/src/components/veriforge/*
vera-frontend/src/layouts/*
vera-frontend/src/router/*
backend/src/modules/veriforge-api/*
```
