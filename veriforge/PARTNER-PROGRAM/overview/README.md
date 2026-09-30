# Program Overview

Industrial partner program for the forged-metal VeriForge platform.

## Mission

Enable resellers, integrators, and API partners to **build, sell, and extend** VeriForge without diluting the industrial identity — so every customer touchpoint remains forged for absolute safety.

## Industrial forged-metal identity

Partners must present VeriForge (and co-branded surfaces) with:

| Element | Spec |
|---------|------|
| Iron black | `#0D0D0D` — grounds, shells, poster fields |
| Steel grey | `#424242` — panels, rules, hover chrome |
| Forge red | `#C62828` — CTAs, active/critical accents, progress |
| Safety white | `#FAFAFA` — primary text on dark |
| Metallic gradient | `linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)` |
| Typography | Orbitron (headings) · Exo 2 (body) |
| Emblem | Forged **V** — angular only |

**Tagline lockup:** Forged for Absolute Safety

## Angular geometry

- `border-radius: 0` on partner portals, course templates, co-branded decks, and embedded UI  
- Hard rules, square badges, bevel accents — no soft SaaS pills  
- Partner-built apps that embed VeriForge chrome must keep angular geometry  

## Metallic gradient headers

- Section headers, partner portal banners, and certification certificates use metallic gradient plates  
- Text on iron-black scrim for readability (see `ACCESSIBILITY-SYSTEM.md`)  

## Red accent lines

- 2px forge-red underlines under Orbitron titles  
- Left rails on callout panels  
- Progress indicators and active nav — not decorative spam  

## Partner portal chrome (target)

When building `/partners/*` or partner-facing microsites:

1. Metallic header bar + red accent line  
2. Angular sidebar (steel hover · red active glow)  
3. Steel content panels on iron black  
4. Docs link to `/veriforge/docs` and this program  

## Non-negotiables

1. No cross-tenant data access — ever  
2. No off-brand purple/cream/rounded “partner skins” on VeriForge product UI  
3. Critical meaning never color-only (pair red with labels)  
4. API integrations follow tenant-aware envelope (`meta.tenantId`, `userId`, `timestamp`)  
5. Certification required before Titanium-tier claims  

## Program structure at a glance

```
Forge Partner  →  Alloy Partner  →  Titanium Partner
   entry              mid                elite
```

See [`../tiers/`](../tiers/) for thresholds and [`../certification/`](../certification/) for credentials.
