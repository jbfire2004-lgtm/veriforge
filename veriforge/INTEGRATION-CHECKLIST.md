# VeriForge Integration Checklist

Complete forged-metal identity activation across the Vera / VeriForge application.

**Brand:** Iron black `#0D0D0D` · Steel grey `#424242` · Forge red `#C62828` · Safety white `#FAFAFA`  
**Typography:** Orbitron (headings) · Exo 2 (body)  
**Geometry:** Angular (`border-radius: 0`) · Metallic gradients · Red glow active states

Use this checklist to verify every layer is installed, wired, and visually active.

---

## 1. GLOBAL THEME

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| `veriforge-tokens.ts` installed | ☐ | `vera-frontend/src/theme/veriforge-tokens.ts` |
| Theme barrel export | ☐ | `vera-frontend/src/theme/index.ts` |
| `global.css` replaced with forged-metal styles | ☐ | `vera-frontend/src/styles/global.css` |
| Global CSS imported in app | ☐ | `vera-frontend/app/globals.css` → `@import "../src/styles/global.css"` |
| Angular geometry applied globally | ☐ | `border-radius: 0` on `*`; `--vf-angular-radius: 0px` |
| Metallic gradients active | ☐ | Body `background-image: metallicGradient`; `--vf-metallic-gradient` |
| Red accent system active | ☐ | Heading underlines, focus rings, scroll thumbs `#C62828` |
| Orbitron + Exo 2 loaded | ☐ | `app/layout.tsx` (`next/font`: Orbitron, Exo_2) |
| CSS vars facade synced | ☐ | `components/veriforge/tokens.css` + `tokens.ts` |
| Token docs present | ☐ | `docs/VERIFORGE-FORGED-METAL-TOKENS.md` |

**Verify visually:** App root background is iron-black with metallic wash; headings show red underline; no rounded corners on native controls.

---

## 2. COMPONENT LIBRARY

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| `VFButton` installed | ☐ | `src/components/veriforge/VFButton.tsx` + `.module.css` |
| `VFCard` installed | ☐ | `src/components/veriforge/VFCard.tsx` + `.module.css` |
| `VFPanel` installed | ☐ | `src/components/veriforge/VFPanel.tsx` + `.module.css` |
| `VFInput` installed | ☐ | `src/components/veriforge/VFInput.tsx` + `.module.css` |
| `VFModal` installed | ☐ | `src/components/veriforge/VFModal.tsx` + `.module.css` |
| `VFAlert` installed | ☐ | `src/components/veriforge/VFAlert.tsx` + `.module.css` |
| Additional primitives | ☐ | `VFDivider`, `VFTag`, `VFProgressBar`, `VFStatusIndicator`, `VFIcon`, `VFSectionHeader`, `VFTable`, `VFToast`, `VFChart`, `VFWorkflowNode` |
| Barrel export | ☐ | `src/components/veriforge/index.ts` |
| All components use VeriForge tokens | ☐ | Import from `@/src/theme/veriforge-tokens` / `vfTokenVars` |
| All components use angular geometry | ☐ | `border-radius: 0` in CSS modules |
| All components use metallic gradients | ☐ | `--vf-metallic` / `COLORS.metallicGradient` |
| All components use red glow active states | ☐ | `SHADOWS.metallicShadow` + `veriforgeMotionClasses` |
| Component docs | ☐ | `docs/VERIFORGE-COMPONENT-LIBRARY.md` |

**Verify visually:** Buttons show forge-red fill + bevel; cards lift on hover; inputs glow red on focus; modals drop in angularly.

---

## 3. MOTION SYSTEM

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| Motion module installed | ☐ | `vera-frontend/src/motion/veriforge-motion.ts` |
| Motion stylesheet installed | ☐ | `vera-frontend/src/motion/veriforge-motion.css` |
| Motion CSS imported globally | ☐ | `app/globals.css` → `@import "../src/motion/veriforge-motion.css"` |
| Timing: fast `120ms` / medium `240ms` / heavy `400ms` | ☐ | `VERIFORGE_MOTION_TIMING` |
| Primitives defined | ☐ | `angularSlide`, `metallicFade`, `redGlowPulse`, `bevelShift`, `industrialDrop` |
| `angularSlide` applied to routing | ☐ | `src/router/VFRouteTransition.tsx` + `VFMobilePage` |
| `metallicFade` applied to content load | ☐ | `VFAppShell`, `VFRouteTransition`, charts |
| `industrialDrop` applied to modals | ☐ | `VFModal`, `VFMobileModal`, sidebar open |
| `redGlowPulse` applied to critical states | ☐ | Critical routes, KPI cards, alerts, active nav |
| Motion docs | ☐ | `docs/VERIFORGE-MOTION-SYSTEM.md` |

**Verify visually:** Route changes skew-slide; modals drop; critical surfaces pulse forge-red; `prefers-reduced-motion` disables animations.

---

## 4. ICONOGRAPHY

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| `veriforge-icons.ts` installed | ☐ | `vera-frontend/src/icons/veriforge-icons.ts` |
| Icon barrel export | ☐ | `vera-frontend/src/icons/index.ts` |
| Category set complete | ☐ | training · verification · compliance · incidents · equipment · fieldOps · risk · audit · culture · emergency · contractor |
| Angular geometry on icons | ☐ | Square caps, miter joins, plate geometry |
| Metallic gradients on icons | ☐ | `IndustrialIconShell` metal / metal-hot fills |
| Red accents on active icons | ☐ | Tone `active` / `critical` + corner accent mark |
| `VFIcon` wired to new set | ☐ | `src/components/veriforge/VFIcon.tsx` |
| Legacy catalog resolves to category icons | ☐ | `components/veriforge/icons.tsx` → `VERIFORGE_ICONS` |
| Icon docs | ☐ | `docs/VERIFORGE-ICONOGRAPHY.md` |

**Verify visually:** Sidebar / mobile nav icons are steel-outlined plates; active tabs show red stroke + glow.

---

## 5. LAYOUT SYSTEM

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| `VFAppShell` installed | ☐ | `vera-frontend/src/layouts/VFAppShell.tsx` |
| `VFHeader` installed | ☐ | `src/layouts/VFHeader.tsx` |
| `VFSidebar` installed | ☐ | `src/layouts/VFSidebar.tsx` |
| `VFContent` installed | ☐ | `src/layouts/VFContent.tsx` |
| `VFFooter` installed | ☐ | `src/layouts/VFFooter.tsx` |
| Layout barrel | ☐ | `src/layouts/index.ts` |
| Angular geometry applied | ☐ | Shared layout CSS modules |
| Metallic gradients applied | ☐ | Shell / header / footer backgrounds |
| Red accent lines | ☐ | Header bottom rail · sidebar title underline · footer top rail |
| Product shell uses layouts | ☐ | `components/veriforge/app-shell.tsx` → `VFAppShell` |
| Layout docs | ☐ | `docs/VERIFORGE-LAYOUTS.md` |

**Verify visually:** Main VeriForge pages show metallic header, steel sidebar with red active rail, black content, metallic footer.

---

## 6. ROUTING

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| Route registry installed | ☐ | `vera-frontend/src/router/veriforge-routes.ts` |
| Route provider installed | ☐ | `src/router/VFRouteProvider.tsx` |
| Route transition installed | ☐ | `src/router/VFRouteTransition.tsx` |
| App routes helper | ☐ | `src/app/routes/` |
| Main layout nav from registry | ☐ | `app/veriforge/(main)/layout.tsx` → `VERIFORGE_ROUTES` |
| All main routes wrapped in `VFAppShell` | ☐ | Via `VeriForgeAppShell` |
| Route transitions use `angularSlide` | ☐ | `VFRouteTransition` |
| Content load uses `metallicFade` | ☐ | `VFRouteTransition` + shell |
| Critical routes use `redGlowPulse` | ☐ | compliance · incidents · risk · emergency · command · predictive |
| Route metadata: title / section / icon / critical | ☐ | `VeriForgeRouteMeta` |
| Active route: red underline / rail | ☐ | Header + sidebar CSS |
| Active route: steel-grey hover | ☐ | Nav link hover `#424242` |
| Routing docs | ☐ | `docs/VERIFORGE-ROUTING.md` |

**Verify visually:** Navigate to `/veriforge/incidents` — chrome pulses red; sidebar shows red inset rail + icon.

---

## 7. DASHBOARD

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| Dashboard system installed | ☐ | `vera-frontend/src/pages/dashboard/` |
| KPI cards replaced | ☐ | `VFKpiCard` — steel-grey · red border · metallic header |
| KPI bars replaced | ☐ | `VFKpiBar` — metallic fill · critical glow |
| Charts replaced | ☐ | `VFDashboardChart` → `VFChart` |
| Alerts replaced | ☐ | `VFAlertsPanel` |
| Section headers | ☐ | `VFDashboardSection` — Orbitron + red underline |
| Grid / dividers | ☐ | `VFDashboardGrid` — angular · steel dividers |
| Metallic gradients applied | ☐ | Page + card + chart shells |
| Red accents applied | ☐ | Borders, underlines, critical glow |
| Live route wired | ☐ | `/veriforge/dashboard` → `VeriForgeDashboard` |
| Dashboard docs | ☐ | `docs/VERIFORGE-DASHBOARD.md` |

**Verify visually:** Dashboard shows angular KPI grid, metallic bars, steel charts with red lines, critical alerts glowing.

---

## 8. MOBILE UI

| Check | Status | Path / evidence |
|-------|--------|-----------------|
| Mobile system installed | ☐ | `vera-frontend/src/mobile/` |
| App mobile helper | ☐ | `vera-frontend/src/app/mobile/` |
| Mobile navigation replaced | ☐ | `VFMobileNav` — angular bottom nav · red glow active |
| Mobile cards replaced | ☐ | `VFMobileCard` / `MobileAngularCard` |
| Mobile panels replaced | ☐ | `VFMobilePanel` / `MobileMetallicPanel` |
| Mobile inputs | ☐ | `VFMobileInput` — black · steel border · red focus |
| Mobile status indicators | ☐ | `VFMobileStatus` — pass pulse · fail redGlow · pending shimmer |
| Mobile charts | ☐ | `VFMobileChart` |
| Mobile motion system active | ☐ | `VFMobilePage` (slide/fade) · `VFMobileModal` (industrialDrop) |
| Mobile iconography | ☐ | Bottom tabs use `veriforge-icons.ts` |
| Shell wired | ☐ | `app/veriforge/(mobile)/layout.tsx` → `VeriForgeMobileShell` |
| Compat facade | ☐ | `components/veriforge/mobile-app.tsx` re-exports `@/src/mobile` |
| Mobile docs | ☐ | `docs/VERIFORGE-MOBILE.md` |

**Verify visually:** Open `/veriforge/mobile/dashboard` — iron-black shell, metallic top bar, angular bottom nav with red active glow.

---

## 9. SYSTEMS

Confirm each engine surface is present under VeriForge UI + API (where applicable), and renders with forged-metal chrome via the shared shell.

| System | UI route | Engine / component | Status |
|--------|----------|--------------------|--------|
| Training Engine | `/veriforge/training` | `training-engine.tsx` | ☐ |
| Verification Engine | `/veriforge/verification` | verification / forgeCheck surfaces | ☐ |
| Compliance Engine | `/veriforge/compliance` | `compliance-engine.tsx` | ☐ |
| Incident Engine | `/veriforge/incidents` | `incident-reporting.tsx` | ☐ |
| Risk Engine | `/veriforge/risk` | `risk-assessment.tsx` | ☐ |
| Audit Engine | `/veriforge/audit` | `audit-engine.tsx` | ☐ |
| FieldOps Engine | `/veriforge/field-operations` | `field-operations.tsx` | ☐ |
| Equipment Engine | `/veriforge/inspections` | `equipment-inspection.tsx` | ☐ |
| Culture Engine | `/veriforge/culture` | `safety-culture.tsx` | ☐ |
| Predictive Engine | `/veriforge/predictive` | `safety-ai-predictive.tsx` | ☐ |
| Digital Twin | `/veriforge/digital-twin` | `safety-digital-twin.tsx` | ☐ |
| Command Center | `/veriforge/command-center` | `multi-site-command-center.tsx` | ☐ |
| Safety Blockchain Ledger | `/veriforge/ledger` | `safety-blockchain-ledger.tsx` | ☐ |
| Emergency Response | `/veriforge/emergency` | `emergency-response.tsx` | ☐ |
| Contractor / Onboarding | `/veriforge/contractors`, `/veriforge/contractor-onboarding` | contractor engines | ☐ |
| Safety KPIs | `/veriforge/safety-kpis` | `safety-kpi-intelligence.tsx` | ☐ |
| Executive Reporting | `/veriforge/reports` | `executive-reporting.tsx` | ☐ |
| Brand / Motion / Icons / Sounds | brand, motion, iconography, sounds routes | brand + motion + iconography + sound systems | ☐ |

**Backend (Nest) spot-check:** Controllers/services registered in `backend/src/modules/veriforge-api/veriforge-api.module.ts` for ledger, command center, predictive, digital twin, etc.

---

## Smoke-test script

Run through these paths after deploy / local start:

1. `/veriforge/dashboard` — KPI cards, bars, charts, alerts  
2. `/veriforge/incidents` — critical route glow  
3. `/veriforge/compliance` — critical route glow  
4. `/veriforge/ledger` — blockchain explorer  
5. `/veriforge/command-center` — multi-site command  
6. `/veriforge/mobile/dashboard` — mobile shell + bottom nav  
7. `/veriforge/mobile/verification` — forgeCheck status chips  
8. Toggle a modal — industrial drop-in / collapse  
9. Resize to mobile width on main shell — footer mobile nav appears  

---

## Sign-off

| Layer | Owner | Date | Pass |
|-------|-------|------|------|
| Global theme | | | ☐ |
| Component library | | | ☐ |
| Motion system | | | ☐ |
| Iconography | | | ☐ |
| Layout system | | | ☐ |
| Routing | | | ☐ |
| Dashboard | | | ☐ |
| Mobile UI | | | ☐ |
| Systems | | | ☐ |

**Final goal:** Entire VeriForge identity fully activated — angular geometry, metallic gradients, red accents, and industrial motion across desktop, routing, dashboard, mobile, and all safety engines.
