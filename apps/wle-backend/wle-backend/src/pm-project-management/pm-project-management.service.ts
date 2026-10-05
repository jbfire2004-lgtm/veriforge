import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmPermitStatus,
  PmPermitType,
  PmPmTaskStatus,
  PmWorkPackageStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PmProjectSafetyContextService } from '../pm-project-safety-context/pm-project-safety-context.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { PmWorkerSafetyProfileService } from '../pm-worker-safety-profile/pm-worker-safety-profile.service';
import { PmEquipmentSafetyService } from '../pm-equipment-safety/pm-equipment-safety.service';
import { PmProjectManagementCailIntelligenceService } from './pm-project-management-cail-intelligence.service';
import { SafetyGatingEngine } from './safety-gating.engine';
import { SchedulingEngine } from './scheduling.engine';
import { WorkPackageEngine } from './work-package.engine';
import { PmUnifiedCorrectiveActionService } from '../pm-unified-corrective-action/pm-unified-corrective-action.service';

@Injectable()
export class PmProjectManagementService {
  private readonly safetyGating = new SafetyGatingEngine();
  private readonly scheduling = new SchedulingEngine();
  private readonly workPackageEngine = new WorkPackageEngine();
  private readonly taskWorkflow = 'vera-core.pm.task';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmProjectManagementCailIntelligenceService,
    @Optional() private readonly projectSafety?: PmProjectSafetyContextService,
    @Optional() private readonly companySafety?: PmCompanySafetyContextService,
    @Optional() private readonly workerSafety?: PmWorkerSafetyProfileService,
    @Optional() private readonly equipmentSafety?: PmEquipmentSafetyService,
    @Optional() private readonly unifiedCapa?: PmUnifiedCorrectiveActionService,
  ) {}

  private toTaskOutput<T extends Record<string, unknown>>(task: T) {
    const t = task as T & {
      updatedAt?: Date | null;
      actualEnd?: Date | null;
      actualStart?: Date | null;
      createdAt?: Date | null;
    };
    const ts =
      t.updatedAt ?? t.actualEnd ?? t.actualStart ?? t.createdAt ?? new Date();
    return {
      ...task,
      workflow: this.taskWorkflow,
      workflowTimestamp: ts.toISOString(),
    };
  }

  private async audit(
    projectId: number | null,
    entityType: string,
    entityId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmPmAuditLog.create({
      data: {
        id: randomUUID(),
        projectId: projectId ?? undefined,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private async assertProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { company: { select: { id: true, name: true } }, site: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async isEmergencyLocked(projectId: number): Promise<boolean> {
    const lock = await this.prisma.pmSiteEmergencyLock.findFirst({
      where: { projectId, active: true },
      orderBy: { lockedAt: 'desc' },
    });
    return !!lock;
  }

  // ---------- Project setup ----------

  mapValidationStatus(
    status: string,
    blockedReason: string | null,
  ): { validationStatus: string; validationReason: string | null } {
    if (status === 'blocked') {
      return { validationStatus: 'failed', validationReason: blockedReason };
    }
    if (status === 'active' || status === 'completed') {
      return { validationStatus: 'passed', validationReason: null };
    }
    return { validationStatus: 'pending', validationReason: blockedReason };
  }

  async createProject(
    body: {
      companyId: number;
      name: string;
      code?: string;
      siteId?: number;
      projectType?: string;
      scopeOfWorkJson?: Record<string, unknown>;
      startDate?: string;
      endDate?: string;
      autoConfigure?: boolean;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.create({
      data: {
        companyId: body.companyId,
        name: body.name,
        code: body.code,
        siteId: body.siteId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    await this.prisma.pmProjectConfig.create({
      data: {
        id: randomUUID(),
        projectId: project.id,
        projectType: body.projectType,
        scopeOfWorkJson: (body.scopeOfWorkJson ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.audit(
      project.id,
      'project',
      String(project.id),
      'created',
      actorId,
      {
        name: body.name,
      },
    );

    if (body.autoConfigure !== false && this.projectSafety) {
      await this.configureProject(
        project.id,
        {
          projectType: body.projectType,
          scopeOfWorkJson: body.scopeOfWorkJson,
        },
        actorId,
      );
    }

    return this.getProjectDashboard(project.id);
  }

  async getProjectDashboard(projectId: number) {
    const project = await this.assertProject(projectId);
    const config = await this.prisma.pmProjectConfig.findUnique({
      where: { projectId },
    });
    const [
      workPackageCount,
      taskCount,
      blockedTasks,
      openPermits,
      scheduleConflicts,
      workerAssignments,
      equipmentAssignments,
    ] = await Promise.all([
      this.prisma.pmWorkPackage.count({
        where: { projectId, deletedAt: null },
      }),
      this.prisma.pmPmTask.count({ where: { projectId, deletedAt: null } }),
      this.prisma.pmPmTask.count({
        where: { projectId, status: 'blocked', deletedAt: null },
      }),
      this.prisma.pmPermit.count({
        where: {
          projectId,
          status: { in: ['draft', 'pending_approval', 'approved', 'active'] },
        },
      }),
      this.prisma.pmProjectSchedule.count({
        where: { projectId, conflictFlag: true },
      }),
      this.prisma.pmPmWorkerAssignment.count({ where: { projectId } }),
      this.prisma.pmPmEquipmentAssignment.count({ where: { projectId } }),
    ]);

    const scores = await this.prisma.pmWorkerSafetyProfile.findMany({
      where: {
        worker: {
          projectAssignments: { some: { projectId, status: 'ACTIVE' } },
        },
      },
      select: { safetyScore: true },
    });
    const avgWorkerScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((s, r) => s + r.safetyScore, 0) / scores.length,
          )
        : 100;

    const forecast = this.cail.projectSafetyForecast(projectId, {
      blockedTaskCount: blockedTasks,
      openPermitCount: openPermits,
      avgWorkerScore,
      scheduleConflictCount: scheduleConflicts,
    });
    const insights = await this.cail.projectInsights(projectId);

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        companyId: project.companyId,
        companyName: project.company.name,
        siteId: project.siteId,
        status: project.status,
      },
      config,
      metrics: {
        workPackageCount,
        taskCount,
        blockedTasks,
        openPermits,
        scheduleConflicts,
        workerAssignments,
        equipmentAssignments,
        progressPct: config?.progressPct ?? 0,
        safetyScore: config?.safetyScore ?? forecast.forecastScore,
      },
      cail: { forecast, insights },
    };
  }

  async configureProject(
    projectId: number,
    data: {
      projectType?: string;
      scopeOfWorkJson?: Record<string, unknown>;
      locationsJson?: unknown[];
      zonesJson?: unknown[];
      scheduleJson?: Record<string, unknown>;
      subcontractorIds?: number[];
      projectManagerId?: number;
      supervisorIds?: number[];
      workerIds?: number[];
      equipmentIds?: number[];
    },
    actorId?: number,
  ) {
    const project = await this.assertProject(projectId);

    const config = await this.prisma.pmProjectConfig.upsert({
      where: { projectId },
      create: {
        id: randomUUID(),
        projectId,
        projectType: data.projectType,
        scopeOfWorkJson: (data.scopeOfWorkJson ?? {}) as Prisma.InputJsonValue,
        locationsJson: (data.locationsJson ?? []) as Prisma.InputJsonValue,
        zonesJson: (data.zonesJson ?? []) as Prisma.InputJsonValue,
        scheduleJson: (data.scheduleJson ?? {}) as Prisma.InputJsonValue,
        subcontractorIds: (data.subcontractorIds ??
          []) as Prisma.InputJsonValue,
        projectManagerId: data.projectManagerId,
        metadataJson: {
          supervisorIds: data.supervisorIds ?? [],
        } as Prisma.InputJsonValue,
      },
      update: {
        projectType: data.projectType,
        scopeOfWorkJson: data.scopeOfWorkJson as
          | Prisma.InputJsonValue
          | undefined,
        locationsJson: data.locationsJson as Prisma.InputJsonValue | undefined,
        zonesJson: data.zonesJson as Prisma.InputJsonValue | undefined,
        scheduleJson: data.scheduleJson as Prisma.InputJsonValue | undefined,
        subcontractorIds: data.subcontractorIds as
          | Prisma.InputJsonValue
          | undefined,
        projectManagerId: data.projectManagerId,
        metadataJson: {
          supervisorIds: data.supervisorIds ?? [],
        } as Prisma.InputJsonValue,
      },
    });

    if (data.workerIds?.length) {
      for (const workerId of data.workerIds) {
        const existing = await this.prisma.projectAssignment.findFirst({
          where: { workerId, projectId },
        });
        if (existing) {
          await this.prisma.projectAssignment.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', assignedBy: actorId, endedAt: null },
          });
        } else {
          await this.prisma.projectAssignment.create({
            data: {
              workerId,
              projectId,
              companyId: project.companyId,
              assignedBy: actorId,
              status: 'ACTIVE',
            },
          });
        }
      }
    }

    if (data.equipmentIds?.length) {
      for (const equipmentId of data.equipmentIds) {
        const eq = await this.prisma.equipment.findUnique({
          where: { id: equipmentId },
        });
        if (!eq) continue;
        const existing = await this.prisma.equipmentProjectAssignment.findFirst(
          {
            where: { equipmentId, projectId },
          },
        );
        if (existing) {
          await this.prisma.equipmentProjectAssignment.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', assignedBy: actorId, endedAt: null },
          });
        } else {
          await this.prisma.equipmentProjectAssignment.create({
            data: {
              equipmentId,
              projectId,
              companyId: project.companyId,
              assignedBy: actorId,
              status: 'ACTIVE',
            },
          });
        }
      }
    }

    if (this.projectSafety) {
      await this.projectSafety.autoGenerateProfile(projectId, actorId);
      await this.projectSafety.publishProfile(projectId, actorId);
      if (this.companySafety) {
        const hazards = await this.prisma.pmProjectHazard.findMany({
          where: { projectId, deletedAt: null, status: 'published' },
          take: 50,
        });
        for (const h of hazards) {
          if (h.sifPotential) {
            await this.prisma.pmPmTask.updateMany({
              where: { projectId, deletedAt: null },
              data: { sifReviewRequired: true },
            });
            break;
          }
        }
      }
    }

    await this.prisma.pmProjectConfig.update({
      where: { id: config.id },
      data: { setupComplete: true },
    });

    await this.audit(
      projectId,
      'project_config',
      config.id,
      'configured',
      actorId,
      data,
    );
    return this.getProjectDashboard(projectId);
  }

  // ---------- Work packages ----------

  async listWorkPackages(projectId: number) {
    return this.prisma.pmWorkPackage.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: { tasks: { where: { deletedAt: null }, take: 20 } },
    });
  }

  async createWorkPackage(
    projectId: number,
    body: {
      code: string;
      title: string;
      description?: string;
      locationNote?: string;
      zoneCode?: string;
      requiredEquipmentIds?: number[];
      requiredWorkerIds?: number[];
      requiredTraining?: string[];
      requiredJhaIds?: string[];
      requiredPermitTypes?: string[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const config = await this.prisma.pmProjectConfig.findUnique({
      where: { projectId },
    });

    const hazards = await this.prisma.pmProjectHazard.findMany({
      where: { projectId, status: 'published', deletedAt: null },
      take: 30,
    });
    const controls = await this.prisma.pmProjectControl.findMany({
      where: { projectId, status: 'published', deletedAt: null },
      take: 30,
    });
    const sifPotential = hazards.some((h) => h.sifPotential);

    const wp = await this.prisma.pmWorkPackage.create({
      data: {
        id: randomUUID(),
        projectId,
        configId: config?.id,
        code: body.code,
        title: body.title,
        description: body.description,
        locationNote: body.locationNote,
        zoneCode: body.zoneCode,
        requiredEquipmentIds: (body.requiredEquipmentIds ??
          []) as Prisma.InputJsonValue,
        requiredWorkerIds: (body.requiredWorkerIds ??
          []) as Prisma.InputJsonValue,
        requiredTraining: (body.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredJhaIds: (body.requiredJhaIds ?? []) as Prisma.InputJsonValue,
        requiredPermitTypes: (body.requiredPermitTypes ??
          []) as Prisma.InputJsonValue,
        hazardIds: hazards.map((h) => h.id) as Prisma.InputJsonValue,
        controlIds: controls.map((c) => c.id) as Prisma.InputJsonValue,
        sifPotential,
        clientSyncId: body.clientSyncId,
      },
    });

    await this.audit(projectId, 'work_package', wp.id, 'created', actorId);
    return wp;
  }

  async publishWorkPackage(workPackageId: string, actorId?: number) {
    const wp = await this.prisma.pmWorkPackage.findUnique({
      where: { id: workPackageId },
    });
    if (!wp || wp.deletedAt)
      throw new NotFoundException('Work package not found');

    const evalResult = this.workPackageEngine.evaluatePublish({
      status: wp.status,
      hazardIds: wp.hazardIds as string[],
      controlIds: wp.controlIds as string[],
      sifPotential: wp.sifPotential,
      requiredJhaIds: wp.requiredJhaIds as string[],
      requiredPermitTypes: wp.requiredPermitTypes as string[],
    });
    if (!evalResult.canPublish) {
      throw new BadRequestException(evalResult.violations.join('; '));
    }

    const updated = await this.prisma.pmWorkPackage.update({
      where: { id: workPackageId },
      data: {
        status: 'published',
        version: { increment: 1 },
        publishedAt: new Date(),
      },
    });
    await this.audit(wp.projectId, 'work_package', wp.id, 'published', actorId);
    return updated;
  }

  // ---------- Tasks ----------

  async listTasks(projectId: number, workPackageId?: string) {
    const tasks = await this.prisma.pmPmTask.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(workPackageId ? { workPackageId } : {}),
      },
      orderBy: { plannedStart: 'asc' },
    });
    return tasks.map((task) => this.toTaskOutput(task));
  }

  async createTask(
    projectId: number,
    body: {
      workPackageId?: string;
      code: string;
      title: string;
      taskType?: string;
      zoneCode?: string;
      requiredTraining?: string[];
      requiredEquipmentIds?: number[];
      requiredJhaId?: string;
      plannedStart?: string;
      plannedEnd?: string;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);

    const hazards = await this.prisma.pmProjectHazard.findMany({
      where: { projectId, status: 'published', deletedAt: null },
      take: 20,
    });
    const controls = await this.prisma.pmProjectControl.findMany({
      where: { projectId, status: 'published', deletedAt: null },
      take: 20,
    });

    const task = await this.prisma.pmPmTask.create({
      data: {
        id: randomUUID(),
        projectId,
        workPackageId: body.workPackageId,
        code: body.code,
        title: body.title,
        taskType: body.taskType ?? 'general',
        zoneCode: body.zoneCode,
        requiredTraining: (body.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredEquipmentIds: (body.requiredEquipmentIds ??
          []) as Prisma.InputJsonValue,
        requiredJhaId: body.requiredJhaId,
        requiredControls: controls.map((c) => c.id) as Prisma.InputJsonValue,
        hazardIds: hazards.map((h) => h.id) as Prisma.InputJsonValue,
        sifReviewRequired: hazards.some((h) => h.sifPotential),
        plannedStart: body.plannedStart
          ? new Date(body.plannedStart)
          : undefined,
        plannedEnd: body.plannedEnd ? new Date(body.plannedEnd) : undefined,
        clientSyncId: body.clientSyncId,
      },
    });

    await this.audit(projectId, 'task', task.id, 'created', actorId);
    return this.toTaskOutput(task);
  }

  async startTask(taskId: string, actorId?: number) {
    const task = await this.prisma.pmPmTask.findUnique({
      where: { id: taskId },
    });
    if (!task || task.deletedAt) throw new NotFoundException('Task not found');

    const gate = await this.evaluateTaskStartGate(task.projectId, taskId);
    if (!gate.allowed) {
      await this.prisma.pmPmTask.update({
        where: { id: taskId },
        data: { status: 'blocked', blockedReason: gate.blockers.join('; ') },
      });
      throw new BadRequestException(
        `Safety gate blocked: ${gate.blockers.join('; ')}`,
      );
    }

    const updated = await this.prisma.pmPmTask.update({
      where: { id: taskId },
      data: {
        status: 'in_progress',
        actualStart: new Date(),
        blockedReason: null,
      },
    });
    await this.audit(task.projectId, 'task', taskId, 'started', actorId);
    return this.toTaskOutput(updated);
  }

  async evaluateTaskGateById(taskId: string) {
    const task = await this.prisma.pmPmTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');
    return this.evaluateTaskStartGate(task.projectId, taskId);
  }

  async evaluateTaskStartGate(projectId: number, taskId: string) {
    const task = await this.prisma.pmPmTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    const emergencyLocked = await this.isEmergencyLocked(projectId);

    let jhaApproved = true;
    if (task.requiredJhaId) {
      const jha = await this.prisma.jhaFlha.findFirst({
        where: {
          id: task.requiredJhaId,
          projectId,
          status: { in: ['APPROVED', 'LOCKED'] },
        },
      });
      jhaApproved = !!jha;
    }

    let trainingComplete = true;
    let workerAllowed = true;
    const zoneAllowed = true;
    const assignments = await this.prisma.pmPmWorkerAssignment.findMany({
      where: { taskId, status: { in: ['pending', 'active'] } },
    });
    for (const a of assignments) {
      if (this.workerSafety) {
        const w = await this.workerSafety.enforcementGate(
          a.workerId,
          projectId,
          task.zoneCode ?? undefined,
        );
        if (!w.allowed) {
          workerAllowed = false;
          trainingComplete = false;
        }
      }
    }

    let equipmentSafe = true;
    const eqAssignments = await this.prisma.pmPmEquipmentAssignment.findMany({
      where: { taskId },
    });
    for (const ea of eqAssignments) {
      if (this.equipmentSafety) {
        const v = await this.equipmentSafety.validateAssignment({
          workerId: ea.operatorId ?? 0,
          equipmentId: ea.equipmentId,
          projectId,
        });
        if (!v.allowed) equipmentSafe = false;
      } else {
        const eq = await this.prisma.equipment.findUnique({
          where: { id: ea.equipmentId },
        });
        if (eq?.safetyStatus !== 'OK' || eq.lockoutStatus !== 'CLEAR') {
          equipmentSafe = false;
        }
      }
    }

    let projectContextAllowed = true;
    if (this.projectSafety) {
      const ctx = await this.projectSafety.enforcementGate(projectId, {
        training: trainingComplete,
        jha: jhaApproved,
        equipment: equipmentSafe,
      });
      projectContextAllowed = ctx.allowed;
    }

    let sifReviewComplete = !task.sifReviewRequired;
    if (task.sifReviewRequired) {
      const supervisorSig = task.requiredJhaId
        ? await this.prisma.jhaFlhaSignature.count({
            where: {
              jhaFlhaId: task.requiredJhaId,
              role: 'SUPERVISOR',
            },
          })
        : 0;
      sifReviewComplete = supervisorSig > 0 || jhaApproved;
    }

    let capaTaskAllowed = true;
    const capaBlockers: string[] = [];
    if (this.unifiedCapa) {
      const projectGate = await this.unifiedCapa.pmTaskStartGate(projectId);
      if (!projectGate.allowed) {
        capaTaskAllowed = false;
        capaBlockers.push(...projectGate.blockers);
      }
      for (const a of assignments) {
        const workerGate = await this.unifiedCapa.pmTaskStartGate(
          projectId,
          a.workerId,
        );
        if (!workerGate.allowed) {
          capaTaskAllowed = false;
          capaBlockers.push(...workerGate.blockers);
        }
      }
    }

    return this.safetyGating.evaluateTaskStart({
      emergencyLocked,
      jhaApproved,
      trainingComplete,
      equipmentSafe,
      zoneAllowed,
      sifReviewComplete,
      projectContextAllowed,
      workerAllowed,
      capaTaskAllowed,
      capaBlockers,
    });
  }

  // ---------- Scheduling ----------

  async listSchedule(projectId: number) {
    return this.prisma.pmProjectSchedule.findMany({
      where: { projectId },
      orderBy: { startAt: 'asc' },
    });
  }

  async createScheduleEntry(
    projectId: number,
    body: {
      taskId?: string;
      workerId?: number;
      equipmentId?: number;
      zoneCode?: string;
      entryType?: string;
      title: string;
      startAt: string;
      endAt: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const emergencyLocked = await this.isEmergencyLocked(projectId);

    let safetyBlocked = emergencyLocked;
    let blockReason: string | null = emergencyLocked
      ? 'Emergency lock active'
      : null;

    if (body.taskId && !safetyBlocked) {
      const gate = await this.evaluateTaskStartGate(projectId, body.taskId);
      if (!gate.allowed) {
        safetyBlocked = true;
        blockReason = gate.blockers.join('; ');
      }
    }

    const existing = await this.prisma.pmProjectSchedule.findMany({
      where: { projectId },
    });
    const conflicts = this.scheduling.detectConflicts([
      ...existing.map((e) => ({
        id: e.id,
        workerId: e.workerId,
        equipmentId: e.equipmentId,
        taskId: e.taskId,
        startAt: e.startAt,
        endAt: e.endAt,
      })),
      {
        workerId: body.workerId,
        equipmentId: body.equipmentId,
        taskId: body.taskId,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
      },
    ]);

    const entry = await this.prisma.pmProjectSchedule.create({
      data: {
        id: randomUUID(),
        projectId,
        taskId: body.taskId,
        workerId: body.workerId,
        equipmentId: body.equipmentId,
        zoneCode: body.zoneCode,
        entryType: body.entryType ?? 'task',
        title: body.title,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        conflictFlag: conflicts.length > 0,
        safetyBlocked,
        blockReason,
      },
    });

    if (conflicts.length > 0) {
      await this.audit(
        projectId,
        'schedule',
        entry.id,
        'conflict_detected',
        actorId,
        {
          conflicts,
        },
      );
    }

    return { entry, conflicts };
  }

  // ---------- Assignments ----------

  async assignWorker(
    projectId: number,
    body: {
      workerId: number;
      taskId?: string;
      workPackageId?: string;
      role?: string;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const emergencyLocked = await this.isEmergencyLocked(projectId);

    let status: 'pending' | 'blocked' = 'pending';
    let blockedReason: string | null = null;
    const validation: Record<string, unknown> = {};

    if (this.workerSafety) {
      const gate = await this.workerSafety.enforcementGate(
        body.workerId,
        projectId,
      );
      validation.workerGate = gate;
      if (!gate.allowed || emergencyLocked) {
        status = 'blocked';
        blockedReason = emergencyLocked
          ? 'Emergency lock'
          : (gate as { reasons?: string[] }).reasons?.join('; ') ??
            'Worker blocked';
      }
    }

    const row = await this.prisma.pmPmWorkerAssignment.create({
      data: {
        id: randomUUID(),
        projectId,
        taskId: body.taskId,
        workPackageId: body.workPackageId,
        workerId: body.workerId,
        role: body.role ?? 'crew',
        status,
        validationJson: validation as Prisma.InputJsonValue,
        blockedReason,
        assignedById: actorId,
        clientSyncId: body.clientSyncId,
      },
    });

    await this.audit(
      projectId,
      'worker_assignment',
      row.id,
      'assigned',
      actorId,
      validation,
    );
    const mapped = this.mapValidationStatus(row.status, row.blockedReason);
    return { ...row, ...mapped };
  }

  async assignEquipment(
    projectId: number,
    body: {
      equipmentId: number;
      taskId?: string;
      operatorId?: number;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const emergencyLocked = await this.isEmergencyLocked(projectId);

    let status: 'pending' | 'blocked' = 'pending';
    let blockedReason: string | null = null;
    const validation: Record<string, unknown> = {};

    if (this.equipmentSafety && body.operatorId) {
      const v = await this.equipmentSafety.validateAssignment({
        workerId: body.operatorId,
        equipmentId: body.equipmentId,
        projectId,
      });
      validation.equipmentGate = v;
      if (!v.allowed || emergencyLocked) {
        status = 'blocked';
        blockedReason = emergencyLocked
          ? 'Emergency lock'
          : (v.failures as string[])?.join('; ') ?? 'Equipment blocked';
      }
    } else {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: body.equipmentId },
      });
      if (
        emergencyLocked ||
        eq?.safetyStatus !== 'OK' ||
        eq?.lockoutStatus !== 'CLEAR'
      ) {
        status = 'blocked';
        blockedReason = emergencyLocked ? 'Emergency lock' : 'Equipment unsafe';
      }
    }

    const row = await this.prisma.pmPmEquipmentAssignment.create({
      data: {
        id: randomUUID(),
        projectId,
        taskId: body.taskId,
        equipmentId: body.equipmentId,
        operatorId: body.operatorId,
        status,
        validationJson: validation as Prisma.InputJsonValue,
        blockedReason,
        clientSyncId: body.clientSyncId,
      },
    });

    await this.audit(
      projectId,
      'equipment_assignment',
      row.id,
      'assigned',
      actorId,
    );
    const mapped = this.mapValidationStatus(row.status, row.blockedReason);
    return { ...row, ...mapped };
  }

  // ---------- Permits ----------

  async listPermits(projectId: number) {
    return this.prisma.pmPermit.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  async createPermit(
    projectId: number,
    body: {
      permitType: PmPermitType;
      title: string;
      workPackageId?: string;
      taskId?: string;
      requiredTraining?: string[];
      requiredControls?: string[];
      requiredJhaId?: string;
      validFrom?: string;
      validTo?: string;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const permit = await this.prisma.pmPermit.create({
      data: {
        id: randomUUID(),
        projectId,
        workPackageId: body.workPackageId,
        taskId: body.taskId,
        permitType: body.permitType,
        title: body.title,
        requiredTraining: (body.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredControls: (body.requiredControls ??
          []) as Prisma.InputJsonValue,
        requiredJhaId: body.requiredJhaId,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validTo: body.validTo ? new Date(body.validTo) : undefined,
        clientSyncId: body.clientSyncId,
      },
    });
    await this.audit(projectId, 'permit', permit.id, 'created', actorId);
    return permit;
  }

  async submitPermitForApproval(permitId: string, actorId?: number) {
    const permit = await this.prisma.pmPermit.findUnique({
      where: { id: permitId },
    });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'draft') {
      throw new BadRequestException('Only draft permits can be submitted');
    }
    const updated = await this.prisma.pmPermit.update({
      where: { id: permitId },
      data: { status: 'pending_approval' },
    });
    await this.audit(
      permit.projectId,
      'permit',
      permitId,
      'submitted',
      actorId,
    );
    return updated;
  }

  async approvePermit(permitId: string, actorId: number) {
    const permit = await this.prisma.pmPermit.findUnique({
      where: { id: permitId },
    });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'pending_approval') {
      throw new BadRequestException('Permit not pending approval');
    }

    const snapshot = { ...permit, approvedAt: new Date().toISOString() };
    await this.prisma.pmPermitVersion.create({
      data: {
        id: randomUUID(),
        permitId,
        version: permit.version,
        snapshotJson: snapshot as Prisma.InputJsonValue,
      },
    });

    const updated = await this.prisma.pmPermit.update({
      where: { id: permitId },
      data: {
        status: 'approved',
        approvedById: actorId,
        approvedAt: new Date(),
        version: { increment: 1 },
      },
    });
    await this.audit(permit.projectId, 'permit', permitId, 'approved', actorId);
    return updated;
  }

  async activatePermit(permitId: string, actorId?: number) {
    const permit = await this.prisma.pmPermit.findUnique({
      where: { id: permitId },
    });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'approved') {
      throw new BadRequestException(
        'Permit must be approved before activation',
      );
    }
    if (permit.validTo && permit.validTo < new Date()) {
      throw new BadRequestException('Permit expired');
    }
    return this.prisma.pmPermit.update({
      where: { id: permitId },
      data: { status: 'active', validFrom: permit.validFrom ?? new Date() },
    });
  }

  // ---------- Progress ----------

  async updateTaskProgress(
    taskId: string,
    progressPct: number,
    actorId?: number,
  ) {
    const task = await this.prisma.pmPmTask.update({
      where: { id: taskId },
      data: {
        progressPct,
        status: progressPct >= 100 ? 'completed' : undefined,
        actualEnd: progressPct >= 100 ? new Date() : undefined,
      },
    });
    if (task.workPackageId) {
      const tasks = await this.prisma.pmPmTask.findMany({
        where: { workPackageId: task.workPackageId, deletedAt: null },
        select: { progressPct: true },
      });
      const wpProgress = this.workPackageEngine.rollupProgress(
        tasks.map((t) => t.progressPct),
      );
      await this.prisma.pmWorkPackage.update({
        where: { id: task.workPackageId },
        data: { progressPct: wpProgress },
      });
    }
    await this.recalculateProjectProgress(task.projectId);
    await this.audit(
      task.projectId,
      'task',
      taskId,
      'progress_updated',
      actorId,
      {
        progressPct,
      },
    );
    return this.toTaskOutput(task);
  }

  private async recalculateProjectProgress(projectId: number) {
    const tasks = await this.prisma.pmPmTask.findMany({
      where: { projectId, deletedAt: null },
      select: { progressPct: true },
    });
    const progressPct = this.workPackageEngine.rollupProgress(
      tasks.map((t) => t.progressPct),
    );
    await this.prisma.pmProjectConfig.updateMany({
      where: { projectId },
      data: { progressPct },
    });
  }

  // ---------- Attachments ----------

  async addAttachment(body: {
    projectId?: number;
    entityType: string;
    entityId: string;
    fileName?: string;
    mimeType?: string;
    storageKey?: string;
    dataUrl?: string;
    clientSyncId?: string;
  }) {
    return this.prisma.pmPmAttachment.create({
      data: {
        id: randomUUID(),
        projectId: body.projectId,
        entityType: body.entityType,
        entityId: body.entityId,
        fileName: body.fileName,
        mimeType: body.mimeType,
        storageKey: body.storageKey,
        dataUrl: body.dataUrl,
        clientSyncId: body.clientSyncId,
      },
    });
  }

  async listAttachments(entityType: string, entityId: string) {
    return this.prisma.pmPmAttachment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------- Offline sync ----------

  async buildOfflineBundle(projectId: number) {
    await this.assertProject(projectId);
    const [
      config,
      workPackages,
      tasks,
      schedule,
      workerAssignments,
      equipmentAssignments,
      permits,
      attachments,
    ] = await Promise.all([
      this.prisma.pmProjectConfig.findUnique({ where: { projectId } }),
      this.listWorkPackages(projectId),
      this.listTasks(projectId),
      this.listSchedule(projectId),
      this.prisma.pmPmWorkerAssignment.findMany({ where: { projectId } }),
      this.prisma.pmPmEquipmentAssignment.findMany({ where: { projectId } }),
      this.listPermits(projectId),
      this.prisma.pmPmAttachment.findMany({ where: { projectId } }),
    ]);

    const bundle = {
      projectId,
      syncedAt: new Date().toISOString(),
      config,
      workPackages,
      tasks,
      schedule,
      workerAssignments,
      equipmentAssignments,
      permits,
      attachments,
      safetyRequirements: await this.projectSafety?.buildOfflineBundle?.(
        projectId,
      ),
    };

    await this.prisma.pmProjectOfflineCache.upsert({
      where: {
        projectId_cacheKey: { projectId, cacheKey: 'full_bundle' },
      },
      create: {
        id: randomUUID(),
        projectId,
        cacheKey: 'full_bundle',
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

  async getCailBundle(projectId: number) {
    const dashboard = await this.getProjectDashboard(projectId);
    const [
      delays,
      conflicts,
      hazards,
      workerScores,
      equipmentScores,
      scheduleRecs,
      insights,
    ] = await Promise.all([
      this.cail.predictScheduleDelays(projectId),
      this.cail.predictResourceConflicts(projectId),
      this.cail.predictHazardEmergence(projectId),
      this.cail.workerRiskScoresForProject(projectId),
      this.cail.equipmentRiskScoresForProject(projectId),
      this.cail.recommendScheduleAdjustments(projectId),
      this.cail.projectInsights(projectId),
    ]);

    const sampleTask = await this.prisma.pmPmTask.findFirst({
      where: { projectId, deletedAt: null },
      select: {
        hazardIds: true,
        sifReviewRequired: true,
        requiredTraining: true,
      },
    });
    const hazardCount = Array.isArray(sampleTask?.hazardIds)
      ? (sampleTask.hazardIds as unknown[]).length
      : 0;
    const requiredTraining = Array.isArray(sampleTask?.requiredTraining)
      ? (sampleTask.requiredTraining as string[])
      : [];

    return {
      dashboard: dashboard.metrics,
      forecast: dashboard.cail.forecast,
      insights,
      scheduleDelays: delays,
      resourceConflicts: conflicts,
      hazardEmergence: hazards,
      workerRiskScores: workerScores,
      equipmentRiskScores: equipmentScores,
      recommendedScheduleAdjustments: scheduleRecs,
      recommendedControls: this.cail.recommendControlsForTask(
        hazardCount,
        sampleTask?.sifReviewRequired ?? false,
      ),
      recommendedTraining: this.cail.recommendTrainingForTask(requiredTraining),
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      workPackages?: Array<Record<string, unknown>>;
      tasks?: Array<Record<string, unknown>>;
      schedule?: Array<Record<string, unknown>>;
      workerAssignments?: Array<Record<string, unknown>>;
      equipmentAssignments?: Array<Record<string, unknown>>;
      permits?: Array<Record<string, unknown>>;
      progress?: Array<{ taskId: string; progressPct: number }>;
      attachments?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    await this.assertProject(projectId);
    const results: Record<string, number> = {
      workPackages: 0,
      tasks: 0,
      schedule: 0,
      workerAssignments: 0,
      equipmentAssignments: 0,
      permits: 0,
      progress: 0,
      attachments: 0,
    };

    for (const wp of payload.workPackages ?? []) {
      const clientSyncId = String(wp.clientSyncId ?? '');
      if (!clientSyncId) continue;
      await this.prisma.pmWorkPackage.upsert({
        where: { clientSyncId },
        create: {
          id: String(wp.id ?? randomUUID()),
          projectId,
          code: String(wp.code),
          title: String(wp.title),
          clientSyncId,
          description: wp.description as string | undefined,
        },
        update: {
          title: String(wp.title),
          description: wp.description as string | undefined,
          status: (wp.status as PmWorkPackageStatus) ?? undefined,
        },
      });
      results.workPackages++;
    }

    for (const t of payload.tasks ?? []) {
      const clientSyncId = String(t.clientSyncId ?? '');
      if (!clientSyncId) continue;
      await this.prisma.pmPmTask.upsert({
        where: { clientSyncId },
        create: {
          id: String(t.id ?? randomUUID()),
          projectId,
          code: String(t.code),
          title: String(t.title),
          clientSyncId,
          progressPct: Number(t.progressPct ?? 0),
        },
        update: {
          title: String(t.title),
          progressPct: Number(t.progressPct ?? 0),
          status: t.status as PmPmTaskStatus | undefined,
        },
      });
      results.tasks++;
    }

    for (const s of payload.schedule ?? []) {
      if (s.title && s.startAt && s.endAt) {
        await this.createScheduleEntry(
          projectId,
          s as Parameters<PmProjectManagementService['createScheduleEntry']>[1],
          actorId,
        );
        results.schedule = (results.schedule ?? 0) + 1;
      }
    }

    for (const wa of payload.workerAssignments ?? []) {
      if (wa.workerId) {
        await this.assignWorker(
          projectId,
          wa as Parameters<PmProjectManagementService['assignWorker']>[1],
          actorId,
        );
        results.workerAssignments++;
      }
    }

    for (const ea of payload.equipmentAssignments ?? []) {
      if (ea.equipmentId) {
        await this.assignEquipment(
          projectId,
          ea as Parameters<PmProjectManagementService['assignEquipment']>[1],
          actorId,
        );
        results.equipmentAssignments++;
      }
    }

    for (const p of payload.permits ?? []) {
      if (p.permitType && p.title) {
        await this.createPermit(
          projectId,
          p as Parameters<PmProjectManagementService['createPermit']>[1],
          actorId,
        );
        results.permits = (results.permits ?? 0) + 1;
      }
    }

    for (const pr of payload.progress ?? []) {
      if (pr.taskId && pr.progressPct != null) {
        await this.updateTaskProgress(pr.taskId, pr.progressPct, actorId);
        results.progress = (results.progress ?? 0) + 1;
      }
    }

    for (const att of payload.attachments ?? []) {
      if (att.entityType && att.entityId) {
        await this.addAttachment({ ...att, projectId } as Parameters<
          PmProjectManagementService['addAttachment']
        >[0]);
        results.attachments++;
      }
    }

    await this.audit(
      projectId,
      'offline_sync',
      String(projectId),
      'applied',
      actorId,
      results,
    );
    return {
      ok: true,
      projectId,
      applied: results,
      serverState: await this.buildOfflineBundle(projectId),
    };
  }

  // ---------- Projects list & assignments ----------

  async listProjects(companyId?: number, limit = 50) {
    return this.prisma.project.findMany({
      where: companyId ? { companyId } : undefined,
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        pmProjectConfig: true,
        _count: {
          select: {
            pmPmTasks: true,
            pmWorkPackages: true,
            pmPmWorkerAssignments: true,
          },
        },
      },
    });
  }

  async listWorkerAssignments(projectId: number) {
    await this.assertProject(projectId);
    return this.prisma.pmPmWorkerAssignment.findMany({
      where: { projectId },
      orderBy: { assignedAt: 'desc' },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        task: { select: { id: true, code: true, title: true, status: true } },
      },
    });
  }

  async listEquipmentAssignments(projectId: number) {
    await this.assertProject(projectId);
    return this.prisma.pmPmEquipmentAssignment.findMany({
      where: { projectId },
      orderBy: { assignedAt: 'desc' },
      include: {
        equipment: { select: { id: true, name: true, serialNumber: true } },
        task: { select: { id: true, code: true, title: true } },
      },
    });
  }

  async getProjectActivity(projectId: number, limit = 50) {
    await this.assertProject(projectId);
    const [audit, tasks, dailyLogs] = await Promise.all([
      this.prisma.pmPmAuditLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { actor: { select: { id: true, email: true } } },
      }),
      this.prisma.pmPmTask.findMany({
        where: { projectId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          progressPct: true,
          updatedAt: true,
        },
      }),
      this.prisma.coreDailyLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          logDate: true,
          createdAt: true,
          companyId: true,
        },
      }),
    ]);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });

    const companyLogs = dailyLogs.filter(
      (l) => l.companyId === project?.companyId,
    );

    return {
      generatedAt: new Date().toISOString(),
      auditEvents: audit.map((a) => ({
        id: a.id,
        entityType: a.entityType,
        entityId: a.entityId,
        eventType: a.eventType,
        actor: a.actor?.email ?? null,
        createdAt: a.createdAt.toISOString(),
        payload: a.payload,
      })),
      recentTasks: tasks.map((t) => ({
        id: t.id,
        code: t.code,
        title: t.title,
        status: t.status,
        progressPct: t.progressPct,
        updatedAt: t.updatedAt.toISOString(),
      })),
      dailyLogs: companyLogs.map((l) => ({
        id: l.id,
        title: l.title,
        logDate: l.logDate?.toISOString() ?? null,
        createdAt: l.createdAt.toISOString(),
        href: `/core/daily-logs/${l.id}`,
      })),
    };
  }

  async getProjectReadiness(projectId: number) {
    const dashboard = await this.getProjectDashboard(projectId);
    const tasks = await this.prisma.pmPmTask.findMany({
      where: { projectId, deletedAt: null },
      select: { status: true, progressPct: true },
    });
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const progressPct =
      tasks.length > 0
        ? Math.round(
            tasks.reduce((s, t) => s + (t.progressPct ?? 0), 0) / tasks.length,
          )
        : dashboard.metrics.progressPct ?? 0;

    return {
      projectId,
      readinessScore: dashboard.metrics.safetyScore ?? progressPct,
      progressPct,
      taskCompletionPct:
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      blockedTasks: dashboard.metrics.blockedTasks,
      scheduleConflicts: dashboard.metrics.scheduleConflicts,
      workerAssignments: dashboard.metrics.workerAssignments,
      equipmentAssignments: dashboard.metrics.equipmentAssignments,
      forecast: dashboard.cail?.forecast ?? null,
      level:
        (dashboard.metrics.blockedTasks ?? 0) > 0 ||
        (dashboard.metrics.scheduleConflicts ?? 0) > 0
          ? 'AT_RISK'
          : progressPct >= 80
          ? 'READY'
          : 'IN_PROGRESS',
    };
  }

  // ---------- Analytics ----------

  async getAnalytics(projectId: number) {
    const dashboard = await this.getProjectDashboard(projectId);
    const scheduleEntries = await this.prisma.pmProjectSchedule.findMany({
      where: { projectId },
    });
    const onTime = scheduleEntries.filter(
      (e) => !e.safetyBlocked && !e.conflictFlag,
    ).length;
    const utilization =
      scheduleEntries.length > 0
        ? Math.round((onTime / scheduleEntries.length) * 100)
        : 100;

    return {
      ...dashboard.metrics,
      scheduleUtilizationPct: utilization,
      permitTrend: await this.prisma.pmPermit.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      leadingIndicators: {
        blockedTasks: dashboard.metrics.blockedTasks,
        scheduleConflicts: dashboard.metrics.scheduleConflicts,
        safetyForecast: dashboard.cail.forecast,
      },
    };
  }
}
