# VeriAgent Service

Centralized AI orchestration & privacy firewall for VeriForge.

See [`docs/veri-agent-architecture.md`](../../docs/veri-agent-architecture.md).

## Quick start

```bash
cd services/veri-agent-service
cp .env.example .env
npm install
npm run dev
```

- Health: `GET /health/live`, `GET /health/ready`
- FLHA: `POST /veriagent/flha/analyze`
- Review FLHA: `POST /veriagent/review-flha/create`, `POST /veriagent/review-flha/analyze`
- Image: `POST /veriagent/image/describe`

## Pipeline

`validate → authz/tenant → policy → translation → privacy firewall → orchestration → sanitize → audit`

## Policy engine

Business rules run **before** the privacy firewall (`evaluatePolicy` decides; firewall enforces):

```ts
import { evaluatePolicy } from "./policy";

const decision = evaluatePolicy(requestContext, "flha.analyze", data);
if (!decision.allowed) {
  // decision.code / decision.reason
} else {
  // decision.transformedData + decision.enforcement (transform, image egress, FLHA audience)
}
```

Profiles: `config/policies/strict.json` (default), `balanced.json`, tenant map in `tenant-overrides.json`.

Covers contractor-private FLHA, independent Review FLHA, post-completion owner share, owner liability (no active hazard lists), and image derived-vs-raw egress.

## Translation layer

Converts domain payloads into minimal AI-safe prompts **before** the privacy firewall:

```ts
import {
  translateFlhaToPrompt,
  translateImageToPrompt,
  translateProjectToPrompt,
  translateSafetyBriefingToPrompt,
} from "./translation";

const flhaPrompt = translateFlhaToPrompt(flha, {
  tenant: { companyId: 42 },
  abstractionLevel: "strict", // or "relaxed"
});
```

- Config: `config/translation/strict.json`, `relaxed.json`
- Respects privacy redaction rules (names, emails, locations, company identifiers)
- Does **not** make allow/deny decisions — that remains the policy engine
- Outputs: hazard categories, risk levels, mitigation types; image scene/hazards/equipment; project environment/work type only

## Orchestration

Routes privacy-cleared tasks to pluggable providers (`executeAiTask`):

```ts
const result = await executeAiTask(
  { type: "recommendation", purpose, system, userText, privacyCleared: true },
  { tenant: { companyId: 42 }, privacyMode: "strict" },
);
```

- Providers: OpenAI-compatible LLM, OpenAI vision, heuristic fallback
- Config: `config/orchestration.json` (keys, models, regions, tenant allow-lists)
- Handles timeouts, retries, provider fallbacks; no-training / zero-retention headers
- Refuses tasks that did not pass translation + privacy firewall

## Audit & logging

Metadata-only structured JSON audit (pino → ELK/Datadog shippable):

```ts
import { auditLog, createAuditEvent } from "./logging";

const event = createAuditEvent(requestContext, "flha.analyze", policyDecision, {
  endpoint: "/veriagent/flha/analyze",
  outcome: "success",
  promptHash, // hash only — never the prompt
});
auditLog(event);
```

- Logs who / when / what / outcome — never raw FLHA, images, prompts, or responses
- Queryable in-process by tenant, user, operation; optional anonymized AI usage metrics
- Pino redaction paths as defense-in-depth

## Security hardening

API middleware stack: **abuse → rate limit → Zod validation** (strict schemas).

- Per-tenant / per-user / per-IP limits (`config/security.json`, Redis or in-memory)
- Abuse rules: repeated policy/privacy denials, image-egress probes, forbidden bypass fields
- Blocks/flags integrate with the audit subsystem (`rate_limited`, `abuse_blocked`, `validation_error`)

## Sub-agents

Internal specialists routed by `VeriAgent.invoke(operation)` (not public HTTP):

| Agent | Operations |
|-------|------------|
| FLHA | `flha.analyze`, `flha.review`, `flha.review_create` |
| Image | `image.describe` |
| Safety | `safety.briefing`, `safety.checklist`, `safety.recommend` |
| Workflow | `workflow.reminder`, `workflow.escalate`, `workflow.summarize` |

Each uses **policy → translation → privacy firewall → orchestration**.

## Deployment & observability

See [`deploy/README.md`](./deploy/README.md) for Docker, Kubernetes, Helm, config examples, metrics (`GET /metrics`), tracing stubs, and Prometheus alerts.

## Privacy firewall

Config-driven egress gate (`applyPrivacyFirewall`) before any provider call:

```ts
import { applyPrivacyFirewall, isPrivacyBlocked } from "./privacy";

const result = applyPrivacyFirewall(context, payload);
if (isPrivacyBlocked(result)) {
  // block: result.code, result.message (no payload body logged)
} else {
  // allowed | redacted: result.system, result.userText, result.tenantTag, …
}
```

- Rules: `config/redaction-rules.json` (override with `VERA_AGENT_REDACTION_RULES_PATH`)
- Covers FLHA hazards/mitigations, image descriptions, project metadata
- Enforces redaction, tenant tagging/isolation, and role constraints (e.g. owners → owner-safe hazard summaries)
- Decision logs are metadata-only (`allowed` / `redacted` / `blocked`) — never full payloads

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch mode |
| `npm run build` | Compile |
| `npm test` | Unit tests |
| `npm run lint` | `tsc --noEmit` |
