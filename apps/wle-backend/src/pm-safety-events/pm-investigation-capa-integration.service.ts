import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmInspectionContractorDispatchService } from '../pm-inspections/pm-inspection-contractor-dispatch.service';
import { PmInspectionSubcontractorResolverService } from '../pm-inspections/pm-inspection-subcontractor-resolver.service';
import { CapaDueDateEngine } from '../pm-corrective-actions/capa-due-date.engine';
import { RcaEngine, TaprootPathway } from './rca.engine';

@Injectable()
export class PmInvestigationCapaIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capaAuto: PmCapaAutoGenerateService,
    private readonly dueDate: CapaDueDateEngine,
    private readonly rca: RcaEngine,
    @Optional()
    private readonly subcontractorResolver?: PmInspectionSubcontractorResolverService,
    @Optional()
    private readonly contractorDispatch?: PmInspectionContractorDispatchService,
  ) {}

  /**
   * Create unified PmCorrectiveAction from root cause + optional contractor dispatch.
   * Links inspection module dispatch when responsible party is contractor.
   */
  async createFromRootCause(input: {
    eventId: string;
    rootCauseId: string;
    description: string;
    pathway?: TaprootPathway;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    responsibleParty?: 'contractor' | 'supervisor' | 'company' | 'worker';
    actorId: number;
    linkToInspection?: boolean;
  }) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: input.eventId, deletedAt: null },
    });
    if (!event) return null;

    const severity =
      input.severity ??
      (event.severity === 'critical'
        ? 'critical'
        : event.severity === 'high'
        ? 'high'
        : 'medium');

    let subcontractorCompanyId: number | undefined;
    if (input.responsibleParty === 'contractor' && this.subcontractorResolver) {
      subcontractorCompanyId =
        await this.subcontractorResolver.resolveForFinding(
          event.projectId,
          mapPathwayToFindingCategory(input.pathway),
        );
    }

    const unified = await this.capaAuto.fromSafetyEvent(
      input.eventId,
      input.rootCauseId,
      input.actorId,
    );

    if (unified && subcontractorCompanyId) {
      await this.prisma.pmCorrectiveAction.update({
        where: { id: unified.id },
        data: { subcontractorCompanyId },
      });
    }

    const config = await this.prisma.pmCapaCompanyConfig.findUnique({
      where: { companyId: event.companyId },
    });
    const dueAt = this.dueDate.computeDueAt(severity, config ?? undefined);

    const eventCapa = await this.prisma.pmSafetyEventCorrectiveAction.findFirst(
      {
        where: { eventId: input.eventId, rootCauseId: input.rootCauseId },
        orderBy: { createdAt: 'desc' },
      },
    );

    if (eventCapa) {
      await this.prisma.pmSafetyEventCorrectiveAction.update({
        where: { id: eventCapa.id },
        data: {
          unifiedCorrectiveActionId: unified?.id,
          subcontractorCompanyId,
          dueAt,
        },
      });
    }

    if (unified && subcontractorCompanyId && this.contractorDispatch) {
      await this.contractorDispatch.dispatchForCorrectiveAction(
        unified.id,
        input.actorId,
      );
    }

    if (input.linkToInspection && unified) {
      await this.prisma.pmCorrectiveActionLink.create({
        data: {
          actionId: unified.id,
          linkType: 'inspection',
          linkedId: input.eventId,
          linkedMeta: { source: 'investigation' },
        },
      });
    }

    return {
      eventCapa,
      unifiedCorrectiveAction: unified,
      subcontractorCompanyId,
      dueAt,
    };
  }

  buildTaprootJson(
    pathway: TaprootPathway,
    description: string,
    factors: string[],
  ) {
    return this.rca.buildTaprootPathway({
      pathway,
      description,
      contributingFactors: factors,
    });
  }
}

function mapPathwayToFindingCategory(pathway?: TaprootPathway) {
  if (pathway === 'equipment_failure') return 'equipment_defect' as const;
  if (pathway === 'environmental_conditions') return 'environmental' as const;
  if (pathway === 'human_factors') return 'missing_ppe' as const;
  return 'unsafe_condition' as const;
}
