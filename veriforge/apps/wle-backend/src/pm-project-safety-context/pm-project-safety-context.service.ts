import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PmProjectControlType,
  PmProjectHazardCategory,
  PmProjectSafetyOverrideRuleType,
  PmProjectSafetyRiskLevel,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileGeneratorEngine } from './profile-generator.engine';
import { HazardImportEngine } from './hazard-import.engine';
import { PublishWorkflowEngine } from './publish-workflow.engine';
import { EnforcementEngine } from './enforcement.engine';
import { PmProjectSafetyCailIntelligenceService } from './pm-project-safety-cail-intelligence.service';

@Injectable()
export class PmProjectSafetyContextService {
  private readonly profileGenerator = new ProfileGeneratorEngine();
  private readonly hazardImport = new HazardImportEngine();
  private readonly publishWorkflow = new PublishWorkflowEngine();
  private readonly enforcement = new EnforcementEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmProjectSafetyCailIntelligenceService,
  ) {}

  private async audit(
    projectId: number,
    entityType: string,
    entityId: string,
    eventType: string,
    profileId?: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmProjectSafetyContextAudit.create({
      data: {
        id: randomUUID(),
        projectId,
        profileId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getProjectContext(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { site: true, company: { select: { id: true, name: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');

    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
      include: {
        hazards: {
          where: { active: true, deletedAt: null, status: 'published' },
          take: 20,
        },
        controls: {
          where: { active: true, deletedAt: null, status: 'published' },
          take: 20,
        },
        overrides: { where: { active: true } },
      },
    });

    const [
      openCail,
      riskSnapshot,
      zoneRules,
      publishedHazardCount,
      publishedControlCount,
    ] = await Promise.all([
      this.prisma.cailEntry.count({
        where: {
          projectId,
          status: { in: ['open', 'in_progress', 'overdue'] },
        },
      }),
      this.prisma.projectSafetyRiskSnapshot.findFirst({
        where: { projectId },
        orderBy: { computedAt: 'desc' },
      }),
      this.prisma.siteAccessRule.findMany({
        where: { projectId, active: true },
      }),
      this.prisma.pmProjectHazard.count({
        where: { projectId, status: 'published', deletedAt: null },
      }),
      this.prisma.pmProjectControl.count({
        where: { projectId, status: 'published', deletedAt: null },
      }),
    ]);

    const cailInsights = await this.cail.projectInsights(projectId);

    return {
      projectId,
      ownerCompanyId: project.companyId,
      companyName: project.company.name,
      siteIds: project.siteId ? [project.siteId] : [],
      siteName: project.site?.name ?? null,
      profile: profile
        ? {
            id: profile.id,
            version: profile.version,
            status: profile.status,
            riskLevel: profile.riskLevel,
            requiredJhaTypes: profile.requiredJhaTypes,
            requiredTraining: profile.requiredTraining,
            enforcementRules: profile.enforcementRulesJson,
            publishedAt: profile.publishedAt?.toISOString() ?? null,
            completenessScore: this.cail.profileCompletenessScore({
              requiredJhaTypes: profile.requiredJhaTypes,
              requiredTraining: profile.requiredTraining,
              zoneRulesJson: profile.zoneRulesJson,
              status: profile.status,
            }),
          }
        : null,
      hazardLibraryCount: publishedHazardCount,
      controlLibraryCount: publishedControlCount,
      zoneRules,
      openCailCount: openCail,
      riskSnapshot: riskSnapshot
        ? {
            score: riskSnapshot.score,
            band: riskSnapshot.predictedLevel,
            computedAt: riskSnapshot.computedAt.toISOString(),
          }
        : null,
      cailInsights,
      integrations: {
        jhaFlha: true,
        siteAccess: zoneRules.length > 0,
        safetyStations: true,
        emergency: true,
      },
    };
  }

  // ---------- Profile ----------

  async getOrCreateProfile(projectId: number, actorId?: number) {
    const existing = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });
    if (existing) return existing;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const profile = await this.prisma.pmProjectSafetyProfile.create({
      data: {
        id: randomUUID(),
        companyId: project.companyId,
        projectId,
      },
    });
    await this.audit(
      projectId,
      'profile',
      profile.id,
      'created',
      profile.id,
      actorId,
    );
    return profile;
  }

  async updateProfile(
    projectId: number,
    data: Partial<{
      riskLevel: PmProjectSafetyRiskLevel;
      projectType: string;
      scopeOfWorkJson: Record<string, unknown>;
      requiredJhaTypes: string[];
      requiredInspections: unknown[];
      requiredTraining: string[];
      requiredEquipmentCerts: string[];
      requiredPpe: string[];
      requiredEmergencyPlans: unknown[];
      requiredSdsAcks: unknown[];
      requiredToolboxTalks: unknown;
      enforcementRulesJson: Record<string, unknown>;
      zoneRulesJson: unknown[];
      equipmentRulesJson: Record<string, unknown>;
      trainingRulesJson: Record<string, unknown>;
      emergencyRulesJson: Record<string, unknown>;
      environmentalJson: Record<string, unknown>;
      subcontractorIds: number[];
    }>,
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(projectId, actorId);
    const updated = await this.prisma.pmProjectSafetyProfile.update({
      where: { id: profile.id },
      data: {
        riskLevel: data.riskLevel,
        projectType: data.projectType,
        scopeOfWorkJson: data.scopeOfWorkJson as
          | Prisma.InputJsonValue
          | undefined,
        requiredJhaTypes: data.requiredJhaTypes as
          | Prisma.InputJsonValue
          | undefined,
        requiredInspections: data.requiredInspections as
          | Prisma.InputJsonValue
          | undefined,
        requiredTraining: data.requiredTraining as
          | Prisma.InputJsonValue
          | undefined,
        requiredEquipmentCerts: data.requiredEquipmentCerts as
          | Prisma.InputJsonValue
          | undefined,
        requiredPpe: data.requiredPpe as Prisma.InputJsonValue | undefined,
        requiredEmergencyPlans: data.requiredEmergencyPlans as
          | Prisma.InputJsonValue
          | undefined,
        requiredSdsAcks: data.requiredSdsAcks as
          | Prisma.InputJsonValue
          | undefined,
        requiredToolboxTalks: data.requiredToolboxTalks as
          | Prisma.InputJsonValue
          | undefined,
        enforcementRulesJson: data.enforcementRulesJson as
          | Prisma.InputJsonValue
          | undefined,
        zoneRulesJson: data.zoneRulesJson as Prisma.InputJsonValue | undefined,
        equipmentRulesJson: data.equipmentRulesJson as
          | Prisma.InputJsonValue
          | undefined,
        trainingRulesJson: data.trainingRulesJson as
          | Prisma.InputJsonValue
          | undefined,
        emergencyRulesJson: data.emergencyRulesJson as
          | Prisma.InputJsonValue
          | undefined,
        environmentalJson: data.environmentalJson as
          | Prisma.InputJsonValue
          | undefined,
        subcontractorIds: data.subcontractorIds as
          | Prisma.InputJsonValue
          | undefined,
        status: 'draft',
      },
    });
    await this.audit(
      projectId,
      'profile',
      profile.id,
      'updated',
      profile.id,
      actorId,
    );
    return updated;
  }

  async autoGenerateProfile(projectId: number, actorId?: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const since = new Date(Date.now() - 365 * 86400000);
    const [equipmentCount, incidentCount, sifCount, subcontractorCount] =
      await Promise.all([
        this.prisma.equipmentProjectAssignment.count({
          where: { projectId, endedAt: null },
        }),
        this.prisma.pmSafetyEvent.count({
          where: { projectId, occurredAt: { gte: since } },
        }),
        this.prisma.sifHecaEvent.count({
          where: { projectId, createdAt: { gte: since } },
        }),
        this.prisma.pmInspectionDeficiency
          .findMany({
            where: {
              inspection: { projectId },
              subcontractorCompanyId: { not: null },
            },
            distinct: ['subcontractorCompanyId'],
            select: { subcontractorCompanyId: true },
          })
          .then((r) => r.length),
      ]);

    const generated = this.profileGenerator.generate({
      projectType: project.code ?? undefined,
      equipmentCount,
      incidentCount12m: incidentCount,
      sifEventCount12m: sifCount,
      subcontractorCount,
    });

    const profile = await this.getOrCreateProfile(projectId, actorId);
    const updated = await this.prisma.pmProjectSafetyProfile.update({
      where: { id: profile.id },
      data: {
        riskLevel: generated.riskLevel,
        requiredJhaTypes: generated.requiredJhaTypes as Prisma.InputJsonValue,
        requiredInspections:
          generated.requiredInspections as Prisma.InputJsonValue,
        requiredTraining: generated.requiredTraining as Prisma.InputJsonValue,
        requiredEquipmentCerts:
          generated.requiredEquipmentCerts as Prisma.InputJsonValue,
        requiredPpe: generated.requiredPpe as Prisma.InputJsonValue,
        requiredEmergencyPlans:
          generated.requiredEmergencyPlans as Prisma.InputJsonValue,
        requiredSdsAcks: generated.requiredSdsAcks as Prisma.InputJsonValue,
        requiredToolboxTalks:
          generated.requiredToolboxTalks as Prisma.InputJsonValue,
        enforcementRulesJson:
          generated.enforcementRules as Prisma.InputJsonValue,
        zoneRulesJson: generated.zoneRules as Prisma.InputJsonValue,
        equipmentRulesJson: generated.equipmentRules as Prisma.InputJsonValue,
        trainingRulesJson: generated.trainingRules as Prisma.InputJsonValue,
        emergencyRulesJson: generated.emergencyRules as Prisma.InputJsonValue,
        autoGenerated: true,
        status: 'draft',
      },
    });

    await this.syncZoneRulesFromProfile(
      projectId,
      generated.zoneRules,
      actorId,
    );
    await this.audit(
      projectId,
      'profile',
      profile.id,
      'auto_generated',
      profile.id,
      actorId,
      {
        riskLevel: generated.riskLevel,
      },
    );
    return updated;
  }

  private async syncZoneRulesFromProfile(
    projectId: number,
    zoneRules: Array<Record<string, unknown>>,
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return;

    for (const z of zoneRules) {
      const zoneCode = (z.zoneCode as string) ?? 'SITE';
      await this.prisma.siteAccessRule.upsert({
        where: {
          projectId_zoneCode: { projectId, zoneCode },
        },
        create: {
          id: randomUUID(),
          projectId,
          companyId: project.companyId,
          zoneCode,
          requiresFlhaHours: (z.requiresFlhaHours as number) ?? 24,
          requiresJha: !!z.requiresJha,
          highRisk: !!z.highRisk,
          active: true,
        },
        update: {
          requiresFlhaHours: (z.requiresFlhaHours as number) ?? 24,
          requiresJha: !!z.requiresJha,
          highRisk: !!z.highRisk,
          active: true,
        },
      });
    }
    await this.audit(
      projectId,
      'zone_rules',
      String(projectId),
      'synced_from_profile',
      undefined,
      actorId,
    );
  }

  async publishProfile(projectId: number, actorId?: number) {
    const profile = await this.getOrCreateProfile(projectId);
    const transition = this.publishWorkflow.profilePublish(
      profile.status,
      Array.isArray(profile.requiredJhaTypes) &&
        profile.requiredJhaTypes.length > 0,
    );
    if (!transition.allowed) {
      throw new BadRequestException(transition.errors.join('; '));
    }

    const nextVersion = profile.version + 1;
    const snapshot = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { id: profile.id },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.pmProjectSafetyProfile.update({
        where: { id: profile.id },
        data: {
          status: 'published',
          version: nextVersion,
          publishedAt: new Date(),
          publishedById: actorId,
        },
      });
      await tx.pmProjectSafetyProfileVersion.create({
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

    const zoneRules = Array.isArray(profile.zoneRulesJson)
      ? (profile.zoneRulesJson as Array<Record<string, unknown>>)
      : [];
    await this.syncZoneRulesFromProfile(projectId, zoneRules, actorId);

    const legacyPlan = await this.prisma.projectSafetyPlan.findUnique({
      where: { projectId },
    });
    const formIds = ['daily-flha'];
    if (legacyPlan) {
      await this.prisma.projectSafetyPlan.update({
        where: { projectId },
        data: { requiredDefinitionIds: formIds as Prisma.InputJsonValue },
      });
    } else {
      await this.prisma.projectSafetyPlan.create({
        data: {
          projectId,
          requiredDefinitionIds: formIds as Prisma.InputJsonValue,
        },
      });
    }

    await this.audit(
      projectId,
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

  // ---------- Hazards ----------

  async listHazards(projectId: number, status?: string) {
    return this.prisma.pmProjectHazard.findMany({
      where: {
        projectId,
        deletedAt: null,
        status: status as never,
      },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
  }

  async createHazard(
    projectId: number,
    data: {
      category: PmProjectHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
      hecaCategoryKey?: string;
      subcategory?: string;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.getOrCreateProfile(projectId);

    const row = await this.prisma.pmProjectHazard.create({
      data: {
        id: randomUUID(),
        companyId: project.companyId,
        projectId,
        profileId: profile.id,
        category: data.category,
        title: data.title,
        description: data.description,
        severity: data.severity ?? 3,
        likelihood: data.likelihood ?? 3,
        sifPotential: data.sifPotential ?? false,
        hecaCategoryKey: data.hecaCategoryKey,
        subcategory: data.subcategory,
        status: 'draft',
      },
    });
    await this.audit(
      projectId,
      'hazard',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async publishHazard(hazardId: string, actorId?: number) {
    const hazard = await this.prisma.pmProjectHazard.findUnique({
      where: { id: hazardId },
    });
    if (!hazard) throw new NotFoundException('Hazard not found');
    const transition = this.publishWorkflow.hazardPublish(
      hazard.status,
      hazard.title,
      hazard.description,
    );
    if (!transition.allowed)
      throw new BadRequestException(transition.errors.join('; '));

    const updated = await this.prisma.pmProjectHazard.update({
      where: { id: hazardId },
      data: {
        status: 'published',
        version: hazard.version + 1,
        publishedAt: new Date(),
      },
    });
    await this.audit(
      hazard.projectId,
      'hazard',
      hazardId,
      'published',
      hazard.profileId ?? undefined,
      actorId,
    );
    return updated;
  }

  async importHazards(
    projectId: number,
    sources: Array<
      | 'company_library'
      | 'jha_flha'
      | 'inspection'
      | 'incident'
      | 'equipment_failure'
    >,
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.getOrCreateProfile(projectId);
    const imported: string[] = [];
    const seen = new Set<string>();

    if (sources.includes('company_library')) {
      const entries = await this.prisma.hazardLibraryEntry.findMany({
        where: {
          OR: [
            { companyId: project.companyId, projectId: null },
            { projectId },
          ],
          active: true,
        },
        take: 100,
      });
      for (const e of entries) {
        const h = this.hazardImport.mapCompanyLibrary(e);
        const key = this.hazardImport.dedupeKey(h);
        if (seen.has(key)) continue;
        seen.add(key);
        await this.prisma.pmProjectHazard.create({
          data: {
            id: randomUUID(),
            companyId: project.companyId,
            projectId,
            profileId: profile.id,
            category: h.category,
            title: h.title,
            description: h.description,
            severity: h.severity,
            likelihood: h.likelihood,
            sifPotential: h.sifPotential,
            sourceType: h.sourceType,
            status: 'draft',
          },
        });
        imported.push(key);
      }
    }

    if (sources.includes('jha_flha')) {
      const jhas = await this.prisma.jhaFlha.findMany({
        where: { projectId },
        include: { hazards: true },
        take: 20,
      });
      for (const j of jhas) {
        for (const h of j.hazards) {
          const mapped = this.hazardImport.mapJhaHazard({
            id: h.id,
            description: h.description,
            severity: h.severity,
            likelihood: h.likelihood,
          });
          const key = this.hazardImport.dedupeKey(mapped);
          if (seen.has(key)) continue;
          seen.add(key);
          await this.prisma.pmProjectHazard.create({
            data: {
              id: randomUUID(),
              companyId: project.companyId,
              projectId,
              profileId: profile.id,
              category: mapped.category,
              title: mapped.title,
              description: mapped.description,
              severity: mapped.severity,
              likelihood: mapped.likelihood,
              sifPotential: mapped.sifPotential,
              sourceType: mapped.sourceType,
              sourceId: mapped.sourceId,
              status: 'draft',
            },
          });
          imported.push(key);
        }
      }
    }

    if (sources.includes('inspection')) {
      const defs = await this.prisma.pmInspectionDeficiency.findMany({
        where: { inspection: { projectId } },
        take: 50,
      });
      for (const d of defs) {
        const mapped = this.hazardImport.mapInspectionDeficiency({
          id: d.id,
          title: d.title,
          description: d.description,
          severity: d.severity,
        });
        const key = this.hazardImport.dedupeKey(mapped);
        if (seen.has(key)) continue;
        seen.add(key);
        await this.prisma.pmProjectHazard.create({
          data: {
            id: randomUUID(),
            companyId: project.companyId,
            projectId,
            profileId: profile.id,
            category: mapped.category,
            title: mapped.title,
            description: mapped.description,
            severity: mapped.severity,
            likelihood: mapped.likelihood,
            sifPotential: mapped.sifPotential,
            sourceType: mapped.sourceType,
            sourceId: mapped.sourceId,
            status: 'draft',
          },
        });
        imported.push(key);
      }
    }

    if (sources.includes('incident')) {
      const events = await this.prisma.pmSafetyEvent.findMany({
        where: { projectId },
        take: 30,
      });
      for (const e of events) {
        const mapped = this.hazardImport.mapIncident({
          id: e.id,
          title: e.title,
          description: e.description,
        });
        const key = this.hazardImport.dedupeKey(mapped);
        if (seen.has(key)) continue;
        seen.add(key);
        await this.prisma.pmProjectHazard.create({
          data: {
            id: randomUUID(),
            companyId: project.companyId,
            projectId,
            profileId: profile.id,
            category: mapped.category,
            title: mapped.title,
            description: mapped.description,
            severity: mapped.severity,
            likelihood: mapped.likelihood,
            sifPotential: mapped.sifPotential,
            sourceType: mapped.sourceType,
            sourceId: mapped.sourceId,
            status: 'draft',
          },
        });
        imported.push(key);
      }
    }

    if (sources.includes('equipment_failure')) {
      const failures = await this.prisma.pmEquipmentFailure.findMany({
        where: { projectId },
        take: 30,
      });
      for (const f of failures) {
        const mapped = this.hazardImport.mapEquipmentFailure({
          id: f.id,
          title: f.title,
          description: f.description,
          failureType: f.failureType,
        });
        const key = this.hazardImport.dedupeKey(mapped);
        if (seen.has(key)) continue;
        seen.add(key);
        await this.prisma.pmProjectHazard.create({
          data: {
            id: randomUUID(),
            companyId: project.companyId,
            projectId,
            profileId: profile.id,
            category: mapped.category,
            title: mapped.title,
            description: mapped.description,
            severity: mapped.severity,
            likelihood: mapped.likelihood,
            sifPotential: mapped.sifPotential,
            sourceType: mapped.sourceType,
            sourceId: mapped.sourceId,
            status: 'draft',
          },
        });
        imported.push(key);
      }
    }

    await this.audit(
      projectId,
      'hazard_import',
      String(projectId),
      'imported',
      profile.id,
      actorId,
      {
        count: imported.length,
        sources,
      },
    );
    return { importedCount: imported.length };
  }

  // ---------- Controls ----------

  async listControls(projectId: number) {
    return this.prisma.pmProjectControl.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { controlType: 'asc' },
    });
  }

  async createControl(
    projectId: number,
    data: {
      controlType: PmProjectControlType;
      title: string;
      description: string;
      ppeRequired?: boolean;
      hazardCategoryKeys?: string[];
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.getOrCreateProfile(projectId);

    const row = await this.prisma.pmProjectControl.create({
      data: {
        id: randomUUID(),
        companyId: project.companyId,
        projectId,
        profileId: profile.id,
        controlType: data.controlType,
        title: data.title,
        description: data.description,
        ppeRequired: data.ppeRequired ?? false,
        hazardCategoryKeys: (data.hazardCategoryKeys ??
          []) as Prisma.InputJsonValue,
        status: 'draft',
      },
    });
    await this.audit(
      projectId,
      'control',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async publishControl(controlId: string, actorId?: number) {
    const control = await this.prisma.pmProjectControl.findUnique({
      where: { id: controlId },
    });
    if (!control) throw new NotFoundException('Control not found');
    const transition = this.publishWorkflow.controlPublish(
      control.status,
      control.title,
      control.description,
    );
    if (!transition.allowed)
      throw new BadRequestException(transition.errors.join('; '));

    const updated = await this.prisma.pmProjectControl.update({
      where: { id: controlId },
      data: {
        status: 'published',
        version: control.version + 1,
        publishedAt: new Date(),
      },
    });
    await this.audit(
      control.projectId,
      'control',
      controlId,
      'published',
      control.profileId ?? undefined,
      actorId,
    );
    return updated;
  }

  async importControlsFromCompanyLibrary(projectId: number, actorId?: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.getOrCreateProfile(projectId);

    const entries = await this.prisma.controlLibraryEntry.findMany({
      where: {
        OR: [{ companyId: project.companyId, projectId: null }, { projectId }],
        active: true,
      },
      take: 100,
    });

    let count = 0;
    for (const e of entries) {
      const type =
        e.controlType === 'engineering'
          ? 'engineering'
          : e.controlType === 'ppe'
          ? 'ppe'
          : e.controlType === 'equipment'
          ? 'equipment'
          : 'administrative';
      await this.prisma.pmProjectControl.create({
        data: {
          id: randomUUID(),
          companyId: project.companyId,
          projectId,
          profileId: profile.id,
          controlType: type as PmProjectControlType,
          title: e.controlType,
          description: e.description,
          ppeRequired: e.ppeRequired,
          hazardCategoryKeys: e.hazardCategories as Prisma.InputJsonValue,
          status: 'draft',
        },
      });
      count++;
    }
    await this.audit(
      projectId,
      'control_import',
      String(projectId),
      'imported',
      profile.id,
      actorId,
      { count },
    );
    return { importedCount: count };
  }

  // ---------- Overrides ----------

  async createOverride(
    projectId: number,
    data: {
      ruleType: PmProjectSafetyOverrideRuleType;
      ruleKey: string;
      reason: string;
      overrideJson?: Record<string, unknown>;
      expiresAt?: string;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.getOrCreateProfile(projectId);

    const row = await this.prisma.pmProjectSafetyOverride.create({
      data: {
        id: randomUUID(),
        companyId: project.companyId,
        projectId,
        profileId: profile.id,
        ruleType: data.ruleType,
        ruleKey: data.ruleKey,
        reason: data.reason,
        overrideJson: (data.overrideJson ?? {}) as Prisma.InputJsonValue,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        approvedById: actorId,
      },
    });
    await this.audit(
      projectId,
      'override',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async listOverrides(projectId: number) {
    return this.prisma.pmProjectSafetyOverride.findMany({
      where: { projectId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async evaluateEnforcement(
    projectId: number,
    workerChecks: Record<string, boolean>,
    zoneCode?: string,
  ) {
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });
    const overrides = await this.prisma.pmProjectSafetyOverride.findMany({
      where: {
        projectId,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    return this.enforcement.evaluate({
      profilePublished: profile?.status === 'published',
      riskLevel: profile?.riskLevel ?? 'medium',
      enforcementRules:
        (profile?.enforcementRulesJson as Record<string, unknown>) ?? {},
      zoneCode,
      workerChecks,
      activeOverrides: overrides.map((o) => ({
        ruleType: o.ruleType,
        ruleKey: o.ruleKey,
      })),
    });
  }

  // ---------- Offline ----------

  async buildOfflineBundle(projectId: number) {
    const context = await this.getProjectContext(projectId);
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });
    const hazards = await this.listHazards(projectId, 'published');
    const controls = await this.listControls(projectId);
    const overrides = await this.listOverrides(projectId);
    const zoneRules = await this.prisma.siteAccessRule.findMany({
      where: { projectId, active: true },
    });

    const bundle = {
      context,
      profile,
      hazards,
      controls: controls.filter((c) => c.status === 'published'),
      overrides,
      zoneRules,
      syncedAt: new Date().toISOString(),
    };

    await this.prisma.pmProjectSafetyOfflineCache.upsert({
      where: {
        projectId_cacheKey: { projectId, cacheKey: 'full_context' },
      },
      create: {
        id: randomUUID(),
        projectId,
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

  /** Gate hook for site access / stations */
  async enforcementGate(
    projectId: number,
    workerChecks: Record<string, boolean>,
  ) {
    const result = await this.evaluateEnforcement(projectId, workerChecks);
    return {
      allowed: result.enforced,
      reasons: result.violations,
      waived: result.waivedByOverride,
    };
  }

  mapWorkflowState(projectId: number, profile?: { status: string } | null) {
    const status = (profile?.status ??
      'draft') as import('@prisma/client').PmProjectSafetyPublishStatus;
    return this.publishWorkflow.mapWorkflowState(
      status,
      status === 'published',
      status === 'published',
    );
  }

  async validatePublishReadiness(projectId: number) {
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });
    const publishedHazards = await this.prisma.pmProjectHazard.findMany({
      where: { projectId, status: 'published', deletedAt: null },
      select: { id: true, requiredControlIds: true },
    });
    const hazardsWithoutControls = publishedHazards.filter((h) => {
      const ids = h.requiredControlIds as unknown;
      return !Array.isArray(ids) || ids.length === 0;
    }).length;

    const zoneRules = Array.isArray(profile?.zoneRulesJson)
      ? (profile.zoneRulesJson as unknown[]).length
      : await this.prisma.siteAccessRule.count({
          where: { projectId, active: true },
        });

    const equipmentRules =
      (profile?.equipmentRulesJson as Record<string, unknown>) ?? {};
    const trainingRules =
      (profile?.trainingRulesJson as Record<string, unknown>) ?? {};
    const emergencyRules =
      (profile?.emergencyRulesJson as Record<string, unknown>) ?? {};

    return this.publishWorkflow.validatePublishReadiness({
      publishedHazardCount: publishedHazards.length,
      hazardsWithoutControls,
      zoneRuleCount: zoneRules,
      equipmentRuleKeys: Object.keys(equipmentRules).length,
      trainingRuleKeys: Object.keys(trainingRules).length,
      emergencyRuleKeys: Object.keys(emergencyRules).length,
    });
  }

  // ---------- Spec rule bundles (JSON on profile + zone sync) ----------

  async upsertZoneRules(
    projectId: number,
    zones: Array<Record<string, unknown>>,
    actorId?: number,
  ) {
    await this.updateProfile(projectId, { zoneRulesJson: zones }, actorId);
    await this.syncZoneRulesFromProfile(projectId, zones, actorId);
    const profile = await this.getOrCreateProfile(projectId);
    return { projectId, zoneRulesJson: profile.zoneRulesJson, synced: true };
  }

  async upsertEquipmentRules(
    projectId: number,
    equipmentRules: Record<string, unknown>,
    actorId?: number,
  ) {
    return this.updateProfile(
      projectId,
      { equipmentRulesJson: equipmentRules },
      actorId,
    );
  }

  async upsertTrainingRequirements(
    projectId: number,
    trainingRules: Record<string, unknown>,
    actorId?: number,
  ) {
    return this.updateProfile(
      projectId,
      { trainingRulesJson: trainingRules },
      actorId,
    );
  }

  async upsertEmergencyRequirements(
    projectId: number,
    emergencyRules: Record<string, unknown>,
    actorId?: number,
  ) {
    return this.updateProfile(
      projectId,
      { emergencyRulesJson: emergencyRules },
      actorId,
    );
  }

  // ---------- Score & analytics ----------

  async getProjectSafetyScore(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const score = await this.cail.generateProjectSafetyScore(projectId);
    const forecast = await this.cail.hazardForecast(projectId);
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });

    await this.prisma.projectSafetyRiskSnapshot.create({
      data: {
        projectId,
        predictedLevel: score.band,
        score: score.score,
        precursors: score.weakControls as Prisma.InputJsonValue,
        interventions: forecast.map((f) => ({
          type: 'hazard_forecast',
          message: f.title,
          urgency: f.confidence > 0.7 ? 'high' : 'medium',
        })) as Prisma.InputJsonValue,
        companyHotspots: [] as Prisma.InputJsonValue,
        engine: 'pm_project_safety_context',
      },
    });

    return {
      projectId,
      ...score,
      workflowState: this.mapWorkflowState(projectId, profile),
      hazardForecast: forecast,
    };
  }

  async analytics(projectId: number) {
    const since90 = new Date(Date.now() - 90 * 86400000);
    const [profile, hazardTrend, controlTrend, zoneRules, scoreNow] =
      await Promise.all([
        this.getOrCreateProfile(projectId),
        this.prisma.pmProjectHazard.groupBy({
          by: ['status'],
          where: { projectId, deletedAt: null },
          _count: true,
        }),
        this.prisma.pmProjectControl.groupBy({
          by: ['status'],
          where: { projectId, deletedAt: null },
          _count: true,
        }),
        this.prisma.siteAccessRule.findMany({
          where: { projectId, active: true },
        }),
        this.cail.generateProjectSafetyScore(projectId),
      ]);

    const snapshots = await this.prisma.projectSafetyRiskSnapshot.findMany({
      where: { projectId, computedAt: { gte: since90 } },
      orderBy: { computedAt: 'asc' },
      take: 30,
    });

    const trainingCodes = Array.isArray(profile.requiredTraining)
      ? (profile.requiredTraining as string[])
      : [];

    return {
      projectId,
      scoreTrend: snapshots.map((s) => ({
        score: s.score,
        band: s.predictedLevel,
        at: s.computedAt.toISOString(),
      })),
      currentScore: scoreNow.score,
      hazardTrend: hazardTrend.map((h) => ({
        status: h.status,
        count: h._count,
      })),
      controlTrend: controlTrend.map((c) => ({
        status: c.status,
        count: c._count,
      })),
      zoneCompliance: {
        zones: zoneRules.length,
        highRiskZones: zoneRules.filter((z) => z.highRisk).length,
      },
      equipmentCompliance: {
        ruleCount: Object.keys(
          (profile.equipmentRulesJson as Record<string, unknown>) ?? {},
        ).length,
      },
      trainingCompliance: {
        requiredCourses: trainingCodes.length,
        rolesDefined: Object.keys(
          (profile.trainingRulesJson as Record<string, unknown>) ?? {},
        ).length,
      },
      leadingIndicators: {
        profilePublished: profile.status === 'published',
        draftHazardBacklog:
          hazardTrend.find((h) => h.status === 'draft')?._count ?? 0,
        weakControlFlags: scoreNow.weakControls.length,
        predictedRisk: scoreNow.predictedRisk,
      },
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      profile?: Record<string, unknown>;
      hazards?: Array<Record<string, unknown>>;
      controls?: Array<Record<string, unknown>>;
      overrides?: Array<Record<string, unknown>>;
      zoneRules?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    let applied = 0;

    if (payload.profile) {
      await this.updateProfile(
        projectId,
        payload.profile as Parameters<
          PmProjectSafetyContextService['updateProfile']
        >[1],
        actorId,
      );
      applied++;
    }

    if (payload.zoneRules?.length) {
      await this.upsertZoneRules(projectId, payload.zoneRules, actorId);
      applied += payload.zoneRules.length;
    }

    for (const h of payload.hazards ?? []) {
      const existingId = h.id as string | undefined;
      if (existingId) {
        await this.prisma.pmProjectHazard.updateMany({
          where: { id: existingId, projectId },
          data: {
            title: (h.title as string) ?? undefined,
            description: (h.description as string) ?? undefined,
            severity: (h.severity as number) ?? undefined,
            likelihood: (h.likelihood as number) ?? undefined,
          },
        });
      } else if (h.title && h.description && h.category) {
        await this.createHazard(
          projectId,
          h as Parameters<PmProjectSafetyContextService['createHazard']>[1],
          actorId,
        );
      }
      applied++;
    }

    for (const c of payload.controls ?? []) {
      const existingId = c.id as string | undefined;
      if (existingId) {
        await this.prisma.pmProjectControl.updateMany({
          where: { id: existingId, projectId },
          data: {
            title: (c.title as string) ?? undefined,
            description: (c.description as string) ?? undefined,
          },
        });
      } else if (c.title && c.description && c.controlType) {
        await this.createControl(
          projectId,
          c as Parameters<PmProjectSafetyContextService['createControl']>[1],
          actorId,
        );
      }
      applied++;
    }

    for (const o of payload.overrides ?? []) {
      if (!o.ruleType || !o.ruleKey || !o.reason) continue;
      await this.createOverride(
        projectId,
        o as Parameters<PmProjectSafetyContextService['createOverride']>[1],
        actorId,
      );
      applied++;
    }

    const bundle = await this.buildOfflineBundle(projectId);
    await this.audit(
      projectId,
      'offline_sync',
      String(projectId),
      'applied',
      undefined,
      actorId,
      {
        applied,
      },
    );
    return { ok: true, applied, serverState: bundle };
  }
}
