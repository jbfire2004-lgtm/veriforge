# VeriForge Form Template Engine

**Version:** 1.0.0  
**Scope:** Unified template system for FLHA, JHA/JSA, and PM checklists  
**Principle:** One engine · different labels · domain-specific sections  
**Depends on:** Document Service (`docs/VERIFORGE-DOCUMENT-SERVICE.md`)

---

## 1. Goals

- Power **VERICore** hazard assessments (FLHA, JHA/JSA) and **VERIPM** checklists from one renderer.
- Store form structure as **JSON Schema** (+ optional UI hints).
- Support metadata, repeating sections, required/optional fields, and conditional visibility.
- **Version immutably:** completed documents keep the `template_id` + `template_version` used at creation; new template versions never rewrite history.

---

## 2. `document_templates` table

Canonical name matches Document Service: **`document_templates`** (not `templates`).

```sql
CREATE TABLE document_templates (
  template_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenancy: NULL company_id = platform-wide template
  company_id            UUID REFERENCES companies(company_id),

  name                  TEXT NOT NULL,
  domain                document_domain NOT NULL,   -- VERICORE | VERIPM
  document_type         document_type NOT NULL,     -- FLHA | JHA | AssetInspection | ...
  version               INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,

  -- Form definition (column: schema — JSON Schema Draft 2020-12)
  schema                JSONB NOT NULL,
  ui_schema             JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_content       JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Lifecycle / publishing
  published_at          TIMESTAMPTZ,
  deprecated_at         TIMESTAMPTZ,
  replaced_by           UUID REFERENCES document_templates(template_id),

  -- Labels pack (optional overrides for shared field keys)
  label_pack            JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- e.g. { "task_steps": "Job Steps", "hazard": "Hazard / Energy" }

  created_by            UUID,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (company_id, domain, document_type, name, version)
);

CREATE INDEX idx_document_templates_lookup
  ON document_templates (company_id, domain, document_type, is_active);

CREATE INDEX idx_document_templates_schema_gin
  ON document_templates USING GIN (schema jsonb_path_ops);
```

### Document binding (immutability)

On `documents` (Document Service canonical DDL):

```sql
template_id           UUID NOT NULL REFERENCES document_templates(template_id),
template_version      INTEGER NOT NULL,  -- copied from document_templates.version at create; NEVER update
```

**Rules**
1. Creating a document copies `template_id` + `template_version` and freezes them.
2. Validation always uses the schema for that exact `document_templates` row (each version is its own row).
3. Publishing v2 inserts a **new row** (`version = n+1`); v1 remains for historical documents.
4. `is_active = true` only on the latest publishable version per `(company, domain, type, name)` (enforce in service layer).
5. Completed/locked documents never re-validate against a newer schema.

**Versioning workflow**
```
Draft template v1 → Publish (is_active=true)
Edit → Create v2 row (copy schema) → Publish v2 → deprecate v1 (is_active=false)
Existing docs still point at v1 row
```

---

## 3. JSON Schema conventions

### 3.1 Top-level document content shape

All form `content_data` follows:

```json
{
  "metadata": { },
  "sections": { },
  "task_steps": [ ],
  "check_items": [ ],
  "signoff": { }
}
```

| Block | VERICore FLHA/JHA | VERIPM checklist |
|---|---|---|
| `metadata` | Required | Required |
| `task_steps` | Required (repeating hazard rows) | Optional / unused |
| `check_items` | Unused | Required (repeating PM rows) |
| `signoff` | Optional (roles also on document.signatures) | Optional |

### 3.2 Standard field types → JSON Schema

| UI type | JSON Schema | Notes |
|---|---|---|
| text | `{ "type": "string", "maxLength": n }` | Single line |
| textarea | `string` + `ui:widget: textarea` | Multiline |
| date | `{ "type": "string", "format": "date" }` | ISO date |
| datetime | `{ "type": "string", "format": "date-time" }` | |
| number | `{ "type": "number" }` | Measurements |
| integer | `{ "type": "integer" }` | Counts, scores |
| boolean | `{ "type": "boolean" }` | Pass/fail toggles |
| enum / select | `{ "enum": [...] }` | Likelihood, severity, result |
| uuid-ref | `{ "type": "string", "format": "uuid" }` | worker, job, asset refs |
| string[] | `{ "type": "array", "items": { "type": "string" } }` | Crew multi-select |
| object | nested object | Groups |
| array of objects | repeating section | task_steps / check_items |

### 3.3 Required vs optional

- Use JSON Schema `"required": ["field", ...]` on each object.
- Optional fields omit from `required` and may include `"default"`.
- Engine treats missing optional as `null` / omit; required empty string fails validation.

### 3.4 Conditional visibility (`ui_schema`)

JSON Schema alone cannot express UI visibility cleanly. Put conditions in `ui_schema`:

```json
{
  "ui:order": ["metadata", "task_steps", "signoff"],
  "task_steps": {
    "items": {
      "high_risk_controls": {
        "ui:visibleWhen": {
          "field": "risk_rating",
          "op": "in",
          "value": ["High", "Critical"]
        }
      }
    }
  }
}
```

**Supported operators:** `eq`, `neq`, `in`, `notIn`, `gt`, `gte`, `lt`, `lte`, `truthy`, `falsy`

**Evaluation scope:** relative to the current object (row in a repeating section, or root).

Hidden fields are **stripped or ignored on submit** (configurable); they are not required while hidden.

### 3.5 Risk rating convention (FLHA/JHA)

```
likelihood:  Rare | Unlikely | Possible | Likely | AlmostCertain
severity:   Insignificant | Minor | Moderate | Major | Catastrophic
risk_rating: Low | Medium | High | Critical   // computed client-side, stored
```

Matrix lives in `ui_schema.riskMatrix` so labels can change without code deploys.

### 3.6 Label packs

Same schema keys; different product language:

```json
{
  "task_steps": "Job Steps",
  "task_step": "Task / Step",
  "hazard": "Hazard",
  "controls": "Controls / Barriers"
}
```

FLHA vs JHA can share one schema with different `label_pack` / `name`.

---

## 4. Example A — FLHA / JHA pre-task hazard assessment

**Template meta:** `domain=VERICORE`, `document_type=FLHA` (or `JHA`), `version=1`

### `schema`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "veriforge:templates/vericore/flha/v1",
  "title": "FLHA / JHA Pre-Task Hazard Assessment",
  "type": "object",
  "additionalProperties": false,
  "required": ["metadata", "task_steps"],
  "properties": {
    "metadata": {
      "type": "object",
      "additionalProperties": false,
      "required": ["date", "location", "supervisor_id", "job_id"],
      "properties": {
        "date": {
          "type": "string",
          "format": "date",
          "title": "Date"
        },
        "location": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200,
          "title": "Location"
        },
        "location_id": {
          "type": ["string", "null"],
          "format": "uuid",
          "title": "Location reference"
        },
        "crew_ids": {
          "type": "array",
          "title": "Crew",
          "items": { "type": "string", "format": "uuid" },
          "uniqueItems": true,
          "default": []
        },
        "supervisor_id": {
          "type": "string",
          "format": "uuid",
          "title": "Supervisor"
        },
        "job_id": {
          "type": "string",
          "format": "uuid",
          "title": "Job / Project reference"
        },
        "project_id": {
          "type": ["string", "null"],
          "format": "uuid",
          "title": "Project"
        },
        "work_description": {
          "type": "string",
          "maxLength": 2000,
          "title": "Work description"
        },
        "permit_required": {
          "type": "boolean",
          "title": "Permit required",
          "default": false
        },
        "permit_number": {
          "type": ["string", "null"],
          "maxLength": 100,
          "title": "Permit number"
        }
      }
    },
    "task_steps": {
      "type": "array",
      "title": "Task steps",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "task_step",
          "hazard",
          "likelihood",
          "severity",
          "risk_rating",
          "controls"
        ],
        "properties": {
          "task_step": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500,
            "title": "Task step"
          },
          "hazard": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500,
            "title": "Hazard"
          },
          "likelihood": {
            "type": "string",
            "title": "Likelihood",
            "enum": ["Rare", "Unlikely", "Possible", "Likely", "AlmostCertain"]
          },
          "severity": {
            "type": "string",
            "title": "Severity",
            "enum": ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"]
          },
          "risk_rating": {
            "type": "string",
            "title": "Risk rating",
            "enum": ["Low", "Medium", "High", "Critical"]
          },
          "controls": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000,
            "title": "Controls"
          },
          "high_risk_controls": {
            "type": ["string", "null"],
            "maxLength": 2000,
            "title": "Additional high-risk controls"
          },
          "residual_risk": {
            "type": ["string", "null"],
            "enum": ["Low", "Medium", "High", "Critical", null],
            "title": "Residual risk"
          }
        }
      }
    },
    "signoff": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "crew_briefed": {
          "type": "boolean",
          "title": "Crew briefed on hazards and controls",
          "default": false
        },
        "stop_work_authority_acknowledged": {
          "type": "boolean",
          "title": "Stop-work authority acknowledged",
          "default": false
        }
      }
    }
  }
}
```

### `ui_schema` (excerpt)

```json
{
  "ui:order": ["metadata", "task_steps", "signoff"],
  "metadata": {
    "ui:order": [
      "date",
      "location",
      "location_id",
      "crew_ids",
      "supervisor_id",
      "job_id",
      "project_id",
      "work_description",
      "permit_required",
      "permit_number"
    ],
    "crew_ids": { "ui:widget": "workerMultiSelect" },
    "supervisor_id": { "ui:widget": "workerSelect" },
    "job_id": { "ui:widget": "jobSelect" },
    "project_id": { "ui:widget": "projectSelect" },
    "location_id": { "ui:widget": "locationSelect" },
    "work_description": { "ui:widget": "textarea" },
    "permit_number": {
      "ui:visibleWhen": {
        "field": "permit_required",
        "op": "eq",
        "value": true
      }
    }
  },
  "task_steps": {
    "ui:widget": "repeatableSection",
    "ui:addLabel": "Add task step",
    "items": {
      "ui:order": [
        "task_step",
        "hazard",
        "likelihood",
        "severity",
        "risk_rating",
        "controls",
        "high_risk_controls",
        "residual_risk"
      ],
      "controls": { "ui:widget": "textarea" },
      "high_risk_controls": {
        "ui:widget": "textarea",
        "ui:visibleWhen": {
          "field": "risk_rating",
          "op": "in",
          "value": ["High", "Critical"]
        }
      },
      "risk_rating": {
        "ui:widget": "riskRating",
        "ui:computeFrom": ["likelihood", "severity"]
      }
    }
  },
  "riskMatrix": {
    "AlmostCertain": {
      "Insignificant": "Medium",
      "Minor": "High",
      "Moderate": "High",
      "Major": "Critical",
      "Catastrophic": "Critical"
    },
    "Likely": {
      "Insignificant": "Medium",
      "Minor": "Medium",
      "Moderate": "High",
      "Major": "Critical",
      "Catastrophic": "Critical"
    },
    "Possible": {
      "Insignificant": "Low",
      "Minor": "Medium",
      "Moderate": "Medium",
      "Major": "High",
      "Catastrophic": "Critical"
    },
    "Unlikely": {
      "Insignificant": "Low",
      "Minor": "Low",
      "Moderate": "Medium",
      "Major": "High",
      "Catastrophic": "High"
    },
    "Rare": {
      "Insignificant": "Low",
      "Minor": "Low",
      "Moderate": "Low",
      "Major": "Medium",
      "Catastrophic": "High"
    }
  }
}
```

---

## 5. Example B — PM asset inspection checklist

**Template meta:** `domain=VERIPM`, `document_type=AssetInspection`, `version=1`

### `schema`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "veriforge:templates/veripm/asset-inspection/v1",
  "title": "PM Asset Inspection Checklist",
  "type": "object",
  "additionalProperties": false,
  "required": ["metadata", "check_items"],
  "properties": {
    "metadata": {
      "type": "object",
      "additionalProperties": false,
      "required": ["date", "location", "supervisor_id", "asset_id"],
      "properties": {
        "date": {
          "type": "string",
          "format": "date",
          "title": "Inspection date"
        },
        "location": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200,
          "title": "Location"
        },
        "site_id": {
          "type": ["string", "null"],
          "format": "uuid",
          "title": "Site"
        },
        "crew_ids": {
          "type": "array",
          "title": "Technicians",
          "items": { "type": "string", "format": "uuid" },
          "default": []
        },
        "supervisor_id": {
          "type": "string",
          "format": "uuid",
          "title": "Supervisor"
        },
        "asset_id": {
          "type": "string",
          "format": "uuid",
          "title": "Asset"
        },
        "asset_group_id": {
          "type": ["string", "null"],
          "format": "uuid",
          "title": "Asset group"
        },
        "work_order_id": {
          "type": ["string", "null"],
          "format": "uuid",
          "title": "Work order reference"
        },
        "meter_reading": {
          "type": ["number", "null"],
          "title": "Meter / hours reading"
        }
      }
    },
    "check_items": {
      "type": "array",
      "title": "Checklist items",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["check_item", "result"],
        "properties": {
          "check_item": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500,
            "title": "Check item"
          },
          "measurement": {
            "type": ["number", "null"],
            "title": "Measurement"
          },
          "unit": {
            "type": ["string", "null"],
            "maxLength": 32,
            "title": "Unit",
            "enum": ["psi", "bar", "C", "F", "mm", "in", "rpm", "V", "A", "hrs", "%", null]
          },
          "min": {
            "type": ["number", "null"],
            "title": "Min"
          },
          "max": {
            "type": ["number", "null"],
            "title": "Max"
          },
          "result": {
            "type": "string",
            "title": "Result",
            "enum": ["Pass", "Fail", "N/A", "Adjusted"]
          },
          "notes": {
            "type": ["string", "null"],
            "maxLength": 2000,
            "title": "Notes"
          },
          "failure_detail": {
            "type": ["string", "null"],
            "maxLength": 2000,
            "title": "Failure detail"
          },
          "out_of_range": {
            "type": ["boolean", "null"],
            "title": "Out of range",
            "readOnly": true
          }
        }
      }
    },
    "signoff": {
      "type": "object",
      "properties": {
        "asset_safe_to_operate": {
          "type": "boolean",
          "title": "Asset safe to operate",
          "default": false
        },
        "follow_up_required": {
          "type": "boolean",
          "title": "Follow-up work order required",
          "default": false
        }
      }
    }
  }
}
```

### `ui_schema` (excerpt)

```json
{
  "ui:order": ["metadata", "check_items", "signoff"],
  "metadata": {
    "asset_id": { "ui:widget": "assetSelect" },
    "site_id": { "ui:widget": "siteSelect" },
    "crew_ids": { "ui:widget": "workerMultiSelect" },
    "supervisor_id": { "ui:widget": "workerSelect" },
    "work_order_id": { "ui:widget": "workOrderSelect" }
  },
  "check_items": {
    "ui:widget": "repeatableSection",
    "ui:addLabel": "Add check item",
    "items": {
      "ui:order": [
        "check_item",
        "measurement",
        "unit",
        "min",
        "max",
        "result",
        "out_of_range",
        "notes",
        "failure_detail"
      ],
      "notes": { "ui:widget": "textarea" },
      "failure_detail": {
        "ui:widget": "textarea",
        "ui:visibleWhen": {
          "field": "result",
          "op": "eq",
          "value": "Fail"
        }
      },
      "out_of_range": {
        "ui:widget": "computedFlag",
        "ui:compute": "measurementOutOfRange"
      }
    }
  }
}
```

**Client compute:** `out_of_range = measurement != null && ((min != null && measurement < min) || (max != null && measurement > max))`. Suggest `result = Fail` when out of range (user can override with audit note).

---

## 6. Front-end rendering strategy

### 6.1 Architecture

```
Template API
    ↓
useDocumentForm(template) 
    ↓
SchemaFormEngine
  ├─ resolveLabel(key, label_pack)
  ├─ evaluateVisible(ui:visibleWhen, context)
  ├─ FieldRenderer (by ui:widget / schema type)
  └─ RepeatableSection (array items)
    ↓
content_data (controlled state)
    ↓
AJV validate(schema, content_data) before save/complete
```

**Recommended stack (Vera):** React + controlled state; validate with **AJV** (Draft 2020-12). Do not hard-code FLHA vs PM screens—branch only on schema keys / widgets.

### 6.2 Load & bind

1. `GET /document-templates/{id}` → `{ schema, ui_schema, label_pack, version }`.
2. Create document → server stores `template_id`, `template_version`, seeds `content_data` from `default_content`.
3. Editor always loads schema from the **document’s** template row (not “latest active”).

### 6.3 Field rendering map

| Detection | Component |
|---|---|
| `ui:widget` set | Named widget registry |
| `format: date` | DatePicker |
| `format: date-time` | DateTimePicker |
| `format: uuid` + `*Select` widget | Entity picker (worker/job/asset) |
| `enum` | Select / segmented control |
| `type: boolean` | Toggle / checkbox |
| `type: number` | NumberInput |
| `type: string` + textarea widget | Textarea |
| `type: string` | TextInput |
| `type: array` + object items | `RepeatableSection` |
| `type: object` | Nested `Fieldset` / Card |

Industrial chrome: use VeriForge input tokens (slate/graphite, safety-blue focus). Risk badges: green/amber/red per design system—not decorative.

### 6.4 Repeatable sections

- Render each array item as a bordered panel with index label (“Step 1”, “Check 2”).
- Actions: Add (append `defaultItem`), Duplicate, Remove (respect `minItems`).
- Per-item validation errors keyed as `task_steps[2].hazard`.
- For PM: allow “load from asset template defaults” to prefill `check_items` from asset class library (optional service).

### 6.5 Conditional visibility

```ts
function isVisible(rule, ctx): boolean {
  if (!rule) return true;
  const actual = get(ctx, rule.field);
  switch (rule.op) {
    case "eq": return actual === rule.value;
    case "in": return rule.value.includes(actual);
    // ...
  }
}
```

- While hidden: exclude from `required` checks; do not show errors.
- On hide: optionally clear value (default **clear** for safety-critical conditionals like `failure_detail`).

### 6.6 Computed fields

| Widget | Behavior |
|---|---|
| `riskRating` | Set from likelihood × severity via `ui_schema.riskMatrix` |
| `computedFlag` | e.g. measurement out of range |

Computed fields are `readOnly` in UI; still stored in `content_data` for audit.

### 6.7 Validation UX

1. **On blur / section:** field-level AJV errors.
2. **On save (PATCH):** full schema validate; 400 from API if drift.
3. **On complete:** schema valid + signature requirements + custom rules (e.g. no Critical residual without high_risk_controls).

Map AJV `instancePath` → field error under the control (amber text per design system).

### 6.8 Labels & domains

```ts
label(key, schemaTitle) => labelPack[key] ?? schemaTitle ?? humanize(key)
```

Same engine renders:
- FLHA titled “Field Level Hazard Assessment”
- JHA titled “Job Hazard Analysis”  
- PM titled “Asset Inspection”

…via template `name` + `label_pack`, not separate form apps.

### 6.9 Locked / completed documents

- If `document.locked_at`: render **read-only** FieldRenderer (no inputs).
- Still use the frozen template version for layout—never “upgrade” the form under a completed doc.

### 6.10 Accessibility & industrial UX

- Visible labels always (schema `title` / label pack).
- Focus rings = safety blue.
- Repeatable “Add” = Action button; “Remove” = Warning (amber), not critical red.
- Status chips for Pass/Fail/High risk use design-system badges.

---

## 7. API surface (template engine)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/document-templates?domain=&document_type=&active=true` | List |
| `GET` | `/api/v1/document-templates/{template_id}` | Schema + ui_schema + labels |
| `POST` | `/api/v1/document-templates` | Create v1 draft (admin) |
| `POST` | `/api/v1/document-templates/{template_id}/versions` | Fork next version |
| `POST` | `/api/v1/document-templates/{template_id}/publish` | Activate; deprecate prior |
| `POST` | `/api/v1/documents` | Persists `template_id` + `template_version` |

Validate endpoint (optional):  
`POST /api/v1/document-templates/{template_id}/validate` `{ "content_data": {} }` → `{ "valid": true, "errors": [] }`

---

## 8. Summary

| Concern | Approach |
|---|---|
| One engine | JSON Schema + ui_schema + widget registry |
| FLHA/JHA | `task_steps[]` with hazard/risk/controls |
| PM | `check_items[]` with measurement/limits/result |
| Required/optional | JSON Schema `required` |
| Conditionals | `ui:visibleWhen` in ui_schema |
| Versioning | New row per version; documents store `template_version`; never mutate published schema in place |

---

*Form Template Engine v1.0.0 — VeriForge · VERICore · VERIPM*
