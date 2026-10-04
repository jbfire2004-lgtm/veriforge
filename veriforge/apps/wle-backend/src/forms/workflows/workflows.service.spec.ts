import { SafetyFormStatus } from '@prisma/client';
import { SAFETY_FORM_TRANSITIONS } from '../engine/form-engine.types';
import { SafetyFormWorkflowsService } from './workflows.service';

describe('Safety form workflow transitions', () => {
  it('allows DRAFT → SUBMITTED', () => {
    expect(SAFETY_FORM_TRANSITIONS.DRAFT).toContain('SUBMITTED');
  });

  it('allows SUBMITTED → APPROVED/REJECTED', () => {
    expect(SAFETY_FORM_TRANSITIONS.SUBMITTED).toContain('APPROVED');
    expect(SAFETY_FORM_TRANSITIONS.SUBMITTED).toContain('REJECTED');
  });

  it('allows APPROVED → CLOSED', () => {
    expect(SAFETY_FORM_TRANSITIONS.APPROVED).toContain('CLOSED');
  });

  it('blocks CLOSED → any', () => {
    expect(SAFETY_FORM_TRANSITIONS.CLOSED).toHaveLength(0);
  });
});

describe('SafetyFormWorkflowsService transitions', () => {
  const service = new SafetyFormWorkflowsService({} as never);

  it('rejects invalid transitions', () => {
    expect(() =>
      service.assertTransition(SafetyFormStatus.CLOSED, SafetyFormStatus.DRAFT),
    ).toThrow('Cannot transition');
  });

  it('accepts valid supervisor transitions', () => {
    expect(() =>
      service.assertTransition(
        SafetyFormStatus.SUBMITTED,
        SafetyFormStatus.APPROVED,
      ),
    ).not.toThrow();
  });
});
