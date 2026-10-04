import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PmContractorPortalAccessService,
  type PortalActor,
} from './pm-contractor-portal-access.service';

@Injectable()
export class PmContractorPortalComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PmContractorPortalAccessService,
  ) {}

  async getDashboard(actor: PortalActor, projectId?: number) {
    const contractorCompanyId = this.access.requireContractorCompany(actor);
    const workerIds = await this.access.getContractorWorkerIds(
      contractorCompanyId,
    );
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [workers, trainingRecords, credentials, equipmentAudits] =
      await Promise.all([
        this.prisma.worker.findMany({
          where: { id: { in: workerIds.length ? workerIds : [-1] } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
          take: 200,
        }),
        this.prisma.trainingRecord.findMany({
          where: {
            workerId: { in: workerIds.length ? workerIds : [-1] },
            ...(projectId
              ? { projectId }
              : {
                  OR: [{ companyId: contractorCompanyId }, { companyId: null }],
                }),
          },
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
            certification: { select: { id: true, name: true } },
          },
          orderBy: { expiresAt: 'asc' },
          take: 200,
        }),
        this.prisma.credential.findMany({
          where: { workerId: { in: workerIds.length ? workerIds : [-1] } },
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
            certification: { select: { id: true, name: true } },
          },
          orderBy: { expiresAt: 'asc' },
          take: 200,
        }),
        this.prisma.companyEquipmentAuditView.findMany({
          where: { companyId: contractorCompanyId },
          include: {
            equipment: { select: { id: true, name: true, serialNumber: true } },
          },
          take: 100,
        }),
      ]);

    const trainingExpired = trainingRecords.filter(
      (t) => t.expiresAt && t.expiresAt < now,
    );
    const trainingExpiringSoon = trainingRecords.filter(
      (t) => t.expiresAt && t.expiresAt >= now && t.expiresAt <= soon,
    );
    const trainingCurrent = trainingRecords.filter(
      (t) => !t.expiresAt || t.expiresAt > soon,
    );

    const credExpired = credentials.filter(
      (c) => c.expiresAt && c.expiresAt < now,
    );
    const credExpiringSoon = credentials.filter(
      (c) => c.expiresAt && c.expiresAt >= now && c.expiresAt <= soon,
    );

    const equipmentNonCompliant = equipmentAudits.filter(
      (e) => !e.preUseCompliant7d || !e.formalCompliant,
    );

    return {
      summary: {
        workersTotal: workers.length,
        trainingExpired: trainingExpired.length,
        trainingExpiringSoon: trainingExpiringSoon.length,
        credentialsExpired: credExpired.length,
        credentialsExpiringSoon: credExpiringSoon.length,
        equipmentNonCompliant: equipmentNonCompliant.length,
        equipmentTotal: equipmentAudits.length,
      },
      workers,
      training: {
        expired: trainingExpired,
        expiringSoon: trainingExpiringSoon,
        current: trainingCurrent.slice(0, 50),
      },
      certifications: {
        expired: credExpired,
        expiringSoon: credExpiringSoon,
      },
      equipment: {
        nonCompliant: equipmentNonCompliant,
        compliant: equipmentAudits.filter(
          (e) => e.preUseCompliant7d && e.formalCompliant,
        ),
      },
    };
  }
}
