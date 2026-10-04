import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import {
  InstructorQualificationStatus,
  UnionHallTrainingStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import { TRAINING_RECORD_WALLET_INCLUDE } from './training-wallet.mapper';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { unionHallRosterUpdateEvent } from '../vera-event-bus/publishers/vera-event-publishers';

export type UnionHallActor = {
  id: number;
  role: string;
  unionHallId?: number | null;
};

const RECEIPT_INCLUDE = {
  trainingRecord: {
    include: {
      ...TRAINING_RECORD_WALLET_INCLUDE,
      worker: { select: { id: true, firstName: true, lastName: true } },
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          qualificationStatus: true,
          qualificationExpiresAt: true,
        },
      },
      trainingProvider: { select: { id: true, name: true } },
      validationResults: { orderBy: { validatedAt: 'desc' as const }, take: 1 },
    },
  },
} as const;

@Injectable()
export class UnionHallTrainingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TrainingWalletIntegrationService))
    private readonly walletIntegration: TrainingWalletIntegrationService,
    @Optional()
    private readonly standardsCompliance?: TrainingStandardsComplianceService,
    @Optional()
    private readonly events?: EventBusService,
  ) {}

  async ensurePendingReceiptsForRecord(
    trainingRecordId: number,
  ): Promise<void> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        id: true,
        trainingProviderId: true,
        providerId: true,
        workerId: true,
      },
    });
    let trainingProviderId = record?.trainingProviderId ?? null;
    if (!trainingProviderId && record?.providerId) {
      const legacy = await this.prisma.provider.findUnique({
        where: { id: record.providerId },
        select: { name: true },
      });
      if (legacy?.name) {
        const mapped = await this.prisma.trainingProvider.findFirst({
          where: { name: { equals: legacy.name, mode: 'insensitive' } },
          select: { id: true },
        });
        trainingProviderId = mapped?.id ?? null;
      }
    }
    if (!record || !trainingProviderId) return;

    const memberships = await this.prisma.unionMembership.findMany({
      where: { workerId: record.workerId, status: 'ACTIVE' },
      select: { unionHallId: true },
    });

    for (const m of memberships) {
      await this.prisma.unionHallProviderLink.upsert({
        where: {
          unionHallId_trainingProviderId: {
            unionHallId: m.unionHallId,
            trainingProviderId,
          },
        },
        create: {
          unionHallId: m.unionHallId,
          trainingProviderId,
          active: true,
        },
        update: { active: true },
      });

      await this.prisma.unionHallTrainingReceipt.upsert({
        where: {
          unionHallId_trainingRecordId: {
            unionHallId: m.unionHallId,
            trainingRecordId: record.id,
          },
        },
        create: {
          unionHallId: m.unionHallId,
          trainingRecordId: record.id,
          status: UnionHallTrainingStatus.PENDING,
        },
        update: {},
      });
    }
  }

  async getDashboard(unionHallId: number, actor: UnionHallActor) {
    await this.assertHallAccess(unionHallId, actor);

    const hall = await this.prisma.unionHall.findUnique({
      where: { id: unionHallId },
    });
    if (!hall) throw new NotFoundException('Union hall not found');

    const receipts = await this.prisma.unionHallTrainingReceipt.findMany({
      where: { unionHallId },
      include: RECEIPT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const providerIds = [
      ...new Set(
        receipts
          .map((r) => r.trainingRecord.trainingProviderId)
          .filter((id): id is number => id != null),
      ),
    ];

    const providers = (
      await Promise.all(providerIds.map((id) => this.providerSummary(id)))
    ).filter((p): p is NonNullable<typeof p> => p != null);

    const instructorMap = new Map<
      number,
      {
        instructorId: number;
        firstName: string;
        lastName: string;
        providerId: number;
        providerName: string;
        qualificationStatus: InstructorQualificationStatus;
        qualificationExpiresAt: string | null;
      }
    >();

    const linkedProviders = await this.prisma.unionHallProviderLink.findMany({
      where: { unionHallId, active: true },
      include: {
        trainingProvider: {
          include: {
            instructors: {
              where: { active: true },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                qualificationStatus: true,
                qualificationExpiresAt: true,
              },
            },
          },
        },
      },
    });

    for (const link of linkedProviders) {
      for (const inst of link.trainingProvider.instructors) {
        instructorMap.set(inst.id, {
          instructorId: inst.id,
          firstName: inst.firstName,
          lastName: inst.lastName,
          providerId: link.trainingProviderId,
          providerName: link.trainingProvider.name,
          qualificationStatus: inst.qualificationStatus,
          qualificationExpiresAt:
            inst.qualificationExpiresAt?.toISOString() ?? null,
        });
      }
    }

    const pending = receipts.filter(
      (r) => r.status === UnionHallTrainingStatus.PENDING,
    );
    const accepted = receipts.filter(
      (r) => r.status === UnionHallTrainingStatus.ACCEPTED,
    );

    return {
      unionHallId,
      unionHallName: hall.name,
      counts: {
        pending: pending.length,
        accepted: accepted.length,
        pushed: receipts.filter(
          (r) => r.status === UnionHallTrainingStatus.PUSHED,
        ).length,
        rejected: receipts.filter(
          (r) => r.status === UnionHallTrainingStatus.REJECTED,
        ).length,
      },
      providerTrainingHistory: receipts.map((r) => this.mapReceipt(r)),
      providers,
      instructors: [...instructorMap.values()],
    };
  }

  async listPending(unionHallId: number, actor: UnionHallActor) {
    await this.assertHallAccess(unionHallId, actor);
    const rows = await this.prisma.unionHallTrainingReceipt.findMany({
      where: {
        unionHallId,
        status: UnionHallTrainingStatus.PENDING,
      },
      include: RECEIPT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapReceipt(r));
  }

  async linkProvider(
    unionHallId: number,
    trainingProviderId: number,
    actor: UnionHallActor,
  ) {
    await this.assertHallAccess(unionHallId, actor);
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: trainingProviderId },
    });
    if (!provider) throw new NotFoundException('Training provider not found');

    return this.prisma.unionHallProviderLink.upsert({
      where: {
        unionHallId_trainingProviderId: { unionHallId, trainingProviderId },
      },
      create: { unionHallId, trainingProviderId, active: true },
      update: { active: true },
      include: { trainingProvider: true },
    });
  }

  async acceptTraining(
    unionHallId: number,
    trainingRecordId: number,
    actor: UnionHallActor,
    notes?: string,
  ) {
    const receipt = await this.requireReceipt(
      unionHallId,
      trainingRecordId,
      actor,
    );
    if (receipt.status !== UnionHallTrainingStatus.PENDING) {
      throw new BadRequestException('Training is not pending acceptance');
    }

    return this.prisma.unionHallTrainingReceipt.update({
      where: { id: receipt.id },
      data: {
        status: UnionHallTrainingStatus.ACCEPTED,
        acceptedAt: new Date(),
        acceptedByUserId: actor.id,
        notes: notes ?? receipt.notes,
      },
      include: RECEIPT_INCLUDE,
    });
  }

  async rejectTraining(
    unionHallId: number,
    trainingRecordId: number,
    actor: UnionHallActor,
    notes?: string,
  ) {
    const receipt = await this.requireReceipt(
      unionHallId,
      trainingRecordId,
      actor,
    );

    return this.prisma.unionHallTrainingReceipt.update({
      where: { id: receipt.id },
      data: {
        status: UnionHallTrainingStatus.REJECTED,
        notes: notes ?? receipt.notes,
      },
      include: RECEIPT_INCLUDE,
    });
  }

  async validateTraining(
    unionHallId: number,
    trainingRecordId: number,
    actor: UnionHallActor,
  ) {
    const receipt = await this.requireReceipt(
      unionHallId,
      trainingRecordId,
      actor,
    );
    if (
      receipt.status !== UnionHallTrainingStatus.ACCEPTED &&
      receipt.status !== UnionHallTrainingStatus.PENDING
    ) {
      throw new BadRequestException(
        'Training must be pending or accepted to validate',
      );
    }

    if (!this.standardsCompliance) {
      throw new BadRequestException('Standards compliance engine unavailable');
    }

    const validation = await this.standardsCompliance.validateTraining(
      trainingRecordId,
    );

    await this.prisma.unionHallTrainingReceipt.update({
      where: { id: receipt.id },
      data: {
        validatedAt: new Date(),
        status:
          receipt.status === UnionHallTrainingStatus.PENDING
            ? UnionHallTrainingStatus.ACCEPTED
            : receipt.status,
        acceptedAt: receipt.acceptedAt ?? new Date(),
        acceptedByUserId: receipt.acceptedByUserId ?? actor.id,
      },
    });

    return { validation, receiptId: receipt.id };
  }

  async pushTraining(
    unionHallId: number,
    trainingRecordId: number,
    actor: UnionHallActor,
    targets?: { companyId?: number; projectId?: number; equipmentId?: number },
  ) {
    const receipt = await this.requireReceipt(
      unionHallId,
      trainingRecordId,
      actor,
    );
    if (receipt.status === UnionHallTrainingStatus.REJECTED) {
      throw new BadRequestException('Cannot push rejected training');
    }

    const companyId =
      targets?.companyId ?? receipt.pushedCompanyId ?? undefined;
    const projectId =
      targets?.projectId ?? receipt.pushedProjectId ?? undefined;

    await this.prisma.trainingRecord.update({
      where: { id: trainingRecordId },
      data: {
        ...(companyId != null ? { companyId } : {}),
        ...(projectId != null ? { projectId } : {}),
      },
    });

    const wallet = await this.walletIntegration.syncAfterTrainingRecord(
      trainingRecordId,
      targets?.equipmentId,
    );

    const updated = await this.prisma.unionHallTrainingReceipt.update({
      where: { id: receipt.id },
      data: {
        status: UnionHallTrainingStatus.PUSHED,
        pushedAt: new Date(),
        pushedCompanyId: companyId ?? null,
        pushedProjectId: projectId ?? null,
        acceptedAt: receipt.acceptedAt ?? new Date(),
        acceptedByUserId: receipt.acceptedByUserId ?? actor.id,
        validatedAt: receipt.validatedAt ?? new Date(),
      },
      include: RECEIPT_INCLUDE,
    });

    this.events?.emit({
      name: DomainEvent.UNION_TRAINING_PUSHED,
      occurredAt: new Date().toISOString(),
      companyId: companyId ?? undefined,
      projectId: projectId ?? undefined,
      entityType: 'union_hall_training_receipt',
      entityId: updated.id,
      data: { trainingRecordId, unionHallId },
    });

    this.events?.emit(
      unionHallRosterUpdateEvent({
        unionHallId,
        workerId: updated.trainingRecord?.workerId,
        trainingRecordId,
        action: 'training_pushed',
      }),
    );

    return { receipt: this.mapReceipt(updated), wallet };
  }

  private async providerSummary(providerId: number) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        code: true,
        approvalStatus: true,
        active: true,
      },
    });
    if (!provider) return null;

    const latest = await this.prisma.providerComplianceStatus.findFirst({
      where: { providerId },
      orderBy: { assessedAt: 'desc' },
    });

    return {
      providerId: provider.id,
      name: provider.name,
      code: provider.code,
      approvalStatus: provider.approvalStatus,
      active: provider.active,
      complianceStatus: latest?.status ?? null,
      complianceScore: latest?.score ?? null,
      complianceAssessedAt: latest?.assessedAt?.toISOString() ?? null,
      gaps: latest?.gaps ?? null,
    };
  }

  private mapReceipt(r: {
    id: number;
    status: UnionHallTrainingStatus;
    acceptedAt: Date | null;
    validatedAt: Date | null;
    pushedAt: Date | null;
    trainingRecord: {
      id: number;
      issuedAt: Date;
      expiresAt: Date | null;
      certificateQrToken: string | null;
      trainingProvider: { id: number; name: string } | null;
      instructor: {
        id: number;
        firstName: string;
        lastName: string;
        qualificationStatus: InstructorQualificationStatus;
      } | null;
      course: { name: string; code: string } | null;
      certification: { name: string };
      worker: { id: number; firstName: string; lastName: string };
      validationResults: { outcome: string }[];
    };
  }) {
    const tr = r.trainingRecord;
    return {
      receiptId: r.id,
      status: r.status,
      acceptedAt: r.acceptedAt?.toISOString() ?? null,
      validatedAt: r.validatedAt?.toISOString() ?? null,
      pushedAt: r.pushedAt?.toISOString() ?? null,
      trainingRecordId: tr.id,
      workerId: tr.worker.id,
      workerName: `${tr.worker.firstName} ${tr.worker.lastName}`.trim(),
      courseName: tr.course?.name ?? tr.certification.name,
      providerName: tr.trainingProvider?.name ?? null,
      providerId: tr.trainingProvider?.id ?? null,
      instructorName: tr.instructor
        ? `${tr.instructor.firstName} ${tr.instructor.lastName}`.trim()
        : null,
      instructorQualificationStatus: tr.instructor?.qualificationStatus ?? null,
      issuedAt: tr.issuedAt.toISOString(),
      expiresAt: tr.expiresAt?.toISOString() ?? null,
      validationOutcome: tr.validationResults[0]?.outcome ?? null,
      certificateQrToken: tr.certificateQrToken,
    };
  }

  private async requireReceipt(
    unionHallId: number,
    trainingRecordId: number,
    actor: UnionHallActor,
  ) {
    await this.assertHallAccess(unionHallId, actor);
    const receipt = await this.prisma.unionHallTrainingReceipt.findFirst({
      where: { unionHallId, trainingRecordId },
    });
    if (!receipt) {
      throw new NotFoundException('Training receipt not found for this hall');
    }
    return receipt;
  }

  private async assertHallAccess(
    unionHallId: number,
    actor: UnionHallActor,
  ): Promise<void> {
    if (actor.role === UserRole.UNION_HALL_ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: actor.id },
        select: { unionHallId: true },
      });
      const hallId = actor.unionHallId ?? user?.unionHallId;
      if (hallId != null && hallId !== unionHallId) {
        throw new ForbiddenException(
          'You may only manage your assigned union hall',
        );
      }
    }
  }
}
