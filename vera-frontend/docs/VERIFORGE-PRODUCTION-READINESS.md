# VeriForge Production-Readiness Report

**Date:** 2026-07-10  
**Scope:** Industrial design system · VeriWallet · Document platform designs  
**Verdict:** **Not production-ready as a full release.** Design system + VeriWallet UI chrome are shippable as a **frontend preview**; Document Service / Hub / Templates / Contextual views are **design-complete only**.

---

## Executive summary

| Area | Status | Production? |
|---|---|---|
| Design system docs + Figma spec | Complete | Yes (docs) |
| Color JSON + CSS variable pack | Files exist | **No** — CSS pack not wired into app |
| VeriForge UI kit (components) | Largely in place from prior work | Partial |
| VeriWallet UI (`/wallet`) | UI complete, **demo data** | **No** for financial/identity claims |
| Staff credential wallet (`/wallet/[id]`) | Existing + light chrome | Yes (existing product) |
| Document Service (DB/API) | Spec only | **No** |
| Form Template Engine | Spec only | **No** |
| Completed Documents Hub | Spec only | **No** |
| Contextual document views | Spec only | **No** |
| Typecheck (repo-wide) | ~319 error lines | **No** — CI risk |
| Git / release hygiene | Large untracked set | Needs commit plan |

**Recommended release posture:**  
Ship **Phase A** (design tokens + VeriWallet UI labeled as preview) only after wiring CSS vars and clarifying demo vs live. Hold **Phase B** (documents platform) until schema reconciliation + backend + hub UI land.

---

## 1. What is ready

### 1.1 Documentation (ship as internal SSOT)

| Document | Path |
|---|---|
| Design system guide | `docs/VERIFORGE-DESIGN-SYSTEM.md` |
| Figma component spec | `docs/VERIFORGE-FIGMA-COMPONENT-SPEC.md` |
| Document Service schema/API | `docs/VERIFORGE-DOCUMENT-SERVICE.md` |
| Form Template Engine | `docs/VERIFORGE-FORM-TEMPLATE-ENGINE.md` |
| Completed Documents Hub | `docs/VERIFORGE-COMPLETED-DOCUMENTS-HUB.md` |
| Contextual document views | `docs/VERIFORGE-CONTEXTUAL-DOCUMENT-VIEWS.md` |

These are coherent enough for engineering kickoff, with the schema gaps noted in §3.

### 1.2 Theme artifacts

- `src/theme/veriforge-tokens.ts` — live TS SSOT  
- `src/theme/veriforge-color-tokens.json` — valid JSON  
- `src/theme/veriforge-variables.css` — `:root` pack (~324 lines)  
- `src/icons/veriforge-icons.tsx` — JSX parse fix applied (was `.ts`)

### 1.3 VeriWallet frontend module

- `components/veriwallet/*` — dashboard, ledger, secure modal, permissions  
- `/wallet` renders `VeriWalletView`  
- Nav label “VeriWallet”; Hub card restyled  
- Staff lookup preserved under “Staff credentials” tab  

**No VeriWallet-specific TypeScript errors** in filtered `tsc` check.

---

## 2. Blockers (must fix before calling production)

### P0 — Product / correctness

| ID | Issue | Impact | Fix |
|---|---|---|---|
| **P0-1** | VeriWallet credits, ledger, permissions, secure actions are **demo/mock** (toast: “demo”) | Users will believe financial/identity actions persist | Wire APIs or gate UI behind “Preview” banner; disable complete/transfer in prod until live |
| **P0-2** | Document platform has **zero** migrations, APIs, or pages | Specs cannot be used in production | Implement Phase B backend + hub before any “Documents” GA claim |
| **P0-3** | `veriforge-variables.css` is **not imported** by `app/layout.tsx` / `globals.css` | CSS pack unused; dual token systems drift | `@import` or side-effect import in global CSS; map critical components to vars |
| **P0-4** | Repo `tsc` reports **~319 error lines** (pre-existing nullability, missing modules, etc.) | Release/CI failure if `tsc` is gated | Triage blockers vs allowlist; do not ship claiming clean types |

### P0 — Schema consistency (docs)

| ID | Issue | Impact | Fix |
|---|---|---|---|
| **P0-5** | Document Service uses `document_templates` + `json_schema`; Form Engine uses `templates` + `schema` | Implementation ambiguity | Pick one table name (`document_templates` recommended) and one column name (`schema` or `json_schema`); update both docs |
| **P0-6** | `template_version` required by Form Engine / Hub but **not** in base `documents` CREATE in Document Service (only ALTER in Form Engine) | Incomplete DDL | Add `template_version INTEGER NOT NULL` to canonical `documents` DDL |
| **P0-7** | Dual signature storage (JSONB on `documents` + `document_signatures`) without enforced sync in code | Audit drift risk | Specify transactional write helper as mandatory; add DB constraint or trigger later |

---

## 3. High-priority gaps (P1)

| ID | Issue | Recommendation |
|---|---|---|
| **P1-1** | No `/documents/completed` route or nav entry | Add to `vera-nav-config` when hub is built; today only `/core/documents` / `/pm/documents` exist |
| **P1-2** | No report-pack or `document_links` implementation | Required for hub actions; stub APIs or hide actions until ready |
| **P1-3** | WorkerWalletView only partially industrialized | Finish chrome pass or accept as legacy credential surface |
| **P1-4** | `LeftNav` still labels “Wallet” | Align to VeriWallet for consistency |
| **P1-5** | No automated tests for `components/veriwallet` | Add smoke tests: tab render, modal two-step, locked action disabled states |
| **P1-6** | Domain casing: prose “VERICore/VERIPM” vs SQL `VERICORE`/`VERIPM` | Document API wire format as uppercase enums only |
| **P1-7** | Retention / export / virus-scan for attachments | Spec mentions; no ops runbooks or jobs |
| **P1-8** | RBAC predicates reference `worker_user_map`, supervisor job lists | Confirm these tables/APIs exist in backend or define them |
| **P1-9** | Large untracked/uncommitted change set | Structured PR split: (1) tokens/docs (2) VeriWallet UI (3) icons fix (4) later documents |

---

## 4. Medium / polish (P2)

- Figma library not verified against live components (spec exists; library build is manual).  
- Light vs dark canvas: Hub/Wallet light panels vs Core dark `vfSurface` — document when to use which.  
- Social-home / legacy shells may still bypass industrial nav rules.  
- Keyset pagination for completed hub is designed but not implemented.  
- Optional `location_q` ILIKE called out as expensive — keep disabled by default.  
- Break-glass unlock documented; ensure it is **not** exposed in UI by default.

---

## 5. Design-doc cross-check

| Check | Result |
|---|---|
| Palette consistent across docs/tokens | Pass (`#2A2E33` … `#B33A3A`) |
| Red = critical only | Pass in docs + VeriWallet UI |
| Document list = summary DTO, no content_data | Pass in hub/contextual specs |
| Contextual views reuse global model | Pass (no duplicate tables) |
| Template immutability story | Pass conceptually; DDL gap P0-6 |
| Table naming Document vs Form Engine | **Fail** — P0-5 |
| CSS vars naming vs JSON tokens | Pass (aligned concepts); wiring missing P0-3 |
| Nav architecture (no global module sidebars) | Pass in design system; document hub not wired |

---

## 6. Security & compliance readiness

| Topic | Status |
|---|---|
| Multi-tenant `company_id` on documents | Designed, not implemented |
| Server-side RBAC for hub/contextual | Designed, not implemented |
| Audit log append-only | Designed, not implemented |
| Locked documents immutable | Designed; VeriWallet modal is UI-only |
| Attachment private storage + signed URLs | Designed only |
| VeriWallet “secure” two-step | UX only — **not** a security control until backend exists |

**Do not market VeriWallet secure actions or Document audit trails as live until backends enforce them.**

---

## 7. Suggested production push plan

### Phase A — Frontend industrial preview (near-term)

1. Import `veriforge-variables.css` into global styles.  
2. Add visible **Preview / Demo data** banner on VeriWallet credit/ledger/permissions tabs.  
3. Disable or no-op secure confirms in production builds without API.  
4. Commit/PR: tokens + docs + VeriWallet UI + icons rename.  
5. Smoke-test `/wallet`, Hub card, staff `/wallet/[id]`.  
6. Do **not** gate on full-repo `tsc` green unless triaged; track P0-4 separately.

### Phase B — Document platform MVP

1. Reconcile schema (P0-5, P0-6, P0-7) into one migration.  
2. Implement Document Service CRUD + complete/archive + indexes.  
3. Template publish/version APIs + AJV validation.  
4. Build `/documents/completed` hub + RBAC.  
5. Add Worker / Job / Asset document tabs as query wrappers.  
6. Report packs + links as follow-on.

### Phase C — Hardening

1. Clear or quarantine remaining `tsc` errors.  
2. E2E: create FLHA → complete → appear in hub + worker tab.  
3. Load test completed-documents query at 50k rows/company.  
4. Retention job + export audit verification.

---

## 8. Go / No-Go checklist

| Criterion | Go? |
|---|---|
| Design docs approved for eng kickoff | **GO** |
| Industrial token files present | **GO** |
| VeriWallet live credits/ledger | **NO-GO** |
| Document Service live | **NO-GO** |
| CSS variables active in app | **NO-GO** until import |
| Clean typecheck | **NO-GO** (~319 lines) |
| Security controls server-enforced | **NO-GO** for new surfaces |

**Final call:** **NO-GO for full production.**  
**Conditional GO** for an internal **UI/design preview** after Phase A items 1–3.

---

## 9. Artifact index

```
docs/VERIFORGE-DESIGN-SYSTEM.md
docs/VERIFORGE-FIGMA-COMPONENT-SPEC.md
docs/VERIFORGE-DOCUMENT-SERVICE.md
docs/VERIFORGE-FORM-TEMPLATE-ENGINE.md
docs/VERIFORGE-COMPLETED-DOCUMENTS-HUB.md
docs/VERIFORGE-CONTEXTUAL-DOCUMENT-VIEWS.md
docs/VERIFORGE-PRODUCTION-READINESS.md          ← this report

src/theme/veriforge-tokens.ts
src/theme/veriforge-color-tokens.json
src/theme/veriforge-variables.css
src/icons/veriforge-icons.tsx

components/veriwallet/*
app/wallet/page.tsx
```

---

## Repair log (2026-07-10)

Phase A + Phase B foundation repairs:

| Item | Status |
|---|---|
| P0-3 Import `veriforge-variables.css` in `app/globals.css` | **Done** |
| P0-1 VeriWallet Preview banner + non-persisting secure actions | **Done** (`NEXT_PUBLIC_VERIWALLET_LIVE`) |
| P0-5/6/7 Schema reconciliation in docs | **Done** |
| LeftNav label → VeriWallet | **Done** |
| Shared `lib/documents` constants + API client stubs | **Done** |
| SQL migration draft `docs/sql/001_document_service.sql` | **Done** |
| Completed Documents hub UI `/documents/completed` | **Done** |
| In-memory preview store + live list API | **Done** |
| Contextual APIs (worker/job/project/asset) | **Done** |
| Contextual panels mounted (worker / project / equipment) | **Done** |
| P0-2 Full Postgres Document Service (CRUD/complete/archive) | **Open** |
| P0-4 Repo-wide tsc debt | **Open** |

See also: Phase A/B/C plan above.

