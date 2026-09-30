export type VeriForgeSalesPlaybookContent = {
  title: string;
  summary: string;
  version: string;
  lastUpdated: string;
  author: string;
  steps: string[];
  script: { language: string; content: string };
  diagram: { title: string; lines: string[] };
};

const META = {
  version: "v1.0.0-forge-sales",
  lastUpdated: "2026-07-08",
  author: "VeriForge Revenue Systems",
} as const;

export const VERIFORGE_SALES_PLAYBOOK_NAV = [
  { label: "Positioning", href: "/sales-playbook/positioning" },
  { label: "Value Prop", href: "/sales-playbook/value-prop" },
  { label: "Scripts", href: "/sales-playbook/scripts" },
  { label: "Objections", href: "/sales-playbook/objections" },
  { label: "Email Templates", href: "/sales-playbook/email-templates" },
  { label: "Demo Flow", href: "/sales-playbook/demo-flow" },
  { label: "Closing", href: "/sales-playbook/closing" },
  { label: "Follow-Up", href: "/sales-playbook/follow-up" },
] as const;

export const VERIFORGE_SALES_PLAYBOOK_CONTENT: Record<string, VeriForgeSalesPlaybookContent> = {
  positioning: {
    title: "Positioning",
    summary:
      "VeriForge is the industrial-strength platform forged for absolute safety. Lead with the brand story: safety engineered, not improvised — then close on the manifesto.",
    ...META,
    steps: [
      "Open with belief: safety should be engineered, not improvised.",
      "Position VeriForge as the industrial platform unifying training, verification, compliance, and incidents.",
      "Anchor value in strength, precision, and reliability — never soft language.",
      "Close with foundation line: not just software — forged for absolute safety.",
      "Reference /veriforge/brand and manifesto law 10 when aligning exec stakeholders.",
    ],
    script: {
      language: "talk-track",
      content:
        "VeriForge was built on the belief that safety should be engineered, not improvised. We are the industrial-strength platform forged to unify training, verification, compliance, and incident management. Every workflow is designed with engineered precision. VeriForge is not just software — it is a foundation forged for absolute safety.",
    },
    diagram: {
      title: "Positioning Rail",
      lines: [
        "[Belief] -> [Unified Platform] -> [Precision Craft] -> [Foundation / Absolute Safety]",
      ],
    },
  },
  "value-prop": {
    title: "Value Proposition",
    summary:
      "Unified training, verification, and compliance delivered through industrial-grade workflows and a forged-metal interface that communicates trust.",
    ...META,
    steps: [
      "Show one platform replacing fragmented tools.",
      "Highlight workflow speed from assignment to verification closure.",
      "Quantify compliance readiness and audit traceability.",
      "Emphasize trust-signaling forged-metal interface consistency.",
    ],
    script: {
      language: "value-grid",
      content:
        "Unified Control: training + verification + compliance\nOperational Gain: fewer handoffs, faster closure\nTrust Signal: forged-metal UI with deterministic workflow states",
    },
    diagram: {
      title: "Value Stack",
      lines: [
        "[Unified Platform] + [Industrial Workflows] + [Trust-Centered UI] -> [Higher Safety Throughput]",
      ],
    },
  },
  scripts: {
    title: "Sales Scripts",
    summary:
      "Battle-tested script rail for open, discovery, demo, and close with industrial tone and engineered precision.",
    ...META,
    steps: [
      "Open with strength and precision positioning.",
      "Run angular discovery around risk, compliance, and workflow gaps.",
      "Demo forgeCheck/forgeStatus path with reliability outcomes.",
      "Close with commitment language and concrete next action.",
    ],
    script: {
      language: "script",
      content:
        "Open: VeriForge strengthens your safety operations with engineered precision.\nDiscovery: Where are risk controls breaking down across training, verification, and compliance?\nDemo: Here is forgeCheck initiation and forgeStatus progression under real workflow load.\nClose: Let's forge your safety foundation together.",
    },
    diagram: {
      title: "Conversation Flow",
      lines: [
        "[Open] -> [Discovery] -> [Demo] -> [Validation] -> [Close]",
      ],
    },
  },
  objections: {
    title: "Objections",
    summary:
      "Response framework for cost, complexity, and timing objections. Keep responses compact, assertive, and operationally grounded.",
    ...META,
    steps: [
      "Acknowledge concern and pivot to operational outcome.",
      "Use short industrial responses with hard business logic.",
      "Reinforce replacement of fragmented systems.",
      "Re-anchor urgency around safety and compliance exposure.",
    ],
    script: {
      language: "objection-handling",
      content:
        "Cost -> VeriForge replaces multiple fragmented tools.\nComplexity -> Industrial strength with simple workflows.\nTiming -> Safety can't wait; forging starts now.",
    },
    diagram: {
      title: "Objection Loop",
      lines: ["[Concern] -> [Reframe] -> [Proof] -> [Next Commitment]"],
    },
  },
  "email-templates": {
    title: "Email Templates",
    summary:
      "Short, bold geometric outbound templates designed for black/steel layout, red CTA hierarchy, and industrial clarity.",
    ...META,
    steps: [
      "Use sharp subject lines with safety + precision framing.",
      "Limit body copy to one operational problem and one outcome.",
      "Apply one red CTA to reduce decision friction.",
      "Close with compliance confidence and workflow reliability.",
    ],
    script: {
      language: "email",
      content:
        "Subject: Forged for Absolute Safety\n\nYour teams need one control surface for training, verification, and compliance.\nVeriForge delivers engineered reliability with forgeCheck workflow precision.\n\n[Book a Demo]",
    },
    diagram: {
      title: "Email Rail",
      lines: ["[Subject] -> [Risk Statement] -> [Reliability Proof] -> [Red CTA]"],
    },
  },
  "demo-flow": {
    title: "Demo Flow",
    summary:
      "Run a precision demo rail: forged-logo open, angular dashboard tour, verification workflow execution, red CTA close.",
    ...META,
    steps: [
      "Start with forged-metal logo animation and control-surface positioning.",
      "Show dashboard geometry, risk panels, and workflow visibility.",
      "Execute forgeCheck and track forgeStatus transitions live.",
      "End with red metallic Book a Demo CTA and mutual next steps.",
    ],
    script: {
      language: "demo-sequence",
      content:
        "01 Intro animation\n02 Dashboard control surface\n03 forgeCheck start\n04 forgeStatus progression\n05 Compliance signal and close CTA",
    },
    diagram: {
      title: "Demo Runbook",
      lines: ["[Logo Intro] -> [Dashboard] -> [forgeCheck] -> [forgeStatus] -> [CTA]"],
    },
  },
  closing: {
    title: "Closing",
    summary:
      "Closing motions that convert urgency into commitment with safety-first narrative and engineered confidence.",
    ...META,
    steps: [
      "Reconfirm quantified pain and risk from discovery.",
      "Map deployment path with a low-friction first milestone.",
      "Use commitment phrase: Let's forge your safety foundation together.",
      "Schedule implementation kickoff before call end.",
    ],
    script: {
      language: "close",
      content:
        "Based on your compliance exposure and workflow delays, VeriForge is the direct path to stronger operational control. Let's forge your safety foundation together. Can we lock kickoff for next week?",
    },
    diagram: {
      title: "Close Rail",
      lines: ["[Pain Recap] -> [Reliability Fit] -> [Commitment Ask] -> [Kickoff Date]"],
    },
  },
  "follow-up": {
    title: "Follow-Up",
    summary:
      "Post-call execution rail that reinforces trust, answers unresolved blockers, and protects momentum to signature.",
    ...META,
    steps: [
      "Send recap within 2 hours with decision context.",
      "Attach demo highlights: forgeCheck + forgeStatus path.",
      "Answer open objections with concise industrial proof.",
      "Drive next meeting with clear owner and due date.",
    ],
    script: {
      language: "follow-up",
      content:
        "Recap: We aligned on replacing fragmented tools with one reliability rail.\nAttached: Demo summary and deployment path.\nNext: confirm stakeholder review and finalize pilot start date.",
    },
    diagram: {
      title: "Momentum Rail",
      lines: ["[Recap] -> [Proof] -> [Stakeholder Alignment] -> [Pilot Launch]"],
    },
  },
};

