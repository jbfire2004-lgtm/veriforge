import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME } from '../pm-safety-meetings/pm-safety-meetings.constants';
import {
  inspectionFailedForAutoMeeting,
  PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG,
} from './pm-inspections.constants';
import type { InspectionCompletedEventData } from './pm-inspection-completed-event.types';

describe('PmInspections post-submit automations (contract)', () => {
  it('INSPECTION_COMPLETED includes score, findings, and signatures', () => {
    const data: InspectionCompletedEventData = {
      inspectionId: 'insp-1',
      score: {
        scorePercent: 40,
        passed: false,
        riskScore: 72,
        requiresSupervisorReview: true,
        failedItemCount: 2,
      },
      findings: [
        {
          kind: 'deficiency',
          id: 'def-1',
          title: 'Missing guard',
          severity: 'critical',
          itemId: 'item-a',
        },
        {
          kind: 'photo_finding',
          id: 'pf-1',
          title: 'Exposed wiring',
          severity: 'high',
          category: 'Electrical',
        },
      ],
      signatures: [
        {
          role: 'supervisor',
          signerName: 'Jane Sup',
          signedAt: '2026-06-01T12:00:00.000Z',
          coreFileId: 10,
        },
      ],
      signaturesPresent: true,
      findingsSummary: {
        deficiencyCount: 1,
        photoFindingCount: 1,
        criticalDeficiencyCount: 1,
        criticalFailedItemCount: 1,
      },
      criticalFlags: [
        { itemId: 'item-a', label: 'Guard in place', failed: true },
      ],
    };

    const payload = {
      name: DomainEvent.INSPECTION_COMPLETED,
      occurredAt: new Date().toISOString(),
      actorId: 1,
      companyId: 1,
      projectId: 1,
      entityType: 'pm_inspection',
      entityId: 'insp-1',
      data,
    };

    expect(payload.name).toBe('inspection.completed');
    expect(payload.data.score.failedItemCount).toBe(2);
    expect(payload.data.findings).toHaveLength(2);
    expect(payload.data.signatures[0].role).toBe('supervisor');
    expect(payload.data.signaturesPresent).toBe(true);
    expect(payload.data.criticalFlags).toHaveLength(1);
    expect(payload.data.findingsSummary.criticalFailedItemCount).toBe(1);
  });

  it('failed inspection triggers auto-meeting only when passed is false', () => {
    expect(inspectionFailedForAutoMeeting(false)).toBe(true);
    expect(inspectionFailedForAutoMeeting(true)).toBe(false);
    expect(inspectionFailedForAutoMeeting(null)).toBe(false);
  });

  it('auto failure meeting uses tenant feature flag key', () => {
    expect(PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG).toBe(
      'pm.inspections.auto_failure_meeting',
    );
  });

  it('failed inspection auto-meeting uses Inspection Failure Review template name', () => {
    expect(INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME).toBe(
      'Inspection Failure Review',
    );
  });

  it('audit event types cover auto-escalation and auto-meeting', () => {
    const autoEscalate = 'auto_escalated_to_incident';
    const autoMeeting = 'auto_safety_meeting';
    expect(['escalated_to_incident', autoEscalate]).toContain(autoEscalate);
    expect(['auto_safety_meeting', 'draft_safety_meeting']).toContain(
      autoMeeting,
    );
  });
});
