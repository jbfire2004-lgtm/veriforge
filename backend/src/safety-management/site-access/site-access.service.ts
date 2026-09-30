import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SifHecaService } from '../../sif-heca/sif-heca.service';
import { PmInspectionsService } from '../../pm-inspections/pm-inspections.service';
import { PmSafetyEventsService } from '../../pm-safety-events/pm-safety-events.service';
import { PmCorrectiveActionsService } from '../../pm-corrective-actions/pm-corrective-actions.service';
import { PmDocumentControlService } from '../../pm-document-control/pm-document-control.service';
import { PmEquipmentSafetyService } from '../../pm-equipment-safety/pm-equipment-safety.service';
import { PmEmergencyResponseService } from '../../pm-emergency-response/pm-emergency-response.service';
import { PmSiteAccessControlService } from '../../pm-site-access-control/pm-site-access-control.service';

export type SiteAccessEvaluation = {
  granted: boolean;
  denialReasons: string[];
  checks: Record<string, boolean>;
};

@Injectable()
export class SiteAccessService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly sifHeca?: SifHecaService,
    @Optional() private readonly pmInspections?: PmInspectionsService,
    @Optional() private readonly pmSafetyEvents?: PmSafetyEventsService,
    @Optional() private readonly pmCapa?: PmCorrectiveActionsService,
    @Optional() private readonly pmDocuments?: PmDocumentControlService,
    @Optional() private readonly pmEquipment?: PmEquipmentSafetyService,
    @Optional() private readonly pmEmergency?: PmEmergencyResponseService,
    @Optional() private readonly pmSiteAccess?: PmSiteAccessControlService,
  ) {}

  async listRules(projectId: number) {
    return this.prisma.siteAccessRule.findMany({
      where: { projectId, active: true },
      orderBy: { zoneCode: 'asc' },
    });
  }

  async upsertRule(data: {
    projectId: number;
    zoneCode?: string;
    requiresFlhaHours?: number;
    requiresTrainingCodes?: string[];
    requiresOrientation?: boolean;
  }) {
    const zoneCode = data.zoneCode ?? 'SITE';
    return this.prisma.siteAccessRule.upsert({
      where: {
        projectId_zoneCode: { projectId: data.projectId, zoneCode },
      },
      create: {
        projectId: data.projectId,
        zoneCode,
        requiresFlhaHours: data.requiresFlhaHours ?? 24,
        requiresTrainingCodes: (data.requiresTrainingCodes ??
          []) as Prisma.InputJsonValue,
        requiresOrientation: data.requiresOrientation ?? true,
      },
      update: {
        requiresFlhaHours: data.requiresFlhaHours,
        requiresTrainingCodes: data.requiresTrainingCodes as
          | Prisma.InputJsonValue
          | undefined,
        requiresOrientation: data.requiresOrientation,
        active: true,
      },
    });
  }

  async evaluateAccess(input: {
    workerId: number;
    projectId: number;
    zoneCode?: string;
    equipmentId?: number;
    accessPointId?: string;
  }): Promise<SiteAccessEvaluation> {
    if (this.pmSiteAccess) {
      const result = await this.pmSiteAccess.validateAccess({
        workerId: input.workerId,
        projectId: input.projectId,
        zoneCode: input.zoneCode,
        equipmentId: input.equipmentId,
        accessPointId: input.accessPointId,
        recordAttempt: true,
      });
      return {
        granted: result.granted,
        denialReasons: result.denialReasons,
        checks: result.checks,
      };
    }

    const zoneCode = input.zoneCode ?? 'SITE';
    const rule = await this.prisma.siteAccessRule.findUnique({
      where: {
        projectId_zoneCode: {
          projectId: input.projectId,
          zoneCode,
        },
      },
    });

    const effectiveRule = rule ?? {
      requiresFlhaHours: 24,
      requiresOrientation: true,
      requiresTrainingCodes: [] as string[],
    };

    const denialReasons: string[] = [];
    const checks: Record<string, boolean> = {};

    if (effectiveRule.requiresOrientation) {
      const orientation = await this.prisma.safetyForm.findFirst({
        where: {
          workerId: input.workerId,
          projectId: input.projectId,
          definitionId: 'site-orientation',
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
        },
        orderBy: { submittedAt: 'desc' },
      });
      checks.orientation = !!orientation;
      if (!orientation) {
        denialReasons.push('Site orientation not completed');
      }
    } else {
      checks.orientation = true;
    }

    const codes = Array.isArray(effectiveRule.requiresTrainingCodes)
      ? (effectiveRule.requiresTrainingCodes as string[])
      : [];
    if (codes.length > 0) {
      const records = await this.prisma.trainingRecord.findMany({
        where: {
          workerId: input.workerId,
          OR: [{ projectId: input.projectId }, { projectId: null }],
        },
        include: { certification: { select: { code: true, name: true } } },
      });
      const now = new Date();
      for (const code of codes) {
        const match = records.find(
          (r) =>
            (r.certification.code === code ||
              r.certification.name.toLowerCase() === code.toLowerCase()) &&
            (!r.expiresAt || r.expiresAt > now),
        );
        checks[`training_${code}`] = !!match;
        if (!match) {
          denialReasons.push(`Missing or expired training: ${code}`);
        }
      }
    }

    const hours = effectiveRule.requiresFlhaHours ?? 24;
    const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);
    const flhaForm = await this.prisma.safetyForm.findFirst({
      where: {
        workerId: input.workerId,
        projectId: input.projectId,
        definitionId: 'daily-flha',
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
        submittedAt: { gte: flhaSince },
      },
    });
    const flhaJha = await this.prisma.jhaFlha.findFirst({
      where: {
        projectId: input.projectId,
        kind: 'FLHA',
        status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED', 'UNDER_REVIEW'] },
        workers: { some: { workerId: input.workerId } },
        OR: [
          { approvedAt: { gte: flhaSince } },
          { submittedAt: { gte: flhaSince } },
        ],
      },
    });
    checks.flha = !!(flhaForm || flhaJha);
    if (!checks.flha) {
      denialReasons.push(`FLHA not completed within last ${hours} hours`);
    }

    if (this.sifHeca) {
      const sifAccess = await this.sifHeca.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.sifEngine = sifAccess.allowed;
      if (!sifAccess.allowed) {
        denialReasons.push(
          `Open SIF/HECA items: ${sifAccess.openCriticalEvents} events, ${sifAccess.openCorrectiveActions} CAPA`,
        );
      }
    }

    if (this.pmInspections) {
      const inspAccess = await this.pmInspections.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmInspections = inspAccess.allowed;
      if (!inspAccess.allowed) {
        denialReasons.push(
          `Inspection gate: ${inspAccess.openCriticalDeficiencies} critical deficiencies, ${inspAccess.overdueEquipmentCount} overdue equipment inspections`,
        );
      }
    }

    if (this.pmSafetyEvents) {
      const eventAccess = await this.pmSafetyEvents.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmSafetyEvents = eventAccess.allowed;
      if (!eventAccess.allowed) {
        denialReasons.push(
          `Safety event gate: ${eventAccess.criticalEventsWithoutClearance} critical events, ${eventAccess.openCorrectiveActions} open CAPA`,
        );
      }
    }

    if (this.pmCapa) {
      const capaAccess = await this.pmCapa.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmCorrectiveActions = capaAccess.allowed;
      if (!capaAccess.allowed) {
        denialReasons.push(
          `CAPA gate: ${capaAccess.criticalOpen} critical open, ${capaAccess.overdueCount} overdue`,
        );
      }
    }

    if (this.pmDocuments) {
      const docAccess = await this.pmDocuments.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmDocumentControl = docAccess.allowed;
      if (!docAccess.allowed) {
        if (docAccess.missingPolicyAcks > 0) {
          denialReasons.push(
            `Required policy acknowledgments missing: ${docAccess.missingPolicyAcks}`,
          );
        }
        if (docAccess.missingSdsAcks > 0) {
          denialReasons.push(
            `Required SDS review acknowledgments missing: ${docAccess.missingSdsAcks}`,
          );
        }
      }
    }

    if (this.pmEquipment) {
      const eqAccess = await this.pmEquipment.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmEquipmentSafety = eqAccess.allowed;
      if (!eqAccess.allowed) {
        denialReasons.push(
          `Equipment safety gate: ${
            eqAccess.blockedEquipmentCount
          } assigned asset(s) blocked — ${eqAccess.reasons.join('; ')}`,
        );
      }
    }

    if (this.pmEmergency) {
      const emAccess = await this.pmEmergency.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.pmEmergencyResponse = emAccess.allowed;
      if (!emAccess.allowed) {
        denialReasons.push(emAccess.reason ?? 'Emergency response gate failed');
      }
    }

    const meetingRequirements =
      await this.prisma.siteAccessMeetingRequirement.findMany({
        where: { projectId: input.projectId, active: true, zoneCode },
      });
    for (const req of meetingRequirements) {
      const windowStart = new Date(
        Date.now() - req.windowHours * 60 * 60 * 1000,
      );
      const attended = await this.prisma.safetyMeetingAttendee.findFirst({
        where: {
          workerId: input.workerId,
          status: 'present',
          checkedInAt: { gte: windowStart },
          meeting: {
            projectId: input.projectId,
            meetingType: req.meetingType,
            status: { in: ['completed', 'reviewed', 'locked'] },
          },
        },
      });
      const key = `meeting_${req.meetingType}`;
      checks[key] = !!attended;
      if (!attended) {
        denialReasons.push(
          `Required ${req.meetingType} meeting not attended in last ${req.windowHours}h`,
        );
      }
    }

    const openSif = await this.prisma.cailEntry.count({
      where: {
        projectId: input.projectId,
        workerId: input.workerId,
        status: { in: ['open', 'in_progress', 'overdue'] },
        OR: [{ severity: 'critical' }, { sourceType: 'sif' }],
      },
    });
    checks.noOpenSif = openSif === 0;
    if (openSif > 0) {
      denialReasons.push('Open SIF-priority corrective action on record');
    }

    const granted = denialReasons.length === 0;
    return { granted, denialReasons, checks };
  }

  async grantAccess(input: {
    workerId: number;
    projectId: number;
    zoneCode?: string;
    grantedByUserId?: number;
    sourceFormId?: string;
    expiresInHours?: number;
    evaluation?: SiteAccessEvaluation;
  }) {
    const evaluation =
      input.evaluation ??
      (await this.evaluateAccess({
        workerId: input.workerId,
        projectId: input.projectId,
        zoneCode: input.zoneCode,
      }));

    const expiresAt = input.expiresInHours
      ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.prisma.siteAccessGrant.create({
      data: {
        workerId: input.workerId,
        projectId: input.projectId,
        zoneCode: input.zoneCode ?? 'SITE',
        grantedByUserId: input.grantedByUserId,
        sourceFormId: input.sourceFormId,
        expiresAt,
        evaluationJson: evaluation as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async revokeGrant(grantId: string) {
    return this.prisma.siteAccessGrant.update({
      where: { id: grantId },
      data: { revokedAt: new Date() },
    });
  }

  async listGrants(projectId: number, workerId?: number) {
    return this.prisma.siteAccessGrant.findMany({
      where: {
        projectId,
        workerId,
        revokedAt: null,
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { grantedAt: 'desc' },
      take: 200,
    });
  }

  async processWorkerSiteAccessForm(input: {
    formId: string;
    workerId: number;
    projectId: number;
    formData: Record<string, unknown>;
    actorUserId?: number;
  }) {
    const evaluation = await this.evaluateAccess({
      workerId: input.workerId,
      projectId: input.projectId,
    });

    const formSaysGrant = input.formData.accessGranted === true;
    const orientationOk = input.formData.orientationVerified === true;
    const trainingOk = input.formData.trainingVerified === true;

    if (!orientationOk)
      evaluation.denialReasons.push('Orientation not verified on form');
    if (!trainingOk)
      evaluation.denialReasons.push('Training not verified on form');
    evaluation.granted = formSaysGrant && evaluation.denialReasons.length === 0;

    let grant = null;
    if (evaluation.granted) {
      grant = await this.grantAccess({
        workerId: input.workerId,
        projectId: input.projectId,
        grantedByUserId: input.actorUserId,
        sourceFormId: input.formId,
        evaluation,
      });
    }

    return { evaluation, grant };
  }

  async ensureDefaultRule(projectId: number) {
    const existing = await this.prisma.siteAccessRule.findFirst({
      where: { projectId },
    });
    if (existing) return existing;
    return this.upsertRule({ projectId });
  }
}
