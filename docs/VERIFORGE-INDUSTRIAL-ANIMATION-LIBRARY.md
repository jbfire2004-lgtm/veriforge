# VeriForge Industrial Animation Library

Angular, metallic, red-accented motion primitives and component animations for the forged-metal identity.

## Principles

- Angular movement (no curves)
- Metallic transitions (steel, iron, forged metal)
- Red glow activation (`#C62828`)
- Heavy industrial weight
- Precision timing (120–600ms)

## Motion primitives

| Primitive | CSS class | Use |
|-----------|-----------|-----|
| Angular Slide | `vf-anim-angular-slide` | Linear directional enter |
| Metallic Fade | `vf-anim-metallic-fade` | Steel → black fade |
| Red Glow Pulse | `vf-anim-red-glow-pulse` | Critical activation |
| Bevel Shift | `vf-anim-bevel-shift` | Edge highlight sweep |
| Industrial Drop | `vf-anim-industrial-drop` | Heavy downward settle |

## Component animations

| Component | Classes |
|-----------|---------|
| Buttons | `vf-anim-btn`, `vf-anim-btn-hover`, `vf-anim-btn-press`, `vf-anim-btn-rebound` |
| Cards | `vf-anim-card`, `vf-anim-card-lift`, `vf-anim-card-active`, `vf-anim-card-dismiss` |
| Panels | `vf-anim-panel-in`, `vf-anim-panel-expand`, `vf-anim-panel-accent` |
| Modals | `vf-anim-modal-open`, `vf-anim-modal-close` |
| Workflow | `vf-anim-node-activate`, `vf-anim-connector-draw`, `vf-anim-node-error` |
| Charts | `vf-anim-chart-line`, `vf-anim-chart-bar`, `vf-anim-kpi-pulse` |

## Timing

| Weight | Duration | Use |
|--------|----------|-----|
| Fast | 120–180ms | Buttons, icons |
| Medium | 240–320ms | Cards, panels |
| Heavy | 400–600ms | Modals, workflows, charts |

Easing: `--vf-ease-angular` · `--vf-ease-industrial` · `--vf-ease-rebound`

## Console & API

- UI: `/veriforge/animations`
- API: `/veriforge/animations`
- Sync: `veriforge.animation.analytics`

Defined in `tokens.css` / `tokens.ts` with `prefers-reduced-motion` support. Complements the Industrial UX Motion System (`/veriforge/motion`).
