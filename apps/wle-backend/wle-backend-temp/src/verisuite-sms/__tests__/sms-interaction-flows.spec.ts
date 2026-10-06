import {
  SMS_INTERACTION_FLOWS,
  SMS_INTERACTION_FLOW_IDS,
  SMS_FLOW_SHARED_PATTERNS,
  SMS_FLOW_VALIDATION_MATRIX,
  SMS_CROSS_LINK_MAP,
  getSmsInteractionFlow,
  listSmsInteractionFlows,
  roleCanWriteOnFlow,
} from '../qa/sms-interaction-flows';
import {
  assertSmsFlowCatalogIntegrity,
  startFlow,
  advanceFlow,
  describeRoleGate,
} from '../qa/sms-flow-runner';
import { SMS_QA_ENDPOINTS, SMS_QA_AI_BEHAVIORS } from '../qa/sms-qa-catalog';

describe('SMS interaction flows · Full Interaction Flows catalog', () => {
  it('defines exactly 12 primary flows', () => {
    expect(SMS_INTERACTION_FLOWS).toHaveLength(12);
    expect(SMS_INTERACTION_FLOW_IDS).toEqual(
      expect.arrayContaining([
        'create-incident',
        'investigate-incident',
        'create-jha',
        'update-jha',
        'create-flha',
        'review-flha',
        'erp-simulation',
        'complete-inspection',
        'close-action',
        'schedule-meeting',
        'view-dashboards',
        'cross-page-intelligence',
      ]),
    );
  });

  it('passes catalog integrity (APIs + AI ids)', () => {
    const report = assertSmsFlowCatalogIntegrity();
    expect(report.issues).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.flowCount).toBe(12);
  });

  it('includes shared patterns, validation matrix, and cross-links', () => {
    expect(SMS_FLOW_SHARED_PATTERNS.length).toBeGreaterThanOrEqual(8);
    expect(SMS_FLOW_VALIDATION_MATRIX.length).toBeGreaterThanOrEqual(8);
    expect(SMS_CROSS_LINK_MAP.length).toBeGreaterThanOrEqual(8);
  });

  it('every flow has user actions, system responses, AI/validation, errors, success, roles', () => {
    for (const flow of SMS_INTERACTION_FLOWS) {
      expect(flow.name.length).toBeGreaterThan(0);
      expect(flow.entry.length).toBeGreaterThan(0);
      expect(flow.success.length).toBeGreaterThan(0);
      expect(flow.errors.length).toBeGreaterThan(0);
      expect(flow.roleVariations.length).toBeGreaterThan(0);
      expect(flow.dodChecks.length).toBeGreaterThan(0);
      for (const step of flow.steps) {
        expect(step.userAction.length).toBeGreaterThan(0);
        expect(step.systemResponse.length).toBeGreaterThan(0);
        expect(step.aiOrValidation.length).toBeGreaterThan(0);
      }
    }
  });

  it('list helper returns compact summaries', () => {
    const list = listSmsInteractionFlows();
    expect(list).toHaveLength(12);
    expect(list[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        route: expect.any(String),
        stepCount: expect.any(Number),
      }),
    );
  });

  it('role gates distinguish write vs approve', () => {
    expect(roleCanWriteOnFlow('create-incident', 'WORKER')).toBe(true);
    expect(roleCanWriteOnFlow('create-incident', 'AUDITOR')).toBe(false);
    const investigate = getSmsInteractionFlow('investigate-incident')!;
    const hse = describeRoleGate(investigate, 'HSE');
    expect(hse.canApprove).toBe(true);
    const worker = describeRoleGate(investigate, 'WORKER');
    expect(worker.canWrite).toBe(false);
  });

  it('flow runner advances through steps to completion', () => {
    const flow = getSmsInteractionFlow('create-flha')!;
    let progress = startFlow('create-flha');
    expect(progress.stepIndex).toBe(0);
    expect(progress.step?.id).toBe('1');
    for (let i = 0; i < flow.steps.length; i += 1) {
      progress = advanceFlow('create-flha', progress.stepIndex);
    }
    expect(progress.complete).toBe(true);
    expect(progress.percent).toBe(100);
  });

  it('ERP flow includes drill and find-in-emergency branches', () => {
    const erp = getSmsInteractionFlow('erp-simulation')!;
    expect(erp.branches?.map((b) => b.id)).toEqual(
      expect.arrayContaining(['erp-drill', 'find-emergency']),
    );
  });

  it('referenced APIs exist in SMS_QA_ENDPOINTS', () => {
    const keys = new Set(
      SMS_QA_ENDPOINTS.map((e) => `${e.method} ${e.path}`),
    );
    for (const flow of SMS_INTERACTION_FLOWS) {
      for (const step of flow.steps) {
        if (step.api) {
          expect(keys.has(`${step.api.method} ${step.api.path}`)).toBe(true);
        }
      }
    }
  });

  it('referenced AI behaviors exist in SMS_QA_AI_BEHAVIORS', () => {
    const ids = new Set<string>(SMS_QA_AI_BEHAVIORS.map((b) => b.id));
    for (const flow of SMS_INTERACTION_FLOWS) {
      for (const ai of flow.aiTriggers) {
        expect(ids.has(ai)).toBe(true);
      }
    }
  });
});
