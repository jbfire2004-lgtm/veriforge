# VeriForge Orientation Element — UI/UX Spec

Flagship experience for VeriForge Orientation: premium industrial visual language, clear admin workflows, effortless worker flows, and a focused AI co-pilot.

**Companions:** [orientation-frontend-architecture.md](./orientation-frontend-architecture.md) · Backend SOA canvas · System architecture canvas

---

## Goals

| Audience | Outcome |
|----------|---------|
| Admins | Confidence — create, require, publish, monitor without ambiguity |
| Workers | Effortlessness — one CTA to start/resume; finish into wallet |
| AI | Strong presence in the Editor rail only — never overwhelming |

---

## 1. Visual language

### Aesthetic

- **Bold industrial** — dark neutrals (graphite / slate), light text on chrome
- **Action accent** — safety blue for primary buttons and active rails only
- **Cards** — orientations and requirements as interactive cards (left accent rail when selected/active)
- **Radius** — 3px industrial (platform `--radius-sm` / `--vera-badge-radius`)
- **Status** — industrial badges (Draft / Published / Deprecated · Completed / Pending / Expired), **not** rounded-full marketing pills

Align with `app/vera-tokens.css` and SMS/SF shells. Avoid purple gradients, cream editorial layouts, and multi-layer glow.

### Typography

| Level | Use |
|-------|-----|
| Title | Orientation name — semibold, dominant |
| Meta | type · contentMode · version · company/project |
| Caption | Due / expiry dates (tabular nums) |
| Badge | Status + gating warnings |

### Iconography (by type)

| Type | Signal |
|------|--------|
| Company | Building |
| Site | Map pin |
| Project | Clipboard |
| Safety | Shield |
| Trade | Wrench |
| Union dispatch | Users |

---

## 2. Company Orientation Admin

### OrientationDashboard

**Top bar**

- Primary: **Create Orientation**
- Secondary: **Upload Orientation**

**Layout**

- Left: filters (type, status, version, contentMode)
- Right: card grid/list

**Card content**

- Title, type, contentMode, version, completion rate
- Status badge: Draft | Published | Deprecated
- Selected/active card: 3px left accent rail

### OrientationEditor

**Three panes**

| Pane | Role |
|------|------|
| Left | Block list (slide, text, video, quiz, policy) — reorder / select |
| Center | Live preview of selected block / asset |
| Right | AI assistant (co-pilot) |
| Bottom | Version info · Save draft · Publish |

**AI panel — prompts first**

- “Describe your site; I’ll build an orientation”
- “Paste your safety rules; I’ll structure them”
- “Upload your PDF; I’ll convert it”

**AI actions**

- Generate · Refine · Summarize · Localize

**AI UX rules**

- Right rail only; collapse by default below 1024px
- Never auto-run generative actions on open
- Output lands as draft blocks — admin always confirms Save

**Published edits**

- Always create a new draft version
- Publish confirm: “Workers may need reorientation” + affected count
- Rollback restores prior active version; completion ledger unchanged

---

## 3. Worker UX (App + Web)

### OrientationHome

1. **Gating banner** (when blocked) — “You must complete {X} before {arrival|dispatch|assignment}” + **Start now**
2. **Required before arrival** (and/or dispatch/assignment groupings)
3. **Recommended** (optional)

**Row**

- Title · company/project · due before · status
- Single primary CTA: **Start** or **Resume**

### OrientationPlayer

| Region | Content |
|--------|---------|
| Top | Title + progress bar + step / time hint |
| Center | PDF / video / slide / quiz / policy |
| Bottom | Back · Save & exit · Next (primary) |

**Quiz**

- Single or multi-select
- Prefer end-of-module summary; optional immediate feedback for critical safety items
- Fail → retry quiz block (not full restart)

**Policy ack**

- Required checkbox + optional signature; both gate Finish when required

**Completion success**

- Badge · completion date · expiry date
- **Add to wallet** (primary)
- **Return to list**

---

## 4. Wallet UX

### OrientationCard

- Title · company/project
- Status: Completed | Pending | Expired
- QR when Completed (and unexpired) for on-site verification
- Tap → Player (pending) or completion details (completed)

Verification uses Profile / completion ledger (workerId + orientationId + version + expiry) — QR is a convenience payload, not sole authority.

---

## 5. Interaction details

| Topic | Behavior |
|-------|----------|
| Inline validation | Blur-level field errors; Publish blocked until required meta + ≥1 block |
| Undo / rollback | Version history → restore prior active |
| Published changes | Draft version + reorient impact warning |
| Gating | Clear copy + direct Start link |
| a11y | Focus order panes → footer; labeled controls; 44px targets; keyboard move for blocks |

---

## 6. Design flows

### Admin

```
Create / Upload → Editor (+ AI) → Save draft
  → RequirementManager (who / when)
  → Publish (reorient warning if needed)
  → Dashboard monitor completions
```

### Worker

```
Assigned → notified → OrientationHome
  → Start / Resume → Player → Complete
  → Add to wallet → Site verify (QR / gate allowed)
```

---

## 7. Implementation notes

- Shells: admin = WorkspaceShell + ModuleBar (PM); worker list = SignedInVeraLayout; player = minimal chrome
- Components map to FE architecture: Dashboard · Editor · RequirementManager · WorkerOrientationList · OrientationPlayer · wallet OrientationCard
- Tokens: platform `--vera-*` / SF theme; status via `.vera-status` / `SmsStatusBadge`

---

## Related canvases

- `VeriForge-Orientation-Element-UI-UX.canvas.tsx` — visual wireframes
- `VeriForge-Orientation-Frontend-Architecture.canvas.tsx`
- `VeriForge-Orientation-Backend-SOA.canvas.tsx`
