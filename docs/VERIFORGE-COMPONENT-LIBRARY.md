# VeriForge Forged-Metal Component Library

Canonical UI primitives at `vera-frontend/src/components/veriforge/`.

All components consume `src/theme/veriforge-tokens.ts`, use CSS modules, angular geometry (`border-radius: 0`), metallic gradients, steel-grey hover, and red glow on active/focus.

## Components

| Component | Role |
|-----------|------|
| `VFButton` | Forge-red primary · bevel border · red glow active |
| `VFCard` | Ledger panel `#1A1A1A` · metallic fill · red active |
| `VFPanel` | Beveled industrial surface |
| `VFInput` | Iron-black field · red focus glow |
| `VFModal` | Angular dialog with forge actions |
| `VFDivider` | Metallic / red accent rule |
| `VFTag` | Compact status chip |
| `VFProgressBar` | Red metallic fill bar |
| `VFStatusIndicator` | Angular status dot + label |
| `VFIcon` | Wraps industrial iconography catalog |
| `VFSectionHeader` | Orbitron title + red underline |
| `VFTable` | Angular data table |
| `VFToast` | Stacked forge notifications |
| `VFAlert` | Inline critical / neutral / success alert |

## Import

```ts
import {
  VFButton,
  VFCard,
  VFPanel,
  VFInput,
  VFModal,
  VFDivider,
  VFTag,
  VFProgressBar,
  VFStatusIndicator,
  VFIcon,
  VFSectionHeader,
  VFTable,
  VFToast,
  VFAlert,
} from "@/src/components/veriforge";
```

Also re-exported from `@/components/veriforge` as the same `VF*` names.
