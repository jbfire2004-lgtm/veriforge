import { FlhaAgent } from "./flha-agent";
import { ImageAgent } from "./image-agent";
import { SafetyAgent } from "./safety-agent";
import { WorkflowAgent } from "./workflow-agent";
import { resolveAgent } from "./router";
import type { AgentDeps, AgentOperation, AgentRequest, AgentResult } from "./types";

/**
 * Central VeriAgent — routes operations to specialized sub-agents.
 * All sub-agents operate inside the same policy / privacy / orchestration boundary.
 */
export class VeriAgent {
  private readonly flha: FlhaAgent;
  private readonly image: ImageAgent;
  private readonly safety: SafetyAgent;
  private readonly workflow: WorkflowAgent;

  constructor(deps: AgentDeps) {
    this.flha = new FlhaAgent(deps);
    this.image = new ImageAgent(deps);
    this.safety = new SafetyAgent(deps);
    this.workflow = new WorkflowAgent(deps);
  }

  /** Primary internal entry — not a public HTTP API. */
  async invoke(request: AgentRequest): Promise<AgentResult> {
    const agentId = resolveAgent(request.operation);
    switch (agentId) {
      case "flha":
        return this.flha.handle(request);
      case "image":
        return this.image.handle(request);
      case "safety":
        return this.safety.handle(request);
      case "workflow":
        return this.workflow.handle(request);
      default: {
        const _exhaustive: never = agentId;
        return {
          ok: false,
          operation: request.operation,
          code: "unknown_agent",
          message: `Unknown agent: ${_exhaustive}`,
          meta: {
            correlationId: request.context.correlationId,
            latencyMs: 0,
          },
        };
      }
    }
  }

  /** Convenience helpers (still internal). */
  analyzeFlha(
    context: AgentRequest["context"],
    data: unknown,
  ): Promise<AgentResult> {
    return this.invoke({ operation: "flha.analyze", context, data });
  }

  describeImage(
    context: AgentRequest["context"],
    data: unknown,
  ): Promise<AgentResult> {
    return this.invoke({ operation: "image.describe", context, data });
  }

  safetyBriefing(
    context: AgentRequest["context"],
    data: unknown,
  ): Promise<AgentResult> {
    return this.invoke({ operation: "safety.briefing", context, data });
  }

  runWorkflow(
    operation: Extract<
      AgentOperation,
      "workflow.reminder" | "workflow.escalate" | "workflow.summarize"
    >,
    context: AgentRequest["context"],
    data: unknown,
  ): Promise<AgentResult> {
    return this.invoke({ operation, context, data });
  }
}
