"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowToMermaid = workflowToMermaid;
exports.allWorkflowsMermaid = allWorkflowsMermaid;
function workflowToMermaid(workflow) {
    const lines = [
        "```mermaid",
        "stateDiagram-v2",
        `  [*] --> ${sanitize(workflow.initialState)}`,
    ];
    for (const t of workflow.transitions) {
        lines.push(`  ${sanitize(t.from)} --> ${sanitize(t.to)}: ${escapeLabel(t.event)}`);
    }
    for (const terminal of workflow.terminalStates) {
        lines.push(`  ${sanitize(terminal)} --> [*]`);
    }
    lines.push("```");
    return lines.join("\n");
}
function allWorkflowsMermaid(workflows) {
    const out = {};
    for (const w of workflows) {
        out[w.id] = workflowToMermaid(w);
    }
    return out;
}
function sanitize(state) {
    return state.replace(/[^a-zA-Z0-9_]/g, "_");
}
function escapeLabel(s) {
    return s.replace(/"/g, "'");
}
//# sourceMappingURL=mermaid.js.map