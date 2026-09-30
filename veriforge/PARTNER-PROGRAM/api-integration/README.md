# API Integration — Partner Guide

Tenant-aware integration rules for ISVs, integrators, and automation partners.

**Module:** `backend/src/modules/veriforge-api`  
**Docs:** `veriforge/docs/api/` · `docs/VERIFORGE-MULTI-TENANT-SAAS.md` · `docs/VERIFORGE-SAFETY-BLOCKCHAIN-LEDGER.md`

---

## 1. Tenant-aware API rules

### Envelope

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "tenantId": "tenant-alloy",
    "userId": 42,
    "timestamp": "2026-07-10T05:00:00.000Z",
    "forgeStatus": "verified"
  }
}
```

### Hard rules

1. Every request is scoped to a **single** `tenantId`  
2. JWT `tenantId` must match route param / header — mismatch → deny  
3. Never batch cross-tenant reads in one credential  
4. Logs and webhooks must stamp `tenantId`, `userId`, `timestamp`  
5. Partner apps store tokens per tenant — no global superkey in customer prod without Titanium review  

### Headers (typical)

| Header | Purpose |
|--------|---------|
| `Authorization: Bearer <jwt>` | Auth |
| `X-VeriForge-Tenant-Id` | Explicit tenant (when required) |
| `X-Request-Id` | Trace |

---

## 2. Authentication

| Endpoint | Use |
|----------|-----|
| `POST /veriforge/auth/login` | User login (`email`, `password`, optional `tenantId` / `tenantSlug`) |
| `POST /veriforge/tenants/auth/login` | Tenant-aware partner/customer login |
| `POST /veriforge/auth/register` | Registration where enabled |

JWT claims include `sub`, `email`, `role`, **`tenantId`**.  
RBAC: `VeriForgeRbacGuard` + permission scopes (e.g. `TRAINING_VIEW`).

**Partner service accounts:** Issued per tenant (or partner-managed MSP model under agreement). Rotate keys; no shared prod passwords in scripts.

---

## 3. Data isolation

| Layer | Expectation |
|-------|-------------|
| API | Guard rejects cross-tenant |
| DB | Shared (`tenantId` filter) or dedicated connection |
| Storage | `veriforge-tenant-{slug}` buckets |
| Ledger | `tenantId` on every block |
| Twin | Ingestion payloads must include tenant + site keys |

**Partner anti-patterns (grounds for suspension):**

- Using one token to iterate all tenants  
- Caching mixed-tenant data in one blob without partition  
- Logging PII without tenant partition  

---

## 4. Webhooks

Partners subscribe to tenant-scoped events (enablement by tier).

### Event categories (illustrative)

| Category | Examples |
|----------|----------|
| Training | `training.module.completed`, `training.assignment.created` |
| Verification | `verification.check.passed`, `verification.check.failed` |
| Compliance | `compliance.document.expiring`, `compliance.document.expired` |
| Incidents | `incident.created`, `incident.closed` |
| Command | `command.alert.created`, `command.alert.acked` |
| Ledger | `ledger.block.committed` |
| Twin | `twin.hazard.updated`, `twin.simulation.completed` |

### Payload shape

```json
{
  "id": "evt_...",
  "type": "incident.created",
  "createdAt": "2026-07-10T05:00:00.000Z",
  "tenantId": "tenant-alloy",
  "data": {},
  "meta": {
    "tenantId": "tenant-alloy",
    "userId": null,
    "timestamp": "2026-07-10T05:00:00.000Z"
  }
}
```

### Partner duties

- Verify signatures (HMAC) when provided  
- Respond 2xx quickly; async process  
- Idempotent handling on `id`  
- Retry safely; no cross-tenant side effects  

---

## 5. Safety blockchain integration

**API prefix:** `/veriforge/ledger`  
**Docs:** `docs/VERIFORGE-SAFETY-BLOCKCHAIN-LEDGER.md`

| Method | Path | Partner use |
|--------|------|-------------|
| `GET` | `/veriforge/ledger` | List entries (tenant-scoped) |
| `GET` | `/veriforge/ledger/:id` | Fetch block |
| `GET` | `/veriforge/ledger/:id/verify` | Verify integrity |
| `POST` | `/veriforge/ledger/commit` | Commit safety event (authorized) |
| `POST` | `/veriforge/ledger/contracts/:id/fire` | Contract fire (authorized) |

**Rules:**

- Stamp `tenantId` on every commit  
- Do not rewrite history — append/verify only  
- Titanium preferred for production ledger consumers  
- UI still forged-metal if partner surfaces ledger proofs  

---

## 6. Digital twin data ingestion

**API prefix:** `/veriforge/digital-twin`

| Method | Path | Partner use |
|--------|------|-------------|
| `GET` | `/veriforge/digital-twin` | Twin snapshot |
| `POST` | `/veriforge/digital-twin/hazards/refresh` | Refresh hazards |
| `POST` | `/veriforge/digital-twin/equipment/:id/toggle` | Equipment state |
| `POST` | `/veriforge/digital-twin/simulate` | Run simulation |
| `POST` | `/veriforge/digital-twin/simulate/clear` | Clear simulation |
| `POST` | `/veriforge/digital-twin/controls/:id/boost` | Control action |

### Ingestion guidelines

1. Include `tenantId` + site/asset identifiers on every payload  
2. Prefer idempotent upserts keyed by external asset ID  
3. Map partner telemetry → VeriForge hazard/equipment models  
4. Rate-limit; batch where supported  
5. Never ingest one tenant’s sensors into another’s twin  

---

## 7. Core engine prefixes (reference)

| Engine | Prefix |
|--------|--------|
| Training | `/veriforge/training` |
| Verification | `/veriforge/verification` |
| Compliance | `/veriforge/compliance` |
| Incidents | `/veriforge/incidents` |
| Risk | `/veriforge/risk` |
| Command Center | `/veriforge/command-center` |
| Predictive | `/veriforge/predictive` |

Full catalog: `veriforge/docs/api/README.md`

---

## 8. Integration review checklist

- [ ] Auth + tenant match proven  
- [ ] No cross-tenant data paths  
- [ ] Webhook signature + idempotency  
- [ ] Error handling surfaces text (not color-only) in any UI  
- [ ] Angular/forged-metal if embedding VeriForge chrome  
- [ ] Secrets in vault — not git  
- [ ] Tier-appropriate scope (ledger/twin for Alloy/Titanium)  

Submit architecture one-pager to PSM for Alloy+ production approval.
