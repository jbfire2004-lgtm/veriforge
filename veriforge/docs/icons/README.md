# Iconography Documentation

Angular metallic icons: `vera-frontend/src/icons/veriforge-icons.ts`

## Principles

- Angular geometry (miter joins, square caps)
- Metallic gradient fills via shared SVG defs
- Steel-grey strokes idle; forge-red accent corner when active/critical
- No soft Material-style icon packs inside VeriForge shell

## Categories

| ID | Component | Domain |
|----|-----------|--------|
| `training` | `TrainingIcon` | Training Engine |
| `verification` | `VerificationIcon` | Verification |
| `compliance` | `ComplianceIcon` | Compliance |
| `incidents` | `IncidentsIcon` | Incidents |
| `equipment` | `EquipmentIcon` | Equipment / inspections |
| `fieldOps` | `FieldOpsIcon` | Field operations |
| `risk` | `RiskIcon` | Risk |
| `audit` | `AuditIcon` | Audit |
| `culture` | `CultureIcon` | Culture |
| `emergency` | `EmergencyIcon` | Emergency |
| `contractor` | `ContractorIcon` | Contractors |

## Usage

```tsx
import {
  TrainingIcon,
  IncidentsIcon,
  VeriForgeCategoryIcon,
} from "@/src/icons/veriforge-icons";

// Prefer named imports (tree-shakeable)
<TrainingIcon size={24} tone="neutral" title="Training" />

// Critical
<IncidentsIcon tone="critical" title="Incidents" accent />

// Dynamic category
<VeriForgeCategoryIcon category="compliance" tone="active" />
```

### Tones

| Tone | Stroke / fill |
|------|----------------|
| `neutral` | Steel grey + metal fill |
| `active` | Hot metal + red accent |
| `critical` | Hot metal + red accent + metallic shadow |
| `contrast` | Bright metal for dark/light edge cases |

## Usage rules

1. Use VeriForge icons in VF shells — not Lucide/Material as primary nav marks.
2. Named imports over `import *` / default catalog when possible.
3. Size defaults to 24; mobile nav ≥ tap-friendly with 44×44 hit box around icon.
4. Active/critical tones for state — not decoration.

## Accessibility rules

| Case | Rule |
|------|------|
| Informative icon | Pass `title` or `aria-label` → `role="img"` |
| Decorative (beside text) | `aria-hidden` and no title |
| Critical | Visible text alternative (“Critical”, “Emergency”) — color alone fails WCAG |
| Status | Pair `VFStatusIndicator` text with icon |

`IndustrialIconShell` defaults to `aria-hidden` when no title/label is provided.

See `ACCESSIBILITY-SYSTEM.md` §5 · `PERFORMANCE-PACK.md` §4
