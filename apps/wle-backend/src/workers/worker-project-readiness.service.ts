import { Injectable, NotFoundException } from '@nestjs/common';
import { PmCompanyTrainingRoleType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import { OrientationAccessService } from '../modules/orientation/orientation-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerTrainingHydrationService } from './worker-training-hydration.service';
import type {
  WorkerProjectReadinessJson,
  WorkerProjectReadinessResult,
  WorkerProjectReadinessStatus,
} from './worker-project-readiness.types';

const EXPIRING_SOON_DAYS = 30;

@Injectable()
export class WorkerProjectReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingHydration: WorkerTrainingHydrationService,
    private readonly orientationAccess: OrientationAccessService,
    private readonly contractorCompliance: ContractorComplianceEngineService,
  ) {}

  async evaluate(
    workerId: number,
    projectId: number,
  ): Promise<WorkerProjectReadinessResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, companyId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        company: { select: { id: true, name: true } },
        trainingRecords: {
          where: { OR: [{ projectId }, { projectId: null }] },
          select: {
            id: true,
            expiresAt: true,
            lastVerificationStatus: true,
            certification: { select: { code: true, name: true } },
          },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();
    const expiringCutoff = new Date(
      now.getTime() + EXPIRING_SOON_DAYS * 86_400_000,
    );

    const roleType = await this.resolveRoleType(
      workerId,
      worker.companyId,
      projectId,
    );
    const requiredCodes = await this.resolveRequiredTrainingCodes(
      projectId,
      project.companyId,
    );

    const hydration = await this.trainingHydration.hydrateWorkerTraining(
      workerId,
      {
        projectId,
        roleType,
        requiredCodes,
      },
    );

    const blocking_items: string[] = [];
    const non_blocking_items: string[] = [];
    const fix_steps: string[] = [];

    let unverified = 0;
    let expiring_soon = 0;

    for (const req of hydration.requirements) {
      const record = worker.trainingRecords.find(
        (r) => r.id === req.matchedRecordId,
      );
      const label = req.name || req.code;

      if (req.status === 'missing') {
        blocking_items.push(`Missing required training: ${label}`);
        fix_steps.push(`Complete and upload verified training for ${label}.`);
        continue;
      }

      if (req.status === 'expired') {
        blocking_items.push(`Expired training: ${label}`);
        fix_steps.push(`Renew ${label} and submit a verified certificate.`);
        continue;
      }

      const verification = record?.lastVerificationStatus;
      if (verification !== 'VERIFIED') {
        unverified += 1;
        blocking_items.push(
          `Unverified training record: ${label}${
            verification ? ` (${verification})` : ''
          }`,
        );
        fix_steps.push(
          `Verify training record for ${label} through Core verification.`,
        );
      }

      if (req.expiresAt) {
        const expires = new Date(req.expiresAt);
        if (expires > now && expires <= expiringCutoff) {
          expiring_soon += 1;
          non_blocking_items.push(
            `Training expiring soon: ${label} (${req.expiresAt.slice(0, 10)})`,
          );
          fix_steps.push(
            `Schedule renewal for ${label} before ${req.expiresAt.slice(
              0,
              10,
            )}.`,
          );
        }
      }
    }

    const orientation = await this.evaluateOrientation(
      workerId,
      project.companyId,
      projectId,
    );
    const orientationResult = {
      current: orientation.current,
      blocking_packages: orientation.blockingPackages.map((p) => p.title),
    };

    if (!orientation.current) {
      if (orientation.blockingPackages.length) {
        blocking_items.push(
          `Site orientation incomplete: ${orientation.blockingPackages
            .map((p) => p.title)
            .join(', ')}`,
        );
      } else {
        blocking_items.push('Site orientation not completed for this project');
      }
      fix_steps.push('Complete current site orientation before mobilization.');
    }

    const contractor_prequalification =
      await this.evaluateContractorPrequalification(
        worker.companyId,
        project.companyId,
        projectId,
        worker.company?.name,
      );

    if (contractor_prequalification.required) {
      if (contractor_prequalification.status === 'rejected') {
        blocking_items.push(
          `Contractor company not prequalified: ${
            contractor_prequalification.company_name ?? 'Employer'
          }`,
        );
        fix_steps.push(
          'Contractor must resolve compliance gaps and receive prime approval before workers mobilize.',
        );
      } else if (contractor_prequalification.status === 'conditional') {
        non_blocking_items.push(
          `Contractor conditionally approved — verify hold points for ${
            contractor_prequalification.company_name ?? 'employer'
          }`,
        );
        fix_steps.push(
          'Confirm contractor conditional approval conditions are met on site today.',
        );
      }
    }

    if (hydration.summary.hasBlockingRestrictions) {
      for (const r of hydration.restrictions.filter(
        (x) => x.active && x.blocksHighRisk,
      )) {
        blocking_items.push(`Medical restriction: ${r.description}`);
        fix_steps.push(
          `Review medical restriction with occupational health before assigning work.`,
        );
      }
    }

    const optionalGaps = await this.findOptionalTrainingGaps(
      workerId,
      worker.companyId,
      requiredCodes,
      roleType,
    );
    for (const gap of optionalGaps) {
      non_blocking_items.push(gap);
      fix_steps.push(`Complete optional training: ${gap}`);
    }

    const training_summary = {
      required: hydration.requirements.length,
      valid_verified: hydration.requirements.filter((r) => {
        if (r.status !== 'valid') return false;
        const record = worker.trainingRecords.find(
          (tr) => tr.id === r.matchedRecordId,
        );
        return record?.lastVerificationStatus === 'VERIFIED';
      }).length,
      expired: hydration.requirements.filter((r) => r.status === 'expired')
        .length,
      missing: hydration.requirements.filter((r) => r.status === 'missing')
        .length,
      unverified,
      expiring_soon,
    };

    const status = this.decideStatus(blocking_items, non_blocking_items);
    const core: WorkerProjectReadinessJson = {
      status,
      blocking_items: [...new Set(blocking_items)],
      non_blocking_items: [...new Set(non_blocking_items)],
      fix_steps: [...new Set(fix_steps)].slice(0, 12),
      supervisor_message: this.buildSupervisorMessage(
        worker.firstName,
        worker.lastName,
        project.name,
        status,
        blocking_items,
        non_blocking_items,
      ),
    };

    return {
      ...core,
      readiness_id: randomUUID(),
      worker_id: workerId,
      project_id: projectId,
      evaluated_at: new Date().toISOString(),
      contractor_prequalification,
      orientation: orientationResult,
      training_summary,
    };
  }

  private async resolveRoleType(
    workerId: number,
    companyId: number | null,
    projectId: number,
  ): Promise<PmCompanyTrainingRoleType> {
    const assignment = await this.prisma.projectAssignment.findFirst({
      where: { workerId, projectId, status: 'ACTIVE' },
      orderBy: { assignedAt: 'desc' },
    });

    const link = companyId
      ? await this.prisma.companyLink.findFirst({
          where: { workerId, companyId, active: true },
          orderBy: { startDate: 'desc' },
        })
      : null;

    const role = link?.role?.toLowerCase() ?? '';
    if (
      role.includes('supervisor') ||
      role.includes('foreman') ||
      role.includes('lead')
    ) {
      return PmCompanyTrainingRoleType.supervisor;
    }
    if (role.includes('operator')) {
      return PmCompanyTrainingRoleType.equipment_operator;
    }
    if (role.includes('subcontractor') || role.includes('sub')) {
      return PmCompanyTrainingRoleType.subcontractor;
    }
    return PmCompanyTrainingRoleType.worker;
  }

  private async resolveRequiredTrainingCodes(
    projectId: number,
    primeCompanyId: number,
  ): Promise<string[]> {
    const codes = new Set<string>();

    const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
      where: { projectId, status: 'published' },
    });
    const projectRequired = profile?.requiredTraining;
    if (Array.isArray(projectRequired)) {
      for (const item of projectRequired) {
        if (typeof item === 'string' && item.trim()) codes.add(item.trim());
      }
    }

    const siteRule = await this.prisma.siteAccessRule.findUnique({
      where: { projectId_zoneCode: { projectId, zoneCode: 'SITE' } },
    });
    const ruleCodes = siteRule?.requiresTrainingCodes;
    if (Array.isArray(ruleCodes)) {
      for (const item of ruleCodes) {
        if (typeof item === 'string' && item.trim()) codes.add(item.trim());
      }
    }

    if (!codes.size) {
      codes.add('Site orientation');
      codes.add('WHMIS');
      codes.add('Fall protection');
    }

    return [...codes];
  }

  private async evaluateOrientation(
    workerId: number,
    companyId: number,
    projectId: number,
  ) {
    const packageAccess = await this.orientationAccess.evaluateWorker(
      workerId,
      {
        companyId,
        projectId,
      },
    );

    if (!packageAccess.allowed) {
      return {
        current: false,
        blockingPackages: packageAccess.blockingPackages,
      };
    }

    const siteForm = await this.prisma.safetyForm.findFirst({
      where: {
        workerId,
        projectId,
        definitionId: 'site-orientation',
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      current: !!siteForm,
      blockingPackages: siteForm ? [] : packageAccess.blockingPackages,
    };
  }

  private async evaluateContractorPrequalification(
    workerCompanyId: number | null,
    primeCompanyId: number,
    projectId: number,
    companyName?: string,
  ) {
    if (!workerCompanyId || workerCompanyId === primeCompanyId) {
      return {
        required: false,
        status: 'not_applicable' as const,
        company_name: companyName,
      };
    }

    const membership = await this.prisma.pmContractorPortalMembership.findFirst(
      {
        where: {
          primeCompanyId,
          contractorCompanyId: workerCompanyId,
          active: true,
          OR: [{ projectId }, { projectId: null }],
        },
        orderBy: { createdAt: 'desc' },
      },
    );

    if (!membership) {
      return {
        required: true,
        status: 'rejected' as const,
        company_name: companyName,
      };
    }

    const input = await this.contractorCompliance.buildInputFromMembership(
      membership.id,
    );
    const result = this.contractorCompliance.generate(input);

    const status =
      result.approval_status === 'approve'
        ? ('approved' as const)
        : result.approval_status === 'conditional'
        ? ('conditional' as const)
        : ('rejected' as const);

    return {
      required: true,
      status,
      company_name: companyName,
    };
  }

  private async findOptionalTrainingGaps(
    workerId: number,
    companyId: number | null,
    projectRequired: string[],
    roleType: PmCompanyTrainingRoleType,
  ): Promise<string[]> {
    if (!companyId) return [];

    const matrix = await this.prisma.pmCompanyTrainingMatrix.findMany({
      where: {
        companyId,
        roleType,
        active: true,
        status: 'published',
      },
    });

    const projectRequiredLower = new Set(
      projectRequired.map((c) => c.toLowerCase()),
    );
    const optionalCodes = matrix
      .map((m) => m.trainingName || m.trainingCode)
      .filter((code) => !projectRequiredLower.has(code.toLowerCase()));

    if (!optionalCodes.length) return [];

    const hydration = await this.trainingHydration.hydrateWorkerTraining(
      workerId,
      {
        roleType,
        requiredCodes: optionalCodes,
      },
    );

    return hydration.requirements
      .filter((r) => r.status !== 'valid')
      .filter(
        (r) =>
          !projectRequired.some(
            (p) => p.toLowerCase() === r.code.toLowerCase(),
          ),
      )
      .map((r) => `Optional: ${r.name || r.code} (${r.status})`);
  }

  private decideStatus(
    blocking: string[],
    nonBlocking: string[],
  ): WorkerProjectReadinessStatus {
    if (blocking.length > 0) return 'NOT QUALIFIED';
    if (nonBlocking.length > 0) return 'RESTRICTED';
    return 'READY';
  }

  private buildSupervisorMessage(
    firstName: string,
    lastName: string,
    projectName: string,
    status: WorkerProjectReadinessStatus,
    blocking: string[],
    nonBlocking: string[],
  ): string {
    const name = `${firstName} ${lastName}`.trim();

    if (status === 'READY') {
      return `${name} is cleared for work on ${projectName} today. All required training is verified, orientation is current, and employer prequalification is satisfied.`;
    }

    if (status === 'NOT QUALIFIED') {
      const reasons = blocking.slice(0, 3).join('; ');
      return `Do not assign ${name} to ${projectName} today. Blocking items: ${reasons}. Resolve all blocking items before site access.`;
    }

    const cautions = nonBlocking.slice(0, 3).join('; ');
    return `${name} may work on ${projectName} with restrictions. Address: ${cautions}. Maintain supervisor oversight until items are closed.`;
  }
}
