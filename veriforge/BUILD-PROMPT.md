# VeriForge Build Prompt

Deployment-ready UI build instructions for the forged-metal VeriForge identity.

**Use this prompt** when preparing a production build, cleaning legacy UI debt, or instructing an agent to finish wiring the industrial theme end-to-end.

**Brand locks**

| Token | Value |
|-------|-------|
| Iron black | `#0D0D0D` |
| Steel grey | `#424242` |
| Forge red | `#C62828` |
| Safety white | `#FAFAFA` |
| Metallic gradient | `linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)` |
| Geometry | `border-radius: 0` everywhere |
| Headings | Orbitron |
| Body | Exo 2 |

**Canonical paths (monorepo)**

```
vera-frontend/src/theme/veriforge-tokens.ts
vera-frontend/src/styles/global.css
vera-frontend/src/motion/veriforge-motion.ts
vera-frontend/src/motion/veriforge-motion.css
vera-frontend/src/icons/veriforge-icons.ts
vera-frontend/src/layouts/*
vera-frontend/src/components/veriforge/*
vera-frontend/src/router/*
vera-frontend/src/pages/dashboard/*
vera-frontend/src/mobile/*
veriforge/INTEGRATION-CHECKLIST.md
```

---

## 1. CLEAN BUILD

Remove or neutralize legacy UI that fights the forged-metal system.

### Remove / quarantine

| Target | Action |
|--------|--------|
| Old theme files conflicting with iron-black | Prefer `src/theme/veriforge-tokens.ts` + `src/styles/global.css`; do not reintroduce Inter/cream/purple themes on VeriForge routes |
| Unused VeriForge components | Delete dead exports only after confirming zero imports; keep engine surfaces (`training-engine`, etc.) |
| Legacy CSS on VeriForge pages | Strip page-local rounded utilities (`rounded-*`, `rounded-full`, `rounded-md`) from `/veriforge/**` |
| Soft UI shadows | Replace with `metallicShadow` / `steelShadow` tokens |
| Duplicate nav shells | VeriForge main uses `VFAppShell` only — no sidebars for module switching outside `VFSidebar` |

### Geometry purge (VeriForge surfaces)

```bash
# From vera-frontend — find rounded classes still used under VeriForge
rg "rounded-(sm|md|lg|xl|2xl|3xl|full)" app/veriforge components/veriforge src/components/veriforge src/layouts src/mobile src/pages/dashboard
```

Replace matches with angular equivalents (`rounded-none` or remove class). Global CSS already forces `border-radius: 0 !important` — still remove source classes to avoid conflict noise.

### CSS conflict watchlist

- `app/vera-tokens.css` — Vera product tokens may still load; VeriForge routes must win via `.veriforge-theme` + `src/styles/global.css`
- Tailwind `@theme` radius vars — do not map VeriForge UI to `--radius-md`
- Legacy `components/veriforge/button.tsx` / `cards.tsx` — migrate call sites to `VF*` primitives when touching files

**Done when:** No intentional rounded geometry remains in VeriForge source; forged-metal CSS is the last word on VeriForge pages.

---

## 2. INSTALLATION

Wire tokens, global styles, shell, and icons at the root.

### Theme provider / tokens

```ts
// Prefer canonical tokens
import {
  veriforgeTokens,
  COLORS,
  GEOMETRY,
  TYPOGRAPHY,
  SHADOWS,
  BORDERS,
  veriforgeCssVars,
} from "@/src/theme/veriforge-tokens";
```

- Facade for product engines: `components/veriforge/tokens.ts` (re-exports + motion/iconography extensions)
- CSS vars: `components/veriforge/tokens.css` imported from `app/globals.css`

### Root layout + global CSS

1. `app/layout.tsx` must load Orbitron + Exo 2 (`--font-orbitron`, `--font-exo-2`)
2. `app/layout.tsx` imports `./globals.css`
3. `app/globals.css` must include:

```css
@import "../components/veriforge/tokens.css";
@import "../src/styles/global.css";
@import "../src/motion/veriforge-motion.css";
```

4. VeriForge route root: `app/veriforge/layout.tsx` applies `veriforge-theme` + iron-black background

### Routing shell

```ts
// Main authenticated VeriForge surface
// app/veriforge/(main)/layout.tsx → VeriForgeAppShell → VFAppShell
import { VeriForgeAppShell } from "@/components/veriforge";
```

- Route registry: `@/src/router` (`VERIFORGE_ROUTES`, `VFRouteProvider`, `VFRouteTransition`)
- Lightweight helper: `@/src/app/routes` (`VeriForgeRouteRoot`)

### Icons (global)

```ts
import {
  VERIFORGE_ICONS,
  TrainingIcon,
  VerificationIcon,
  // …
} from "@/src/icons/veriforge-icons";

// Or via VF wrapper
import { VFIcon } from "@/src/components/veriforge";
```

Ensure `components/veriforge/icons.tsx` resolves legacy catalog IDs to `VERIFORGE_ICONS`.

**Done when:** Tokens, global CSS, motion CSS, fonts, `VFAppShell`, and icons are reachable from every VeriForge page without ad-hoc copies.

---

## 3. COMPONENT WIRING

Replace legacy UI primitives with forged-metal `VF*` components.

| Legacy / ad-hoc | Replace with | Import |
|-----------------|--------------|--------|
| `<button>`, `VeriForgeButton` (when migrating) | `VFButton` | `@/src/components/veriforge` |
| Card divs / `VeriForgeCard` | `VFCard` | same |
| Panel frames | `VFPanel` | same |
| Dialogs / `VeriForgeModal` | `VFModal` | same |
| Alert banners / `VeriForgeAlert` | `VFAlert` | same |
| Inputs | `VFInput` | same |
| Progress | `VFProgressBar` | same |
| Tables | `VFTable` | same |
| Toasts | `VFToast` + `useVFToasts` | same |

### Rules for every replacement

1. Import tokens from `veriforge-tokens.ts` (or CSS vars) — no hard-coded off-brand hex except token values
2. Angular geometry only — no `rounded-*`
3. Metallic gradient surfaces for panels/cards
4. Active / critical / focus → red glow (`SHADOWS.metallicShadow` or `redGlowPulse`)
5. Hover → steel-grey highlight (`#424242`)

### Example

```tsx
import { VFButton, VFCard, VFPanel, VFModal, VFAlert } from "@/src/components/veriforge";

<VFCard title="Forge Status" active={critical}>
  <VFAlert tone="critical" title="Breach" message="Thermal threshold exceeded." />
  <VFButton onClick={onAck}>Acknowledge</VFButton>
</VFCard>
```

**Done when:** New VeriForge UI work uses `VF*` only; remaining `VeriForge*` engine wrappers still compose forged-metal tokens/CSS.

---

## 4. MOTION WIRING

Install industrial motion on navigation and critical chrome.

| Interaction | Primitive | Class / API |
|-------------|-----------|-------------|
| Route / page change | `angularSlide` | `VFRouteTransition`, `VFMobilePage`, `veriforgeMotionClasses.primitives.angularSlide` |
| Content load | `metallicFade` | shell + transition wrappers |
| Modals | `industrialDrop` / collapse | `VFModal`, `VFMobileModal` |
| Critical states | `redGlowPulse` | critical routes, KPI cards, alerts, active mobile tabs |
| Sidebar open | `industrialDrop` | `VFSidebar` `motionState="open"` |
| Header menu | `bevelShift` | header nav chrome |

```ts
import {
  veriforgeMotion,
  veriforgeMotionClasses,
  VERIFORGE_MOTION_TIMING,
} from "@/src/motion/veriforge-motion";
```

### Timing locks

- fast: `120ms`
- medium: `240ms`
- heavy: `400ms`

Respect `prefers-reduced-motion` (already handled in motion CSS).

**Done when:** Route changes slide angularly; modals drop; critical pages pulse red; reduced-motion users see no animation thrash.

---

## 5. LAYOUT WIRING

Wrap VeriForge pages in the angular industrial shell.

```tsx
import {
  VFAppShell,
  VFHeader,
  VFSidebar,
  VFContent,
  VFFooter,
} from "@/src/layouts";
```

| Slot | Component | Requirements |
|------|-----------|--------------|
| Shell | `VFAppShell` | Iron-black + metallic gradient; includes route provider + transitions |
| Header | `VFHeader` | Orbitron title · red accent line · steel nav |
| Sidebar | `VFSidebar` | Steel-grey · red active rail · icons from `veriforge-icons` |
| Content | `VFContent` | Black canvas · angular · optional section heading |
| Footer | `VFFooter` | Metallic · red top accent · mobile nav strip |

### Wiring map

1. `app/veriforge/(main)/layout.tsx` → `VeriForgeAppShell` (RBAC + notifications) → `VFAppShell`
2. Nav items from `VERIFORGE_ROUTES` (`@/src/router`)
3. `app/veriforge/(mobile)/layout.tsx` → `VeriForgeMobileShell` (`@/src/mobile`)
4. Do **not** introduce Vera unified sidebars or horizontal module tab bars on VeriForge (product uses its own shell)

**Done when:** Every main VeriForge page renders inside `VFAppShell`; mobile field pages use `VeriForgeMobileShell`.

---

## 6. BUILD VALIDATION

Run before production build.

### Geometry

```bash
rg "rounded-(sm|md|lg|xl|2xl|3xl|full)" app/veriforge src/layouts src/mobile src/pages/dashboard src/components/veriforge
```

Expect: no matches (or only intentional `rounded-none`).

### Color / token audit

Confirm VeriForge UI uses:

- `#0D0D0D` / `COLORS.ironBlack` / `--vf-color-iron-black`
- `#424242` / `COLORS.steelGrey`
- `#C62828` / `COLORS.forgeRed`
- `#FAFAFA` / `COLORS.safetyWhite`

Reject: purple gradients, cream `#F4F1EA`, Inter/Roboto as primary VeriForge type.

### Metallic gradients

- Body / shell background shows 135° metal wash
- Card/panel headers use metallic gradient
- Buttons use bevel / forge fills

### Red accents

- Active nav underline / inset rail
- Focus rings on inputs
- Critical KPI / alert glow
- Heading underlines (`2px solid #C62828`)

### Motion

- Navigate between `/veriforge/dashboard` → `/veriforge/incidents` (critical pulse)
- Open/close a `VFModal` (drop / collapse)
- Mobile tab switch (active red glow)

### Checklist cross-link

Complete `veriforge/INTEGRATION-CHECKLIST.md` sections 1–8 before shipping UI.

**Done when:** Visual + grep audits pass; critical motion triggers; no off-brand colors on VeriForge routes.

---

## 7. PRODUCTION BUILD

From `vera-frontend`:

```bash
# Type safety
npm run typecheck

# Lint
npm run lint

# Production compile
npm run build
```

### Build gates

| Gate | Pass criteria |
|------|----------------|
| No CSS conflicts | Forged-metal globals win on `.veriforge-theme`; no broken `@import` order |
| No unused critical classes | CSS modules for `VF*` compile; no missing `.module.css` typings |
| No missing imports | `tsc --noEmit` clean for theme/motion/icons/layouts/router/mobile/dashboard |
| No hydration mismatches | No `window`/`localStorage` reads during SSR without guards; fonts via `next/font` |
| Motion CSS present | `veriforge-motion.css` in production CSS bundle |
| Route registry | `VERIFORGE_ROUTES` drives main nav without undefined permissions |

### Hydration notes

- Analytics sync hooks (`use*AnalyticsSync`) must guard `localStorage` with `typeof window`
- Modals using `useEffectEvent` require React 19 (already in package)
- Do not render different nav trees on server vs client for the same role without a client boundary

### Optional agent command block

```text
Produce a deployment-ready VeriForge UI build:
1) Clean rounded/legacy theme conflicts under /veriforge
2) Confirm tokens, global.css, motion.css, VFAppShell, icons are installed
3) Wire VF* components and motion primitives per veriforge/BUILD-PROMPT.md
4) Run typecheck, lint, and next build
5) Report any remaining rounded classes, missing imports, or hydration risks
```

**Done when:** `npm run typecheck`, `npm run lint`, and `npm run build` succeed with forged-metal UI intact.

---

## Quick reference — import map

```ts
// Tokens
import { veriforgeTokens, COLORS } from "@/src/theme/veriforge-tokens";

// Components
import {
  VFButton, VFCard, VFPanel, VFInput, VFModal, VFAlert,
} from "@/src/components/veriforge";

// Motion
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";

// Icons
import { VERIFORGE_ICONS, IncidentsIcon } from "@/src/icons/veriforge-icons";

// Layout
import { VFAppShell, VFHeader, VFSidebar, VFContent, VFFooter } from "@/src/layouts";

// Routing
import {
  VERIFORGE_ROUTES, VFRouteTransition, useVFRoute,
} from "@/src/router";

// Dashboard
import { VeriForgeDashboard } from "@/src/pages/dashboard";

// Mobile
import { VeriForgeMobileShell, VFMobileNav } from "@/src/mobile";
```

---

## Final goal

Produce a **deployment-ready** VeriForge UI where the forged-metal identity compiles cleanly and consistently: angular geometry, metallic gradients, red accents, industrial motion, `VFAppShell` routing, dashboard, and mobile — with a green production build and no legacy theme conflicts.
