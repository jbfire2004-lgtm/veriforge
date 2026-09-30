# VeriAgent — AI safety & transparency (2026)

Additive guidance so VeriAgent meets current AI-agent safety expectations **without changing the default build path**.

**Related:** [`veri-agent.md`](./veri-agent.md) · [`veri-agent-architecture.md`](./veri-agent-architecture.md) · [`AWS-DEPLOYMENT.md`](./AWS-DEPLOYMENT.md)

---

## Regulatory / standards map (research summary)

| Source | What it asks for | VeriAgent today | Gap / next |
|--------|------------------|-----------------|------------|
| **EU AI Act Art. 12** (logging for high-risk; full application timeline through 2026–27) | Automatic event logs for risk ID, substantial mods, post-market monitoring | Metadata-only `veriagent.audit` (hashes, policy codes, latency — **no** prompts/images) | Persist audit to durable store + retention policy; keep shipping to CloudWatch on AWS |
| **EU AI Act Art. 50** (transparency from Aug 2026) | Users know they interact with AI | Product UI responsibility; VeriAgent is B2B egress, not a public chatbot | Ensure Hub/copilot UIs disclose AI assistance |
| **NIST AI RMF** | Transparency, accountability, auditability | Policy engine + privacy firewall + role/tenant gates | Document risk register for each purpose (FLHA, vision, embed) |
| **NIST NCCoE agent identity (2026 concept)** | Agent identity, least privilege, tamper-evident intent logs | JWT `iss`/`aud`, tenant `companyId`, correlation IDs | Optional hash-chain / external sink later (AAT-shaped export) |
| **IETF draft Agent Audit Trail (AAT)** | Structured agent action records, pre/post exec, deny reasons | Partial: outcome, policyCode, correlationId | Optional `safetyOverlay` provenance fields (below) |
| **Platform SAFETY-ENHANCED overlay** | Plan before tools, confirm destructive, provenance | Cursor/chat overlay + service flags | Enable flags only on staging/prod when ready |

Sources consulted (non-exhaustive): EU AI Act high-level summary; NIST NCCoE agent identity concept paper (2026-02); IETF `draft-sharif-agent-audit-trail`; industry summaries of Art. 12 / Art. 50 logging & transparency.

---

## SAFETY-ENHANCED overlay (opt-in — **default OFF**)

| Env | Default | Effect |
|-----|---------|--------|
| `VERA_AGENT_SAFETY_OVERLAY` | `off` | `enhanced` adds provenance fields on audit writes |
| `VERA_AGENT_SAFETY_REQUIRE_CONFIRM` | unset/false | When **both** overlay=enhanced **and** this=true, egress/destructive HTTP calls need `X-Veri-Agent-Confirm: 1` or `humanConfirmed: true` |

**Default runtime is unchanged.** Leaving both unset keeps today’s VeriForge → VeriAgent behavior.

Provenance fields (only when overlay enhanced):

```json
{
  "safetyOverlay": "enhanced",
  "provenanceKind": "ai_agent_action",
  "actionClass": "egress",
  "humanConfirmRequired": true,
  "humanConfirmed": false
}
```

Still **never** logs raw FLHA, images, prompts, or model responses.

Code: `services/veri-agent-service/src/safety/overlay.ts`

---

## What already satisfies “safety-first”

- Sole LLM egress path (Nest in-process or remote microservice)
- Privacy firewall + purpose allow/deny
- Image egress off by default (`VERA_AGENT_ALLOW_IMAGE_EGRESS`)
- Kill switch `VERA_AGENT_LLM_ENABLED`
- Audit sanitize deny-list for payload keys
- `AUTH_DEV_BYPASS` refused in production

---

## AWS staging checklist (VeriAgent)

1. Deploy microservice image (or keep Nest in-process — default).
2. Set `VERA_AGENT_SAFETY_OVERLAY=enhanced` on **staging only** first.
3. Leave `VERA_AGENT_SAFETY_REQUIRE_CONFIRM` **unset** until Nest clients send confirm headers.
4. Ship audit JSON to CloudWatch Logs (existing pino sink).
5. Do **not** enable hard confirm on production until Nest remote client is updated.

See [Phase 9 in AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md#phase-9--veriagent-on-aws-ai-safety).

---

## Enable sequence (safe roll-out)

```text
1. Deploy code with defaults (overlay off)     ← no behavior change
2. Staging: OVERLAY=enhanced                  ← richer audit only
3. Update Nest remote client to send confirm  ← when ready
4. Staging: REQUIRE_CONFIRM=true              ← gate egress
5. Soak → production overlay enhanced
6. Production REQUIRE_CONFIRM only after clients ready
```

---

## Explicit non-goals (this change)

- No change to default Nest in-process path
- No requirement to set `VERA_AGENT_REMOTE_URL`
- No breaking change to audit consumers (new fields are optional)
- No raw prompt retention
