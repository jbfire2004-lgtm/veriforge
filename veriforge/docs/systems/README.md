# System Documentation

Industrial engines and command surfaces. Each UI must render under `VFAppShell` (or mobile shell) with forged-metal identity.

| Engine | Route | Critical | Icon category |
|--------|-------|----------|---------------|
| Training | `/veriforge/training` | no | `training` |
| Verification | `/veriforge/verification` | no | `verification` |
| Compliance | `/veriforge/compliance` | **yes** | `compliance` |
| Incident | `/veriforge/incidents` | **yes** | `incidents` |
| Risk | `/veriforge/risk` | **yes** | `risk` |
| Audit | `/veriforge/audit` | no | `audit` |
| FieldOps | `/veriforge/field-operations` | no | `fieldOps` |
| Equipment | `/veriforge/inspections` (+ site-safety) | no | `equipment` |
| Culture | `/veriforge/culture` | no | `culture` |
| Predictive | `/veriforge/predictive` | **yes** | — |
| Digital Twin | `/veriforge/digital-twin` | no | — |
| Command Center | `/veriforge/command-center` | **yes** | — |

API base: `backend/src/modules/veriforge-api/controllers/`

---

## Training Engine

Modules, assignments, progress.  
**API:** `GET/POST /veriforge/training/modules`, assign, progress  
**UI:** Angular cards, steel progress bars, forge-red CTAs

## Verification Engine

Forge checks / workflows / status.  
**API:** `/veriforge/verification`  
**UI:** Check lists, workflow nodes, metallic panels

## Compliance Engine

Document validity, COR/OSHA-style alignment.  
**API:** `/veriforge/compliance`  
**UI:** Critical red accent / `redGlowPulse`

## Incident Engine

Capture → investigate → close.  
**API:** `/veriforge/incidents`  
**UI:** Critical list/detail; alerts with severity text

## Risk Engine

Hazard scoring and zones.  
**API:** `/veriforge/risk`  
**UI:** Critical treatment; charts with labels (not color-only)

## Audit Engine

Audit trails and reviews.  
**API:** `/veriforge/audit`  
**UI:** Angular tables, steel chrome

## FieldOps Engine

Field operations and site activity.  
**API:** `/veriforge/field-operations`  
**UI:** Metallic cards, fieldOps icons

## Equipment Engine

Inspections and equipment state (also site-safety).  
**API:** `/veriforge/inspections`, `/veriforge/site-safety`  
**UI:** Equipment iconography, angular forms

## Culture Engine

Safety culture / engagement (badges-adjacent).  
**API:** `/veriforge/culture`, `/veriforge/badges`  
**UI:** Culture icons, non-critical accents

## Predictive Engine

Safety AI / predictive models and zones.  
**API:** `/veriforge/predictive`  
**UI:** Critical; model cards; metallic charts  
**Docs:** `docs/VERIFORGE-SAFETY-AI-PREDICTIVE.md`

## Digital Twin

Site twin, hazards, simulation controls.  
**API:** `/veriforge/digital-twin`  
**UI:** Twin canvas, angular chrome  
**Docs:** `docs/VERIFORGE-SAFETY-DIGITAL-TWIN.md`

## Command Center

Multi-site command, alerts, escalation.  
**API:** `/veriforge/command-center`  
**UI:** Critical multi-site dashboard  
**Docs:** `docs/VERIFORGE-MULTI-SITE-COMMAND-CENTER.md`

---

## QA

Run `veriforge/QA-SUITE.md` §7 for visual/functional gates on every engine.
