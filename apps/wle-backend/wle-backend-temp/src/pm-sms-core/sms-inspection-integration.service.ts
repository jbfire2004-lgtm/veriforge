import { Injectable, Optional } from '@nestjs/common';
import {
  PmDeficiencySeverity,
  PmEnergyControlState,
  PmSclState,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SmsRiskEscalationEngine } from './sms-risk-escalation.engine';
import { SmsRiskContextService } from './sms-risk-context.service';
import { SmsEnergyWheelService } from './sms-energy-wheel.service';
import { SmsNotificationRouterService } from './sms-notification-router.service';
import { CapaDueDateEngine } from '../pm-corrective-actions/capa-due-date.engine';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';

export type FindingRiskTags = {
  sclState?: PmSclState | null;
  hecaInvolved?: boolean;
  hecaType?: string | null;
  hecaCategoryCode?: string;
  energyTypes?: string[];
  energyControlState?: PmEnergyControlState | null;
  highEnergyFlag?: boolean;
};

@Injectable()
export class SmsInspectionIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly escalation: SmsRiskEscalationEngine,
    private readonly riskContext: SmsRiskContextService,
    private readonly energyWheel: SmsEnergyWheelService,
    private readonly dueDate: CapaDueDateEngine,
    @Optional() private readonly capa?: PmCorrectiveActionsService,
    @Optional() private readonly notify?: SmsNotificationRouterService,
  ) {}

  async applyTagsToPhotoFinding(
    findingId: string,
    companyId: number,
    projectId: number,
    baseSeverity: PmDeficiencySeverity,
    tags: FindingRiskTags,
  ) {
    const inferredEnergy = tags.energyTypes?.length
      ? tags.energyTypes
      : this.energyWheel.inferFromText('');

    const evalResult = this.escalation.evaluate(baseSeverity, {
      sclState: tags.sclState,
      hecaInvolved: tags.hecaInvolved,
      energyTypes: inferredEnergy,
      energyControlState: tags.energyControlState,
      highEnergyFlag: tags.highEnergyFlag,
    });

    const finding = await this.prisma.pmInspectionPhotoFinding.update({
      where: { id: findingId },
      data: {
        sclState: tags.sclState ?? undefined,
        hecaInvolved: tags.hecaInvolved ?? false,
        hecaType: tags.hecaType,
        hecaCategoryCode: tags.hecaCategoryCode,
        energyTypesJson: inferredEnergy,
        energyControlState: tags.energyControlState ?? undefined,
        highEnergyFlag:
          tags.highEnergyFlag ?? evalResult.factors.includes('high_energy'),
        requiresInvestigation: evalResult.requiresInvestigation,
        escalatedSeverity: evalResult.escalated,
        severity: evalResult.severity,
      },
    });

    await this.riskContext.upsert({
      companyId,
      projectId,
      entityType: 'inspection_finding',
      entityId: findingId,
      sclState: tags.sclState,
      hecaInvolved: tags.hecaInvolved,
      hecaType: tags.hecaType as never,
      hecaCategoryCode: tags.hecaCategoryCode,
      energyTypes: inferredEnergy,
      energyControlState: tags.energyControlState,
      highEnergyFlag: finding.highEnergyFlag,
      metadata: { factors: evalResult.factors },
    });

    if (finding.correctiveActionId && this.capa) {
      await this.adjustCapaForEscalation(
        finding.correctiveActionId,
        companyId,
        evalResult.severity,
        evalResult.dueDateMultiplier,
      );
    }

    if (evalResult.requiresInvestigation && this.notify) {
      await this.notify.dispatch({
        companyId,
        projectId,
        eventKey: 'investigation.mandatory',
        title: 'Mandatory investigation required',
        body: `Inspection finding "${finding.title}" requires investigation (SCL/HECA/Energy escalation).`,
        entityType: 'inspection_finding',
        entityId: findingId,
        hecaEscalation: tags.hecaInvolved && finding.highEnergyFlag,
      });
    }

    return { finding, escalation: evalResult };
  }

  async autoTagFromAnalysis(
    findingId: string,
    companyId: number,
    projectId: number,
    baseSeverity: PmDeficiencySeverity,
    analysisText: string,
  ) {
    const energyTypes = this.energyWheel.inferFromText(analysisText);
    const highEnergy = energyTypes.some((t) =>
      ['gravity', 'electrical', 'pressure', 'chemical', 'radiation'].includes(
        t,
      ),
    );
    let sclState: PmSclState | undefined;
    const lower = analysisText.toLowerCase();
    if (/injury|fatality|loss|damage occurred/.test(lower)) sclState = 'loss';
    else if (/near miss|almost|could have|potential/.test(lower))
      sclState = 'conditional';
    else if (/safe|compliant|no hazard/.test(lower)) sclState = 'safe';

    const hecaInvolved = /critical|heca|energized|confined|crane lift/i.test(
      analysisText,
    );

    return this.applyTagsToPhotoFinding(
      findingId,
      companyId,
      projectId,
      baseSeverity,
      {
        sclState,
        hecaInvolved,
        hecaType: hecaInvolved ? 'critical_task' : undefined,
        energyTypes,
        energyControlState: highEnergy ? 'partially_controlled' : 'controlled',
        highEnergyFlag: highEnergy,
      },
    );
  }

  private async adjustCapaForEscalation(
    capaId: string,
    companyId: number,
    severity: PmDeficiencySeverity,
    multiplier: number,
  ) {
    const severityCail =
      severity === 'critical'
        ? 'critical'
        : severity === 'high'
        ? 'high'
        : severity === 'low'
        ? 'low'
        : 'medium';

    const config = await this.capa!.getCompanyConfig(companyId);
    let dueAt = this.dueDate.computeDueAt(severityCail, config);
    if (multiplier < 1 && dueAt) {
      const ms = dueAt.getTime() - Date.now();
      dueAt = new Date(Date.now() + ms * multiplier);
    }

    await this.prisma.pmCorrectiveAction.update({
      where: { id: capaId },
      data: {
        severityLevel: severityCail,
        dueAt,
        priorityScore: { critical: 95, high: 75, medium: 50, low: 25 }[
          severityCail
        ],
      },
    });
  }
}
