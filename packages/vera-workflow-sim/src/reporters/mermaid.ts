import type { WorkflowDefinition } from "../types";

export function workflowToMermaid(workflow: WorkflowDefinition): string {
  const lines: string[] = [
    "```mermaid",
    "stateDiagram-v2",
    `  [*] --> ${sanitize(workflow.initialState)}`,
  ];

  for (const t of workflow.transitions) {
    lines.push(
      `  ${sanitize(t.from)} --> ${sanitize(t.to)}: ${escapeLabel(t.event)}`
    );
  }

  for (const terminal of workflow.terminalStates) {
    lines.push(`  ${sanitize(terminal)} --> [*]`);
  }

  lines.push("```");
  return lines.join("\n");
}

export function allWorkflowsMermaid(workflows: WorkflowDefinition[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const w of workflows) {
    out[w.id] = workflowToMermaid(w);
  }
  return out;
}

function sanitize(state: string): string {
  return state.replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeLabel(s: string): string {
  return s.replace(/"/g, "'");
}
