import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { PmSafetyEventSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyEventsService } from '../pm-safety-events/pm-safety-events.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import type { ChecklistItemDef } from './pm-inspections.constants';
import {
  criticalMarkedFailedItemIds,
  hasCriticalMarkedFailedItems,
} from './pm-inspection-critical-findings';

export type InspectionIncidentDraftResult = {
  inspectionId: string;
  eventId: string;
  existing: boolean;
  event: unknown;
};

@Injectable()
export class PmInspectionIncidentService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly safetyEvents?: PmSafetyEventsService,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  /** True when a template item is flagged `critical` and that item failed on the inspection. */
  async hasCriticalMarkedFailedItems(inspectionId: string): Promise<boolean> {
    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      include: { template: true, deficiencies: true },
    });
    if (!inspection) return false;

    const items = inspection.template.items as ChecklistItemDef[];
    const failedItemIds = inspection.deficiencies.map((row) => row.itemId);
    return hasCriticalMarkedFailedItems(items, failedItemIds);
  }

  async findExistingIncident(inspectionId: string) {
    return this.prisma.pmSafetyEvent.findFirst({
      where: { pmInspectionId: inspectionId, deletedAt: null },
    });
  }

  async createDraftIncidentFromInspection(
    inspection: Prisma.PmInspectionGetPayload<{
      include: {
        template: true;
        deficiencies: true;
      };
    }> & { equipmentId?: number | null; workerId?: number | null },
    actorId: number,
    options?: {
      title?: string;
      description?: string;
      auto?: boolean;
    },
  ): Promise<InspectionIncidentDraftResult> {
    if (!this.safetyEvents) {
      throw new BadRequestException('Safety events service unavailable');
    }

    const existing = await this.findExistingIncident(inspection.id);
    if (existing) {
      return {
        inspectionId: inspection.id,
        eventId: existing.id,
        existing: true,
        event: existing,
      };
    }

    const items = inspection.template.items as ChecklistItemDef[];
    const failedItemIds = inspection.deficiencies.map((row) => row.itemId);
    const criticalFailedIds = criticalMarkedFailedItemIds(items, failedItemIds);

    const criticalDeficiencies = inspection.deficiencies.filter(
      (row) =>
        row.severity === 'critical' && criticalFailedIds.includes(row.itemId),
    );

    const deficiencySummary = criticalDeficiencies
      .map((row) => `- ${row.title} (${row.severity})`)
      .join('\n');

    const title =
      options?.title ??
      (options?.auto
        ? `Auto-incident: critical finding — ${
            inspection.title ?? inspection.template.name
          }`
        : `Inspection escalation: ${
            inspection.title ?? inspection.template.name
          }`);

    const description =
      options?.description ??
      [
        `Created from inspection ${inspection.id}.`,
        inspection.passed === false ? 'Inspection result: FAILED.' : '',
        deficiencySummary
          ? `Critical flagged checklist failures:\n${deficiencySummary}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

    const event = await this.safetyEvents.createDraft({
      companyId: inspection.companyId,
      projectId: inspection.projectId,
      siteId: inspection.siteId ?? undefined,
      createdByUserId: actorId,
      eventType: 'hazard_observation',
      title,
      description,
      pmInspectionId: inspection.id,
      severity: 'critical' as PmSafetyEventSeverity,
      mandatoryInvestigation: true,
    });

    if (inspection.equipmentId) {
      await this.safetyEvents.linkEquipment(
        event.id,
        inspection.equipmentId,
        'Linked from inspection critical finding',
      );
    }

    if (inspection.workerId) {
      await this.safetyEvents.addPerson(event.id, {
        workerId: inspection.workerId,
        role: 'subject',
      });
    }

    if (this.eventBus) {
      this.eventBus.emit({
        name: DomainEvent.INCIDENT_CREATED_FROM_INSPECTION,
        occurredAt: new Date().toISOString(),
        actorId,
        companyId: inspection.companyId,
        projectId: inspection.projectId,
        entityType: 'pm_safety_event',
        entityId: event.id,
        data: {
          inspectionId: inspection.id,
          incidentId: event.id,
          projectId: inspection.projectId,
          equipmentId: inspection.equipmentId ?? null,
          workerId: inspection.workerId ?? null,
          status: 'draft',
          auto: options?.auto ?? false,
          criticalFailedItemIds: criticalFailedIds,
          criticalDeficiencyCount: criticalDeficiencies.length,
        },
      });
    }

    return {
      inspectionId: inspection.id,
      eventId: event.id,
      existing: false,
      event,
    };
  }

  async createDraftIfCriticalOnSubmit(
    inspectionId: string,
    actorId: number,
  ): Promise<InspectionIncidentDraftResult | null> {
    const hasCriticalFailed = await this.hasCriticalMarkedFailedItems(
      inspectionId,
    );
    if (!hasCriticalFailed) return null;

    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      include: { template: true, deficiencies: true },
    });
    if (!inspection) return null;

    return this.createDraftIncidentFromInspection(inspection, actorId, {
      auto: true,
    });
  }
}
