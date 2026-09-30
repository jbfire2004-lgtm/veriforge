import type {
  LifecycleCategory,
  WorkflowDefinition,
  WorkflowStepDef,
  WorkflowTransition,
} from "../types";

type BuildInput = {
  id: string;
  title: string;
  category: LifecycleCategory;
  description?: string;
  initialState: string;
  terminalStates: string[];
  steps: WorkflowStepDef[];
  transitions: WorkflowTransition[];
  modules: string[];
};

export function buildWorkflow(input: BuildInput): WorkflowDefinition {
  const stateSet = new Set<string>([input.initialState, ...input.terminalStates]);
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
