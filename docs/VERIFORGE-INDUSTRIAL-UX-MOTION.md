# VeriForge Industrial UX Motion System

Angular, metallic, red-accented motion for the forged-metal identity.

## Principles

- Angular movement
- Metallic transitions
- Red glow activation
- Heavy industrial weight
- Precision timing

## Timing

| Weight | Duration | Use |
|--------|----------|-----|
| Fast | 120–180ms (`--vf-motion-fast` = 150ms) | Hover, press, node activate |
| Medium | 240–320ms (`--vf-motion-medium` = 280ms) | Panel slide, card lift, notif drop |
| Heavy | 400–600ms (`--vf-motion-heavy` = 500ms) | Logo expand, chart draw/rise |

### Easing

- Angular: `cubic-bezier(0.2, 0, 0, 1)` → `--vf-ease-angular`
- Industrial: `cubic-bezier(0.33, 0, 0.2, 1)` → `--vf-ease-industrial`
- Rebound: `cubic-bezier(0.34, 1.2, 0.64, 1)` → `--vf-ease-rebound`

## Interaction rules

| Signal | Meaning |
|--------|---------|
| Red glow | Active or critical |
| Metallic fade | Neutral |
| Angular movement | Intentional action |

## Components & CSS classes

| Component | Classes |
|-----------|---------|
| Logo | `vf-motion-logo`, `vf-motion-logo-glow`, `vf-motion-logo-shine` |
| Button | `vf-motion-btn`, `vf-motion-btn-rebound` |
| Panel | `vf-motion-panel`, `vf-motion-accent-line` |
| Card | `vf-motion-card`, `vf-motion-card-active` |
| Workflow | `vf-motion-node`, `vf-motion-connector` |
| Notification | `vf-motion-notif`, `vf-motion-notif-critical`, `vf-motion-notif-out` |
| Chart | `vf-motion-line`, `vf-motion-bar`, `vf-motion-kpi-pulse` |

Defined in `vera-frontend/components/veriforge/tokens.css` with `prefers-reduced-motion` support.

## Console & API

- UI: `/veriforge/motion`
- API: `/veriforge/motion`
- Sync: `veriforge.motion.analytics`

## Tokens

`veriforgeTokens.motion` in `components/veriforge/tokens.ts` + CSS vars in `tokens.css`.
