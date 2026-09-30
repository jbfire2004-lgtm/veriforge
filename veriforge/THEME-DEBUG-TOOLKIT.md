# VeriForge Theme Debug Toolkit

Complete debugging toolkit to ensure the **forged-metal VeriForge identity** is applied perfectly across the entire app.

**Brand locks**

| Token | Value | Debug outline |
|-------|-------|---------------|
| `forgeRed` | `#C62828` | Red |
| `steelGrey` | `#424242` | Grey / dashed |
| `ironBlack` | `#0D0D0D` | Black |
| `safetyWhite` | `#FAFAFA` | White / dotted |
| Geometry | `border-radius: 0` | Any radius = **error** |
| Motion | angularSlide / metallicFade / industrialDrop / redGlowPulse | Blue / grey / yellow / red |

**Canonical assets**

| Asset | Path |
|-------|------|
| Debug CSS | `vera-frontend/src/theme/veriforge-debug.css` |
| Tokens | `vera-frontend/src/theme/veriforge-tokens.ts` |
| Global theme | `vera-frontend/src/styles/global.css` |
| Motion | `vera-frontend/src/motion/veriforge-motion.css` |
| Auto-fix scripts | `vera-frontend/scripts/veriforge/*.mjs` |

---

## Enable debugging

Import once (dev only recommended):

```css
/* app/globals.css */
@import "../src/theme/veriforge-debug.css";
```

Toggle on `<html>` or any ancestor:

```html
<html class="vf-debug">
```

Or enable a single layer:

| Class on ancestor | Layer |
|-------------------|-------|
| `vf-debug` | All layers + “VF DEBUG ON” badge |
| `vf-debug-color` | Color outlines |
| `vf-debug-angular` | Rounded-corner errors |
| `vf-debug-motion` | Motion outlines |
| `vf-debug-component` | Component borders |
| `vf-debug-layout` | Angular grid |
| `vf-debug-route` | Route transitions |
| `vf-debug-mobile` | Tap hitboxes |

**Never ship with `vf-debug*` enabled in production.**

Quick console toggle:

```js
document.documentElement.classList.toggle("vf-debug");
```

---

## 1. COLOR DEBUGGING

### Class: `.debug-color-outline`

Highlights token usage so forged-metal palette drift is visible.

| Token | Outline | Helper class |
|-------|---------|--------------|
| `forgeRed` (`#C62828`) | Solid red | `.debug-color-forgeRed` |
| `steelGrey` (`#424242`) | Dashed grey | `.debug-color-steelGrey` |
| `ironBlack` (`#0D0D0D`) | Solid black | `.debug-color-ironBlack` |
| `safetyWhite` (`#FAFAFA`) | Dotted white | `.debug-color-safetyWhite` |

### Markup

```tsx
<div className="debug-color-outline" data-vf-token="forgeRed">
  Critical KPI
</div>
```

With `vf-debug` / `vf-debug-color` on an ancestor, inline styles and class names containing the hex / token names are auto-outlined.

### Pass criteria

- Active / critical / focus accents resolve to **forgeRed**
- Structure / borders / hover resolve to **steelGrey**
- Shell / panels resolve to **ironBlack** + metallic gradient
- Primary text / icons on dark resolve to **safetyWhite**

---

## 2. GEOMETRY DEBUGGING

### Class: `.debug-angular`

Highlights rounded corners. **Any rounded corner = error.** Angular geometry only (`border-radius: 0`).

### Behavior

Under `vf-debug` / `vf-debug-angular`:

- Tailwind `rounded-*` (except `rounded-none`) → **hot pink/red hatch + outline**
- Overlay label: `⚠ ROUNDED (ERROR)`

### Pass criteria

- No `rounded-sm|md|lg|xl|2xl|3xl|full|…` under VeriForge paths
- CSS modules use `border-radius: 0` (or `GEOMETRY.angularRadius`)
- Cards, buttons, inputs, modals, charts, mobile shells are square

### Fix

```bash
node scripts/veriforge/remove-rounded-corners.mjs --write
node scripts/veriforge/enforce-angular-geometry.mjs --write
```

---

## 3. MOTION DEBUGGING

### Class: `.debug-motion`

Shows which motion primitive is active on an element.

| Primitive | Outline | Helper class |
|-----------|---------|--------------|
| `angularSlide` | Blue | `.debug-motion-angularSlide` |
| `metallicFade` | Grey | `.debug-motion-metallicFade` |
| `industrialDrop` | Yellow | `.debug-motion-industrialDrop` |
| `redGlowPulse` | Red | `.debug-motion-redGlowPulse` |

### Markup

```tsx
<div
  className="debug-motion vf-m-angular-slide"
  data-vf-motion="angularSlide"
>
  …
</div>
```

Auto-detects motion CSS classes (`vf-m-angular-slide`, `vf-m-metallic-fade`, `vf-m-industrial-drop` / modal drop-in, `vf-m-red-glow-pulse`).

### Pass criteria

- Route enter → `angularSlide` + `metallicFade`
- Modal enter → `industrialDrop`
- Critical / active → `redGlowPulse`
- Timing: fast **120ms** / medium **240ms** / heavy **400ms**

---

## 4. COMPONENT DEBUGGING

### Class: `.debug-component`

Shows component boundaries for the forged-metal library.

| Component | Border | `data-vf-component` |
|-----------|--------|---------------------|
| `VFButton` | Red (`#C62828`) | `VFButton` |
| `VFCard` | Steel (`#424242`) | `VFCard` |
| `VFPanel` | Black (`#0D0D0D`) | `VFPanel` |
| `VFModal` | Metallic gradient | `VFModal` |

### Markup

```tsx
<button data-vf-component="VFButton" className="debug-component">…</button>
<article data-vf-component="VFCard" data-card className="debug-component">…</article>
<section data-vf-component="VFPanel" className="debug-component">…</section>
<div role="dialog" data-vf-component="VFModal" className="debug-component">…</div>
```

### Pass criteria

- Interactive CTAs use `VFButton` (or mobile equivalent)
- Content blocks use `VFCard` / `VFPanel`
- Overlays use `VFModal` with industrial drop motion
- No ad-hoc rounded “card” shells outside the library

---

## 5. LAYOUT DEBUGGING

### Class: `.debug-layout-grid`

Shows an **angular 16px grid** with steel-grey lines.

| Signal | Meaning |
|--------|---------|
| Steel-grey grid (`#424242` @ ~55% opacity) | Aligned geometry |
| Red grid + red outline (`data-vf-misaligned="true"`) | Misaligned geometry |

### Markup

```tsx
<main className="debug-layout-grid">…</main>
<main className="debug-layout-grid" data-vf-misaligned="true">…</main>
```

### Pass criteria

- Spacing snaps to `SPACING` / 8–16px rhythm
- No floating rounded islands off the grid
- Shell regions (header / sidebar / content / footer) align to angular edges

---

## 6. ROUTING DEBUGGING

### Class: `.debug-route`

Shows route transition state.

| State | Visual |
|-------|--------|
| `angularSlide` active | Blue outline on `[data-vf-route]` |
| `metallicFade` active | Grey inset (`data-vf-fade="active"`) |
| Critical route | Red outline (`data-vf-critical="true"`) |

### Markup

```tsx
<div
  className="debug-route"
  data-vf-route="/veriforge/incidents"
  data-vf-fade="active"
  data-vf-critical="true"
>
  …
</div>
```

Wire from `VFRouteTransition` / route metadata in `src/router/veriforge-routes.ts`.

### Pass criteria

- Every VeriForge page transition uses angularSlide + metallicFade
- Critical routes (compliance, incidents, risk, emergency, command-center, predictive) also pulse forge red

---

## 7. MOBILE DEBUGGING

### Class: `.debug-mobile-hitbox`

Shows tap zones on mobile shells.

| Outline | Meaning |
|---------|---------|
| **Red** (`#C62828`) | Too small (`debug-mobile-hitbox--small` or tiny `h-6`–`h-8` / `w-6`–`w-8`) |
| **Steel-grey** (`#424242`) | Correct (`debug-mobile-hitbox--ok`, target ≥ 44×44) |

### Markup

```tsx
<nav className="debug-mobile-hitbox">
  <a className="debug-mobile-hitbox--ok">Home</a>
  <button className="debug-mobile-hitbox--small">…</button>
</nav>
```

Enable layer: `class="vf-debug-mobile"` on the mobile shell.

### Pass criteria

- Primary nav / CTAs ≥ **44×44**
- No icon-only controls under 44px without expanded hit area
- Angular geometry + forge red active states preserved on mobile

---

## 8. AUTO-FIX SCRIPTS

Run from `vera-frontend/`:

```bash
# Dry-run (exit 1 if issues found)
node scripts/veriforge/remove-rounded-corners.mjs
node scripts/veriforge/enforce-metallic-gradients.mjs
node scripts/veriforge/enforce-red-accents.mjs
node scripts/veriforge/enforce-angular-geometry.mjs

# Apply / annotate
node scripts/veriforge/remove-rounded-corners.mjs --write
node scripts/veriforge/enforce-metallic-gradients.mjs --write
node scripts/veriforge/enforce-red-accents.mjs --write
node scripts/veriforge/enforce-angular-geometry.mjs --write
```

Optional npm aliases (add if desired):

```json
{
  "scripts": {
    "vf:debug:rounded": "node scripts/veriforge/remove-rounded-corners.mjs",
    "vf:debug:metal": "node scripts/veriforge/enforce-metallic-gradients.mjs",
    "vf:debug:red": "node scripts/veriforge/enforce-red-accents.mjs",
    "vf:debug:angular": "node scripts/veriforge/enforce-angular-geometry.mjs",
    "vf:debug:all": "node scripts/veriforge/remove-rounded-corners.mjs & node scripts/veriforge/enforce-metallic-gradients.mjs & node scripts/veriforge/enforce-red-accents.mjs & node scripts/veriforge/enforce-angular-geometry.mjs"
  }
}
```

### Script: `remove-rounded-corners`

- **File:** `scripts/veriforge/remove-rounded-corners.mjs`
- **Scope:** `app/veriforge`, `components/veriforge`, `src/components/veriforge`, `src/layouts`, `src/mobile`, `src/pages/dashboard`, `src/router`, `src/theme`, `src/styles`
- **Action:** strips Tailwind `rounded-*` utilities
- **Flags:** `--write`, `--path <dir>`

### Script: `enforce-metallic-gradients`

- **File:** `scripts/veriforge/enforce-metallic-gradients.mjs`
- **Detects:** flat `#0D0D0D` / `#1A1A1A` backgrounds without metallic gradient / `--vf-metallic` / `COLORS.metallicGradient`
- **`--write`:** annotates files with a fix hint comment

### Script: `enforce-red-accents`

- **File:** `scripts/veriforge/enforce-red-accents.mjs`
- **Detects:** files mentioning critical / active / focus / alert without `#C62828` / `forgeRed` / `redGlowPulse`
- **`--write`:** annotates with forge-red wiring hint

### Script: `enforce-angular-geometry`

- **File:** `scripts/veriforge/enforce-angular-geometry.mjs`
- **Detects:** non-`rounded-none` utilities + non-zero `border-radius` in CSS
- **`--write`:** removes rounded classes; rewrites `border-radius` → `0`
- Skips `veriforge-debug.css` (intentionally documents offenders)

---

## Recommended debug workflow

1. Import `veriforge-debug.css` in local/dev.
2. Enable `vf-debug` on `<html>`.
3. Walk critical routes: dashboard → compliance → incidents → risk → emergency → command-center → predictive → mobile shell.
4. Fix geometry first (`remove-rounded-corners` + `enforce-angular-geometry`).
5. Fix color accents (`enforce-red-accents`) and shell metals (`enforce-metallic-gradients`).
6. Verify motion outlines on route change and modal open.
7. Verify mobile hitboxes ≥ 44px.
8. Remove `vf-debug*` classes before production.

---

## Final goal

Provide a complete debugging toolkit so the forged-metal VeriForge identity — **iron black, steel grey, forge red, safety white, metallic gradients, angular geometry, industrial motion** — is applied perfectly across the entire app.
