import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type FieldOfflineBundle = {
  syncedAt: string;
  worker: unknown | null;
  projectAssignments: unknown[];
  projects: unknown[];
  safetyForms: unknown[];
  credentials: unknown[];
  safetyFormDefinitions: unknown[];
  safetyFormTemplates: unknown[];
};

const TRAINING_SELECT = {
  id: true,
  workerId: true,
  companyId: true,
  projectId: true,
  issuedAt: true,
  expiresAt: true,
  certificateNumber: true,
  certificateQrToken: true,
  lastVerificationStatus: true,
  verifiedAt: true,
  certification: { select: { id: true, name: true, code: true } },
  worker: {
    select: { id: true, firstName: true, lastName: true, qrToken: true },
  },
} as const;

const SAFETY_FORM_SELECT = {
  id: true,
  definitionId: true,
  definitionVersion: true,
  formType: true,
  status: true,
  title: true,
  formData: true,
  sifFlag: true,
  hecaFlag: true,
  companyId: true,
  projectId: true,
  siteId: true,
  workerId: true,
  equipmentId: true,
  supervisorId: true,
  clientSyncId: true,
  clientVersion: true,
  offlinePending: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class FieldOfflineBundleService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchBundle(params: {
    companyId?: number;
    workerId?: number;
  }): Promise<FieldOfflineBundle> {
    const syncedAt = new Date().toISOString();
    const { companyId, workerId } = params;

    let worker: unknown | null = null;
    let projectAssignments: unknown[] = [];
    let projectIds: number[] = [];
    let coworkerIds: number[] = [];

    if (workerId != null) {
      const row = await this.prisma.worker.findUnique({
        where: { id: workerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          qrToken: true,
          status: true,
          companyId: true,
          userId: true,
        },
      });
      if (!row) throw new NotFoundException('Worker not found');
      worker = row;

      const assignments = await this.prisma.projectAssignment.findMany({
        where: {
          workerId,
          status: 'ACTIVE',
          endedAt: null,
          ...(companyId != null ? { companyId } : {}),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              companyId: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        take: 50,
      });
      projectAssignments = assignments;
      projectIds = assignments.map((a) => a.projectId);

      if (projectIds.length) {
        const peers = await this.prisma.projectAssignment.findMany({
          where: {
            projectId: { in: projectIds },
            status: 'ACTIVE',
            endedAt: null,
          },
          select: { workerId: true },
          distinct: ['workerId'],
          take: 200,
        });
        coworkerIds = peers.map((p) => p.workerId);
      } else {
        coworkerIds = [workerId];
      }
    }

    const projects =
      projectIds.length > 0
        ? await this.prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              companyId: true,
              startDate: true,
              endDate: true,
            },
          })
        : companyId != null
        ? await this.prisma.project.findMany({
            where: { companyId },
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              companyId: true,
              startDate: true,
              endDate: true,
            },
            take: 100,
          })
        : [];

    const effectiveProjectIds =
      projectIds.length > 0 ? projectIds : projects.map((p) => p.id);

    const safetyFormWhere =
      workerId != null
        ? {
            OR: [
              { workerId },
              ...(effectiveProjectIds.length
                ? [{ projectId: { in: effectiveProjectIds } }]
                : []),
            ],
            ...(companyId != null ? { companyId } : {}),
          }
        : companyId != null
        ? {
            OR: [
              { companyId },
              ...(effectiveProjectIds.length
                ? [{ projectId: { in: effectiveProjectIds } }]
                : []),
            ],
          }
        : null;

    const [
      safetyForms,
      credentials,
      safetyFormDefinitions,
      safetyFormTemplates,
    ] = await Promise.all([
      safetyFormWhere
        ? this.prisma.safetyForm.findMany({
            where: safetyFormWhere,
            select: SAFETY_FORM_SELECT,
            orderBy: { updatedAt: 'desc' },
            take: 300,
          })
        : Promise.resolve([]),
      this.fetchCredentials({
        workerId,
        coworkerIds,
        companyId,
      }),
      companyId != null
        ? this.prisma.safetyFormDefinition.findMany({
            where: {
              OR: [{ companyId: null }, { companyId }],
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              category: true,
              version: true,
              definition: true,
              companyId: true,
              updatedAt: true,
            },
          })
        : this.prisma.safetyFormDefinition.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              category: true,
              version: true,
              definition: true,
              companyId: true,
              updatedAt: true,
            },
            take: 100,
          }),
      companyId != null
        ? this.prisma.safetyFormTemplate.findMany({
            where: {
              active: true,
              OR: [{ companyId }, { companyId: null }],
            },
            select: {
              id: true,
              formType: true,
              name: true,
              schemaVersion: true,
              template: true,
              companyId: true,
              projectId: true,
            },
            take: 50,
          })
        : Promise.resolve([]),
    ]);

    return {
      syncedAt,
      worker,
      projectAssignments,
      projects,
      safetyForms,
      credentials,
      safetyFormDefinitions,
      safetyFormTemplates,
    };
  }

  private async fetchCredentials(params: {
    workerId?: number;
    coworkerIds: number[];
    companyId?: number;
  }) {
    const workerIds = [
      ...new Set(
        params.workerId != null
          ? [params.workerId, ...params.coworkerIds]
          : params.coworkerIds,
      ),
    ].filter(Boolean);

    if (workerIds.length === 0 && params.companyId == null) {
      return [];
    }

    return this.prisma.trainingRecord.findMany({
      where: {
        ...(workerIds.length ? { workerId: { in: workerIds } } : {}),
        ...(params.companyId != null ? { companyId: params.companyId } : {}),
      },
      select: TRAINING_SELECT,
      orderBy: { issuedAt: 'desc' },
      take: 400,
    });
  }
}
