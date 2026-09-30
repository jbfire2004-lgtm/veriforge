"use client";

import Link from "next/link";
import { useSmsInteractionFlow } from "@/hooks/useSmsInteractionFlow";
import { SMS_CROSS_LINKS } from "@/lib/verisuite-sms-flows";
import type { SmsPlane } from "@/lib/verisuite-sms-api";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  page: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  role?: string;
  flowId?: string;
  title?: string;
  showCrossLinks?: boolean;
};

/**
 * Interactive flow guide for Full Interaction Flows — steps, AI triggers,
 * validation, errors, success, and role variations.
 */
export function SmsInteractionFlowPanel({
  page,
  companyId,
  projectId,
  plane = "project",
  role,
  flowId,
  title = "Interaction flow",
  showCrossLinks = true,
}: Props) {
  const {
    pageFlows,
    activeFlowId,
    selectFlow,
    flow,
    progress,
    roleGate,
    loading,
    error,
    advance,
  } = useSmsInteractionFlow({
    page,
    flowId,
    companyId,
    projectId,
    plane,
    role,
  });

  return (
    <div className="vs-panel space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="vs-eyebrow">{title}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: VS_COLORS.white }}>
            {flow?.name ?? "Loading flow…"}
          </p>
        </div>
        {progress ? (
          <span
            className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              color: progress.complete ? VS_COLORS.emerald : VS_COLORS.blue,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            {progress.complete ? "Success" : `Step ${progress.stepIndex + 1}`} ·{" "}
            {progress.percent}%
          </span>
        ) : null}
      </div>

      {pageFlows.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {pageFlows.map((f) => (
            <button
              key={f.id}
              type="button"
              className="rounded px-2 py-1 text-[11px] font-semibold"
              style={{
                border: `1px solid ${VS_COLORS.border}`,
                color:
                  f.id === activeFlowId ? VS_COLORS.navy : VS_COLORS.muted,
                background:
                  f.id === activeFlowId ? VS_COLORS.blue : "transparent",
              }}
              onClick={() => selectFlow(f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
      ) : null}

      {(loading || error) && (
        <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
          {loading ? "Loading flow catalog…" : `Flow fallback · ${error}`}
        </p>
      )}

      {flow ? (
        <>
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            <span style={{ color: VS_COLORS.white }}>Entry:</span> {flow.entry}
          </p>
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            <span style={{ color: VS_COLORS.white }}>Roles:</span>{" "}
            {flow.rolesSummary}
          </p>
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            <span style={{ color: VS_COLORS.white }}>AI:</span>{" "}
            {flow.aiTriggers.join(", ")}
          </p>
          {roleGate ? (
            <p className="text-xs" style={{ color: VS_COLORS.orange }}>
              Role gate · {roleGate.variation}
              {roleGate.canWrite ? " · write" : " · read-only"}
              {roleGate.canApprove ? " · approve" : ""}
            </p>
          ) : null}

          {progress?.step ? (
            <div
              className="rounded border p-3"
              style={{ borderColor: VS_COLORS.border }}
            >
              <p
                className="text-[10px] uppercase tracking-wide"
                style={{ color: VS_COLORS.muted }}
              >
                Current user action
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: VS_COLORS.white }}>
                {progress.step.userAction}
              </p>
              <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                <span style={{ color: VS_COLORS.blue }}>System:</span>{" "}
                {progress.step.systemResponse}
              </p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                <span style={{ color: VS_COLORS.orange }}>AI / validation:</span>{" "}
                {progress.step.aiOrValidation}
              </p>
              {progress.step.api ? (
                <p className="mt-1 text-[10px]" style={{ color: VS_COLORS.muted }}>
                  {progress.step.api.method} {progress.step.api.path}
                </p>
              ) : null}
            </div>
          ) : null}

          {progress?.complete ? (
            <div
              className="rounded border p-3"
              style={{ borderColor: VS_COLORS.emerald }}
            >
              <p className="text-xs font-semibold" style={{ color: VS_COLORS.emerald }}>
                Success state
              </p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                {flow.success}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px]" style={{ color: VS_COLORS.muted }}>
                {flow.dodChecks.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ) : (
            <button
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold"
              style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
              onClick={() => void advance()}
            >
              Advance step
            </button>
          )}

          <details className="text-xs" style={{ color: VS_COLORS.muted }}>
            <summary className="cursor-pointer font-semibold" style={{ color: VS_COLORS.white }}>
              All steps · errors · role variations
            </summary>
            <ol className="mt-2 list-decimal space-y-2 pl-4">
              {flow.steps.map((s) => (
                <li key={s.id}>
                  <span style={{ color: VS_COLORS.white }}>{s.userAction}</span>
                  <br />
                  → {s.systemResponse}
                  <br />
                  · {s.aiOrValidation}
                </li>
              ))}
            </ol>
            <p className="mt-3 font-semibold" style={{ color: VS_COLORS.white }}>
              Error handling
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {flow.errors.map((e) => (
                <li key={`${e.code}-${e.ux}`}>
                  {e.code}: {e.ux}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold" style={{ color: VS_COLORS.white }}>
              Role-based variations
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {flow.roleVariations.map((r) => (
                <li key={r.role}>
                  {r.role}: {r.variation}
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : null}

      {showCrossLinks && page === "home" ? (
        <div className="border-t pt-3" style={{ borderColor: VS_COLORS.border }}>
          <p className="vs-eyebrow">Cross-page intelligence links</p>
          <ul className="mt-2 space-y-1 text-xs">
            {SMS_CROSS_LINKS.map((l) => (
              <li key={l.nextAction}>
                <Link href={l.to} style={{ color: VS_COLORS.blue }}>
                  {l.from} → {l.nextAction}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
