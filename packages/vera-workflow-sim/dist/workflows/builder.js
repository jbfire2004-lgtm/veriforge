"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkflow = buildWorkflow;
function buildWorkflow(input) {
    const stateSet = new Set([input.initialState, ...input.terminalStates]);
    for (const t of input.transitions) {
        stateSet.add(t.from);
        stateSet.add(t.to);
    }
    return {
        id: input.id,
        title: input.title,
        category: input.category,
        description: input.description,
        initialState: input.initialState,
        terminalStates: input.terminalStates,
        states: [...stateSet],
        steps: input.steps,
        transitions: input.transitions,
        modules: input.modules,
    };
}
//# sourceMappingURL=builder.js.map