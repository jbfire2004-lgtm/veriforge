# Vera Safety Intelligence — Permanent Copilot AI Engine

The **VsiCopilotEngine** is the canonical AI layer for Vera Safety Intelligence (VSI). It implements the permanent system prompt ([vsi-copilot-master-prompt.md](./vsi-copilot-master-prompt.md)): structured JSON per module, unified CAIL envelope, PM `project_id` / `owner_company_id` scoping, developer mode (JSON only), and agent mode (multi-step reasoning via LLM + VASE fallback).

## Implementation

| Path | Role |
|------|------|
| `backend/src/safety-intelligence/ai/copilot/vsi-copilot.types.ts` | Module I/O contracts |
| `backend/src/safety-intelligence/ai/copilot/vsi-copilot.prompts.ts` | System identity + JSON schemas |
| `backend/src/safety-intelligence/ai/copilot/vsi-copilot.mappers.ts` | Module output → CAIL envelope |
| `backend/src/safety-intelligence/ai/copilot/vsi-copilot-engine.service.ts` | Orchestrator |
| `backend/src/safety-intelligence/ai/copilot/vsi-copilot.controller.ts` | HTTP API |

## API

```http
POST /api/v1/pm/safety-intelligence/ai/copilot/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "module": "inspection",
  "projectId": 42,
  "companyId": 7,
  "context": {
    "caption": "Unprotected trench edge",
    "ocrText": "..."
  }
}
```

**Response:**

```json
{
  "module": "inspection",
  "engine": ["vera-vision", "copilot-llm"],
  "output": { "classification": "at_risk", "severity_score": 4, "..." },
  "cailEnvelope": {
    "hazard_type": "...",
    "risk_category": "environment",
    "severity_score": 4,
    "recommended_corrective_actions": ["..."],
    "recommended_preventive_actions": [],
    "tags": [],
    "lessons_learned": "",
    "predictive_risk_flags": []
  },
  "generatedAt": "2026-05-19T12:00:00.000Z"
}
```

## Modules

| `module` | Use case |
|----------|----------|
| `inspection` | Walk-around photos / notes |
| `bbo` | Behavior-based observations |
| `incident` | Investigation (5-Whys, fishbone, CAPA) |
| `equipment` | Failed equipment checks |
| `form_hazard` | JHA / FLHA / HECA / SIF / training forms |
| `lessons_learned` | Verified CAIL → lesson |
| `presentation` | Executive safety deck |
| `predictive_risk` | Emerging risk forecast |
| `cail_analyze` | Direct CAIL intelligence envelope |

## Engine stack

1. **copilot-llm** — when `VERA_LLM_ENDPOINT` + API key configured (strict JSON schema from prompts)
2. **copilot-heuristic** + **vase** — `@vera/autonomous-safety` fallback (always available)
3. **vera-vision** — inspection module only (photo path)

## Auto-enrichment on emit

When CAIL entries are created from source workflows, Copilot runs **asynchronously** (best-effort) and persists the unified envelope to `CailEntry.aiClassification.cailEnvelope`:

| Source | Service | Copilot module |
|--------|---------|----------------|
| BBO (safe + at-risk) | `BboService.create` | `bbo` → also `BboObservation.aiAnalysis` |
| Equipment failures | `EquipmentBridgeService.emitFromInspection` | `equipment` |
| Safety forms | `FormCailBridgeService.emitFromSafetyForm` | `form_hazard` |
| Walk-around at-risk items | `SafetyInspectionsService.addItem` | `inspection` (reuses photo classify when available) |
| Manual analyze | `CailService.analyzeWithAi` | `cail_analyze` |

Implementation: `CailCopilotEnrichmentService` in `backend/src/safety-intelligence/cail/`.

## Dev harness (frontend)

`/pm/safety-intelligence/settings/copilot` — module picker, JSON context, calls `POST /ai/copilot/run`.

## Wired endpoints

All existing VSI AI routes delegate to the Copilot engine:

- `POST /inspections/ai/classify-photo`
- `POST /cail/:id/ai/analyze`
- Incident investigation AI pack
- Lessons learned on verify
- Predictive risk snapshots
- Presentations (via dashboard metrics context)

## Configuration

```env
VERA_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
OPENAI_API_KEY=sk-...
VERA_LLM_MODEL=gpt-4o-mini
```

Use `gpt-4o` or similar for best multimodal + reasoning quality on inspections and incidents.

## Rules (enforced in prompts)

- JSON only in developer mode
- No invented facts
- Construction / industrial terminology
- All outputs map to **CAIL** `source_type` values
- PM project/company scope respected by callers (not by the engine itself)

See also: [vera-safety-intelligence-master.md](./vera-safety-intelligence-master.md)
