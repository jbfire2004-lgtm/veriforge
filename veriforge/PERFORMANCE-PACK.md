# VeriForge Performance Optimization Pack

Complete performance optimization pack ensuring the **forged-metal VeriForge UI** runs fast, smooth, and efficient across all devices.

**Brand locks (do not sacrifice for speed)**

| Constraint | Value |
|------------|-------|
| Palette | `#0D0D0D` · `#424242` · `#C62828` · `#FAFAFA` |
| Geometry | `border-radius: 0` |
| Metallic | `var(--vf-effect-metallic-gradient)` / `COLORS.metallicGradient` |
| Motion timing | fast **120ms** · medium **240ms** · heavy **400ms** |
| Critical pulse | `redGlowPulse` **only** on critical states/routes |

**Canonical paths**

| Layer | Path |
|-------|------|
| Tokens / CSS vars | `vera-frontend/src/theme/veriforge-tokens.ts` |
| Motion CSS | `vera-frontend/src/motion/veriforge-motion.css` |
| Icons | `vera-frontend/src/icons/veriforge-icons.ts` |
| Components | `vera-frontend/src/components/veriforge/` |
| Layouts | `vera-frontend/src/layouts/` |
| Dashboard | `vera-frontend/src/pages/dashboard/` |
| Router | `vera-frontend/src/router/` |
| Mobile | `vera-frontend/src/mobile/` |
| Build | `vera-frontend/next.config.ts` · `package.json` |

**Related docs:** `THEME-DEBUG-TOOLKIT.md` · `QA-SUITE.md` · `INTEGRATION-CHECKLIST.md`

**Status legend:** ☐ Todo · ☑ Done · ⚠ Partial

---

## Performance budgets

| Metric | Target (desktop) | Target (mobile) |
|--------|------------------|-----------------|
| Route transition (angularSlide + metallicFade) | ≤ 240ms perceived | ≤ 240ms; prefer lighter fade on low-end |
| Modal open (industrialDrop) | ≤ 400ms | ≤ 400ms |
| Dashboard LCP (KPI + first chart) | ≤ 2.5s | ≤ 3.5s |
| Interaction to next paint (button / nav) | ≤ 100ms | ≤ 150ms |
| JS for `/veriforge/dashboard` route chunk | Keep charts/modals out of initial shell | Same |
| CLS | ≤ 0.1 | ≤ 0.1 |
| `redGlowPulse` instances visible | Critical only (≤ few nodes) | Critical only |

---

## 1. RENDER OPTIMIZATION

**Goal:** Cut unnecessary React work; defer heavy UI; isolate motion.

### 1.1 Memoization — VFButton, VFCard, VFPanel

| # | Action | Detail | Status |
|---|--------|--------|--------|
| R1 | Wrap `VFButton` in `React.memo` | Stable props; avoid parent dashboard re-render thrash | ☐ |
| R2 | Wrap `VFCard` in `React.memo` | Compare `className` / children carefully; prefer slot props over inline lambdas | ☐ |
| R3 | Wrap `VFPanel` in `React.memo` | Same; keep motion class toggles outside memoized leaf when possible | ☐ |
| R4 | Stabilize callbacks | Prefer `useEffectEvent` (React 19) for event handlers passed into memoized children | ☐ |
| R5 | Avoid default memo everywhere | Do **not** blanket-memo `VFInput` / tables unless profiling shows benefit | ☐ |

**Pattern**

```tsx
export const VFButton = memo(function VFButton(props: VFButtonProps) {
  // …
});
```

### 1.2 Lazy loading — charts, modals

| # | Action | Detail | Status |
|---|--------|--------|--------|
| R6 | Lazy `VFChart` / dashboard charts | `next/dynamic` or `React.lazy` + Suspense | ☐ |
| R7 | Lazy `VFModal` bodies | Load modal content chunk on first open, not with shell | ☐ |
| R8 | Lazy Digital Twin / Command Center canvases | Heavy engines must not block dashboard | ☐ |
| R9 | Keep shell eager | `VFAppShell`, `VFHeader`, `VFSidebar`, `VFButton` stay in main chunk | ☐ |

**Pattern**

```tsx
const VFChart = dynamic(() => import("@/src/components/veriforge/VFChart"), {
  ssr: false,
  loading: () => <div className="vf-chart-skeleton" aria-hidden />,
});
```

### 1.3 Suspense — dashboard sections

| # | Action | Detail | Status |
|---|--------|--------|--------|
| R10 | Suspense per dashboard section | KPI bar, charts, alerts as separate boundaries | ☐ |
| R11 | Angular skeleton placeholders | Iron-black + steel border; **no** rounded skeletons | ☐ |
| R12 | Stream non-critical panels | Alerts / secondary charts after KPI shell | ☐ |

### 1.4 Isolate angular motion triggers

| # | Action | Detail | Status |
|---|--------|--------|--------|
| R13 | Motion on wrapper only | Apply `vf-m-angular-slide` / `vf-m-metallic-fade` to route/content wrappers, not every card | ☐ |
| R14 | Key by pathname | Remount transition wrapper on major route change only | ☐ |
| R15 | Avoid animating layout props | No animating `height` / `top` / `margin` on large trees | ☐ |
| R16 | Split state | Keep hover/press local to button; don’t lift into shell | ☐ |

**Section 1 gate:** Shell stays light; charts/modals lazy; motion wrappers isolated.

---

## 2. MOTION OPTIMIZATION

**Goal:** GPU-friendly forged-metal motion; pulse only where critical.  
**Source:** `src/motion/veriforge-motion.css`

### 2.1 angularSlide — GPU transforms

| # | Action | Detail | Status |
|---|--------|--------|--------|
| M1 | Animate `transform` + `opacity` only | Already: `translateX` + `skewX` + `opacity` | ⚠ |
| M2 | Promote layer | `will-change: transform, opacity` **during** animation only; remove after | ☐ |
| M3 | Prefer `translate3d` / composite | Use `translate3d(...)` if profiling shows paint cost | ☐ |
| M4 | Avoid layout thrash | Do not combine with width/height animations on same node | ☐ |

### 2.2 metallicFade — opacity (+ light transform)

| # | Action | Detail | Status |
|---|--------|--------|--------|
| M5 | Primary channel = `opacity` | Keep fade cheap; optional tiny `translateY(4px)` max | ⚠ |
| M6 | No filter blur on large regions | Blur/filter kills mobile FPS | ☐ |
| M7 | Content-load only | Apply on content region, not full shell chrome | ☐ |

### 2.3 industrialDrop — scale + translate

| # | Action | Detail | Status |
|---|--------|--------|--------|
| M8 | Use `translateY` + `opacity` (+ light skew) | Current keyframes; avoid animating `top` | ⚠ |
| M9 | Optional `scale` settle | `scale(0.98 → 1)` on modal panel only (small layer) | ☐ |
| M10 | Modal-only | Never run industrialDrop on page-sized containers | ☐ |

### 2.4 redGlowPulse — critical only

| # | Action | Detail | Status |
|---|--------|--------|--------|
| M11 | Gate on `critical` route / alert severity | Use `isVeriForgeCriticalRoute` / `data-vf-critical` | ☐ |
| M12 | Cap concurrent pulses | Prefer one pulsing region (nav accent or alert row), not every cell | ☐ |
| M13 | Prefer box-shadow / outline pulse | Avoid continuous full-tree reflow | ☐ |
| M14 | `prefers-reduced-motion` | Disable pulse / shorten to static red accent | ☐ |

**Critical allowlist**

```
/veriforge/compliance
/veriforge/incidents
/veriforge/risk
/veriforge/emergency
/veriforge/command-center
/veriforge/predictive
```

**Section 2 gate:** Compositor-friendly transforms; pulse limited to critical UI.

---

## 3. STYLE OPTIMIZATION

**Goal:** Tokenized CSS, modules, no dead global weight.

### 3.1 Metallic gradients → CSS variables

| # | Action | Detail | Status |
|---|--------|--------|--------|
| S1 | Use `--vf-effect-metallic-gradient` | From `veriforgeCssVars` / tokens.css | ⚠ |
| S2 | Ban inline repeated gradient strings | No copy-pasted `linear-gradient(135deg, #1A1A1A…)` in components | ☐ |
| S3 | One paint definition | Body/shell references the var; children inherit or use `background-image: var(--vf-effect-metallic-gradient)` | ☐ |

### 3.2 Cache angular geometry shapes

| # | Action | Detail | Status |
|---|--------|--------|--------|
| S4 | Use `--vf-radius-none: 0px` | Never redeclare per component | ☐ |
| S5 | Cache bevel clip | `--vf-card-bevel` / `GEOMETRY.cardBevel` for clip-path | ☐ |
| S6 | Shared module | `layouts/shared.module.css` for repeated angular chrome | ⚠ |

### 3.3 CSS modules for all components

| # | Action | Detail | Status |
|---|--------|--------|--------|
| S7 | Every VF* component has `.module.css` | Already the library pattern | ⚠ |
| S8 | No ad-hoc global class soup under engines | Prefer modules + tokens | ☐ |
| S9 | Keep motion classes global | `veriforge-motion.css` utilities are intentional globals | ☑ |

### 3.4 Remove unused global styles

| # | Action | Detail | Status |
|---|--------|--------|--------|
| S10 | Audit `app/globals.css` | VeriForge must not pull unused Vera marketing chrome into VF routes | ☐ |
| S11 | Scope debug CSS | `veriforge-debug.css` inert without `vf-debug*`; never enable in prod | ☑ |
| S12 | Drop dead legacy VeriForge CSS | Remove superseded brand files after migration | ☐ |

**Section 3 gate:** Gradients/geometry via vars; modules everywhere; globals lean.

---

## 4. ICON OPTIMIZATION

**Goal:** Tree-shakeable angular SVG icons with shared metal fills.  
**Source:** `src/icons/veriforge-icons.ts`

### 4.1 Tree-shakeable exports

| # | Action | Detail | Status |
|---|--------|--------|--------|
| I1 | Prefer named icon imports | `import { TrainingIcon } from "…"` not default barrel of all | ⚠ |
| I2 | Split catalog map | Keep `VERIFORGE_ICONS` for dynamic lookup; document that it pulls the set | ☐ |
| I3 | Dynamic route icons | Lazy-resolve category icon in sidebar if bundle shows icon weight | ☐ |
| I4 | Avoid `import * as Icons` | Prevents shaking | ☐ |

### 4.2 SVG paths — angular geometry

| # | Action | Detail | Status |
|---|--------|--------|--------|
| I5 | Hard angles / bevels | No soft circles as primary mark (except intentional status dots) | ⚠ |
| I6 | Stroke-based steel outlines | Reuse `IndustrialIconShell` | ☑ |
| I7 | Inline SVG only | No icon font; no heavy icon packs inside VeriForge shell | ☐ |

### 4.3 Cache metallic gradients for icons

| # | Action | Detail | Status |
|---|--------|--------|--------|
| I8 | Single `<linearGradient id="vf-icon-metal">` | Define once in sprite/shell; reference by `url(#…)` | ☐ |
| I9 | Tone via CSS vars | Stroke/fill from `--vf-color-*` | ⚠ |
| I10 | Memo icon components | `memo(TrainingIcon)` if parents re-render often | ☐ |

**Section 4 gate:** Named imports; shared gradient defs; angular paths.

---

## 5. LAYOUT OPTIMIZATION

**Goal:** Cheap layout; fixed chrome; transform-based shifts.

### 5.1 CSS grid — dashboard

| # | Action | Detail | Status |
|---|--------|--------|--------|
| L1 | `VFDashboardGrid` uses CSS grid | `display: grid` + responsive columns | ☑ |
| L2 | Explicit tracks | Prefer `repeat(n, minmax(0, 1fr))` to avoid overflow blowouts | ☑ |
| L3 | Contain paint | `content-visibility: auto` on below-fold sections (careful with a11y) | ☐ |

### 5.2 Flexbox — panels and cards

| # | Action | Detail | Status |
|---|--------|--------|--------|
| L4 | Card/panel internals = flex | Header / body / actions columns | ⚠ |
| L5 | `min-width: 0` on flex children | Prevents chart overflow reflow loops | ☐ |
| L6 | Avoid nested grids for simple stacks | Flex for 1-axis; grid for 2-axis | ☐ |

### 5.3 Fixed sidebar

| # | Action | Detail | Status |
|---|--------|--------|--------|
| L7 | Sidebar `position: fixed` (or sticky in shell grid) | Does not reflow content on scroll | ☐ |
| L8 | Content offset via padding/margin | Not by animating sidebar `width` on every frame | ☐ |
| L9 | Collapse via transform | Off-canvas: `translateX(-100%)` instead of width animation | ☐ |

### 5.4 Transform-based layout transitions

| # | Action | Detail | Status |
|---|--------|--------|--------|
| L10 | Layout shifts use transform | bevelShift / slide panels | ☐ |
| L11 | No FLIP on entire dashboard | Limit to sidebar / drawer / modal | ☐ |
| L12 | Reserve space for charts | Fixed aspect boxes → lower CLS | ☐ |

**Section 5 gate:** Grid dashboard; flex cards; fixed sidebar; transform transitions.

---

## 6. ROUTING OPTIMIZATION

**Goal:** Fast navigations; split heavy engines; cache metadata.  
**Source:** `src/router/veriforge-routes.ts`

### 6.1 Preload critical routes

| # | Action | Detail | Status |
|---|--------|--------|--------|
| RT1 | Prefetch critical paths | `compliance`, `incidents`, `risk`, `emergency`, `command-center`, `predictive` | ☐ |
| RT2 | Prefetch on sidebar hover/focus | `<Link prefetch>` or `router.prefetch` | ☐ |
| RT3 | Do not prefetch Digital Twin by default | Heavy; prefetch only on intent | ☐ |

### 6.2 Route-level code splitting

| # | Action | Detail | Status |
|---|--------|--------|--------|
| RT4 | Next.js App Router page splits | Each `app/veriforge/**/page.tsx` is its own chunk | ☑ |
| RT5 | Heavy engines dynamic-import engines | Command Center / Twin / Predictive internals | ☐ |
| RT6 | Shared shell layout | `(main)/layout.tsx` loads once; pages swap | ☑ |

### 6.3 Cache route metadata

| # | Action | Detail | Status |
|---|--------|--------|--------|
| RT7 | Treat `VERIFORGE_ROUTES` as const cache | No recompute of nav list per render | ⚠ |
| RT8 | Memo derived nav | `useMemo` / module-level `getVeriForgeNavItems()` once | ☐ |
| RT9 | Resolve critical via helper | `isVeriForgeCriticalRoute(pathname)` — O(1)/map lookup | ☐ |

### 6.4 angularSlide only on major transitions

| # | Action | Detail | Status |
|---|--------|--------|--------|
| RT10 | Major = section / engine change | e.g. dashboard → incidents | ☐ |
| RT11 | Skip full slide on tab/query-only changes | Same engine, filter change → metallicFade only or none | ☐ |
| RT12 | Mobile: prefer metallicFade | Lighter than skew slide on low-end | ☐ |

**Section 6 gate:** Critical prefetch; engine splits; metadata cached; slide on majors only.

---

## 7. MOBILE OPTIMIZATION

**Goal:** Same identity, lower cost on phones.  
**Surface:** `src/mobile/` · `/veriforge/mobile/*`

| # | Action | Detail | Status |
|---|--------|--------|--------|
| MB1 | Reduce metallic gradient complexity | Prefer solid iron-black + thin steel edge; gradient on header only | ☐ |
| MB2 | Lightweight motion | Prefer `metallicFade` / opacity; shorten or skip skew on `angularSlide` | ☐ |
| MB3 | Cache icons + gradients | Shared SVG gradient id; memo bottom-nav icons | ☐ |
| MB4 | Minimal layout shifts | Fixed bottom nav; content `padding-bottom`; no height jank | ☐ |
| MB5 | Hit targets without extra wrappers | 44×44 via padding/min-size, not nested animated layers | ☐ |
| MB6 | `prefers-reduced-motion` | Static red accent instead of pulse | ☐ |
| MB7 | Lazy mobile charts | Same as desktop; skeleton angular | ☐ |

**Mobile motion policy**

| Primitive | Mobile policy |
|-----------|---------------|
| `metallicFade` | Default content transition |
| `angularSlide` | Major nav only; reduced skew |
| `industrialDrop` | Modals only |
| `redGlowPulse` | Critical alerts / active tab only |
| `bevelShift` | Optional; disable on low-end |

**Section 7 gate:** Simpler metal; light motion; stable layout; cached icons.

---

## 8. BUILD OPTIMIZATION

**Goal:** Small, tree-shaken production bundles + measurable report.

### 8.1 Minification + tree shaking

| # | Action | Detail | Status |
|---|--------|--------|--------|
| B1 | Production Next build | `npm run build` (webpack) minifies by default | ☑ |
| B2 | ESM named exports | Icons, motion primitives, components | ⚠ |
| B3 | Avoid side-effect imports | Don’t import full `veriforge-icons` default where one icon needed | ☐ |
| B4 | `sideEffects` hygiene | CSS imports only from entry/layout; keep modules pure | ☐ |

### 8.2 Remove unused imports

| # | Action | Detail | Status |
|---|--------|--------|--------|
| B5 | ESLint unused imports | `npm run lint` clean under `src/**/veriforge*` | ☐ |
| B6 | No debug-only imports in prod paths | Debug toolkit CSS OK (inert); no debug React helpers in prod | ☐ |
| B7 | Drop unused Lucide in VF surfaces | Prefer VeriForge icon set | ☐ |

### 8.3 Optimize bundle size

| # | Action | Detail | Status |
|---|--------|--------|--------|
| B8 | Chart.js only in chart chunks | Dynamic import | ☐ |
| B9 | Engine packages on demand | `@vera/digital-twin`, command-center, etc. not in shell | ☐ |
| B10 | Font subset | Orbitron + Exo 2 via `next/font` (already); no extra families | ☑ |
| B11 | Analyze | `@next/bundle-analyzer` or webpack stats on VF routes | ☐ |

### 8.4 Generate performance report

| # | Action | Detail | Status |
|---|--------|--------|--------|
| B12 | Build + note route sizes | Capture `.next` route/chunk sizes for `/veriforge/*` | ☐ |
| B13 | Lighthouse / Web Vitals | Dashboard + one critical + one mobile path | ☐ |
| B14 | Motion FPS spot-check | Chrome Performance: route change + modal open | ☐ |
| B15 | Archive report | Save under `veriforge/reports/` or CI artifact (optional) | ☐ |

**Suggested report commands**

```bash
cd vera-frontend
npm run typecheck
npm run lint
npm run build
# Optional: ANALYZE=true with bundle analyzer when configured
```

**Report template**

```
VeriForge Performance Report
Date:
Commit:

Budgets
- Dashboard LCP:
- Route transition:
- Modal open:
- CLS:

Bundles
- Shell / (main) layout:
- dashboard page:
- command-center:
- digital-twin:
- predictive:
- mobile shell:

Motion
- angularSlide compositor-only: Y/N
- redGlowPulse critical-only: Y/N

Actions / regressions:
-
```

**Section 8 gate:** Clean build; shaken icons/engines; report filed against budgets.

---

## Implementation priority

| Priority | Items | Why |
|----------|-------|-----|
| P0 | M11–M14, R6–R8, RT5, B8–B9 | Biggest jank / weight wins |
| P1 | R1–R3, R13–R16, S1–S3, L7–L10 | Render + style hygiene |
| P2 | I1–I10, RT1–RT2, RT10–RT12 | Icons + routing polish |
| P3 | MB1–MB7, B11–B15 | Mobile + measurement |

---

## Verification (tie to QA)

After applying this pack, re-run:

1. `veriforge/QA-SUITE.md` §1–§3 (identity + motion still correct)
2. `npm run vf:debug:all` (geometry / metal / red still enforced)
3. Performance report (§8.4) vs budgets above

**Do not** “optimize” by introducing rounded corners, dropping forge red on critical states, or replacing metallic identity with flat grey.

---

## Sign-off

| Gate | Owner | Date | Result |
|------|-------|------|--------|
| §1 Render | | | ☐ / ☑ |
| §2 Motion | | | ☐ / ☑ |
| §3 Style | | | ☐ / ☑ |
| §4 Icons | | | ☐ / ☑ |
| §5 Layout | | | ☐ / ☑ |
| §6 Routing | | | ☐ / ☑ |
| §7 Mobile | | | ☐ / ☑ |
| §8 Build + report | | | ☐ / ☑ |
| Budgets met | | | ☐ / ☑ |

---

## Final goal

Provide a complete performance optimization pack ensuring the forged-metal VeriForge UI runs **fast, smooth, and efficient** across all devices — without diluting iron black, steel grey, forge red, metallic gradients, or angular geometry.
