# VeriForge Accessibility Compliance System

Complete accessibility compliance system ensuring the **forged-metal VeriForge identity** is fully accessible, inclusive, and WCAG-compliant.

**Brand locks (identity preserved; contrast rules apply)**

| Token | Value | A11y role |
|-------|-------|-----------|
| `forgeRed` | `#C62828` | Accent / critical / focus — **not** primary body text on iron black |
| `ironBlack` | `#0D0D0D` | Shell / panel background |
| `steelGrey` | `#424242` | Borders / chrome — **not** body text on iron black |
| `safetyWhite` | `#FAFAFA` | Primary text / icons on dark surfaces |
| Geometry | `border-radius: 0` | Allowed; must not reduce hit targets or focus visibility |
| Motion | 120 / 240 / 400ms | Disabled or instant under `prefers-reduced-motion` |

**Canonical paths**

| Layer | Path |
|-------|------|
| Tokens | `vera-frontend/src/theme/veriforge-tokens.ts` |
| Motion (reduced-motion) | `vera-frontend/src/motion/veriforge-motion.css` |
| Icons | `vera-frontend/src/icons/veriforge-icons.ts` |
| Components | `vera-frontend/src/components/veriforge/` |
| Mobile | `vera-frontend/src/mobile/` |
| Debug / QA | `veriforge/THEME-DEBUG-TOOLKIT.md` · `veriforge/QA-SUITE.md` |

**Standards target:** [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/) (AAA where noted)  
**Status legend:** ☐ Todo · ☑ Done · ⚠ Partial

---

## Contrast math (measured)

Relative luminance contrast ratios (WCAG 2.x formula), measured against forged-metal tokens:

| Foreground | Background | Ratio | Normal text (AA 4.5:1) | Large text / UI (AA 3:1) | AAA text (7:1) |
|------------|------------|-------|------------------------|-------------------------|----------------|
| `forgeRed` `#C62828` | `ironBlack` `#0D0D0D` | **3.46:1** | ❌ Fail | ✅ Pass | ❌ Fail |
| `steelGrey` `#424242` | `ironBlack` `#0D0D0D` | **1.93:1** | ❌ Fail | ❌ Fail | ❌ Fail |
| `safetyWhite` `#FAFAFA` | `ironBlack` `#0D0D0D` | **18.62:1** | ✅ Pass | ✅ Pass | ✅ AAA |
| `safetyWhite` `#FAFAFA` | `steelGrey` `#424242` | **9.63:1** | ✅ Pass | ✅ Pass | ✅ AAA |
| `forgeRed` `#C62828` | `safetyWhite` `#FAFAFA` | **5.39:1** | ✅ Pass | ✅ Pass | ❌ Fail |

**Hard rules derived from measurements**

1. **Body / UI text on dark** → `safetyWhite` (or AA fallbacks below). Never `steelGrey` as text on `ironBlack`.
2. **`forgeRed` on `ironBlack`** → accent, focus ring, large headings (≥18pt / 14pt bold), non-text UI only — **not** small body copy.
3. **`steelGrey`** → borders, dividers, inactive chrome only — never sole carrier of meaning.
4. **Meaning ≠ color alone** — critical states need text / icon / `aria-*` in addition to red glow.

---

## 1. COLOR CONTRAST

### 1.1 forgeRed (`#C62828`) on ironBlack (`#0D0D0D`)

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| C1 | Do not use forge red for small body text on iron black | Ratio 3.46:1 &lt; 4.5:1 | ☐ |
| C2 | Allowed: large text (≥18pt / ≥14pt bold), icons ≥3:1, focus indicators | Meets 3:1 non-text / large text | ☐ |
| C3 | Active nav underline / critical badge | Pair with `safetyWhite` label text | ☐ |
| C4 | Focus ring | `2px solid #C62828` (or thicker) on dark; visible against adjacent steel | ☐ |

### 1.2 steelGrey (`#424242`) on black backgrounds

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| C5 | Never use steel grey as primary text on iron black | 1.93:1 fails AA | ☐ |
| C6 | Borders / dividers OK | Non-text UI; do not convey state by border color alone | ☐ |
| C7 | Hover chrome | Steel border + white/red text change, not steel-only text | ☐ |

### 1.3 safetyWhite (`#FAFAFA`) on dark backgrounds

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| C8 | Primary text / icons on iron black | 18.62:1 ≥ AAA | ☑ (token) |
| C9 | Text on steel panels | Prefer white on `#424242` (9.63:1 AAA) or iron + white | ☐ |
| C10 | Placeholder text | Must still meet AA — use muted white fallback, not steel | ☐ |

### 1.4 Fallback colors (low-contrast / forced-colors / high-contrast)

Use when `forgeRed` / `steelGrey` cannot meet the role’s contrast requirement, or under `prefers-contrast: more` / Windows High Contrast / `forced-colors: active`.

| Role | Brand default | AA fallback (on `#0D0D0D`) | Ratio (approx.) | CSS variable suggestion |
|------|---------------|----------------------------|-----------------|-------------------------|
| Critical / accent text | `#C62828` | `#EF5350` or `#E57373` | 5.57:1 / 6.51:1 | `--vf-a11y-accent-text` |
| Critical large / focus | `#C62828` | Keep `#C62828` if ≥3:1 UI | 3.46:1 | `--vf-color-forge-red` |
| Secondary / muted text | `#424242` ❌ | `#9E9E9E` or `#BDBDBD` | 7.25:1 / 10.34:1 | `--vf-a11y-muted-text` |
| Primary text | `#FAFAFA` | `#FAFAFA` (no change) | 18.62:1 | `--vf-color-safety-white` |
| Borders (non-text) | `#424242` | `#757575` under high contrast | — | `--vf-a11y-border` |
| Focus ring | `#C62828` | `#FF8A80` if needed for visibility | 8.51:1 | `--vf-a11y-focus` |

**Token extension (recommended)**

```ts
// vera-frontend/src/theme/veriforge-a11y-tokens.ts (proposed)
export const A11Y_COLORS = {
  accentTextOnDark: "#EF5350",   // AA body-sized critical text
  mutedTextOnDark: "#BDBDBD",    // AA secondary text (replaces steel-as-text)
  focusRing: "#C62828",          // UI focus; thicken to 3px if needed
  focusRingHighContrast: "#FF8A80",
  borderHighContrast: "#757575",
} as const;
```

**Forced colors**

```css
@media (forced-colors: active) {
  .veriforge-theme {
    forced-color-adjust: auto;
  }
  .vf-focus-ring:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}
```

**Section 1 gate:** Text uses white/AA fallbacks; red is accent; steel is chrome only.

---

## 2. MOTION ACCESSIBILITY

**Goal:** Honor `prefers-reduced-motion: reduce` without losing state meaning.  
**Existing:** `veriforge-motion.css` already zeros many `.vf-m-*` animations (⚠ complete the matrix below).

### 2.1 `prefers-reduced-motion` support

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| M1 | Global reduce media query | All forged-metal motion primitives covered | ⚠ |
| M2 | No infinite pulse under reduce | `redGlowPulse` → static red accent | ☐ |
| M3 | JS motion helpers respect reduce | `matchMedia('(prefers-reduced-motion: reduce)')` before adding classes | ☐ |
| M4 | Document in PERFORMANCE-PACK / QA | Reduced-motion cases in QA suite | ☐ |

### 2.2 Disable `angularSlide` for reduced-motion users

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| M5 | No translate/skew slide | `animation: none`; content appears in final position | ⚠ |
| M6 | Route changes still announce | Focus move / title update / `aria-live` polite on major nav | ☐ |

### 2.3 Replace `metallicFade` with instant opacity

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| M7 | Under reduce: opacity 1 immediately | No 240ms fade | ☐ |
| M8 | Prefer CSS | ```css
@media (prefers-reduced-motion: reduce) {
  .vf-m-metallic-fade { animation: none !important; opacity: 1 !important; }
}
``` | ⚠ |

### 2.4 Disable `redGlowPulse` for motion-sensitive users

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| M9 | No pulsing shadow/opacity | Static `BORDERS.redAccentBorder` + text “Critical” | ☐ |
| M10 | Critical meaning preserved | Color + label + `aria-live` / role | ☐ |
| M11 | `industrialDrop` / `bevelShift` | Instant show/hide under reduce | ⚠ |

**Canonical reduce block (target)**

```css
@media (prefers-reduced-motion: reduce) {
  .vf-m-angular-slide,
  .vf-m-metallic-fade,
  .vf-m-industrial-drop,
  .vf-m-bevel-shift,
  .vf-m-red-glow-pulse,
  .vf-m-modal-drop-in,
  .vf-m-modal-collapse {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .vf-m-red-glow-pulse,
  [data-vf-critical="true"] {
    box-shadow: none !important;
    border: var(--vf-border-red) !important;
  }
}
```

**Section 2 gate:** All five primitives safe under reduced motion; critical state still clear.

---

## 3. KEYBOARD NAVIGATION

**Goal:** Full keyboard operation of the VF component library and shells.

### 3.1 All VF components keyboard accessible

| # | Component | Keys / behavior | Pass criteria | Status |
|---|-----------|-----------------|---------------|--------|
| K1 | All interactive | Tab / Shift+Tab in logical order | Visible forge-red focus ring; no focus trap except modal | ☐ |
| K2 | Skip link | “Skip to content” as first focusable in `VFAppShell` | Moves focus to `VFContent` main | ☐ |
| K3 | Sidebar | Arrow keys optional; Tab required | `aria-current` on active | ☐ |
| K4 | Tables | Tab to rows/actions; no mouse-only controls | ☐ |

### 3.2 VFButton — Enter + Space

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| K5 | Native `<button>` preferred | Enter + Space activate by default | ☐ |
| K6 | If `role="button"` on non-button | `tabIndex={0}`; keydown Enter/Space → click | ☐ |
| K7 | Disabled | Not focusable **or** focusable with `aria-disabled` and no activation | ☐ |
| K8 | Focus visible | Red accent outline (`:focus-visible`) | ☐ |

### 3.3 VFModal — Escape to close

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| K9 | Escape closes | Already wired in `VFModal` — verify all call sites | ⚠ |
| K10 | Focus trap | Tab cycles inside dialog while open | ☐ |
| K11 | Initial focus | Title or first primary action | ☐ |
| K12 | Restore focus | Return to opener on close | ☐ |
| K13 | `role="dialog"` + `aria-modal="true"` + labelledby | Present on `VFModal` | ⚠ |

### 3.4 VFInput — Tab focus with red accent outline

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| K14 | Tab reaches input | Label associated (`htmlFor` / `aria-labelledby`) | ☐ |
| K15 | Focus style | Forge-red glow/outline; steel border when idle | ☐ |
| K16 | Errors | `aria-invalid` + `aria-describedby` error id (partial: `aria-invalid` exists) | ⚠ |
| K17 | Required | `aria-required` or native `required` | ☐ |

### 3.5 VFCard — Enter to activate

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| K18 | Static cards | No tab stop; content readable | ☐ |
| K19 | Interactive cards | Use `<button>` / `<a>` wrapper or `role="link|button"` + `tabIndex={0}` | ☐ |
| K20 | Enter (and Space if button) activates | Same as click target | ☐ |
| K21 | Nested controls | Only one tab stop pattern (card **or** inner buttons, not both confusingly) | ☐ |

**Section 3 gate:** Keyboard-only pass of shell, forms, modal, and interactive cards.

---

## 4. SCREEN READER SUPPORT

### 4.1 `aria-label` / accessible names on VF components

| Component | Required naming | Status |
|-----------|-----------------|--------|
| `VFButton` | Visible text **or** `aria-label` (icon-only) | ☐ |
| `VFCard` | If interactive: accessible name; if region: `aria-labelledby` | ☐ |
| `VFPanel` | `aria-labelledby` heading id | ☐ |
| `VFModal` | `aria-labelledby` / `aria-describedby` | ⚠ |
| `VFInput` | Visible `<label>` preferred | ☐ |
| `VFTag` / `VFStatusIndicator` | Text or `aria-label` for status | ☐ |
| `VFProgressBar` | `aria-label` + valuemin/now/max | ⚠ |
| `VFToast` | `role="status"` + dismiss label | ⚠ |
| `VFChart` | Text summary / table alternative; canvas `aria-hidden` if decorative | ☐ |
| Icon-only controls | `aria-label` required | ☐ |

### 4.2 `aria-live` on alerts

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| SR1 | Critical alerts | `role="alert"` **or** `aria-live="assertive"` | ⚠ (`VFAlert` has `role="alert"`) |
| SR2 | Toasts / non-critical | `role="status"` / `aria-live="polite"` | ⚠ |
| SR3 | Do not spam live regions | Batch updates; avoid pulsing live text | ☐ |
| SR4 | Alert text includes severity | e.g. “Critical: …” not color alone | ☐ |

### 4.3 `aria-expanded` on panels

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| SR5 | Collapsible `VFPanel` | Toggle control has `aria-expanded={bool}` | ☐ |
| SR6 | `aria-controls` points at panel id | ☐ |
| SR7 | Sidebar groups / disclosure nav | Same pattern | ☐ |

### 4.4 `aria-current` on active routes

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| SR8 | Active sidebar / bottom-nav link | `aria-current="page"` | ☐ |
| SR9 | Do not rely on red underline alone | SR + visual accent | ☐ |
| SR10 | Critical routes | Visual pulse/accent + clear page title; not SR-only | ☐ |

**Section 4 gate:** Names, lives, expanded, and current all verified with NVDA/VoiceOver.

---

## 5. ICON ACCESSIBILITY

**Source:** `src/icons/veriforge-icons.ts` — `IndustrialIconShell` already supports `title` / `aria-label` and defaults decorative to `aria-hidden` (⚠ enforce call-site usage).

### 5.1 Accessible titles on all icons

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| I1 | Meaningful icons pass `title` or `aria-label` | `role="img"` + `<title>` | ☐ |
| I2 | Category defaults | e.g. `TrainingIcon` default title “Training” when informative | ☐ |
| I3 | Catalog / Story usage documents a11y props | ☐ |

### 5.2 Text alternatives for critical icons

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| I4 | Critical / emergency / incident icons | Adjacent visible text **or** `aria-label` including severity | ☐ |
| I5 | Status dots | Never color-only — text “Critical”, “OK”, etc. | ☐ |
| I6 | Chart / KPI icons | Label matches metric name | ☐ |

### 5.3 Hidden labels for decorative icons

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| I7 | Decorative | `aria-hidden="true"` and no `title` | ⚠ (default in shell) |
| I8 | Adjacent text present | Icon + “Training” text → icon decorative | ☐ |
| I9 | Do not double-speak | Avoid both `title` and visible duplicate without `aria-hidden` on one | ☐ |

**Pattern**

```tsx
// Informative
<IncidentsIcon title="Incidents" tone="critical" />

// Decorative beside text
<span>
  <TrainingIcon aria-hidden />
  Training
</span>
```

**Section 5 gate:** No silent meaningful icons; no noisy decorative icons.

---

## 6. LAYOUT ACCESSIBILITY

### 6.1 Angular geometry must not hinder readability

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| L1 | `border-radius: 0` OK | Does not reduce target size or clip focus rings | ☐ |
| L2 | Focus ring offset | `outline-offset: 2px` so square corners don’t hide outline | ☐ |
| L3 | Clip-path / bevel | Must not clip text or focus | ☐ |
| L4 | Line length | Comfortable measure in `VFContent` (avoid full-bleed paragraphs) | ☐ |

### 6.2 Metallic gradients must not obscure text

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| L5 | Text on solid or high-contrast scrim | Prefer iron-black fill under text; gradient on chrome/headers | ☐ |
| L6 | No text directly on busy metal without overlay | `background-color: #0D0D0D` behind copy | ☐ |
| L7 | Placeholder / skeleton | Steel border + iron fill; not low-contrast gradient text | ☐ |

### 6.3 Red accents must not replace essential information

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| L8 | Critical = color + text (+ icon) | “Critical”, badge, or count | ☐ |
| L9 | Active route = underline/border + `aria-current` | Not red alone | ☐ |
| L10 | Errors = message text + `aria-invalid` | Not red border alone | ☐ |
| L11 | Charts | Pattern/label in addition to red series color | ☐ |

**Section 6 gate:** Readable type on metal; meaning not color-only; focus visible on angular chrome.

---

## 7. MOBILE ACCESSIBILITY

**Surface:** `src/mobile/` · `/veriforge/mobile/*`  
**Debug:** `vf-debug-mobile` / `.debug-mobile-hitbox` (see THEME-DEBUG-TOOLKIT)

### 7.1 Tap targets ≥ 44×44 CSS px

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| MB1 | Bottom nav items | min 44×44 | ☐ |
| MB2 | Icon buttons | padding / `min-width` / `min-height` | ☐ |
| MB3 | Debug: steel = OK, red = too small | Toolkit hitbox classes | ☐ |
| MB4 | Spacing between targets | ≥ 8px where possible | ☐ |

### 7.2 Haptic feedback for critical actions

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| MB5 | Critical confirm (incident submit, emergency) | `navigator.vibrate?.(10)` or platform API when available | ☐ |
| MB6 | Never haptics-only | Always visual + SR confirmation | ☐ |
| MB7 | Respect OS / reduced motion | Skip vibrate if reduce or user setting off | ☐ |
| MB8 | Progressive enhancement | No-op on unsupported browsers | ☐ |

```ts
export function vfCriticalHaptic() {
  if (typeof navigator === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate?.(12);
}
```

### 7.3 VoiceOver / TalkBack labels on mobile components

| # | Requirement | Pass criteria | Status |
|---|-------------|---------------|--------|
| MB9 | `VFMobileNav` items | Accessible name + `aria-current` | ☐ |
| MB10 | Mobile cards / panels / modals | Same SR rules as desktop (§4) | ☐ |
| MB11 | Splash / emblem | Decorative `aria-hidden` or labelled brand | ☐ |
| MB12 | Form fields | Visible labels; large tap on label | ☐ |

**Section 7 gate:** 44px targets; optional haptics; VoiceOver pass on mobile shell.

---

## 8. COMPLIANCE CHECKLIST

### 8.1 WCAG 2.1 AA

| Criterion (representative) | VeriForge mapping | Status |
|----------------------------|-------------------|--------|
| 1.1.1 Non-text content | Icon titles / alt / decorative hidden | ☐ |
| 1.3.1 Info & relationships | Headings, labels, tables, `aria-*` | ☐ |
| 1.4.1 Use of color | Red ≠ sole meaning | ☐ |
| 1.4.3 Contrast (AA) | White text; red/steel rules in §1 | ☐ |
| 1.4.11 Non-text contrast | Focus / borders ≥3:1 where required | ☐ |
| 1.4.13 Content on hover/focus | Dismissable, hoverable, persistent | ☐ |
| 2.1.1 Keyboard | §3 | ☐ |
| 2.1.2 No keyboard trap | Modal trap only while open | ☐ |
| 2.2.2 Pause/stop/hide | Pulse disabled under reduce | ☐ |
| 2.4.3 Focus order | Logical shell → content | ☐ |
| 2.4.7 Focus visible | Red accent outline | ☐ |
| 2.5.5 Target size (AAA ideal / best practice 44px) | Mobile §7 | ☐ |
| 3.2.1 On focus | No unexpected context change | ☐ |
| 3.3.1 / 3.3.2 Errors & labels | `VFInput` errors + labels | ☐ |
| 4.1.2 Name, Role, Value | VF components | ☐ |
| 4.1.3 Status messages | `aria-live` / `role="alert"` | ☐ |

### 8.2 Keyboard-only navigation

| Check | Status |
|-------|--------|
| Complete critical user journeys without mouse (login → dashboard → incident → modal) | ☐ |
| Skip link works | ☐ |
| Focus never lost; restore after modal | ☐ |
| Custom widgets match button/link/dialog patterns | ☐ |

### 8.3 Reduced-motion support

| Check | Status |
|-------|--------|
| `prefers-reduced-motion: reduce` disables angularSlide | ☐ |
| metallicFade → instant opacity | ☐ |
| redGlowPulse → static red accent | ☐ |
| industrialDrop / bevelShift instant | ☐ |
| Charts: prefer final state, no long draw | ☐ |

### 8.4 High-contrast / forced-colors support

| Check | Status |
|-------|--------|
| Text remains visible in Windows High Contrast | ☐ |
| Focus uses `Highlight` / thickened ring under `forced-colors` | ☐ |
| AA fallback tokens applied under `prefers-contrast: more` | ☐ |
| Metallic gradient not required for meaning | ☐ |

### 8.5 Screen reader compatibility

| Check | Tool | Status |
|-------|------|--------|
| Landmark structure (`banner`, `navigation`, `main`, `contentinfo`) | NVDA / VO | ☐ |
| Active route announced (`aria-current`) | | ☐ |
| Alerts announced (`role="alert"` / live) | | ☐ |
| Modal name + focus trap | | ☐ |
| Charts have text alternative | | ☐ |
| Mobile VoiceOver / TalkBack pass | | ☐ |

---

## Implementation priority

| Priority | Work | Why |
|----------|------|-----|
| P0 | §1 text/contrast rules + §2 reduced-motion completion + §3 modal/button/input | Legal AA blockers |
| P1 | §4 aria-current / live / expanded + §5 icon titles | SR parity |
| P2 | §6 gradient/text + §7 44px + haptics | Mobile + readability |
| P3 | Forced-colors tokens + automated axe/playwright checks | Hardening |

---

## Suggested automation

```bash
# Manual + existing gates
cd vera-frontend
npm run lint
npm run typecheck

# Future (recommended)
# npx axe on /veriforge/dashboard, /incidents, /mobile/dashboard
# Playwright: keyboard modal Escape, Tab order, aria-current
```

**Axe / Playwright assertions (target)**

- `border-radius` irrelevant to a11y; assert focus outline contrast
- `aria-current="page"` on active nav
- Modal: Escape closes; focus returns
- `prefers-reduced-motion`: no `redGlowPulse` animation
- Contrast: sample computed colors for body text ≥ 4.5:1

---

## Sign-off

| Gate | Owner | Date | Result |
|------|-------|------|--------|
| §1 Color contrast | | | ☐ / ☑ |
| §2 Motion a11y | | | ☐ / ☑ |
| §3 Keyboard | | | ☐ / ☑ |
| §4 Screen reader | | | ☐ / ☑ |
| §5 Icons | | | ☐ / ☑ |
| §6 Layout | | | ☐ / ☑ |
| §7 Mobile | | | ☐ / ☑ |
| §8 Compliance checklist | | | ☐ / ☑ |
| WCAG 2.1 AA | | | ☐ / ☑ |

**Release rule:** Do not ship VeriForge UI as “accessible” until §8 gates are ☑. Brand identity must not override contrast, keyboard, or reduced-motion requirements — use AA fallbacks instead of lowering standards.

---

## Final goal

Provide a complete accessibility compliance system ensuring the forged-metal VeriForge identity is **fully accessible, inclusive, and WCAG-compliant** — iron black, steel grey, forge red, and metallic chrome included, without excluding keyboard, screen-reader, motion-sensitive, or low-vision users.
