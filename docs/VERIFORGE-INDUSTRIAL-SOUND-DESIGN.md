# VeriForge Industrial Sound Design System

Angular, metallic, industrial-grade audio for the forged-metal identity.

## Principles

- Metallic resonance (steel, iron, forged metal)
- Angular tonality (sharp transients, no soft curves)
- Heavy industrial weight (low-mid emphasis)
- Red-alert urgency for critical events
- Precision timing (short, intentional cues)

## Design rules

| Signal | Treatment |
|--------|-----------|
| Critical / red-alert | Sharp transient + rising metallic pitch |
| Neutral | Steel-grey resonance |
| Success | Warm metallic chime |
| Failure | Angular descending tone |

Uses metallic hits, scrapes, clanks, and resonant tones.

## Categories (21 cues)

| Category | Sounds |
|----------|--------|
| UI Interaction | Button tap, hover shimmer, card lift |
| Workflow | Node ping, connection sweep, error snap+alert |
| Notifications | Critical strike, warning pulse, info tap |
| Verification | forgeCheck pass/fail, compliance expiry |
| Incidents | Impact, emergency siren, muster beacon |
| Equipment | Inspection tick, defect snap, GPS ping |
| Motion | Panel glide, modal thud, chart sweep |

## Engine

Web Audio API synthesis via `playVeriForgeCue(cueId)` in `components/veriforge/sound-design.tsx`.

## Console & API

- UI: `/veriforge/sounds`
- API: `/veriforge/sounds`
- Sync: `veriforge.sounds.analytics`
