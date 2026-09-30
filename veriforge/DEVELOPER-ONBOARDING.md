# VeriForge Developer Onboarding Kit

Complete onboarding kit that teaches developers how to build using the **forged-metal VeriForge identity**.

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

**Docs UI:** `/veriforge/docs` · **Source docs:** `veriforge/docs/`

---

## 1. Welcome to VeriForge

VeriForge is the industrial safety platform inside the Vera monorepo. Its UI is not a soft SaaS skin — it is a **forged-metal control surface**: iron black plates, steel edges, metallic washes, and forge-red critical accents.

### Overview of forged-metal identity

| Layer | Meaning |
|-------|---------|
| Iron black | Structure, depth, industrial night |
| Steel grey | Neutral chrome — borders, idle states, hover frames |
| Forge red | Active, focus, critical — used intentionally |
| Safety white | Readable text/icons on dark (WCAG AAA on iron black) |
| Metallic gradient | Shell wash, KPI headers, modal chrome |

**Canonical tokens:** `vera-frontend/src/theme/veriforge-tokens.ts`

### Angular geometry philosophy

- Every surface is **square** (`GEOMETRY.angularRadius = 0px`)
- Bevels and hard edges replace soft radius
- Rounded corners are **bugs**, not style choices
- Debug with `vf-debug-angular` / `npm run vf:debug:angular`

### Industrial motion principles

| Principle | Practice |
|-----------|----------|
| Hard settle | Angular easing, not soft Material bounce |
| Compositor-first | Prefer `transform` + `opacity` |
| Timed weights | Fast **120ms** · medium **240ms** · heavy **400ms** |
| Critical only | `redGlowPulse` on critical routes/states |
| Inclusive | Honor `prefers-reduced-motion` (instant / static accent) |

### Red accent system

Use forge red for:

- Active nav underline / border
- Focus rings (`:focus-visible`)
- Critical alerts and critical routes
- Primary CTA emphasis when intentional

Do **not** use forge red for:

- Body text on iron black (contrast 3.46:1 — accent/large only)
- Neutral chrome (use steel grey)
- Sole carrier of meaning (always pair with text / `aria-*`)

See `veriforge/ACCESSIBILITY-SYSTEM.md`.

---

## 2. Setup Instructions

### Prerequisites

- Node.js 20+
- npm
- Monorepo root containing `vera-frontend/` and `backend/`

### Install dependencies

```bash
# Frontend
cd vera-frontend
npm install

# Backend (VeriForge API)
cd ../backend
npm install
```

Run:

```bash
# Terminal A
cd backend && npm run start:dev

# Terminal B
cd vera-frontend && npm run dev
```

Open `/veriforge/dashboard` and `/veriforge/docs`.

### Import `veriforge-tokens.ts`

```ts
import {
  COLORS,
  GEOMETRY,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDERS,
  veriforgeCssVars,
} from "@/src/theme/veriforge-tokens";
// or
import { COLORS } from "@/src/theme";
```

### Import `global.css`

Already wired in `app/globals.css`:

```css
@import "../src/styles/global.css";
@import "../src/motion/veriforge-motion.css";
@import "../src/theme/veriforge-debug.css"; /* inert until vf-debug* */
```

Do not invent a parallel global theme for VeriForge pages.

### Import `VFAppShell`

```tsx
import { VFAppShell } from "@/src/layouts";
// Production pages typically use the RBAC wrapper:
import { VeriForgeAppShell } from "@/components/veriforge";
```

Main layout (`app/veriforge/(main)/layout.tsx`) already wraps routes in `VeriForgeAppShell` with nav from `VERIFORGE_ROUTES`.

**Forbidden on VeriForge pages:** Vera `WorkspaceShell` / `GlobalNav` / module sidebars for Vera nav.

### Import component library

```ts
import {
  VFButton,
  VFCard,
  VFPanel,
  VFModal,
  VFInput,
  VFAlert,
  VFTable,
  VFProgressBar,
  VFStatusIndicator,
} from "@/src/components/veriforge";
```

### Import motion system

```ts
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
// CSS already global via veriforge-motion.css
```

```tsx
<div className={veriforgeMotionClasses.primitives.angularSlide}>
  <div className={veriforgeMotionClasses.primitives.metallicFade}>…</div>
</div>
```

### Import iconography system

```ts
import {
  TrainingIcon,
  IncidentsIcon,
  VeriForgeCategoryIcon,
} from "@/src/icons/veriforge-icons";
// Prefer named imports (tree-shakeable)
```

```tsx
<TrainingIcon size={24} tone="neutral" title="Training" />
<IncidentsIcon tone="critical" title="Incidents" />
```

### Quick smoke checklist

- [ ] `/veriforge/dashboard` loads under forged-metal shell
- [ ] No rounded corners
- [ ] Orbitron headings + Exo 2 body
- [ ] Active nav shows forge red
- [ ] Docs at `/veriforge/docs`

---

## 3. Architecture Overview

### Enterprise architecture

| Layer | Responsibility |
|-------|----------------|
| Presentation | Angular web + mobile UI |
| Application | Training, Verification, Compliance, Incident, Risk, … |
| API | REST + `{ status, data, meta }` |
| Data / storage | Tenant isolation, buckets |
| Security | JWT + `tenantId` |
| Infra / observability | Scale + logs with tenant/user/time |

Rules: **stateless** services · **tenant-aware** workflows · forged-metal UI everywhere.

Deep dive: `veriforge/docs/architecture/` · `docs/VERIFORGE-ENTERPRISE-ARCHITECTURE.md`

### Multi-tenant SaaS model

- JWT `tenantId` must match route/header
- API `meta` includes `tenantId`, `userId`, `timestamp`
- UI: `/veriforge/tenant/...`
- See `docs/VERIFORGE-MULTI-TENANT-SAAS.md`

### Routing system

**Registry:** `vera-frontend/src/router/veriforge-routes.ts`

| Concern | Implementation |
|---------|----------------|
| Metadata | `path`, `title`, `section`, `icon`, `critical`, `permission` |
| Shell | `(main)/layout.tsx` → `VeriForgeAppShell` |
| Transitions | `VFRouteTransition` — angularSlide + metallicFade |
| Critical | compliance, incidents, risk, emergency, command-center, predictive → `redGlowPulse` |
| Mobile | `(mobile)` layout — bottom nav shell |
| Docs | `(docs)` layout — docs shell at `/veriforge/docs` |

### Layout system

| Piece | Path |
|-------|------|
| `VFAppShell` | `src/layouts/VFAppShell.tsx` |
| `VFHeader` / `VFSidebar` / `VFContent` / `VFFooter` | `src/layouts/` |
| Mobile | `src/mobile/` |
| Dashboard | `src/pages/dashboard/` |

### Component system

`src/components/veriforge/` — CSS modules + tokens + motion classes. Barrel: `index.ts`.

### Motion system

`src/motion/veriforge-motion.ts` + `veriforge-motion.css` — primitives, timing, class map.

---

## 4. Coding Standards

Non-negotiable for all VeriForge UI work:

| Rule | Do | Don't |
|------|----|-------|
| Angular geometry only | `border-radius: 0` / `GEOMETRY.angularRadius` | `rounded-*`, soft pills |
| Metallic gradients required | `var(--vf-effect-metallic-gradient)` / `COLORS.metallicGradient` on shells/headers | Flat grey shells with no metal |
| Red accents for active | Active nav, focus, critical, intentional CTAs | Red body text; red everywhere |
| Steel-grey for neutral | Borders, idle inputs, hover chrome | Steel as body text on iron black |
| Typography | Orbitron headings, Exo 2 body | Inter / system UI as primary |
| No rounded corners anywhere | Fail CI/local with `vf:debug:angular` | “Just this card” exceptions |

### A11y minimums (while coding)

- Body text = `safetyWhite` on dark
- Meaning ≠ color alone
- `prefers-reduced-motion` respected
- Interactive cards/buttons keyboard operable
- Icons: `title` / `aria-label` or `aria-hidden`

### Import hygiene

- Prefer `@/src/components/veriforge` and `@/src/theme/...`
- Prefer named icon imports
- Lazy-load charts / heavy engines (`PERFORMANCE-PACK.md`)

### Static gates

```bash
cd vera-frontend
npm run vf:debug:rounded
npm run vf:debug:angular
npm run vf:debug:metal
npm run vf:debug:red
npm run typecheck
npm run lint
```

---

## 5. Component Usage

Library: `vera-frontend/src/components/veriforge/`  
Full reference: `veriforge/docs/components/`

### VFButton

```tsx
<VFButton variant="primary" size="md">Commit</VFButton>
<VFButton active>Active</VFButton>
<VFButton variant="destructive">Escalate</VFButton>
<VFButton disabled>Disabled</VFButton>
```

Variants: `primary` | `secondary` | `destructive` | `ghost`  
Keyboard: Enter + Space · Focus: red outline

### VFCard

```tsx
<VFCard>
  <h3>KPI</h3>
  <p>Angular card with steel border</p>
</VFCard>
```

Hover lift / metallic shadow; critical → red accent border.

### VFPanel

```tsx
<VFPanel title="Operations">…</VFPanel>
```

Section chrome; pair with angularSlide / metallicFade on mount. Collapsible → `aria-expanded`.

### VFModal

```tsx
<VFModal open={open} onClose={() => setOpen(false)} title="Confirm">
  <VFButton onClick={onConfirm}>Confirm</VFButton>
</VFModal>
```

Escape closes · focus trap · `industrialDrop` open · angular collapse close.

### VFInput

```tsx
<VFInput label="Badge ID" name="badge" />
```

Idle steel border · focus red glow · wire `aria-invalid` + error text.

### VFAlert

```tsx
<VFAlert tone="critical">Critical: threshold exceeded</VFAlert>
```

Include severity in text. `role="alert"` for critical.

### VFTable

```tsx
<VFTable columns={columns} data={rows} />
```

Angular grid; selected/critical rows may use red accent — keep actions keyboard reachable.

### VFProgressBar

```tsx
<VFProgressBar value={72} label="Training completion" />
```

Exposes `role="progressbar"` + valuemin/now/max.

### VFStatusIndicator

```tsx
<VFStatusIndicator status="critical" label="Critical" />
```

Always provide a **text** label — never color-only status.

---

## 6. Motion Usage

Source: `src/motion/veriforge-motion.ts`

| Primitive | When | Class |
|-----------|------|-------|
| `angularSlide` | Major route / panel transitions | `vf-m-angular-slide` |
| `metallicFade` | Content load | `vf-m-metallic-fade` |
| `industrialDrop` | Modal open only | `vf-m-industrial-drop` |
| `redGlowPulse` | Critical states / routes only | `vf-m-red-glow-pulse` |
| `bevelShift` | Sidebar hover/focus | `vf-m-bevel-shift` |

### Patterns

```tsx
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";

// Route / major transition
<section className={veriforgeMotionClasses.primitives.angularSlide}>
  <div className={veriforgeMotionClasses.primitives.metallicFade}>
    {children}
  </div>
</section>

// Critical
<div className={veriforgeMotionClasses.primitives.redGlowPulse} data-vf-critical="true">
  …
</div>
```

### Critical routes (must pulse)

```
/veriforge/compliance
/veriforge/incidents
/veriforge/risk
/veriforge/emergency
/veriforge/command-center
/veriforge/predictive
```

### Reduced motion

Under `prefers-reduced-motion: reduce`: no slide/fade/pulse animations — instant layout + static red accent. Do not fight the global CSS in `veriforge-motion.css`.

---

## 7. Workflow Integration

Build engine UIs under `VFAppShell`, using VF components + route metadata. API lives in `backend/src/modules/veriforge-api`.

| Workflow | UI route | API prefix | Notes |
|----------|----------|------------|-------|
| Training | `/veriforge/training` | `/veriforge/training` | Modules, assign, progress |
| Verification | `/veriforge/verification` | `/veriforge/verification` | Checks / forge status |
| Compliance | `/veriforge/compliance` | `/veriforge/compliance` | **Critical** UI treatment |
| Incident | `/veriforge/incidents` | `/veriforge/incidents` | Capture → investigate → close; **critical** |
| Risk | `/veriforge/risk` | `/veriforge/risk` | Scoring / zones; **critical** |
| Audit | `/veriforge/audit` | `/veriforge/audit` | Trails / reviews; steel chrome |

### Integration checklist for a new workflow page

1. Add or reuse route in `veriforge-routes.ts` (`critical`, `icon`, `permission`)
2. Page under `app/veriforge/(main)/…` (shell provided by layout)
3. Compose with `VFPanel` / `VFCard` / `VFTable` / `VFButton`
4. Wire API client to `{ status, data, meta }` envelope (`tenantId` in meta)
5. Critical engines: red accent + optional `redGlowPulse`
6. Pass `QA-SUITE.md` §7 for that engine

More engines (FieldOps, Equipment, Culture, Predictive, Digital Twin, Command Center): `veriforge/docs/systems/`.

---

## 8. Debugging Tools

### Theme Debug Toolkit

**Doc:** `veriforge/THEME-DEBUG-TOOLKIT.md`  
**CSS:** `src/theme/veriforge-debug.css` (imported globally; inert until flagged)

```js
document.documentElement.classList.add("vf-debug");
// or layer flags: vf-debug-color | vf-debug-angular | vf-debug-motion | …
```

| Layer | Flag / class | What you see |
|-------|--------------|--------------|
| Color | `vf-debug-color` / `.debug-color-outline` | Red/grey/black/white token outlines |
| Geometry | `vf-debug-angular` / `.debug-angular` | Rounded corners = error hatch |
| Motion | `vf-debug-motion` / `.debug-motion` | Blue/grey/yellow/red primitive outlines |
| Components | `vf-debug-component` | VFButton/Card/Panel/Modal borders |
| Layout | `vf-debug-layout` / `.debug-layout-grid` | Steel grid; red if misaligned |
| Route | `vf-debug-route` | Transition / critical markers |
| Mobile | `vf-debug-mobile` / `.debug-mobile-hitbox` | Tap zones (red = too small) |

**Never ship with `vf-debug*` enabled.**

### Layout Grid Debugger

```tsx
<main className="debug-layout-grid">…</main>
<main className="debug-layout-grid" data-vf-misaligned="true">…</main>
```

Steel-grey 16px grid; red grid = misaligned geometry.

### Motion Debugger

Enable `vf-debug-motion`. Confirm:

- Route change → blue (`angularSlide`) + grey (`metallicFade`)
- Modal open → yellow (`industrialDrop`)
- Critical → red (`redGlowPulse`)

### Icon Debugger

- Prefer visual pass with `vf-debug-component` on nav
- Ensure informative icons have `title` / `aria-label`
- Decorative icons `aria-hidden`
- Category set: `VERIFORGE_ICON_SET` in `veriforge-icons.ts`
- API catalog (optional): `/veriforge/iconography`

### Auto-fix scripts

```bash
cd vera-frontend
npm run vf:debug:all
# Apply:
node scripts/veriforge/remove-rounded-corners.mjs --write
node scripts/veriforge/enforce-angular-geometry.mjs --write
node scripts/veriforge/enforce-metallic-gradients.mjs --write
node scripts/veriforge/enforce-red-accents.mjs --write
```

---

## 9. Best Practices

### Keep UI heavy, angular, industrial

- Prefer dense control-surface layouts over airy marketing cards
- Hard edges, steel frames, metallic headers
- One job per panel; Orbitron section titles with red underline

### Use metallic gradients consistently

- Shell / KPI headers / modal chrome → `metallicGradient` / CSS var
- Text sits on iron-black scrim, not busy metal alone
- Scan with `npm run vf:debug:metal`

### Use red accents intentionally

- Active + critical + focus only
- Pair with labels (`Critical`, counts, `aria-current`)
- Cap concurrent `redGlowPulse` instances

### Maintain strict geometry rules

- Zero radius — no exceptions for “just this badge”
- 44×44 minimum tap targets on mobile
- Focus rings with offset so square corners don’t hide outline

### Performance & a11y while shipping

| Pack | Use when |
|------|----------|
| `PERFORMANCE-PACK.md` | Lazy charts/modals, GPU motion, bundle budgets |
| `ACCESSIBILITY-SYSTEM.md` | Contrast, keyboard, reduced motion, SR |
| `QA-SUITE.md` | Pre-merge visual/functional gates |
| `docs/` | Human-readable system reference |

### Do / Don't

| Do | Don't |
|----|-------|
| Use `VF*` components | Invent rounded one-off cards |
| Extend `veriforge-routes.ts` | Hide modules with ad-hoc sidebars |
| Use VeriForge shells | Drop Vera `GlobalNav` into `/veriforge` |
| Named icon imports | Import entire icon catalog for one mark |
| Critical pulse on allowlist routes | Pulse every card on the dashboard |

---

## Learning path (first week)

| Day | Focus | Links |
|-----|-------|-------|
| 1 | Setup + tokens + shell | §2 · `/veriforge/docs/getting-started` |
| 2 | Components + coding standards | §4–5 · `/veriforge/docs/components` |
| 3 | Motion + routing | §6 · `/veriforge/docs/motion` |
| 4 | One engine page end-to-end | §7 · `/veriforge/docs/systems` |
| 5 | Debug + QA + a11y pass | §8–9 · `QA-SUITE.md` |

---

## Sign-off (new developer)

- [ ] Can explain forged-metal identity in one minute
- [ ] Local `/veriforge/dashboard` runs with correct shell
- [ ] Built a small page with VFButton / VFCard / VFPanel only
- [ ] Used angularSlide + metallicFade correctly
- [ ] Knows when **not** to use redGlowPulse
- [ ] Ran `vf:debug:all` clean on touched paths
- [ ] Read accessibility contrast rules for red/steel text

---

## Final goal

Provide a complete onboarding kit that teaches developers how to build using the forged-metal VeriForge identity — **angular, metallic, industrial, and intentional with forge red** — across components, motion, workflows, and tooling.
