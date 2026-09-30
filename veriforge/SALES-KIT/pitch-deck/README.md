# Pitch Deck — VeriForge Enterprise

Angular slide layouts for the industrial pitch. Build in PowerPoint/Keynote/Figma using these specs, or present from `/veriforge/brand` + live product.

## Visual system (every slide)

| Element | Spec |
|---------|------|
| Background | `#0D0D0D` or metallic gradient plate |
| Panels / rules | `#424242` |
| Accent lines | `#C62828` — 2px header underline or left rail |
| Section headers | Metallic gradient bar + Orbitron uppercase |
| Body | Exo 2 · `#FAFAFA` |
| Geometry | `border-radius: 0` — square frames only |
| Emblem | Forged **V** + optional tagline |

**Layout grid:** 12-column angular · 24px margins · steel hairline footer with slide number.

**Do not:** soft shadows stacks, purple gradients, rounded cards, stock “happy workers” collage as hero.

---

## Slide 01 — Title

**Header (metallic):** VERIFORGE  
**Headline (Orbitron):** FORGED FOR ABSOLUTE SAFETY  
**Sub:** Safety engineered, not improvised.  
**Footer:** Confidential · Enterprise briefing  

Visual: Forged V on iron black + thin red rail.

---

## Slide 02 — Problem (fragmented safety systems)

**Section bar:** THE PROBLEM  

**Headline:** Fragmented safety systems create risk.

**Bullets:**
- Training in one tool · verification in another · compliance in spreadsheets  
- Incidents captured late — or not at all  
- No single tenant-aware source of truth  
- Inconsistent standards across sites and contractors  
- Leaders cannot see critical risk in one command surface  

**Callout (red rail):** Improvised safety does not scale.

---

## Slide 03 — Solution (VeriForge unified platform)

**Section bar:** THE SOLUTION  

**Headline:** One forge. Every safety workflow.

**Body:** VeriForge unifies training, verification, compliance, incidents, risk, field operations, and executive command — on an industrial, multi-tenant platform with forged-metal clarity.

**Pillars (3 angular cells):**
| Strength | Precision | Reliability |
|----------|-----------|-------------|
| Load-bearing systems | Angular workflows | Forged-metal clarity |

**CTA line:** Not just software — a foundation forged for absolute safety.

---

## Slide 04 — Engines overview

**Section bar:** THE ENGINES  

**Headline:** Industrial engines. One platform.

| Engine | One line |
|--------|----------|
| Training | Strong, modern, measurable learning |
| Verification | Industrial-grade checks and forge status |
| Compliance | Engineered document validity |
| Incidents | Capture → investigate → close |
| Risk | Hazard scoring with discipline |
| Audit | Trails built to last |
| FieldOps | Operations at the edge |
| Equipment | Inspections and uptime |
| Culture | Engagement that sticks |
| Predictive | AI that anticipates risk |
| Digital Twin | Site truth, simulated |
| Command Center | Multi-site critical command |

Visual: angular icon grid (VeriForge icons) — steel cells, red accent on hover/selected in live deck.

---

## Slide 05 — Multi-tenant architecture

**Section bar:** ARCHITECTURE  

**Headline:** Tenant-aware. Stateless. Auditable.

**Bullets:**
- JWT + `tenantId` isolation — no cross-tenant leakage  
- Shared or dedicated data modes  
- Per-tenant storage buckets  
- API envelope: `{ status, data, meta }` with `tenantId`, `userId`, `timestamp`  
- Horizontal scale · enterprise security posture  

**Diagram cue:** Presentation → Application → API → Data/Storage → Security/Infra (angular layered stack).

Deep dive: `docs/VERIFORGE-ENTERPRISE-ARCHITECTURE.md` · `docs/VERIFORGE-MULTI-TENANT-SAAS.md`

---

## Slide 06 — Industrial UI identity

**Section bar:** IDENTITY  

**Headline:** Angular Workflows. Metallic Precision.

| Token | Value |
|-------|-------|
| Iron black | `#0D0D0D` |
| Steel grey | `#424242` |
| Forge red | `#C62828` |
| Type | Orbitron + Exo 2 |
| Geometry | Angular — no soft radii |

**Proof visual:** Dashboard hero still (`/veriforge/dashboard`).

**Line:** Safety Built Like Machinery.

---

## Slide 07 — Predictive AI

**Section bar:** PREDICTIVE  

**Headline:** See risk before it forges into failure.

**Bullets:**
- Models and zones for proactive intervention  
- Analytics tied to operational reality  
- Critical UI treatment when stakes are high  
- Complements — does not replace — engineered workflows  

**Route:** `/veriforge/predictive`  
**Leave-behind:** Predictive Engine one-pager

---

## Slide 08 — Digital Twin

**Section bar:** DIGITAL TWIN  

**Headline:** The site, forged in software.

**Bullets:**
- Hazards, equipment, and controls in one twin surface  
- Simulate before you escalate  
- Metallic angular chrome for operator clarity  
- Bridges field truth and command decisions  

**Route:** `/veriforge/digital-twin`

---

## Slide 09 — Command Center

**Section bar:** COMMAND CENTER  

**Headline:** Multi-site command. Critical when it counts.

**Bullets:**
- Sites, alerts, incidents in one industrial console  
- Acknowledge · escalate · emergency actions  
- Forge-red critical emphasis with labeled severity  
- Built for leaders who cannot afford fragmented views  

**Route:** `/veriforge/command-center`

---

## Slide 10 — ROI + outcomes

**Section bar:** OUTCOMES  

**Headline:** Industrial strength. Measurable return.

| Lever | Directional outcome* |
|-------|----------------------|
| Training time | ↓ time-to-competency |
| Verification | ↑ automation · ↓ manual checks |
| Compliance | ↓ expiry surprises · ↑ audit readiness |
| Incidents | ↓ recurrence · ↑ close discipline |
| Equipment | ↑ uptime · ↓ inspection lag |
| Culture | ↑ engagement · measurable participation |

\*Use customer-specific inputs in [`../roi/`](../roi/).

**Close line:** Forged for Absolute Safety.  
**CTA:** Request technical demo · Run ROI model · Review industry brief  

---

## Optional appendix slides

- Security & tenancy FAQ  
- Implementation / rollout phases (`VERIFORGE-GLOBAL-DEPLOYMENT-PLAYBOOK`)  
- Pricing packaging (`/veriforge/pricing`)  
- Live demo agenda  

## Delivery checklist

- [ ] 10 core slides built in brand chrome  
- [ ] Product stills from live `/veriforge/*` UI  
- [ ] Speaker notes (1–2 lines per slide)  
- [ ] PDF export + editable master  
- [ ] Aligned with `MARKETING-LAUNCH.md` messaging  
