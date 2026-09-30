# VeriAgent — AI orchestration & privacy firewall

VeriAgent is the **sole approved path** for LLM provider egress.

| Doc | Contents |
|-----|----------|
| [`veri-agent-architecture.md`](./veri-agent-architecture.md) | **Production microservice architecture** (target) |
| [`VERI-AGENT-AI-SAFETY.md`](./VERI-AGENT-AI-SAFETY.md) | **AI safety / EU AI Act / NIST map + SAFETY-ENHANCED overlay (opt-in)** |
| This file | Nest in-process scaffold + opt-in remote client |

## Principles

- Privacy-first / redaction-by-design
- Tenant isolation (`companyId` required)
- Role metadata audited (callers enforce RBAC)
- Zero-retention of prompts/images in logs
- Auditability via `ai.egress` (hashes + metadata only)

## Module (Nest)

`backend/src/veri-agent/`

| Service | Role |
|---------|------|
| `VeriAgentService` | Orchestrate completeJson / completeMultimodalJson |
| `VeriAgentRemoteClient` | Optional HTTP client → `services/veri-agent-service` |
| `VeriAgentRedactionService` | PII scrub + JSON context stripping |
| `VeriAgentPolicyService` | Kill switch, purpose allowlist, image egress, industry modes |

## Industry operating modes

Set `VERA_AGENT_MODE=manufacturing`, `construction`, `mining`, `telecom`, `power`, `nuclear`, or `multi` (or pass `mode` on complete requests) to inject an industry operating mode on every LLM egress:

**Manufacturing** — precision, QC, ISO 9001/14001, SCADA/PLC, batch/lot lineage, defect reduction.

**Construction** — safety, compliance, hazard mitigation, permits, contractors, equipment certification; OSHA/CSA-aware without inventing citations; jobsite documentation accuracy.

**Mining** — MSHA/CSA compliance, environmental monitoring, heavy equipment inspections, blast planning, geotechnical stability, ore/assay tracking; high-risk operational safety.

**Telecom / Tower** — climb safety, RF exposure compliance, site inspection accuracy, photo-evidence capture, asset lifecycle for antennas/radios/cabling; no invented RF readings or climb clearance verdicts.

**Power Generation** — NERC/GADS compliance, SCADA awareness, outage management, equipment inspections, environmental reporting, turbine/boiler/generator reliability; no invented MW, emissions, or compliance verdicts.

**Nuclear** — radiation protection, critical equipment surveillance, incident/access control, NRC/IAEA reporting discipline; no invented dose readings or reportability verdicts.

**Multi-Industry** — intelligent operations engine spanning all six industries; infers applicable context and applies ISO, OSHA, CSA, MSHA, NERC, NRC, and IAEA frameworks as relevant; generates workflows, reports, data models, and automation sequences with industrial-grade precision and auditability.

Mode prompts never override redaction, tenant gates, or “do not invent” rules.

## Equipment Inspection Engine

Purpose: `equipment_inspection_photo_findings` (image egress allowed — **Smart AI mode only**).

Defined in `backend/src/veri-agent/equipment-inspection-engine.ts` and invoked via `LlmSafetyService.analyzeEquipmentInspectionPhoto`.

**Dual modes** (branch at inspection start):

| Mode | Behavior |
|------|----------|
| **Traditional (A)** | Manual checklist confirmations; no image analysis; final status Safe / Restricted / Unsafe |
| **Smart AI (B)** | 14 mandatory photo sections; multi-label defect detection; severity + confidence + recommended action |

- **Scope:** equipment walk-arounds, defect detection, supervisor audit, inspection reporting, work-order-linked reports
- **Not in scope:** Smart Safety Inspections (site hazards, PPE walkdowns, FLHA)
- **Defect output (AI):** `defectType`, `severity` (critical\|major\|minor), `confidence`, `recommendedAction` (lockout\|repair_schedule\|monitor\|none), `workOrderHint`
- **Workflow gates:** mode selection first; photos required in AI mode only; operator override requires justification; completion blocked until sections complete and defects reviewed

Distinct from purpose `inspection_photo_findings` (PM Smart Site / construction safety photo findings).

## Env (Nest)

| Variable | Default | Meaning |
|----------|---------|---------|
| `VERA_LLM_ENDPOINT` / `VERA_LLM_API_KEY` or `OPENAI_API_KEY` | — | Provider (in-process path) |
| `VERA_LLM_MODEL` | `gpt-4o-mini` | Default model |
| `VERA_AGENT_LLM_ENABLED` | on | `false` disables all egress |
| `VERA_AGENT_ALLOW_IMAGE_EGRESS` | — | `false` forces text-only |
| `VERA_AGENT_DENIED_PURPOSES` | — | Comma-separated purpose deny list |
| `VERA_AGENT_MODE` | `none` | Industry operating mode (`manufacturing` \| `construction` \| `mining` \| `telecom` \| `power` \| `nuclear` \| `multi` \| `none`). Injects a system prefix on LLM egress. |
| `VERA_AGENT_REMOTE_URL` | **unset** | When set, Nest calls microservice `/v1/invoke` first |
| `VERA_AGENT_REMOTE_STRICT` | off | When on, remote transport errors do **not** fall back in-process |
| `VERA_AGENT_SERVICE_TOKEN` | — | Static Bearer for remote (optional) |
| `JWT_SECRET` / `VERA_AGENT_JWT_SECRET` | — | Used to mint short-lived service JWTs when remote URL is set |

**Default remains in-process.** Leaving `VERA_AGENT_REMOTE_URL` unset preserves today’s VeriForge behavior (copilot + inspection photo LLM paths unchanged).

## Microservice (`services/veri-agent-service`)

| Endpoint | Role |
|----------|------|
| `POST /v1/invoke` | Nest-compatible text JSON completion |
| `POST /v1/invoke/multimodal` | Nest-compatible multimodal JSON |
| `POST /veriagent/flha/analyze` | Domain FLHA pipeline |
| `POST /veriagent/review-flha/*` | Review FLHA |
| `POST /veriagent/image/describe` | Image describe |
| `GET /health/live\|ready`, `GET /metrics` | Probes / Prometheus |

Auth: JWT (`JWT_ISSUER` / `JWT_AUDIENCE` / `JWT_SECRET`). `AUTH_DEV_BYPASS` is for local only — **refused at boot in production**.

## Wired today

- `LlmSafetyService` → VeriAgent for copilot JSON + inspection/safety photo multimodal + photo classify
- `LessonEmbeddingService` → VeriAgent `embed()` for dense vectors (TF‑IDF local fallback when not configured / declined)
- Remote cutover is **opt-in** via `VERA_AGENT_REMOTE_URL` with non-strict fallback
- Copilot `POST .../ai/copilot/run` binds `companyId` from the JWT via `TenantScopeService.effectiveCompanyId` (body companyId is not trusted for non–platform-admins; only SUPER_ADMIN / ADMIN may target an explicit company)
- Microservice: `POST /v1/invoke`, `/v1/invoke/multimodal`, `/v1/embed`

## Env (Nest) — embeddings

| Variable | Meaning |
|----------|---------|
| `VERA_EMBEDDING_ENDPOINT` | Embeddings URL (default OpenAI `/v1/embeddings` when keys present) |
| `VERA_EMBEDDING_MODEL` | Default `text-embedding-3-small` |

## Not live LLM egress

- SMS: no provider call today (`sms_inference` reserved); `SMS_LLM_ENABLED` is an ops gate only
- Vision (`@vera/vision`): local engine; optional LLM photo classify goes through VeriAgent when called from copilot inspect

## Next

- Staging soak with remote URL + JWT
- Persist audit rows to `veri_agent_audit`
- SMS inference via VeriAgent when product enables provider SMS AI
