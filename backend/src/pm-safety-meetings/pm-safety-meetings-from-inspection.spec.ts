import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyMeetingsService } from './pm-safety-meetings.service';
import { PmSafetyMeetingsTemplatesService } from './pm-safety-meetings-templates.service';
import { PmSafetyMeetingsCailService } from './pm-safety-meetings-cail.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME } from './pm-safety-meetings.constants';

describe('PmSafetyMeetingsService.createFromInspection', () => {
  let service: PmSafetyMeetingsService;

  const prisma = {
    safetyMeeting: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pmInspection: { findFirst: jest.fn() },
    project: { findUnique: jest.fn() },
    safetyMeetingTopic: { create: jest.fn() },
    safetyMeetingAuditLog: { create: jest.fn() },
  };

  const templates = {
    ensureInspectionFailureReviewTemplate: jest.fn(),
  };

  const inspection = {
    id: 'insp-9',
    companyId: 1,
    projectId: 2,
    siteId: null,
    passed: false,
    title: 'Crane walk',
    locationNote: 'Bay 3',
    template: { name: 'Crane daily' },
    deficiencies: [{ id: 'd1', title: 'Failed: Wire rope', severity: 'high' }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.safetyMeeting.findFirst.mockResolvedValue(null);
    prisma.pmInspection.findFirst.mockResolvedValue(inspection);
    prisma.project.findUnique.mockResolvedValue({ id: 2, companyId: 1 });
    prisma.safetyMeeting.create.mockResolvedValue({ id: 'meet-new' });
    prisma.safetyMeetingTopic.create.mockResolvedValue({});
    prisma.safetyMeetingAuditLog.create.mockResolvedValue({});
    templates.ensureInspectionFailureReviewTemplate.mockResolvedValue({
      id: 'tpl-review',
      name: INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
      meetingType: 'incident_review_meeting',
      agendaJson: [
        { title: 'Review failed checklist items', isHighRisk: true },
      ],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmSafetyMeetingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PmSafetyMeetingsCailService, useValue: {} },
        { provide: PmCorrectiveActionsService, useValue: {} },
        { provide: PmSafetyMeetingsTemplatesService, useValue: templates },
      ],
    }).compile();

    service = module.get(PmSafetyMeetingsService);
    jest.spyOn(service, 'get').mockResolvedValue({
      id: 'meet-new',
      status: 'draft',
      pmInspectionId: 'insp-9',
      template: { name: INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME },
      topics: [],
      attendees: [],
      signatures: [],
      attachments: [],
      correctiveLinks: [],
    } as never);
  });

  it('uses Inspection Failure Review template and links pmInspectionId', async () => {
    const result = await service.createFromInspection('insp-9', 7);
    expect(result.existing).toBe(false);
    expect(
      templates.ensureInspectionFailureReviewTemplate,
    ).toHaveBeenCalledWith(1, 2);
    expect(prisma.safetyMeeting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateId: 'tpl-review',
          pmInspectionId: 'insp-9',
          projectId: 2,
          companyId: 1,
          status: 'draft',
          title: expect.stringContaining(
            INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
          ),
        }),
      }),
    );
  });

  it('returns existing meeting for the same inspection without creating a duplicate', async () => {
    prisma.safetyMeeting.findFirst.mockResolvedValueOnce({
      id: 'meet-existing',
      status: 'draft',
      pmInspectionId: 'insp-9',
      projectId: 2,
    });
    const result = await service.createFromInspection('insp-9', 7);
    expect(result.existing).toBe(true);
    expect(result.meeting.id).toBe('meet-existing');
    expect(prisma.safetyMeeting.create).not.toHaveBeenCalled();
  });
});
