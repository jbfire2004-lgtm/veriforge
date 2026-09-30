# VeriForge Marketing Launch Package

Complete marketing launch package that communicates the **forged-metal VeriForge identity** across all brand surfaces.

**Master tagline:** Forged for Absolute Safety  
**Tone:** Strong. Confident. Industrial. Angular. No fluff. No softness.  
**Live brand surfaces:** `/veriforge/homepage` · `/veriforge/brand` · `/veriforge/marketing` · `/veriforge/pricing` · `/veriforge/docs`

**Related:** `docs/VERIFORGE-BRAND-STORY.md` · `docs/VERIFORGE-BRAND-EXPANSION.md` · `veriforge/docs/`

---

## 1. Brand Story

### Safety engineered, not improvised

VeriForge was built on the belief that safety should be **engineered, not improvised**. Rising risk, fragmented tools, and inconsistent standards demanded an industrial-strength platform — one that unifies training, verification, compliance, and incident management with engineered precision.

VeriForge is not soft productivity software. It is a **foundation forged for absolute safety**.

### Forged-metal identity

The product looks like the promise: iron-black structure, steel edges, metallic washes, and forge-red critical accents. Every screen should feel load-bearing — a control surface, not a lifestyle app.

### Angular geometry

No soft radii. Hard corners. Bevels and rails. Workflows and UI share the same philosophy: intentional, durable, measurable.

### Industrial reliability

Systems are tenant-aware, auditable, and built to last. Reliability is a brand pillar — not a footnote.

### Precision workflows

Every module, check, and handoff is designed with engineered precision. Angular workflows. Measured outcomes. Metallic clarity.

### Narrative rail (use in copy)

1. **Belief** — Safety should be engineered, not improvised.  
2. **Context** — Fragmented tools → industrial-strength unification.  
3. **Craft** — Every workflow forged with precision.  
4. **Foundation** — Not just software — forged for absolute safety.

### Manifesto (short form for launch)

1. Safety is not optional — it is forged.  
2. Verification must be engineered with precision.  
3. Compliance must be clear, structured, and reliable.  
4. Training must be strong, modern, and measurable.  
5. Incidents must be resolved with industrial discipline.  
6. Workflows must be angular, intentional, and built to last.

Full manifesto: `/veriforge/brand` · `docs/VERIFORGE-BRAND-STORY.md`

---

## 2. Core Messaging

### Primary lines (locked)

| Line | Use |
|------|-----|
| **Forged for Absolute Safety** | Master tagline · hero · lockup with emblem |
| **Industrial-Grade Verification** | Verification / ForgeCheck surfaces |
| **Engineered Compliance** | Compliance / ForgeSeal surfaces |
| **Angular Workflows. Metallic Precision.** | Platform / product hero subhead |
| **Safety Built Like Machinery.** | Campaign / outdoor / poster punch line |

### Supporting lines

| Line | Use |
|------|-----|
| Safety engineered, not improvised. | Brand story open |
| Control surfaces for industrial safety. | Platform page |
| Critical when it matters. Clear when it counts. | Incident / risk / emergency |
| Train. Verify. Comply. Respond. | Engine stack summary |
| One forge. Every workflow. | Multi-engine / suite |

### Message map by audience

| Audience | Lead message | Proof |
|----------|--------------|-------|
| Safety leaders | Forged for Absolute Safety | Unified engines + audit trail |
| Operations | Safety Built Like Machinery | FieldOps + Command Center |
| Compliance | Engineered Compliance | Document validity + COR/OSHA alignment |
| IT / security | Industrial-grade, tenant-aware | Multi-tenant SaaS + JWT isolation |
| Buyers | Angular Workflows. Metallic Precision. | Demo dashboard + workflow builder |

### Voice rules

- Short sentences. Hard nouns. Active verbs.  
- Prefer *forge, engineer, verify, seal, escalate* over *delight, seamlessly, empower*.  
- Never soft pastel language or “friendly” SaaS clichés.  
- Red is for emphasis in layout — not for shouting every word.

---

## 3. Visual Identity

### Color

| Role | Token | Hex | Marketing use |
|------|-------|-----|---------------|
| Structure | Iron black | `#0D0D0D` | Page grounds, poster fields, video bars |
| Chrome | Steel grey | `#424242` | Rules, frames, secondary panels |
| Accent | Forge red | `#C62828` | CTAs, underlines, critical callouts, emblem spark |
| Type / icons | Safety white | `#FAFAFA` | Primary copy on dark |

**Do not** introduce purple gradients, cream editorial themes, or soft blue SaaS defaults on VeriForge brand surfaces.

### Metallic gradients

```
linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%)
```

Use on: hero headers, banner plates, KPI mock headers, emblem plates.  
Text sits on iron-black scrim — metal is atmosphere, not illegible texture.

### Angular geometry

- `border-radius: 0` on all marketing UI and mock product chrome  
- Hard rules, square badges, bevel corners  
- No pills, no soft cards, no floating rounded media

### Typography

| Role | Font | Treatment |
|------|------|-----------|
| Display / headlines | **Orbitron** | Bold, uppercase, tracking open, red underline accent |
| Body / captions | **Exo 2** | Regular, high contrast on iron black |

### Emblem

- Forged **V** mark  
- Steel outline · metallic fill · optional forge-red accent corner  
- Always angular; never rounded wordmarks

### Sub-brand accents (stripe only)

Secondary engine accents (ForgeTrain, ForgeCheck, etc.) may appear as a thin rail — **forge red remains primary CTA**. See `docs/VERIFORGE-BRAND-EXPANSION.md`.

---

## 4. Product Visuals

Capture and produce forged-metal product imagery from live routes. Prefer real UI over generic mockups.

| Asset | Source route | Shot brief |
|-------|--------------|------------|
| **Dashboard hero** | `/veriforge/dashboard` | Full shell: metallic KPI headers, angular grid, steel borders, one red critical alert |
| **Workflow builder** | `/veriforge/workflows` | Node canvas, angular connectors, metallic panels |
| **Training engine** | `/veriforge/training` | Module cards, progress bars, forge-red CTA |
| **Verification engine** | `/veriforge/verification` | Check lists / forge status, steel tables |
| **Compliance engine** | `/veriforge/compliance` | Critical red accent / pulse chrome (static for print) |
| **Incident engine** | `/veriforge/incidents` | List + detail; severity labels visible (not color-only) |
| **Risk engine** | `/veriforge/risk` | Scores / zones; angular charts |
| **Digital twin** | `/veriforge/digital-twin` | Twin canvas + metallic side panels |
| **Command center** | `/veriforge/command-center` | Multi-site command; critical glow restrained for stills |

### Shot standards

1. Iron-black environment; no white studio fake browser chrome unless framed in steel.  
2. Show Orbitron section titles with red underline.  
3. Crop to one composition — not a cluttered “dashboard collage.”  
4. Hero stills: brand + one headline + one CTA + one dominant product plane.  
5. Export: web (16:9, 1:1) · social (1:1, 9:16) · print (A3/A2 angular posters).  
6. Motion clips: 3–8s; angularSlide / metallicFade / industrialDrop only; respect reduced-motion for ads that loop aggressively.

### Naming convention

```
vf-launch-{engine}-{shot}-{ratio}.{png|mp4}
e.g. vf-launch-dashboard-hero-16x9.png
```

---

## 5. Campaign Assets

### Angular posters

| Spec | Value |
|------|-------|
| Field | `#0D0D0D` full bleed |
| Frame | 2–4px steel `#424242` inset rule |
| Accent | Single forge-red horizontal or vertical rail |
| Type | Orbitron headline · Exo 2 subline |
| Mark | Forged V + tagline |
| CTA | Angular button plate — red fill or red outline |

**Poster lines (pick one):**

- FORGED FOR ABSOLUTE SAFETY  
- SAFETY BUILT LIKE MACHINERY  
- ANGULAR WORKFLOWS. METALLIC PRECISION.

### Metallic banners (web / event / LinkedIn)

- Background: metallic gradient plate  
- Left: Orbitron headline  
- Right or below: product still with steel border  
- Red underline under headline; steel hover on digital CTAs  
- Sizes: 1200×628 · 1920×600 · 728×90 (angular crop, no rounded ads)

### Red-accent callouts

Use sparingly for:

- “Critical capability” callouts  
- Launch date / “Now forging” strips  
- Engine names on multi-engine grids  

Pattern: steel panel + 2px left red bar + safety-white text.

### Industrial typography layouts

| Layout | Structure |
|--------|-----------|
| Manifesto wall | Numbered laws, Orbitron numerals, steel rules |
| Engine grid | 2×N angular cells, icon + name + one line |
| Quote lockup | Single manifesto line, oversized Orbitron, red underscore |
| Spec sheet | Token table (colors, type, geometry) as brand “material spec” |

**Asset checklist**

- [ ] 3 poster variants (tagline / machinery / angular workflows)  
- [ ] 3 metallic banners (home, platform, launch)  
- [ ] Red-accent callout set (SVG + PNG)  
- [ ] Emblem pack (V mark, mono, reverse)  
- [ ] Typography specimen (Orbitron + Exo 2)  
- [ ] Motion bumper (2s metallicFade + red rail)

---

## 6. Website Structure

Marketing IA mapped to existing VeriForge surfaces (extend as needed).

| Page | Purpose | Primary route / target |
|------|---------|------------------------|
| **Home** | Hero brand + tagline + CTA to platform/demo | `/veriforge/homepage` |
| **Platform** | Forged-metal identity + architecture story | `/veriforge/brand` · `/veriforge/enterprise-architecture` |
| **Engines** | Training → Command Center grid | `/veriforge/marketing` + deep links per engine |
| **Pricing** | Industrial packaging / tiers | `/veriforge/pricing` |
| **Documentation** | Docs system for buyers + builders | `/veriforge/docs` |
| **Contact** | Sales / demo request | Contact CTA on marketing/pricing (wire form as needed) |

### Home (first viewport)

One composition only:

1. Forged V / **VeriForge** (hero-level brand)  
2. One headline: **Forged for Absolute Safety**  
3. One supporting line: *Safety engineered, not improvised.*  
4. One CTA group: **Request demo** · **Explore platform**  
5. One dominant product visual (dashboard hero) — full-bleed or edge-to-edge plane  

No stat strips, schedule widgets, or card grids in the first viewport.

### Engines page modules

Training · Verification · Compliance · Incidents · Risk · Audit · FieldOps · Equipment · Culture · Predictive · Digital Twin · Command Center  

Each: angular icon · one line · “View engine” → product route.

### Nav chrome (marketing)

- Iron-black / metallic header  
- Steel hover · red active underline  
- Angular geometry only  
- Do not use Vera unified workspace nav on public brand pages

---

## 7. Launch Strategy

### Phase 1 — Teaser campaign

| Element | Detail |
|---------|--------|
| Goal | Intrigue; establish forged-metal look before feature dump |
| Creative | Black field · red rail · Orbitron “FORGING…” · emblem only |
| Channels | LinkedIn, email header, event screens |
| Site | Homepage teaser mode or countdown strip (angular) |
| Duration | 1–2 weeks |
| CTA | “Get notified” / waitlist |

### Phase 2 — Platform reveal

| Element | Detail |
|---------|--------|
| Goal | Reveal identity + master tagline + dashboard hero |
| Creative | Metallic banners · “Forged for Absolute Safety” · product still |
| Channels | Website home live · PR/blog · sales teaser deck |
| Proof | Brand story page + platform architecture one-pager |
| CTA | **Request demo** · **Explore platform** |

### Phase 3 — Engine showcases

| Element | Detail |
|---------|--------|
| Goal | Depth: one engine per drop |
| Cadence | Training → Verification → Compliance → Incidents → Risk → Twin → Command Center |
| Creative | Engine poster + 6–8s UI clip + one-pager |
| Messaging | Pair master tagline with engine line (e.g. Engineered Compliance) |
| CTA | Engine deep link + demo |

### Phase 4 — Full launch

| Element | Detail |
|---------|--------|
| Goal | Full suite availability + pricing + docs |
| Creative | Full asset kit live; manifesto wall; event keynote visual |
| Channels | All owned + partner + sales blitz |
| Enablement | Pitch deck + one-pagers + engine briefs shipped |
| Success | Demo pipeline, site conversion, brand consistency audit |

### Launch calendar template

| Week | Phase | Milestone |
|------|-------|-----------|
| W1–W2 | Teaser | Emblem + “Forging” live |
| W3 | Reveal | Home + platform + dashboard hero |
| W4–W6 | Showcases | Engine drops (2–3 / week) |
| W7 | Full launch | Pricing + docs + sales kit + event |

---

## 8. Social Content

### Formats

| Format | Spec | Content |
|--------|------|---------|
| **Angular product teasers** | 1:1 or 4:5 still | Cropped UI + Orbitron line + red rail |
| **Metallic UI clips** | 9:16 / 1:1 · 3–8s | metallicFade / angularSlide on real UI |
| **Red-accent motion snippets** | 3–5s loop | Focus ring, active nav, critical alert (labeled) |

### Caption patterns

```
Forged for Absolute Safety.
[One proof line.]
#VeriForge #IndustrialSafety
```

```
Angular Workflows. Metallic Precision.
See [Engine] inside the forge.
```

```
Safety Built Like Machinery.
Not improvised — engineered.
```

### Posting rules

- Always dark forged-metal frames — no white Instagram templates  
- One message per post  
- Show real product chrome when possible  
- Critical red = intentional; don’t flood the feed with pulse loops  
- Accessibility: captions + text on image; don’t rely on color alone for “critical” claims  
- Prefer static or short motion for autoplay; avoid seizure-risk rapid flashes

### 2-week social starter pack

| Day | Asset |
|-----|-------|
| 1 | Emblem teaser |
| 2 | Tagline lockup |
| 3 | Dashboard hero still |
| 4 | Metallic UI clip (dashboard) |
| 5 | Training engine teaser |
| 6 | “Safety engineered, not improvised” manifesto line |
| 7 | Verification engine still |
| 8 | Compliance callout (Engineered Compliance) |
| 9 | Incident / critical (labeled) snippet |
| 10 | Digital twin clip |
| 11 | Command center still |
| 12 | Angular workflows line |
| 13 | Pricing / demo CTA |
| 14 | Full launch montage (8s) |

---

## 9. Sales Enablement

### One-pagers (PDF / angular web print)

| One-pager | Front | Back |
|-----------|-------|------|
| **Platform** | Tagline + dashboard hero + 3 pillars (Strength / Precision / Reliability) | Architecture bullets + CTA |
| **Safety suite** | Engine grid (icons + one line each) | Critical workflows + demo CTA |
| **Compliance** | Engineered Compliance + proof points | Standards alignment (OSHA/COR/ISO…) |
| **Operations** | Command Center + FieldOps + Twin | Escalation / multi-site story |

Layout: iron black · steel rules · Orbitron headers · single red accent rail · no rounded cards.

### Industrial pitch deck

Suggested arc (12–14 slides):

1. Title — Forged for Absolute Safety  
2. Belief — Safety engineered, not improvised  
3. Problem — Fragmented tools / rising risk  
4. Product — Forged-metal platform (dashboard hero)  
5. Identity — Visual system (color / type / geometry)  
6. Engines overview grid  
7–10. Deep dives (Training, Verification, Compliance, Incidents/Risk) as needed  
11. Digital Twin + Command Center  
12. Architecture / multi-tenant trust  
13. Pricing / packaging  
14. Close — CTA + contact  

Slide chrome: metallic header bar · steel footer · red progress rail · Exo 2 body.

### Engine-specific briefs

One brief per engine for AEs / SEs:

| Section | Content |
|---------|---------|
| Positioning line | e.g. Industrial-Grade Verification |
| Problem | 2–3 bullets |
| Capability | What the engine forges |
| Proof | UI route + API surface + customer-ready visual |
| Objection handles | Integration, tenancy, auditability |
| Demo path | Click path under `/veriforge/...` |
| Leave-behind | Matching one-pager filename |

Engines to brief: Training · Verification · Compliance · Incident · Risk · Audit · FieldOps · Equipment · Culture · Predictive · Digital Twin · Command Center.

### Sales do / don't

| Do | Don't |
|----|-------|
| Lead with tagline + industrial proof | Lead with soft “AI magic” fluff |
| Show real forged-metal UI | Show generic dashboard stock |
| Use engine briefs consistently | Invent off-brand pastel slides |
| Hand docs link `/veriforge/docs` | Point only to Vera workspace docs |

---

## Asset & channel matrix

| Surface | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---------|---------|---------|---------|---------|
| Homepage | Teaser | Reveal | Engine links | Full |
| Posters / banners | Emblem | Tagline + hero | Per-engine | Suite |
| Social | Teasers | Reveal clip | Engine drops | Montage |
| Sales kit | Teaser card | Platform one-pager + deck v1 | Engine briefs | Full kit |
| Docs | — | Getting started public | Systems pages | Complete |

---

## Brand QA before launch

- [ ] Colors match `#0D0D0D` / `#424242` / `#C62828` / `#FAFAFA`  
- [ ] No rounded corners on any campaign or web marketing chrome  
- [ ] Orbitron + Exo 2 only on brand surfaces  
- [ ] Tagline lockup correct: **Forged for Absolute Safety**  
- [ ] Product shots from live VeriForge UI  
- [ ] Red used intentionally; meaning not color-only in claims  
- [ ] CTAs angular; metallic headers present  
- [ ] Sales deck matches visual identity  
- [ ] `/veriforge/homepage`, `/marketing`, `/pricing`, `/docs` reviewed  

---

## Final goal

Produce a complete marketing launch package that communicates the forged-metal VeriForge identity — **angular, metallic, industrial, and forged for absolute safety** — across brand story, messaging, visuals, campaigns, web, launch phases, social, and sales enablement.
