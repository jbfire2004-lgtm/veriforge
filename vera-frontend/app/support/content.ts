export type VeriForgeSupportContent = {
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
  version: "v1.0.0-forge-support",
  lastUpdated: "2026-07-08",
  author: "VeriForge Support Engineering",
} as const;

export const VERIFORGE_SUPPORT_NAV = [
  { label: "Overview", href: "/support/overview" },
  { label: "Knowledge Base", href: "/support/knowledge-base" },
  { label: "Troubleshooting", href: "/support/troubleshooting" },
  { label: "Tickets", href: "/support/tickets" },
  { label: "Status", href: "/support/status" },
  { label: "Contact", href: "/support/contact" },
] as const;

export const VERIFORGE_SUPPORT_CONTENT: Record<string, VeriForgeSupportContent> = {
  overview: {
    title: "Support Overview",
    summary:
      "Industrial support command rail for fast diagnosis, structured ticket flow, and engineered follow-through.",
    ...META,
    steps: [
      "Use support search to route users to exact operational guidance.",
      "Escalate unresolved issues into structured ticket workflow.",
      "Apply priority logic and keyword auto-tagging for triage speed.",
      "Track resolution progress in status rail and follow-up loop.",
    ],
    code: {
      language: "workflow",
      content:
        "ticket creation -> triage -> assignment -> resolution -> follow-up",
    },
    diagram: {
      title: "Support Control Loop",
      lines: ["[Search] -> [Knowledge Base] -> [Ticket] -> [Status] -> [Follow-Up]"],
    },
  },
  "knowledge-base": {
    title: "Knowledge Base",
    summary:
      "Precision articles for training, verification, and compliance operations with short, direct remediation steps.",
    ...META,
    steps: [
      "Start with symptom definition and impact scope.",
      "Apply the shortest reliable remediation path first.",
      "Validate result with forgeCheck or compliance checks.",
      "Escalate to ticket if recurrence persists.",
    ],
    code: {
      language: "kb-snippet",
      content:
        "Issue: verification workflow stalled\nAction: retry workflow/start then inspect forgeStatus\nEscalate: open High priority ticket if status remains pending",
    },
    diagram: {
      title: "Knowledge Decision Rail",
      lines: ["[Symptom] -> [KB Match] -> [Fix Steps] -> [Validation]"],
    },
  },
  troubleshooting: {
    title: "Troubleshooting",
    summary:
      "Step-by-step flowcharts for rapid incident isolation across training, verification, and compliance modules.",
    ...META,
    steps: [
      "Isolate component: training, verification, or compliance.",
      "Confirm service health and workflow state transitions.",
      "Apply controlled remediation and verify outcome.",
      "Document root cause before ticket closure.",
    ],
    code: {
      language: "flowchart",
      content:
        "if forgeStatus === pending -> inspect workflow queue\nif training sync lag > threshold -> retry module assignment sync\nif compliance deadline stale -> refresh requirement index",
    },
    diagram: {
      title: "Troubleshooting Flow",
      lines: [
        "[Identify Failure] -> [Health Check] -> [Remediation] -> [Verification] -> [Close]",
      ],
    },
  },
  tickets: {
    title: "Tickets",
    summary:
      "Submit, triage, assign, and resolve support tickets with industrial priority controls and keyword auto-tagging.",
    ...META,
    steps: [
      "Capture concise issue statement and operational impact.",
      "Auto-tag by keywords: training, verification, compliance.",
      "Set priority: Critical, High, or Normal.",
      "Move ticket across assignment and resolution lanes.",
    ],
    code: {
      language: "tag-logic",
      content:
        "training keywords -> tag: training\nverification keywords -> tag: verification\ncompliance keywords -> tag: compliance",
    },
    diagram: {
      title: "Ticket Lifecycle",
      lines: [
        "[Create] -> [Triage] -> [Assignment] -> [Resolution] -> [Follow-Up]",
      ],
    },
  },
  status: {
    title: "System Status",
    summary:
      "Operational health surfaces with angular indicators, red escalation highlights, and clear incident posture.",
    ...META,
    steps: [
      "Track support queue health and SLA burn-down.",
      "Highlight degraded services with red escalation styling.",
      "Publish live recovery progression and owner status.",
      "Confirm return-to-green and close incident update.",
    ],
    code: {
      language: "status",
      content:
        "supportQueue: 78%\nverificationRail: 91%\ncomplianceResponder: 86%\nincidentEscalation: high",
    },
    diagram: {
      title: "Status Signal Rail",
      lines: ["[Monitor] -> [Detect] -> [Escalate] -> [Recover] -> [Confirm]"],
    },
  },
  contact: {
    title: "Contact Support",
    summary:
      "Structured contact channels with clear ownership and engineered response expectations.",
    ...META,
    steps: [
      "Route urgent incidents to critical response lane.",
      "Provide ticket ID and concise operational context.",
      "Attach logs, screenshots, or workflow identifiers.",
      "Confirm next update window and owner assignment.",
    ],
    code: {
      language: "contact-template",
      content:
        "Severity: Critical\nModule: verification\nImpact: production onboarding blocked\nRequest: immediate triage and owner assignment",
    },
    diagram: {
      title: "Contact Routing",
      lines: ["[Request Intake] -> [Severity Gate] -> [Owner Assign] -> [Resolution]"],
    },
  },
};

