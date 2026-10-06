import {
  PmSafetyTimelineIntegrityError,
  validatePmSafetyTimeline,
} from './pm-safety-workflow.timeline';

describe('validatePmSafetyTimeline', () => {
  const baseDate = new Date('2026-01-01T12:00:00.000Z');

  it('accepts a valid chain', () => {
    const events = [
      {
        id: 1,
        eventType: 'STATUS_CHANGE',
        payload: { initial: true, status: 'DRAFT' },
        createdAt: baseDate,
      },
      {
        id: 2,
        eventType: 'STATUS_CHANGE',
        payload: { from: 'DRAFT', to: 'SUBMITTED', action: 'submit' },
        createdAt: new Date(baseDate.getTime() + 1000),
      },
    ];
    expect(() => validatePmSafetyTimeline(events, 'SUBMITTED')).not.toThrow();
  });

  it('throws when final status does not match', () => {
    const events = [
      {
        id: 1,
        eventType: 'STATUS_CHANGE',
        payload: { initial: true, status: 'DRAFT' },
        createdAt: baseDate,
      },
      {
        id: 2,
        eventType: 'STATUS_CHANGE',
        payload: { from: 'DRAFT', to: 'SUBMITTED', action: 'submit' },
        createdAt: new Date(baseDate.getTime() + 1000),
      },
    ];
    expect(() => validatePmSafetyTimeline(events, 'CLOSED')).toThrow(
      PmSafetyTimelineIntegrityError,
    );
  });

  it('throws on status gap', () => {
    const events = [
      {
        id: 1,
        eventType: 'STATUS_CHANGE',
        payload: { initial: true, status: 'DRAFT' },
        createdAt: baseDate,
      },
      {
        id: 2,
        eventType: 'STATUS_CHANGE',
        payload: { from: 'UNDER_REVIEW', to: 'APPROVED', action: 'approve' },
        createdAt: new Date(baseDate.getTime() + 1000),
      },
    ];
    expect(() => validatePmSafetyTimeline(events, 'APPROVED')).toThrow(
      /PM_SAFETY_TIMELINE_STATUS_GAP/,
    );
  });

  it('throws when createdAt regresses by id order', () => {
    const events = [
      {
        id: 1,
        eventType: 'STATUS_CHANGE',
        payload: { initial: true, status: 'DRAFT' },
        createdAt: new Date(baseDate.getTime() + 5000),
      },
      {
        id: 2,
        eventType: 'STATUS_CHANGE',
        payload: { from: 'DRAFT', to: 'SUBMITTED', action: 'submit' },
        createdAt: baseDate,
      },
    ];
    expect(() => validatePmSafetyTimeline(events, 'SUBMITTED')).toThrow(
      /PM_SAFETY_TIMELINE_CREATED_AT_REGRESSION/,
    );
  });
});
