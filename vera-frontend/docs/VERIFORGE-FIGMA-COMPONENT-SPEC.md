# VeriForge Figma Component Specification

**Version:** 3.0.0  
**Scope:** VeriForge Hub · VeriCore · VeriPM · VeriWallet  
**Purpose:** Figma-ready component & style specs aligned to the industrial safety-platform UI kit  
**Typography:** Inter (primary) / Roboto (fallback)  
**Elevation rule:** Matte surfaces · thin borders · **no drop shadows** (except optional 1px ambient on floating menus if needed for contrast)

---

## 0. Foundation — Figma Styles to Create First

### 0.1 Color styles

| Style name | Hex | Role |
|---|---|---|
| `VF / Slate` | `#2A2E33` | Primary surface, primary button fill, top bar |
| `VF / Graphite` | `#3B3F45` | Secondary surface, module bar, sidebar, elevated panels |
| `VF / Iron` | `#1C1F24` | Page canvas (dark), modal overlay base, focus ring offset |
| `VF / Panel` | `#23272C` | Inset wells, input fills, icon tiles |
| `VF / Steel` | `#5A6169` | Borders, dividers, muted chrome |
| `VF / White` | `#F4F6F8` | Primary text on dark, light canvas |
| `VF / Text Secondary` | `#D5DBE0` | Body text on dark |
| `VF / Text Muted` | `#A8B0B8` | Labels, captions |
| `VF / Text Quiet` | `#8A9199` | Hints, placeholders, disabled text |
| `VF / Safety Blue` | `#1E6FB8` | Action CTAs, focus, active rails, links |
| `VF / Safety Blue Dark` | `#174F86` | Action border / pressed |
| `VF / Inspection Teal` | `#2F8F8C` | Eyebrows, section accents, identity cues |
| `VF / Muted Amber` | `#C89F3D` | Warnings, caution status |
| `VF / Soft Green` | `#4FAF6F` | Success / completed |
| `VF / Critical` | `#B33A3A` | **Critical alerts only** — never primary CTAs |

**Supporting fills (create as styles or local paints):**

| Style | Value | Use |
|---|---|---|
| `VF / Blue Tint 16` | `rgba(30,111,184,0.16)` | Selected row / active nav fill |
| `VF / Blue Tint 20` | `rgba(30,111,184,0.20)` | Stronger active fill |
| `VF / Critical Tint 14` | `rgba(179,58,58,0.14)` | Critical table row fill |
| `VF / Warning Surface` | `#2A2820` + border `#C89F3D` @ 70% | Warning panels/alerts |
| `VF / Success Surface` | `#1F2A24` + border `#4FAF6F` @ 60% | Success panels/alerts |
| `VF / Critical Surface` | `#2A2224` + border `#B33A3A` @ 70% | Critical alerts only |

### 0.2 Text styles

| Style name | Size | Weight | Line | Tracking | Color | Transform |
|---|---|---|---|---|---|---|
| `VF / Display` | 24 / 28 | Semibold 600 | 1.2 | −0.01em | White | none |
| `VF / Title` | 16 / 24 | Semibold 600 | 1.4 | 0 | White | none |
| `VF / Heading` | 14 / 20 | Semibold 600 | 1.4 | 0.02em | White | none |
| `VF / Body` | 14 / 20 | Medium 500 | 1.5 | 0 | Text Secondary | none |
| `VF / Body Small` | 13 / 18 | Medium 500 | 1.4 | 0.02em | White | none |
| `VF / Label` | 11 / 14 | Semibold 600 | 1.3 | 0.06em | Text Muted | UPPERCASE |
| `VF / Eyebrow` | 11 / 14 | Semibold 600 | 1.3 | 0.08em | Inspection Teal | UPPERCASE |
| `VF / Caption` | 12 / 16 | Medium 500 | 1.4 | 0 | Text Quiet | none |
| `VF / Mono` | 11 / 16 | Medium 500 | 1.4 | 0 | Text Muted | none (Inter Mono / Roboto Mono) |

### 0.3 Effect styles

| Style name | Spec | When to use |
|---|---|---|
| `VF / Focus Ring` | Outer: 2px `#1E6FB8` · Offset: 2px Iron `#1C1F24` | All interactive focus-visible |
| `VF / Focus Glow Input` | 0 0 0 2px `rgba(30,111,184,0.28)` | Input focus (in addition to blue border) |
| `VF / Active Rail Blue` | Inset left 3px `#1E6FB8` | Selected nav / table row |
| `VF / Critical Rail` | Inset left 3px `#B33A3A` | Critical table row / alert rail |
| `VF / Elevation` | **None** (shadow-none) | Default cards/panels/buttons |
| `VF / Ambient (optional)` | `0 1px 2px rgba(28,31,36,0.35)` | Floating menus only if needed |

### 0.4 Geometry & spacing tokens

| Token | Value |
|---|---|
| Radius / Control | `3px` |
| Radius / Card (light Hub surfaces) | `6px` max |
| Border width | `1px` |
| Icon stroke | `1.6px` |
| Icon tile | `32×32` (h-8 w-8), radius 3px |
| Spacing scale | 4 / 8 / 16 / 24 / 32 |
| Content max width | `1600px` |
| Grid gap (cards) | `16px` |

### 0.5 Hard rules (document in Figma cover)

1. **No glossy gradients** on controls; matte fills only.  
2. **No consumer animations** — hover = color shift ± 1px lift max; duration 150ms.  
3. **Red (`#B33A3A`) only for critical security/compliance alerts** — never default buttons, never brand fills.  
4. Destructive / caution actions use **Warning amber**, not red.  
5. ISO-style **line icons** only — no filled playful illustrations.

---

## 1. Buttons

### Purpose
Primary interaction controls for authorized workflows across Hub, Core, PM, and Wallet. Communicate hierarchy without “danger” aesthetics.

### Anatomy
```
[ optional icon 16×16 ]  Label  [ optional trailing icon ]
```
- Auto-layout: Horizontal · Gap `8px` · Align center  
- Clip content: off  
- Corner radius: `3px`  
- Border: `1px` solid (variant-specific)

### Component set structure (Figma)
`Button`  
Properties:  
- `Variant` = Primary | Secondary | Action | Success | Warning | Critical | Ghost  
- `Size` = Sm | Md | Lg  
- `State` = Default | Hover | Active | Focus | Disabled  
- `Icon` = None | Leading | Trailing  

### Sizing

| Size | Height | H-padding | Font | Icon |
|---|---|---|---|---|
| Sm | `36px` | `12px` | 12 / Medium 500 · tracking 0.02em | 14px |
| Md | `40px` | `16px` | 13 / Medium 500 · tracking 0.02em | 16px |
| Lg | `44px` | `20px` | 14 / Medium 500 · tracking 0.02em | 16px |

Min width: hug contents; for full-width toolbar actions use fill container.

### Variant paints

| Variant | Fill | Border | Text | Hover fill | Active fill |
|---|---|---|---|---|---|
| **Primary** | Slate `#2A2E33` | `#1F2328` | White | `#343940` | `#23272C` |
| **Secondary** | Graphite `#3B3F45` | Slate `#2A2E33` | White | `#454A51` | `#32363C` |
| **Action** | Safety Blue `#1E6FB8` | `#174F86` | White | `#1A63A6` | `#174F86` |
| **Success** | Soft Green `#4FAF6F` | `#3D8F58` | `#0F1A12` | `#45A064` | `#3D8F58` |
| **Warning** | Muted Amber `#C89F3D` | `#A8842F` | `#1C1A10` | `#B89136` | `#A8842F` |
| **Critical** | Critical `#B33A3A` | `#8F2E2E` | White | `#A33434` | `#8F2E2E` |
| **Ghost** | Transparent | Steel `#5A6169` | White | Graphite @ 40% | Slate @ 60% |

### States (all variants)

| State | Spec |
|---|---|
| **Default** | As variant table |
| **Hover** | Hover fill + border darken; optional `Y −1px` |
| **Active / Pressed** | Active fill; `Y 0` |
| **Focus** | Focus Ring effect (`2px` blue + `2px` iron offset) |
| **Disabled** | Fill `#353A40` · Border `#454A51` · Text `#8A9199` · Opacity 70% · no hover lift |

### Usage guidelines
- **Primary** — default structural actions on dark chrome (Save structure, Close panel).  
- **Secondary** — cancel / alternate on dark surfaces.  
- **Action** — authorized workflow CTAs (Verify, Authorize, Add Credits). Prefer this over Primary for “do the job” actions.  
- **Success** — confirm completed verification / publish success path.  
- **Warning** — caution / irreversible-but-not-security actions (Transfer with warning).  
- **Critical** — **alerts only** (dismiss critical banner, acknowledge stop-work). Do **not** use for routine delete; use Warning.  
- **Ghost** — tertiary / toolbar on dark.  
- Button groups: gap `8px`; primary action rightmost in modals.

### Figma naming
`VF / Button / {Variant} / {Size} / {State}`

---

## 2. Cards & Panels

### Purpose
Contain related content with industrial hierarchy. Cards are structural containers — not marketing chrome.

### Anatomy
```
┌─────────────────────────────────────────┐
│ [Icon tile]  Eyebrow (optional)         │
│              Title                      │
│              Description (optional)     │
├─────────────────────────────────────────┤  ← 1px Steel @ 70%
│ Body content                            │
│ …                                       │
└─────────────────────────────────────────┘
```

### Surface variants (create as component variants)

| Variant | Fill | Border | Radius | Shadow |
|---|---|---|---|---|
| **Panel** (default) | Slate `#2A2E33` | Steel `#5A6169` 1px | 3px | none |
| **Elevated** | Graphite `#3B3F45` | Steel 1px | 3px | none |
| **Inset** | Panel `#23272C` | Steel @ 80% | 3px | none |
| **Warning** | `#2A2820` | Amber @ 70% | 3px | none |
| **Success** | `#1F2A24` | Green @ 60% | 3px | none |
| **Critical** | `#2A2224` | Critical @ 70% | 3px | none |
| **Light Panel** (Hub/Wallet light canvas) | White / `#F4F6F8` | Slate @ 14% | 6px | none |

### Header styles
- Layout: Horizontal · Gap `12px` · Align top  
- Bottom border: Steel `#5A6169` @ 70% · Padding bottom `12px` · Margin bottom `16px`  
- **Icon tile:** `32×32` · Fill Panel `#23272C` · Border Steel · Radius 3px · Icon Safety Blue 16px  
- **Eyebrow:** Text style `VF / Eyebrow` (teal)  
- **Title:** `VF / Heading` 14 Semibold White  
- **Description:** Body 14 · Text Muted `#A8B0B8` · margin-top 2px  

### Body spacing
| Token | Value |
|---|---|
| Card padding | `16px` (dense) or `20px` (default) |
| Section stack gap | `16px` |
| Nested inset padding | `12–16px` |
| Footer actions | Top border Steel · padding-top `16px` · button gap `8px` · align end |

### Elevation rules
1. Prefer **border contrast** over shadow.  
2. Nesting: Canvas (Iron) → Panel (Slate) → Elevated/Inset (Graphite/Panel).  
3. Never stack more than **two** nested bordered surfaces without an inset well.  
4. Critical/Warning/Success surfaces are **status containers**, not decorative cards.

### Usage guidelines
- One job per card: one title, one supporting line, one primary action max.  
- Wallet balance cards: use **Slate panel** on light canvas (or dark slate on dark).  
- Permission cards (Wallet): **Elevated graphite** + lock icon tile.  
- Do not put cards inside the hero of marketing pages; product UI may use panels freely.

### Figma naming
`VF / Panel / {Surface}` · `VF / Card Header` · `VF / Icon Tile`

---

## 3. Tables

### Purpose
High-contrast audit and operational data (ledgers, inspections, compliance lists).

### Anatomy
```
┌─ Table wrap (border Steel, radius 3px) ─────────────┐
│ HEADER ROW (Graphite)                               │
│ DATA ROW even (Slate)                               │
│ DATA ROW odd (Panel)                                │
│ DATA ROW selected (Blue tint + 3px blue rail)       │
│ DATA ROW critical (Critical tint + 3px red rail)    │
└─────────────────────────────────────────────────────┘
```

### Sizing

| Element | Spec |
|---|---|
| Header row height | `40px` (py 10 + content) |
| Body row height | `40–44px` (py 10) |
| Cell H-padding | `12px` |
| Font body | 14 Medium · Text Secondary `#D5DBE0` |
| Font header | 11 Semibold UPPERCASE · tracking 0.06em · `#C5CCD3` |
| Min table width | hug / scroll; wrap `overflow: auto` |

### Header style
- Fill: Graphite `#3B3F45`  
- Bottom border: Steel 1px  
- Sortable header: button · hover text Safety Blue  
- Sort indicator: `▲` / `▼` after label  

### Row states

| State | Fill | Left rail | Notes |
|---|---|---|---|
| Even | Slate `#2A2E33` | none | Default zebra |
| Odd | Panel `#23272C` | none | |
| Hover | `#32363C` | none | Only if row is selectable |
| Selected | Blue Tint 16 | 3px Safety Blue | Not combined with critical |
| Critical | Critical Tint 14 | 3px Critical | Compliance/security failure only |

**Light canvas variant (VeriWallet ledger):**  
Even White · Odd `#F0F2F4` · Hover `#E8F1F8` · Critical `#F8F0F0` · Header Slate with muted text.

### Status badges (component set)

| Status | Fill | Border | Text | Radius | Padding | Type |
|---|---|---|---|---|---|---|
| Completed / Success | `#4FAF6F` | `#3D8F58` | `#0F1A12` | 3px | 2×8 | 10 Semibold UPPERCASE |
| Pending / Info | `#1E6FB8` | `#174F86` | White | 3px | 2×8 | 10 Semibold UPPERCASE |
| Flagged / Warning | `#C89F3D` | `#A8842F` | `#1C1A10` | 3px | 2×8 | 10 Semibold UPPERCASE |
| Critical | `#B33A3A` | `#8F2E2E` | White | 3px | 2×8 | 10 Semibold UPPERCASE |

### Usage guidelines
- Timestamp columns: **date** Semibold 14 + **time** Mono 11 muted stacked.  
- Never paint full row red except critical events.  
- Selected and critical are mutually exclusive visually (critical wins).  
- Dense operational tables: prefer dark industrial variant; financial ledgers on light canvas may use light zebra.

### Figma naming
`VF / Table` · `VF / Table Row / {State}` · `VF / Badge / {Status}`

---

## 4. Forms

### Purpose
Structured data entry for compliance workflows — clear labels, strong focus, calm errors.

### Anatomy (field)
```
LABEL (uppercase muted)
┌──────────────────────────────┐
│ Placeholder / Value          │
└──────────────────────────────┘
Hint or error text
```

### Input field

| Property | Spec |
|---|---|
| Height | `40px` |
| Radius | `3px` |
| Padding | `0 12px` |
| Fill | Panel `#23272C` |
| Border | 1px Steel `#5A6169` |
| Text | 14 Medium White |
| Placeholder | Text Quiet `#8A9199` |
| Font | Inter / Roboto |

### Label
- Style: `VF / Label` (11 Semibold UPPERCASE · tracking 0.06em · `#A8B0B8`)  
- Margin below: `6px`  

### Hint
- 12 Medium · `#8A9199` · margin-top `6px`

### States

| State | Border | Extra |
|---|---|---|
| Default | Steel | — |
| Hover | Steel lighten optional `#6B737C` | — |
| Focus | Safety Blue `#1E6FB8` | Focus Glow Input `0 0 0 2px rgba(30,111,184,0.28)` |
| Error | Muted Amber `#C89F3D` (preferred) or Critical only for security fields | Error text Amber 14 Medium |
| Disabled | Border `#454A51` · Fill Slate · Text Quiet · not-allowed |

**Error copy rule:** Prefer **amber** for validation errors. Use **critical red text** only for security-blocking failures (e.g. revoked credential).

### Textarea
- Same as input + `min-height 96px` · padding `10px 12px` · resize vertical  

### Select / Dropdown
- Closed: same as input (appearance none; chevron 16px Steel right inset 12px)  
- Open menu: Graphite fill · Steel border · radius 3px · item height ~40px · hover Blue Tint 16 · active Blue Tint 20 + 3px blue rail  

### Checkbox
- Size `16×16` · radius 3px · fill Panel · border Steel · accent Safety Blue  

### Toggle
- Track: `36×20` · radius 3px · Off: Slate + Steel border · On: Safety Blue + `#174F86` border  
- Thumb: `14×14` · radius 2px · White · inset 2px  
- Optional row chrome: bordered Slate panel padding `10px 12px`

### Form spacing
| Element | Gap |
|---|---|
| Fields in column | `12–16px` |
| Field groups | `24px` |
| Form actions | `16px` above · buttons gap `8px` · primary right |

### Usage guidelines
- Always visible labels (no placeholder-only labels).  
- One error message per field, below control.  
- Required indicator: append `*` in muted text, not red.  
- Wallet secure modals: checkbox acknowledgment before enabling Continue.

### Figma naming
`VF / Input / {State}` · `VF / Label` · `VF / Select` · `VF / Toggle / {On|Off}`

---

## 5. Navigation

### Purpose
Unified authenticated chrome: global top bar + module bar; contextual sidebar for in-module section nav (not global module switching).

### 5.1 Top bar (Layer 1)

| Property | Spec |
|---|---|
| Height | `56px` mobile / `64px` desktop |
| Fill | Slate `#2A2E33` |
| Bottom border | `#1F2328` 1px |
| Text | White |
| Max width inner | `1600px` |
| Padding X | `16px` / `24px` |
| Layout | Grid 3 cols: Brand \| Nav \| Actions · gap 16–24 |

**Brand:** 14 Semibold UPPERCASE · tracking 0.12em · hover `#2F85CC`  
**Icon buttons:** 36×36 · ghost on dark · hover Blue Tint 14  
**Focus:** Focus Ring with offset Slate/Iron  

### 5.2 Module bar (Layer 2)

| Property | Spec |
|---|---|
| Fill | Graphite `#3B3F45` |
| Bottom border | Slate 1px |
| Padding | `10px 16–24px` |
| Module icon | 16×16 Safety Blue |
| Module label | 14 Semibold White |
| Quick action | Action button Sm (blue) |

### 5.3 Sidebar (contextual)

| Property | Spec |
|---|---|
| Width | `256px` (w-64) |
| Fill | Graphite |
| Right border | Steel 1px |
| Section label | 10 Semibold UPPERCASE · tracking 0.1em · Teal · px 12 · mb 6 |
| Item height | ~36–40px |
| Item padding | `8px 12px` |
| Item gap (icon–text) | `12px` |
| Icon size | 16px |
| Radius | 3px |

**Item states**

| State | Fill | Text | Rail |
|---|---|---|---|
| Idle | transparent | `#D5DBE0` | none |
| Hover | Blue Tint 16 | White | none |
| Active | Blue Tint 20 | White | 3px Safety Blue inset left |
| Critical | text `#F0DADA` · hover border Critical @ 50% · fill `#2A2224` | — | optional |

### 5.4 Dropdown menus
- Panel: Graphite · Steel border · radius 3px · max-height 480px  
- Item: padding `10px 16px` · gap 12 · border-b Steel @ 60%  
- Active: Blue Tint 20 + blue rail  
- Critical item: muted critical text, never red fill button  

### Alignment rules
- Icon and text vertically centered.  
- Active rail aligns to full item height.  
- Do not hide global modules by role in the top nav.  
- No sidebars for **global** module switching (architecture rule).

### Figma naming
`VF / Top Bar` · `VF / Module Bar` · `VF / Side Nav Item / {State}` · `VF / Menu Item / {State}`

---

## 6. Modals & Alerts

### 6.1 Modals

#### Purpose
Focused, permissioned decisions — especially secure Wallet actions (two-step).

#### Anatomy
```
████ OVERLAY Iron @ 70–75% ████████████████████
        ┌──────── Modal frame (max 576px) ────────┐
        │ [Lock/Verify icon]  Eyebrow / Step      │
        │                     Title               │
        │─────────────────────────────────────────│
        │ Body                                    │
        │ [optional Warning callout]              │
        │ [optional checkbox ack]                 │
        │─────────────────────────────────────────│
        │              [Secondary] [Primary]      │
        └─────────────────────────────────────────┘
```

#### Layout & sizing

| Property | Spec |
|---|---|
| Overlay | Iron `#1C1F24` @ 70–75% · covers viewport |
| Width | `100%` · max `512–576px` (xl) |
| Frame fill | Slate `#2A2E33` |
| Frame border | Steel `#5A6169` 1px |
| Radius | 3px |
| Shadow | **none** |
| Padding | `20px` |
| Header gap | Icon tile 36×36 + text stack · gap 12 |
| Divider | Steel 1px · margin 16 vertical |
| Footer | Auto-layout right · gap 8 · Secondary then Primary |

#### Button placement
- **Cancel / Back** = Secondary (graphite) or Ghost  
- **Continue / Confirm** = Action (safety blue)  
- Never place Critical red as the confirm CTA  
- Two-step secure flow: Step 1 Continue (disabled until ack) → Step 2 Confirm  

#### Focus
- Dialog receives focus trap in product; in Figma show Focus Ring on primary.  
- Strong outlines: Action button focus ring mandatory in specs.

#### Usage guidelines
- One decision per modal.  
- Security warnings: Warning surface (amber), never bright red.  
- Critical revocation: red **text** on graphite secondary button label — not a red button.

### 6.2 Alerts

#### Purpose
Inline system feedback with clear severity — industrial, not alarming by default.

#### Anatomy
```
│▌ [Icon]  Title
│▌         Message
```
- Left rail `3px` tone color  
- Padding `12px 16px` · pl effective 20 with rail  
- Radius 3px · Gap icon–text 12  

#### Tone variants

| Tone | Surface | Rail | Icon color | Use |
|---|---|---|---|---|
| Neutral | Panel Slate | Safety Blue | Blue | System notice |
| Success | Success surface | Soft Green | Teal/Green | Verified / completed |
| Warning | Warning surface | Muted Amber | Amber | Caution / SLA |
| Critical | Critical surface | Critical Red | Critical | Stop-work / security only |

#### Typography
- Title: 12 Semibold  
- Message: 14 Medium · opacity ~95%  

#### Usage guidelines
- Stack alerts with `8px` gap.  
- Do not use critical tone for form validation.  
- Pair critical alerts with Action (blue) or Warning buttons — not red CTAs unless acknowledging a critical alert dismiss.

### Figma naming
`VF / Modal / Default` · `VF / Modal / Secure Two-Step` · `VF / Alert / {Tone}`

---

## 7. Cross-product application map

| Product | Primary surfaces | Notes |
|---|---|---|
| **VeriForge Hub** | Light canvas + slate/graphite chrome | Hub cards may use 6px radius light panels |
| **VeriCore** | Dark industrial panels | Full vfSurface system |
| **VeriPM** | Same tokens · project tables | Selected = blue rail |
| **VeriWallet** | Light ledger + slate balance cards | Secure modal two-step · permissions graphite |

---

## 8. Figma build checklist

1. Create **Color styles** (Section 0.1).  
2. Create **Text styles** (Section 0.2).  
3. Create **Effect styles** (Focus Ring, Rails).  
4. Build **Button** component set (7 variants × 3 sizes × 5 states).  
5. Build **Panel / Card** variants + Card Header + Icon Tile.  
6. Build **Table** + Row states + Status Badges.  
7. Build **Input / Select / Toggle / Checkbox** with states.  
8. Build **Top Bar · Module Bar · Side Nav · Menu**.  
9. Build **Modal** + **Alert** tones.  
10. Publish library: `VeriForge Industrial Safety UI Kit / v3`.  
11. Attach this doc to the library cover page.

---

## 9. Component property summary (for Figma props panel)

### Button
`variant` · `size` · `state` · `hasIcon` · `label`

### Panel
`surface` · `hasHeader` · `hasFooter` · `padding` (16 | 20)

### Table Row
`state` (even | odd | hover | selected | critical)

### Input
`state` (default | focus | error | disabled) · `hasHint` · `hasLabel`

### Nav Item
`state` (idle | hover | active | critical) · `hasIcon`

### Alert
`tone` (neutral | success | warning | critical)

### Modal
`step` (1 | 2) · `hasWarning` · `hasAck`

---

*Source of truth in code: `src/theme/veriforge-tokens.ts`, `components/veriforge/surfaces.ts`, `components/veriforge/button.tsx`, `src/components/navigation/nav-chrome.ts`, `components/veriwallet/*`.*
