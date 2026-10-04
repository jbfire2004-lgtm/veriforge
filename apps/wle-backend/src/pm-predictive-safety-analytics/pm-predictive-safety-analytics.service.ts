import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PredictiveFeatureExtractionService } from './feature-extraction.service';
import { PredictiveMlPipelineService } from './ml-pipeline.service';
import { PredictiveAlertsService } from './predictive-alerts.service';
import {
  RiskScoringModelEngine,
  MODEL_KEY,
  MODEL_VERSION,
} from './engines/risk-scoring-model.engine';
import { WeeklyForecastEngine } from './engines/weekly-forecast.engine';
import type {
  EntityRiskScore,
  PredictiveAnalyticsBundle,
  PreventiveAction,
} from './types/predictive-analytics.types';

@Injectable()
export class PmPredictiveSafetyAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly features: PredictiveFeatureExtractionService,
    private readonly mlPipeline: PredictiveMlPipelineService,
    private readonly alerts: PredictiveAlertsService,
    private readonly riskModel: RiskScoringModelEngine,
    private readonly forecastEngine: WeeklyForecastEngine,
  ) {}

  async runPipeline(
    companyId: number,
    projectId?: number,
    options?: { notify?: boolean },
  ) {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const ingest = await this.mlPipeline.ingest(companyId, projectId);

    const [workers, contractors, tasks, locations, project, priorForecast] =
      await Promise.all([
        this.scoreWorkers(companyId, projectId, since),
        this.scoreContractors(companyId, projectId, since),
        this.scoreTasks(companyId, projectId, since),
        this.scoreLocations(companyId, projectId, since),
        projectId
          ? this.prisma.project.findUnique({
              where: { id: projectId },
              select: { name: true },
            })
          : null,
        this.getPriorWeekForecast(companyId, projectId),
      ]);

    const highRiskWorkers = workers.filter(
      (w) => w.riskLevel === 'high' || w.riskLevel === 'critical',
    );
    const highRiskContractors = contractors.filter(
      (c) => c.riskLevel === 'high' || c.riskLevel === 'critical',
    );
    const highRiskTasks = tasks.filter(
      (t) => t.riskLevel === 'high' || t.riskLevel === 'critical',
    );
    const highRiskLocations = locations.filter(
      (l) => l.riskLevel === 'high' || l.riskLevel === 'critical',
    );

    const allEntities = [...workers, ...contractors, ...tasks, ...locations];
    const baseRiskIndex = this.riskModel.aggregateProjectRisk(allEntities);
    const trendSlope = priorForecast
      ? (baseRiskIndex - priorForecast.riskIndex) / 100
      : 0;

    const drivers = this.topDrivers(allEntities);
    const weeklyForecast = this.forecastEngine.build({
      baseRiskIndex,
      trendSlope,
      drivers,
    });

    const preventiveActions = this.buildPreventiveActions({
      highRiskWorkers,
      highRiskContractors,
      highRiskTasks,
      highRiskLocations,
    });

    await this.mlPipeline.persistIntelOutputs(
      companyId,
      projectId,
      { workers, contractors, tasks, locations },
      preventiveActions,
    );

    const weekStart = new Date(weeklyForecast.weekStart);
    const forecastRecord = await this.prisma.pmPredictiveSafetyForecast.upsert({
      where: {
        companyId_projectId_weekStart: {
          companyId,
          projectId: projectId ?? null,
          weekStart,
        },
      },
      create: {
        companyId,
        projectId,
        weekStart,
        riskIndex: weeklyForecast.overallRiskIndex,
        riskLevel: weeklyForecast.overallRiskLevel,
        forecastJson: weeklyForecast as unknown as Prisma.InputJsonValue,
        alertsJson: [] as Prisma.InputJsonValue,
        modelKey: MODEL_KEY,
        modelVersion: MODEL_VERSION,
      },
      update: {
        riskIndex: weeklyForecast.overallRiskIndex,
        riskLevel: weeklyForecast.overallRiskLevel,
        forecastJson: weeklyForecast as unknown as Prisma.InputJsonValue,
        modelKey: MODEL_KEY,
        modelVersion: MODEL_VERSION,
      },
    });

    let alertsSent = 0;
    if (options?.notify !== false) {
      const alertResult = await this.alerts.dispatchWeeklyAlerts({
        companyId,
        projectId,
        projectName: project?.name,
        forecast: weeklyForecast,
        highRiskWorkers,
        highRiskContractors,
        preventiveActions,
      });
      alertsSent = alertResult.sent;
    }

    return this.buildBundle({
      companyId,
      projectId,
      ingest,
      highRiskWorkers,
      highRiskContractors,
      highRiskTasks,
      highRiskLocations,
      weeklyForecast,
      preventiveActions,
      alertsSent,
    });
  }

  async getBundle(
    companyId: number,
    projectId?: number,
  ): Promise<PredictiveAnalyticsBundle> {
    const weekStart = this.startOfWeek(new Date());
    const forecast = await this.prisma.pmPredictiveSafetyForecast.findFirst({
      where: { companyId, projectId: projectId ?? null, weekStart },
      orderBy: { createdAt: 'desc' },
    });

    if (!forecast) {
      return this.runPipeline(companyId, projectId, { notify: false });
    }

    const json = forecast.forecastJson as Record<string, unknown>;
    const workers = await this.scoreWorkers(
      companyId,
      projectId,
      this.since90(),
    );
    const contractors = await this.scoreContractors(
      companyId,
      projectId,
      this.since90(),
    );
    const tasks = await this.scoreTasks(companyId, projectId, this.since90());
    const locations = await this.scoreLocations(
      companyId,
      projectId,
      this.since90(),
    );

    return this.buildBundle({
      companyId,
      projectId,
      ingest: { recordsIngested: 0, modules: [], windowDays: 90 },
      highRiskWorkers: workers.filter(
        (w) => w.riskLevel === 'high' || w.riskLevel === 'critical',
      ),
      highRiskContractors: contractors.filter(
        (c) => c.riskLevel === 'high' || c.riskLevel === 'critical',
      ),
      highRiskTasks: tasks.filter(
        (t) => t.riskLevel === 'high' || t.riskLevel === 'critical',
      ),
      highRiskLocations: locations.filter(
        (l) => l.riskLevel === 'high' || l.riskLevel === 'critical',
      ),
      weeklyForecast: json as PredictiveAnalyticsBundle['weeklyForecast'],
      preventiveActions: this.buildPreventiveActions({
        highRiskWorkers: workers,
        highRiskContractors: contractors,
        highRiskTasks: tasks,
        highRiskLocations: locations,
      }),
      alertsSent: 0,
    });
  }

  async listForecasts(companyId: number, projectId?: number, limit = 12) {
    return this.prisma.pmPredictiveSafetyForecast.findMany({
      where: { companyId, ...(projectId ? { projectId } : {}) },
      orderBy: { weekStart: 'desc' },
      take: limit,
    });
  }

  private async scoreWorkers(
    companyId: number,
    projectId: number | undefined,
    since: Date,
  ): Promise<EntityRiskScore[]> {
    const workers = await this.prisma.worker.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        pmWorkerSafetyProfile: true,
        pmWorkerMedicalRestrictions: { where: { active: true } },
      },
      take: 200,
    });

    const scores: EntityRiskScore[] = [];
    for (const w of workers) {
      const [overdueCapa, incidents90d, trainingGaps, denials] =
        await Promise.all([
          this.prisma.pmCorrectiveAction.count({
            where: {
              companyId,
              deletedAt: null,
              status: { notIn: ['closed', 'verified'] },
              dueAt: { lt: new Date() },
              ...(projectId ? { projectId } : {}),
            },
          }),
          this.prisma.pmSafetyEvent.count({
            where: {
              companyId,
              deletedAt: null,
              occurredAt: { gte: since },
              people: { some: { workerId: w.id } },
            },
          }),
          this.prisma.pmWorkerSafetyTraining.count({
            where: {
              workerId: w.id,
              OR: [
                { status: { not: 'valid' } },
                { expiresAt: { lt: new Date() } },
              ],
            },
          }),
          this.prisma.pmAccessAttempt.count({
            where: {
              workerId: w.id,
              decision: { not: 'granted' },
              createdAt: { gte: since },
            },
          }),
        ]);

      scores.push(
        this.riskModel.scoreWorker({
          workerId: w.id,
          name: `${w.firstName} ${w.lastName}`,
          profileScore: w.pmWorkerSafetyProfile?.safetyScore ?? 75,
          overdueCapa,
          incidents90d,
          trainingGaps,
          accessDenials30d: denials,
          openMedicalBlocks: w.pmWorkerMedicalRestrictions.length,
        }),
      );
    }

    return scores.sort((a, b) => b.riskScore - a.riskScore);
  }

  private async scoreContractors(
    companyId: number,
    projectId: number | undefined,
    since: Date,
  ): Promise<EntityRiskScore[]> {
    if (!projectId) return [];

    const deficiencies = await this.prisma.pmInspectionDeficiency.groupBy({
      by: ['subcontractorCompanyId'],
      where: {
        subcontractorCompanyId: { not: null },
        createdAt: { gte: since },
        inspection: { projectId, companyId },
      },
      _count: true,
    });

    const dispatches =
      await this.prisma.pmInspectionContractorDispatch.findMany({
        where: { correctiveAction: { projectId, companyId } },
        include: { subcontractorCompany: { select: { id: true, name: true } } },
      });

    const byCompany = new Map<
      number,
      {
        name: string;
        deficiencies: number;
        overdue: number;
        total: number;
        completed: number;
      }
    >();

    for (const d of deficiencies) {
      if (!d.subcontractorCompanyId) continue;
      const entry = byCompany.get(d.subcontractorCompanyId) ?? {
        name: '',
        deficiencies: 0,
        overdue: 0,
        total: 0,
        completed: 0,
      };
      entry.deficiencies = d._count;
      byCompany.set(d.subcontractorCompanyId, entry);
    }

    for (const disp of dispatches) {
      const cid = disp.subcontractorCompanyId;
      const entry = byCompany.get(cid) ?? {
        name: disp.subcontractorCompany.name,
        deficiencies: 0,
        overdue: 0,
        total: 0,
        completed: 0,
      };
      entry.name = disp.subcontractorCompany.name;
      entry.total += 1;
      if (disp.status === 'overdue') entry.overdue += 1;
      if (disp.status === 'completed') entry.completed += 1;
      byCompany.set(cid, entry);
    }

    const scores: EntityRiskScore[] = [];
    for (const [companyIdSub, data] of byCompany) {
      const openCapa = await this.prisma.pmCorrectiveAction.count({
        where: {
          subcontractorCompanyId: companyIdSub,
          projectId,
          status: { notIn: ['closed', 'verified'] },
        },
      });
      const photoFindingsHigh =
        await this.prisma.pmInspectionPhotoFinding.count({
          where: {
            severity: { in: ['high', 'critical'] },
            inspection: {
              projectId,
              deficiencies: { some: { subcontractorCompanyId: companyIdSub } },
            },
          },
        });
      const [sclLossCount, hecaFindings, highEnergyFindings] =
        await Promise.all([
          this.prisma.pmInspectionPhotoFinding.count({
            where: {
              sclState: 'loss',
              inspection: {
                projectId,
                deficiencies: {
                  some: { subcontractorCompanyId: companyIdSub },
                },
              },
            },
          }),
          this.prisma.pmInspectionPhotoFinding.count({
            where: {
              hecaInvolved: true,
              inspection: {
                projectId,
                deficiencies: {
                  some: { subcontractorCompanyId: companyIdSub },
                },
              },
            },
          }),
          this.prisma.pmInspectionPhotoFinding.count({
            where: {
              highEnergyFlag: true,
              inspection: {
                projectId,
                deficiencies: {
                  some: { subcontractorCompanyId: companyIdSub },
                },
              },
            },
          }),
        ]);

      scores.push(
        this.riskModel.scoreContractor({
          companyId: companyIdSub,
          name: data.name,
          deficiencies90d: data.deficiencies,
          overdueDispatches: data.overdue,
          openCapa,
          photoFindingsHigh,
          completionRate: data.total
            ? Math.round((data.completed / data.total) * 100)
            : 100,
          sclLossCount,
          hecaFindings,
          highEnergyFindings,
        }),
      );
    }

    return scores.sort((a, b) => b.riskScore - a.riskScore);
  }

  private async scoreTasks(
    companyId: number,
    projectId: number | undefined,
    _since: Date,
  ): Promise<EntityRiskScore[]> {
    const jhas = await this.prisma.jhaFlha.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
      },
      select: {
        id: true,
        taskDescription: true,
        riskScore: true,
        sifPotential: true,
        updatedAt: true,
        _count: { select: { hazards: true, signatures: true } },
      },
      orderBy: { riskScore: 'desc' },
      take: 100,
    });

    return jhas.map((j) => {
      const daysSince = Math.floor(
        (Date.now() - j.updatedAt.getTime()) / (24 * 60 * 60 * 1000),
      );
      return this.riskModel.scoreTask({
        jhaId: j.id,
        title: j.taskDescription.slice(0, 80) || 'JHA/FLHA',
        riskScore: j.riskScore ?? 50,
        hazardCount: j._count.hazards,
        unsignedCrew: Math.max(0, 3 - j._count.signatures),
        daysSinceUpdate: daysSince,
        sifPotential: j.sifPotential ?? false,
      });
    });
  }

  private async scoreLocations(
    companyId: number,
    projectId: number | undefined,
    since: Date,
  ): Promise<EntityRiskScore[]> {
    const siteIds = new Set<number>();
    if (projectId) {
      const proj = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { siteId: true },
      });
      if (proj?.siteId) siteIds.add(proj.siteId);
      const inspSites = await this.prisma.pmInspection.findMany({
        where: { projectId, siteId: { not: null } },
        select: { siteId: true },
        distinct: ['siteId'],
      });
      for (const i of inspSites) if (i.siteId) siteIds.add(i.siteId);
    }

    const sites =
      siteIds.size > 0
        ? await this.prisma.site.findMany({
            where: { id: { in: [...siteIds] } },
            select: { id: true, name: true },
          })
        : [];

    const scores: EntityRiskScore[] = [];
    for (const site of sites) {
      const [incidents90d, deficiencies90d, accessDenials] = await Promise.all([
        this.prisma.pmSafetyEvent.count({
          where: {
            companyId,
            siteId: site.id,
            occurredAt: { gte: since },
            deletedAt: null,
          },
        }),
        this.prisma.pmInspectionDeficiency.count({
          where: {
            createdAt: { gte: since },
            inspection: { siteId: site.id, projectId },
          },
        }),
        projectId
          ? this.prisma.pmAccessAttempt.count({
              where: {
                projectId,
                decision: { not: 'granted' },
                createdAt: { gte: since },
              },
            })
          : Promise.resolve(0),
      ]);

      scores.push(
        this.riskModel.scoreLocation({
          siteId: site.id,
          name: site.name,
          incidents90d,
          deficiencies90d,
          openHazards: deficiencies90d,
          accessDenials30d: accessDenials,
        }),
      );
    }

    return scores.sort((a, b) => b.riskScore - a.riskScore);
  }

  private buildPreventiveActions(input: {
    highRiskWorkers: EntityRiskScore[];
    highRiskContractors: EntityRiskScore[];
    highRiskTasks: EntityRiskScore[];
    highRiskLocations: EntityRiskScore[];
  }): PreventiveAction[] {
    const actions: PreventiveAction[] = [];
    let n = 0;

    for (const w of input.highRiskWorkers.slice(0, 5)) {
      actions.push({
        id: `pa-worker-${++n}`,
        priority: w.riskLevel === 'critical' ? 'critical' : 'high',
        category: 'training',
        title: `Safety coaching for ${w.label}`,
        description: `Worker risk score ${
          w.riskScore
        }. Address: ${w.factors.join(', ')}.`,
        targetEntity: { type: 'worker', id: w.entityId, label: w.label },
        evidence: w.factors,
        confidence: w.probability,
      });
    }

    for (const c of input.highRiskContractors.slice(0, 3)) {
      actions.push({
        id: `pa-contractor-${++n}`,
        priority: 'high',
        category: 'contractor',
        title: `Contractor performance review: ${c.label}`,
        description: `Elevated subcontractor risk. Schedule targeted inspection and CAPA verification.`,
        targetEntity: { type: 'contractor', id: c.entityId, label: c.label },
        evidence: c.factors,
        confidence: c.probability,
      });
    }

    for (const t of input.highRiskTasks.slice(0, 3)) {
      actions.push({
        id: `pa-task-${++n}`,
        priority: t.riskLevel === 'critical' ? 'critical' : 'medium',
        category: 'control',
        title: `Re-assess JHA: ${t.label}`,
        description: `High-risk task identified. Update controls and obtain crew sign-off.`,
        targetEntity: { type: 'task', id: t.entityId, label: t.label },
        evidence: t.factors,
        confidence: t.probability,
      });
    }

    for (const l of input.highRiskLocations.slice(0, 3)) {
      actions.push({
        id: `pa-location-${++n}`,
        priority: 'high',
        category: 'inspection',
        title: `Increase inspections at ${l.label}`,
        description: `Location risk elevated. Deploy additional walk-through and hazard controls.`,
        targetEntity: { type: 'location', id: l.entityId, label: l.label },
        evidence: l.factors,
        confidence: l.probability,
      });
    }

    return actions.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  }

  private topDrivers(entities: EntityRiskScore[]): string[] {
    const factorCounts = new Map<string, number>();
    for (const e of entities.filter((x) => x.riskScore >= 55)) {
      for (const f of e.factors) {
        factorCounts.set(f, (factorCounts.get(f) ?? 0) + 1);
      }
    }
    return [...factorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([f]) => f.replace(/_/g, ' '));
  }

  private buildBundle(input: {
    companyId: number;
    projectId?: number;
    ingest: { recordsIngested: number; modules: string[]; windowDays?: number };
    highRiskWorkers: EntityRiskScore[];
    highRiskContractors: EntityRiskScore[];
    highRiskTasks: EntityRiskScore[];
    highRiskLocations: EntityRiskScore[];
    weeklyForecast: PredictiveAnalyticsBundle['weeklyForecast'];
    preventiveActions: PreventiveAction[];
    alertsSent: number;
  }): PredictiveAnalyticsBundle {
    return {
      generatedAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      modelKey: MODEL_KEY,
      modelVersion: MODEL_VERSION,
      summary: {
        overallRiskIndex: input.weeklyForecast.overallRiskIndex,
        overallRiskLevel: input.weeklyForecast.overallRiskLevel,
        highRiskWorkers: input.highRiskWorkers.length,
        highRiskContractors: input.highRiskContractors.length,
        highRiskTasks: input.highRiskTasks.length,
        highRiskLocations: input.highRiskLocations.length,
        openAlerts: input.alertsSent,
      },
      highRiskWorkers: input.highRiskWorkers.slice(0, 15),
      highRiskContractors: input.highRiskContractors.slice(0, 10),
      highRiskTasks: input.highRiskTasks.slice(0, 10),
      highRiskLocations: input.highRiskLocations.slice(0, 10),
      weeklyForecast: input.weeklyForecast,
      preventiveActions: input.preventiveActions,
      dataQuality: {
        recordsIngested: input.ingest.recordsIngested,
        modules: input.ingest.modules,
        windowDays: input.ingest.windowDays ?? 90,
      },
    };
  }

  private async getPriorWeekForecast(companyId: number, projectId?: number) {
    const prior = new Date(this.startOfWeek(new Date()));
    prior.setDate(prior.getDate() - 7);
    return this.prisma.pmPredictiveSafetyForecast.findFirst({
      where: { companyId, projectId: projectId ?? null, weekStart: prior },
    });
  }

  private startOfWeek(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private since90(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
  }
}
