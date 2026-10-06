import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PmCailInsight = {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  explanation: string;
  inputs: Record<string, unknown>;
  recommendation: string;
  correlatedModules: string[];
};

@Injectable()
export class PmProjectManagementCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  taskRiskScore(input: {
    sifReviewRequired: boolean;
    hazardCount: number;
    openCapa: number;
    blockedTasks: number;
  }): number {
    let score = 20;
    if (input.sifReviewRequired) score += 35;
    score += Math.min(25, input.hazardCount * 5);
    score += Math.min(20, input.openCapa * 4);
    score += Math.min(15, input.blockedTasks * 3);
    return Math.min(100, score);
  }

  projectSafetyForecast(
    projectId: number,
    metrics: {
      blockedTaskCount: number;
      openPermitCount: number;
      avgWorkerScore: number;
      scheduleConflictCount: number;
    },
  ): { forecastScore: number; trend: 'improving' | 'stable' | 'declining' } {
    let forecast = 100;
    forecast -= metrics.blockedTaskCount * 8;
    forecast -= metrics.openPermitCount * 3;
    forecast -= (100 - metrics.avgWorkerScore) * 0.3;
    forecast -= metrics.scheduleConflictCount * 5;
    forecast = Math.max(0, Math.min(100, Math.round(forecast)));
    const trend =
      forecast >= 75 ? 'improving' : forecast >= 50 ? 'stable' : 'declining';
    return { forecastScore: forecast, trend };
  }

  async projectInsights(projectId: number): Promise<PmCailInsight[]> {
    const [blockedTasks, openCapa, openJha, openInspections, conflicts] =
      await Promise.all([
        this.prisma.pmPmTask.count({
          where: { projectId, status: 'blocked', deletedAt: null },
        }),
        this.prisma.pmCorrectiveAction.count({
          where: {
            projectId,
            status: {
              in: ['open', 'assigned', 'in_progress', 'verification_pending'],
            },
          },
        }),
        this.prisma.jhaFlha.count({
          where: {
            projectId,
            status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'] },
          },
        }),
        this.prisma.pmInspection.count({
          where: {
            projectId,
            status: { in: ['draft', 'in_progress', 'review_required'] },
          },
        }),
        this.prisma.pmProjectSchedule.count({
          where: { projectId, conflictFlag: true },
        }),
      ]);

    const insights: PmCailInsight[] = [];

    if (blockedTasks > 0) {
      insights.push({
        id: `pm-blocked-${projectId}`,
        category: 'safety_gating',
        severity: blockedTasks >= 3 ? 'high' : 'medium',
        title: 'Safety blockers on active tasks',
        explanation: `${blockedTasks} task(s) are blocked by safety gates (JHA, training, equipment, or zone).`,
        inputs: { blockedTasks, projectId },
        recommendation:
          'Resolve JHA approvals and worker training before rescheduling blocked tasks.',
        correlatedModules: [
          'jha-flha',
          'worker-safety-profile',
          'project-safety-context',
        ],
      });
    }

    if (openCapa > 0) {
      insights.push({
        id: `pm-capa-${projectId}`,
        category: 'corrective_actions',
        severity: openCapa >= 5 ? 'critical' : 'medium',
        title: 'Open corrective actions affecting schedule',
        explanation: `${openCapa} open CAPA item(s) may block worker or equipment assignments.`,
        inputs: { openCapa, projectId },
        recommendation:
          'Prioritize verification of high-severity CAPA linked to scheduled work.',
        correlatedModules: ['corrective-actions', 'incidents', 'inspections'],
      });
    }

    if (conflicts > 0) {
      insights.push({
        id: `pm-schedule-${projectId}`,
        category: 'scheduling',
        severity: 'medium',
        title: 'Resource schedule conflicts detected',
        explanation: `${conflicts} overlapping schedule entries for workers or equipment.`,
        inputs: { conflicts, projectId },
        recommendation:
          'Rebalance worker and equipment assignments in the Gantt view.',
        correlatedModules: ['project-management'],
      });
    }

    if (openJha > 0) {
      insights.push({
        id: `pm-jha-${projectId}`,
        category: 'jha',
        severity: 'high',
        title: 'Pending JHA approvals',
        explanation: `${openJha} JHA/FLHA record(s) awaiting approval before task start.`,
        inputs: { openJha, projectId },
        recommendation:
          'Complete supervisor sign-off on JHAs for tasks planned this week.',
        correlatedModules: ['jha-flha', 'sif-heca'],
      });
    }

    if (openInspections > 0) {
      insights.push({
        id: `pm-insp-${projectId}`,
        category: 'inspections',
        severity: 'low',
        title: 'Open inspections correlated to work packages',
        explanation: `${openInspections} inspection(s) in progress may gate equipment use.`,
        inputs: { openInspections, projectId },
        recommendation:
          'Close pre-task equipment inspections before assignment.',
        correlatedModules: ['inspections', 'equipment-safety'],
      });
    }

    return insights;
  }

  async predictScheduleDelays(
    projectId: number,
  ): Promise<
    Array<{ taskId: string; title: string; delayDays: number; reason: string }>
  > {
    const now = new Date();
    const tasks = await this.prisma.pmPmTask.findMany({
      where: {
        projectId,
        deletedAt: null,
        status: { in: ['draft', 'scheduled', 'blocked', 'in_progress'] },
        plannedEnd: { lt: now },
      },
      select: {
        id: true,
        title: true,
        plannedEnd: true,
        blockedReason: true,
        status: true,
      },
      take: 20,
    });
    return tasks.map((t) => ({
      taskId: t.id,
      title: t.title,
      delayDays: t.plannedEnd
        ? Math.ceil((now.getTime() - t.plannedEnd.getTime()) / 86400000)
        : 0,
      reason:
        t.status === 'blocked'
          ? t.blockedReason ?? 'Safety gate blocked'
          : 'Past planned end date',
    }));
  }

  async predictResourceConflicts(projectId: number) {
    const entries = await this.prisma.pmProjectSchedule.findMany({
      where: { projectId, conflictFlag: true },
      take: 30,
    });
    return entries.map((e) => ({
      scheduleId: e.id,
      title: e.title,
      workerId: e.workerId,
      equipmentId: e.equipmentId,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      safetyBlocked: e.safetyBlocked,
      blockReason: e.blockReason,
    }));
  }

  async predictHazardEmergence(
    projectId: number,
  ): Promise<Array<{ title: string; source: string; confidence: number }>> {
    const since = new Date(Date.now() - 60 * 86400000);
    const [defs, openHazards] = await Promise.all([
      this.prisma.pmInspectionDeficiency.findMany({
        where: { inspection: { projectId }, createdAt: { gte: since } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pmProjectHazard.findMany({
        where: { projectId, deletedAt: null },
        select: { title: true },
      }),
    ]);
    const seen = new Set(openHazards.map((h) => h.title.toLowerCase()));
    return defs
      .filter((d) => !seen.has(d.title.toLowerCase()))
      .map((d) => ({
        title: d.title,
        source: 'inspection_deficiency',
        confidence: 0.71,
      }));
  }

  async recommendScheduleAdjustments(projectId: number): Promise<string[]> {
    const [blocked, conflicts, delays] = await Promise.all([
      this.prisma.pmPmTask.count({
        where: { projectId, status: 'blocked', deletedAt: null },
      }),
      this.prisma.pmProjectSchedule.count({
        where: { projectId, conflictFlag: true },
      }),
      this.predictScheduleDelays(projectId),
    ]);
    const recs: string[] = [];
    if (blocked > 0)
      recs.push(
        `Resolve ${blocked} blocked task(s) before adding schedule slots`,
      );
    if (conflicts > 0)
      recs.push(
        `Rebalance ${conflicts} conflicting worker/equipment assignments`,
      );
    if (delays.length > 0) {
      recs.push(`Extend or re-sequence ${delays.length} overdue task(s)`);
    }
    if (recs.length === 0)
      recs.push('Schedule is within safety and conflict thresholds');
    return recs;
  }

  async workerRiskScoresForProject(
    projectId: number,
  ): Promise<Array<{ workerId: number; score: number; riskLevel: string }>> {
    const profiles = await this.prisma.pmWorkerSafetyProfile.findMany({
      where: {
        worker: {
          projectAssignments: { some: { projectId, status: 'ACTIVE' } },
        },
      },
      select: { workerId: true, safetyScore: true, riskLevel: true },
    });
    return profiles.map((p) => ({
      workerId: p.workerId,
      score: p.safetyScore,
      riskLevel: p.riskLevel,
    }));
  }

  async equipmentRiskScoresForProject(
    projectId: number,
  ): Promise<
    Array<{ equipmentId: number; safetyStatus: string; lockoutStatus: string }>
  > {
    const assignments = await this.prisma.equipmentProjectAssignment.findMany({
      where: { projectId, endedAt: null },
      include: {
        equipment: {
          select: { id: true, safetyStatus: true, lockoutStatus: true },
        },
      },
    });
    return assignments.map((a) => ({
      equipmentId: a.equipment.id,
      safetyStatus: a.equipment.safetyStatus,
      lockoutStatus: a.equipment.lockoutStatus,
    }));
  }

  recommendControlsForTask(
    hazardCount: number,
    sifRequired: boolean,
  ): string[] {
    const recs: string[] = [];
    if (sifRequired) recs.push('Engineering control + SIF supervisor sign-off');
    if (hazardCount > 3)
      recs.push(
        'Add task-specific JHA with linked controls from project library',
      );
    if (recs.length === 0)
      recs.push('Standard administrative controls from work package');
    return recs;
  }

  recommendTrainingForTask(requiredTraining: string[]): string[] {
    if (requiredTraining.length > 0) return requiredTraining;
    return ['ORIENTATION', 'FLHA'];
  }
}
