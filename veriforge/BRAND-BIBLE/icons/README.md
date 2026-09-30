# Iconography Rules

Source: `vera-frontend/src/icons/veriforge-icons.ts`

## Angular geometry

- Square caps · miter joins  
- Hard angles; no soft Material icon language as primary nav marks  
- Emblem-compatible silhouette (forged industrial)  

## Metallic gradients

- Fills via shared SVG gradient defs (`IndustrialIconShell`)  
- Prefer cached/shared gradient IDs for performance  
- Hot metal fills for `active` / `critical` tones  

## Steel-grey outlines

| Tone | Stroke |
|------|--------|
| `neutral` | `steelGrey` `#424242` |
| `active` / `critical` | Hot treatment + forge-red accent corner |
| `contrast` | Bright metal for edge cases |

Idle icons read as steel on iron — not low-contrast grey-on-grey text substitutes.

## Red accents for active states

- Accent corner mark when `tone` is `active` or `critical`, or `accent` prop  
- Critical may add `metallicShadow` drop-shadow  
- Active nav icons: red accent + adjacent label; don’t rely on icon color alone  

## Categories

training · verification · compliance · incidents · equipment · fieldOps · risk · audit · culture · emergency · contractor

## Usage rules

1. Named imports for tree-shaking (`TrainingIcon`, not default dump)  
2. Prefer VeriForge set inside VF shells over Lucide/Material as primary marks  
3. Default size 24; hit target on mobile ≥ 44×44 around the icon  
4. Pair with Orbitron/Exo labels in nav  

## Accessibility

| Case | Rule |
|------|------|
| Informative | `title` or `aria-label` → `role="img"` |
| Decorative beside text | `aria-hidden` · no title |
| Critical | Visible text (“Critical”, “Emergency”) |
| Status | Text label with `VFStatusIndicator` |

## Anti-patterns

- Rounded “friendly” icon packs as VeriForge primary  
- Color-only severity  
- Oversized drop-shadows that muddy the metal  
- Mixing three icon libraries in one sidebar  

## Checklist

- [ ] Angular paths  
- [ ] Metallic fill + steel stroke  
- [ ] Red only for active/critical accent  
- [ ] A11y title/hidden correct  
- [ ] Named import  
