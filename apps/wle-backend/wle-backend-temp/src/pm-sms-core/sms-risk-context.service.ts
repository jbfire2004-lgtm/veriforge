import { Injectable } from '@nestjs/common';
import {
  PmEnergyControlState,
  PmSmsEntityType,
  PmSclState,
  PmSmsHecaType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SmsRiskEscalationEngine,
  type SmsRiskTagInput,
} from './sms-risk-escalation.engine';

export type UpsertRiskContextInput = {
  companyId: number;
  projectId?: number;
  entityType: PmSmsEntityType;
  entityId: string;
  sclState?: PmSclState | null;
  sclTriggers?: string[];
  sclPrecursors?: string[];
  sclPotentialSeverity?: string;
  hecaInvolved?: boolean;
  hecaType?: PmSmsHecaType | null;
  hecaCategoryCode?: string;
  hecaLibraryEntryId?: string;
  energyTypes?: string[];
  energyControlState?: PmEnergyControlState | null;
  highEnergyFlag?: boolean;
  missingControls?: string[];
  requiresInvestigation?: boolean;
  clientSyncId?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class SmsRiskContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly escalation: SmsRiskEscalationEngine,
  ) {}

  async upsert(input: UpsertRiskContextInput) {
    const tagInput: SmsRiskTagInput = {
      sclState: input.sclState,
      hecaInvolved: input.hecaInvolved,
      hecaType: input.hecaType,
      energyTypes: input.energyTypes,
      energyControlState: input.energyControlState,
      highEnergyFlag: input.highEnergyFlag,
    };
    const evalResult = this.escalation.evaluate('medium', tagInput);

    const data: Prisma.PmSmsRiskContextUpsertArgs['create'] = {
      companyId: input.companyId,
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId,
      sclState: input.sclState ?? undefined,
      sclTriggersJson: input.sclTriggers ?? [],
      sclPrecursorsJson: input.sclPrecursors ?? [],
      sclPotentialSeverity: input.sclPotentialSeverity,
      hecaInvolved: input.hecaInvolved ?? false,
      hecaType: input.hecaType ?? undefined,
      hecaCategoryCode: input.hecaCategoryCode,
      hecaLibraryEntryId: input.hecaLibraryEntryId,
      energyTypesJson: input.energyTypes ?? [],
      energyControlState: input.energyControlState ?? undefined,
      highEnergyFlag: input.highEnergyFlag ?? false,
      missingControlsJson: input.missingControls ?? [],
      escalationScore: evalResult.escalationScore,
      requiresInvestigation:
        input.requiresInvestigation ?? evalResult.requiresInvestigation,
      metadataJson: (input.metadata ?? {}) as Prisma.InputJsonValue,
      clientSyncId: input.clientSyncId,
    };

    return this.prisma.pmSmsRiskContext.upsert({
      where: {
        entityType_entityId: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
      },
      create: data,
      update: { ...data, updatedAt: new Date() },
    });
  }

  async getForEntity(entityType: PmSmsEntityType, entityId: string) {
    return this.prisma.pmSmsRiskContext.findUnique({
      where: { entityType_entityId: { entityType, entityId } },
      include: { hecaLibraryEntry: true },
    });
  }

  async listByCompany(
    companyId: number,
    filters?: {
      projectId?: number;
      sclState?: PmSclState;
      hecaOnly?: boolean;
      highEnergyOnly?: boolean;
      requiresInvestigation?: boolean;
    },
  ) {
    return this.prisma.pmSmsRiskContext.findMany({
      where: {
        companyId,
        projectId: filters?.projectId,
        sclState: filters?.sclState,
        hecaInvolved: filters?.hecaOnly ? true : undefined,
        highEnergyFlag: filters?.highEnergyOnly ? true : undefined,
        requiresInvestigation: filters?.requiresInvestigation,
      },
      orderBy: { escalationScore: 'desc' },
      take: 200,
    });
  }
}
