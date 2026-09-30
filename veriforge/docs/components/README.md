# Component Documentation

Forged-metal React library: `vera-frontend/src/components/veriforge/`

Import:

```ts
import {
  VFButton,
  VFCard,
  VFPanel,
  VFModal,
  VFInput,
  VFAlert,
  VFTable,
  VFProgressBar,
  VFStatusIndicator,
} from "@/src/components/veriforge";
```

**Shared rules:** angular geometry · steel borders idle · forge-red active/focus · CSS modules · motion classes from `veriforge-motion`.

---

## VFButton

**File:** `VFButton.tsx`  
**Variants:** `primary` | `secondary` | `destructive` | `ghost`  
**Sizes:** `sm` | `md` | `lg`  
**Props:** `active?: boolean` + native button attrs

```tsx
<VFButton variant="primary" size="md">Forge</VFButton>
<VFButton active>Active</VFButton>
<VFButton disabled>Disabled</VFButton>
```

| State | Behavior |
|-------|----------|
| Hover | Steel shift |
| Press | Angular settle |
| Active | Red glow (`redGlowPulse` when `active`) |
| Focus | Red outline |
| Keyboard | Enter + Space |

---

## VFCard

**File:** `VFCard.tsx`  
Metallic / iron surface, steel border, optional hover lift + metallic shadow. Critical/selected → red accent border.

```tsx
<VFCard>
  <h3>KPI</h3>
  <p>Content</p>
</VFCard>
```

---

## VFPanel

**File:** `VFPanel.tsx`  
Section container. Enter with `angularSlide` + `metallicFade`. Use `aria-expanded` when collapsible.

```tsx
<VFPanel title="Operations">…</VFPanel>
```

---

## VFModal

**File:** `VFModal.tsx`  
`role="dialog"` · `aria-modal` · Escape closes · `industrialDrop` open · angular collapse close.

```tsx
<VFModal open={open} onClose={() => setOpen(false)} title="Confirm">
  …
</VFModal>
```

---

## VFInput

**File:** `VFInput.tsx`  
Idle: steel border. Focus: red glow. Supports `aria-invalid` on error. Associate a visible label.

```tsx
<VFInput label="Email" name="email" />
```

---

## VFAlert

**File:** `VFAlert.tsx`  
`role="alert"` for critical. Severity text required — do not rely on red alone. Pair with `aria-live` patterns for toasts.

```tsx
<VFAlert tone="critical">Critical: gas threshold exceeded</VFAlert>
```

---

## VFTable

**File:** `VFTable.tsx`  
Angular table chrome, steel grid lines, red accent on selected/critical rows. Keyboard-reachable row actions.

```tsx
<VFTable columns={columns} data={rows} />
```

---

## VFProgressBar

**File:** `VFProgressBar.tsx`  
`role="progressbar"` + `aria-valuenow/min/max` + `aria-label`. Fill uses forge red / steel per tone.

```tsx
<VFProgressBar value={72} label="Training completion" />
```

---

## VFStatusIndicator

**File:** `VFStatusIndicator.tsx`  
Status dot + **text label** (color is not enough). Tones: ok / warn / critical / idle.

```tsx
<VFStatusIndicator status="critical" label="Critical" />
```

---

## Also available

`VFDivider` · `VFTag` · `VFIcon` · `VFSectionHeader` · `VFToast` · `VFChart` · `VFWorkflowNode`

See `docs/VERIFORGE-COMPONENT-LIBRARY.md` and `QA-SUITE.md` §2.
