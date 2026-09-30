"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  HardHat,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import type { PmWorkflowStep } from "@/lib/navigation/pm-workflow";

type StepVisual = {
  icon: LucideIcon;
  accent: string;
  surface: string;
  ring: string;
  iconBg: string;
  tagline: string;
  ctaClass: string;
};

const STEP_VISUALS: Record<string, StepVisual> = {
  plan: {
    icon: ClipboardCheck,
    accent: "from-[#1e4a7a] to-[#2F85CC]",
    surface: "from-[#dbeafe]/80 via-[#f0f6fc] to-white",
    ring: "ring-[#1e4a7a]/15",
    iconBg: "from-[#1e4a7a] to-[#1E6FB8]",
    tagline: "Before work starts",
    ctaClass:
      "border border-[#1e4a7a]/25 bg-white text-[#2A2E33] hover:bg-[#f0f6fc]",
  },
  execute: {
    icon: HardHat,
    accent: "from-[#2F8F8C] to-[#2dd4bf]",
    surface: "from-[#E4F3F2]/80 via-[#E4F3F2] to-white",
    ring: "ring-[#2F8F8C]/20",
    iconBg: "from-[#2F8F8C] to-[#3AA39F]",
    tagline: "On site",
    ctaClass: "bg-[#2A2E33] text-white hover:bg-[#1e4a7a] shadow-sm",
  },
  intelligence: {
    icon: Sparkles,
    accent: "from-[#d97706] to-[#C89F3D]",
    surface: "from-[#fef3c7]/90 via-[#fffbeb] to-white",
    ring: "ring-amber-400/25",
    iconBg: "from-[#d97706] to-[#C89F3D]",
    tagline: "CAIL intelligence",
    ctaClass:
      "border border-amber-500/40 bg-amber-50 text-amber-950 hover:bg-amber-100",
  },
  close: {
    icon: BadgeCheck,
    accent: "from-[#059669] to-[#34d399]",
    surface: "from-[#d1fae5]/70 via-[#ecfdf5] to-white",
    ring: "ring-emerald-400/20",
    iconBg: "from-[#059669] to-[#10b981]",
    tagline: "Verified closure",
    ctaClass:
      "border border-emerald-500/35 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  },
  ingest: {
    icon: Upload,
    accent: "from-[#1e4a7a] to-[#2F85CC]",
    surface: "from-[#dbeafe]/80 via-[#f0f6fc] to-white",
    ring: "ring-[#1e4a7a]/15",
    iconBg: "from-[#1e4a7a] to-[#1E6FB8]",
    tagline: "Load evidence",
    ctaClass:
      "border border-[#1e4a7a]/25 bg-white text-[#2A2E33] hover:bg-[#f0f6fc]",
  },
  verify: {
    icon: ShieldCheck,
    accent: "from-[#2F8F8C] to-[#2dd4bf]",
    surface: "from-[#E4F3F2]/80 via-[#E4F3F2] to-white",
    ring: "ring-[#2F8F8C]/20",
    iconBg: "from-[#2F8F8C] to-[#3AA39F]",
    tagline: "Attest & sign off",
    ctaClass: "bg-[#2A2E33] text-white hover:bg-[#1e4a7a] shadow-sm",
  },
  readiness: {
    icon: BadgeCheck,
    accent: "from-[#059669] to-[#34d399]",
    surface: "from-[#d1fae5]/70 via-[#ecfdf5] to-white",
    ring: "ring-emerald-400/20",
    iconBg: "from-[#059669] to-[#10b981]",
    tagline: "Compliance roll-up",
    ctaClass:
      "border border-emerald-500/35 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  },
  document: {
    icon: FileText,
    accent: "from-[#475569] to-[#64748b]",
    surface: "from-[#f1f5f9]/90 via-[#f8fafc] to-white",
    ring: "ring-slate-400/20",
    iconBg: "from-[#334155] to-[#475569]",
    tagline: "Field narrative",
    ctaClass:
      "border border-slate-400/30 bg-white text-[#2A2E33] hover:bg-slate-50",
  },
};

const DEFAULT_VISUAL = STEP_VISUALS.plan;

function WorkflowConnector({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center px-1 sm:px-2 ${className ?? ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 48 24"
        className="h-6 w-10 text-[#94a3b8]/70 sm:w-12"
        fill="none"
      >
        <path
          d="M2 12 H34 M34 12 L26 5 M34 12 L26 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="12" r="3" fill="currentColor" opacity="0.35" />
      </svg>
    </div>
  );
}

function WorkflowStepCard({
  step,
  index,
  visual,
}: {
  step: PmWorkflowStep;
  index: number;
  visual: StepVisual;
}) {
  const Icon = visual.icon;
  const stepNum = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-b p-5 shadow-md ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${visual.surface} ${visual.ring}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${visual.accent}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2F8F8C]/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${visual.iconBg}`}
        >
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a6b7c] ring-1 ring-[#2A2E33]/8">
          {stepNum}
        </span>
      </div>

      <p
        className={`mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] ${visual.tagline.includes("CAIL") ? "text-amber-800" : "text-[#5a6b7c]"}`}
      >
        {visual.tagline}
      </p>
      <h3 className="mt-1 text-lg font-bold uppercase tracking-[0.04em] text-[#2A2E33]">
        {step.label}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5a6b7c]">
        {step.description}
      </p>

      {step.href ? (
        <Link
          href={step.href}
          className={`mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold uppercase tracking-[0.08em] transition ${visual.ctaClass}`}
        >
          Open step
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </article>
  );
}

type Props = {
  steps: PmWorkflowStep[];
  sectionId?: string;
  sectionEyebrow?: string;
  sectionTitle?: string;
  sectionDescription?: string;
};

export function PmWorkflowJourney({
  steps,
  sectionId = "workspace-workflow-heading",
  sectionEyebrow = "Field-to-closure pipeline",
  sectionTitle = "Recommended workflow",
  sectionDescription = "Move from planning through execution, CAIL intelligence, and verified closure — the same journey shown on the VERA home experience, tuned for project safety leads.",
}: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-[#f4f7fa] shadow-lg"
      aria-labelledby={sectionId}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 12%, rgba(217,119,6,0.12) 0%, transparent 42%), radial-gradient(circle at 92% 88%, rgba(13,148,136,0.14) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(30,74,122,0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(#2A2E33 1px, transparent 1px), linear-gradient(90deg, #2A2E33 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative border-b border-[#2A2E33]/8 bg-gradient-to-br from-[#2A2E33] via-[#0f2847] to-[#2F8F8C]/85 px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.14) 0%, transparent 45%), radial-gradient(circle at 85% 70%, rgba(45,212,191,0.3) 0%, transparent 42%)",
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200/90">
            {sectionEyebrow}
          </p>
          <h2
            id={sectionId}
            className="mt-2 text-2xl font-bold uppercase tracking-[0.06em] sm:text-3xl"
          >
            {sectionTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-teal-50/90">
            {sectionDescription}
          </p>
        </div>
        <div className="relative mt-6 hidden items-center gap-2 lg:flex" aria-hidden>
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold ring-1 ring-white/25">
                {i + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                {step.label.split(" ")[0]}
              </span>
              {i < steps.length - 1 ? (
                <ArrowRight className="mx-1 h-4 w-4 text-teal-200/70" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="hidden items-stretch lg:flex">
          {steps.map((step, index) => {
            const visual = STEP_VISUALS[step.id] ?? DEFAULT_VISUAL;
            return (
              <div key={step.id} className="flex min-w-0 flex-1 items-stretch">
                <WorkflowStepCard step={step} index={index} visual={visual} />
                {index < steps.length - 1 ? (
                  <WorkflowConnector className="self-center" />
                ) : null}
              </div>
            );
          })}
        </div>

        <ol className="space-y-4 lg:hidden">
          {steps.map((step, index) => {
            const visual = STEP_VISUALS[step.id] ?? DEFAULT_VISUAL;
            const isLast = index === steps.length - 1;
            return (
              <li key={step.id} className="relative">
                <WorkflowStepCard step={step} index={index} visual={visual} />
                {!isLast ? (
                  <div
                    className="mx-auto my-3 flex h-8 w-8 items-center justify-center text-[#94a3b8]"
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 32" className="h-8 w-6" fill="none">
                      <path
                        d="M12 2 V22 M12 22 L7 17 M12 22 L17 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
