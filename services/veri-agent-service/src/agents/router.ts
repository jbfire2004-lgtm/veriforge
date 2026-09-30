import type { AgentId, AgentOperation } from "./types";

const ROUTES: Record<AgentOperation, AgentId> = {
  "flha.analyze": "flha",
  "flha.review": "flha",
  "flha.review_create": "flha",
  "image.describe": "image",
  "safety.briefing": "safety",
  "safety.checklist": "safety",
  "safety.recommend": "safety",
  "workflow.reminder": "workflow",
  "workflow.escalate": "workflow",
  "workflow.summarize": "workflow",
};

/**
 * Decide which specialized sub-agent handles an operation.
 */
export function resolveAgent(operation: AgentOperation): AgentId {
  const agent = ROUTES[operation];
  if (!agent) {
    throw new Error(`No sub-agent registered for operation: ${operation}`);
  }
  return agent;
}

export function listOperationsForAgent(agent: AgentId): AgentOperation[] {
  return (Object.entries(ROUTES) as [AgentOperation, AgentId][])
    .filter(([, id]) => id === agent)
    .map(([op]) => op);
}
