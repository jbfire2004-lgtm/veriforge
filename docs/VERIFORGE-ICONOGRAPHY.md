# VeriForge Forged-Metal Iconography

Canonical icons: `vera-frontend/src/icons/veriforge-icons.ts`

## Style rules

- Angular geometry (square caps, miter joins, no rounded corners)
- Metallic gradients (`#1A1A1A → #2E2E2E → #424242`)
- Steel-grey outlines (`#424242`)
- Red accent strokes (`#C62828`) on active/critical and key marks

## Icon set

| Category | Component |
|----------|-----------|
| training | `TrainingIcon` |
| verification | `VerificationIcon` |
| compliance | `ComplianceIcon` |
| incidents | `IncidentsIcon` |
| equipment | `EquipmentIcon` |
| fieldOps | `FieldOpsIcon` |
| risk | `RiskIcon` |
| audit | `AuditIcon` |
| culture | `CultureIcon` |
| emergency | `EmergencyIcon` |
| contractor | `ContractorIcon` |

## Import

```ts
import {
  TrainingIcon,
  VerificationIcon,
  VERIFORGE_ICONS,
  VeriForgeCategoryIcon,
} from "@/src/icons/veriforge-icons";

// or via VF wrapper
import { VFIcon } from "@/src/components/veriforge";
<VFIcon category="incidents" tone="critical" />
```
