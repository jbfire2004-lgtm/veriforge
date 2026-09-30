# Motion Documentation

Industrial motion system: `vera-frontend/src/motion/veriforge-motion.ts` + `veriforge-motion.css`

## Timing

| Weight | Duration |
|--------|----------|
| fast | **120ms** |
| medium | **240ms** |
| heavy | **400ms** |

Easing: angular `cubic-bezier(0.2, 0, 0, 1)` · industrial `cubic-bezier(0.33, 0, 0.2, 1)`

## Primitives

### angularSlide

Skewed horizontal forge slide with hard settle.  
**Class:** `vf-m-angular-slide`  
**Use:** Major route transitions  
**GPU:** `transform` + `opacity`  
**Reduced motion:** disabled (instant final position)

### metallicFade

Steel brightness fade into iron-black surface.  
**Class:** `vf-m-metallic-fade`  
**Use:** Content load / secondary transitions  
**GPU:** primarily `opacity`  
**Reduced motion:** instant `opacity: 1`

### industrialDrop

Modal / overlay drop-in with light skew settle.  
**Class:** `vf-m-industrial-drop` / modal drop-in  
**Use:** `VFModal` open only — never full-page  
**GPU:** `translateY` + `opacity` (+ optional scale)

### redGlowPulse

Forge-red glow pulse.  
**Class:** `vf-m-red-glow-pulse`  
**Use:** **Critical states only** (compliance, incidents, risk, emergency, command-center, predictive)  
**Reduced motion:** static red accent border — no pulse

### bevelShift

Bevel / edge shift for nav chrome.  
**Class:** `vf-m-bevel-shift`  
**Use:** Sidebar hover / focus  
**Mobile:** optional; prefer lighter motion

## Usage

```tsx
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";

<section className={veriforgeMotionClasses.primitives.angularSlide}>
  <div className={veriforgeMotionClasses.primitives.metallicFade}>
    …
  </div>
</section>
```

Route wrapper: `VFRouteTransition` applies angularSlide + metallicFade; critical routes add redGlowPulse.

## Debug

| Outline | Primitive |
|---------|-----------|
| Blue | angularSlide |
| Grey | metallicFade |
| Yellow | industrialDrop |
| Red | redGlowPulse |

Enable: `document.documentElement.classList.add('vf-debug-motion')`  
See `THEME-DEBUG-TOOLKIT.md` · `PERFORMANCE-PACK.md` §2 · `ACCESSIBILITY-SYSTEM.md` §2
