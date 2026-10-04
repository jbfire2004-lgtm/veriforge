/**
 * Interaction flow runner helpers — validate catalog integrity and
 * resolve next step / role gates for QA and API.
 */
import { SMS_QA_AI_BEHAVIORS, SMS_QA_ENDPOINTS } from './sms-qa-catalog';
import {
  SMS_INTERACTION_FLOWS,
  SMS_FLOW_SHARED_PATTERNS,
  SMS_FLOW_VALIDATION_MATRIX,
  SMS_CROSS_LINK_MAP,
  getSmsInteractionFlow,
  type SmsFlowRole,
  type SmsInteractionFlow,
  type SmsFlowStep,
} from './sms-interaction-flows';

const ENDPOINT_KEYS = new Set(
  SMS_QA_ENDPOINTS.map((e) => `${e.method} ${e.path}`),
);

const AI_IDS = new Set<string>(SMS_QA_AI_BEHAVIORS.map((b) => b.id));

export type SmsFlowIntegrityReport = {
  ok: boolean;
  flowCount: number;
  issues: string[];
};

export function assertSmsFlowCatalogIntegrity(): SmsFlowIntegrityReport {
  const issues: string[] = [];
  if (SMS_INTERACTION_FLOWS.length !== 12) {
    issues.push(
      `Expected 12 primary flows, found ${SMS_INTERACTION_FLOWS.length}`,
    );
  }
  if (SMS_FLOW_SHARED_PATTERNS.length < 8) {
    issues.push('Shared patterns incomplete');
  }
  if (SMS_FLOW_VALIDATION_MATRIX.length < 8) {
    issues.push('Validation matrix incomplete');
  }
  if (SMS_CROSS_LINK_MAP.length < 8) {
    issues.push('Cross-link map incomplete');
  }

  const ids = new Set<string>();
  for (const flow of SMS_INTERACTION_FLOWS) {
    if (ids.has(flow.id)) issues.push(`Duplicate flow id ${flow.id}`);
    ids.add(flow.id);
    if (!flow.steps.length) issues.push(`${flow.id} has no steps`);
    if (!flow.success) issues.push(`${flow.id} missing success`);
    if (!flow.errors.length) issues.push(`${flow.id} missing errors`);
    if (!flow.roleVariations.length) {
      issues.push(`${flow.id} missing role variations`);
    }
    if (!flow.dodChecks.length) issues.push(`${flow.id} missing DoD checks`);
    for (const ai of flow.aiTriggers) {
      if (!AI_IDS.has(ai)) issues.push(`${flow.id} unknown AI ${ai}`);
    }
    for (const step of flow.steps) {
      validateStep(flow.id, step, issues);
    }
    for (const branch of flow.branches ?? []) {
      for (const step of branch.steps) {
        validateStep(`${flow.id}/${branch.id}`, step, issues);
      }
    }
  }

  return {
    ok: issues.length === 0,
    flowCount: SMS_INTERACTION_FLOWS.length,
    issues,
  };
}

function validateStep(
  flowKey: string,
  step: SmsFlowStep,
  issues: string[],
) {
  if (!step.userAction || !step.systemResponse || !step.aiOrValidation) {
    issues.push(`${flowKey} step ${step.id} incomplete`);
  }
  if (step.api) {
    const key = `${step.api.method} ${step.api.path}`;
    if (!ENDPOINT_KEYS.has(key)) {
      issues.push(`${flowKey} step ${step.id} unknown API ${key}`);
    }
  }
  for (const ai of step.aiTriggers ?? []) {
    if (!AI_IDS.has(ai)) {
      issues.push(`${flowKey} step ${step.id} unknown AI ${ai}`);
    }
  }
}

export type SmsFlowProgress = {
  flowId: string;
  stepIndex: number;
  step: SmsFlowStep | null;
  complete: boolean;
  nextStep: SmsFlowStep | null;
  percent: number;
};

export function startFlow(flowId: string): SmsFlowProgress {
  const flow = getSmsInteractionFlow(flowId);
  if (!flow) {
    return {
      flowId,
      stepIndex: -1,
      step: null,
      complete: false,
      nextStep: null,
      percent: 0,
    };
  }
  return {
    flowId,
    stepIndex: 0,
    step: flow.steps[0] ?? null,
    complete: false,
    nextStep: flow.steps[1] ?? null,
    percent: flow.steps.length ? Math.round(100 / flow.steps.length) : 0,
  };
}

export function advanceFlow(
  flowId: string,
  stepIndex: number,
): SmsFlowProgress {
  const flow = getSmsInteractionFlow(flowId);
  if (!flow) {
    return startFlow(flowId);
  }
  const next = stepIndex + 1;
  if (next >= flow.steps.length) {
    return {
      flowId,
      stepIndex: flow.steps.length - 1,
      step: flow.steps[flow.steps.length - 1] ?? null,
      complete: true,
      nextStep: null,
      percent: 100,
    };
  }
  return {
    flowId,
    stepIndex: next,
    step: flow.steps[next] ?? null,
    complete: false,
    nextStep: flow.steps[next + 1] ?? null,
    percent: Math.round(((next + 1) / flow.steps.length) * 100),
  };
}

export function describeRoleGate(
  flow: SmsInteractionFlow,
  role: SmsFlowRole,
): {
  allowed: boolean;
  variation: string;
  canWrite: boolean;
  canApprove: boolean;
} {
  const match = flow.roleVariations.find((r) => r.role === role);
  if (!match) {
    const canWrite = ['HSE', 'PM', 'SUPERVISOR', 'COMPANY_ADMIN', 'INSPECTOR'].includes(
      role,
    );
    return {
      allowed: true,
      variation: 'Default ACL',
      canWrite,
      canApprove: ['HSE', 'PM', 'COMPANY_ADMIN'].includes(role),
    };
  }
  return {
    allowed: true,
    variation: match.variation,
    canWrite: match.canWrite !== false,
    canApprove: !!match.canApprove,
  };
}

export function mapErrorToUx(
  flowId: string,
  code: string,
): string | undefined {
  const flow = getSmsInteractionFlow(flowId);
  return flow?.errors.find((e) => e.code === code)?.ux;
}
