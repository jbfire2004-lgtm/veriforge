import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyMeetingsService } from '../pm-safety-meetings/pm-safety-meetings.service';
import { PmInspectionAutomationConfigService } from './pm-inspection-automation-config.service';
import { PmInspectionMeetingService } from './pm-inspection-meeting.service';
import { INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME } from '../pm-safety-meetings/pm-safety-meetings.constants';

describe('PmInspectionMeetingService', () => {
  let service: PmInspectionMeetingService;

  const prisma = {
    pmInspection: { findFirst: jest.fn() },
    safetyMeeting: { findFirst: jest.fn() },
  };

  const safetyMeetings = {
    createFromInspection: jest.fn(),
  };

  const automationConfig = {
    isAutoFailureMeetingEnabled: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.pmInspection.findFirst.mockResolvedValue({
      id: 'insp-1',
      passed: false,
      companyId: 1,
      projectId: 2,
    });
    automationConfig.isAutoFailureMeetingEnabled.mockResolvedValue(true);
    safetyMeetings.createFromInspection.mockResolvedValue({
      meeting: {
        id: 'meet-1',
        status: 'draft',
        pmInspectionId: 'insp-1',
        projectId: 2,
        template: { name: INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME },
      },
      existing: false,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionMeetingService,
        { provide: PrismaService, useValue: prisma },
        { provide: PmSafetyMeetingsService, useValue: safetyMeetings },
        {
          provide: PmInspectionAutomationConfigService,
          useValue: automationConfig,
        },
      ],
    }).compile();

    service = module.get(PmInspectionMeetingService);
  });

  it('creates draft meeting when inspection failed on submit', async () => {
    const result = await service.createDraftIfFailedOnSubmit('insp-1', 4);
    expect(result?.meetingId).toBe('meet-1');
    expect(result?.projectId).toBe(2);
    expect(result?.existing).toBe(false);
    expect(safetyMeetings.createFromInspection).toHaveBeenCalledWith(
      'insp-1',
      4,
    );
  });

  it('skips meeting creation when inspection passed', async () => {
    prisma.pmInspection.findFirst.mockResolvedValueOnce({
      id: 'insp-1',
      passed: true,
      companyId: 1,
      projectId: 2,
    });
    await expect(
      service.createDraftIfFailedOnSubmit('insp-1', 4),
    ).resolves.toBeNull();
    expect(safetyMeetings.createFromInspection).not.toHaveBeenCalled();
  });

  it('skips meeting creation when tenant toggle is disabled', async () => {
    automationConfig.isAutoFailureMeetingEnabled.mockResolvedValueOnce(false);
    await expect(
      service.createDraftIfFailedOnSubmit('insp-1', 4),
    ).resolves.toBeNull();
    expect(safetyMeetings.createFromInspection).not.toHaveBeenCalled();
  });

  it('returns existing meeting idempotently', async () => {
    safetyMeetings.createFromInspection.mockResolvedValueOnce({
      meeting: {
        id: 'meet-existing',
        status: 'draft',
        pmInspectionId: 'insp-1',
        projectId: 2,
      },
      existing: true,
    });
    const result = await service.createDraftIfFailedOnSubmit('insp-1', 4);
    expect(result?.existing).toBe(true);
    expect(result?.meetingId).toBe('meet-existing');
  });
});
