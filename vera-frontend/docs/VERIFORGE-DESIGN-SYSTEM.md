# VeriForge Design System Guide

**Version:** 3.0.0  
**Products:** VeriForge Hub · VeriCore · VeriPM · VeriWallet  
**Theme:** Industrial safety platform  
**Audience:** Designers and developers  

This is the official visual and interaction standard for the VeriForge ecosystem. Use it to keep Hub, Core, PM, and Wallet consistent, auditable, and enterprise-grade.

**Related assets**
- Tokens (TS): `src/theme/veriforge-tokens.ts`
- Color JSON: `src/theme/veriforge-color-tokens.json`
- CSS variables: `src/theme/veriforge-variables.css`
- Figma component spec: `docs/VERIFORGE-FIGMA-COMPONENT-SPEC.md`
- UI kit: `components/veriforge/`

---

## 1. Brand Philosophy

VeriForge is a **professional safety compliance platform**. The interface must communicate trust, verification, and operational discipline—not consumer polish or alarmist hazard aesthetics.

### Principles

- **Industrial** — Structured layouts, matte surfaces, thin borders, ISO-style line icons.
- **Professional** — Calm authority. High legibility. No gloss, neon, or playful chrome.
- **Safety-forward** — Status is clear and controlled. Critical red is reserved for true stop-work / security events.
- **Compliance-focused** — Every primary action should feel auditable: clear hierarchy, strong focus, predictable patterns.

### Promise

> Safety should be verified, not assumed.

### Visual inspiration

- Inspection tags and equipment certification plates
- ISO / ANSI line signage
- Survey registration marks and verification seals
- Enterprise audit dashboards

### Do

- Use slate/graphite as structural chrome
- Use safety blue for authorized actions and focus
- Use inspection teal for identity / section cues
- Prefer borders over shadows for elevation

### Don’t

- Use aggressive red or black-heavy “danger” motifs as brand language
- Ship glossy gradients, purple themes, or consumer illustration styles
- Use red for routine CTAs, deletes, or form validation
- Hide global modules by role in top navigation

---

## 2. Color System

### Core palette

| Token | Hex | Role |
|---|---|---|
| Slate | `#2A2E33` | Primary surface, top bar, primary button |
| Graphite | `#3B3F45` | Secondary surface, module bar, sidebar, elevated panels |
| Iron | `#1C1F24` | Page canvas (dark), overlays |
| Steel | `#5A6169` | Borders, dividers |
| White | `#F4F6F8` | Text on dark, light canvas |
| Safety blue | `#1E6FB8` | Action CTAs, focus, active rails, links |
| Inspection teal | `#2F8F8C` | Eyebrows, section labels, identity accents |
| Muted amber | `#C89F3D` | Warnings, caution, preferred validation errors |
| Soft green | `#4FAF6F` | Success, completed, verified |
| Controlled red | `#B33A3A` | **Critical alerts only** |

### Surface usage

| Need | Use |
|---|---|
| Page (dark product) | Iron |
| Page (Hub / Wallet light) | White / `#F4F6F8` |
| Card / panel | Slate |
| Elevated / nested | Graphite |
| Inset well / input fill | `#23272C` |
| Warning panel | `#2A2820` + amber border |
| Success panel | `#1F2A24` + green border |
| Critical panel | `#2A2224` + red border |

### Text usage

| Role | Color |
|---|---|
| Primary on dark | `#F4F6F8` |
| Secondary | `#D5DBE0` |
| Muted / labels | `#A8B0B8` |
| Quiet / placeholder | `#8A9199` |
| Inverse (on light) | `#2A2E33` |
| Critical text | `#B33A3A` (revocations, security copy only) |

### Status colors

| Status | Color | Meaning |
|---|---|---|
| Success | Green | Verified, completed, compliant |
| Warning | Amber | Caution, review needed, non-blocking risk |
| Info / pending | Blue | In progress, informational, authorized workflow |
| Critical | Red | Stop-work, security failure, compliance breach |

### Usage rules

1. **Blue = action and focus**, not decoration.
2. **Teal = identity and section hierarchy**, not primary CTAs.
3. **Amber = caution**; use for destructive-but-not-security actions.
4. **Green = confirmation** of successful verification or completion.
5. **Red = critical only** — never brand fills, never default buttons.

### Do / Don’t

| Do | Don’t |
|---|---|
| Blue primary action: “Verify asset” | Red button: “Delete” / “Confirm” |
| Amber warning callout in a modal | Bright red background for form errors |
| Green badge: “Completed” | Green as a marketing accent wash |
| Red rail on a critical table row | Full-page red/black hazard styling |
| Teal eyebrow: “Identity badge” | Teal as the main CTA fill |

---

## 3. Typography

### Font choices

- **Primary:** Inter
- **Fallback:** Roboto, Segoe UI, system-ui
- **Mono:** Roboto Mono (IDs, timestamps, refs)

Use Inter/Roboto for all product UI. Do not introduce display/serif fonts in Hub, Core, PM, or Wallet.

### Hierarchy

| Style | Size | Weight | Use |
|---|---|---|---|
| Display | 24 | Semibold 600 | Rare page heroes |
| Title | 16 | Semibold 600 | Page titles |
| Heading | 14 | Semibold 600 | Card / section titles |
| Body | 14 | Medium 500 | Default content |
| Body small | 13 | Medium 500 | Dense UI, buttons (md) |
| Label | 11 | Semibold 600 · UPPERCASE · tracking 0.06em | Form labels, table headers |
| Eyebrow | 11 | Semibold 600 · UPPERCASE · tracking 0.08em · teal | Section identity |
| Caption | 12 | Medium 500 | Hints, helper text |

### Weights

- **500 (Medium)** — body, controls
- **600 (Semibold)** — headings, labels, emphasis
- Avoid light weights (<400) on dark industrial surfaces

### Accessibility

- Maintain **WCAG AA** contrast for text on slate/graphite (prefer white / `#D5DBE0` on dark).
- Do not rely on color alone for status—pair with label text and/or icon.
- Focus rings must remain visible (`2px` safety blue).
- Minimum interactive target: **36px** height (prefer 40px for inputs/buttons).
- Uppercase labels are short; never uppercase long sentences.

---

## 4. Components

Geometry defaults: **3px radius**, **1px borders**, **matte fills**, **no drop shadows** on cards/buttons.

### 4.1 Buttons

**Purpose:** Authorized workflow actions with clear hierarchy.

**Anatomy:** `[icon?] + label + [icon?]` · gap 8px · radius 3px · border 1px

| Variant | Fill | Use |
|---|---|---|
| Primary | Slate | Structural default on dark chrome |
| Secondary | Graphite | Cancel / alternate |
| Action | Safety blue | Primary “do the job” CTA |
| Success | Soft green | Confirm successful verification path |
| Warning | Muted amber | Caution / irreversible non-security |
| Critical | Controlled red | Alert acknowledgment only |
| Ghost | Transparent + steel border | Tertiary |

**Sizes:** Sm 36 · Md 40 · Lg 44 (height px)

**States:** Default · Hover (slightly lighter + optional 1px lift) · Active · Focus (blue ring) · Disabled (muted slate, 70% opacity)

**Guidelines**
- Prefer **Action (blue)** for workflow CTAs.
- Modal footer: Secondary left of Action; Action rightmost.
- Never use Critical red for routine delete—use Warning.

### 4.2 Cards & panels

**Purpose:** Group related content without consumer “card chrome.”

**Anatomy:** Optional icon tile (32×32) · eyebrow · title · description · body · optional footer

| Surface | When |
|---|---|
| Panel (slate) | Default content block |
| Elevated (graphite) | Nested / secondary emphasis |
| Inset | Wells, quiet groupings |
| Status surfaces | Warning / success / critical only |

**Guidelines**
- One job per card: one title, one supporting line, one primary action max.
- Elevation = border contrast, not shadow.
- Icon tiles use steel border + safety-blue icon.

### 4.3 Tables

**Purpose:** Audit-ready operational and financial data.

**Anatomy:** Bordered wrap · graphite header · zebra rows · optional left rail

| Row state | Treatment |
|---|---|
| Even / odd | Slate / panel zebra |
| Hover | Slightly lighter (selectable rows only) |
| Selected | Blue tint + 3px blue rail |
| Critical | Red tint + 3px red rail |

**Status badges:** Green completed · Blue pending · Amber flagged · Red critical  
(10px semibold uppercase, 3px radius)

**Guidelines**
- Timestamp columns: date (semibold) over time (mono muted).
- Critical and selected are mutually exclusive; critical wins.
- No full-row red except critical security/compliance events.

### 4.4 Forms

**Purpose:** Structured, compliant data entry.

**Anatomy:** Uppercase label · control · hint/error

| Token | Spec |
|---|---|
| Height | 40px |
| Fill | `#23272C` |
| Border | Steel; focus = safety blue + glow |
| Label | 11 uppercase muted |
| Error | Prefer amber; red text only for security blocks |

**Controls:** Text, textarea (min 96px), select/dropdown, checkbox (16), toggle (36×20; on = blue)

**Guidelines**
- Always show visible labels (not placeholder-only).
- Required marker: muted `*`, not red.
- One error message per field, below the control.

### 4.5 Navigation

**Layers**
1. **Top bar** — Slate · 56/64px · brand + global nav + actions  
2. **Module bar** — Graphite · module identity + feature dropdown + blue quick action  
3. **Sidebar** — Contextual section nav only (not global module switching) · 256px graphite  

**Item states:** Idle · Hover (blue tint) · Active (blue tint + 3px blue rail) · Critical (critical text, no red fill)

**Guidelines**
- Icon + text vertically centered; gap 12px.
- Do not use sidebars to switch global products/modules.
- Keep global modules visible regardless of role.

### 4.6 Modals

**Purpose:** Focused decisions; secure two-step flows where required.

**Anatomy:** Iron overlay (70–75%) · slate frame · header · body · optional warning · footer actions

**Guidelines**
- Max width ~512–576px; padding 20px; no shadow.
- Footer: Secondary/Ghost then Action (blue).
- Security warnings use amber surfaces—never bright red fills.
- Two-step secure actions: acknowledge → confirm.

### 4.7 Alerts

**Purpose:** Inline system feedback with controlled severity.

| Tone | Rail | Use |
|---|---|---|
| Neutral / info | Blue | System notice |
| Success | Green | Verified / completed |
| Warning | Amber | Caution / SLA risk |
| Critical | Red | Stop-work / security only |

**Guidelines**
- Always include title + message.
- Pair color with icon and text.
- Do not use critical tone for ordinary validation.

---

## 5. Layout & Spacing

### Spacing scale

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64` (px)

Common mappings:
- Control gap: 8
- Field stack: 12–16
- Card padding: 16–20
- Section stack: 24
- Page gutters: 16 mobile / 24 desktop

### Grid & content width

- Content max width: **1600px**
- Card grids: 16px gap; prefer 1 / 2 / 3 / 4 columns by breakpoint
- Top/module bars: centered inner grid, same horizontal padding as page content

### Alignment rules

- Align icon tiles, labels, and action rows to a consistent left edge.
- Active nav/table rails are **inset left 3px**—keep full-height.
- Form labels and controls share one vertical rhythm; don’t mix left-aligned and centered forms in the same view.

### Responsive behavior

| Breakpoint intent | Behavior |
|---|---|
| Mobile | Single column; top bar 56px; collapse secondary actions |
| Tablet | 2-column cards; sidebar may overlay or collapse |
| Desktop | Full chrome; sidebar 256px; denser tables |

- Prefer stacking over horizontal scroll for primary actions.
- Tables may scroll horizontally inside a bordered wrap; headers stay readable.

---

## 6. Interaction Patterns

| State | Pattern |
|---|---|
| **Hover** | Background shift toward lighter graphite/blue tint; optional `translateY(-1px)` on buttons only; duration ~150ms |
| **Focus** | `2px` safety-blue ring + `2px` iron/slate offset; inputs also get blue border + soft glow |
| **Active / pressed** | Darker fill; remove lift |
| **Selected** | Blue muted fill + 3px blue rail (nav, tables) |
| **Disabled** | Muted surface `#353A40`, quiet text, no hover lift, `not-allowed` |
| **Error** | Amber border + amber message (default); critical red text only for security failures |
| **Success** | Green badge/alert/surface; never flashy animation |

### Motion rules

- Industrial and restrained.
- **No** consumer bounce, confetti, or decorative motion.
- Use color and structure—not animation—to communicate status.

---

## 7. Status & Alerts

Status color is a **compliance language**. Use it consistently across Hub, Core, PM, and Wallet.

| Color | Safety meaning | Typical UI |
|---|---|---|
| **Green** | Compliant / verified / complete | Success alert, completed badge, success button |
| **Amber** | Caution / review / non-blocking risk | Warning alert, flagged badge, warning button |
| **Blue** | Informational / pending / authorized action | Pending badge, info alert, action button, focus |
| **Red** | Critical failure / stop-work / security | Critical alert, critical row rail, critical badge |

### Rules

1. If work must stop, use **critical red** (alert + rail + copy)—not a red page theme.
2. If work may continue with caution, use **amber**.
3. If work succeeded and is auditable, use **green**.
4. If work is in progress or needs an authorized next step, use **blue**.
5. Never encode severity with color alone—include text status.

---

## 8. VeriWallet Specific Rules

VeriWallet is the secure credits, identity, ledger, and permissions module. It must feel **more deliberate** than general Hub chrome—still industrial, never consumer-fintech playful.

### Security cues

- Secure actions open a **slate modal** with lock/verify iconography.
- Use **two-step confirmation** for Add Credits, Transfer, Verify Asset, and Revoke.
- Step 1 requires an explicit authorization checkbox before Continue.
- Warnings inside secure flows use **muted amber**—never bright red fills.
- Primary confirm is always **safety blue**; secondary is **graphite**.
- Critical revocation: **controlled red text** on a graphite/secondary control—**no red buttons**.

### Dashboard

- Balance cards: matte **slate** + thin borders.
- Verification credit meter: **safety blue** fill only.
- Identity badge: graphite panel + ISO-style identity icon + teal status cue.
- Quick actions: Add Credits (blue) · Transfer · Verify Asset · View Ledger.

### Transaction ledger

- High-contrast table; alternating row tones.
- Status badges: green completed · blue pending · amber flagged · red critical.
- Timestamp hierarchy: date strong, time mono muted.
- Hover: soft safety-blue wash.
- Red background/rail **only** for critical security events.

### Identity & permissions

- Role cards on **graphite** panels with lock icons.
- Permission toggles: **enabled = safety blue**.
- Disabled state remains steel/slate—no red.
- “Revoke access” uses critical red **label text** only.

### Interaction tone

- Zero consumer animations.
- Subtle hover/focus only.
- Clear hierarchy and spacing; prefer audit clarity over density tricks.

---

## 9. Implementation Checklist

Before shipping UI in any VeriForge product:

- [ ] Uses slate/graphite surfaces and approved accents
- [ ] No red CTAs except critical-alert acknowledgment
- [ ] Focus rings visible on all interactive controls
- [ ] Status uses badge/alert patterns from this guide
- [ ] Radius ≤ 6px (controls default 3px)
- [ ] Shadows absent on cards/buttons (menus may use subtle ambient only)
- [ ] Navigation follows top bar + module bar architecture
- [ ] Wallet secure actions are two-step with amber warnings

---

## 10. Source of Truth

| Layer | Location |
|---|---|
| Design tokens (TS) | `src/theme/veriforge-tokens.ts` |
| Color token JSON | `src/theme/veriforge-color-tokens.json` |
| CSS variable pack | `src/theme/veriforge-variables.css` |
| Component kit | `components/veriforge/` |
| Nav chrome | `src/components/navigation/nav-chrome.ts` |
| VeriWallet UI | `components/veriwallet/` |
| Figma build spec | `docs/VERIFORGE-FIGMA-COMPONENT-SPEC.md` |

When code and this guide diverge, **update both**—tokens first, then components, then docs.

---

*VeriForge Design System v3.0.0 — industrial, compliant, enterprise-grade.*
