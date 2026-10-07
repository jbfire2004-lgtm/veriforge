import { Injectable } from '@nestjs/common';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmSafetyMeetingsCailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
  ) {}

  async ensureMeetingCail(meetingId: string, createdByUserId: number) {
    const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
      where: { id: meetingId },
      include: { topics: true, correctiveLinks: true },
    });

    if (meeting.cailEntryId) {
      return this.prisma.cailEntry.findUnique({
        where: { id: meeting.cailEntryId },
      });
    }

    const hasRisk =
      meeting.topics.some((t) => t.isHighRisk) ||
      meeting.correctiveLinks.length > 0;

    if (!hasRisk && meeting.status !== 'completed') {
      return null;
    }

    const entry = await this.emitter.emit({
      projectId: meeting.projectId,
      ownerCompanyId: meeting.companyId,
      sourceType: 'safety_meeting',
      sourceId: meeting.id,
      sourceItemId: '',
      title: `Safety meeting: ${meeting.title}`,
      description: meeting.discussionNotes ?? undefined,
      severity: meeting.topics.some((t) => t.isHighRisk) ? 'high' : 'medium',
      createdByUserId,
      siteId: meeting.siteId ?? undefined,
      locationNote: meeting.locationNote ?? undefined,
      tags: ['safety_meeting', meeting.meetingType],
    });

    await this.prisma.safetyMeeting.update({
      where: { id: meetingId },
      data: { cailEntryId: entry.id },
    });

    return entry;
  }
}
