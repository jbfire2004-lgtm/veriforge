import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification/verification.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../modules/adoption-analytics/adoption-analytics.constants';
import { Optional } from '@nestjs/common';
import { CompanyLinksService } from '../modules/vera-core/company-links.service';
import type { CreateWorkerDto } from './dto/create-worker.dto';
import type { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(
    private prisma: PrismaService,
    private verification: VerificationService,
    private readonly monitoring: Phase1MonitoringService,
    private readonly companyLinks: CompanyLinksService,
    @Optional() private readonly adoption?: AdoptionEventService,
  ) {}

  // LIST ALL WORKERS
  async findAll() {
    return this.prisma.worker.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        company: true,
      },
    });
  }

  async findByCompany(companyId: number) {
    return this.prisma.worker.findMany({
      where: { companyId },
      orderBy: { lastName: 'asc' },
      include: { company: true },
    });
  }

  async registerHeartbeat(id: number) {
    const existing = await this.prisma.worker.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Worker not found');

    const now = new Date();
    await this.prisma.$executeRawUnsafe(
      `
      UPDATE "Worker"
      SET last_heartbeat = $2
      WHERE id = $1
      `,
      id,
      now,
    );

    return {
      id,
      lastHeartbeat: now.toISOString(),
    };
  }

  /** Worker profile linked to a user account (for self-access checks). */
  async findWorkerIdByUserId(userId: number): Promise<number | null> {
    const w = await this.prisma.worker.findFirst({
      where: { userId },
      select: { id: true },
    });
    return w?.id ?? null;
  }

  // BASIC WORKER BY ID (+ relations used by admin worker detail UI)
  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        company: true,
        trainingRecords: {
          include: { certification: true },
          orderBy: { expiresAt: 'asc' },
        },
        equipmentAssignments: {
          where: {
            endedAt: null,
            equipmentId: { not: null },
          },
          include: { equipment: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();
    const { trainingRecords, equipmentAssignments, ...rest } = worker;

    const training = trainingRecords.map((t) => ({
      ...t,
      isValid: !t.expiresAt || new Date(t.expiresAt) > now,
    }));

    const equipment = equipmentAssignments
      .filter((a) => a.equipment)
      .map((a) => {
        const eq = a.equipment!;
        return {
          id: a.id,
          equipment: {
            ...eq,
            isSafe: eq.safetyStatus === 'OK',
          },
        };
      });

    return { ...rest, training, equipment };
  }

  // CREATE WORKER
  async create(data: CreateWorkerDto) {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const photoUrl = data.photoUrl?.trim() || null;
    const companyId = data.companyId;

    if (companyId != null) {
      await this.assertCompanyExists(companyId);
    }

    const created = await this.prisma.worker.create({
      data: {
        firstName,
        lastName,
        companyId: null,
        photoUrl,
      },
    });

    if (companyId != null) {
      await this.companyLinks.linkWorker(created.id, companyId);
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: created.id },
      include: { company: true },
    });

    this.monitoring.processing('workers', 'worker.create', {
      workerId: created.id,
      companyId: worker?.companyId ?? null,
    });
    await this.monitoring.persistAudit({
      action: 'worker.create',
      entity: 'Worker',
      entityId: created.id,
      metadata: {
        companyId: worker?.companyId ?? null,
        firstName,
        lastName,
      },
    });
    const trackCompanyId = worker?.companyId ?? companyId;
    if (trackCompanyId && this.adoption) {
      this.adoption.track({
        companyId: trackCompanyId,
        event: ADOPTION_EVENT_TYPES.WORKER_CREATED,
        metadata: { workerId: created.id },
      });
    }
    return worker ?? created;
  }

  /**
   * Move many workers onto one company roster (or back to the unassigned pool).
   */
  async assignCompanyBatch(workerIds: number[], companyId: number | null) {
    const unique = [...new Set(workerIds)];
    if (companyId != null) {
      await this.assertCompanyExists(companyId);
    }

    const found = await this.prisma.worker.findMany({
      where: { id: { in: unique } },
      select: { id: true },
    });
    if (found.length !== unique.length) {
      throw new NotFoundException('One or more workers were not found');
    }

    for (const id of unique) {
      if (companyId != null) {
        await this.companyLinks.linkWorker(id, companyId);
      } else {
        const active = await this.prisma.companyLink.findMany({
          where: { workerId: id, active: true },
        });
        for (const link of active) {
          await this.companyLinks.endAssignment(id, link.companyId);
        }
        await this.prisma.worker.update({
          where: { id },
          data: { companyId: null },
        });
      }
    }

    for (const id of unique) {
      this.monitoring.processing('workers', 'worker.assign-company', {
        workerId: id,
        companyId,
      });
      await this.monitoring.persistAudit({
        action: 'worker.assign-company',
        entity: 'Worker',
        entityId: id,
        metadata: {
          companyId,
          batchSize: unique.length,
        },
      });
    }

    return { updated: unique.length, workerIds: unique, companyId };
  }

  // UPDATE WORKER
  async update(id: number, data: UpdateWorkerDto) {
    const existing = await this.prisma.worker.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Worker not found');

    const firstName =
      data.firstName !== undefined ? data.firstName.trim() : existing.firstName;
    const lastName =
      data.lastName !== undefined ? data.lastName.trim() : existing.lastName;
    const photoUrl =
      data.photoUrl !== undefined
        ? data.photoUrl?.trim() || null
        : existing.photoUrl;

    if (data.companyId !== undefined && data.companyId !== existing.companyId) {
      if (data.companyId != null) {
        await this.assertCompanyExists(data.companyId);
        await this.companyLinks.linkWorker(id, data.companyId);
      } else {
        const active = await this.prisma.companyLink.findMany({
          where: { workerId: id, active: true },
        });
        for (const link of active) {
          await this.companyLinks.endAssignment(id, link.companyId);
        }
        await this.prisma.worker.update({
          where: { id },
          data: { companyId: null },
        });
      }
    }

    const updated = await this.prisma.worker.update({
      where: { id },
      data: {
        firstName,
        lastName,
        photoUrl,
      },
      include: { company: true },
    });
    this.monitoring.processing('workers', 'worker.update', { workerId: id });
    await this.monitoring.persistAudit({
      action: 'worker.update',
      entity: 'Worker',
      entityId: id,
      metadata: {
        changedFields: Object.keys(data),
        companyId: updated.companyId,
      },
    });
    return updated;
  }

  private async assertCompanyExists(companyId: number) {
    if (!Number.isFinite(companyId)) {
      throw new BadRequestException('Invalid companyId');
    }
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
  }

  // DELETE WORKER
  async remove(id: number) {
    const existing = await this.prisma.worker.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Worker not found');

    await this.prisma.worker.delete({ where: { id } });
    this.monitoring.processing('workers', 'worker.delete', { workerId: id });
    await this.monitoring.persistAudit({
      action: 'worker.delete',
      entity: 'Worker',
      entityId: id,
      metadata: { companyId: existing.companyId },
    });
    return { status: 'ok', deletedId: id };
  }

  // ---------------------------------------------------------
  // PHASE 1: COMPLIANCE ENGINE (TRAINING + DOCUMENTS)
  // ---------------------------------------------------------
  async getCompliance(workerId: number) {
    return this.verification.evaluateWorkerCompliance(workerId);
  }

  // ---------------------------------------------------------
  // FULL WORKER PROFILE + PHASE 1 COMPLIANCE
  // ---------------------------------------------------------
  async getProfile(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        company: true,
        trainingRecords: {
          include: { certification: true },
          orderBy: { expiresAt: 'asc' },
        },
        credentials: {
          include: { certification: true },
          orderBy: { expiresAt: 'asc' },
        },
        incidents: {
          orderBy: { createdAt: 'desc' },
        },
        workerSiteAccess: {
          include: { site: true },
          orderBy: { updatedAt: 'desc' },
        },
        digitalSignoff: {
          include: {
            supervisor: true,
            equipment: true,
            site: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: { where: { type: 'TRAINING' } },
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();

    const expiredTraining = worker.trainingRecords.filter(
      (t) => t.expiresAt && t.expiresAt <= now,
    );
    const expiredCredentials = worker.credentials.filter(
      (c) => c.expiresAt && c.expiresAt <= now,
    );

    // Phase 1 compliance
    const compliance = await this.verification.evaluateWorkerCompliance(id);

    return {
      id: worker.id,
      firstName: worker.firstName,
      lastName: worker.lastName,
      fullName: `${worker.firstName} ${worker.lastName}`,
      company: worker.company
        ? { id: worker.company.id, name: worker.company.name }
        : null,
      photoUrl: worker.photoUrl ?? null,
      training: {
        records: worker.trainingRecords,
        expiredCount: expiredTraining.length,
      },
      credentials: {
        records: worker.credentials,
        expiredCount: expiredCredentials.length,
      },
      incidents: worker.incidents,
      siteAccess: worker.workerSiteAccess,
      signoffs: worker.digitalSignoff,

      // NEW: Phase 1 compliance block
      compliance,
    };
  }
}
