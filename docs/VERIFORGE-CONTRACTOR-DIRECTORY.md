# Contractor Directory

Directory profiles, compliance scoring, and hiring-client connection workflow for VeriForge.

**Design:** `Organization` remains the contractor tenant. `ContractorProfile.contractorId` = `Organization.id`.

---

## File structure

```
services/veriforge-saas-service/
  prisma/schema.prisma                          # ContractorProfile, Document, Audit, Site, Connection
  prisma/migrations/20260826100000_contractor_directory/
  src/compliance/contractor-directory-score.ts  # weights: docs 40% / audits 40% / insurance 20%
  src/services/contractor-directory.service.ts
  src/routes/contractors.routes.ts              # mounted at /contractors

vera-frontend/
  app/api/contractors/…                         # Next → SaaS proxy
  lib/contractor-directory-api.ts
  src/components/contractor-directory/
    ComplianceBadge.tsx
    ContractorDirectoryCard.tsx
    ContractorProfileView.tsx
  app/client/directory/page.tsx                 # Client list + filters
  app/client/directory/[id]/page.tsx           # Client profile
  app/verihub/directory/page.tsx                # Contractor Admin profile + inbox
```

---

## Schema (API shape)

| Field | Source |
|-------|--------|
| `contractor_id` | `ContractorProfile.contractorId` (= org id) |
| `legal_name` / `trade_name` | profile |
| `safety_rating` | derived 0–5 from compliance |
| `insurance_status` | `valid \| expiring \| expired \| missing \| unknown` |
| `compliance_score` | 0–100 weighted score |
| `contact_info` | JSON `{ email, phone, website, address, primaryContact }` |
| `documents[]` | `ContractorDocument` |
| `audits[]` | `ContractorAudit` |
| `sites[]` | `ContractorSite` |

Connections: `ContractorConnection` (`pending` → `approved` / `rejected`).

---

## Compliance formula

```
compliance = documents×0.4 + audits×0.4 + insurance×0.2
```

Implemented in `contractor-directory-score.ts`. Recalculates on document/audit writes and `POST /contractors/:id/recalculate`.

**Document Center:** When Document Center docs exist for a contractor, compliance scoring prefers those rows (see `docs/VERIFORGE-DOCUMENT-CENTER.md`).

**Audit & Evaluation:** Scored evaluation audits feed the audits weight (see `docs/VERIFORGE-AUDIT-EVALUATION.md`).

**PVS:** Program Verification contributes **15%** of directory compliance (see `docs/VERIFORGE-PROGRAM-VERIFICATION.md`). Current weights: documents 35% / audits 35% / insurance 15% / pvs 15%.

---

## API (SaaS Express)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/contractors` | Client **or** Contractor (search, filters, pagination) |
| POST | `/contractors` | Contractor Admin (`org.profile.update`) |
| GET | `/contractors/:id` | Client or Contractor |
| PATCH/DELETE | `/contractors/:id` | Own org |
| POST | `/contractors/:id/documents\|audits\|sites` | Own org |
| POST | `/contractors/:id/connect` | Hiring Client |
| GET | `/contractors/connections/inbox` | Contractor |
| POST | `/contractors/connections/:id/respond` | Contractor (approve/reject) |

Query params for list: `q`, `insuranceStatus`, `minCompliance`, `region`, `connectionStatus`, `skip`, `take`.

---

## Auth roles

| Role | Access |
|------|--------|
| **Admin / Contractor** (org JWT) | Create/update own profile, manage docs/audits/sites, approve/reject connections |
| **Client** (hiring-client JWT) | Browse directory, request connection, view profiles |
| **Reviewer** | Same browse permissions as Client (minus award if restricted elsewhere) |

---

## Integration steps

1. Migrate:

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

2. Restart SaaS API (`PORT=3020`). Ensure `app.use('/contractors', contractorsRouter)` is loaded.

3. Next.js already proxies `/api/contractors` → SaaS.

4. UI:
   - Hiring client: **Directory** in module nav → `/client/directory`
   - Contractor org: **Directory** under VeriHub → `/verihub/directory`

5. Seed a profile (contractor signed into VeriHub):

```http
POST /contractors
Authorization: Bearer <org-jwt>
{ "legalName": "Acme Contracting Ltd", "tradeName": "Acme", "region": "AB" }
```

6. Client connects:

```http
POST /contractors/<orgId>/connect
Authorization: Bearer <hiring-client-jwt>
{ "message": "Please join our prequal list" }
```

---

## Notes

- Existing `/client/contractors` review list remains (active orgs). The **Directory** is the richer, listed-profile surface with connection state.
- Vera nav: no new global module; features added under `hiringClient` and `veriHubOrg` only.
