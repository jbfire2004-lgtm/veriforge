"use client";

import * as React from "react";
import {
  VeriForgeButton,
  VeriForgeCodeBlock,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeProgressBar,
} from "@/components/veriforge";

type Priority = "Critical" | "High" | "Normal";

const workflowSteps = [
  "Ticket Creation",
  "Triage",
  "Assignment",
  "Resolution",
  "Follow-Up",
];

const KB_CARDS = [
  {
    title: "Training Module Sync Delays",
    detail: "Resolve delayed assignment propagation and progress mismatch conditions.",
  },
  {
    title: "Verification Workflow Stalls",
    detail: "Recover forgeCheck execution when forgeStatus remains pending unexpectedly.",
  },
  {
    title: "Compliance Reminder Drift",
    detail: "Re-align deadline notifications and requirement lifecycle states.",
  },
];

const TROUBLESHOOT_STEPS = [
  "Identify symptom scope and impacted workflow rail.",
  "Validate system health and queue behavior.",
  "Apply targeted remediation and rerun verification path.",
  "Document root cause and close with follow-up recommendation.",
];

export function SupportTicketsWidget() {
  const [subject, setSubject] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("Normal");

  const tags = React.useMemo(() => {
    const combined = `${subject} ${details}`.toLowerCase();
    const derived: string[] = [];
    if (combined.includes("training")) derived.push("training");
    if (combined.includes("verification") || combined.includes("forgecheck") || combined.includes("forgestatus")) {
      derived.push("verification");
    }
    if (combined.includes("compliance")) derived.push("compliance");
    return derived;
  }, [details, subject]);

  const priorityStyle =
    priority === "Critical"
      ? "border-[var(--vf-color-forge-red)] bg-[rgba(198,40,40,.22)] shadow-[var(--vf-effect-glow-primary)]"
      : priority === "High"
        ? "border-[var(--vf-color-forge-red)] bg-[#241818]"
        : "border-[var(--vf-color-steel-grey)] bg-[#1d1d1d]";

  return (
    <VeriForgeDocSection title="Ticket Submission Form">
      <div className="space-y-3">
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Issue subject"
          className="h-11 w-full border border-[var(--vf-color-steel-grey)] bg-[#181818] px-3 text-sm text-[#fafafa] outline-none focus:border-[var(--vf-color-forge-red)] focus:shadow-[var(--vf-effect-glow-primary)]"
        />
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Describe impact and observed behavior"
          rows={4}
          className="w-full border border-[var(--vf-color-steel-grey)] bg-[#181818] px-3 py-2 text-sm text-[#fafafa] outline-none focus:border-[var(--vf-color-forge-red)] focus:shadow-[var(--vf-effect-glow-primary)]"
        />
        <div className="grid gap-2 md:grid-cols-3">
          {(["Critical", "High", "Normal"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setPriority(level)}
              className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] transition ${priority === level ? priorityStyle : "border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] text-[#cfcfcf]"}`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="rounded-none border border-[var(--vf-color-steel-grey)] bg-[#1a1a1a] p-3 text-sm text-[#d3d3d3]">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#ffcccc]">Auto Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--vf-color-forge-red)] bg-[rgba(198,40,40,.16)] px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#aaaaaa]">No keyword tags detected</span>
            )}
          </div>
        </div>
        <VeriForgeButton className="w-full">Submit Ticket</VeriForgeButton>
      </div>
    </VeriForgeDocSection>
  );
}

export function SupportStatusWidget() {
  return (
    <VeriForgeDocSection title="Status Indicators">
      <div className="space-y-4">
        <VeriForgeProgressBar label="Support Queue Throughput" value={82} />
        <VeriForgeProgressBar label="Verification Pipeline Stability" value={91} />
        <VeriForgeProgressBar label="Compliance Reminder Delivery" value={86} />
      </div>
    </VeriForgeDocSection>
  );
}

export function SupportKnowledgeBaseWidget() {
  return (
    <VeriForgeDocSection title="Knowledge Base Cards">
      <div className="grid gap-2 md:grid-cols-3">
        {KB_CARDS.map((card) => (
          <article
            key={card.title}
            className="border border-[var(--vf-color-forge-red)] bg-[linear-gradient(160deg,#1f1f1f_0%,#171717_100%)] p-3"
          >
            <h3 className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#fafafa]">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-[#cccccc]">{card.detail}</p>
          </article>
        ))}
      </div>
    </VeriForgeDocSection>
  );
}

export function SupportTroubleshootingWidget() {
  return (
    <>
      <VeriForgeDocSection title="Troubleshooting Steps">
        <VeriForgeDocSteps steps={TROUBLESHOOT_STEPS} />
      </VeriForgeDocSection>
      <VeriForgeDocSection title="Troubleshooting Flowchart">
        <VeriForgeCodeBlock
          language="flow"
          code={"[Issue Intake] -> [Module Isolation] -> [Health Check] -> [Fix] -> [Validation]"}
        />
      </VeriForgeDocSection>
    </>
  );
}

export function SupportWorkflowWidget() {
  return (
    <VeriForgeDocSection title="Support Workflow">
      <div className="grid gap-2 md:grid-cols-5">
        {workflowSteps.map((step) => (
          <div
            key={step}
            className="border border-[var(--vf-color-steel-grey)] bg-[#1e1e1e] px-2 py-2 text-center text-[10px] uppercase tracking-[0.12em] text-[#d4d4d4]"
          >
            {step}
          </div>
        ))}
      </div>
    </VeriForgeDocSection>
  );
}

