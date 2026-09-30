# Motion Rules

Source: `vera-frontend/src/motion/veriforge-motion.ts` + `veriforge-motion.css`

## Timing

| Weight | Duration | Use |
|--------|----------|-----|
| **Fast** | **120ms** | Press, bevel micro, hover chrome |
| **Medium** | **240ms** | angularSlide, metallicFade, most transitions |
| **Heavy** | **400ms** | industrialDrop, large settles |

Easing: angular `cubic-bezier(0.2, 0, 0, 1)` · industrial `cubic-bezier(0.33, 0, 0.2, 1)`

## Primitives

### angularSlide

- Skewed horizontal forge slide with hard settle  
- Class: `vf-m-angular-slide`  
- **When:** major route / section transitions  
- **GPU:** `transform` + `opacity`  
- **Not for:** every card, filter chips, query-only updates  

### metallicFade

- Steel brightness fade into iron surface  
- Class: `vf-m-metallic-fade`  
- **When:** content load, secondary reveals  
- Prefer opacity; avoid blur filters on large regions  

### industrialDrop

- Modal / overlay drop-in  
- Class: `vf-m-industrial-drop`  
- **When:** `VFModal` open only — never full-page shells  
- Pair with angular collapse on close  

### redGlowPulse

- Forge-red glow pulse  
- Class: `vf-m-red-glow-pulse`  
- **When:** critical states/routes **only**  
- Allowlist: compliance · incidents · risk · emergency · command-center · predictive  
- Cap concurrent pulses; pair with text labels  

### bevelShift

- Edge / bevel shift for nav chrome  
- Class: `vf-m-bevel-shift`  
- **When:** sidebar hover/focus  
- Mobile: optional; prefer lighter motion  

## Composition rules

1. Route change → angularSlide **+** metallicFade on content wrapper  
2. Isolate motion on wrappers — do not animate entire dashboard trees  
3. Prefer compositor properties (`transform`, `opacity`)  
4. No soft Material bounce as brand motion  
5. Honor `prefers-reduced-motion: reduce`:  
   - Disable angularSlide / industrialDrop / bevelShift animations  
   - metallicFade → instant opacity 1  
   - redGlowPulse → static red accent border  

## Debug

| Outline | Primitive |
|---------|-----------|
| Blue | angularSlide |
| Grey | metallicFade |
| Yellow | industrialDrop |
| Red | redGlowPulse |

`document.documentElement.classList.add('vf-debug-motion')`

## Anti-patterns

- Infinite pulse on non-critical KPIs  
- Long fades (>400ms) on primary navigation  
- Animating `height` / `top` / `margin` for brand transitions  
- Parallax / playful spring physics  
