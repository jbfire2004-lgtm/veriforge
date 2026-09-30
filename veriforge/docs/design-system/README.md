# Design System

Forged-metal design tokens — single source of truth:  
`vera-frontend/src/theme/veriforge-tokens.ts`

## Colors

| Token | Hex | Role |
|-------|-----|------|
| `forgeRed` | `#C62828` | Active, critical, focus, accent lines |
| `ironBlack` | `#0D0D0D` | Shell / panel background |
| `steelGrey` | `#424242` | Borders, hover chrome, neutral structure |
| `safetyWhite` | `#FAFAFA` | Primary text / icons on dark |

**A11y:** Body text on dark must be `safetyWhite` (18.62:1 AAA). Do not use `steelGrey` as text on `ironBlack`. `forgeRed` on black is accent/large-text only (3.46:1). See `ACCESSIBILITY-SYSTEM.md`.

CSS vars:

```css
--vf-color-forge-red
--vf-color-iron-black
--vf-color-steel-grey
--vf-color-safety-white
```

## Typography

| Role | Font | Weight |
|------|------|--------|
| Headings | **Orbitron** | 700 |
| Body | **Exo 2** | 400 |

- Headings: uppercase, forge-red underline accent
- Body: safety white on iron black
- Loaded via `next/font` in root layout

```ts
TYPOGRAPHY.headingFont // '"Orbitron", sans-serif'
TYPOGRAPHY.bodyFont    // '"Exo 2", sans-serif'
```

## Geometry

| Token | Value | Use |
|-------|-------|-----|
| `angularRadius` | `0px` | All corners |
| `bevelEdge` | `6px` | Bevel / press offset |
| `cardBevel` | square polygon | Clip / card silhouette |

**Rule:** Any `border-radius` ≠ 0 is an error. Debug with `.debug-angular` / `vf:debug:angular`.

## Gradients

```ts
metallicGradient:
  "linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)"
```

Prefer CSS variable:

```css
background-image: var(--vf-effect-metallic-gradient);
```

Use on shell wash, KPI headers, modal chrome — not as sole text backdrop without a solid scrim.

## Shadows & borders

| Token | Value |
|-------|-------|
| `metallicShadow` | `0px 0px 12px rgba(198,40,40,0.35)` |
| `steelShadow` | `0px 0px 8px rgba(255,255,255,0.08)` |
| `redAccentBorder` | `2px solid #C62828` |
| `steelBorder` | `1px solid #424242` |

## Spacing

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |

## Import

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
```
