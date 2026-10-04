import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../modules/adoption-analytics/adoption-analytics.constants';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private readonly adoption?: AdoptionEventService,
  ) {}

  // CREATE INCIDENT
  async create(data: {
    title?: string;
    description?: string;
    category?: string;
    latitude?: number | null;
    longitude?: number | null;
    metadata?: Record<string, unknown> | null;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    workerId?: number;
    equipmentId?: number;
    companyId?: number;
    siteId?: number;
    createdById?: number;
  }) {
    const desc = data.description?.trim() ?? '';
    const title =
      data.title?.trim() ||
      (data.category
        ? `${data.category.replace(/_/g, ' ')} — ${
            desc.slice(0, 60) || 'Report'
          }`
        : desc.slice(0, 120) || 'Untitled incident');

    const created = await this.prisma.incident.create({
      data: {
        title,
        description: desc || null,
        category: data.category ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        metadata:
          data.metadata === undefined
            ? undefined
            : (data.metadata as Prisma.InputJsonValue),
        severity: data.severity ?? 'LOW',
        workerId: data.workerId ?? null,
        equipmentId: data.equipmentId ?? null,
        companyId: data.companyId ?? null,
        siteId: data.siteId ?? null,
        createdById: data.createdById ?? null,
      },
    });
    if (data.companyId && this.adoption) {
      this.adoption.track({
        companyId: data.companyId,
        userId: data.createdById ?? null,
        event: ADOPTION_EVENT_TYPES.INCIDENT_CREATED,
        metadata: { incidentId: created.id },
      });
    }
    return created;
  }

  // LIST INCIDENTS (OPTIONAL FILTERS)
  async list(params?: {
    status?: string;
    severity?: string;
    companyId?: number;
    siteId?: number;
    workerId?: number;
    equipmentId?: number;
  }) {
    return this.prisma.incident.findMany({
      where: {
        status: params?.status,
        severity: params?.severity,
        companyId: params?.companyId,
        siteId: params?.siteId,
        workerId: params?.workerId,
        equipmentId: params?.equipmentId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET INCIDENT WITH FULL CONTEXT
  async findOne(id: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        worker: true,
        equipment: true,
        company: true,
        site: true,
        createdBy: true,
        assignedTo: true,
        investigations: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  // UPDATE CORE FIELDS
  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }>,
  ) {
    const existing = await this.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description:
          data.description !== undefined
            ? data.description
            : existing.description,
        severity: data.severity ?? existing.severity,
      },
    });
  }

  // CHANGE STATUS (WORKFLOW STEP)
  async changeStatus(
    id: number,
    status: 'OPEN' | 'IN_REVIEW' | 'ACTION_REQUIRED' | 'CLOSED',
  ) {
    const existing = await this.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id },
      data: { status },
    });
  }

  // ASSIGN INCIDENT
  async assign(id: number, assignedToId: number | null) {
    const existing = await this.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id },
      data: { assignedToId },
    });
  }

  // ADD COMMENT
  async addComment(data: {
    incidentId: number;
    userId?: number;
    message: string;
  }) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: data.incidentId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incidentComment.create({
      data: {
        incidentId: data.incidentId,
        userId: data.userId ?? null,
        message: data.message,
      },
    });
  }

  // DELETE INCIDENT
  async remove(id: number) {
    const existing = await this.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incident not found');

    await this.prisma.incident.delete({ where: { id } });
    return { status: 'ok', deletedId: id };
  }
}
