# Component Rules

Library: `vera-frontend/src/components/veriforge/`  
Import from `@/src/components/veriforge`.

**Shared laws:** angular geometry · steel idle · red active/focus · CSS modules · token-driven color · motion classes from the motion system.

---

## VFButton — red glow, angular press

| State | Rule |
|-------|------|
| Default | Angular; metallic/steel surface; Orbitron/Exo label |
| Hover | Steel shift — no radius morph |
| Press | Angular press (bevelEdge language); hard settle ≤ fast/medium |
| Active | Forge-red emphasis; may use `redGlowPulse` when `active` |
| Focus | Red outline / glow (`:focus-visible`) |
| Disabled | Dimmed; no red glow; not activatable |
| Keyboard | Enter + Space |

Variants: `primary` | `secondary` | `destructive` | `ghost`  
Sizes: `sm` | `md` | `lg`

---

## VFCard — metallic shadow, angular lift

| State | Rule |
|-------|------|
| Default | Square; `steelBorder`; iron/metallic fill |
| Hover | Angular lift; `metallicShadow` or `steelShadow` |
| Selected / critical | `redAccentBorder` |
| Content | safetyWhite text; no soft inner pills |

Do not nest rounded children that break the silhouette.

---

## VFPanel — steel-grey, angular slide

| State | Rule |
|-------|------|
| Chrome | Steel border; iron-black / metallic interior |
| Enter | `angularSlide` and/or `metallicFade` on mount wrappers |
| Collapsible | `aria-expanded` + labeled control |
| Title | Orbitron + red underline accent |

---

## VFModal — industrialDrop

| State | Rule |
|-------|------|
| Open | `industrialDrop` on dialog panel |
| Close | Angular collapse — no soft bounce-out |
| Chrome | Metallic / steel frame; square |
| A11y | `role="dialog"` · `aria-modal` · Escape · focus trap · restore focus |
| Scope | Modal-sized layers only — never page-root drop |

---

## VFInput — red glow focus

| State | Rule |
|-------|------|
| Idle | Steel-grey border; angular; safetyWhite value text |
| Focus | Forge-red glow / border |
| Error | Red treatment + **text** message + `aria-invalid` |
| Disabled | Muted steel; no glow |
| Label | Visible label required (Exo 2) |

---

## Also governed by this bible

| Component | Brand note |
|-----------|------------|
| `VFAlert` | Severity text + role; critical ≠ color only |
| `VFTable` | Steel grid; red on selected/critical rows sparingly |
| `VFProgressBar` | Steel track · red fill · labeled |
| `VFStatusIndicator` | Dot + **text** label |
| `VFToast` | Status/alert roles; dismiss labeled |
| `VFChart` | Angular frame; labeled series |

## Implementation checklist

- [ ] Uses VF* before one-off chrome  
- [ ] Tokens from `veriforge-tokens` / CSS vars  
- [ ] Zero radius  
- [ ] Motion primitive matches chapter rules  
- [ ] Focus and keyboard paths intact  
