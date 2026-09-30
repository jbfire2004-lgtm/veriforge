export type VeriForgePartnerContent = {
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
  version: "v1.0.0-forge-partners",
  lastUpdated: "2026-07-08",
  author: "VeriForge Partner Engineering",
} as const;

export const VERIFORGE_PARTNER_NAV = [
  { label: "Overview", href: "/partners/overview" },
  { label: "Tiers", href: "/partners/tiers" },
  { label: "Benefits", href: "/partners/benefits" },
  { label: "Apply", href: "/partners/apply" },
  { label: "Resources", href: "/partners/resources" },
  { label: "Portal", href: "/partners/portal" },
] as const;

export const VERIFORGE_PARTNER_CONTENT: Record<string, VeriForgePartnerContent> = {
  overview: {
    title: "Partner Program Overview",
    summary:
      "Industrial partner ecosystem designed to attract, support, and scale integration partners with precision workflows and compliance confidence.",
    ...META,
    steps: [
      "Position VeriForge as the industrial safety integration command rail.",
      "Guide partners through tier qualification and operational readiness.",
      "Apply compliance verification before portal activation.",
      "Unlock portal resources and co-marketing execution lanes.",
    ],
    code: {
      language: "workflow",
      content:
        "application -> review -> approval -> onboarding -> portal access",
    },
    diagram: {
      title: "Partner Lifecycle Rail",
      lines: ["[Apply] -> [Review] -> [Approve] -> [Onboard] -> [Portal]"],
    },
  },
  tiers: {
    title: "Partner Tiers",
    summary:
      "Three forged tier tracks: Forge, Alloy, and Apex with escalating integration depth, enablement, and support coverage.",
    ...META,
    steps: [
      "Start in Forge for core integrations and training readiness.",
      "Advance to Alloy for co-marketing and expanded integration scope.",
      "Reach Apex for full workflow integration and dedicated support.",
      "Maintain compliance score thresholds for tier retention.",
    ],
    code: {
      language: "tier-map",
      content:
        "Forge: basic integrations + training\nAlloy: advanced integrations + co-marketing\nApex: full workflow integration + dedicated support",
    },
    diagram: {
      title: "Tier Progression",
      lines: ["[Forge] -> [Alloy] -> [Apex]"],
    },
  },
  benefits: {
    title: "Partner Benefits",
    summary:
      "Benefit matrix covering API access, co-branded assets, training enablement, compliance alignment, and joint campaigns.",
    ...META,
    steps: [
      "Provision API access and integration references.",
      "Distribute co-branded material packages by tier.",
      "Enable partner training modules and certification tracks.",
      "Align compliance posture with shared verification standards.",
    ],
    code: {
      language: "benefits",
      content:
        "api access\nco-branded materials\ntraining modules\ncompliance alignment\njoint marketing campaigns",
    },
    diagram: {
      title: "Benefits Distribution",
      lines: ["[Tier] -> [Enablement Pack] -> [Execution] -> [Performance Review]"],
    },
  },
  apply: {
    title: "Apply to Program",
    summary:
      "Structured partner application intake with keyword validation, compliance pre-check, and review queue assignment.",
    ...META,
    steps: [
      "Submit application profile and integration scope.",
      "Auto-classify by capability and compliance readiness signals.",
      "Route application for review and decision SLA.",
      "Trigger onboarding flow on approval.",
    ],
    code: {
      language: "application",
      content:
        "fields: company, contact, integration focus, compliance posture, requested tier",
    },
    diagram: {
      title: "Application Flow",
      lines: ["[Form Submit] -> [Validation] -> [Review Queue] -> [Decision]"],
    },
  },
  resources: {
    title: "Resources",
    summary:
      "Download center for API guides, brand kits, co-marketing briefs, and compliance playbooks in angular industrial containers.",
    ...META,
    steps: [
      "Access resource bundles by partner tier eligibility.",
      "Track download events for enablement analytics.",
      "Keep versioned documents synchronized with product updates.",
      "Route resource gaps to partner support queue.",
    ],
    code: {
      language: "resources",
      content:
        "api-guide.pdf\nbrand-kit.zip\nco-marketing-playbook.pdf\ncompliance-checklist.pdf",
    },
    diagram: {
      title: "Resource Supply Rail",
      lines: ["[Tier Access] -> [Download] -> [Activation] -> [Feedback]"],
    },
  },
  portal: {
    title: "Partner Portal",
    summary:
      "Operational portal for integration status, compliance checks, campaign tracking, and dedicated support channels.",
    ...META,
    steps: [
      "Surface integration health and workflow completion indicators.",
      "Run automated partner compliance verification checks.",
      "Expose shared campaign metrics and enablement tasks.",
      "Provide direct support escalation for Apex partners.",
    ],
    code: {
      language: "portal-signals",
      content:
        "integrationHealth: 93%\ncomplianceVerification: pass\ncampaignReadiness: active\nsupportLane: dedicated",
    },
    diagram: {
      title: "Portal Operations",
      lines: ["[Health] + [Compliance] + [Campaign] + [Support] -> [Partner Success]"],
    },
  },
};

