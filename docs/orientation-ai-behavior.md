# VeriForge Orientation Builder — AI Behavior Spec

Defines AI capabilities, prompt patterns, JSON contracts, and safety guardrails for the Orientation Builder copilot.

**Owners:** `AIOrientationBuilderService` (backend) · `AiBuilderSidebar` (frontend)  
**Companions:** [orientation-ui-ux.md](./orientation-ui-ux.md) · [orientation-frontend-architecture.md](./orientation-frontend-architecture.md)

---

## Posture

| Rule | Requirement |
|------|-------------|
| Role | Orientation **content designer** for industrial, construction, and union environments |
| Priority | Clarity · safety · field-usable language |
| Authority | **Non-authoritative** — never invent laws, standard numbers, or jurisdictional mandates |
| Publish | Humans only; AI drafts must be reviewed |
| Labeling | All AI output marked `createdBy: AI` / UI “AI-generated” |

System prompt (canonical):

> You are an orientation content designer for industrial, construction, and union environments. Prioritize clarity, safety, and compliance. Output valid JSON only matching the schema. Do not invent laws, standards numbers, or jurisdictional requirements. If unsure, add a suggestion to verify with company HSE. Use plain language suitable for field workers.

---

## Capabilities

### 1. Generate orientation from description

**Endpoint:** `POST /api/v1/ai/orientation/generate-from-text`

**Input**

| Field | Notes |
|-------|--------|
| `description` | Free-text company / site / project |
| `companyId` / `projectId` | Tenant context |
| `safetyProfile` | Summary or id → server expands |
| `trade` | Optional craft focus |
| `region` | Geographic / ops context (not a compliance certificate) |
| `companyRules` / `siteRules` | Optional pasted policy text (trusted source) |
| `locale` | Default `en` |

**Output — `contentBlocks` outline (required order)**

| id | type | Purpose |
|----|------|---------|
| `intro` | slide | Welcome / purpose |
| `company_overview` | text \| slide | Company overview |
| `site_rules` | text \| slide | Site rules |
| `ppe` | text \| slide | PPE requirements |
| `emergency` | text \| slide | Emergency procedures |
| `trade_hazards` | text \| slide | Trade-specific hazards |
| `closing_ack` | policy_ack | Closing + acknowledgment |

Also return: `suggestions[]`, `flags[]`, `aiMetadata`.

---

### 2. Convert uploaded file to orientation

**Endpoint:** `POST /api/v1/ai/orientation/generate-from-file`

**Input:** `fileRefId` (PDF, PPT, DOC), `companyId`, optional `includeQuiz`, `locale`

**Pipeline**

1. Authorize file belongs to tenant  
2. Extract text/structure (OCR / parse) server-side — model sees extracted text, not raw binary in the prompt when possible  
3. Emit structured `contentBlocks` (slides/sections + extracted key rules)  
4. Optional quiz (3–8 questions if content is rich enough)

**Preserve dual representation**

| Mode | What is kept |
|------|----------------|
| Uploaded | Original `fileRefId` as asset / preview |
| Native | Generated `contentBlocks` |
| Hybrid (typical) | Preview asset + AI/native blocks |

Never delete or overwrite the original file reference. Tag blocks `meta.source: extracted | ai`.

---

### 3. Generate quiz from content

**Endpoint:** `POST /api/v1/ai/orientation/generate-quiz`

**Input:** selected `contentBlocks[]` and/or `rawText`; `questionCount` 5–15; optional difficulty

**Output:** one `quiz` contentBlock:

```json
{
  "type": "quiz",
  "title": "Knowledge check",
  "quiz": {
    "questions": [
      {
        "id": "q1",
        "kind": "multiple_choice",
        "prompt": "...",
        "choices": ["A", "B", "C", "D"],
        "answerIndex": 0,
        "explanation": "..."
      },
      {
        "id": "q2",
        "kind": "true_false",
        "prompt": "...",
        "choices": ["True", "False"],
        "answerIndex": 0,
        "explanation": "..."
      }
    ]
  },
  "meta": { "createdBy": "AI", "aiLabeled": true }
}
```

Prefer facts grounded in provided content. Do not invent regulatory citations as “correct answers.”

---

### 4. Improve existing block

**Endpoint:** `POST /api/v1/ai/orientation/improve-block`

**Input:** existing block; `tone: "clear" | "direct" | "safety-focused"` (default safety-focused); optional `targetLocale`

**Output**

- Revised block (same `id` / `type` unless type change requested)
- `terminologyNotes[]` — glossary consistency
- `localizationHints[]` — optional (idioms, reading level)

Do not add new regulatory claims while improving style.

---

### 5. Safety / regulatory awareness (advisory only)

Embedded in capabilities 1–4 (and optional review pass).

| Signal | Examples |
|--------|----------|
| `suggestions` missing topics | Emergency exits, muster, LOTO, incident reporting, SDS access |
| `flags` unclear | “Appropriate PPE” without listing items |
| `structureProposals` | Reorder PPE before trade hazards |

Severity is `hint` or `warn` only — never auto-block publish. Copy in UI: “Suggestions — verify with your HSE program.”

---

## Prompt pattern

```
System:  <canonical system prompt above>
User:    <capability payload: description | extractedText | block | …>
Assistant: JSON { contentBlocks?, quizBlock?, suggestions[], flags[], aiMetadata }
```

**`aiMetadata`**

```json
{
  "generatedByModel": "…",
  "generationDate": "ISO-8601",
  "promptHash": "…",
  "source": "description" | "file" | "improve" | "quiz",
  "fileRefId": "optional"
}
```

---

## contentBlocks schema (assistant → DefinitionService)

```ts
type ContentBlock = {
  id: string;
  type: "slide" | "text" | "video" | "quiz" | "policy_ack";
  title: string;
  body?: string;
  order: number;
  locale: string;
  mediaRef?: string;
  quiz?: {
    questions: Array<{
      id: string;
      kind: "multiple_choice" | "true_false";
      prompt: string;
      choices: string[];
      answerIndex: number;
      explanation?: string;
    }>;
  };
  meta?: {
    createdBy: "AI" | "company";
    source?: "generated" | "extracted" | "improved";
    aiLabeled?: boolean;
  };
};
```

Server validates with Zod before returning to the client. Invalid JSON → retry once → deterministic error to UI.

---

## Guardrails

1. **No hallucinated regulations** — if the user did not provide policy text, use suggestion: “Confirm requirements with company HSE / local jurisdiction.”  
2. **Encourage review** — API responses include `reviewRequired: true`; publish UI requires confirmation checkbox.  
3. **AI-generated labels** — Editor banner + per-block “AI” chip when `meta.createdBy === "AI"`.  
4. **Tenant isolation** — `fileRefId` must resolve under `companyId`.  
5. **PII** — redacted in extraction logs where feasible.  
6. **Deterministic outline** — generate-from-text must include the seven outline sections (empty body + flag if context missing, rather than inventing).

---

## UI bindings (AiBuilderSidebar)

| Prompt in UI | Capability |
|--------------|------------|
| “Describe your site; I’ll build an orientation” | generate-from-text |
| “Paste your safety rules; I’ll structure them” | generate-from-text (+ rules fields) |
| “Upload your PDF; I’ll convert it” | generate-from-file |
| Generate / Refine / Summarize / Localize | generate · improve-block · summarize variant · locale improve |
| Generate quiz from content | generate-quiz |

Banner: **AI-generated draft — review before publish.**  
Publish: checkbox **I confirm content was reviewed by authorized staff.**

---

## Evolve current `OrientationAiService`

| Today | Target |
|-------|--------|
| Template `generate()` fill | LLM + Zod-validated JSON |
| `sections` / `quiz` locale maps | Unified `contentBlocks[]` |
| String `generator` metadata | Full `aiMetadata` object |
| No file convert | Extract → generate-from-file |
| Monolith generate | Split endpoints per capability |

Until the LLM path ships, keep the template generator behind the same endpoints with `aiMetadata.generatedByModel: "vera-orientation-template-v1"` so the FE contract stays stable.

---

## Related

- Canvas: `VeriForge-Orientation-AI-Behavior.canvas.tsx`
- Backend SOA: `AIOrientationBuilderService`
- UI/UX: AI rail prompts and review gate
