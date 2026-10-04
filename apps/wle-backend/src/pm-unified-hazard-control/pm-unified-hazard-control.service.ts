import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmUnifiedControlType,
  PmUnifiedEnergyType,
  PmUnifiedHazardCategory,
  PmUnifiedHazardScope,
  PmUnifiedHcIngestSource,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PmProjectSafetyContextService } from '../pm-project-safety-context/pm-project-safety-context.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { PmWorkerSafetyProfileService } from '../pm-worker-safety-profile/pm-worker-safety-profile.service';
import { PmUnifiedHazardControlCailService } from './pm-unified-hazard-control-cail.service';
import { EnergyWheelEngine } from './energy-wheel.engine';
import { SifHecaScoringEngine } from './sif-heca-scoring.engine';
import { HazardIngestionEngine } from './hazard-ingestion.engine';
import { ControlSuggestionEngine } from './control-suggestion.engine';
import { HazardControlMappingEngine } from './hazard-control-mapping.engine';
import { PublishWorkflowEngine } from './publish-workflow.engine';
import { EnforcementEngine } from './enforcement.engine';

@Injectable()
export class PmUnifiedHazardControlService {
  private readonly energyWheel = new EnergyWheelEngine();
  private readonly sifHeca = new SifHecaScoringEngine();
  private readonly ingestion = new HazardIngestionEngine();
  private readonly controlSuggestion = new ControlSuggestionEngine();
  private readonly mapping = new HazardControlMappingEngine();
  private readonly publishWorkflow = new PublishWorkflowEngine();
  private readonly enforcement = new EnforcementEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmUnifiedHazardControlCailService,
    @Optional() private readonly projectContext?: PmProjectSafetyContextService,
    @Optional() private readonly companyContext?: PmCompanySafetyContextService,
    @Optional() private readonly workerSafety?: PmWorkerSafetyProfileService,
  ) {}

  private async hazardAudit(
    companyId: number,
    entityType: string,
    entityId: string,
    eventType: string,
    projectId?: number,
    hazardId?: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmUnifiedHazardAudit.create({
      data: {
        id: randomUUID(),
        companyId,
        projectId,
        hazardId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private async controlAudit(
    companyId: number,
    entityType: string,
    entityId: string,
    eventType: string,
    projectId?: number,
    controlId?: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmUnifiedControlAudit.create({
      data: {
        id: randomUUID(),
        companyId,
        projectId,
        controlId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ---------- Dashboard ----------

  async getDashboard(filters: { companyId: number; projectId?: number }) {
    const hazardWhere = {
      companyId: filters.companyId,
      deletedAt: null,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };
    const [
      hazardCount,
      controlCount,
      publishedHazards,
      sifCount,
      unmapped,
      energyRows,
    ] = await Promise.all([
      this.prisma.pmUnifiedHazard.count({ where: hazardWhere }),
      this.prisma.pmUnifiedControl.count({
        where: {
          companyId: filters.companyId,
          deletedAt: null,
          ...(filters.projectId ? { projectId: filters.projectId } : {}),
        },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: { ...hazardWhere, status: 'published' },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: { ...hazardWhere, sifPotential: true },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: {
          ...hazardWhere,
          status: 'published',
          controlLinks: { none: {} },
        },
      }),
      this.prisma.pmUnifiedHazardEnergy.groupBy({
        by: ['energyType'],
        where: { hazard: hazardWhere },
        _count: true,
      }),
    ]);

    const companyScore = this.cail.companyHazardScore({
      publishedHazards,
      unmappedHazards: unmapped,
      sifCount,
      chronicCount: 0,
    });
    const insights = await this.cail.insights(filters);

    return {
      companyId: filters.companyId,
      projectId: filters.projectId ?? null,
      metrics: {
        hazardCount,
        controlCount,
        publishedHazards,
        sifCount,
        unmappedPublished: unmapped,
        companyHazardScore: companyScore,
      },
      energyExposure: energyRows.map((e) => ({
        energyType: e.energyType,
        count: e._count,
      })),
      cail: { insights, companyScore },
    };
  }

  // ---------- Hazards ----------

  async getHazard(hazardId: string) {
    const hazard = await this.prisma.pmUnifiedHazard.findFirst({
      where: { id: hazardId, deletedAt: null },
      include: {
        energySources: true,
        controlLinks: {
          include: { control: { include: { verifications: true } } },
        },
        trainingReqs: true,
        equipmentReqs: true,
        ppeReqs: true,
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');
    return hazard;
  }

  async getControl(controlId: string) {
    const control = await this.prisma.pmUnifiedControl.findFirst({
      where: { id: controlId, deletedAt: null },
      include: {
        verifications: { orderBy: { stepOrder: 'asc' } },
        hazardLinks: { include: { hazard: true } },
        trainingReqs: true,
        ppeReqs: true,
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    });
    if (!control) throw new NotFoundException('Control not found');
    return control;
  }

  async listHazards(filters: {
    companyId: number;
    projectId?: number;
    scopeLevel?: PmUnifiedHazardScope;
    status?: string;
  }) {
    return this.prisma.pmUnifiedHazard.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.scopeLevel ? { scopeLevel: filters.scopeLevel } : {}),
        ...(filters.status ? { status: filters.status as 'draft' } : {}),
      },
      include: {
        energySources: true,
        controlLinks: { include: { control: true } },
        ppeReqs: true,
        trainingReqs: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async createHazard(
    companyId: number,
    body: {
      title: string;
      description: string;
      category?: PmUnifiedHazardCategory;
      hazardType?: string;
      severity?: number;
      likelihood?: number;
      projectId?: number;
      scopeLevel?: PmUnifiedHazardScope;
      workPackageId?: string;
      taskId?: string;
      workerId?: number;
      parentHazardId?: string;
      energyTypes?: PmUnifiedEnergyType[];
      trainingCodes?: string[];
      ppeTypes?: string[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const severity = body.severity ?? 3;
    const likelihood = body.likelihood ?? 3;
    const energies =
      body.energyTypes?.map((e) => ({
        energyType: e,
        exposureLevel: 2,
        highEnergyFlag: ['electrical', 'pressure', 'chemical'].includes(e),
        severityScore: 3,
        autoDetected: false,
      })) ?? this.energyWheel.detectFromText(body.description);

    const sifResult = this.sifHeca.score({
      severity,
      likelihood,
      highEnergyCount: energies.filter((e) => e.highEnergyFlag).length,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });

    const hazard = await this.prisma.pmUnifiedHazard.create({
      data: {
        id: randomUUID(),
        companyId,
        projectId: body.projectId,
        workPackageId: body.workPackageId,
        taskId: body.taskId,
        workerId: body.workerId,
        parentHazardId: body.parentHazardId,
        scopeLevel: body.scopeLevel ?? (body.projectId ? 'project' : 'company'),
        hazardType: (body.hazardType as 'physical') ?? 'physical',
        category: body.category ?? 'energy',
        title: body.title,
        description: body.description,
        severity,
        likelihood,
        riskScore: sifResult.riskScore,
        sifPotential: sifResult.sifPotential,
        sifScore: sifResult.sifScore,
        hecaCategoryKey: sifResult.hecaCategoryKey,
        supervisorReviewRequired: sifResult.supervisorReviewRequired,
        requiredTraining: (body.trainingCodes ?? []) as Prisma.InputJsonValue,
        requiredPpe: (body.ppeTypes ?? []) as Prisma.InputJsonValue,
        sourceType: 'manual',
        clientSyncId: body.clientSyncId,
        energySources: {
          create: energies.map((e) => ({
            id: randomUUID(),
            energyType: e.energyType,
            exposureLevel: e.exposureLevel,
            highEnergyFlag: e.highEnergyFlag,
            severityScore: e.severityScore,
            autoDetected: e.autoDetected,
          })),
        },
        trainingReqs: {
          create: (body.trainingCodes ?? []).map((code) => ({
            id: randomUUID(),
            trainingCode: code,
          })),
        },
        ppeReqs: {
          create: (body.ppeTypes ?? []).map((ppe) => ({
            id: randomUUID(),
            ppeType: ppe,
          })),
        },
      },
      include: { energySources: true, controlLinks: true },
    });

    await this.hazardAudit(
      companyId,
      'hazard',
      hazard.id,
      'created',
      body.projectId,
      hazard.id,
      actorId,
    );
    return { hazard, sifHeca: sifResult };
  }

  async publishHazard(hazardId: string, actorId?: number) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
      include: { controlLinks: true, ppeReqs: true, trainingReqs: true },
    });
    if (!hazard || hazard.deletedAt)
      throw new NotFoundException('Hazard not found');

    const mappingResult = this.mapping.validateMapping({
      hazardTitle: hazard.title,
      linkedControlCount: hazard.controlLinks.length,
      ppeCount: hazard.ppeReqs.length,
      trainingCount: hazard.trainingReqs.length,
      weakIssues: this.controlSuggestion.detectWeakControls(
        hazard.controlLinks,
      ),
      sifPotential: hazard.sifPotential,
    });

    const pub = this.publishWorkflow.evaluateHazard({
      status: hazard.status,
      mappingComplete: mappingResult.complete,
      sifPotential: hazard.sifPotential,
      supervisorReviewRequired: hazard.supervisorReviewRequired,
      linkedControlCount: hazard.controlLinks.length,
    });
    if (!pub.canPublish)
      throw new BadRequestException(pub.violations.join('; '));

    await this.prisma.pmUnifiedHazardVersion.create({
      data: {
        id: randomUUID(),
        hazardId,
        version: hazard.version,
        snapshotJson: hazard as unknown as Prisma.InputJsonValue,
      },
    });

    const updated = await this.prisma.pmUnifiedHazard.update({
      where: { id: hazardId },
      data: {
        status: 'published',
        version: { increment: 1 },
        publishedAt: new Date(),
      },
    });

    await this.hazardAudit(
      hazard.companyId,
      'hazard',
      hazardId,
      'published',
      hazard.projectId ?? undefined,
      hazardId,
      actorId,
    );
    return updated;
  }

  // ---------- Controls ----------

  async listControls(filters: {
    companyId: number;
    projectId?: number;
    controlType?: PmUnifiedControlType;
  }) {
    return this.prisma.pmUnifiedControl.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.controlType ? { controlType: filters.controlType } : {}),
      },
      include: { verifications: true, hazardLinks: true },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async createControl(
    companyId: number,
    body: {
      title: string;
      description: string;
      controlType?: PmUnifiedControlType;
      controlStrength?: number;
      hierarchyLevel?: number;
      projectId?: number;
      scopeLevel?: PmUnifiedHazardScope;
      verificationSteps?: string[];
      trainingCodes?: string[];
      ppeTypes?: string[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const control = await this.prisma.pmUnifiedControl.create({
      data: {
        id: randomUUID(),
        companyId,
        projectId: body.projectId,
        scopeLevel: body.scopeLevel ?? (body.projectId ? 'project' : 'company'),
        controlType: body.controlType ?? 'administrative',
        title: body.title,
        description: body.description,
        controlStrength: body.controlStrength ?? 3,
        hierarchyLevel:
          body.hierarchyLevel ??
          this.mapping.hierarchyRank(body.controlType ?? 'administrative'),
        requiredTraining: (body.trainingCodes ?? []) as Prisma.InputJsonValue,
        requiredPpe: (body.ppeTypes ?? []) as Prisma.InputJsonValue,
        sourceType: 'manual',
        clientSyncId: body.clientSyncId,
        verifications: {
          create: (
            body.verificationSteps ?? ['Field verify control implemented']
          ).map((desc, i) => ({
            id: randomUUID(),
            stepOrder: i,
            description: desc,
          })),
        },
        trainingReqs: {
          create: (body.trainingCodes ?? []).map((code) => ({
            id: randomUUID(),
            trainingCode: code,
          })),
        },
        ppeReqs: {
          create: (body.ppeTypes ?? []).map((ppe) => ({
            id: randomUUID(),
            ppeType: ppe,
          })),
        },
      },
      include: { verifications: true },
    });

    await this.controlAudit(
      companyId,
      'control',
      control.id,
      'created',
      body.projectId,
      control.id,
      actorId,
    );
    return control;
  }

  async linkHazardControl(
    hazardId: string,
    controlId: string,
    effectivenessScore?: number,
    actorId?: number,
  ) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
    });
    const control = await this.prisma.pmUnifiedControl.findUnique({
      where: { id: controlId },
    });
    if (!hazard || !control)
      throw new NotFoundException('Hazard or control not found');

    const link = await this.prisma.pmUnifiedHazardControlLink.upsert({
      where: { hazardId_controlId: { hazardId, controlId } },
      create: {
        id: randomUUID(),
        hazardId,
        controlId,
        effectivenessScore: effectivenessScore ?? 3,
      },
      update: { effectivenessScore },
    });

    await this.hazardAudit(
      hazard.companyId,
      'mapping',
      link.id,
      'linked',
      hazard.projectId ?? undefined,
      hazardId,
      actorId,
    );
    return link;
  }

  async publishControl(controlId: string, actorId?: number) {
    const control = await this.prisma.pmUnifiedControl.findUnique({
      where: { id: controlId },
      include: { verifications: true },
    });
    if (!control || control.deletedAt)
      throw new NotFoundException('Control not found');

    const pub = this.publishWorkflow.evaluateControl({
      status: control.status,
      verificationStepCount: control.verifications.length,
    });
    if (!pub.canPublish)
      throw new BadRequestException(pub.violations.join('; '));

    await this.prisma.pmUnifiedControlVersion.create({
      data: {
        id: randomUUID(),
        controlId,
        version: control.version,
        snapshotJson: control as unknown as Prisma.InputJsonValue,
      },
    });

    const updated = await this.prisma.pmUnifiedControl.update({
      where: { id: controlId },
      data: {
        status: 'published',
        version: { increment: 1 },
        publishedAt: new Date(),
      },
    });

    await this.controlAudit(
      control.companyId,
      'control',
      controlId,
      'published',
      control.projectId ?? undefined,
      controlId,
      actorId,
    );
    return updated;
  }

  // ---------- Energy wheel ----------

  async getEnergyWheel(hazardId: string) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
      include: {
        energySources: true,
        controlLinks: { include: { control: true } },
      },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');

    const detected = this.energyWheel.detectFromText(hazard.description);
    const suggested = this.energyWheel.suggestControlDescriptions(
      hazard.energySources.map((e) => e.energyType),
    );

    return {
      hazardId,
      energies: hazard.energySources,
      autoDetected: detected,
      suggestedControls: suggested,
      aggregateSeverity: this.energyWheel.aggregateEnergySeverity(
        hazard.energySources.map((e) => ({
          energyType: e.energyType,
          exposureLevel: e.exposureLevel,
          highEnergyFlag: e.highEnergyFlag,
          severityScore: e.severityScore,
          autoDetected: e.autoDetected,
        })),
      ),
    };
  }

  // ---------- SIF / HECA ----------

  async scoreHazardSifHeca(hazardId: string) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
      include: { energySources: true },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');

    const openCapa = hazard.projectId
      ? await this.prisma.pmCorrectiveAction.count({
          where: {
            projectId: hazard.projectId,
            status: { in: ['open', 'in_progress'] },
          },
        })
      : 0;

    const result = this.sifHeca.score({
      severity: hazard.severity,
      likelihood: hazard.likelihood,
      sifPotential: hazard.sifPotential,
      highEnergyCount: hazard.energySources.filter((e) => e.highEnergyFlag)
        .length,
      openCapaCount: openCapa,
      priorIncidentCount: hazard.sourceType === 'incident' ? 1 : 0,
    });

    await this.prisma.pmUnifiedHazard.update({
      where: { id: hazardId },
      data: {
        riskScore: result.riskScore,
        sifScore: result.sifScore,
        sifPotential: result.sifPotential,
        hecaCategoryKey: result.hecaCategoryKey,
        supervisorReviewRequired: result.supervisorReviewRequired,
      },
    });

    return result;
  }

  // ---------- Ingestion ----------

  async ingestBatch(
    companyId: number,
    source: PmUnifiedHcIngestSource,
    projectId?: number,
    actorId?: number,
  ) {
    const created: string[] = [];
    const skipped: string[] = [];

    const existing = await this.prisma.pmUnifiedHazard.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        sourceType: true,
        sourceId: true,
      },
    });
    const keys = new Set(
      existing.map((e) => this.ingestion.normalizeKey(e.title, e.description)),
    );

    const push = async (
      norm: ReturnType<HazardIngestionEngine['fromJhaHazard']>,
    ) => {
      const key = this.ingestion.normalizeKey(norm.title, norm.description);
      if ([...keys].some((k) => this.ingestion.isDuplicate(k, key))) {
        skipped.push(norm.sourceId ?? norm.title);
        return;
      }
      const { hazard } = await this.createHazard(
        companyId,
        {
          title: norm.title,
          description: norm.description,
          category: norm.category,
          severity: norm.severity,
          likelihood: norm.likelihood,
          projectId: norm.projectId,
          scopeLevel: norm.scopeLevel,
          taskId: norm.taskId,
          workPackageId: norm.workPackageId,
          workerId: norm.workerId,
        },
        actorId,
      );
      keys.add(key);
      created.push(hazard.id);
    };

    if (source === 'jha_flha' && projectId) {
      const jhaHazards = await this.prisma.jhaFlhaHazard.findMany({
        where: { jhaFlha: { projectId } },
        take: 100,
      });
      for (const h of jhaHazards) {
        await push(this.ingestion.fromJhaHazard(h, { companyId, projectId }));
      }
    }

    if (source === 'company_library') {
      const rows = await this.prisma.pmCompanyHazard.findMany({
        where: { companyId, deletedAt: null, active: true },
        take: 100,
      });
      for (const h of rows) {
        await push(
          this.ingestion.fromCompanyLibrary(
            { ...h, category: String(h.category) },
            companyId,
          ),
        );
      }
    }

    if (source === 'project_library' && projectId) {
      const rows = await this.prisma.pmProjectHazard.findMany({
        where: { projectId, deletedAt: null, active: true },
        take: 100,
      });
      for (const h of rows) {
        await push(
          this.ingestion.fromProjectLibrary(
            { ...h, category: String(h.category) },
            { companyId, projectId },
          ),
        );
      }
    }

    if (source === 'inspection' && projectId) {
      const defs = await this.prisma.pmInspectionDeficiency.findMany({
        where: { inspection: { projectId } },
        take: 50,
      });
      for (const d of defs) {
        await push(
          this.ingestion.fromInspectionDeficiency(d, { companyId, projectId }),
        );
      }
    }

    if (source === 'pm_task' && projectId) {
      const tasks = await this.prisma.pmPmTask.findMany({
        where: { projectId, status: 'blocked', deletedAt: null },
        take: 50,
      });
      for (const t of tasks) {
        await push(this.ingestion.fromPmTask(t, { companyId, projectId }));
      }
    }

    if (source === 'incident') {
      const events = await this.prisma.pmSafetyEvent.findMany({
        where: {
          companyId,
          ...(projectId ? { projectId } : {}),
        },
        take: 50,
        orderBy: { occurredAt: 'desc' },
      });
      for (const e of events) {
        await push(this.ingestion.fromIncident(e, { companyId, projectId }));
      }
    }

    if (source === 'equipment_failure' && projectId) {
      const failures = await this.prisma.pmEquipmentFailure.findMany({
        where: { projectId },
        take: 30,
      });
      for (const f of failures) {
        await push({
          title: f.title,
          description: f.description ?? f.title,
          category: 'equipment',
          hazardType: 'equipment',
          severity: 4,
          likelihood: 3,
          sourceType: 'equipment_failure',
          sourceId: f.id,
          scopeLevel: 'project',
          projectId,
        });
      }
    }

    await this.hazardAudit(
      companyId,
      'ingestion',
      source,
      'batch_complete',
      projectId,
      undefined,
      actorId,
      {
        created: created.length,
        skipped: skipped.length,
      },
    );

    return { source, created, skipped, count: created.length };
  }

  // ---------- Control suggestions ----------

  async suggestControlsForHazard(hazardId: string) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
      include: { energySources: true, controlLinks: true },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');

    return this.controlSuggestion.suggest({
      category: hazard.category,
      energyTypes: hazard.energySources.map((e) => e.energyType),
      sifPotential: hazard.sifPotential,
      missingControlCount: hazard.controlLinks.length === 0 ? 1 : 0,
    });
  }

  async applySuggestedControls(hazardId: string, actorId?: number) {
    const suggestions = await this.suggestControlsForHazard(hazardId);
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');

    const controlIds: string[] = [];
    for (const s of suggestions) {
      const c = await this.createControl(
        hazard.companyId,
        {
          title: s.title,
          description: s.description,
          controlType: s.controlType,
          controlStrength: s.controlStrength,
          hierarchyLevel: s.hierarchyLevel,
          projectId: hazard.projectId ?? undefined,
          trainingCodes: s.trainingCodes,
          ppeTypes: s.ppeTypes,
        },
        actorId,
      );
      await this.linkHazardControl(hazardId, c.id, s.controlStrength, actorId);
      controlIds.push(c.id);
    }
    return { hazardId, controlIds, suggestions };
  }

  // ---------- Inheritance sync ----------

  async syncCompanyToProject(
    companyId: number,
    projectId: number,
    actorId?: number,
  ) {
    const companyHazards = await this.prisma.pmUnifiedHazard.findMany({
      where: {
        companyId,
        scopeLevel: 'company',
        status: 'published',
        deletedAt: null,
      },
      include: { energySources: true, controlLinks: true },
    });

    const inherited: string[] = [];
    for (const parent of companyHazards) {
      const child = await this.prisma.pmUnifiedHazard.create({
        data: {
          id: randomUUID(),
          companyId,
          projectId,
          parentHazardId: parent.id,
          scopeLevel: 'project',
          hazardType: parent.hazardType,
          category: parent.category,
          subcategory: parent.subcategory,
          title: parent.title,
          description: parent.description,
          severity: parent.severity,
          likelihood: parent.likelihood,
          riskScore: parent.riskScore,
          sifPotential: parent.sifPotential,
          hecaCategoryKey: parent.hecaCategoryKey,
          sifScore: parent.sifScore,
          supervisorReviewRequired: parent.supervisorReviewRequired,
          requiredTraining: parent.requiredTraining as Prisma.InputJsonValue,
          requiredPpe: parent.requiredPpe as Prisma.InputJsonValue,
          sourceType: 'company_library',
          sourceId: parent.id,
          status: 'draft',
          energySources: {
            create: parent.energySources.map((e) => ({
              id: randomUUID(),
              energyType: e.energyType,
              exposureLevel: e.exposureLevel,
              highEnergyFlag: e.highEnergyFlag,
              severityScore: e.severityScore,
              autoDetected: true,
            })),
          },
        },
      });
      inherited.push(child.id);

      for (const link of parent.controlLinks) {
        let projectControl = await this.prisma.pmUnifiedControl.findFirst({
          where: {
            companyId,
            projectId,
            parentControlId: link.controlId,
          },
        });
        if (!projectControl) {
          const parentCtrl = await this.prisma.pmUnifiedControl.findUnique({
            where: { id: link.controlId },
          });
          if (parentCtrl) {
            projectControl = await this.prisma.pmUnifiedControl.create({
              data: {
                id: randomUUID(),
                companyId,
                projectId,
                parentControlId: parentCtrl.id,
                scopeLevel: 'project',
                controlType: parentCtrl.controlType,
                title: parentCtrl.title,
                description: parentCtrl.description,
                controlStrength: parentCtrl.controlStrength,
                hierarchyLevel: parentCtrl.hierarchyLevel,
                sourceType: 'company_library',
                sourceId: parentCtrl.id,
                status: 'draft',
              },
            });
          }
        }
        if (projectControl) {
          await this.linkHazardControl(
            child.id,
            projectControl.id,
            link.effectivenessScore ?? 3,
            actorId,
          );
        }
      }
    }

    if (this.projectContext) {
      await this.projectContext.autoGenerateProfile(projectId, actorId);
    }

    await this.hazardAudit(
      companyId,
      'sync',
      String(projectId),
      'company_to_project',
      projectId,
      undefined,
      actorId,
      {
        inherited: inherited.length,
      },
    );

    return {
      projectId,
      inheritedCount: inherited.length,
      hazardIds: inherited,
    };
  }

  // ---------- Enforcement ----------

  async enforcementGate(filters: {
    companyId: number;
    projectId?: number;
    workerId?: number;
  }) {
    const hazardWhere = {
      companyId: filters.companyId,
      deletedAt: null,
      status: 'published' as const,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    const unmapped = await this.prisma.pmUnifiedHazard.count({
      where: { ...hazardWhere, controlLinks: { none: {} } },
    });

    const chemical = await this.prisma.pmUnifiedHazard.count({
      where: { ...hazardWhere, category: 'chemical' },
    });

    let sdsAcknowledged = chemical === 0;
    if (filters.workerId && chemical > 0 && this.companyContext) {
      const ack = await this.companyContext.policyAckCheck(filters.workerId);
      sdsAcknowledged = ack.satisfied;
    }

    let trainingComplete = true;
    if (filters.workerId && this.workerSafety) {
      const w = await this.workerSafety.enforcementGate(
        filters.workerId,
        filters.projectId ?? 0,
      );
      trainingComplete = w.allowed;
    }

    const emergencyLocked = filters.projectId
      ? !!(await this.prisma.pmSiteEmergencyLock.findFirst({
          where: { projectId: filters.projectId, active: true },
        }))
      : false;

    const overrides = await this.prisma.pmUnifiedHcOverride.findMany({
      where: {
        companyId: filters.companyId,
        active: true,
        expiresAt: { gt: new Date() },
        OR: [
          { projectId: null },
          { projectId: filters.projectId ?? undefined },
        ],
      },
    });

    const result = this.enforcement.evaluate({
      publishedHazardCount: await this.prisma.pmUnifiedHazard.count({
        where: hazardWhere,
      }),
      unmappedPublishedHazards: unmapped,
      sdsAckRequired: chemical > 0,
      sdsAcknowledged,
      trainingComplete,
      controlsVerified: unmapped === 0,
      emergencyLocked,
      activeOverrides: overrides.map((o) => ({
        ruleType: o.ruleType,
        ruleKey: o.ruleKey,
      })),
    });

    return result;
  }

  // ---------- Worker exposure ----------

  async recordWorkerExposure(
    workerId: number,
    hazardId: string,
    projectId?: number,
  ) {
    const hazard = await this.prisma.pmUnifiedHazard.findUnique({
      where: { id: hazardId },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');

    const profile = this.workerSafety
      ? await this.workerSafety.getOrCreateProfile(workerId)
      : await this.prisma.pmWorkerSafetyProfile.findUnique({
          where: { workerId },
        });

    await this.prisma.pmWorkerHazardExposure.create({
      data: {
        id: randomUUID(),
        workerId,
        profileId: profile?.id,
        projectId,
        sourceType: 'project_library',
        sourceId: hazardId,
        hazardType: hazard.hazardType,
        severity: hazard.severity,
        likelihood: hazard.likelihood,
        sifPotential: hazard.sifPotential,
        hecaCategoryKey: hazard.hecaCategoryKey ?? undefined,
      },
    });

    if (this.workerSafety) {
      await this.workerSafety.rebuildProfile(workerId, projectId);
    }

    return { workerId, hazardId, recorded: true };
  }

  // ---------- Attachments ----------

  async addAttachment(body: {
    companyId?: number;
    hazardId?: string;
    controlId?: string;
    entityType: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
    clientSyncId?: string;
  }) {
    return this.prisma.pmUnifiedHcAttachment.create({
      data: {
        id: randomUUID(),
        companyId: body.companyId,
        hazardId: body.hazardId,
        controlId: body.controlId,
        entityType: body.entityType,
        fileName: body.fileName,
        mimeType: body.mimeType,
        dataUrl: body.dataUrl,
        clientSyncId: body.clientSyncId,
      },
    });
  }

  // ---------- Offline ----------

  async buildOfflineBundle(filters: { companyId: number; projectId?: number }) {
    const [hazards, controls] = await Promise.all([
      this.listHazards({
        companyId: filters.companyId,
        projectId: filters.projectId,
      }),
      this.listControls({
        companyId: filters.companyId,
        projectId: filters.projectId,
      }),
    ]);

    const cacheKey = filters.projectId
      ? `project:${filters.projectId}:hc_bundle`
      : `company:${filters.companyId}:hc_bundle`;

    const bundle = {
      syncedAt: new Date().toISOString(),
      hazards,
      controls,
      energyWheel: hazards.flatMap((h) =>
        (h.energySources ?? []).map((e) => ({ hazardId: h.id, ...e })),
      ),
      projectSafety:
        filters.projectId && this.projectContext
          ? await this.projectContext.buildOfflineBundle(filters.projectId)
          : null,
    };

    await this.prisma.pmUnifiedHcOfflineCache.upsert({
      where: { cacheKey },
      create: {
        id: randomUUID(),
        companyId: filters.companyId,
        projectId: filters.projectId,
        cacheKey,
        payload: bundle as Prisma.InputJsonValue,
        syncedAt: new Date(),
      },
      update: {
        payload: bundle as Prisma.InputJsonValue,
        cacheVersion: { increment: 1 },
        syncedAt: new Date(),
      },
    });

    return bundle;
  }

  async applyOfflineSync(
    filters: { companyId: number; projectId?: number },
    payload: {
      hazards?: Array<Record<string, unknown>>;
      controls?: Array<Record<string, unknown>>;
      mappings?: Array<{
        hazardId: string;
        controlId: string;
        effectivenessScore?: number;
      }>;
    },
    actorId?: number,
  ) {
    const results = { hazards: 0, controls: 0, mappings: 0 };

    for (const h of payload.hazards ?? []) {
      const clientSyncId = h.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing = await this.prisma.pmUnifiedHazard.findUnique({
          where: { clientSyncId },
        });
        if (existing) {
          await this.prisma.pmUnifiedHazard.update({
            where: { id: existing.id },
            data: {
              title: (h.title as string) ?? undefined,
              description: (h.description as string) ?? undefined,
              severity: (h.severity as number) ?? undefined,
              likelihood: (h.likelihood as number) ?? undefined,
            },
          });
          results.hazards++;
          continue;
        }
      }
      if (h.title && h.description) {
        await this.createHazard(
          filters.companyId,
          {
            ...(h as Parameters<
              PmUnifiedHazardControlService['createHazard']
            >[1]),
            projectId: filters.projectId ?? (h.projectId as number | undefined),
            clientSyncId,
          },
          actorId,
        );
        results.hazards++;
      }
    }

    for (const c of payload.controls ?? []) {
      const clientSyncId = c.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing = await this.prisma.pmUnifiedControl.findUnique({
          where: { clientSyncId },
        });
        if (existing) {
          await this.prisma.pmUnifiedControl.update({
            where: { id: existing.id },
            data: {
              title: (c.title as string) ?? undefined,
              description: (c.description as string) ?? undefined,
            },
          });
          results.controls++;
          continue;
        }
      }
      if (c.title && c.description) {
        await this.createControl(
          filters.companyId,
          {
            ...(c as Parameters<
              PmUnifiedHazardControlService['createControl']
            >[1]),
            projectId: filters.projectId ?? (c.projectId as number | undefined),
            clientSyncId,
          },
          actorId,
        );
        results.controls++;
      }
    }

    for (const m of payload.mappings ?? []) {
      if (m.hazardId && m.controlId) {
        await this.linkHazardControl(
          m.hazardId,
          m.controlId,
          m.effectivenessScore,
          actorId,
        );
        results.mappings++;
      }
    }

    await this.hazardAudit(
      filters.companyId,
      'offline_sync',
      String(filters.projectId ?? filters.companyId),
      'applied',
      filters.projectId,
      undefined,
      actorId,
      results,
    );

    return {
      ok: true,
      applied: results,
      serverState: await this.buildOfflineBundle(filters),
    };
  }

  async getCailBundle(filters: { companyId: number; projectId?: number }) {
    const [insights, predictions, correlations, projectScore, companyScore] =
      await Promise.all([
        this.cail.insights(filters),
        this.cail.predictHazardDetection(filters),
        this.cail.hazardIncidentCorrelation(filters),
        filters.projectId
          ? this.cail.projectHazardScore(filters.projectId)
          : Promise.resolve(null),
        this.cail.companyHazardScoreFromDb(
          filters.companyId,
          filters.projectId,
        ),
      ]);

    return {
      insights,
      predictions,
      correlations,
      projectHazardScore: projectScore,
      companyHazardScore: companyScore,
    };
  }

  // ---------- Analytics ----------

  async getAnalytics(filters: { companyId: number; projectId?: number }) {
    const dashboard = await this.getDashboard(filters);
    const [hazardTrend, controlTrend, energyTrend, sifTrend] =
      await Promise.all([
        this.prisma.pmUnifiedHazard.groupBy({
          by: ['status'],
          where: {
            companyId: filters.companyId,
            deletedAt: null,
            ...(filters.projectId ? { projectId: filters.projectId } : {}),
          },
          _count: true,
        }),
        this.prisma.pmUnifiedControl.groupBy({
          by: ['status'],
          where: {
            companyId: filters.companyId,
            deletedAt: null,
            ...(filters.projectId ? { projectId: filters.projectId } : {}),
          },
          _count: true,
        }),
        this.prisma.pmUnifiedHazardEnergy.groupBy({
          by: ['energyType'],
          where: {
            hazard: {
              companyId: filters.companyId,
              deletedAt: null,
              ...(filters.projectId ? { projectId: filters.projectId } : {}),
            },
          },
          _count: true,
        }),
        this.prisma.pmUnifiedHazard.groupBy({
          by: ['sifPotential'],
          where: {
            companyId: filters.companyId,
            deletedAt: null,
            status: 'published',
            ...(filters.projectId ? { projectId: filters.projectId } : {}),
          },
          _count: true,
        }),
      ]);

    const projectScore = filters.projectId
      ? await this.cail.projectHazardScore(filters.projectId)
      : null;

    return {
      ...dashboard,
      hazardStatusTrend: hazardTrend,
      controlStatusTrend: controlTrend,
      energyExposureTrend: energyTrend,
      sifHecaTrend: sifTrend,
      projectHazardScore: projectScore,
      leadingIndicators: {
        unmappedPublished: dashboard.metrics.unmappedPublished,
        sifCount: dashboard.metrics.sifCount,
        companyHazardScore: dashboard.metrics.companyHazardScore,
      },
    };
  }
}
