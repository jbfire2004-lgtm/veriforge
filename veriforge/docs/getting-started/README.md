# Getting Started

Install and activate the forged-metal VeriForge identity in the Vera monorepo.

## Prerequisites

- Node.js 20+
- npm
- Repo root: `C:\Vera` (or your clone path)

## 1. Install

```bash
# From monorepo root
cd vera-frontend
npm install

# Backend (API)
cd ../backend
npm install
```

## 2. Run locally

```bash
# Terminal A — API
cd backend
npm run start:dev

# Terminal B — UI
cd vera-frontend
npm run dev
```

Open:

| Surface | URL |
|---------|-----|
| VeriForge home | `/veriforge` |
| Dashboard | `/veriforge/dashboard` |
| Docs UI | `/veriforge/docs` |
| Mobile | `/veriforge/mobile` |

## 3. Theme activation

Tokens live in `vera-frontend/src/theme/veriforge-tokens.ts`.

| Token | Value |
|-------|-------|
| `forgeRed` | `#C62828` |
| `ironBlack` | `#0D0D0D` |
| `steelGrey` | `#424242` |
| `safetyWhite` | `#FAFAFA` |
| `metallicGradient` | `linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)` |
| Geometry | `border-radius: 0` |

Wire order (already in app):

1. `app/globals.css` imports `src/styles/global.css`
2. Imports `src/motion/veriforge-motion.css`
3. Imports `src/theme/veriforge-debug.css` (inert until `vf-debug`)
4. Root layout loads **Orbitron** + **Exo 2** via `next/font`

Verify: shell background is iron-black with metallic wash; headings use Orbitron with red underline; no rounded corners.

## 4. Component usage

```tsx
import {
  VFButton,
  VFCard,
  VFPanel,
  VFInput,
  VFModal,
} from "@/src/components/veriforge";

export function Example() {
  return (
    <VFPanel title="Forge panel">
      <VFCard>
        <VFInput label="Badge ID" name="badge" />
        <VFButton variant="primary">Commit</VFButton>
      </VFCard>
    </VFPanel>
  );
}
```

Shell: wrap authenticated pages in `VFAppShell` / `VeriForgeAppShell` — **not** Vera unified nav.

## 5. Motion system setup

```tsx
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";

<div className={veriforgeMotionClasses.primitives.angularSlide}>
  <div className={veriforgeMotionClasses.primitives.metallicFade}>
    Content
  </div>
</div>
```

| Primitive | Class | Timing |
|-----------|-------|--------|
| `angularSlide` | `vf-m-angular-slide` | 240ms |
| `metallicFade` | `vf-m-metallic-fade` | 240ms |
| `industrialDrop` | `vf-m-industrial-drop` | heavy / modal |
| `redGlowPulse` | `vf-m-red-glow-pulse` | critical only |
| `bevelShift` | `vf-m-bevel-shift` | sidebar |

CSS: `src/motion/veriforge-motion.css` (respects `prefers-reduced-motion`).

## 6. Next steps

- [Design System](../design-system/) — tokens in depth  
- [Components](../components/) — full VF library  
- [Architecture](../architecture/) — shells, routing, tenancy  
- [API](../api/) — REST + tenant meta  

## Checklist

- [ ] `npm install` (frontend + backend)
- [ ] Dev servers running
- [ ] `/veriforge/dashboard` shows forged-metal shell
- [ ] No rounded corners (`vf-debug-angular` clean)
- [ ] Motion classes available
- [ ] Docs UI at `/veriforge/docs`
