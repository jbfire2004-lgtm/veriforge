"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { AnvilIcon, ForgeBoltIcon, ShieldGridIcon } from "./icons";
import { useVeriForgeNotifications } from "./notifications";

export type AssistantDomain =
  | "training"
  | "verification"
  | "compliance"
  | "onboarding"
  | "workflow"
  | "knowledge"
  | "general";

export type AssistantActionType =
  | "none"
  | "assign_training"
  | "start_verification"
  | "run_compliance"
  | "open_onboarding";

export type AssistantStructuredResponse = {
  domain: AssistantDomain;
  title: string;
  summary: string;
  steps: string[];
  knowledgeResults: Array<{ title: string; href: string; detail: string }>;
  complianceScore: number | null;
  action: {
    type: AssistantActionType;
    label: string;
    payload?: Record<string, unknown>;
  } | null;
  metadata: {
    timestamp: string;
    userId: number | null;
    forgeStatus: "pending" | "forged" | "verified" | "failed";
    workflowStep: string;
  };
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  response?: AssistantStructuredResponse;
  timestamp: string;
};

const QUICK_PROMPTS = [
  "Explain training progress and assign a module",
  "Start forgeCheck verification workflow",
  "Summarize compliance status and expiry alerts",
  "Walk me through onboarding",
  "Search knowledge base for verification",
];

function analyzeLocally(message: string): AssistantStructuredResponse {
  const lower = message.toLowerCase();
  const timestamp = new Date().toISOString();
  const baseMeta = {
    timestamp,
    userId: 1,
    forgeStatus: "verified" as const,
    workflowStep: "assistant.local",
  };

  if (/(train|module|progress|assign)/.test(lower)) {
    return {
      domain: "training",
      title: "TRAINING GUIDANCE",
      summary:
        "Training rail is operational. Modules are available and progress is measurable.",
      steps: [
        "Catalog size: 3 active modules.",
        "Progress: 2/3 complete, 1 in progress.",
        "Assign required modules by role before shift start.",
        "Escalate overdue modules through notification queue.",
      ],
      knowledgeResults: [
        {
          title: "Training Modules",
          href: "/veriforge/training/modules",
          detail: "Open module catalog and assignment controls.",
        },
      ],
      complianceScore: null,
      action: {
        type: "assign_training",
        label: "Trigger Training Assignment",
        payload: { moduleId: "m-101" },
      },
      metadata: { ...baseMeta, workflowStep: "training.guidance" },
    };
  }

  if (/(verif|forgecheck|forgestatus|workflow)/.test(lower)) {
    return {
      domain: "verification",
      title: "VERIFICATION ASSISTANCE",
      summary:
        "forgeCheck execution path is ready. Monitor forgeStatus through pending → verified/failed.",
      steps: [
        "Initiate forgeCheck against target identity or asset.",
        "Track forgeStatus until workflow completion.",
        "Close with workflow/complete and persist audit metadata.",
        "Escalate failed checks to supervisor lane immediately.",
      ],
      knowledgeResults: [
        {
          title: "Verification Checks",
          href: "/veriforge/verification/checks",
          detail: "Inspect active forgeCheck runs and outcomes.",
        },
      ],
      complianceScore: null,
      action: {
        type: "start_verification",
        label: "Start forgeCheck Now",
        payload: { targetId: "user-1" },
      },
      metadata: {
        ...baseMeta,
        forgeStatus: "pending",
        workflowStep: "verification.guidance",
      },
    };
  }

  if (/(complian|expir|requirement|audit|score)/.test(lower)) {
    return {
      domain: "compliance",
      title: "COMPLIANCE ADVISORY",
      summary: "Compliance score is 78%. 1 document approaching expiry.",
      steps: [
        "Requirements active: 2.",
        "Verified documents: 1.",
        "Pending: 1 · Failed: 0.",
        "Score stable. Continue scheduled verification cadence.",
      ],
      knowledgeResults: [
        {
          title: "Compliance Engine",
          href: "/veriforge/compliance",
          detail: "Open requirement, upload, and audit controls.",
        },
      ],
      complianceScore: 78,
      action: {
        type: "run_compliance",
        label: "Run Compliance Automation",
      },
      metadata: { ...baseMeta, workflowStep: "compliance.guidance" },
    };
  }

  if (/(onboard|welcome|identity|walkthrough)/.test(lower)) {
    return {
      domain: "onboarding",
      title: "ONBOARDING WALKTHROUGH",
      summary:
        "Industrial onboarding rail: identity → training → verification → compliance → dashboard.",
      steps: [
        "Confirm identity fields and role assignment.",
        "Auto-assign required training modules.",
        "Execute forgeCheck and confirm forgeStatus.",
        "Upload compliance documents and complete final review.",
      ],
      knowledgeResults: [
        {
          title: "Onboarding",
          href: "/veriforge/onboarding",
          detail: "Launch guided forged-metal onboarding flow.",
        },
      ],
      complianceScore: null,
      action: {
        type: "open_onboarding",
        label: "Open Onboarding Rail",
      },
      metadata: {
        ...baseMeta,
        forgeStatus: "forged",
        workflowStep: "onboarding.guidance",
      },
    };
  }

  return {
    domain: "general",
    title: "VERIFORGE ASSISTANT ONLINE",
    summary:
      "I provide industrial guidance for training, verification, compliance, and onboarding. State the operational objective.",
    steps: [
      "Ask for training progress or module assignment.",
      "Request forgeCheck status or verification start.",
      "Request compliance score and expiry posture.",
      "Request onboarding walkthrough for new operators.",
    ],
    knowledgeResults: [
      {
        title: "Training Modules",
        href: "/veriforge/training/modules",
        detail: "Assign and track industrial training modules.",
      },
      {
        title: "Verification Workflows",
        href: "/veriforge/verification/workflows",
        detail: "Execute forgeCheck and monitor forgeStatus transitions.",
      },
      {
        title: "Compliance Engine",
        href: "/veriforge/compliance",
        detail: "Manage requirements, expiry alerts, and compliance scoring.",
      },
    ],
    complianceScore: null,
    action: null,
    metadata: { ...baseMeta, workflowStep: "assistant.ready" },
  };
}

export function VeriForgeAiAssistant({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { push } = useVeriForgeNotifications();
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: "seed",
      role: "assistant",
      response: analyzeLocally("ready"),
      timestamp: new Date().toISOString(),
    },
  ]);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const ask = async (raw: string) => {
    const message = raw.trim();
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: message,
        timestamp: new Date().toISOString(),
      },
    ]);

    let response = analyzeLocally(message);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (apiBase) {
        const res = await fetch(`${apiBase}/veriforge/assistant/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, userId: 1 }),
        });
        if (res.ok) {
          const json = (await res.json()) as { data?: AssistantStructuredResponse };
          if (json.data) response = json.data;
        }
      }
    } catch {
      // Local industrial fallback remains authoritative when API is offline.
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        response,
        timestamp: new Date().toISOString(),
      },
    ]);
    setBusy(false);
  };

  const runAction = async (action: NonNullable<AssistantStructuredResponse["action"]>) => {
    setBusy(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (apiBase) {
        await fetch(`${apiBase}/veriforge/assistant/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action.type,
            payload: action.payload,
            userId: 1,
          }),
        });
      }
    } catch {
      // Continue with local workflow routing.
    }

    if (action.type === "assign_training") {
      push({
        category: "training",
        tone: "success",
        title: "TRAINING ASSIGNED",
        message: "Lockout-Tagout module assigned via assistant workflow.",
        forgeStatus: "forged",
        userId: 1,
        actionLabel: "Open Training",
      });
      router.push("/veriforge/training/modules");
    } else if (action.type === "start_verification") {
      push({
        category: "verification",
        tone: "info",
        title: "FORGECHECK STARTED",
        message: "Verification workflow initiated. forgeStatus: pending.",
        forgeStatus: "pending",
        userId: 1,
        actionLabel: "Open Verification",
      });
      router.push("/veriforge/verification/checks");
    } else if (action.type === "run_compliance") {
      push({
        category: "compliance",
        tone: "warning",
        title: "COMPLIANCE AUTOMATION",
        message: "Compliance workflow executed. Review score and expiry alerts.",
        forgeStatus: "verified",
        userId: 1,
        actionLabel: "Open Compliance",
      });
      router.push("/veriforge/compliance");
    } else if (action.type === "open_onboarding") {
      router.push("/veriforge/onboarding");
    }
    setBusy(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col border border-[#424242] bg-[#1A1A1A]",
        compact ? "h-[560px]" : "min-h-[720px]",
        className,
      )}
    >
      <header className="border-b border-[#424242] bg-[linear-gradient(180deg,#222_0%,#171717_100%)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AnvilIcon className="text-[#1E6FB8]" />
            <div>
              <p className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                VeriForge AI Assistant
              </p>
              <p className="text-xs text-[#b8b8b8]">
                Safety and verification advisor · forged-metal authority
              </p>
            </div>
          </div>
          <span className="border border-[#1E6FB8] bg-[rgba(30, 111, 184,.18)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffd0d0] shadow-[0_0_12px_rgba(30, 111, 184,.35)]">
            ACTIVE
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] border border-[#1E6FB8] bg-[linear-gradient(145deg,#3a1515_0%,#1f1010_100%)] px-3 py-2 text-sm text-[#ffe8e8] shadow-[0_0_14px_rgba(30, 111, 184,.25)]">
                {message.text}
                <p className="mt-1 text-[10px] text-[#ffbdbd]">{message.timestamp}</p>
              </div>
            </div>
          ) : message.response ? (
            <AssistantBubble
              key={message.id}
              response={message.response}
              onAction={runAction}
              busy={busy}
            />
          ) : null,
        )}
        {busy ? (
          <div className="border border-[#424242] bg-[#1f1f1f] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#cfcfcf]">
            Analyzing request · forging response…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-[#424242] bg-[#151515] p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void ask(prompt)}
              className="border border-[#424242] bg-[#1f1f1f] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#d2d2d2] transition hover:border-[#1E6FB8] hover:shadow-[0_0_10px_rgba(30, 111, 184,.3)]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="State objective: training, forgeCheck, compliance, onboarding…"
            className="h-11 flex-1 border border-[#424242] bg-[#1A1A1A] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#1E6FB8] focus:shadow-[0_0_0_1px_rgba(30, 111, 184,.4),0_0_16px_rgba(30, 111, 184,.28)]"
          />
          <VeriForgeButton type="submit" disabled={busy || !input.trim()}>
            Forge Reply
          </VeriForgeButton>
        </form>
      </div>
    </div>
  );
}

function AssistantBubble({
  response,
  onAction,
  busy,
}: {
  response: AssistantStructuredResponse;
  onAction: (action: NonNullable<AssistantStructuredResponse["action"]>) => void;
  busy: boolean;
}) {
  return (
    <div className="max-w-[95%] border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
      <div className="flex items-start gap-2">
        <ShieldGridIcon className="mt-0.5 text-[#1E6FB8]" />
        <div className="min-w-0 flex-1">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            {response.title}
          </h3>
          <div className="mt-1 h-0.5 w-24 bg-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.5)]" />
          <p className="mt-2 text-sm text-[#d6d6d6]">{response.summary}</p>

          <div className="mt-3 space-y-1.5">
            {response.steps.map((step) => (
              <div key={step} className="flex gap-2 text-sm text-[#d0d0d0]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#1E6FB8] shadow-[0_0_8px_rgba(30, 111, 184,.55)]" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          {typeof response.complianceScore === "number" ? (
            <div className="mt-3">
              <VeriForgeProgressBar
                label="Compliance Status"
                value={response.complianceScore}
              />
            </div>
          ) : null}

          {response.knowledgeResults.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {response.knowledgeResults.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-[#424242] bg-[#1A1A1A] p-2 transition hover:border-[#1E6FB8] hover:shadow-[0_0_12px_rgba(30, 111, 184,.25)]"
                >
                  <p className={cn(veriforgeTypography.heading, "text-[10px] text-[#f0f0f0]")}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[#bdbdbd]">{item.detail}</p>
                </Link>
              ))}
            </div>
          ) : null}

          {response.action ? (
            <div className="mt-3">
              <VeriForgeButton
                size="sm"
                disabled={busy}
                onClick={() => onAction(response.action!)}
              >
                <ForgeBoltIcon className="h-3.5 w-3.5" />
                {response.action.label}
              </VeriForgeButton>
            </div>
          ) : null}

          <VeriForgeDivider className="my-3" />
          <div className="grid gap-1 text-[10px] uppercase tracking-[0.1em] text-[#a8a8a8] md:grid-cols-2">
            <span>timestamp: {response.metadata.timestamp}</span>
            <span>forgeStatus: {response.metadata.forgeStatus}</span>
            <span>workflowStep: {response.metadata.workflowStep}</span>
            <span>userId: {response.metadata.userId ?? "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VeriForgeAssistantDock() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "fixed bottom-20 right-4 z-[96] border border-[#1E6FB8] bg-[#1A1A1A] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#FAFAFA] shadow-[0_0_18px_rgba(30, 111, 184,.4)] md:bottom-6",
          open && "shadow-[0_0_24px_rgba(30, 111, 184,.55)]",
        )}
      >
        {open ? "Close Assistant" : "AI Assistant"}
      </button>
      {open ? (
        <div className="fixed bottom-32 right-4 z-[96] w-[min(440px,calc(100vw-2rem))] md:bottom-20">
          <VeriForgeFrame className="border-[#424242] p-0 shadow-[0_0_30px_rgba(0,0,0,.55)]">
            <VeriForgeAiAssistant compact />
          </VeriForgeFrame>
        </div>
      ) : null}
    </>
  );
}
