# Layout Rules

Layouts: `vera-frontend/src/layouts/`  
Mobile: `vera-frontend/src/mobile/`

## VFAppShell required

Authenticated VeriForge product pages use **`VFAppShell` / `VeriForgeAppShell`**.

| Required | Forbidden |
|----------|-----------|
| VeriForge header + sidebar + content | Vera `WorkspaceShell` / `GlobalNav` |
| Nav from `veriforge-routes.ts` | Ad-hoc module sidebars for Vera nav |
| Forged-metal chrome | Soft marketing shells on app routes |

Exceptions: auth screens, tenant login, docs shell (`/veriforge/docs`), mobile shell — still forged-metal, still angular.

---

## Header — metallic gradient

| Rule | Spec |
|------|------|
| Background | Metallic gradient plate |
| Accent | 2px forge-red line under header (or brand underline) |
| Type | Orbitron product mark |
| Geometry | Angular; steel bottom border |
| Actions | VFButton / angular icon buttons; red on active |

Component: `VFHeader`

---

## Sidebar — steel-grey + red accent

| Rule | Spec |
|------|------|
| Surface | Iron black / steel chrome |
| Idle links | safetyWhite; steel hover frame |
| Active | Forge-red accent underline/border + optional glow |
| Motion | `bevelShift` on hover/focus |
| Critical routes | May pulse when active/critical — labeled |
| A11y | `aria-current="page"` on active |
| Position | Fixed/sticky; transform for collapse — don’t animate width every frame |

Component: `VFSidebar`

---

## Content — black background

| Rule | Spec |
|------|------|
| Ground | `#0D0D0D` (`ironBlack`) |
| Wash | Optional metallic gradient at shell level — content readable |
| Panels | Steel-bordered VFPanel / VFCard |
| Titles | Orbitron + red underline |
| Grid | Angular 8/16 rhythm; dashboard CSS grid |

Component: `VFContent`

---

## Footer — angular geometry

| Rule | Spec |
|------|------|
| Geometry | Square; steel rules |
| Type | Exo 2 meta links |
| Color | Iron / steel; no soft footer blobs |
| Optional | Grid of angular link columns |

Component: `VFFooter`

---

## Shell anatomy

```
┌─────────────────────────────────────────────┐
│ HEADER (metallic + red accent line)         │
├──────────┬──────────────────────────────────┤
│ SIDEBAR  │ CONTENT (iron black)             │
│ steel    │  ┌ steel panel ┐ ┌ card ┐        │
│ hover    │  └─────────────┘ └──────┘        │
│ red      │                                  │
│ active   │                                  │
├──────────┴──────────────────────────────────┤
│ FOOTER (angular)                            │
└─────────────────────────────────────────────┘
```

## Mobile layout

- Bottom nav; active tab forge-red glow  
- Tap targets ≥ 44×44  
- Lighter motion (prefer metallicFade)  
- Same palette and zero radius  

## Routing chrome

- Major transitions: angularSlide + metallicFade  
- Critical paths: redGlowPulse per allowlist  
- Docs: dedicated docs shell — still brand-locked  

## Checklist

- [ ] Correct shell for surface type  
- [ ] Header metallic · sidebar steel/red · content iron · footer angular  
- [ ] No Vera global nav  
- [ ] Active route has red accent + `aria-current`  
