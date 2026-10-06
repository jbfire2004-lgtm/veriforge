import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // ONE ENGINE — NOW WITH FULL CONFLICT + SAFETY RULES
  // ---------------------------------------------------------
  async assign(data: {
    workerId: number;
    assignedBy?: number;
    equipmentId?: number;
    siteId?: number;
    companyId?: number;
  }) {
    const now = new Date();

    // ---------------------------------------------------------
    // 1. Validate worker
    // ---------------------------------------------------------
    const worker = await this.prisma.worker.findUnique({
      where: { id: data.workerId },
      include: {
        trainingRecords: true,
        credentials: true,
        incidents: true,
        workerSiteAccess: true,
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    // ---------------------------------------------------------
    // 2. Validate target
    // ---------------------------------------------------------
    if (!data.equipmentId && !data.siteId && !data.companyId) {
      throw new BadRequestException('No assignment target provided');
    }

    // ---------------------------------------------------------
    // 3. RULE: Worker cannot be assigned if suspended
    // ---------------------------------------------------------
    if (worker.status === 'SUSPENDED') {
      throw new ForbiddenException('Worker is suspended');
    }

    // ---------------------------------------------------------
    // 4. RULE: Worker cannot be assigned if they have open incidents
    // ---------------------------------------------------------
    const openIncidents = worker.incidents.filter((i) => i.status !== 'CLOSED');
    if (openIncidents.length > 0) {
      throw new ForbiddenException(
        `Worker has ${openIncidents.length} open incident(s)`,
      );
    }

    // ---------------------------------------------------------
    // 5. RULE: Worker cannot be assigned with expired training
    // ---------------------------------------------------------
    const expiredTraining = worker.trainingRecords.some(
      (t) => t.expiresAt && t.expiresAt <= now,
    );
    if (expiredTraining) {
      throw new ForbiddenException(
        'Worker has expired training and cannot be assigned',
      );
    }

    // ---------------------------------------------------------
    // 6. RULE: Worker cannot be assigned to two sites at once
    // ---------------------------------------------------------
    if (data.siteId) {
      const activeSiteAssignment = await this.prisma.workerAssignment.findFirst(
        {
          where: {
            workerId: data.workerId,
            siteId: { not: null },
            endedAt: null,
          },
        },
      );

      if (activeSiteAssignment) {
        throw new ForbiddenException(
          'Worker is already assigned to another site',
        );
      }
    }

    // ---------------------------------------------------------
    // 7. RULE: Equipment must be safe
    // ---------------------------------------------------------
    if (data.equipmentId) {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: data.equipmentId },
      });
      if (!eq) throw new NotFoundException('Equipment not found');

      if (eq.safetyStatus !== 'OK') {
        throw new ForbiddenException(
          `Equipment is marked unsafe (${eq.safetyStatus})`,
        );
      }
    }

    // ---------------------------------------------------------
    // 8. RULE: Site must be active
    // ---------------------------------------------------------
    if (data.siteId) {
      const site = await this.prisma.site.findUnique({
        where: { id: data.siteId },
      });
      if (!site) throw new NotFoundException('Site not found');

      if (!site.active) {
        throw new ForbiddenException('Site is not active');
      }
    }

    // ---------------------------------------------------------
    // 9. RULE: Worker must belong to company (if required)
    // ---------------------------------------------------------
    if (data.companyId && worker.companyId !== data.companyId) {
      throw new ForbiddenException('Worker does not belong to this company');
    }

    // ---------------------------------------------------------
    // 10. RULE: Worker must not be banned from site
    // ---------------------------------------------------------
    if (data.siteId) {
      const banned = worker.workerSiteAccess.some(
        (a) => a.siteId === data.siteId && a.status === 'BANNED',
      );
      if (banned) {
        throw new ForbiddenException('Worker is banned from this site');
      }
    }

    // ---------------------------------------------------------
    // 11. RULE: Worker must have required training for equipment
    // ---------------------------------------------------------
    if (data.equipmentId) {
      const required = await this.prisma.equipmentTrainingRequirement.findMany({
        where: { equipmentId: data.equipmentId },
      });

      for (const req of required) {
        const hasTraining = worker.trainingRecords.some(
          (t) => t.certificationId === req.certificationId,
        );

        if (!hasTraining) {
          throw new ForbiddenException(
            `Worker lacks required training: ${req.certificationId}`,
          );
        }
      }
    }

    // ---------------------------------------------------------
    // 12. CREATE ASSIGNMENT
    // ---------------------------------------------------------
    const assignment = await this.prisma.workerAssignment.create({
      data: {
        workerId: data.workerId,
        equipmentId: data.equipmentId ?? null,
        siteId: data.siteId ?? null,
        companyId: data.companyId ?? null,
        assignedBy: data.assignedBy ?? null,
      },
      include: {
        worker: true,
        equipment: true,
        site: true,
        company: true,
      },
    });

    // ---------------------------------------------------------
    // 13. AUDIT LOG
    // ---------------------------------------------------------
    await this.prisma.auditLog.create({
      data: {
        actorId: data.assignedBy ?? null,
        action: 'ASSIGN_WORKER',
        entityType: 'WorkerAssignment',
        entityId: String(assignment.id),
        metadataJson: assignment,
      },
    });

    // ---------------------------------------------------------
    // 14. NOTIFY SUPERVISORS
    // ---------------------------------------------------------
    const supervisors = await this.prisma.user.findMany({
      where: { role: 'SUPERVISOR' },
    });

    for (const sup of supervisors) {
      await this.prisma.notification.create({
        data: {
          userId: sup.id,
          channel: 'PUSH',
          type: 'WORKER_ASSIGNED',
          payload: {
            title: 'Worker Assigned',
            body: `${worker.firstName} ${worker.lastName} was assigned.`,
          },
        },
      });
    }

    return assignment;
  }

  // ---------------------------------------------------------
  // END ASSIGNMENT
  // ---------------------------------------------------------
  async end(id: number) {
    const existing = await this.prisma.workerAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Assignment not found');

    const updated = await this.prisma.workerAssignment.update({
      where: { id },
      data: { endedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'END_ASSIGNMENT',
        entityType: 'WorkerAssignment',
        entityId: String(id),
        metadataJson: updated,
      },
    });

    return updated;
  }

  // ---------------------------------------------------------
  // ACTIVE + HISTORY
  // ---------------------------------------------------------
  async activeForWorker(workerId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { workerId, endedAt: null },
      include: { equipment: true, site: true, company: true },
    });
  }

  async historyForWorker(workerId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { workerId },
      orderBy: { assignedAt: 'desc' },
      include: { equipment: true, site: true, company: true },
    });
  }
}
