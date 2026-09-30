export type VeriForgeDocContent = {
  title: string;
  summary: string;
  version: string;
  lastUpdated: string;
  author: string;
  steps: string[];
  code: { language: string; content: string };
  diagram: { title: string; lines: string[] };
};

const META = {
  version: "v1.0.0-forge",
  lastUpdated: "2026-07-07",
  author: "VeriForge Systems",
} as const;

export const VERIFORGE_DOC_CONTENT: Record<string, VeriForgeDocContent> = {
  "getting-started": {
    title: "Getting Started",
    summary:
      "Initialize VeriForge with industrial-grade defaults, enforce role gates, and activate forgeCheck workflows in under one deployment cycle.",
    ...META,
    steps: [
      "Provision environment variables and set forgeStatus telemetry endpoints.",
      "Seed roles and permissions for SuperAdmin, Admin, SafetyManager, Supervisor, Worker, and Auditor.",
      "Enable onboarding flow and verify training module assignment.",
      "Run forgeCheck smoke workflow and validate compliance reminders.",
    ],
    code: {
      language: "bash",
      content:
        "npm run migrate\nnpm run seed:veriforge-roles\nnpm run dev:backend\ncurl /veriforge/verification/forge-check",
    },
    diagram: {
      title: "Startup Rail",
      lines: [
        "[Auth] -> [RBAC Seed] -> [Training Modules] -> [forgeCheck] -> [Compliance Gate]",
      ],
    },
  },
  "brand-system": {
    title: "Brand System",
    summary:
      "Defines forged-metal identity tokens, logo constraints, typography hierarchy, and angular geometry requirements.",
    ...META,
    steps: [
      "Use iron-black surfaces with steel-grey dividers.",
      "Apply forge-red accent lines under section headers.",
      "Keep title typography uppercase using Orbitron/Exo 2 stack.",
      "Render code blocks with steel-grey fill and red border.",
    ],
    code: {
      language: "css",
      content:
        ".veriforge-title { font-family: var(--vf-font-primary); text-transform: uppercase; border-bottom: 2px solid var(--vf-color-forge-red); }",
    },
    diagram: {
      title: "Identity Stack",
      lines: [
        "[Logo Rules] -> [Token Layer] -> [UI Components] -> [Docs Surfaces]",
      ],
    },
  },
  "brand-story": {
    title: "Brand Story & Manifesto",
    summary:
      "Safety engineered, not improvised. The VeriForge narrative and ten-law manifesto for marketing, sales, and product.",
    ...META,
    steps: [
      "Lead with: safety should be engineered, not improvised.",
      "Position VeriForge as the industrial platform unifying training, verification, compliance, and incidents.",
      "Close with: a foundation forged for absolute safety — not just software.",
      "Apply manifesto lines as angular list items with forge-red index marks.",
      "Keep tone strong, confident, industrial — no fluff, no softness.",
    ],
    code: {
      language: "tsx",
      content:
        'import { VeriForgeBrandStoryPage, VERIFORGE_MANIFESTO } from "@/components/veriforge";\n\n// Full surface: /veriforge/brand\n<VeriForgeBrandStoryPage />\n\n// Manifesto law 01\nVERIFORGE_MANIFESTO[0]\n// "Safety is not optional — it is forged."',
    },
    diagram: {
      title: "Narrative Rail",
      lines: [
        "[Belief] -> [Context] -> [Craft] -> [Foundation]",
        "[Manifesto 01-10] -> [Pillars: Strength · Precision · Reliability]",
        "[Visual Tokens] -> [Homepage · Marketing · Sales · Product]",
      ],
    },
  },
  "ui-components": {
    title: "UI Components",
    summary:
      "Catalog of VeriForge buttons, inputs, cards, tables, alerts, and shell components with strict angular interaction states.",
    ...META,
    steps: [
      "Use primary red metallic CTA for high-priority actions.",
      "Apply steel disabled styles with reduced glow.",
      "Use warning cards for active risk conditions.",
      "Enforce permission-gated controls with VeriForgeCan wrappers.",
    ],
    code: {
      language: "tsx",
      content:
        "<VeriForgeCan permission=\"training.assign\">\n  <VeriForgeButton>Assign Module</VeriForgeButton>\n</VeriForgeCan>",
    },
    diagram: {
      title: "Component Rail",
      lines: ["[Tokens] -> [Primitives] -> [Shell] -> [Page Assemblies]"],
    },
  },
  api: {
    title: "API",
    summary:
      "RESTful VeriForge API contract with structured envelope responses and permission-enforced modules.",
    ...META,
    steps: [
      "Return { status, data, meta } on every successful endpoint.",
      "Return structured error payloads with forgeStatus metadata.",
      "Use kebab-case routes and camelCase JSON payload fields.",
      "Guard endpoints via VeriForgePermissions decorators.",
    ],
    code: {
      language: "json",
      content:
        '{ "status": "ok", "data": { "id": "vrf-123" }, "meta": { "timestamp": "...", "userId": 7, "forgeStatus": "verified" } }',
    },
    diagram: {
      title: "API Flow",
      lines: [
        "[Client] -> [/veriforge/*] -> [RBAC Guard] -> [Service Layer] -> [Response Envelope]",
      ],
    },
  },
  database: {
    title: "Database",
    summary:
      "Relational VeriForge schema for users, training, verification workflows, compliance requirements, and audit logs.",
    ...META,
    steps: [
      "Use cascade deletes on all FK links in VeriForge core tables.",
      "Enforce unique user emails and requirement names.",
      "Index userId, moduleId, checkId, and email for query speed.",
      "Store role definitions with permissions array in roles table.",
    ],
    code: {
      language: "prisma",
      content:
        "model VeriForgeRole {\n  id Int @id @default(autoincrement())\n  name VeriForgeRoleName @unique\n  permissions Json\n}",
    },
    diagram: {
      title: "Schema Rail",
      lines: [
        "[users] -> [trainingAssignments] -> [verificationChecks] -> [verificationWorkflows]",
        "[users] -> [auditLogs]",
      ],
    },
  },
  workflows: {
    title: "Workflows",
    summary:
      "Operational playbooks for onboarding, training assignment, forgeCheck execution, compliance review, and dashboard escalation.",
    ...META,
    steps: [
      "Start workflow from identity-complete onboarding state.",
      "Assign modules by role and capture initial progress.",
      "Run forgeCheck + workflow/start + workflow/complete.",
      "Emit notifications and audit entries with forgeStatus values.",
    ],
    code: {
      language: "http",
      content:
        "POST /veriforge/verification/workflow/start\nPOST /veriforge/verification/workflow/complete",
    },
    diagram: {
      title: "Workflow Engine",
      lines: [
        "[Onboarding] -> [Training] -> [Verification] -> [Compliance] -> [Audit]",
      ],
    },
  },
  onboarding: {
    title: "Onboarding",
    summary:
      "Seven-step forged onboarding rail: welcome, identity, module assignment, forgeCheck, compliance, review, dashboard entry.",
    ...META,
    steps: [
      "Display forged logo and begin onboarding CTA.",
      "Capture identity fields with red-focus controls.",
      "Auto-assign modules and run verification bars.",
      "Collect compliance docs and finalize with complete action.",
    ],
    code: {
      language: "tsx",
      content:
        "if (step === 3) {\n  setVerificationStarted(true);\n  setForgeProgress(20);\n}",
    },
    diagram: {
      title: "Onboarding Rail",
      lines: [
        "[Welcome] -> [Identity] -> [Training] -> [Verification] -> [Compliance] -> [Review] -> [Dashboard]",
      ],
    },
  },
  compliance: {
    title: "Compliance",
    summary:
      "Defines requirement updates, document gates, deadlines, and audit visibility in structured industrial cadence.",
    ...META,
    steps: [
      "List requirements from /veriforge/compliance/requirements.",
      "Update requirement states via controlled permission gate.",
      "Escalate overdue documents through notification manager.",
      "Expose logs to Auditor role only.",
    ],
    code: {
      language: "http",
      content:
        "GET /veriforge/compliance/requirements\nPOST /veriforge/compliance/requirements/update\nGET /veriforge/compliance/audit/logs",
    },
    diagram: {
      title: "Compliance Loop",
      lines: ["[Requirements] -> [Deadlines] -> [Notification] -> [Audit Review]"],
    },
  },
  training: {
    title: "Training",
    summary:
      "Training module lifecycle: catalog, assignment, progress tracking, overdue escalation, and completion evidence.",
    ...META,
    steps: [
      "Catalog modules under training/modules.",
      "Assign modules by role permissions.",
      "Track progress per user and update dashboards.",
      "Publish overdue notices to notification queue.",
    ],
    code: {
      language: "http",
      content:
        "GET /veriforge/training/modules\nPOST /veriforge/training/modules/assign\nGET /veriforge/training/progress/{userId}",
    },
    diagram: {
      title: "Training Rail",
      lines: ["[Modules] -> [Assign] -> [Progress] -> [Overdue Alert]"],
    },
  },
  verification: {
    title: "Verification",
    summary:
      "forgeCheck orchestration model, status polling, and workflow closure with deterministic permissions and metadata.",
    ...META,
    steps: [
      "Start verification with POST forge-check.",
      "Poll forge-status for run state.",
      "Execute workflow/start and workflow/complete transitions.",
      "Persist outcome metadata in audit logs.",
    ],
    code: {
      language: "http",
      content:
        "POST /veriforge/verification/forge-check\nGET /veriforge/verification/forge-status/{id}\nPOST /veriforge/verification/workflow/complete",
    },
    diagram: {
      title: "Verification Rail",
      lines: ["[forgeCheck] -> [forgeStatus] -> [workflow/start] -> [workflow/complete]"],
    },
  },
  faq: {
    title: "FAQ",
    summary:
      "Operational answers for deployment, role gating, schema updates, and verification reliability.",
    ...META,
    steps: [
      "Use role selector to test UI permission gating quickly.",
      "Run prisma validate before every deployment.",
      "Keep API envelope shape stable across modules.",
      "Monitor critical notifications as top-priority queue entries.",
    ],
    code: {
      language: "bash",
      content:
        "npm run typecheck --prefix backend\nnpx prisma validate --schema backend/prisma/schema.prisma\nnpm run lint --prefix vera-frontend",
    },
    diagram: {
      title: "Support Rail",
      lines: ["[Question] -> [Doc Section] -> [Action] -> [Validation]"],
    },
  },
};

