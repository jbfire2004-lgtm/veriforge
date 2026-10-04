import { Injectable, BadRequestException } from '@nestjs/common';
import { SafetyMeetingTemplateStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_INSPECTION_FAILURE_AGENDA,
  INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
} from './pm-safety-meetings.constants';

@Injectable()
export class PmSafetyMeetingsTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: number, projectId?: number, meetingType?: string) {
    return this.prisma.safetyMeetingTemplate.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { in: ['draft', 'published'] },
        ...(projectId
          ? { OR: [{ projectId: null }, { projectId }] }
          : { projectId: null }),
        ...(meetingType ? { meetingType: meetingType as never } : {}),
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async create(data: {
    companyId: number;
    projectId?: number;
    meetingType: string;
    name: string;
    description?: string;
    agendaJson?: unknown[];
    requiredTopicIds?: string[];
  }) {
    return this.prisma.safetyMeetingTemplate.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        meetingType: data.meetingType as never,
        name: data.name,
        description: data.description,
        agendaJson: (data.agendaJson ?? []) as never,
        requiredTopicIds: (data.requiredTopicIds ?? []) as never,
        status: 'draft',
        version: 1,
      },
    });
  }

  async publish(templateId: string, userId: number) {
    const tpl = await this.prisma.safetyMeetingTemplate.findUniqueOrThrow({
      where: { id: templateId },
    });
    if (tpl.status === 'archived') {
      throw new BadRequestException('Cannot publish archived template');
    }

    const newVersion = await this.prisma.safetyMeetingTemplate.create({
      data: {
        companyId: tpl.companyId,
        projectId: tpl.projectId,
        meetingType: tpl.meetingType,
        name: tpl.name,
        description: tpl.description,
        agendaJson: tpl.agendaJson ?? [],
        requiredTopicIds: tpl.requiredTopicIds ?? [],
        version: tpl.version + 1,
        status: 'published',
        publishedAt: new Date(),
        publishedByUserId: userId,
        parentTemplateId: tpl.id,
      },
    });

    await this.prisma.safetyMeetingTemplate.update({
      where: { id: templateId },
      data: { status: 'archived' },
    });

    return newVersion;
  }

  async ensureInspectionFailureReviewTemplate(
    companyId: number,
    projectId?: number,
  ) {
    const existing = await this.prisma.safetyMeetingTemplate.findFirst({
      where: {
        companyId,
        name: INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
        deletedAt: null,
        status: 'published',
        ...(projectId
          ? { OR: [{ projectId: null }, { projectId }] }
          : { projectId: null }),
      },
      orderBy: { version: 'desc' },
    });
    if (existing) return existing;

    return this.prisma.safetyMeetingTemplate.create({
      data: {
        companyId,
        projectId: projectId ?? null,
        meetingType: 'incident_review_meeting',
        name: INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
        description:
          'Standard safety meeting agenda when a field inspection fails.',
        agendaJson: DEFAULT_INSPECTION_FAILURE_AGENDA as never,
        status: 'published',
        publishedAt: new Date(),
        version: 1,
      },
    });
  }
}
