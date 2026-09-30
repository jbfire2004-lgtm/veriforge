# VeriForge Forged-Metal Tokens

Canonical design tokens live at `vera-frontend/src/theme/veriforge-tokens.ts`.

## Colors

| Token | Value |
|-------|-------|
| forgeRed | `#C62828` |
| ironBlack | `#0D0D0D` |
| steelGrey | `#424242` |
| safetyWhite | `#FAFAFA` |
| metallicGradient | `linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)` |

## Geometry

| Token | Value |
|-------|-------|
| angularRadius | `0px` |
| bevelEdge | `6px` |
| cardBevel | `polygon(0 0, 100% 0, 100% 100%, 0 100%)` |

## Typography

| Token | Value |
|-------|-------|
| headingFont | `"Orbitron", sans-serif` |
| bodyFont | `"Exo 2", sans-serif` |
| headingWeight | `700` |
| bodyWeight | `400` |

## Spacing

`xs` 4px · `sm` 8px · `md` 16px · `lg` 24px · `xl` 32px

## Shadows

| Token | Value |
|-------|-------|
| metallicShadow | `0px 0px 12px rgba(198,40,40,0.35)` |
| steelShadow | `0px 0px 8px rgba(255,255,255,0.08)` |

## Borders

| Token | Value |
|-------|-------|
| redAccentBorder | `2px solid #C62828` |
| steelBorder | `1px solid #424242` |

## Wiring

- CSS vars: `components/veriforge/tokens.css` (imported via `app/globals.css`)
- Facade: `components/veriforge/tokens.ts` re-exports + motion/iconography extensions
- Theme helpers: `components/veriforge/theme.tsx`
