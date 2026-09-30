import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import type {
  BulkIncidentCapaDto,
  OpenIncidentInvestigationDto,
  UpdateIncidentInvestigationDto,
} from '../dto/incident-investigation.dto';
import type { CailActor } from '../cail/cail-scope.service';

@Injectable()
export class IncidentsVsiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
    private readonly ai: SafetyIntelligenceAiService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
  ) {}

  async openInvestigation(
    incidentId: number,
    dto: OpenIncidentInvestigationDto,
    actor: CailActor,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.vsiIncidentInvestigation.upsert({
      where: { incidentId },
      create: {
        incidentId,
        projectId: dto.projectId,
        narrative: dto.narrative ?? incident.description ?? undefined,
        immediateActions: dto.immediateActions,
        leadInvestigatorId: dto.leadInvestigatorId ?? actor.id,
      },
      update: {
        projectId: dto.projectId,
        narrative: dto.narrative,
        immediateActions: dto.immediateActions,
        leadInvestigatorId: dto.leadInvestigatorId,
      },
    });
  }

  async getInvestigation(incidentId: number) {
    const row = await this.prisma.vsiIncidentInvestigation.findUnique({
      where: { incidentId },
      include: {
        incident: {
          select: { id: true, title: true, severity: true, status: true },
        },
        project: { select: { id: true, name: true } },
      },
    });
    if (!row) throw new NotFoundException('Investigation not found');
    return row;
  }

  async updateInvestigation(
    incidentId: number,
    dto: UpdateIncidentInvestigationDto,
  ) {
    await this.getInvestigation(incidentId);
    return this.prisma.vsiIncidentInvestigation.update({
      where: { incidentId },
      data: {
        narrative: dto.narrative,
        immediateActions: dto.immediateActions,
        investigationStatus: dto.investigationStatus,
        closedAt: dto.investigationStatus === 'closed' ? new Date() : undefined,
      },
    });
  }

  async generateAiPack(incidentId: number) {
    const investigation = await this.getInvestigation(incidentId);
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: { site: true, company: true },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    const relatedCail = await this.prisma.cailEntry.findMany({
      where: {
        projectId: investigation.projectId,
        OR: [
          { siteId: incident.siteId ?? undefined },
          { equipmentId: incident.equipmentId ?? undefined },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const [openCailCount, trainingGaps] = await Promise.all([
      this.prisma.cailEntry.count({
        where: {
          projectId: investigation.projectId,
          status: { in: ['open', 'in_progress', 'overdue'] },
        },
      }),
      incident.companyId
        ? this.prisma.trainingRecord.count({
            where: {
              companyId: incident.companyId,
              expiresAt: { lt: new Date() },
            },
          })
        : Promise.resolve(0),
    ]);

    const pack = await this.ai.buildInvestigationPack({
      title: incident.title,
      description: incident.description,
      narrative: investigation.narrative,
      severity: incident.severity,
      relatedCailTitles: relatedCail.map((c) => c.title),
      companyId: incident.companyId ?? undefined,
      projectId: investigation.projectId,
      trainingGaps,
      inspectionFailures: incident.equipmentId ? 1 : 0,
      openCailCount,
    });

    return this.prisma.vsiIncidentInvestigation.update({
      where: { incidentId },
      data: { aiInvestigationPack: pack as Prisma.InputJsonValue },
    });
  }

  async bulkCreateCapa(
    incidentId: number,
    dto: BulkIncidentCapaDto,
    actor: CailActor,
  ) {
    const investigation = await this.getInvestigation(incidentId);
    const created = [];

    for (const item of dto.items) {
      const cail = await this.emitter.emit({
        projectId: investigation.projectId,
        ownerCompanyId: item.ownerCompanyId,
        sourceType: 'incident',
        sourceId: String(incidentId),
        sourceItemId: item.title.slice(0, 64),
        title: item.title,
        description: item.description,
        assignedUserId: item.assignedUserId,
        createdByUserId: actor.id,
      });

      const plan = await this.prisma.incidentCorrectiveActionPlan.create({
        data: {
          incidentId,
          cailEntryId: cail.id,
          actionType: item.actionType ?? 'corrective',
        },
      });
      this.copilotEnrich.scheduleCailAnalyzeEnrich(cail.id, {
        title: item.title,
        description: item.description,
        sourceType: 'incident',
        projectId: investigation.projectId,
        companyId: item.ownerCompanyId,
      });
      created.push({ cail, plan });
    }

    return created;
  }

  async listCailForIncident(incidentId: number) {
    return this.prisma.cailEntry.findMany({
      where: { sourceType: 'incident', sourceId: String(incidentId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listIncidents(filters: {
    companyId?: number;
    siteId?: number;
    status?: string;
    limit?: number;
  }) {
    const rows = await this.prisma.incident.findMany({
      where: {
        companyId: filters.companyId,
        siteId: filters.siteId,
        status: filters.status,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 50,
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        category: true,
        createdAt: true,
        companyId: true,
        siteId: true,
        vsiInvestigation: {
          select: {
            investigationStatus: true,
            projectId: true,
          },
        },
      },
    });

    return rows.map((r) => ({
      ...r,
      hasInvestigation: Boolean(r.vsiInvestigation),
      projectId: r.vsiInvestigation?.projectId ?? null,
    }));
  }
}
