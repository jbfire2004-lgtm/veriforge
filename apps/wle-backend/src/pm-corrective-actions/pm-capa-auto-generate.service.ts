import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';
import { PmCorrectiveActionsService } from './pm-corrective-actions.service';

@Injectable()
export class PmCapaAutoGenerateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capa: PmCorrectiveActionsService,
    private readonly auditLog: AuditLogService,
  ) {}

  async fromJhaFlha(jhaFlhaId: string, actorId: number) {
    const jha = await this.prisma.jhaFlha.findUnique({
      where: { id: jhaFlhaId },
      include: { controls: true, hazards: true },
    });
    if (!jha) return [];

    const weakControls = jha.controls.filter(
      (control) =>
        control.adequate === false ||
        (control.effectivenessScore ?? 100) < 50,
    );
    return Promise.all(
      weakControls.map((control) =>
        this.capa.create({
          companyId: jha.companyId,
          projectId: jha.projectId,
          siteId: jha.siteId ?? undefined,
          sourceModule: 'jha_flha',
          sourceId: jhaFlhaId,
          sourceItemId: control.id,
          title: `Strengthen control: ${control.description.slice(0, 80)}`,
          description: control.description,
          actionType: 'interim_control',
          severity: 'high',
          createdByUserId: actorId,
          assignUserId: actorId,
        }),
      ),
    );
  }

  async fromInspectionDeficiency(deficiencyId: string, actorId: number) {
    const def = await this.prisma.pmInspectionDeficiency.findUnique({
      where: { id: deficiencyId },
      include: { inspection: true },
    });
    if (!def) return null;

    if (def.cailEntryId) {
      const existing = await this.prisma.pmCorrectiveAction.findFirst({
        where: { cailEntryId: def.cailEntryId },
      });
      if (existing) return this.capa.get(existing.id);
    }

    const exists = await this.prisma.pmCorrectiveAction.findFirst({
      where: {
        sourceModule: 'inspection',
        sourceId: def.inspectionId,
        sourceItemId: def.id,
      },
    });
    if (exists) return exists;

    const action = await this.capa.create({
      companyId: def.inspection.companyId,
      projectId: def.inspection.projectId,
      siteId: def.inspection.siteId ?? undefined,
      equipmentId: def.inspection.equipmentId ?? undefined,
      sourceModule: 'inspection',
      sourceId: def.inspectionId,
      sourceItemId: def.id,
      deficiencyId: def.id,
      title: def.title,
      description: def.description ?? undefined,
      actionType: 'permanent',
      severity:
        def.severity === 'critical'
          ? 'critical'
          : def.severity === 'high'
          ? 'high'
          : 'medium',
      createdByUserId: actorId,
    });

    await this.prisma.pmInspectionDeficiency.update({
      where: { id: deficiencyId },
      data: { cailEntryId: action.cailEntryId },
    });

    await this.auditLog.logAudit(
      { id: actorId, companyId: def.inspection.companyId },
      AuditAction.INSPECTION_AUTO_CAPA,
      {
        type: AuditEntityType.PM_CORRECTIVE_ACTION,
        id: action.id,
        tenantId: def.inspection.companyId,
      },
      {
        inspectionId: def.inspectionId,
        deficiencyId: def.id,
        auto: true,
      },
    );

    return action;
  }

  async fromSafetyEvent(eventId: string, rootCauseId: string, actorId: number) {
    const rc = await this.prisma.pmSafetyEventRootCause.findUnique({
      where: { id: rootCauseId },
      include: { event: true },
    });
    if (!rc) return null;

    return this.capa.create({
      companyId: rc.event.companyId,
      projectId: rc.event.projectId,
      siteId: rc.event.siteId ?? undefined,
      sourceModule: 'incident',
      sourceId: eventId,
      sourceItemId: rootCauseId,
      title: `RCA CAPA: ${rc.description.slice(0, 80)}`,
      description: rc.description,
      actionType: 'permanent',
      severity: rc.event.severity === 'critical' ? 'critical' : 'high',
      createdByUserId: actorId,
      sifLinked: !!rc.event.sifEventId,
    });
  }

  async fromSifHecaEvent(eventId: string, actorId: number) {
    const evt = await this.prisma.sifHecaEvent.findUnique({
      where: { id: eventId },
      include: { sifScore: true },
    });
    if (!evt) return null;

    return this.capa.create({
      companyId: evt.companyId,
      projectId: evt.projectId,
      siteId: evt.siteId ?? undefined,
      equipmentId: evt.equipmentId ?? undefined,
      workerId: evt.workerId ?? undefined,
      sourceModule: 'sif_heca',
      sourceId: eventId,
      sourceItemId: '',
      title: `SIF/HECA: ${evt.title}`,
      description: evt.description ?? undefined,
      actionType: 'immediate',
      severity: evt.sifScore?.sifCategory === 'critical' ? 'critical' : 'high',
      createdByUserId: actorId,
      sifLinked: true,
      hecaLinked: true,
    });
  }

  async syncOpenFromModules(projectId: number, actorId: number) {
    const results = { jha: 0, inspection: 0, sif: 0 };

    const openDefs = await this.prisma.pmInspectionDeficiency.findMany({
      where: {
        status: { not: 'closed' },
        inspection: { projectId },
        cailEntryId: null,
      },
      take: 20,
    });
    const inspectionCreated = await Promise.all(
      openDefs.map((d) => this.fromInspectionDeficiency(d.id, actorId)),
    );
    results.inspection = inspectionCreated.filter(Boolean).length;

    const sifEvents = await this.prisma.sifHecaEvent.findMany({
      where: {
        projectId,
        status: { in: ['scored', 'review_required'] },
      },
      take: 10,
    });
    const existingSif = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        sourceModule: 'sif_heca',
        sourceId: { in: sifEvents.map((e) => e.id) },
      },
      select: { sourceId: true },
    });
    const existingSifIds = new Set(existingSif.map((r) => r.sourceId));
    const sifToCreate = sifEvents.filter((e) => !existingSifIds.has(e.id));
    const sifCreated = await Promise.all(
      sifToCreate.map((e) => this.fromSifHecaEvent(e.id, actorId)),
    );
    results.sif = sifCreated.filter(Boolean).length;

    return results;
  }

  async fromDocumentDeficiency(input: {
    companyId: number;
    projectId?: number;
    siteId?: number;
    sourceModule: string;
    sourceId: string;
    sourceItemId?: string;
    title: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    actorId: number;
  }) {
    const exists = await this.prisma.pmCorrectiveAction.findFirst({
      where: {
        sourceModule: input.sourceModule,
        sourceId: input.sourceId,
        sourceItemId: input.sourceItemId ?? '',
        status: { notIn: ['closed', 'verified'] },
      },
    });
    if (exists) return exists;

    return this.capa.create({
      companyId: input.companyId,
      projectId: input.projectId,
      siteId: input.siteId,
      sourceModule: input.sourceModule,
      sourceId: input.sourceId,
      sourceItemId: input.sourceItemId ?? '',
      title: input.title,
      description: input.description,
      actionType: 'permanent',
      severity: input.severity ?? 'medium',
      createdByUserId: input.actorId,
    });
  }

  async fromEquipmentFailure(failureId: string, actorId: number) {
    const f = await this.prisma.pmEquipmentFailure.findUnique({
      where: { id: failureId },
    });
    if (!f) return null;
    if (f.correctiveActionId) {
      return this.capa.get(f.correctiveActionId);
    }

    let projectId = f.projectId;
    if (!projectId) {
      const epa = await this.prisma.equipmentProjectAssignment.findFirst({
        where: { equipmentId: f.equipmentId, status: 'ACTIVE' },
      });
      projectId = epa?.projectId ?? null;
    }
    if (!projectId) return null;

    const action = await this.capa.create({
      companyId: f.companyId,
      projectId,
      sourceModule: 'equipment',
      sourceId: failureId,
      title: `Equipment failure: ${f.title}`,
      description: f.description ?? undefined,
      actionType: 'equipment_repair',
      severity: f.failureType === 'safety_device' ? 'critical' : 'high',
      equipmentId: f.equipmentId,
      createdByUserId: actorId,
      publish: true,
    });

    await this.prisma.pmEquipmentFailure.update({
      where: { id: failureId },
      data: { correctiveActionId: action.id },
    });
    return action;
  }

  async fromEmergencyEvent(eventId: string, actorId: number) {
    const evt = await this.prisma.pmEmergencyEvent.findUnique({
      where: { id: eventId },
    });
    if (!evt) return null;

    const exists = await this.prisma.pmCorrectiveAction.findFirst({
      where: { sourceModule: 'emergency', sourceId: eventId },
    });
    if (exists) return exists;

    if (!evt.projectId) return null;

    return this.capa.create({
      companyId: evt.companyId,
      projectId: evt.projectId,
      siteId: evt.siteId,
      sourceModule: 'emergency',
      sourceId: eventId,
      title: `Post-emergency CAPA: ${evt.title}`,
      description: evt.description ?? undefined,
      actionType: 'immediate',
      severity: 'high',
      createdByUserId: actorId,
      publish: true,
    });
  }

  async fromTrainingGap(
    workerId: number,
    projectId: number,
    trainingCode: string,
    actorId: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) return null;

    return this.capa.create({
      companyId: worker.companyId,
      projectId,
      sourceModule: 'training',
      sourceId: String(workerId),
      sourceItemId: trainingCode,
      title: `Complete training: ${trainingCode}`,
      description: 'Expired or missing required training',
      actionType: 'training_requirement',
      severity: 'high',
      workerId,
      createdByUserId: actorId,
      publish: true,
    });
  }

  async fromSdsGap(
    companyId: number,
    projectId: number,
    chemicalName: string,
    actorId: number,
  ) {
    return this.capa.create({
      companyId,
      projectId,
      sourceModule: 'sds',
      sourceId: String(projectId),
      sourceItemId: chemicalName,
      title: `SDS compliance: ${chemicalName}`,
      description: 'Missing SDS acknowledgment or improper chemical storage',
      actionType: 'permanent',
      severity: 'high',
      createdByUserId: actorId,
      publish: true,
    });
  }

  async fromAccessDenial(
    workerId: number,
    projectId: number,
    reason: string,
    actorId: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) return null;

    return this.capa.create({
      companyId: worker.companyId,
      projectId,
      sourceModule: 'site_access',
      sourceId: String(workerId),
      title: `Resolve site access denial`,
      description: reason,
      actionType: 'permanent',
      severity: 'medium',
      workerId,
      createdByUserId: actorId,
    });
  }

  async fromPolicyNonCompliance(
    companyId: number,
    projectId: number,
    policyTitle: string,
    workerId: number | undefined,
    actorId: number,
  ) {
    return this.capa.create({
      companyId,
      projectId,
      sourceModule: 'policy',
      sourceId: policyTitle,
      title: `Policy acknowledgment: ${policyTitle}`,
      description: 'Required policy acknowledgment missing',
      actionType: 'policy_update',
      severity: 'medium',
      workerId,
      createdByUserId: actorId,
      publish: true,
    });
  }
}
