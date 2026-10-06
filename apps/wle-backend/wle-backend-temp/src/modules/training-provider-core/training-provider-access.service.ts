import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProviderApprovalStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import {
  hasTrainingProviderPermission,
  TrainingProviderPermission,
} from './training-provider-permissions';
import {
  InstructorOnboardingDto,
  ProviderOnboardingDto,
  RequestApprovalDto,
  SignCertificateDto,
  UploadClassListDto,
  UploadTrainingDto,
} from './dto/training-provider.dto';
import { TrainingProviderCoreService } from './training-provider-core.service';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';

export type PortalUser = {
  id: number;
  role: UserRole;
  trainingProviderId?: number | null;
  instructorId?: number | null;
};

@Injectable()
export class TrainingProviderAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoring: Phase1MonitoringService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
    private readonly providerCore: TrainingProviderCoreService,
  ) {}

  requirePermission(user: PortalUser, permission: TrainingProviderPermission) {
    if (!hasTrainingProviderPermission(user.role, permission)) {
      throw new ForbiddenException(`Permission denied: ${permission}`);
    }
  }

  async resolveProviderId(user: PortalUser, queryProviderId?: number) {
    return this.providerCore.resolveProviderId(user, queryProviderId);
  }

  async getPortalContext(user: PortalUser) {
    const permissions = Object.values(TrainingProviderPermission).filter((p) =>
      hasTrainingProviderPermission(user.role, p),
    );

    let provider = null;
    let instructor = null;

    if (user.trainingProviderId) {
      provider = await this.prisma.trainingProvider.findUnique({
        where: { id: user.trainingProviderId },
        include: {
          complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
        },
      });
    }

    if (!provider && user.role === UserRole.TRAINING_INSTRUCTOR) {
      const linkedInstructor = await this.resolveInstructorRecord(user);
      if (linkedInstructor?.provider) {
        provider = linkedInstructor.provider;
      }
    }

    if (user.role === UserRole.TRAINING_INSTRUCTOR) {
      instructor =
        user.instructorId != null
          ? await this.prisma.trainingInstructor.findUnique({
              where: { id: user.instructorId },
              include: { courses: true },
            })
          : await this.prisma.trainingInstructor.findFirst({
              where: { userId: user.id, active: true },
              include: { courses: true },
            });
    }

    return {
      user: {
        id: user.id,
        role: user.role,
        trainingProviderId: user.trainingProviderId,
        instructorId: instructor?.id ?? user.instructorId,
      },
      permissions,
      provider,
      instructor,
      dashboardPath:
        user.role === UserRole.TRAINING_INSTRUCTOR
          ? '/provider-portal/instructor'
          : '/provider-portal',
    };
  }

  async onboardProvider(dto: ProviderOnboardingDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });
    if (existing) {
      throw new ConflictException('Admin email already registered');
    }

    const provider = await this.providerCore.createProvider(dto);
    const hash = await bcrypt.hash(dto.adminPassword, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.adminUsername,
        email: dto.adminEmail,
        password: hash,
        role: UserRole.TRAINING_PROVIDER_ADMIN,
        trainingProviderId: provider.id,
      },
    });

    await this.prisma.providerApproval.create({
      data: {
        providerId: provider.id,
        status: ProviderApprovalStatus.PENDING,
        notes: 'Provider onboarding — pending company approval',
      },
    });

    await this.audit(user.id, 'training_provider.onboard', provider.id, {
      adminEmail: dto.adminEmail,
    });

    return {
      provider,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async onboardInstructor(
    providerId: number,
    dto: InstructorOnboardingDto,
    actor: PortalUser,
  ) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(
      actor,
      TrainingProviderPermission.MANAGE_INSTRUCTORS,
    );

    const instructor = await this.providerCore.addInstructor(providerId, dto);

    let user = null;
    if (dto.userEmail && dto.userPassword && dto.userUsername) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.userEmail },
      });
      if (existing) {
        throw new ConflictException('Instructor user email already exists');
      }
      const hash = await bcrypt.hash(dto.userPassword, 10);
      user = await this.prisma.user.create({
        data: {
          username: dto.userUsername,
          email: dto.userEmail,
          password: hash,
          role: UserRole.TRAINING_INSTRUCTOR,
          trainingProviderId: providerId,
        },
      });
      await this.prisma.trainingInstructor.update({
        where: { id: instructor.id },
        data: { userId: user.id },
      });
    }

    await this.audit(actor.id, 'training_instructor.onboard', instructor.id, {
      providerId,
      userId: user?.id,
    });

    return { instructor, user };
  }

  async requestApproval(
    providerId: number,
    dto: RequestApprovalDto,
    actor: PortalUser,
  ) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(actor, TrainingProviderPermission.REQUEST_APPROVAL);

    await this.prisma.trainingProvider.update({
      where: { id: providerId },
      data: { approvalStatus: ProviderApprovalStatus.PENDING },
    });

    const approval = await this.prisma.providerApproval.create({
      data: {
        providerId,
        status: ProviderApprovalStatus.PENDING,
        reviewedBy: actor.id,
        notes: dto.notes ?? 'Approval requested by provider admin',
      },
    });

    await this.audit(
      actor.id,
      'training_provider.approval_requested',
      providerId,
    );
    return approval;
  }

  async getApprovalStatus(providerId: number, actor: PortalUser) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(
      actor,
      TrainingProviderPermission.MANAGE_APPROVAL_STATUS,
    );

    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
      select: { id: true, approvalStatus: true, active: true },
    });
    const approvals = await this.prisma.providerApproval.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { provider, approvals };
  }

  async uploadClassList(
    providerId: number,
    dto: UploadClassListDto,
    actor: PortalUser,
  ) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(
      actor,
      TrainingProviderPermission.UPLOAD_CLASS_LISTS,
    );

    const instructorId = await this.resolveInstructorIdForActor(
      actor,
      providerId,
    );
    const results: {
      workerId: number;
      ok: boolean;
      recordId?: number;
      error?: string;
    }[] = [];

    for (const workerId of dto.workerIds) {
      try {
        const out = await this.providerCore.uploadTraining(providerId, {
          workerId,
          courseId: dto.courseId,
          instructorId,
          companyId: dto.companyId,
          projectId: dto.projectId,
          issuedAt: dto.issuedAt,
          expiresAt: dto.expiresAt,
        });
        results.push({ workerId, ok: true, recordId: out.record.id });
      } catch (e) {
        results.push({
          workerId,
          ok: false,
          error: e instanceof Error ? e.message : 'UPLOAD_FAILED',
        });
      }
    }

    await this.audit(
      actor.id,
      'training_provider.class_list_upload',
      providerId,
      {
        courseId: dto.courseId,
        count: dto.workerIds.length,
        success: results.filter((r) => r.ok).length,
      },
    );

    return {
      uploaded: results.filter((r) => r.ok).length,
      total: results.length,
      results,
    };
  }

  async signCertificate(
    recordId: number,
    dto: SignCertificateDto,
    actor: PortalUser,
  ) {
    this.requirePermission(actor, TrainingProviderPermission.SIGN_CERTIFICATES);

    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: recordId },
      include: { trainingProvider: true },
    });
    if (!record) throw new NotFoundException('Training record not found');
    if (record.trainingProviderId) {
      await this.providerCore.assertAccess(actor, record.trainingProviderId);
    }

    const instructorId = await this.resolveInstructorIdForActor(
      actor,
      record.trainingProviderId ?? undefined,
    );

    const signedAt = dto.signedAt ? new Date(dto.signedAt) : new Date();
    const updated = await this.prisma.trainingRecord.update({
      where: { id: recordId },
      data: {
        certificateSignedAt: signedAt,
        certificateSignedByInstructorId: instructorId ?? undefined,
        completedAt: record.completedAt ?? signedAt,
      },
      include: {
        worker: true,
        certification: true,
        certificateSignedBy: true,
      },
    });

    await this.audit(actor.id, 'training_certificate.signed', recordId, {
      signatureName: dto.signatureName,
      instructorId,
    });

    await this.walletIntegration
      .syncAfterTrainingRecord(recordId)
      .catch(() => undefined);

    return {
      record: updated,
      signature: {
        name: dto.signatureName,
        signedAt: signedAt.toISOString(),
        instructorId,
      },
    };
  }

  async uploadTrainingForActor(
    providerId: number,
    dto: UploadTrainingDto,
    actor: PortalUser,
  ) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(
      actor,
      actor.role === UserRole.TRAINING_INSTRUCTOR
        ? TrainingProviderPermission.DELIVER_TRAINING
        : TrainingProviderPermission.UPLOAD_TRAINING,
    );

    const instructorId =
      dto.instructorId ??
      (await this.resolveInstructorIdForActor(actor, providerId));
    return this.providerCore.uploadTraining(providerId, {
      ...dto,
      instructorId,
    });
  }

  async instructorProfile(actor: PortalUser) {
    this.requirePermission(
      actor,
      TrainingProviderPermission.VIEW_INSTRUCTOR_PROFILE,
    );
    const instructor = await this.resolveInstructorRecord(actor);
    if (!instructor) {
      throw new NotFoundException(
        'No instructor profile linked to this account',
      );
    }
    return instructor;
  }

  async trainingHistoryForActor(
    providerId: number,
    actor: PortalUser,
    limit = 50,
  ) {
    await this.providerCore.assertAccess(actor, providerId);
    this.requirePermission(
      actor,
      TrainingProviderPermission.VIEW_TRAINING_HISTORY,
    );

    if (actor.role === UserRole.TRAINING_INSTRUCTOR) {
      const instructorId = actor.instructorId;
      if (!instructorId) {
        return this.prisma.trainingRecord.findMany({
          where: {
            trainingProviderId: providerId,
            instructor: { userId: actor.id },
          },
          take: limit,
          orderBy: { issuedAt: 'desc' },
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
            certification: true,
            course: true,
          },
        });
      }
      return this.prisma.trainingRecord.findMany({
        where: { trainingProviderId: providerId, instructorId },
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          worker: { select: { id: true, firstName: true, lastName: true } },
          certification: true,
          course: true,
        },
      });
    }

    return this.providerCore.trainingHistory(providerId, limit);
  }

  private async resolveInstructorIdForActor(
    actor: PortalUser,
    providerId?: number,
  ): Promise<number | undefined> {
    if (actor.role === UserRole.TRAINING_PROVIDER_ADMIN) {
      return undefined;
    }
    const instructor = await this.resolveInstructorRecord(actor);
    if (instructor && providerId && instructor.providerId !== providerId) {
      throw new ForbiddenException('Instructor not assigned to this provider');
    }
    return instructor?.id;
  }

  private async resolveInstructorRecord(actor: PortalUser) {
    if (actor.instructorId) {
      return this.prisma.trainingInstructor.findUnique({
        where: { id: actor.instructorId },
        include: { courses: true, provider: true },
      });
    }
    return this.prisma.trainingInstructor.findFirst({
      where: { userId: actor.id, active: true },
      include: { courses: true, provider: true },
    });
  }

  private async audit(
    userId: number,
    action: string,
    entityId: number,
    metadata?: Record<string, unknown>,
  ) {
    await this.monitoring.persistAudit({
      userId,
      action,
      entity: 'TrainingProvider',
      entityId,
      metadata,
    });
  }
}
