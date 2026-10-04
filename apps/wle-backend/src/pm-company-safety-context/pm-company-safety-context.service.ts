import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmCompanyControlType,
  PmCompanyHazardCategory,
  PmCompanyPolicyType,
  PmCompanySafetyOverrideType,
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  PmProjectSafetyRiskLevel,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PublishWorkflowEngine } from '../pm-project-safety-context/publish-workflow.engine';
import { PmProjectSafetyContextService } from '../pm-project-safety-context/pm-project-safety-context.service';
import { CompanyProfileGeneratorEngine } from './company-profile-generator.engine';
import { CompanyEnforcementEngine } from './company-enforcement.engine';
import { CompanyProjectSyncEngine } from './company-project-sync.engine';
import { PmCompanySafetyCailIntelligenceService } from './pm-company-safety-cail-intelligence.service';

@Injectable()
export class PmCompanySafetyContextService {
  private readonly profileGenerator = new CompanyProfileGeneratorEngine();
  private readonly enforcementEngine = new CompanyEnforcementEngine();
  private readonly projectSync = new CompanyProjectSyncEngine();
  private readonly publishWorkflow = new PublishWorkflowEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmCompanySafetyCailIntelligenceService,
    @Optional()
    private readonly pmProjectContext?: PmProjectSafetyContextService,
  ) {}

  private async audit(
    companyId: number,
    entityType: string,
    entityId: string,
    eventType: string,
    profileId?: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmCompanySafetyAuditLog.create({
      data: {
        id: randomUUID(),
        companyId,
        profileId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getCompanyContext(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: { companyId },
    });

    const [
      hazardCount,
      controlCount,
      trainingCount,
      policyCount,
      sdsCount,
      planCount,
      zoneCount,
      projectCount,
      cailInsights,
    ] = await Promise.all([
      this.prisma.pmCompanyHazard.count({
        where: { companyId, status: 'published', deletedAt: null },
      }),
      this.prisma.pmCompanyControl.count({
        where: { companyId, status: 'published', deletedAt: null },
      }),
      this.prisma.pmCompanyTrainingMatrix.count({
        where: { companyId, status: 'published', active: true },
      }),
      this.prisma.pmCompanyPolicy.count({
        where: { companyId, status: 'published', deletedAt: null },
      }),
      this.prisma.pmCompanySdsLibrary.count({
        where: { companyId, active: true },
      }),
      this.prisma.pmCompanyEmergencyPlan.count({
        where: { companyId, active: true },
      }),
      this.prisma.pmCompanyZoneTemplate.count({
        where: { companyId, status: 'published', active: true },
      }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.cail.companyInsights(companyId),
    ]);

    return {
      companyId,
      companyName: company.name,
      profile,
      counts: {
        hazards: hazardCount,
        controls: controlCount,
        trainingRules: trainingCount,
        policies: policyCount,
        sds: sdsCount,
        emergencyPlans: planCount,
        zoneTemplates: zoneCount,
        activeProjects: projectCount,
      },
      cailInsights,
    };
  }

  mapWorkflowState(profile?: { status: string } | null) {
    const status = profile?.status ?? 'draft';
    return this.publishWorkflow.mapWorkflowState(
      status as import('@prisma/client').PmProjectSafetyPublishStatus,
      status === 'published',
      status === 'published',
    );
  }

  async updateProfile(
    companyId: number,
    data: Partial<{
      corporateRiskLevel: PmProjectSafetyRiskLevel;
      policiesJson: unknown[];
      ppeStandardsJson: unknown[];
      enforcementRulesJson: Record<string, unknown>;
    }>,
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId, actorId);
    const updated = await this.prisma.pmCompanySafetyProfile.update({
      where: { id: profile.id },
      data: {
        corporateRiskLevel: data.corporateRiskLevel,
        policiesJson: data.policiesJson as Prisma.InputJsonValue | undefined,
        ppeStandardsJson: data.ppeStandardsJson as
          | Prisma.InputJsonValue
          | undefined,
        enforcementRulesJson: data.enforcementRulesJson as
          | Prisma.InputJsonValue
          | undefined,
        status: 'draft',
      },
    });
    await this.audit(
      companyId,
      'profile',
      profile.id,
      'updated',
      profile.id,
      actorId,
    );
    return updated;
  }

  async getOrCreateProfile(companyId: number, actorId?: number) {
    const existing = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: { companyId },
    });
    if (existing) return existing;

    const row = await this.prisma.pmCompanySafetyProfile.create({
      data: { id: randomUUID(), companyId },
    });
    await this.audit(companyId, 'profile', row.id, 'created', row.id, actorId);
    return row;
  }

  async autoGenerateProfile(companyId: number, actorId?: number) {
    const since = new Date(Date.now() - 365 * 86400000);
    const [projectCount, workerCount, incidentCount, sifCount] =
      await Promise.all([
        this.prisma.project.count({ where: { companyId } }),
        this.prisma.worker.count({ where: { companyId } }),
        this.prisma.pmSafetyEvent.count({
          where: { companyId, occurredAt: { gte: since } },
        }),
        this.prisma.sifHecaEvent.count({
          where: { companyId, createdAt: { gte: since } },
        }),
      ]);

    const generated = this.profileGenerator.generate({
      projectCount,
      workerCount,
      incidentCount12m: incidentCount,
      sifCount12m: sifCount,
    });

    const profile = await this.getOrCreateProfile(companyId, actorId);
    const updated = await this.prisma.pmCompanySafetyProfile.update({
      where: { id: profile.id },
      data: {
        corporateRiskLevel: generated.corporateRiskLevel,
        ppeStandardsJson: generated.ppeStandards as Prisma.InputJsonValue,
        enforcementRulesJson:
          generated.enforcementRules as Prisma.InputJsonValue,
        autoGenerated: true,
        status: 'draft',
      },
    });

    for (const t of generated.defaultTrainingMatrix) {
      await this.prisma.pmCompanyTrainingMatrix.upsert({
        where: {
          companyId_roleType_trainingCode: {
            companyId,
            roleType: t.roleType as PmCompanyTrainingRoleType,
            trainingCode: t.trainingCode,
          },
        },
        create: {
          id: randomUUID(),
          companyId,
          profileId: profile.id,
          roleType: t.roleType as PmCompanyTrainingRoleType,
          category: t.category as PmCompanyTrainingCategory,
          trainingCode: t.trainingCode,
          trainingName: t.trainingName,
          expiresInDays: t.expiresInDays,
          status: 'draft',
        },
        update: {
          trainingName: t.trainingName,
          expiresInDays: t.expiresInDays,
        },
      });
    }

    await this.seedDefaultZoneTemplates(
      companyId,
      profile.id,
      generated.corporateRiskLevel,
    );
    await this.audit(
      companyId,
      'profile',
      profile.id,
      'auto_generated',
      profile.id,
      actorId,
    );
    return updated;
  }

  private async seedDefaultZoneTemplates(
    companyId: number,
    profileId: string,
    risk: PmProjectSafetyRiskLevel,
  ) {
    const templates: Array<{
      templateCode: string;
      zoneType:
        | 'general_work'
        | 'high_risk'
        | 'sif_high_energy'
        | 'confined_space';
      title: string;
      requiresJha: boolean;
      highRisk: boolean;
    }> = [
      {
        templateCode: 'SITE',
        zoneType: 'general_work' as const,
        title: 'General work area',
        requiresJha: false,
        highRisk: false,
      },
      {
        templateCode: 'HIGH_RISK',
        zoneType: 'high_risk' as const,
        title: 'High-risk zone',
        requiresJha: true,
        highRisk: true,
      },
      {
        templateCode: 'SIF_ZONE',
        zoneType: 'sif_high_energy' as const,
        title: 'SIF high-energy zone',
        requiresJha: true,
        highRisk: true,
      },
    ];
    if (risk === 'critical' || risk === 'high') {
      templates.push({
        templateCode: 'CONFINED',
        zoneType: 'confined_space' as const,
        title: 'Confined space',
        requiresJha: true,
        highRisk: true,
      });
    }

    for (const t of templates) {
      await this.prisma.pmCompanyZoneTemplate.upsert({
        where: {
          companyId_templateCode: { companyId, templateCode: t.templateCode },
        },
        create: {
          id: randomUUID(),
          companyId,
          profileId,
          templateCode: t.templateCode,
          zoneType: t.zoneType,
          title: t.title,
          requiresJha: t.requiresJha,
          highRisk: t.highRisk,
          requiresFlhaHours: risk === 'critical' ? 8 : 24,
          status: 'draft',
        },
        update: {
          title: t.title,
          requiresJha: t.requiresJha,
          highRisk: t.highRisk,
        },
      });
    }
  }

  async publishProfile(companyId: number, actorId?: number) {
    const profile = await this.getOrCreateProfile(companyId);
    const transition = this.publishWorkflow.profilePublish(
      profile.status,
      true,
    );
    if (!transition.allowed) {
      throw new BadRequestException(transition.errors.join('; '));
    }

    const snapshot = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: { id: profile.id },
    });
    const nextVersion = profile.version + 1;

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.pmCompanySafetyProfile.update({
        where: { id: profile.id },
        data: {
          status: 'published',
          version: nextVersion,
          publishedAt: new Date(),
          publishedById: actorId,
        },
      });
      await tx.pmCompanySafetyProfileVersion.create({
        data: {
          id: randomUUID(),
          profileId: profile.id,
          version: nextVersion,
          snapshotJson: snapshot as unknown as Prisma.InputJsonValue,
          publishedById: actorId,
        },
      });
      return row;
    });

    await this.syncPublishedAssetsToProjects(companyId, actorId);
    await this.audit(
      companyId,
      'profile',
      profile.id,
      'published',
      profile.id,
      actorId,
      {
        version: nextVersion,
      },
    );
    return updated;
  }

  async syncPublishedAssetsToProjects(companyId: number, actorId?: number) {
    const projects = await this.prisma.project.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: { id: true },
    });

    const hazards = await this.prisma.pmCompanyHazard.findMany({
      where: {
        companyId,
        status: 'published',
        syncToProjects: true,
        deletedAt: null,
      },
    });
    const templates = await this.prisma.pmCompanyZoneTemplate.findMany({
      where: { companyId, status: 'published', active: true },
    });

    for (const project of projects) {
      for (const h of hazards) {
        const existing = await this.prisma.pmProjectHazard.findFirst({
          where: {
            projectId: project.id,
            sourceType: 'company_library',
            sourceId: h.id,
          },
        });
        if (!existing) {
          await this.prisma.pmProjectHazard.create({
            data: {
              id: randomUUID(),
              companyId,
              projectId: project.id,
              category: this.projectSync.mapHazardCategory(h.category),
              title: h.title,
              description: `[Corporate] ${h.description}`,
              severity: h.severity,
              likelihood: h.likelihood,
              sifPotential: h.sifPotential,
              hecaCategoryKey: h.hecaCategoryKey,
              sourceType: 'company_library',
              sourceId: h.id,
              status: 'published',
              publishedAt: new Date(),
            },
          });
        }
      }

      for (const t of templates) {
        const rule = this.projectSync.zoneTemplateToAccessRule(t);
        await this.prisma.siteAccessRule.upsert({
          where: {
            projectId_zoneCode: {
              projectId: project.id,
              zoneCode: rule.zoneCode,
            },
          },
          create: {
            id: randomUUID(),
            companyId,
            projectId: project.id,
            zoneCode: rule.zoneCode,
            zoneType: rule.zoneType as never,
            requiresFlhaHours: rule.requiresFlhaHours,
            requiresJha: rule.requiresJha,
            requiresSdsAck: rule.requiresSdsAck,
            highRisk: rule.highRisk,
            requiredPpe: rule.requiredPpe as Prisma.InputJsonValue,
            requiresTrainingCodes:
              rule.requiresTrainingCodes as Prisma.InputJsonValue,
            active: true,
          },
          update: {
            requiresFlhaHours: rule.requiresFlhaHours,
            requiresJha: rule.requiresJha,
            requiresSdsAck: rule.requiresSdsAck,
            highRisk: rule.highRisk,
            requiredPpe: rule.requiredPpe as Prisma.InputJsonValue,
          },
        });
      }

      if (this.pmProjectContext) {
        await this.pmProjectContext
          .autoGenerateProfile(project.id, actorId)
          .catch(() => undefined);
      }
    }

    await this.audit(
      companyId,
      'sync',
      String(companyId),
      'projects_synced',
      undefined,
      actorId,
      {
        projectCount: projects.length,
      },
    );
    return { projectsSynced: projects.length };
  }

  // ---------- Hazards ----------

  async listHazards(companyId: number, status?: string) {
    return this.prisma.pmCompanyHazard.findMany({
      where: { companyId, deletedAt: null, status: status as never },
      orderBy: { title: 'asc' },
    });
  }

  async createHazard(
    companyId: number,
    data: {
      category: PmCompanyHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
      hecaCategoryKey?: string;
      requiredTraining?: string[];
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const row = await this.prisma.pmCompanyHazard.create({
      data: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        category: data.category,
        title: data.title,
        description: data.description,
        severity: data.severity ?? 3,
        likelihood: data.likelihood ?? 3,
        sifPotential: data.sifPotential ?? false,
        hecaCategoryKey: data.hecaCategoryKey,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        status: 'draft',
      },
    });
    await this.audit(
      companyId,
      'hazard',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async publishHazard(hazardId: string, actorId?: number) {
    const h = await this.prisma.pmCompanyHazard.findUnique({
      where: { id: hazardId },
    });
    if (!h) throw new NotFoundException('Hazard not found');
    const t = this.publishWorkflow.hazardPublish(
      h.status,
      h.title,
      h.description,
    );
    if (!t.allowed) throw new BadRequestException(t.errors.join('; '));

    const updated = await this.prisma.pmCompanyHazard.update({
      where: { id: hazardId },
      data: {
        status: 'published',
        version: h.version + 1,
        publishedAt: new Date(),
      },
    });
    await this.prisma.hazardLibraryEntry.create({
      data: {
        companyId: h.companyId,
        category: h.category,
        subcategory: h.subcategory,
        description: h.description,
        defaultSeverity: h.severity,
        defaultLikelihood: h.likelihood,
        active: true,
      },
    });
    if (h.syncToProjects)
      await this.syncPublishedAssetsToProjects(h.companyId, actorId);
    await this.audit(
      h.companyId,
      'hazard',
      hazardId,
      'published',
      h.profileId ?? undefined,
      actorId,
    );
    return updated;
  }

  // ---------- Controls ----------

  async listControls(companyId: number) {
    return this.prisma.pmCompanyControl.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { title: 'asc' },
    });
  }

  async createControl(
    companyId: number,
    data: {
      controlType: PmCompanyControlType;
      title: string;
      description: string;
      controlStrength?: number;
      ppeRequired?: boolean;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const row = await this.prisma.pmCompanyControl.create({
      data: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        controlType: data.controlType,
        title: data.title,
        description: data.description,
        controlStrength: data.controlStrength ?? 3,
        status: 'draft',
      },
    });
    await this.audit(
      companyId,
      'control',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async publishControl(controlId: string, actorId?: number) {
    const c = await this.prisma.pmCompanyControl.findUnique({
      where: { id: controlId },
    });
    if (!c) throw new NotFoundException('Control not found');
    const t = this.publishWorkflow.controlPublish(
      c.status,
      c.title,
      c.description,
    );
    if (!t.allowed) throw new BadRequestException(t.errors.join('; '));

    const updated = await this.prisma.pmCompanyControl.update({
      where: { id: controlId },
      data: {
        status: 'published',
        version: c.version + 1,
        publishedAt: new Date(),
      },
    });
    await this.prisma.controlLibraryEntry.create({
      data: {
        companyId: c.companyId,
        controlType: c.controlType,
        description: c.description,
        ppeRequired: false,
        active: true,
      },
    });
    await this.audit(
      c.companyId,
      'control',
      controlId,
      'published',
      c.profileId ?? undefined,
      actorId,
    );
    return updated;
  }

  // ---------- Training matrix ----------

  async listTrainingMatrix(companyId: number) {
    return this.prisma.pmCompanyTrainingMatrix.findMany({
      where: { companyId, active: true },
      orderBy: [{ roleType: 'asc' }, { trainingCode: 'asc' }],
    });
  }

  async upsertTrainingRule(
    companyId: number,
    data: {
      roleType: PmCompanyTrainingRoleType;
      category: PmCompanyTrainingCategory;
      trainingCode: string;
      trainingName: string;
      expiresInDays?: number;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    return this.prisma.pmCompanyTrainingMatrix.upsert({
      where: {
        companyId_roleType_trainingCode: {
          companyId,
          roleType: data.roleType,
          trainingCode: data.trainingCode,
        },
      },
      create: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        ...data,
        expiresInDays: data.expiresInDays ?? 365,
        status: 'draft',
      },
      update: {
        trainingName: data.trainingName,
        category: data.category,
        expiresInDays: data.expiresInDays ?? 365,
      },
    });
  }

  async workerTrainingCheck(
    workerId: number,
    roleType: PmCompanyTrainingRoleType = 'worker',
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) return { complete: true, missing: [] as string[] };

    const rules = await this.prisma.pmCompanyTrainingMatrix.findMany({
      where: {
        companyId: worker.companyId,
        roleType,
        status: 'published',
        active: true,
      },
    });

    const missing: string[] = [];
    const now = new Date();

    for (const rule of rules) {
      const record = await this.prisma.trainingRecord.findFirst({
        where: {
          workerId,
          certification: {
            name: {
              contains: rule.trainingCode,
              mode: 'insensitive',
            },
          },
        },
        include: { certification: true },
        orderBy: { issuedAt: 'desc' },
      });
      if (!record) {
        missing.push(rule.trainingCode);
        continue;
      }
      const base = record.expiresAt ?? record.completedAt ?? record.issuedAt;
      if (base && base < now) missing.push(rule.trainingCode);
      else if (!record.expiresAt) {
        const syntheticExpiry = new Date(
          record.issuedAt.getTime() + rule.expiresInDays * 86400000,
        );
        if (syntheticExpiry < now) missing.push(rule.trainingCode);
      }
    }

    return { complete: missing.length === 0, missing };
  }

  // ---------- Policies ----------

  async listPolicies(companyId: number) {
    return this.prisma.pmCompanyPolicy.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { title: 'asc' },
    });
  }

  async createPolicy(
    companyId: number,
    data: {
      policyType: PmCompanyPolicyType;
      title: string;
      requiresAck?: boolean;
      requiresAckForAccess?: boolean;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const row = await this.prisma.pmCompanyPolicy.create({
      data: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        policyType: data.policyType,
        title: data.title,
        requiresAck: data.requiresAck ?? true,
        requiresAckForAccess: data.requiresAckForAccess ?? false,
        status: 'draft',
      },
    });
    await this.audit(
      companyId,
      'policy',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async publishPolicy(policyId: string, actorId?: number) {
    const p = await this.prisma.pmCompanyPolicy.findUnique({
      where: { id: policyId },
    });
    if (!p) throw new NotFoundException('Policy not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.pmCompanyPolicy.update({
        where: { id: policyId },
        data: {
          status: 'published',
          version: p.version + 1,
          publishedAt: new Date(),
        },
      });
      await tx.pmCompanyPolicyVersion.create({
        data: {
          id: randomUUID(),
          policyId,
          version: p.version + 1,
          snapshotJson: {
            title: p.title,
            policyType: p.policyType,
          } as Prisma.InputJsonValue,
        },
      });
      const legacy = await tx.policyDocument.create({
        data: {
          companyId: p.companyId,
          title: p.title,
          category: p.policyType,
          requiresAck: p.requiresAck,
          requiresAckForAccess: p.requiresAckForAccess,
          status: 'published',
          publishedAt: new Date(),
        },
      });
      await tx.pmCompanyPolicy.update({
        where: { id: policyId },
        data: { legacyPolicyId: legacy.id },
      });
      return row;
    });

    await this.audit(
      p.companyId,
      'policy',
      policyId,
      'published',
      p.profileId ?? undefined,
      actorId,
    );
    return updated;
  }

  async policyAckCheck(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) return { satisfied: true, missing: 0 };

    const required = await this.prisma.pmCompanyPolicy.findMany({
      where: {
        companyId: worker.companyId,
        requiresAckForAccess: true,
        status: 'published',
        deletedAt: null,
      },
    });

    let missing = 0;
    for (const p of required) {
      const ack = await this.prisma.pmCompanyPolicyAcknowledgment.findUnique({
        where: { policyId_workerId: { policyId: p.id, workerId } },
      });
      if (!ack) {
        const legacyAck = p.legacyPolicyId
          ? await this.prisma.policyAcknowledgment.findUnique({
              where: {
                policyDocumentId_workerId: {
                  policyDocumentId: p.legacyPolicyId,
                  workerId,
                },
              },
            })
          : null;
        if (!legacyAck) missing++;
      }
    }
    return { satisfied: missing === 0, missing };
  }

  // ---------- SDS ----------

  async importSdsFromLegacy(companyId: number) {
    const docs = await this.prisma.sdsDocument.findMany({
      where: { companyId, projectId: null, deletedAt: null },
      take: 500,
    });
    let count = 0;
    for (const d of docs) {
      const cas = Array.isArray(d.casNumbers)
        ? (d.casNumbers as string[])[0]
        : null;
      const existing = await this.prisma.pmCompanySdsLibrary.findFirst({
        where: { legacySdsId: d.id },
      });
      if (existing) {
        await this.prisma.pmCompanySdsLibrary.update({
          where: { id: existing.id },
          data: { productName: d.productName, expiresAt: d.expiresAt },
        });
      } else {
        await this.prisma.pmCompanySdsLibrary.create({
          data: {
            id: randomUUID(),
            companyId,
            legacySdsId: d.id,
            productName: d.productName,
            manufacturer: d.manufacturer,
            casNumber: cas,
            expiresAt: d.expiresAt,
            status: d.status === 'published' ? 'published' : 'draft',
            publishedAt: d.publishedAt,
          },
        });
      }
      count++;
    }
    return { imported: count };
  }

  async listSds(companyId: number) {
    return this.prisma.pmCompanySdsLibrary.findMany({
      where: { companyId, active: true },
      orderBy: { productName: 'asc' },
    });
  }

  // ---------- Emergency plans ----------

  async importEmergencyFromLegacy(companyId: number) {
    const plans = await this.prisma.emergencyPlan.findMany({
      where: { companyId, projectId: null, deletedAt: null },
    });
    let count = 0;
    for (const p of plans) {
      await this.prisma.pmCompanyEmergencyPlan.create({
        data: {
          id: randomUUID(),
          companyId,
          planType: p.planType,
          title: p.title,
          contentJson: p.contentJson as Prisma.InputJsonValue,
          requiresAck: p.requiresAck,
          requiresAckForAccess: p.requiresAckForAccess,
          legacyPlanId: p.id,
          status: p.status === 'published' ? 'published' : 'draft',
          publishedAt: p.publishedAt,
        },
      });
      count++;
    }
    return { imported: count };
  }

  async listEmergencyPlans(companyId: number) {
    return this.prisma.pmCompanyEmergencyPlan.findMany({
      where: { companyId, active: true },
    });
  }

  // ---------- Equipment rules & zones ----------

  async listEquipmentRules(companyId: number) {
    return this.prisma.pmCompanyEquipmentRule.findMany({
      where: { companyId, active: true },
    });
  }

  async upsertEquipmentRule(
    companyId: number,
    data: {
      ruleKey: string;
      requiredCerts?: unknown[];
      requiredInspections?: unknown[];
      requiredTraining?: unknown[];
      requiredControls?: unknown[];
      operatorAuthRequired?: boolean;
      enforcementAction?: import('@prisma/client').PmCompanyEnforcementAction;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const row = await this.prisma.pmCompanyEquipmentRule.upsert({
      where: { companyId_ruleKey: { companyId, ruleKey: data.ruleKey } },
      create: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        ruleKey: data.ruleKey,
        requiredCerts: (data.requiredCerts ?? []) as Prisma.InputJsonValue,
        requiredInspections: (data.requiredInspections ??
          []) as Prisma.InputJsonValue,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredControls: (data.requiredControls ??
          []) as Prisma.InputJsonValue,
        operatorAuthRequired: data.operatorAuthRequired ?? true,
        enforcementAction: data.enforcementAction ?? 'block_access',
        status: 'draft',
      },
      update: {
        requiredCerts: (data.requiredCerts ?? []) as Prisma.InputJsonValue,
        requiredInspections: (data.requiredInspections ??
          []) as Prisma.InputJsonValue,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredControls: (data.requiredControls ??
          []) as Prisma.InputJsonValue,
        operatorAuthRequired: data.operatorAuthRequired,
        enforcementAction: data.enforcementAction,
      },
    });
    await this.audit(
      companyId,
      'equipment_rule',
      row.id,
      'upserted',
      profile.id,
      actorId,
    );
    return row;
  }

  async listZoneTemplates(companyId: number) {
    return this.prisma.pmCompanyZoneTemplate.findMany({
      where: { companyId, active: true },
    });
  }

  async upsertZoneTemplate(
    companyId: number,
    data: {
      templateCode: string;
      zoneType: import('@prisma/client').PmAccessZoneType;
      title: string;
      requiredTraining?: unknown[];
      requiredPpe?: unknown[];
      requiresJha?: boolean;
      requiresFlhaHours?: number;
      requiresPermits?: unknown[];
      requiresSdsAck?: boolean;
      highRisk?: boolean;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const row = await this.prisma.pmCompanyZoneTemplate.upsert({
      where: {
        companyId_templateCode: { companyId, templateCode: data.templateCode },
      },
      create: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        templateCode: data.templateCode,
        zoneType: data.zoneType,
        title: data.title,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredPpe: (data.requiredPpe ?? []) as Prisma.InputJsonValue,
        requiresJha: data.requiresJha ?? false,
        requiresFlhaHours: data.requiresFlhaHours ?? 24,
        requiresPermits: (data.requiresPermits ?? []) as Prisma.InputJsonValue,
        requiresSdsAck: data.requiresSdsAck ?? false,
        highRisk: data.highRisk ?? false,
        status: 'draft',
      },
      update: {
        title: data.title,
        zoneType: data.zoneType,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredPpe: (data.requiredPpe ?? []) as Prisma.InputJsonValue,
        requiresJha: data.requiresJha,
        requiresFlhaHours: data.requiresFlhaHours,
        requiresPermits: (data.requiresPermits ?? []) as Prisma.InputJsonValue,
        requiresSdsAck: data.requiresSdsAck,
        highRisk: data.highRisk,
      },
    });
    await this.audit(
      companyId,
      'zone_template',
      row.id,
      'upserted',
      profile.id,
      actorId,
    );
    return row;
  }

  async createSds(
    companyId: number,
    data: {
      productName: string;
      casNumber?: string;
      whmisClass?: string;
      manufacturer?: string;
      ppeRequirements?: unknown[];
      expiresAt?: string;
    },
    actorId?: number,
  ) {
    const row = await this.prisma.pmCompanySdsLibrary.create({
      data: {
        id: randomUUID(),
        companyId,
        productName: data.productName,
        casNumber: data.casNumber,
        whmisClass: data.whmisClass,
        manufacturer: data.manufacturer,
        ppeRequirements: (data.ppeRequirements ?? []) as Prisma.InputJsonValue,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: 'draft',
      },
    });
    await this.audit(companyId, 'sds', row.id, 'created', undefined, actorId);
    return row;
  }

  async createEmergencyPlan(
    companyId: number,
    data: {
      planType: import('@prisma/client').PmEmergencyPlanType;
      title: string;
      contentJson?: Record<string, unknown>;
      requiresAckForAccess?: boolean;
    },
    actorId?: number,
  ) {
    const row = await this.prisma.pmCompanyEmergencyPlan.create({
      data: {
        id: randomUUID(),
        companyId,
        planType: data.planType,
        title: data.title,
        contentJson: (data.contentJson ?? {}) as Prisma.InputJsonValue,
        requiresAckForAccess: data.requiresAckForAccess ?? false,
        status: 'draft',
      },
    });
    await this.audit(
      companyId,
      'emergency_plan',
      row.id,
      'created',
      undefined,
      actorId,
    );
    return row;
  }

  async validatePublishReadiness(companyId: number) {
    const publishedHazards = await this.prisma.pmCompanyHazard.findMany({
      where: { companyId, status: 'published', deletedAt: null },
      select: { id: true, requiredControlIds: true },
    });
    const hazardsWithoutControls = publishedHazards.filter((h) => {
      const ids = h.requiredControlIds as unknown;
      return !Array.isArray(ids) || ids.length === 0;
    }).length;

    const requiredPolicies = await this.prisma.pmCompanyPolicy.count({
      where: {
        companyId,
        requiresAckForAccess: true,
        status: 'published',
        deletedAt: null,
      },
    });

    const expiredSds = await this.prisma.pmCompanySdsLibrary.count({
      where: { companyId, active: true, expiresAt: { lt: new Date() } },
    });

    const roleTypes = await this.prisma.pmCompanyTrainingMatrix.groupBy({
      by: ['roleType'],
      where: { companyId, active: true },
      _count: true,
    });

    const errors: string[] = [];
    if (publishedHazards.length > 0 && hazardsWithoutControls > 0) {
      errors.push(
        `${hazardsWithoutControls} published hazard(s) missing linked controls`,
      );
    }
    if (requiredPolicies > 0) {
      const acks = await this.prisma.pmCompanyPolicyAcknowledgment.count({
        where: { policy: { companyId, requiresAckForAccess: true } },
      });
      if (acks === 0) {
        errors.push(
          'No policy acknowledgments recorded for access-required policies',
        );
      }
    }
    if (expiredSds > 0) {
      errors.push(`${expiredSds} SDS entries expired`);
    }
    if (roleTypes.length < 1) {
      errors.push('Training matrix must define at least one role');
    }

    return { valid: errors.length === 0, errors };
  }

  // ---------- Overrides ----------

  async createOverride(
    companyId: number,
    data: {
      overrideType: PmCompanySafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiresAt?: string;
      supervisorSig?: string;
      safetySig?: string;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(companyId);
    const highRisk =
      data.overrideType === 'zone' && data.ruleKey.includes('SIF');
    if (highRisk && !data.safetySig) {
      throw new BadRequestException(
        'Safety signature required for high-risk override',
      );
    }
    if (!data.reason?.trim())
      throw new BadRequestException('Override reason required');
    if (!data.expiresAt)
      throw new BadRequestException('Override expiry required');

    const row = await this.prisma.pmCompanySafetyOverride.create({
      data: {
        id: randomUUID(),
        companyId,
        profileId: profile.id,
        overrideType: data.overrideType,
        ruleKey: data.ruleKey,
        reason: data.reason,
        expiresAt: new Date(data.expiresAt),
        supervisorSig: data.supervisorSig,
        safetySig: data.safetySig,
        approvedById: actorId,
      },
    });
    await this.audit(
      companyId,
      'override',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async listOverrides(companyId: number) {
    return this.prisma.pmCompanySafetyOverride.findMany({
      where: {
        companyId,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  // ---------- Enforcement gate ----------

  async enforcementGate(
    workerId: number,
    workerChecks: Record<string, boolean>,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId)
      return { allowed: true, reasons: [] as string[], action: 'block_access' };

    const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: { companyId: worker.companyId },
    });
    const [training, policies, overrides] = await Promise.all([
      this.workerTrainingCheck(workerId),
      this.policyAckCheck(workerId),
      this.listOverrides(worker.companyId),
    ]);

    const expiredSds = await this.prisma.pmCompanySdsLibrary.count({
      where: {
        companyId: worker.companyId,
        expiresAt: { lt: new Date() },
        active: true,
      },
    });

    const result = this.enforcementEngine.evaluate({
      profilePublished: profile?.status === 'published',
      corporateRiskLevel: profile?.corporateRiskLevel ?? 'medium',
      enforcementRules:
        (profile?.enforcementRulesJson as Record<string, unknown>) ?? {},
      workerChecks,
      missingPolicyAcks: policies.missing,
      missingTraining: training.missing,
      expiredSds,
      activeOverrides: overrides.map((o) => ({
        overrideType: o.overrideType,
        ruleKey: o.ruleKey,
      })),
    });

    return {
      allowed: result.allowed,
      reasons: result.violations,
      waived: result.waived,
      action: result.action,
    };
  }

  // ---------- Offline & analytics ----------

  async buildOfflineBundle(companyId: number) {
    const context = await this.getCompanyContext(companyId);
    const bundle = {
      context,
      hazards: await this.listHazards(companyId, 'published'),
      controls: await this.listControls(companyId),
      training: await this.listTrainingMatrix(companyId),
      policies: await this.listPolicies(companyId),
      sds: await this.listSds(companyId),
      emergency: await this.listEmergencyPlans(companyId),
      equipmentRules: await this.listEquipmentRules(companyId),
      zoneTemplates: await this.listZoneTemplates(companyId),
      overrides: await this.listOverrides(companyId),
      syncedAt: new Date().toISOString(),
    };

    await this.prisma.pmCompanySafetyOfflineCache.upsert({
      where: { companyId_cacheKey: { companyId, cacheKey: 'full_context' } },
      create: {
        id: randomUUID(),
        companyId,
        cacheKey: 'full_context',
        payload: bundle as unknown as Prisma.InputJsonValue,
      },
      update: {
        payload: bundle as unknown as Prisma.InputJsonValue,
        cacheVersion: { increment: 1 },
        syncedAt: new Date(),
      },
    });
    return bundle;
  }

  async getCompanySafetyScore(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const score = await this.cail.generateCorporateSafetyScore(companyId);
    const forecast = await this.cail.hazardForecast(companyId);
    const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: { companyId },
    });

    return {
      companyId,
      companyName: company.name,
      ...score,
      workflowState: this.mapWorkflowState(profile),
      hazardForecast: forecast,
    };
  }

  async applyOfflineSync(
    companyId: number,
    payload: {
      profile?: Record<string, unknown>;
      hazards?: Array<Record<string, unknown>>;
      controls?: Array<Record<string, unknown>>;
      training?: Array<Record<string, unknown>>;
      policies?: Array<Record<string, unknown>>;
      sds?: Array<Record<string, unknown>>;
      emergency?: Array<Record<string, unknown>>;
      equipmentRules?: Array<Record<string, unknown>>;
      zoneTemplates?: Array<Record<string, unknown>>;
      overrides?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    let applied = 0;

    if (payload.profile) {
      await this.updateProfile(
        companyId,
        payload.profile as Parameters<
          PmCompanySafetyContextService['updateProfile']
        >[1],
        actorId,
      );
      applied++;
    }

    for (const h of payload.hazards ?? []) {
      if (h.id) {
        await this.prisma.pmCompanyHazard.updateMany({
          where: { id: h.id as string, companyId },
          data: {
            title: (h.title as string) ?? undefined,
            description: (h.description as string) ?? undefined,
          },
        });
      } else if (h.title && h.description && h.category) {
        await this.createHazard(
          companyId,
          h as Parameters<PmCompanySafetyContextService['createHazard']>[1],
          actorId,
        );
      }
      applied++;
    }

    for (const c of payload.controls ?? []) {
      if (c.id) {
        await this.prisma.pmCompanyControl.updateMany({
          where: { id: c.id as string, companyId },
          data: {
            title: (c.title as string) ?? undefined,
            description: (c.description as string) ?? undefined,
          },
        });
      } else if (c.title && c.description && c.controlType) {
        await this.createControl(
          companyId,
          c as Parameters<PmCompanySafetyContextService['createControl']>[1],
          actorId,
        );
      }
      applied++;
    }

    for (const t of payload.training ?? []) {
      if (t.roleType && t.trainingCode && t.trainingName && t.category) {
        await this.upsertTrainingRule(
          companyId,
          t as Parameters<
            PmCompanySafetyContextService['upsertTrainingRule']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const p of payload.policies ?? []) {
      if (p.title && p.policyType) {
        await this.createPolicy(
          companyId,
          p as Parameters<PmCompanySafetyContextService['createPolicy']>[1],
          actorId,
        );
        applied++;
      }
    }

    for (const s of payload.sds ?? []) {
      if (s.productName) {
        await this.createSds(
          companyId,
          s as Parameters<PmCompanySafetyContextService['createSds']>[1],
          actorId,
        );
        applied++;
      }
    }

    for (const e of payload.emergency ?? []) {
      if (e.title && e.planType) {
        await this.createEmergencyPlan(
          companyId,
          e as Parameters<
            PmCompanySafetyContextService['createEmergencyPlan']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const r of payload.equipmentRules ?? []) {
      if (r.ruleKey) {
        await this.upsertEquipmentRule(
          companyId,
          r as Parameters<
            PmCompanySafetyContextService['upsertEquipmentRule']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const z of payload.zoneTemplates ?? []) {
      if (z.templateCode && z.zoneType && z.title) {
        await this.upsertZoneTemplate(
          companyId,
          z as Parameters<
            PmCompanySafetyContextService['upsertZoneTemplate']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const o of payload.overrides ?? []) {
      if (o.overrideType && o.ruleKey && o.reason && o.expiresAt) {
        await this.createOverride(
          companyId,
          o as Parameters<PmCompanySafetyContextService['createOverride']>[1],
          actorId,
        );
        applied++;
      }
    }

    const bundle = await this.buildOfflineBundle(companyId);
    await this.audit(
      companyId,
      'offline_sync',
      String(companyId),
      'applied',
      undefined,
      actorId,
      {
        applied,
      },
    );
    return { ok: true, applied, serverState: bundle };
  }

  async analytics(companyId: number) {
    const since30 = new Date(Date.now() - 30 * 86400000);
    const since90 = new Date(Date.now() - 90 * 86400000);

    const [denials, attempts, scoreBundle, hazardTrend, controlTrend] =
      await Promise.all([
        this.prisma.pmAccessAttempt.count({
          where: {
            companyId,
            decision: { in: ['denied', 'denied_with_reason'] },
            createdAt: { gte: since30 },
          },
        }),
        this.prisma.pmAccessAttempt.count({
          where: { companyId, createdAt: { gte: since30 } },
        }),
        this.getCompanySafetyScore(companyId),
        this.prisma.pmCompanyHazard.groupBy({
          by: ['status'],
          where: { companyId, deletedAt: null },
          _count: true,
        }),
        this.prisma.pmCompanyControl.groupBy({
          by: ['status'],
          where: { companyId, deletedAt: null },
          _count: true,
        }),
      ]);

    const policyAcks = await this.prisma.pmCompanyPolicyAcknowledgment.findMany(
      {
        where: { policy: { companyId }, acknowledgedAt: { gte: since90 } },
        select: { acknowledgedAt: true },
        orderBy: { acknowledgedAt: 'asc' },
      },
    );

    const denialRate = attempts > 0 ? denials / attempts : 0;
    const forecast = this.cail.predictCorporateRisk(
      await this.prisma.pmSafetyEvent.count({
        where: { companyId, occurredAt: { gte: since30 } },
      }),
      denialRate,
    );

    const trainingRoles = await this.prisma.pmCompanyTrainingMatrix.groupBy({
      by: ['roleType'],
      where: { companyId, status: 'published', active: true },
      _count: true,
    });

    return {
      companyId,
      safetyScore: scoreBundle.score,
      scoreBand: scoreBundle.band,
      predictedRisk: scoreBundle.predictedRisk,
      denialRate30d: Math.round(denialRate * 100),
      hazardTrend: hazardTrend.map((h) => ({
        status: h.status,
        count: h._count,
      })),
      controlTrend: controlTrend.map((c) => ({
        status: c.status,
        count: c._count,
      })),
      policyAcknowledgmentTrend: policyAcks.map((a) =>
        a.acknowledgedAt.toISOString(),
      ),
      trainingCompliance: {
        roles: trainingRoles.map((r) => ({
          roleType: r.roleType,
          ruleCount: r._count,
        })),
      },
      leadingIndicators: {
        weakControls: scoreBundle.weakControls,
        expiredSdsFlag: scoreBundle.components.some(
          (c) => c.key === 'expired_sds' && c.deduction > 0,
        ),
        profilePublished: scoreBundle.workflowState !== 'draft',
      },
      corporateRiskForecast: forecast,
      cailInsights: await this.cail.companyInsights(companyId),
    };
  }
}
