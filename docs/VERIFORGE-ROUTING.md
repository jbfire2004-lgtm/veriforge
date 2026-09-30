# VeriForge Forged-Metal Routing Layer

Canonical route system for the Next.js App Router:

- Registry: `vera-frontend/src/router/veriforge-routes.ts`
- Transitions: `vera-frontend/src/router/VFRouteTransition.tsx`
- Provider: `vera-frontend/src/router/VFRouteProvider.tsx`
- App routes helper: `vera-frontend/src/app/routes/`

## Route metadata

Every route declares:

| Field | Purpose |
|-------|---------|
| `title` | Orbitron nav / content heading |
| `section` | brand · operations · intelligence · enterprise · system · external |
| `icon` | Category from `veriforge-icons.ts` |
| `critical` | Enables `redGlowPulse` on chrome + transition |

Critical routes include: **Compliance**, **Incidents**, **Risk**, **Emergency**, **Command**, **Predictive AI**.

## Shell injection

`VFAppShell` wraps all main VeriForge pages via `VeriForgeAppShell`:

1. `VFHeader` — metallic gradient · bevelShift menu · red underline active
2. `VFSidebar` — steel-grey · industrialDrop open · red accent rail · icons
3. `VFContent` + `VFRouteTransition` — black surface · angularSlide + metallicFade
4. Critical pages add `redGlowPulse`

## Motion map

| Interaction | Primitive |
|-------------|-----------|
| Route change | `angularSlide` |
| Content load | `metallicFade` |
| Critical page | `redGlowPulse` |
| Sidebar open | `industrialDrop` |
| Header menu | `bevelShift` |

## Active route styling

- Red accent underline / inset rail `#C62828`
- Steel-grey hover `#424242`
- Angular geometry (`border-radius: 0`)

## Usage

```ts
import {
  VERIFORGE_ROUTES,
  resolveVeriForgeRoute,
  useVFRoute,
  VFRouteTransition,
} from "@/src/router";
```

Main layout (`app/veriforge/(main)/layout.tsx`) builds nav from `VERIFORGE_ROUTES`.
