import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export type PortalActor = {
  userId: number;
  role: UserRole;
  companyId: number | null;
};

export const CONTRACTOR_ROLES: UserRole[] = [
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

export const PRIME_PORTAL_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Injectable()
export class PmContractorPortalAccessService {
  constructor(private readonly prisma: PrismaService) {}

  isContractorRole(role: UserRole) {
    return CONTRACTOR_ROLES.includes(role);
  }

  requireContractorCompany(actor: PortalActor): number {
    if (!this.isContractorRole(actor.role)) {
      throw new ForbiddenException('Contractor portal access required');
    }
    if (!actor.companyId) {
      throw new ForbiddenException(
        'User is not linked to a contractor company',
      );
    }
    return actor.companyId;
  }

  async assertContractorAccess(
    actor: PortalActor,
    contractorCompanyId?: number,
  ) {
    const expected =
      contractorCompanyId ?? this.requireContractorCompany(actor);
    if (this.isContractorRole(actor.role) && actor.companyId !== expected) {
      throw new ForbiddenException('Cannot access another contractor tenant');
    }
    return expected;
  }

  async assertMembership(
    primeCompanyId: number,
    contractorCompanyId: number,
    projectId?: number,
  ) {
    const membership = await this.prisma.pmContractorPortalMembership.findFirst(
      {
        where: {
          primeCompanyId,
          contractorCompanyId,
          active: true,
          ...(projectId ? { OR: [{ projectId: null }, { projectId }] } : {}),
        },
      },
    );
    if (!membership) {
      throw new ForbiddenException(
        'No active portal membership for this prime/contractor pair',
      );
    }
    return membership;
  }

  async listMembershipsForContractor(contractorCompanyId: number) {
    return this.prisma.pmContractorPortalMembership.findMany({
      where: { contractorCompanyId, active: true },
      include: {
        primeCompany: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMembershipsForPrime(primeCompanyId: number, projectId?: number) {
    return this.prisma.pmContractorPortalMembership.findMany({
      where: {
        primeCompanyId,
        active: true,
        ...(projectId ? { OR: [{ projectId: null }, { projectId }] } : {}),
      },
      include: {
        contractorCompany: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async ensureMembership(
    primeCompanyId: number,
    contractorCompanyId: number,
    projectId?: number,
  ) {
    const existing = await this.prisma.pmContractorPortalMembership.findFirst({
      where: {
        primeCompanyId,
        contractorCompanyId,
        projectId: projectId ?? null,
      },
    });
    let membership;
    if (existing) {
      if (!existing.active) {
        membership = await this.prisma.pmContractorPortalMembership.update({
          where: { id: existing.id },
          data: { active: true },
        });
      } else {
        membership = existing;
      }
    } else {
      membership = await this.prisma.pmContractorPortalMembership.create({
        data: { primeCompanyId, contractorCompanyId, projectId },
      });
    }

    if (projectId) {
      await this.syncSubcontractorOnProject(projectId, contractorCompanyId);
    }

    return membership;
  }

  private async syncSubcontractorOnProject(
    projectId: number,
    contractorCompanyId: number,
  ) {
    const config = await this.prisma.pmProjectConfig.findUnique({
      where: { projectId },
      select: { subcontractorIds: true },
    });
    const configIds = parseSubcontractorIds(config?.subcontractorIds);
    if (!configIds.includes(contractorCompanyId)) {
      const next = [...configIds, contractorCompanyId];
      await this.prisma.pmProjectConfig.upsert({
        where: { projectId },
        create: {
          id: randomUUID(),
          projectId,
          subcontractorIds: next as Prisma.InputJsonValue,
        },
        update: { subcontractorIds: next as Prisma.InputJsonValue },
      });
    }

    const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
      where: { projectId },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, subcontractorIds: true },
    });
    if (profile) {
      const profileIds = parseSubcontractorIds(profile.subcontractorIds);
      if (!profileIds.includes(contractorCompanyId)) {
        await this.prisma.pmProjectSafetyProfile.update({
          where: { id: profile.id },
          data: {
            subcontractorIds: [
              ...profileIds,
              contractorCompanyId,
            ] as Prisma.InputJsonValue,
          },
        });
      }
    }
  }

  async getContractorWorkerIds(contractorCompanyId: number): Promise<number[]> {
    const links = await this.prisma.companyLink.findMany({
      where: { companyId: contractorCompanyId, active: true },
      select: { workerId: true },
    });
    const direct = await this.prisma.worker.findMany({
      where: { companyId: contractorCompanyId, status: 'ACTIVE' },
      select: { id: true },
    });
    const ids = new Set<number>([
      ...links.map((l) => l.workerId),
      ...direct.map((w) => w.id),
    ]);
    return [...ids];
  }

  async assertDispatchAccess(actor: PortalActor, dispatchId: string) {
    const dispatch =
      await this.prisma.pmInspectionContractorDispatch.findUnique({
        where: { id: dispatchId },
        include: {
          correctiveAction: {
            select: {
              id: true,
              title: true,
              subcontractorCompanyId: true,
              projectId: true,
              companyId: true,
            },
          },
        },
      });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    await this.assertContractorAccess(actor, dispatch.subcontractorCompanyId);
    return dispatch;
  }

  async assertCorrectiveActionAccess(actor: PortalActor, actionId: string) {
    const action = await this.prisma.pmCorrectiveAction.findFirst({
      where: { id: actionId, deletedAt: null },
    });
    if (!action) throw new NotFoundException('Corrective action not found');
    if (!action.subcontractorCompanyId) {
      throw new ForbiddenException(
        'Corrective action is not assigned to a contractor',
      );
    }
    await this.assertContractorAccess(actor, action.subcontractorCompanyId);
    return action;
  }
}

function parseSubcontractorIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
    .filter((n) => Number.isFinite(n) && n > 0);
}
