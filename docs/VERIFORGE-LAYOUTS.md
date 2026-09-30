# VeriForge Angular Industrial Layouts

Canonical layouts: `vera-frontend/src/layouts/`

## Components

| Layout | Role |
|--------|------|
| `VFAppShell` | Full page shell composing header, sidebar, content, footer |
| `VFHeader` | Orbitron title · red accent underline · primary nav |
| `VFSidebar` | Angular module nav · steel dividers · red active rail |
| `VFContent` | Main scroll region · Exo 2 body · optional section heading |
| `VFFooter` | Metallic footer · mobile nav · red top accent |

## Rules

- Background: `#0D0D0D` + metallic gradient
- Dividers: `#424242`
- Accent lines: `#C62828`
- Angular geometry (`border-radius: 0`)
- Headings: Orbitron · Body: Exo 2

## Import

```ts
import {
  VFAppShell,
  VFHeader,
  VFSidebar,
  VFContent,
  VFFooter,
} from "@/src/layouts";
```

`VeriForgeAppShell` (`components/veriforge/app-shell.tsx`) now wraps `VFAppShell`, so all `/veriforge/(main)/*` pages use the forged-metal layout system.
