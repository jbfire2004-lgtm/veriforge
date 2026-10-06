import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyMeetingsService } from '../pm-safety-meetings/pm-safety-meetings.service';
import { PmInspectionAutomationConfigService } from './pm-inspection-automation-config.service';
import { inspectionFailedForAutoMeeting } from './pm-inspections.constants';

export type InspectionMeetingDraftResult = {
  inspectionId: string;
  meetingId: string;
  projectId: number;
  existing: boolean;
  meeting: unknown;
};

@Injectable()
export class PmInspectionMeetingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationConfig: PmInspectionAutomationConfigService,
    @Optional() private readonly safetyMeetings?: PmSafetyMeetingsService,
  ) {}

  async findExistingMeeting(inspectionId: string) {
    return this.prisma.safetyMeeting.findFirst({
      where: { pmInspectionId: inspectionId, deletedAt: null },
    });
  }

  async createDraftIfFailedOnSubmit(
    inspectionId: string,
    actorId: number,
  ): Promise<InspectionMeetingDraftResult | null> {
    if (!this.safetyMeetings) return null;

    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      select: {
        id: true,
        passed: true,
        companyId: true,
        projectId: true,
      },
    });
    if (!inspection || !inspectionFailedForAutoMeeting(inspection.passed)) {
      return null;
    }

    const enabled = await this.automationConfig.isAutoFailureMeetingEnabled(
      inspection.companyId,
    );
    if (!enabled) return null;

    const result = await this.safetyMeetings.createFromInspection(
      inspectionId,
      actorId,
    );

    return {
      inspectionId,
      meetingId: result.meeting.id,
      projectId: inspection.projectId,
      existing: result.existing,
      meeting: result.meeting,
    };
  }
}
