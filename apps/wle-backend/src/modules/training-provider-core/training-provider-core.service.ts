import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InstructorQualificationStatus,
  ProviderApprovalStatus,
  UserRole,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingPipelineService } from '../vera-core/training-pipeline.service';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';
import { TrainingProviderCertificateService } from './training-provider-certificate.service';
import { TrainingProviderComplianceService } from './training-provider-compliance.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import { TrainingValidationOutcome } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { TrainingLegislationEngine } from '../../training-provider/provider.legislation';
import {
  CreateTrainingCourseDto,
  CreateTrainingInstructorDto,
  CreateTrainingProviderDto,
  IssueCertificateDto,
  ProviderApprovalDto,
  UpdateTrainingProviderProfileDto,
  UploadTrainingDto,
} from './dto/training-provider.dto';

type AuthUser = {
  id: number;
  role: UserRole;
  trainingProviderId?: number | null;
  instructorId?: number | null;
};

@Injectable()
export class TrainingProviderCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: TrainingPipelineService,
    private readonly compliance: TrainingProviderComplianceService,
    private readonly certificates: TrainingProviderCertificateService,
    private readonly standardsCompliance: TrainingStandardsComplianceService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
    private readonly audit: AuditLogService,
  ) {}

  async dashboard(providerId: number) {
    const provider = await this.requireProvider(providerId);
    const [courseCount, instructorCount, recordCount, latestCompliance] =
      await Promise.all([
        this.prisma.trainingCourse.count({
          where: { providerId, active: true },
        }),
        this.prisma.trainingInstructor.count({
          where: { providerId, active: true },
        }),
        this.prisma.trainingRecord.count({
          where: { trainingProviderId: providerId },
        }),
        this.compliance.latestCompliance(providerId),
      ]);

    const recentRecords = await this.prisma.trainingRecord.findMany({
      where: { trainingProviderId: providerId },
      orderBy: { issuedAt: 'desc' },
      take: 10,
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        certification: { select: { id: true, name: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    return {
      provider,
      stats: {
        activeCourses: courseCount,
        activeInstructors: instructorCount,
        trainingRecordsIssued: recordCount,
      },
      compliance: latestCompliance,
      recentRecords,
    };
  }

  listProviders() {
    return this.prisma.trainingProvider.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { courses: true, instructors: true, trainingRecords: true },
        },
      },
    });
  }

  async createProvider(dto: CreateTrainingProviderDto) {
    const qrToken = `tp_${randomBytes(12).toString('hex')}`;
    return this.prisma.trainingProvider.create({
      data: {
        name: dto.name,
        code: dto.code,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        address: dto.address,
        qrToken,
      },
    });
  }

  getProvider(id: number) {
    return this.prisma.trainingProvider.findUnique({
      where: { id },
      include: {
        courses: { where: { active: true }, include: { standards: true } },
        instructors: { where: { active: true } },
        approvals: { orderBy: { createdAt: 'desc' }, take: 5 },
        complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
      },
    });
  }

  async updateProfile(
    providerId: number,
    dto: UpdateTrainingProviderProfileDto,
  ) {
    await this.requireProvider(providerId);
    return this.prisma.trainingProvider.update({
      where: { id: providerId },
      data: dto,
    });
  }

  async approveProvider(
    providerId: number,
    dto: ProviderApprovalDto,
    reviewerId: number,
  ) {
    await this.requireProvider(providerId);
    const [approval] = await this.prisma.$transaction([
      this.prisma.providerApproval.create({
        data: {
          providerId,
          status: dto.status,
          reviewedBy: reviewerId,
          notes: dto.notes,
        },
      }),
      this.prisma.trainingProvider.update({
        where: { id: providerId },
        data: { approvalStatus: dto.status },
      }),
    ]);
    await this.compliance.assessProvider(providerId, `Approval: ${dto.status}`);
    await this.audit.logAudit(
      { id: reviewerId },
      'provider.approval.update',
      { type: 'TrainingProvider', id: providerId },
      { status: dto.status, notes: dto.notes ?? null },
    );
    return approval;
  }

  listCourses(providerId: number) {
    return this.prisma.trainingCourse.findMany({
      where: { providerId },
      include: { standards: true, certification: true, instructors: true },
      orderBy: { name: 'asc' },
    });
  }

  async addCourse(providerId: number, dto: CreateTrainingCourseDto) {
    await this.requireProvider(providerId);
    if (dto.contentText) {
      const assessment = new TrainingLegislationEngine().assessProgram(
        dto.contentText,
      );
      if (!assessment.passed) {
        throw new BadRequestException({
          code: 'COURSE_CONTENT_BELOW_STANDARD',
          score: assessment.score,
          missing: assessment.missing,
        });
      }
    }

    return this.prisma.trainingCourse.create({
      data: {
        providerId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        certificationId: dto.certificationId,
        durationHours: dto.durationHours,
        validityDays: dto.validityDays,
        contentText: dto.contentText,
        standards: dto.standards?.length
          ? { create: dto.standards }
          : undefined,
        instructors: dto.instructorIds?.length
          ? { connect: dto.instructorIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { standards: true, instructors: true, certification: true },
    });
  }

  listInstructors(providerId: number) {
    return this.prisma.trainingInstructor.findMany({
      where: { providerId },
      include: { courses: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async addInstructor(providerId: number, dto: CreateTrainingInstructorDto) {
    await this.requireProvider(providerId);
    const status =
      dto.qualificationExpiresAt &&
      new Date(dto.qualificationExpiresAt) < new Date()
        ? InstructorQualificationStatus.EXPIRED
        : InstructorQualificationStatus.ACTIVE;

    return this.prisma.trainingInstructor.create({
      data: {
        providerId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        qualifiedCourseCodes: dto.qualifiedCourseCodes ?? [],
        qualificationExpiresAt: dto.qualificationExpiresAt
          ? new Date(dto.qualificationExpiresAt)
          : undefined,
        qualificationStatus: status,
        courses: dto.courseIds?.length
          ? { connect: dto.courseIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { courses: true },
    });
  }

  async validateInstructorQualification(instructorId: number) {
    const instructor = await this.prisma.trainingInstructor.findUnique({
      where: { id: instructorId },
      include: { courses: true },
    });
    if (!instructor) throw new NotFoundException('Instructor not found');

    let status = instructor.qualificationStatus;
    if (
      instructor.qualificationExpiresAt &&
      instructor.qualificationExpiresAt < new Date()
    ) {
      status = InstructorQualificationStatus.EXPIRED;
      await this.prisma.trainingInstructor.update({
        where: { id: instructorId },
        data: { qualificationStatus: status },
      });
    }

    const courseChecks = instructor.courses.map((c) => ({
      courseId: c.id,
      courseCode: c.code,
      ...this.compliance.validateInstructorForCourse(instructor, c.code),
    }));

    return {
      instructorId,
      qualificationStatus: status,
      valid: status === InstructorQualificationStatus.ACTIVE,
      courseChecks,
    };
  }

  async uploadTraining(providerId: number, dto: UploadTrainingDto) {
    const provider = await this.requireProvider(providerId);
    if (provider.approvalStatus !== ProviderApprovalStatus.APPROVED) {
      throw new ForbiddenException(
        'Provider must be approved before issuing training',
      );
    }

    const course = await this.prisma.trainingCourse.findFirst({
      where: { id: dto.courseId, providerId },
      include: { certification: true },
    });
    if (!course)
      throw new NotFoundException('Course not found for this provider');
    if (!course.certificationId) {
      throw new BadRequestException('Course has no linked certification');
    }

    if (dto.instructorId) {
      const instructor = await this.prisma.trainingInstructor.findFirst({
        where: { id: dto.instructorId, providerId },
      });
      if (!instructor) throw new NotFoundException('Instructor not found');
      const check = this.compliance.validateInstructorForCourse(
        instructor,
        course.code,
      );
      if (!check.valid) {
        throw new BadRequestException({
          code: 'INSTRUCTOR_NOT_QUALIFIED',
          reason: check.reason,
        });
      }
    }

    const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
    let expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    if (!expiresAt && course.validityDays) {
      expiresAt = new Date(issuedAt);
      expiresAt.setDate(expiresAt.getDate() + course.validityDays);
    }

    const ingest = await this.pipeline.ingest({
      workerId: dto.workerId,
      certificationId: course.certificationId,
      companyId: dto.companyId,
      equipmentId: dto.equipmentId,
      expiresAt,
      issuedAt,
      certificateNumber: dto.certificateNumber,
      trainingProviderId: providerId,
      courseId: course.id,
      instructorId: dto.instructorId,
      projectId: dto.projectId,
    });

    if (!ingest.ok || !ingest.trainingRecord) {
      throw new BadRequestException(ingest.error ?? 'INGEST_FAILED');
    }

    const token = this.certificates.newQrToken();
    const record = await this.prisma.trainingRecord.update({
      where: { id: ingest.trainingRecord.id },
      data: {
        trainingProviderId: providerId,
        courseId: course.id,
        instructorId: dto.instructorId,
        companyId: dto.companyId,
        projectId: dto.projectId,
        certificateQrToken: token,
      },
      include: {
        worker: true,
        certification: true,
        course: true,
      },
    });

    const validation = await this.standardsCompliance.validateTraining(
      record.id,
      undefined,
    );

    if (validation.outcome === TrainingValidationOutcome.REJECTED) {
      throw new BadRequestException({
        code: 'TRAINING_STANDARDS_REJECTED',
        validation,
      });
    }

    const walletTraining = await this.walletIntegration.syncAfterTrainingRecord(
      record.id,
      dto.equipmentId,
    );

    return {
      record,
      verificationPath: this.certificates.verificationPath(token),
      validation,
      walletTraining,
    };
  }

  async issueCertificate(
    providerId: number,
    dto: IssueCertificateDto,
    actorId?: number,
  ) {
    const record = await this.prisma.trainingRecord.findFirst({
      where: { id: dto.trainingRecordId, trainingProviderId: providerId },
    });
    if (!record) throw new NotFoundException('Training record not found');

    const token = record.certificateQrToken ?? this.certificates.newQrToken();
    await this.prisma.trainingRecord.update({
      where: { id: record.id },
      data: {
        certificateUrl: dto.certificateUrl,
        certificateQrToken: token,
        completedAt: record.completedAt ?? new Date(),
      },
    });

    const digital = await this.certificates.buildDigitalCertificate(record.id);
    const qrDataUrl = await this.certificates.generateQrDataUrl(record.id);

    await this.audit.logAudit(
      actorId != null ? { id: actorId } : null,
      'credential.issue',
      {
        type: 'TrainingRecord',
        id: record.id,
        tenantId: record.companyId ?? undefined,
      },
      { providerId, certificateUrl: dto.certificateUrl ? '[redacted]' : null },
    );

    return { digitalCertificate: digital, qrDataUrl };
  }

  validateCertificate(token: string) {
    return this.certificates.validateByToken(token);
  }

  async certificateBundle(recordId: number) {
    const digital = await this.certificates.buildDigitalCertificate(recordId);
    const qrDataUrl = await this.certificates.generateQrDataUrl(recordId);
    return { digitalCertificate: digital, qrDataUrl };
  }

  async attachCertificateUrl(recordId: number, certificateUrl: string) {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) throw new NotFoundException('Training record not found');
    if (!record.trainingProviderId) {
      throw new BadRequestException('Record not linked to a training provider');
    }
    return this.issueCertificate(record.trainingProviderId, {
      trainingRecordId: recordId,
      certificateUrl,
    });
  }

  async assessCompliance(providerId: number, notes?: string) {
    await this.requireProvider(providerId);
    return this.compliance.assessProvider(providerId, notes);
  }

  getComplianceHistory(providerId: number) {
    return this.prisma.providerComplianceStatus.findMany({
      where: { providerId },
      orderBy: { assessedAt: 'desc' },
      take: 20,
    });
  }

  trainingHistory(providerId: number, limit = 50) {
    return this.prisma.trainingRecord.findMany({
      where: { trainingProviderId: providerId },
      take: limit,
      orderBy: { issuedAt: 'desc' },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        certification: true,
        course: true,
        instructor: true,
        company: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async assertAccess(user: AuthUser, providerId: number) {
    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN ||
      user.role === UserRole.COMPANY_ADMIN
    ) {
      return;
    }
    if (
      (user.role === UserRole.TRAINING_PROVIDER_ADMIN ||
        user.role === UserRole.TRAINING_INSTRUCTOR) &&
      user.trainingProviderId === providerId
    ) {
      return;
    }
    if (user.role === UserRole.TRAINING_INSTRUCTOR) {
      const instructorProviderId = await this.instructorProviderIdForUser(user);
      if (instructorProviderId === providerId) return;
    }
    throw new ForbiddenException('Not authorized for this training provider');
  }

  async resolveProviderId(
    user: AuthUser,
    queryProviderId?: number,
  ): Promise<number> {
    if (queryProviderId) {
      await this.assertAccess(user, queryProviderId);
      return queryProviderId;
    }
    if (user.trainingProviderId) return user.trainingProviderId;

    const instructorProviderId = await this.instructorProviderIdForUser(user);
    if (instructorProviderId) return instructorProviderId;

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      const provider = await this.prisma.trainingProvider.findFirst({
        select: { id: true },
        orderBy: { id: 'asc' },
      });
      if (provider) return provider.id;
      throw new BadRequestException('No training providers exist');
    }

    if (user.role === UserRole.TRAINING_PROVIDER_ADMIN) {
      throw new BadRequestException(
        'Your account is not linked to a training provider. Complete registration or contact support.',
      );
    }

    throw new BadRequestException('providerId required');
  }

  private async instructorProviderIdForUser(
    user: AuthUser,
  ): Promise<number | null> {
    if (user.role !== UserRole.TRAINING_INSTRUCTOR) return null;
    const instructor = await this.prisma.trainingInstructor.findFirst({
      where: {
        active: true,
        OR: [
          ...(user.instructorId ? [{ id: user.instructorId }] : []),
          { userId: user.id },
        ],
      },
      select: { providerId: true },
    });
    return instructor?.providerId ?? null;
  }

  private async requireProvider(id: number) {
    const p = await this.prisma.trainingProvider.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Training provider not found');
    return p;
  }
}
