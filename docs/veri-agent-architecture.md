# VeriAgent — Production Architecture (Microservice)

**Status:** Target production architecture  
**Type:** Centralized AI orchestration & privacy firewall  
**Runtime:** Node.js / TypeScript (NestJS microservice) preferred for VeriForge alignment; Go acceptable for the Policy + Firewall hot path if split later  
**Audience:** Platform engineering, security, SaaS ops  

**Related:** [`docs/veri-agent.md`](./veri-agent.md) (current Nest in-process scaffold), [`docs/vera-unified-safety-platform-architecture.md`](./vera-unified-safety-platform-architecture.md)

---

## 1. Purpose

VeriAgent is the **only approved egress path** from VeriForge to external AI providers (LLMs, vision, embeddings). It is **not** a user-facing chatbot. Other VeriForge services call it over an **internal HTTP/JSON API**.

It enforces:

| Principle | Enforcement |
|-----------|-------------|
| Privacy-first | Minimal context; redaction before any provider call |
| Tenant isolation | Every request bound to `tenantId` / `companyId`; no cross-tenant cache or prompt reuse |
| Role-aware RBAC | JWT claims from VeriForge identity; purpose × role matrix |
| Redaction-by-design | Translation layer never forwards raw FLHA, GPS, PII, or raw images by default |
| Zero-retention (provider) | Provider contracts: no-training, zero-retention; VeriAgent stores hashes/metadata only |
| Auditability | Who / when / purpose / outcome / hashes — never raw payloads |

---

## 2. High-level architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  VeriForge callers (internal only)                                       │
│  Nest monolith · PM Inspections · JHA/FLHA · VSI Copilot · SMS · CAIL    │
│  Field / Mobile BFF (via Nest — never browser → VeriAgent direct)        │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ mTLS + JWT (service + user claims)
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  API Gateway / mesh (optional) → VeriAgent Service :3040                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Edge       │→ │ AuthZ /     │→ │ Policy       │→ │ Translation    │ │
│  │ (TLS,      │  │ Tenant      │  │ Engine       │  │ Layer          │ │
│  │ validate,  │  │ Isolation   │  │ (FLHA/image/ │  │ (FLHA→hazards, │ │
│  │ rate limit)│  │ Gateway     │  │  liability)  │  │  image→text,   │ │
│  └────────────┘  └─────────────┘  └──────────────┘  │  meta→minimal) │ │
│                                                      └────────┬───────┘ │
│                                                               ▼         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  PRIVACY FIREWALL  (hard boundary — last mile before egress)      │  │
│  │  redact · strip media · purpose bind · residency · no-train flags │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  ▼                                      │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │
│  │ Orchestrator     │→ │ Provider        │→ │ Response Sanitizer    │ │
│  │ (route, model,   │  │ Adapters        │  │ (schema validate,     │ │
│  │  timeout/retry/  │  │ (LLM / vision / │  │  strip PII echo)      │ │
│  │  fallback)       │  │  embeddings)    │  └───────────────────────┘ │
│  └──────────────────┘  └─────────────────┘                             │
│                                  │                                      │
│  ┌──────────────────┐  ┌─────────▼────────┐                            │
│  │ Audit & Metrics  │  │ Config / Secrets │  Redis · Postgres (meta)   │
│  │ (no payloads)    │  │ (region, models) │                            │
│  └──────────────────┘  └──────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
                                │ egress (TLS)
                                ▼
              ┌─────────────────────────────────────┐
              │ External AI providers (regional)    │
              │ OpenAI / Azure OpenAI / Anthropic / │
              │ private VPC endpoints               │
              └─────────────────────────────────────┘
```

### Component interactions (summary)

1. Caller sends **purpose-bound** request with user JWT + tenant scope + opaque resource refs (not full FLHA blobs when avoidable).
2. **Edge** terminates TLS, validates schema, applies rate limits / abuse signals.
3. **AuthZ** verifies JWT with VeriForge identity, resolves roles, asserts tenant membership.
4. **Policy Engine** evaluates FLHA visibility, image rules, liability protections → allow / deny / transform.
5. **Translation** builds abstracted, minimal AI inputs (hazards, captions, feature vectors — not raw docs/images unless policy allows).
6. **Privacy Firewall** final redaction + residency + provider contract flags; **blocks** if unclean.
7. **Orchestrator** selects model, runs with timeouts/retries/fallbacks across adapters.
8. **Sanitizer** validates structured JSON against purpose schema; strips echoed PII.
9. **Audit** writes metadata-only event; result returned to caller (caller owns business persistence).

---

## 3. Services / modules inside VeriAgent

Deploy as **one deployable microservice** (`services/veri-agent-service`) with internal modules (clear SoC). Split to sidecars only if scale/isolation demands it.

| Module | Responsibility |
|--------|----------------|
| **`api`** | HTTP/JSON internal API (`/v1/invoke`, `/v1/translate`, `/v1/health`, `/v1/policies/evaluate`) |
| **`edge`** | TLS termination (or rely on mesh), request validation (Zod/JSON Schema), correlation IDs, rate limiting, abuse detection |
| **`authz`** | JWT validation (VeriForge issuer), RBAC matrix (role × purpose × resource), tenant binding |
| **`tenant`** | Multi-tenant context: `tenantId`/`companyId`/`projectId`; cache keys prefixed; no shared prompt cache across tenants |
| **`policy`** | FLHA visibility, image privacy, project-owner liability rules; deny codes |
| **`translate`** | FLHA → hazard graph; image → local description/features; project meta → minimal bag |
| **`firewall`** | Privacy firewall: DLP/redaction, media strip, residency pin, no-train/zero-retention headers |
| **`orchestrator`** | Task routing, model selection, timeouts, retries, circuit breakers, fallbacks |
| **`providers`** | Adapters: `LlmProvider`, `VisionProvider`, `EmbeddingProvider` |
| **`sanitize`** | Inbound AI response schema + PII scrub |
| **`audit`** | Append-only audit stream (Postgres / audit-service); metrics (Prometheus) |
| **`config`** | Per-tenant & regional model allowlists, feature flags, retention SLAs |
| **`local-vision`** (optional sidecar) | On-prem/heuristic vision so raw images never leave region |

### Suggested stack

- **Language:** TypeScript + NestJS (matches VeriForge Nest/JWT/Prisma patterns)  
- **Datastore:** Postgres for audit + policy config; Redis for rate limits / short-lived idempotency (TTL ≤ minutes, tenant-keyed)  
- **Secrets:** Vault / cloud KMS; provider keys never in app config plain text  
- **Observability:** OpenTelemetry traces (span attrs: purpose, tenant hash, model — **not** prompts)

---

## 4. Internal HTTP/JSON API (contract sketch)

Base: `https://veri-agent.internal:3040/v1`  
Auth: `Authorization: Bearer <user-or-service-jwt>` + `X-Correlation-Id`  
All bodies include:

```json
{
  "purpose": "flha_review_assist | inspection_photo_findings | vsi_copilot | ...",
  "tenant": { "companyId": 12, "projectId": 44, "region": "ca-central-1" },
  "actor": { "userId": 901, "roles": ["SAFETY_LEAD"] },
  "resources": {
    "flhaId": "flha_...",
    "imageObjectKey": "s3://.../img.jpg",
    "projectId": 44
  },
  "options": { "allowImageEgress": false, "preferLocalVision": true }
}
```

| Endpoint | Use |
|----------|-----|
| `POST /v1/invoke` | Full pipeline → structured AI result |
| `POST /v1/translate/flha` | FLHA → abstracted hazards only (no LLM) |
| `POST /v1/translate/image` | Image → local text/features (no external AI by default) |
| `POST /v1/policies/evaluate` | Dry-run policy decision |
| `GET /v1/health/live\|ready` | K8s probes |

**Never accept:** unbounded base64 images in JSON for production paths — prefer object-store refs fetched **inside** VeriAgent after policy allow.

---

## 5. RBAC (VeriForge identity)

Roles (canonical): `WORKER`, `CONTRACTOR`, `SAFETY_LEAD`, `PROJECT_OWNER`, `PROJECT_MANAGER`, `COMPANY_ADMIN`, `PLATFORM_ADMIN`.

| Purpose | Worker | Contractor | Safety lead | Project owner | Admin |
|---------|--------|------------|-------------|---------------|-------|
| Translate own FLHA (local) | ✓ own | ✓ own crew | ✓ project | ✓ project* | ✓ |
| FLHA review assist (LLM) | ✗ | ✓ own (pre-release rules) | ✓ | limited† | ✓ |
| Inspection photo findings | ✓ assigned | ✓ assigned | ✓ | ✗ raw hazards‡ | ✓ |
| VSI copilot / CAIL | ✗ | limited | ✓ | aggregated only | ✓ |
| Embeddings / lessons | ✗ | ✗ | ✓ | aggregated | ✓ |

\* Project owner may translate for oversight **after** policy strips active-hazard detail when required.  
† Project owner LLM path receives **aggregated / post-mitigation** views only — see liability rules.  
‡ Project owner does not receive live “active uncontrolled hazard” payloads from VeriAgent.

---

## 6. Policy engine (rules)

### 6.1 FLHA visibility

| State | Visible to | AI allowed |
|-------|------------|------------|
| `draft` / `contractor_only` | Authoring contractor (+ safety lead) | Local translate; LLM only for author roles |
| `in_review` | Safety lead + author | Review assist LLM with abstracted hazards |
| `approved` / `post_completion_release` | Broader project per product rules | LLM with redacted historical context |
| `sealed` | Audit roles | Translate only; LLM deny by default |

### 6.2 Image privacy

1. Default: **no raw image** to external AI.  
2. Local vision / feature extract inside region first.  
3. External multimodal only if `purpose ∈ image_allowlist` **and** tenant flag `allowImageEgress` **and** `VERA_AGENT_ALLOW_IMAGE_EGRESS=true`.  
4. Object keys preferred; base64 rejected above size threshold.

### 6.3 Project owner liability protections

- Strip or generalize **active uncontrolled hazards** for `PROJECT_OWNER` purposes.  
- Prefer “controls in place / residual risk band” over actionable exploit detail.  
- Deny purposes that would create discoverable “known open hazard” narratives for owner-facing LLM output.

---

## 7. Privacy firewall boundary

**Applies after** AuthZ + Policy + Translation, **before** Provider Adapters.

| Check | Action on fail |
|-------|----------------|
| Tenant present & matches JWT | `403 tenant_required` |
| Purpose allowlisted | `403 purpose_denied` |
| Text redaction clean | `422 redaction_failed` |
| Image egress policy | Strip image or `403 image_egress_denied` |
| Region ↔ provider endpoint | Reroute or deny |
| No-train / zero-retention flags set on provider client | Refuse provider if unsupported |

Firewall **must not** log prompt text, images, or full FLHA JSON.

---

## 8. Data flow — FLHA + image + review FLHA

Typical **contractor submits FLHA with photo → safety lead review assist**:

```
1. JHA/FLHA service stores FLHA + image in tenant-scoped storage.
2. Safety lead opens review UI → Nest calls VeriAgent POST /v1/invoke
   purpose=flha_review_assist
   resources={ flhaId, imageObjectKey }
3. AuthZ: role=SAFETY_LEAD, tenant match, project membership.
4. Policy: FLHA state=in_review → allow review assist; image external=false by default.
5. Translation:
   a. Load FLHA → emit HazardAbstraction[] (energy types, controls, residual risk).
   b. Load image → local-vision caption/features (no raw bytes queued for LLM).
6. Privacy Firewall: redact names/GPS/phone from text; confirm no image parts.
7. Orchestrator: model=tenant.reviewModel; timeout=20s; retry=2; fallback=heuristic_review.
8. Provider: chat.completions JSON schema ReviewAssistResult.
9. Sanitizer: validate schema; scrub any echoed identifiers.
10. Audit: { actor, purpose, flhaId hash, imageSent:false, promptHash, outcome }.
11. Response to Nest → UI shows structured suggestions (not provider raw).
12. Nest persists business decision; VeriAgent retains no FLHA/image copies.
```

```mermaid
sequenceDiagram
  participant UI as SafetyLead_UI
  participant Nest as VeriForge_Nest
  participant VA as VeriAgent
  participant Pol as Policy
  participant Tr as Translate
  participant FW as PrivacyFirewall
  participant Orch as Orchestrator
  participant LLM as External_LLM

  UI->>Nest: Request FLHA review assist
  Nest->>VA: POST /v1/invoke (flhaId, imageKey, JWT)
  VA->>VA: Edge validate + rate limit
  VA->>VA: AuthZ tenant + RBAC
  VA->>Pol: Evaluate FLHA visibility + image rules
  Pol-->>VA: allow_transform
  VA->>Tr: FLHA to hazards; image to local caption
  Tr-->>VA: abstracted context
  VA->>FW: Redact + residency + no-train
  FW-->>VA: clean_payload
  VA->>Orch: Route model
  Orch->>LLM: Minimal JSON prompt
  LLM-->>Orch: Structured result
  Orch->>VA: Sanitize
  VA-->>Nest: ReviewAssistResult + auditId
  Nest-->>UI: Suggestions
```

---

## 9. Orchestration — models, timeouts, fallbacks

| Concern | Design |
|---------|--------|
| Model selection | Per-purpose + per-tenant allowlist in config; regional default |
| Timeouts | Connect 3s / total 20–45s by purpose |
| Retries | Idempotent GETs N/A; POST invoke uses idempotency-key; retry only on 408/429/5xx |
| Fallbacks | Provider A → Provider B (same region) → local heuristic (no egress) |
| Circuit breaker | Per provider endpoint; open → heuristic only |
| Kill switch | `VERA_AGENT_LLM_ENABLED=false` disables all egress |

Provider client always sends: `zero_retention`, `no_training` (or Azure “abuse monitoring / data store” off per contract).

---

## 10. Logging & audit

| Logged | Not logged |
|--------|------------|
| actor userId, roles, tenantId | Raw images |
| purpose, outcome, deny reason | Full FLHA documents |
| model id, latency, token counts (if provided) | Raw prompts / completions |
| promptHash, resource id hashes | GPS, phone, email, worker names |
| imageSent boolean | Base64 / object bytes |

Audit sink: VeriForge `audit-service` or VeriAgent Postgres `veri_agent_audit` with retention policy (e.g. 1–7 years metadata-only).

---

## 11. Security & compliance

| Control | Implementation |
|---------|----------------|
| TLS in transit | mTLS mesh or TLS 1.2+ to callers and providers |
| Encryption at rest | KMS-encrypted volumes; object store SSE; DB TDE |
| Input validation | Strict JSON schemas; max body size; object-key allowlist |
| Output sanitization | Schema + PII scrub |
| Rate limiting | Per tenant + per user + per purpose |
| Abuse detection | Burst, repeated redaction failures, anomalous image egress attempts |
| Data residency | Region pin; provider endpoint map; deny cross-region |
| Network | Private subnet; no public ingress; allowlist caller CIDRs / mesh identity |

---

## 12. Multi-tenant data model (VeriAgent-owned)

VeriAgent stores **metadata only**:

- `tenant_ai_config` — model allowlist, image egress flag, region  
- `veri_agent_audit` — egress events  
- `idempotency_keys` — short TTL  
- Optional `hazard_abstraction_cache` — TTL minutes, keyed by `(tenantId, flhaContentHash)` — **never** raw FLHA  

Business FLHA/image blobs remain in domain services’ stores.

---

## 13. Deployment topology

```
services/
  veri-agent-service/     # this microservice
  api-gateway/            # optional path /ai/veri-agent → veri-agent
backend/src/veri-agent/   # temporary in-process adapter until callers migrate
```

**Migration path**

1. Today: Nest `VeriAgentModule` firewalls `LlmSafetyService` in-process.  
2. Extract same interfaces into `services/veri-agent-service` (**skeleton available**).  
3. Nest becomes thin HTTP client (`VeriAgentClient`) preserving purposes & audit.  
4. Decommission in-process provider `fetch`.

---

## 14. Boundaries checklist (privacy firewall vs policy)

| Concern | Policy Engine | Privacy Firewall |
|---------|---------------|------------------|
| Who may call this purpose? | ✓ | |
| FLHA state / visibility | ✓ | |
| May project owner see active hazards? | ✓ | |
| May this purpose send images? | ✓ (decision) | ✓ (enforce strip/deny) |
| PII / GPS / email scrub | | ✓ |
| Residency / no-train flags | | ✓ |
| Model routing / retries | Orchestrator | |
| Response schema / PII echo | Sanitizer | |

**Invariant:** No network call to an external AI provider may bypass the Privacy Firewall module.

---

## 15. Non-goals

- User-facing chat UI  
- Long-term storage of prompts/images inside VeriAgent  
- Replacing CAIL scoring microservices (`cail-*`) — VeriAgent supplies LLM/vision **egress**, not domain scoring ownership  
- Browser-direct access to VeriAgent
