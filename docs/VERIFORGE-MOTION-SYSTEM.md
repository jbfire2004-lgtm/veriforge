# VeriForge Forged-Metal Motion System

Canonical motion module: `vera-frontend/src/motion/veriforge-motion.ts`  
Stylesheet: `vera-frontend/src/motion/veriforge-motion.css` (imported via `app/globals.css`)

## Timing

| Weight | Duration |
|--------|----------|
| fast | `120ms` |
| medium | `240ms` |
| heavy | `400ms` |

## Primitives

| Primitive | Class | Use |
|-----------|-------|-----|
| `angularSlide` | `vf-m-angular-slide` | Panel open, chart line |
| `metallicFade` | `vf-m-metallic-fade` | Surface settle |
| `redGlowPulse` | `vf-m-red-glow-pulse` | Active / critical |
| `bevelShift` | `vf-m-bevel-shift` | Metallic edge sweep |
| `industrialDrop` | `vf-m-industrial-drop` | Modal drop-in |

## Component applications

| Target | States | Classes |
|--------|--------|---------|
| Buttons | hover, press | `vf-m-btn`, `vf-m-btn-hover`, `vf-m-btn-press` |
| Cards | hover, active | `vf-m-card`, `vf-m-card-hover`, `vf-m-card-active` |
| Panels | open, close | `vf-m-panel-open`, `vf-m-panel-close` |
| Modals | drop-in, collapse | `vf-m-modal-drop-in`, `vf-m-modal-collapse` |
| Workflow | activation, error | `vf-m-node-activate`, `vf-m-node-error` |
| Charts | line draw, bar rise | `vf-m-chart-line`, `vf-m-chart-bar` |

## Import

```ts
import {
  veriforgeMotion,
  veriforgeMotionClasses,
  VERIFORGE_MOTION_TIMING,
} from "@/src/motion/veriforge-motion";
```

Integrated into `VFButton`, `VFCard`, `VFPanel`, `VFModal`, `VFProgressBar`, `VFWorkflowNode`, and `VFChart`.
