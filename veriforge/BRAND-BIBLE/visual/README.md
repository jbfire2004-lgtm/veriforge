# Visual Identity

Canonical tokens: `vera-frontend/src/theme/veriforge-tokens.ts`

## Colors

| Token | Hex | Role |
|-------|-----|------|
| `forgeRed` | `#C62828` | Active, critical, focus, accent lines, CTA heat |
| `ironBlack` | `#0D0D0D` | Shell / page / panel background |
| `steelGrey` | `#424242` | Borders, dividers, idle chrome, hover frames |
| `safetyWhite` | `#FAFAFA` | Primary text and icons on dark |

### Contrast rules (brand + a11y)

| Pair | Ratio | Rule |
|------|-------|------|
| safetyWhite on ironBlack | ~18.6:1 | Default body text (AAA) |
| forgeRed on ironBlack | ~3.5:1 | Accent / large text / UI ≥3:1 only — not small body |
| steelGrey on ironBlack | ~1.9:1 | Borders only — **never** body text |

Fallbacks for AA body-sized critical text: see `ACCESSIBILITY-SYSTEM.md`.

### CSS variables

```css
--vf-color-forge-red: #C62828;
--vf-color-iron-black: #0D0D0D;
--vf-color-steel-grey: #424242;
--vf-color-safety-white: #FAFAFA;
--vf-effect-metallic-gradient: linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%);
```

## Metallic gradients

```
linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)
```

**Use on:** app shell wash, header bars, KPI headers, modal chrome, brand posters, certificate headers, docs section plates.

**Do not:** set long body copy directly on busy metal without an iron-black scrim.

Prefer `var(--vf-effect-metallic-gradient)` / `COLORS.metallicGradient` — do not invent alternate angles or pastel metals.

## Angular shadows

| Token | Value | Use |
|-------|-------|-----|
| `metallicShadow` | `0px 0px 12px rgba(198,40,40,0.35)` | Active / critical / hover lift heat |
| `steelShadow` | `0px 0px 8px rgba(255,255,255,0.08)` | Neutral steel elevation |

Shadows are tight and industrial — not soft multi-layer “card fluff.” No large diffuse black pillows.

## Industrial textures

Allowed texture language:

- Metallic gradient plates  
- Steel hairline rules (1px `#424242`)  
- Forge-red 2px accent rails / underlines  
- Subtle noise **only** if it does not reduce text contrast (prefer clean metal)  

Forbidden texture language:

- Glassmorphism blurs over content  
- Purple nebula / mesh gradients  
- Warm cream paper / broadsheet editorial  
- Soft neumorphism  

## Typography

| Role | Font | Spec |
|------|------|------|
| Headings | **Orbitron** | Weight 700 · uppercase · tracking open · red underline accent |
| Body | **Exo 2** | Weight 400 · safetyWhite on ironBlack |

Loaded via `next/font` in app root. Do not substitute Inter, Roboto, or system UI as primary brand type on VeriForge surfaces.

## Borders

| Token | Value |
|-------|-------|
| `redAccentBorder` | `2px solid #C62828` |
| `steelBorder` | `1px solid #424242` |

Idle = steel. Active / critical / focus = red.

## Spacing rhythm

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |

Align layouts to 8px / 16px angular grid (see geometry chapter).
