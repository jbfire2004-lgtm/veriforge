import { createAuditEvent } from "../logging";
import { failureResult, runProtectedAi, successResult } from "./base";
import type { AgentDeps, AgentRequest, AgentResult } from "./types";
import { VeriAgentError } from "../core/types";

type WorkflowData = {
  workflowType?: string;
  subject?: string;
  /** Opaque ids only — no PII */
  targetUserId?: number;
  projectId?: number;
  dueInHours?: number;
  severity?: "low" | "medium" | "high" | "critical";
  summaryHints?: string[];
  openItemCount?: number;
};

/**
 * Workflow Agent — reminders, escalations, and safety workflow summaries.
 * Internal only; automates safety-related workflows without exposing payloads.
 */
export class WorkflowAgent {
  constructor(private readonly deps: AgentDeps) {}

  async handle(req: AgentRequest): Promise<AgentResult> {
    const started = Date.now();
    const { operation, context } = req;
    if (
      operation !== "workflow.reminder" &&
      operation !== "workflow.escalate" &&
      operation !== "workflow.summarize"
    ) {
      return failureResult(
        operation,
        context.correlationId,
        started,
        "unsupported_operation",
        `WorkflowAgent does not handle ${operation}`,
        "workflow",
      );
    }

    try {
      const data = (req.data ?? {}) as WorkflowData;

      if (operation === "workflow.reminder") {
        return this.reminder(req, data, started);
      }
      if (operation === "workflow.escalate") {
        return this.escalate(req, data, started);
      }
      return await this.summarize(req, data, started);
    } catch (err) {
      if (err instanceof VeriAgentError) {
        return failureResult(
          operation,
          context.correlationId,
          started,
          err.code,
          err.message,
          "workflow",
        );
      }
      throw err;
    }
  }

  private reminder(
    req: AgentRequest,
    data: WorkflowData,
    started: number,
  ): AgentResult {
    const policy = this.deps.policy.evaluatePolicy(
      {
        tenant: req.context.tenant,
        actor: req.context.actor,
        correlationId: req.context.correlationId,
      },
      "flha.view",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
      },
    );
    if (!policy.allowed) {
      return failureResult(
        "workflow.reminder",
        req.context.correlationId,
        started,
        policy.code ?? "policy_denied",
        policy.reason ?? "Denied",
        "workflow",
      );
    }

    const dueInHours = data.dueInHours ?? 24;
    return successResult(
      "workflow",
      "workflow.reminder",
      req.context.correlationId,
      started,
      {
        policy,
        data: {
          action: "reminder_scheduled",
          subject: (data.subject ?? "safety_task").slice(0, 80),
          targetUserId: data.targetUserId,
          projectId: data.projectId ?? req.context.tenant.projectId,
          dueInHours,
          messageTemplate:
            "Reminder: complete required safety task before work continues.",
        },
      },
    );
  }

  private escalate(
    req: AgentRequest,
    data: WorkflowData,
    started: number,
  ): AgentResult {
    const policy = this.deps.policy.evaluatePolicy(
      {
        tenant: req.context.tenant,
        actor: req.context.actor,
        correlationId: req.context.correlationId,
      },
      "flha.view",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
      },
    );
    if (!policy.allowed) {
      return failureResult(
        "workflow.escalate",
        req.context.correlationId,
        started,
        policy.code ?? "policy_denied",
        policy.reason ?? "Denied",
        "workflow",
      );
    }

    const severity = data.severity ?? "high";
    return successResult(
      "workflow",
      "workflow.escalate",
      req.context.correlationId,
      started,
      {
        policy,
        data: {
          action: "escalation_created",
          severity,
          subject: (data.subject ?? "safety_escalation").slice(0, 80),
          projectId: data.projectId ?? req.context.tenant.projectId,
          notifyRoles: ["SAFETY_LEAD", "PROJECT_MANAGER"],
          requiresAck: severity === "critical" || severity === "high",
        },
      },
    );
  }

  private async summarize(
    req: AgentRequest,
    data: WorkflowData,
    started: number,
  ): Promise<AgentResult> {
    const hints = (data.summaryHints ?? []).map((h) => h.slice(0, 80));
    const userText = JSON.stringify({
      openItemCount: data.openItemCount ?? hints.length,
      hints,
      workflowType: data.workflowType ?? "safety",
    });

    const protectedResult = await runProtectedAi(this.deps, {
      operation: "workflow.summarize",
      context: req.context,
      purpose: "vsi_copilot",
      taskType: "summarization",
      policyData: {
        visibility: "approved",
        isReviewFlha: true,
        isContractorFlha: false,
      },
      privacyPayload: {
        kind: "generic",
        system:
          "You summarize construction safety workflow status. Return JSON only: {\"summary\":string,\"nextActions\":string[]}. No names or locations.",
        userText,
      },
    });

    this.deps.audit.auditLog(
      createAuditEvent(
        {
          tenant: req.context.tenant,
          actor: req.context.actor,
          correlationId: req.context.correlationId,
        },
        "workflow.summarize",
        protectedResult.policy,
        {
          outcome: "success",
          purpose: "workflow_summarize",
          promptHash: protectedResult.firewall.payloadHash,
          model: protectedResult.ai.model,
          latencyMs: Date.now() - started,
        },
      ),
    );

    return successResult(
      "workflow",
      "workflow.summarize",
      req.context.correlationId,
      started,
      {
        policy: protectedResult.policy,
        firewall: protectedResult.firewall,
        ai: protectedResult.ai,
        data: {
          summary:
            (protectedResult.ai.data.summary as string | undefined) ??
            `Open safety items: ${data.openItemCount ?? hints.length}`,
          nextActions:
            (protectedResult.ai.data.nextActions as string[] | undefined) ??
            ["Review open items with safety lead"],
          analysis: protectedResult.ai.data,
        },
      },
    );
  }
}
