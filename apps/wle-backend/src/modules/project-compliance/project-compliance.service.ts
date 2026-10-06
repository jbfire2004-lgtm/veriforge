import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssignmentStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  aggregateProjectCompliance,
  evaluateWorkerCompliance,
  ruleAppliesToWorker,
  type EvaluatorCredential,
  type EvaluatorRule,
  type EvaluatorWorker,
} from './project-compliance-evaluator';
import type {
  ProjectComplianceReport,
  RuleMetadata,
  WorkerProjectComplianceDetail,
} from './project-compliance.types';

@Injectable()
export class ProjectComplianceService {
  private readonly logger = new Logger(ProjectComplianceService.name);
  constructor(private readonly prisma: PrismaService) {}

  async evaluateProject(projectId: number): Promise<ProjectComplianceReport> {
    const started = Date.now();
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        companyId: true,
        client: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const [assignments, rules] = await Promise.all([
      this.prisma.projectAssignment.findMany({
        where: {
          projectId,
          status: AssignmentStatus.ACTIVE,
          endedAt: null,
        },
        select: {
          workerId: true,
          role: true,
          worker: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.loadRules(projectId),
    ]);

    const workerIds = assignments.map((a) => a.workerId);
    const certIds = [...new Set(rules.map((r) => r.requiredCredentialTypeId))];

    const [credentials, companyLinks, safetyProfiles] = await Promise.all([
      certIds.length && workerIds.length
        ? this.prisma.trainingRecord.findMany({
            where: {
              workerId: { in: workerIds },
              certificationId: { in: certIds },
              OR: [{ projectId }, { projectId: null }],
            },
            select: {
              id: true,
              workerId: true,
              certificationId: true,
              expiresAt: true,
              lastVerificationStatus: true,
            },
          })
        : Promise.resolve([]),
      workerIds.length
        ? this.prisma.companyLink.findMany({
            where: {
              workerId: { in: workerIds },
              companyId: project.companyId,
              active: true,
            },
            select: { workerId: true, role: true, trade: true },
          })
        : Promise.resolve([]),
      workerIds.length
        ? this.prisma.pmWorkerSafetyProfile.findMany({
            where: { workerId: { in: workerIds } },
            select: { workerId: true, roleType: true, tradeCode: true },
          })
        : Promise.resolve([]),
    ]);

    const linkByWorker = new Map(companyLinks.map((l) => [l.workerId, l]));
    const profileByWorker = new Map(safetyProfiles.map((p) => [p.workerId, p]));
    const credsByWorker = new Map<number, EvaluatorCredential[]>();
    for (const c of credentials) {
      const list = credsByWorker.get(c.workerId) ?? [];
      list.push(c);
      credsByWorker.set(c.workerId, list);
    }

    const workers = assignments.map((a) => {
      const link = linkByWorker.get(a.workerId);
      const profile = profileByWorker.get(a.workerId);
      const worker: EvaluatorWorker = {
        id: a.worker.id,
        firstName: a.worker.firstName,
        lastName: a.worker.lastName,
        role: a.role ?? link?.role ?? profile?.roleType ?? null,
        trade: link?.trade ?? profile?.tradeCode ?? null,
      };
      return evaluateWorkerCompliance(
        worker,
        rules,
        credsByWorker.get(a.workerId) ?? [],
      );
    });

    const summary = aggregateProjectCompliance(
      project.id,
      project.name,
      project.companyId,
      project.client,
      workers,
    );

    const report = {
      projectId: project.id,
      projectName: project.name,
      companyId: project.companyId,
      client: project.client,
      ...summary,
      totalWorkers: workers.length,
      evaluatedAt: new Date().toISOString(),
    };
    this.logger.log(
      JSON.stringify({
        type: 'project_compliance.project.evaluate',
        projectId,
        workers: workers.length,
        compliant: report.compliantWorkers.length,
        nonCompliant: report.nonCompliantWorkers.length,
        durationMs: Date.now() - started,
      }),
    );
    return report;
  }

  async evaluateWorkerOnProject(
    projectId: number,
    workerId: number,
  ): Promise<WorkerProjectComplianceDetail> {
    const started = Date.now();
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, companyId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const assignment = await this.prisma.projectAssignment.findFirst({
      where: {
        projectId,
        workerId,
        status: AssignmentStatus.ACTIVE,
        endedAt: null,
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!assignment) {
      throw new NotFoundException('Worker is not assigned to this project');
    }

    const rules = await this.loadRules(projectId);
    const certIds = [...new Set(rules.map((r) => r.requiredCredentialTypeId))];

    const [records, link, profile] = await Promise.all([
      certIds.length
        ? this.prisma.trainingRecord.findMany({
            where: {
              workerId,
              certificationId: { in: certIds },
              OR: [{ projectId }, { projectId: null }],
            },
            include: {
              certification: { select: { id: true, code: true, name: true } },
            },
          })
        : Promise.resolve([]),
      this.prisma.companyLink.findFirst({
        where: { workerId, companyId: project.companyId, active: true },
        select: { role: true, trade: true },
      }),
      this.prisma.pmWorkerSafetyProfile.findUnique({
        where: { workerId },
        select: { roleType: true, tradeCode: true },
      }),
    ]);

    const workerCtx: EvaluatorWorker = {
      id: assignment.worker.id,
      firstName: assignment.worker.firstName,
      lastName: assignment.worker.lastName,
      role: assignment.role ?? link?.role ?? profile?.roleType ?? null,
      trade: link?.trade ?? profile?.tradeCode ?? null,
    };

    const evaluation = evaluateWorkerCompliance(
      workerCtx,
      rules,
      records.map((r) => ({
        id: r.id,
        certificationId: r.certificationId,
        expiresAt: r.expiresAt,
        lastVerificationStatus: r.lastVerificationStatus,
      })),
    );

    const now = new Date();
    const expiringCutoff = new Date(now.getTime() + 30 * 86_400_000);
    const recordByCert = new Map(records.map((r) => [r.certificationId, r]));

    const detail = {
      ...evaluation,
      projectId: project.id,
      projectName: project.name,
      required: rules
        .filter((rule) => ruleAppliesToWorker(rule, workerCtx))
        .map((rule) => {
          const match = recordByCert.get(rule.requiredCredentialTypeId);
          let status: 'valid' | 'missing' | 'expired' | 'expiring_soon' =
            'missing';
          if (match) {
            if (match.expiresAt && match.expiresAt <= now) status = 'expired';
            else if (match.expiresAt && match.expiresAt <= expiringCutoff) {
              status = 'expiring_soon';
            } else status = 'valid';
          }
          return {
            ruleId: rule.id,
            ruleType: rule.ruleType,
            certificationId: rule.requiredCredentialTypeId,
            certificationCode: rule.certificationCode,
            certificationName: rule.certificationName,
            status,
            credentialId: match?.id ?? null,
            expiresAt: match?.expiresAt?.toISOString() ?? null,
          };
        }),
      actual: records.map((r) => {
        let status: 'valid' | 'missing' | 'expired' | 'expiring_soon' = 'valid';
        if (r.expiresAt && r.expiresAt <= now) status = 'expired';
        else if (r.expiresAt && r.expiresAt <= expiringCutoff) {
          status = 'expiring_soon';
        }
        return {
          credentialId: r.id,
          certificationId: r.certificationId,
          certificationCode: r.certification.code,
          certificationName: r.certification.name,
          expiresAt: r.expiresAt?.toISOString() ?? null,
          status,
          lastVerificationStatus: r.lastVerificationStatus,
        };
      }),
    };
    this.logger.log(
      JSON.stringify({
        type: 'project_compliance.worker.evaluate',
        projectId,
        workerId,
        requiredCount: detail.required.length,
        actualCount: detail.actual.length,
        durationMs: Date.now() - started,
      }),
    );
    return detail;
  }

  async listRules(projectId: number) {
    return this.prisma.projectComplianceRule.findMany({
      where: { projectId, active: true },
      include: {
        certification: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createRule(
    projectId: number,
    body: {
      ruleType: Prisma.ProjectComplianceRuleCreateInput['ruleType'];
      requiredCredentialTypeId: number;
      metadata?: RuleMetadata;
    },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.projectComplianceRule.create({
      data: {
        projectId,
        companyId: project.companyId,
        ruleType: body.ruleType,
        requiredCredentialTypeId: body.requiredCredentialTypeId,
        metadata: (body.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        certification: { select: { id: true, code: true, name: true } },
      },
    });
  }

  private async loadRules(projectId: number): Promise<EvaluatorRule[]> {
    const rows = await this.prisma.projectComplianceRule.findMany({
      where: { projectId, active: true },
      include: {
        certification: { select: { code: true, name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      ruleType: r.ruleType,
      requiredCredentialTypeId: r.requiredCredentialTypeId,
      certificationCode: r.certification.code,
      certificationName: r.certification.name,
      metadata: (r.metadata ?? {}) as RuleMetadata,
    }));
  }
}
