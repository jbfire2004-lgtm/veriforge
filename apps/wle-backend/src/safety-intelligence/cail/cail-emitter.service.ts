import { Injectable } from '@nestjs/common';
import {
  CailSeverity,
  CailSourceType,
  CailRiskCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VsiEventService } from '../events/vsi-event.service';

export type EmitCailInput = {
  projectId: number;
  ownerCompanyId: number;
  sourceType: CailSourceType;
  sourceId: string;
  sourceItemId?: string;
  title: string;
  description?: string;
  severity?: CailSeverity;
  riskCategory?: CailRiskCategory | null;
  assignedUserId?: number;
  createdByUserId?: number;
  siteId?: number;
  locationNote?: string;
  equipmentId?: number;
  workerId?: number;
  dueDate?: Date;
  evidenceBefore?: unknown[];
  tags?: string[];
};

@Injectable()
export class CailEmitterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vsiEvents: VsiEventService,
  ) {}

  async emit(input: EmitCailInput) {
    const sourceItemId = input.sourceItemId ?? '';

    try {
      const entry = await this.prisma.cailEntry.create({
        data: {
          projectId: input.projectId,
          ownerCompanyId: input.ownerCompanyId,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          sourceItemId,
          title: input.title,
          description: input.description,
          severity: input.severity ?? 'medium',
          riskCategory: input.riskCategory ?? undefined,
          assignedUserId: input.assignedUserId,
          createdByUserId: input.createdByUserId,
          siteId: input.siteId,
          locationNote: input.locationNote,
          equipmentId: input.equipmentId,
          workerId: input.workerId,
          dueDate: input.dueDate,
          evidenceBefore: (input.evidenceBefore ?? []) as Prisma.InputJsonValue,
          tags: (input.tags ?? []) as Prisma.InputJsonValue,
          status: 'open',
        },
      });
      this.vsiEvents.cailCreated({
        id: entry.id,
        projectId: entry.projectId,
        ownerCompanyId: entry.ownerCompanyId,
        sourceType: entry.sourceType,
        actorId: input.createdByUserId,
      });
      return entry;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const existing = await this.prisma.cailEntry.findFirst({
          where: {
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            sourceItemId,
          },
        });
        if (existing) return existing;
      }
      throw e;
    }
  }

  async linkSafetyForm(
    safetyFormId: string,
    cailEntryId: string,
    fieldId?: string,
  ) {
    return this.prisma.safetyFormCailLink.upsert({
      where: {
        safetyFormId_cailEntryId: { safetyFormId, cailEntryId },
      },
      create: { safetyFormId, cailEntryId, fieldId },
      update: { fieldId },
    });
  }

  async linkEquipmentInspection(
    inspectionId: number,
    checklistItemId: string,
    cailEntryId: string,
  ) {
    return this.prisma.equipmentInspectionCailLink.upsert({
      where: {
        inspectionId_checklistItemId: { inspectionId, checklistItemId },
      },
      create: { inspectionId, checklistItemId, cailEntryId },
      update: { cailEntryId },
    });
  }
}
