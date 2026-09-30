# VeriForge Industrial QA Testing Suite

Complete industrial QA suite ensuring the **forged-metal VeriForge identity** is visually and functionally correct across the entire application.

**Brand locks (source of truth)**

| Token | Value | File |
|-------|-------|------|
| `forgeRed` | `#C62828` | `vera-frontend/src/theme/veriforge-tokens.ts` |
| `ironBlack` | `#0D0D0D` | same |
| `steelGrey` | `#424242` | same |
| `safetyWhite` | `#FAFAFA` | same |
| `metallicGradient` | `linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)` | same |
| Geometry | `border-radius: 0` (`GEOMETRY.angularRadius`) | same |
| Motion timing | fast **120ms** · medium **240ms** · heavy **400ms** | `src/motion/veriforge-motion.ts` |

**Related tooling**

| Asset | Path |
|-------|------|
| Debug toolkit | `veriforge/THEME-DEBUG-TOOLKIT.md` |
| Debug CSS | `vera-frontend/src/theme/veriforge-debug.css` |
| Auto-fix scripts | `vera-frontend/scripts/veriforge/*.mjs` |
| Integration checklist | `veriforge/INTEGRATION-CHECKLIST.md` |
| Route metadata | `vera-frontend/src/router/veriforge-routes.ts` |

**How to run this suite**

1. Start app: `cd vera-frontend && npm run dev`
2. Enable debug: `document.documentElement.classList.add('vf-debug')`
3. Walk each section below; mark ☐ → ☑ only when **Pass criteria** are met
4. Static scan: `npm run vf:debug:all` (from `vera-frontend/`)
5. Never leave `vf-debug*` on for production

**Verdict legend:** ☐ Fail / not run · ☑ Pass · ⚠ Partial (note evidence)

---

## 1. VISUAL IDENTITY TESTS

**Goal:** Palette, geometry, metal, and accents match `veriforge-tokens.ts` everywhere under `/veriforge`.

### 1.1 Colors match tokens

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| V1 | Forge red | Inspect active underline, focus ring, critical glow | Computed color = `#C62828` | ☐ |
| V2 | Iron black | Inspect shell / panel backgrounds | Base fill = `#0D0D0D` (or metallic wash over it) | ☐ |
| V3 | Steel grey | Inspect borders, hover chrome, grid | Borders / neutrals = `#424242` | ☐ |
| V4 | Safety white | Inspect primary text / icons on dark | Text / icons = `#FAFAFA` | ☐ |
| V5 | No palette drift | `vf-debug-color` + `.debug-color-outline` | No purple / cream / default blue theme colors on VeriForge surfaces | ☐ |

**Evidence:** DevTools → Computed; debug outlines per `THEME-DEBUG-TOOLKIT.md` §1.

### 1.2 Angular geometry (no rounded corners)

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| V6 | Global radius | `vf-debug-angular` on dashboard + engines | No `⚠ ROUNDED (ERROR)` overlays | ☐ |
| V7 | Tailwind utilities | `npm run vf:debug:rounded` | Dry-run finds **0** `rounded-*` under VeriForge paths | ☐ |
| V8 | CSS modules | `npm run vf:debug:angular` | No non-zero `border-radius` outside debug CSS | ☐ |
| V9 | Native controls | Buttons, inputs, cards, modals, charts | `border-radius: 0` / `GEOMETRY.angularRadius` | ☐ |

### 1.3 Metallic gradients render correctly

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| V10 | Body / shell wash | Inspect `background-image` on `.veriforge-theme` / shell | Matches `COLORS.metallicGradient` (135deg `#1A1A1A` → `#2E2E2E` → `#424242`) | ☐ |
| V11 | Card / KPI headers | Dashboard KPI cards | Header uses metallic gradient, not flat grey | ☐ |
| V12 | Modal chrome | Open any `VFModal` | Metallic border / surface present | ☐ |
| V13 | Static scan | `npm run vf:debug:metal` | No flat `#0D0D0D` / `#1A1A1A` shell files missing metallic pattern | ☐ |

### 1.4 Red accents on active states

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| V14 | Nav active | Click sidebar / module link | Active item shows forge-red accent (underline or border) | ☐ |
| V15 | Button active / press | `VFButton` press + keyboard focus | Red accent / glow; focus ring `#C62828` | ☐ |
| V16 | Critical pulse | Visit `/veriforge/incidents` (critical) | `redGlowPulse` / forge-red emphasis visible | ☐ |
| V17 | Accent scan | `npm run vf:debug:red` | Active/critical/focus files reference forge red | ☐ |

### 1.5 Steel-grey borders on neutral components

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| V18 | Cards / panels | Idle `VFCard` / `VFPanel` | Border = `BORDERS.steelBorder` (`1px solid #424242`) | ☐ |
| V19 | Inputs idle | `VFInput` unfocused | Steel-grey border; no red until focus | ☐ |
| V20 | Dividers / tables | Tables, dividers, chart frames | Steel chrome; red reserved for active/critical | ☐ |

**Section 1 gate:** All V1–V20 ☑ before component QA.

---

## 2. COMPONENT TESTS

**Goal:** Forged-metal library primitives behave correctly.  
**Library:** `vera-frontend/src/components/veriforge/`  
**Debug:** `vf-debug-component` + `data-vf-component`

### 2.1 VFButton — hover, press, active, disabled

| # | State | Pass criteria | Status |
|---|-------|---------------|--------|
| C1 | Default | Angular; steel or metallic surface; Orbitron/Exo label | ☐ |
| C2 | Hover | Steel hover shift; no rounded morph; cursor pointer | ☐ |
| C3 | Press / active | Forge-red accent; hard settle (≤ medium timing) | ☐ |
| C4 | Focus-visible | Red focus ring (`#C62828`); keyboard reachable | ☐ |
| C5 | Disabled | Dimmed; no red glow; not clickable; `aria-disabled` / `disabled` | ☐ |

### 2.2 VFCard — hover lift, metallic shadow, red accent border

| # | State | Pass criteria | Status |
|---|-------|---------------|--------|
| C6 | Default | Angular; steel border; metallic surface optional | ☐ |
| C7 | Hover lift | Subtle lift / bevel; `SHADOWS.metallicShadow` or steel shadow | ☐ |
| C8 | Metallic shadow | Shadow uses forge-red tint or steel glow per tokens | ☐ |
| C9 | Accent border | Selected / critical card → `BORDERS.redAccentBorder` | ☐ |
| C10 | Geometry | `border-radius: 0`; no pill corners | ☐ |

### 2.3 VFPanel — angular slide-in, metallic fade

| # | State | Pass criteria | Status |
|---|-------|---------------|--------|
| C11 | Mount | Panel enters with `angularSlide` (or equivalent class) | ☐ |
| C12 | Content | Content / opacity uses `metallicFade` | ☐ |
| C13 | Timing | Medium **240ms**; industrial / angular easing | ☐ |
| C14 | Chrome | Iron-black / metallic fill; steel border; angular | ☐ |

### 2.4 VFModal — industrialDrop, angular collapse

| # | State | Pass criteria | Status |
|---|-------|---------------|--------|
| C15 | Open | `industrialDrop` on dialog enter (yellow outline under `vf-debug-motion`) | ☐ |
| C16 | Backdrop | Metallic / iron dim; focus trap active | ☐ |
| C17 | Close / collapse | Angular collapse (no soft bounce-out); returns focus | ☐ |
| C18 | Esc / overlay | Closes correctly; no leftover scroll lock | ☐ |
| C19 | Geometry | Square modal; metallic border image / steel+red accents | ☐ |

### 2.5 VFInput — red glow on focus, steel-grey border

| # | State | Pass criteria | Status |
|---|-------|---------------|--------|
| C20 | Idle | Steel-grey border; angular; safety-white text | ☐ |
| C21 | Focus | Red glow / ring (`#C62828`); border shifts to forge red | ☐ |
| C22 | Error | Critical red treatment; still angular | ☐ |
| C23 | Disabled | No red glow; muted steel | ☐ |
| C24 | Label / help | Exo 2; contrast on iron-black | ☐ |

**Section 2 gate:** C1–C24 ☑ on a dedicated component playground or live engine pages.

---

## 3. MOTION TESTS

**Goal:** Motion primitives fire at the right moments with correct timing.  
**Source:** `src/motion/veriforge-motion.ts` + `veriforge-motion.css`  
**Debug:** `vf-debug-motion` (blue / grey / yellow / red outlines)

| Primitive | Outline (debug) | Duration | Class |
|-----------|-----------------|----------|-------|
| `angularSlide` | Blue | 240ms | `vf-m-angular-slide` |
| `metallicFade` | Grey | 240ms | `vf-m-metallic-fade` |
| `industrialDrop` | Yellow | heavy / modal | `vf-m-industrial-drop` |
| `redGlowPulse` | Red | pulse loop / critical | `vf-m-red-glow-pulse` |
| `bevelShift` | — | fast/medium | sidebar / bevel nav |

| # | Test | Trigger | Pass criteria | Status |
|---|------|---------|---------------|--------|
| M1 | `angularSlide` on route change | Navigate dashboard → training | Blue outline / slide class on route shell; hard settle | ☐ |
| M2 | `metallicFade` on content load | Same navigation; content region | Grey outline / fade class on content | ☐ |
| M3 | `industrialDrop` on modal open | Open `VFModal` from any page | Yellow outline; drop-in settle | ☐ |
| M4 | `redGlowPulse` on critical | Open `/veriforge/compliance`, `/incidents`, `/risk`, `/emergency`, `/command-center`, `/predictive` | Red pulse on critical chrome / alerts | ☐ |
| M5 | Timing budget | Measure in Performance / CSS | Fast 120 / medium 240 / heavy 400 (±16ms) | ☐ |
| M6 | No soft UI motion | Compare to Material-style ease-out bounce | Angular / industrial easing only | ☐ |

**Critical routes (must pulse):**

```
/veriforge/compliance
/veriforge/incidents
/veriforge/risk
/veriforge/emergency
/veriforge/command-center
/veriforge/predictive
```

**Section 3 gate:** M1–M6 ☑ with debug motion outlines confirmed.

---

## 4. ROUTING TESTS

**Goal:** Shell, active accents, critical motion, and sidebar bevel behavior.  
**Shell:** `VFAppShell` / `VeriForgeAppShell`  
**Routes:** `src/router/veriforge-routes.ts`  
**Debug:** `vf-debug-route`

| # | Test | Method | Pass criteria | Status |
|---|------|--------|---------------|--------|
| R1 | All main routes in `VFAppShell` | Visit each `(main)` route | Global VF header + sidebar + content; **not** Vera unified nav | ☐ |
| R2 | Active red underline | Click several nav items | Active route shows forge-red accent underline / border | ☐ |
| R3 | Critical → `redGlowPulse` | Visit each critical path above | Pulse / red emphasis; `data-vf-critical="true"` if wired | ☐ |
| R4 | Sidebar `bevelShift` | Hover / focus sidebar links | Bevel shift motion; steel hover; angular hit targets | ☐ |
| R5 | Route transition pair | Any in-app nav | `angularSlide` + `metallicFade` both active | ☐ |
| R6 | Mobile routes | `/veriforge/mobile/*` | Uses mobile shell (not desktop sidebar) | ☐ |
| R7 | Auth / tenant | Login + tenant routes | Forged-metal identity; no Vera sidebar | ☐ |
| R8 | Metadata sync | Compare nav to `VERIFORGE_ROUTES` | Titles, icons, critical flags match config | ☐ |

**Main routes smoke list (R1 checklist):**

| Route | Shell | Critical | Status |
|-------|-------|----------|--------|
| `/veriforge/dashboard` | VFAppShell | no | ☐ |
| `/veriforge/training` | VFAppShell | no | ☐ |
| `/veriforge/verification` | VFAppShell | no | ☐ |
| `/veriforge/compliance` | VFAppShell | **yes** | ☐ |
| `/veriforge/incidents` | VFAppShell | **yes** | ☐ |
| `/veriforge/risk` | VFAppShell | **yes** | ☐ |
| `/veriforge/audit` | VFAppShell | no | ☐ |
| `/veriforge/field-operations` | VFAppShell | no | ☐ |
| `/veriforge/inspections` (equipment) | VFAppShell | no | ☐ |
| `/veriforge/culture` | VFAppShell | no | ☐ |
| `/veriforge/predictive` | VFAppShell | **yes** | ☐ |
| `/veriforge/digital-twin` | VFAppShell | no | ☐ |
| `/veriforge/command-center` | VFAppShell | **yes** | ☐ |
| `/veriforge/emergency` | VFAppShell | **yes** | ☐ |
| `/veriforge/ledger` | VFAppShell | no | ☐ |

**Section 4 gate:** R1–R8 ☑; all critical routes show red pulse.

---

## 5. DASHBOARD TESTS

**Goal:** Dashboard forged-metal composition is correct.  
**Surface:** `/veriforge/dashboard` · `src/pages/dashboard/`  
**Refs:** `docs/VERIFORGE-DASHBOARD.md`

| # | Test | Pass criteria | Status |
|---|------|---------------|--------|
| D1 | KPI metallic headers | `VFKpiCard` / KPI headers use `metallicGradient` | ☐ |
| D2 | KPI geometry | Angular cards; steel borders; red accent on critical KPIs | ☐ |
| D3 | Angular bar rise | Bar charts animate with angular rise (not soft ease bounce) | ☐ |
| D4 | Metallic line draw | Line charts draw with metallic stroke / fade | ☐ |
| D5 | Critical alerts glow | Alerts panel critical items show red metallic glow / `redGlowPulse` | ☐ |
| D6 | Neutral alerts | Non-critical alerts use steel chrome, not forge red | ☐ |
| D7 | Grid / sections | `VFDashboardGrid` / sections align to angular spacing | ☐ |
| D8 | Shell | Dashboard wrapped in `VFAppShell`; Orbitron section titles | ☐ |

**Manual steps**

1. Open `/veriforge/dashboard` with `vf-debug`.
2. Confirm KPI headers are metallic (V11 / D1).
3. Watch chart mount animations (D3–D4).
4. Confirm critical alert row glows red (D5).

**Section 5 gate:** D1–D8 ☑.

---

## 6. MOBILE TESTS

**Goal:** Mobile forged-metal shell and components.  
**Surface:** `/veriforge/mobile/*` · `src/mobile/`  
**Debug:** `vf-debug-mobile` + `.debug-mobile-hitbox`  
**Refs:** `docs/VERIFORGE-MOBILE.md`

| # | Test | Pass criteria | Status |
|---|------|---------------|--------|
| MB1 | Active tab red glow | Bottom nav active tab → forge-red glow / accent | ☐ |
| MB2 | Angular mobile cards | `VFMobileCard` / cards → `border-radius: 0` | ☐ |
| MB3 | Panel metallicFade | Mobile panels slide / appear with `metallicFade` | ☐ |
| MB4 | Angular metallic icons | Icons from `veriforge-icons` / angular metallic set (not soft Material) | ☐ |
| MB5 | Hitboxes ≥ 44×44 | `debug-mobile-hitbox`: steel = OK, red = too small | ☐ |
| MB6 | Mobile shell | Splash → login → dashboard uses mobile shell only | ☐ |
| MB7 | Critical mobile | Mobile incidents / compliance show red critical treatment | ☐ |

**Mobile smoke paths**

| Path | Status |
|------|--------|
| `/veriforge/mobile/splash` | ☐ |
| `/veriforge/mobile/auth/login` | ☐ |
| `/veriforge/mobile/dashboard` | ☐ |
| `/veriforge/mobile/training` | ☐ |
| `/veriforge/mobile/verification` | ☐ |
| `/veriforge/mobile/compliance` | ☐ |
| `/veriforge/mobile/incidents` | ☐ |
| `/veriforge/mobile/notifications` | ☐ |
| `/veriforge/mobile/profile` | ☐ |

**Section 6 gate:** MB1–MB7 ☑; no red (too-small) hitboxes on primary nav.

---

## 7. SYSTEM TESTS

**Goal:** Each engine UI renders with forged-metal identity (shell, tokens, angular geometry, correct accents).

For every engine below, verify:

1. Page loads without error under `VFAppShell` (or mobile shell if applicable)
2. Colors / geometry / metal match §1
3. Primary actions use `VFButton` / library components where expected
4. Critical engines show red emphasis
5. Icons match category iconography

| # | Engine | Route | Critical | Pass criteria | Status |
|---|--------|-------|----------|---------------|--------|
| S1 | Training Engine | `/veriforge/training` | no | Modules / progress UI angular; steel cards; forge-red CTAs | ☐ |
| S2 | Verification Engine | `/veriforge/verification` | no | Checks / workflows render; metallic panels; steel borders | ☐ |
| S3 | Compliance Engine | `/veriforge/compliance` | **yes** | Compliance UI + `redGlowPulse` / red accent | ☐ |
| S4 | Incident Engine | `/veriforge/incidents` | **yes** | Incident list/detail; critical red glow | ☐ |
| S5 | Risk Engine | `/veriforge/risk` | **yes** | Risk UI; critical red treatment | ☐ |
| S6 | Audit Engine | `/veriforge/audit` | no | Audit tables/panels angular; steel chrome | ☐ |
| S7 | FieldOps Engine | `/veriforge/field-operations` | no | Field ops UI; metallic cards; angular icons | ☐ |
| S8 | Equipment Engine | `/veriforge/inspections` (+ site-safety) | no | Equipment/inspection UI; angular metallic iconography | ☐ |
| S9 | Culture Engine | `/veriforge/culture` | no | Culture / badges-adjacent UI; forged-metal identity | ☐ |
| S10 | Predictive Engine | `/veriforge/predictive` | **yes** | Predictive UI + critical red pulse | ☐ |
| S11 | Digital Twin UI | `/veriforge/digital-twin` | no | Twin canvas/panels metallic; angular chrome | ☐ |
| S12 | Command Center UI | `/veriforge/command-center` | **yes** | Multi-site command UI + critical red glow | ☐ |

**Extended system smoke (optional but recommended)**

| Engine / surface | Route | Status |
|------------------|-------|--------|
| Emergency | `/veriforge/emergency` | ☐ |
| Safety KPIs | `/veriforge/safety-kpis` | ☐ |
| Reports | `/veriforge/reports` | ☐ |
| Ledger | `/veriforge/ledger` | ☐ |
| Workflows | `/veriforge/workflows` | ☐ |
| Contractors | `/veriforge/contractors` | ☐ |
| Users | `/veriforge/users` | ☐ |
| Settings | `/veriforge/settings` | ☐ |

**Per-engine mini checklist (copy for failures)**

```
Engine: _______________
Route:  _______________
[ ] Shell = VFAppShell
[ ] No rounded corners (vf-debug-angular clean)
[ ] Metallic surfaces present
[ ] Steel borders on neutrals
[ ] Red only on active/critical
[ ] Motion: route slide + fade OK
[ ] Icons angular metallic
[ ] Notes: _______________
```

**Section 7 gate:** S1–S12 ☑.

---

## Automated / semi-automated checks

Run from `vera-frontend/`:

```bash
# Static forged-metal enforcement (exit 1 on issues)
npm run vf:debug:rounded
npm run vf:debug:angular
npm run vf:debug:metal
npm run vf:debug:red
npm run vf:debug:all

# Apply fixes when intentional
node scripts/veriforge/remove-rounded-corners.mjs --write
node scripts/veriforge/enforce-angular-geometry.mjs --write
node scripts/veriforge/enforce-metallic-gradients.mjs --write
node scripts/veriforge/enforce-red-accents.mjs --write

# Type / lint gates
npm run typecheck
npm run lint
```

**Suggested future automation (not required for this suite doc)**

| Spec idea | Covers |
|-----------|--------|
| Playwright visual smoke `/veriforge/*` | §4 + §7 route loads |
| Computed-style assert `border-radius === 0` | §1 geometry |
| Critical route class assert `redGlowPulse` | §3 M4 |
| Mobile hitbox bounding box ≥ 44 | §6 MB5 |

---

## Sign-off

| Gate | Owner | Date | Result |
|------|-------|------|--------|
| §1 Visual identity | | | ☐ / ☑ |
| §2 Components | | | ☐ / ☑ |
| §3 Motion | | | ☐ / ☑ |
| §4 Routing | | | ☐ / ☑ |
| §5 Dashboard | | | ☐ / ☑ |
| §6 Mobile | | | ☐ / ☑ |
| §7 Systems | | | ☐ / ☑ |
| Static `vf:debug:all` clean | | | ☐ / ☑ |
| `vf-debug*` removed for prod | | | ☐ / ☑ |

**Release rule:** Do not ship VeriForge UI changes until all seven section gates are ☑.

---

## Final goal

Provide a complete industrial QA suite ensuring the forged-metal VeriForge identity — **iron black, steel grey, forge red, safety white, metallic gradients, angular geometry, industrial motion** — is visually and functionally correct across the entire application.
