# Audit & Evaluation

Template-driven contractor audits with weighted section scoring, reviewer assignment, findings, and corrective actions. Scores sync into Contractor Directory compliance (40% audit weight).

**Prerequisites:** Contractor Directory profile. Document Center dashboard is snapshotted when an audit is created (when available).

---

## File structure

```
services/veriforge-saas-service/
  prisma/schema.prisma
    # AuditTemplate, AuditTemplateSection, AuditTemplateQuestion
    # EvaluationAudit, AuditResponse, AuditFinding, CorrectiveAction
  prisma/migrations/20260826120000_audit_evaluation/
  src/audit-evaluation/scoring-engine.ts
  src/audit-evaluation/template-builder.ts
  src/services/audit-evaluation.service.ts
  src/routes/audits.routes.ts                 # mounted at /audits

vera-frontend/
  app/api/audits/…                            # Next → SaaS proxy
  lib/audit-evaluation-api.ts
  src/components/audit-evaluation/
    AuditList.tsx
    AuditReviewScreen.tsx                     # scoring UI + findings
    CorrectiveActionTracker.tsx
    TemplateBuilderPanel.tsx
    AuditStatusBadge.tsx
  app/verihub/audits/page.tsx
  app/verihub/audits/[id]/page.tsx
```

---

## Schema

| Field | Source |
|-------|--------|
| `audit_id` | `EvaluationAudit.id` |
| `contractor_id` | org / directory profile id |
| `template_id` | `AuditTemplate.id` |
| `score` | overall 0–100 (weighted) |
| `reviewer_id` | assigned reviewer user id |
| `findings[]` | `AuditFinding` |
| `corrective_actions[]` | `CorrectiveAction` |
| `status` | `draft \| assigned \| in_review \| scored \| closed \| cancelled` |

Templates: sections with `weight`, questions with `weight`, `maxScore`, `questionType` (`score`, `yes_no`, `text`, `na`). Optional `documentCategoryHint` links questions to Document Center categories.

---

## Scoring engine

`scoreAudit(sections, answers)` in `scoring-engine.ts`:

1. Question → percent of `maxScore` (yes/no maps to 0 / max)
2. Section score = weighted average of question percents
3. Overall = weighted average of section scores by section `weight`
4. Finalize maps score → directory result: ≥80 pass, ≥60 conditional, else fail

---

## API (`/audits`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/audits/templates` | Platform + org templates (seeds default safety template) |
| POST | `/audits/templates` | Create org template (sections + questions) |
| PUT | `/audits/templates/:id` | Replace org template definition |
| POST | `/audits/templates/:id/clone` | Clone platform → org |
| GET | `/audits` | List (`contractorId`, `status`, `reviewerId`) |
| POST | `/audits` | Create audit (snapshots Document Center dashboard) |
| GET | `/audits/:auditId` | Full audit + template + responses + findings + CAs |
| POST | `/audits/:auditId/assign` | Reviewer assignment workflow |
| POST | `/audits/:auditId/start` | `in_review` |
| POST | `/audits/:auditId/score` | `{ answers[], finalize? }` |
| POST | `/audits/:auditId/close` | Close scored audit |
| POST | `/audits/:auditId/findings` | Add finding |
| POST | `/audits/:auditId/corrective-actions` | Add CA |
| GET | `/audits/corrective-actions/:contractorId` | CA tracker list |
| PATCH | `/audits/corrective-actions/item/:actionId` | Update CA status |

Next proxies: `/api/audits` → SaaS `/audits`.

---

## Integrations

| System | Behavior |
|--------|----------|
| **Document Center** | On create, stores `documentSnapshot` from dashboard API |
| **Contractor Directory** | Finalize creates/updates `ContractorAudit` (`directoryAuditId`); `recalculateCompliance` prefers scored `EvaluationAudit` rows for the audits 40% weight |
| **Notifications** | Assign + scored events |

---

## Integration steps

1. **Migrate**
   ```bash
   cd services/veriforge-saas-service
   npx prisma migrate deploy
   npx prisma generate
   ```
2. Ensure Contractor Directory profile exists for the org.
3. Open **VeriHub → Audits** (`/verihub/audits`).
4. Create audit from the seeded **Safety prequalification** template (or clone/customize).
5. Assign reviewer → score sections → finalize → close.
6. Confirm directory compliance score updates (`POST /contractors/:id/recalculate` if needed).

---

## UI (Vera nav)

- Feature: VeriHub → **Audits** (`vera-nav-config.ts`)
- Shell: `VeriHubConsoleShell`
- Screens: audit list, review/scoring, CA tracker, template builder panel
