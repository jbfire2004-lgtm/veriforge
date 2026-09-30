# Training Partners

Program for content providers, academies, and delivery partners who build **certification** and **customer training** on VeriForge.

---

## Certification program (partner trainers)

Training partners may deliver:

| Track | Audience | Outcome |
|-------|----------|---------|
| Forge Certified prep | New partner individuals | Entry credential |
| Alloy Certified prep | Delivery leads | Mid credential |
| Customer admin academy | Customer admins | Product proficiency (non-partner badge) |
| Engine deep-dives | SEs | Training / Compliance / Incidents / etc. |

Partner trainers must themselves hold **≥ Alloy Certified** to teach Alloy prep, and **Titanium Certified** to teach Titanium architecture labs.

See [`../certification/`](../certification/).

---

## Angular training modules

All partner-authored modules in VeriForge Training Engine must follow forged-metal UX:

| Rule | Spec |
|------|------|
| Geometry | Angular cards/panels — `border-radius: 0` |
| Shell | Delivered inside VF training UI / VFAppShell |
| Structure | Clear sections · Orbitron titles · Exo 2 body |
| Motion | metallicFade on section load; no playful bouncy UI |
| A11y | safetyWhite text; progress not color-only |

**API:** `/veriforge/training/modules` (create / assign / progress)  
**UI:** `/veriforge/training`

### Module template (content)

1. Objective (one industrial sentence)  
2. Why it matters (risk / compliance)  
3. Steps (angular numbered list)  
4. Check / verification handoff  
5. Summary + forge-red CTA (“Mark complete” / “Take exam”)  

---

## Metallic gradient course templates

Partner course headers use:

```
background: linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 50%, #424242 100%);
border: 1px solid #424242;
border-radius: 0;
```

- Course title: Orbitron uppercase + **2px `#C62828` underline**  
- Thumbnail: angular crop; steel frame; optional forged V watermark  
- Lesson list: steel dividers; no pills  

Provide Figma/HTML template via partner portal (match `MARKETING-LAUNCH` type rules).

---

## Red accent progress indicators

| Element | Spec |
|---------|------|
| Progress track | Steel grey `#424242` |
| Progress fill | Forge red `#C62828` |
| Label | Text percentage or “In progress / Complete” (not color alone) |
| Component | Prefer `VFProgressBar` with `aria-label` |
| Critical overdue | Red accent border + “Overdue” text |

```tsx
<VFProgressBar value={72} label="Certification progress" />
```

---

## Training partner obligations

1. Content accuracy reviewed annually  
2. No soft/consumer visual redesign of VeriForge training chrome  
3. Completions can flow to Verification/Compliance where contracted  
4. Tenant isolation when delivering multi-customer academies  
5. Report completion metrics to PSM quarterly (Alloy+)  

## Benefits for training partners

- Course template pack (metallic / angular)  
- Listing under Training Partners directory  
- Revenue share on paid academies (per agreement)  
- Early access to Training Engine features  
- Co-marketing for flagship courses (Alloy+)  

## Getting started

1. Apply as Training Partner (Forge tier minimum)  
2. Complete Forge Certified  
3. Receive sandbox tenant + course templates  
4. Publish first module under `/veriforge/training`  
5. Request Alloy upgrade after 5 customer deployments or 3 certified courses live  
