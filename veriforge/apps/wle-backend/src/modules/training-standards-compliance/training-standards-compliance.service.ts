import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import {
  CredentialLedgerActorType,
  TrainingValidationOutcome,
  TrainingValidationSubject,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import { CredentialLedgerService } from '../credential-ledger/credential-ledger.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { TrainingLegislationEngine } from '../../training-provider/provider.legislation';
import { StandardsMatchingEngine } from './engines/standards-matching.engine';
import { JurisdictionMatchingEngine } from './engines/jurisdiction-matching.engine';
import { ExpiryRuleEngine } from './engines/expiry-rule.engine';
import { CertificateValidationEngine } from './engines/certificate-validation.engine';
import { ProviderQualificationValidator } from './validators/provider-qualification.validator';
import { InstructorQualificationValidator } from './validators/instructor-qualification.validator';

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationReport {
  outcome: TrainingValidationOutcome;
  score: number;
  jurisdictionCode: string;
  matchedStandardCodes: string[];
  missingStandardCodes: string[];
  issues: ValidationIssue[];
  validationResultId?: number;
}

@Injectable()
export class TrainingStandardsComplianceService {
  private readonly legislation = new TrainingLegislationEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoring: Phase1MonitoringService,
    private readonly credentialLedger: CredentialLedgerService,
    private readonly standardsEngine: StandardsMatchingEngine,
    private readonly jurisdictionEngine: JurisdictionMatchingEngine,
    private readonly expiryEngine: ExpiryRuleEngine,
    private readonly certificateEngine: CertificateValidationEngine,
    private readonly providerValidator: ProviderQualificationValidator,
    private readonly instructorValidator: InstructorQualificationValidator,
    @Optional() private readonly events?: EventBusService,
  ) {}

  async dashboard() {
    const [pending, approved, rejected, needsReview, recent] =
      await Promise.all([
        this.prisma.trainingValidationResult.count({
          where: { outcome: TrainingValidationOutcome.PENDING },
        }),
        this.prisma.trainingValidationResult.count({
          where: { outcome: TrainingValidationOutcome.APPROVED },
        }),
        this.prisma.trainingValidationResult.count({
          where: { outcome: TrainingValidationOutcome.REJECTED },
        }),
        this.prisma.trainingValidationResult.count({
          where: { outcome: TrainingValidationOutcome.NEEDS_REVIEW },
        }),
        this.prisma.trainingValidationResult.findMany({
          orderBy: { validatedAt: 'desc' },
          take: 15,
          include: {
            rejections: { include: { rejectionReason: true } },
            trainingRecord: {
              include: { worker: true, certification: true },
            },
          },
        }),
      ]);
    return { pending, approved, rejected, needsReview, recent };
  }

  async validateTraining(
    trainingRecordId: number,
    jurisdictionCode?: string,
    validatedBy?: number,
  ): Promise<ValidationReport> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        certification: true,
        course: { include: { standards: true } },
        instructor: true,
        trainingProvider: true,
        project: { include: { site: true } },
        company: true,
      },
    });
    if (!record) throw new NotFoundException('Training record not found');

    const jurisdiction = await this.resolveJurisdiction(
      jurisdictionCode,
      record.project?.site?.region,
    );

    const catalog = await this.prisma.trainingStandard.findMany({
      where: { active: true },
    });
    const courseKeys = record.course?.standards.map((s) => s.standardKey) ?? [];
    const standardsMatch = this.standardsEngine.match({
      courseStandardKeys: courseKeys,
      contentText: record.course?.contentText,
      certificationName: record.certification.name,
      catalogStandards: catalog,
    });

    const issues: ValidationIssue[] = [];
    for (const code of standardsMatch.missing) {
      issues.push({
        code: 'CSA_STANDARD_MISSING',
        message: `Missing CSA alignment: ${code}`,
      });
    }

    const jurisdictionRows =
      await this.prisma.jurisdictionRequirement.findMany();
    const jurisdictionMatch = this.jurisdictionEngine.match(
      jurisdiction,
      jurisdictionRows,
      standardsMatch.matched,
    );
    for (const code of jurisdictionMatch.missing) {
      issues.push({
        code: 'JURISDICTION_REQUIREMENT_MISSING',
        message: `Jurisdiction ${jurisdiction} requires ${code}`,
      });
    }

    if (record.course?.contentText) {
      const prog = this.legislation.assessProgram(record.course.contentText);
      if (!prog.passed) {
        issues.push({
          code: 'PROGRAM_CONTENT_INSUFFICIENT',
          message: `Program score ${prog.score}% below threshold`,
        });
      }
    } else if (record.course && courseKeys.length === 0) {
      issues.push({
        code: 'COURSE_STANDARDS_MISSING',
        message: 'Course has no mapped standards',
      });
    }

    const expiry = this.expiryEngine.check({
      issuedAt: record.issuedAt,
      expiresAt: record.expiresAt,
      maxValidityDays: record.course?.validityDays,
    });
    if (expiry.expired) {
      issues.push({ code: 'CERTIFICATE_EXPIRED', message: 'Training expired' });
    }
    if (expiry.exceedsMaxValidity) {
      issues.push({
        code: 'EXPIRY_EXCEEDED',
        message: 'Expiry exceeds allowed validity window',
      });
    }

    if (record.trainingProvider) {
      const providerRules = await this.loadProviderRules(
        record.trainingProviderId!,
      );
      const pv = this.providerValidator.validate(
        record.trainingProvider,
        providerRules,
        standardsMatch.matched,
      );
      issues.push(...pv.issues);
    }

    if (record.instructor && record.course) {
      const instructorRules = await this.loadInstructorRules(
        record.trainingProviderId,
      );
      const iv = this.instructorValidator.validate(
        record.instructor,
        record.course.code,
        instructorRules,
        standardsMatch.matched,
      );
      issues.push(...iv.issues);
    }

    const certCheck = this.certificateEngine.validate({
      recordExists: true,
      certificateQrToken: record.certificateQrToken,
      certificateNumber: record.certificateNumber,
      issuedAt: record.issuedAt,
      expiresAt: record.expiresAt,
    });
    if (!certCheck.valid && certCheck.reasonCode) {
      issues.push({
        code: certCheck.reasonCode,
        message: 'Certificate validation failed',
      });
    }

    const score = Math.round(
      (standardsMatch.score + jurisdictionMatch.score) / 2,
    );
    const outcome = this.resolveOutcome(issues, score);
    const missing = [
      ...new Set([...standardsMatch.missing, ...jurisdictionMatch.missing]),
    ];

    const saved = await this.persistResult({
      subjectType: TrainingValidationSubject.TRAINING_RECORD,
      trainingRecordId,
      trainingProviderId: record.trainingProviderId ?? undefined,
      instructorId: record.instructorId ?? undefined,
      courseId: record.courseId ?? undefined,
      certificateQrToken: record.certificateQrToken ?? undefined,
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: missing,
      issues,
      validatedBy,
      details: { standardsMatch, jurisdictionMatch, expiry, certCheck },
    });

    return {
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: missing,
      issues,
      validationResultId: saved.id,
    };
  }

  async validateProvider(
    trainingProviderId: number,
    jurisdictionCode?: string,
    validatedBy?: number,
  ): Promise<ValidationReport> {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: trainingProviderId },
      include: { courses: { include: { standards: true } } },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const jurisdiction =
      jurisdictionCode ?? this.jurisdictionEngine.normalizeJurisdiction(null);
    const catalog = await this.prisma.trainingStandard.findMany({
      where: { active: true },
    });
    const allKeys = provider.courses.flatMap((c) =>
      c.standards.map((s) => s.standardKey),
    );
    const standardsMatch = this.standardsEngine.match({
      courseStandardKeys: allKeys,
      contentText: provider.courses.map((c) => c.contentText ?? '').join(' '),
      catalogStandards: catalog,
    });

    const providerRules = await this.loadProviderRules(trainingProviderId);
    const pv = this.providerValidator.validate(
      provider,
      providerRules,
      standardsMatch.matched,
    );

    const jurisdictionRows =
      await this.prisma.jurisdictionRequirement.findMany();
    const jurisdictionMatch = this.jurisdictionEngine.match(
      jurisdiction,
      jurisdictionRows,
      standardsMatch.matched,
    );

    const issues: ValidationIssue[] = [
      ...pv.issues,
      ...jurisdictionMatch.missing.map((code) => ({
        code: 'JURISDICTION_REQUIREMENT_MISSING',
        message: `Missing ${code} for ${jurisdiction}`,
      })),
    ];

    const score = Math.round(
      (standardsMatch.score + jurisdictionMatch.score) / 2,
    );
    const outcome = this.resolveOutcome(issues, score);

    const saved = await this.persistResult({
      subjectType: TrainingValidationSubject.PROVIDER,
      trainingProviderId,
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: jurisdictionMatch.missing,
      issues,
      validatedBy,
    });

    return {
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: jurisdictionMatch.missing,
      issues,
      validationResultId: saved.id,
    };
  }

  async validateInstructor(
    instructorId: number,
    courseCode?: string,
    jurisdictionCode?: string,
    validatedBy?: number,
  ): Promise<ValidationReport> {
    const instructor = await this.prisma.trainingInstructor.findUnique({
      where: { id: instructorId },
      include: { courses: true, provider: true },
    });
    if (!instructor) throw new NotFoundException('Instructor not found');

    const code = courseCode ?? instructor.courses[0]?.code ?? '';
    const catalog = await this.prisma.trainingStandard.findMany({
      where: { active: true },
    });
    const courseKeys = instructor.courses.flatMap((c) => [c.code]);
    const standardsMatch = this.standardsEngine.match({
      courseStandardKeys: courseKeys,
      catalogStandards: catalog,
    });

    const instructorRules = await this.loadInstructorRules(
      instructor.providerId,
    );
    const iv = this.instructorValidator.validate(
      instructor,
      code,
      instructorRules,
      standardsMatch.matched,
    );

    const jurisdiction =
      jurisdictionCode ?? this.jurisdictionEngine.normalizeJurisdiction(null);
    const issues = [...iv.issues];
    const score = iv.valid ? 100 : Math.max(0, 100 - issues.length * 15);
    const outcome = this.resolveOutcome(issues, score);

    const saved = await this.persistResult({
      subjectType: TrainingValidationSubject.INSTRUCTOR,
      instructorId,
      trainingProviderId: instructor.providerId,
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: standardsMatch.missing,
      issues,
      validatedBy,
    });

    return {
      outcome,
      score,
      jurisdictionCode: jurisdiction,
      matchedStandardCodes: standardsMatch.matched,
      missingStandardCodes: standardsMatch.missing,
      issues,
      validationResultId: saved.id,
    };
  }

  async validateCertificate(
    certificateQrToken?: string,
    trainingRecordId?: number,
    validatedBy?: number,
  ): Promise<ValidationReport> {
    const record = trainingRecordId
      ? await this.prisma.trainingRecord.findUnique({
          where: { id: trainingRecordId },
        })
      : certificateQrToken
      ? await this.prisma.trainingRecord.findUnique({
          where: { certificateQrToken },
        })
      : null;

    if (!record) {
      const issues = [
        {
          code: 'CERTIFICATE_INVALID',
          message: 'Certificate or record not found',
        },
      ];
      const saved = await this.persistResult({
        subjectType: TrainingValidationSubject.CERTIFICATE,
        certificateQrToken,
        outcome: TrainingValidationOutcome.REJECTED,
        score: 0,
        jurisdictionCode: 'ON',
        matchedStandardCodes: [],
        missingStandardCodes: [],
        issues,
        validatedBy,
      });
      return {
        outcome: TrainingValidationOutcome.REJECTED,
        score: 0,
        jurisdictionCode: 'ON',
        matchedStandardCodes: [],
        missingStandardCodes: [],
        issues,
        validationResultId: saved.id,
      };
    }

    return this.validateTraining(record.id, undefined, validatedBy);
  }

  getValidationResult(id: number) {
    return this.prisma.trainingValidationResult.findUnique({
      where: { id },
      include: {
        rejections: { include: { rejectionReason: true } },
        trainingRecord: {
          include: { worker: true, certification: true, course: true },
        },
        trainingProvider: true,
        instructor: true,
        course: true,
      },
    });
  }

  getValidationResults(filters: {
    trainingRecordId?: number;
    trainingProviderId?: number;
    outcome?: TrainingValidationOutcome;
    limit?: number;
  }) {
    return this.prisma.trainingValidationResult.findMany({
      where: {
        trainingRecordId: filters.trainingRecordId,
        trainingProviderId: filters.trainingProviderId,
        outcome: filters.outcome,
      },
      orderBy: { validatedAt: 'desc' },
      take: filters.limit ?? 50,
      include: {
        rejections: { include: { rejectionReason: true } },
        trainingRecord: {
          include: { worker: true, certification: true },
        },
        trainingProvider: true,
        instructor: true,
        course: true,
      },
    });
  }

  async approveValidation(
    validationResultId: number,
    validatedBy: number,
    notes?: string,
  ) {
    return this.updateWorkflow(
      validationResultId,
      TrainingValidationOutcome.APPROVED,
      validatedBy,
      notes,
    );
  }

  async rejectValidation(
    validationResultId: number,
    rejectionCodes: string[],
    validatedBy: number,
    notes?: string,
  ) {
    const result = await this.prisma.trainingValidationResult.findUnique({
      where: { id: validationResultId },
    });
    if (!result) throw new NotFoundException('Validation result not found');

    const reasons = await this.prisma.trainingRejectionReason.findMany({
      where: { code: { in: rejectionCodes } },
    });

    await this.prisma.$transaction([
      this.prisma.trainingValidationResult.update({
        where: { id: validationResultId },
        data: {
          outcome: TrainingValidationOutcome.REJECTED,
          validatedBy,
          details: {
            ...((result.details as Record<string, unknown>) ?? {}),
            rejectionNotes: notes,
          },
        },
      }),
      ...reasons.map((r) =>
        this.prisma.trainingValidationRejection.upsert({
          where: {
            validationResultId_rejectionReasonId: {
              validationResultId,
              rejectionReasonId: r.id,
            },
          },
          create: {
            validationResultId,
            rejectionReasonId: r.id,
            message: notes,
          },
          update: { message: notes },
        }),
      ),
    ]);

    await this.audit(
      'training.validation.reject',
      validationResultId,
      validatedBy,
      {
        rejectionCodes,
        notes,
      },
    );

    if (result.trainingRecordId) {
      const rec = await this.prisma.trainingRecord.findUnique({
        where: { id: result.trainingRecordId },
      });
      if (rec) {
        await this.credentialLedger.recordCredentialRevoked({
          credentialId: rec.id,
          workerId: rec.workerId,
          providerId: rec.providerId ?? rec.trainingProviderId,
          companyId: rec.companyId,
          actorId: validatedBy,
          actorType: CredentialLedgerActorType.SUPERVISOR,
          payload: { rejectionCodes, notes },
        });
      }
    }

    return this.getValidationResult(validationResultId);
  }

  private async updateWorkflow(
    validationResultId: number,
    outcome: TrainingValidationOutcome,
    validatedBy: number,
    notes?: string,
  ) {
    const before = await this.prisma.trainingValidationResult.findUnique({
      where: { id: validationResultId },
    });
    const updated = await this.prisma.trainingValidationResult.update({
      where: { id: validationResultId },
      data: { outcome, validatedBy, details: { approvalNotes: notes } },
      include: { rejections: { include: { rejectionReason: true } } },
    });
    await this.audit(
      outcome === TrainingValidationOutcome.APPROVED
        ? 'training.validation.approve'
        : 'training.validation.update',
      validationResultId,
      validatedBy,
      { outcome, notes },
    );

    if (
      outcome === TrainingValidationOutcome.APPROVED &&
      before?.trainingRecordId
    ) {
      const rec = await this.prisma.trainingRecord.findUnique({
        where: { id: before.trainingRecordId },
      });
      if (rec) {
        await this.credentialLedger.recordCredentialVerified({
          credentialId: rec.id,
          workerId: rec.workerId,
          providerId: rec.providerId ?? rec.trainingProviderId,
          companyId: rec.companyId,
          actorId: validatedBy,
          actorType: CredentialLedgerActorType.SUPERVISOR,
          payload: {
            validationResultId,
            notes,
            source: 'standards_compliance',
          },
        });
      }
    }

    return updated;
  }

  private resolveOutcome(
    issues: ValidationIssue[],
    score: number,
  ): TrainingValidationOutcome {
    const errors = issues.filter((i) =>
      [
        'CSA_STANDARD_MISSING',
        'JURISDICTION_REQUIREMENT_MISSING',
        'PROVIDER_NOT_APPROVED',
        'INSTRUCTOR_NOT_QUALIFIED',
        'CERTIFICATE_EXPIRED',
        'CERTIFICATE_INVALID',
      ].includes(i.code),
    );
    if (errors.length > 0) return TrainingValidationOutcome.REJECTED;
    if (issues.length > 0 || score < 70)
      return TrainingValidationOutcome.NEEDS_REVIEW;
    if (score >= 85) return TrainingValidationOutcome.APPROVED;
    return TrainingValidationOutcome.NEEDS_REVIEW;
  }

  private async resolveJurisdiction(
    override?: string,
    siteRegion?: string | null,
  ) {
    if (override)
      return this.jurisdictionEngine.normalizeJurisdiction(override);
    return this.jurisdictionEngine.normalizeJurisdiction(siteRegion);
  }

  private async loadProviderRules(trainingProviderId: number) {
    return this.prisma.providerQualificationRule.findMany({
      where: {
        active: true,
        OR: [{ trainingProviderId }, { trainingProviderId: null }],
      },
    });
  }

  private async loadInstructorRules(trainingProviderId: number | null) {
    return this.prisma.instructorQualificationRule.findMany({
      where: {
        active: true,
        OR: [{ trainingProviderId }, { trainingProviderId: null }],
      },
    });
  }

  private async persistResult(input: {
    subjectType: TrainingValidationSubject;
    outcome: TrainingValidationOutcome;
    score: number;
    jurisdictionCode: string;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    issues: ValidationIssue[];
    validatedBy?: number;
    details?: unknown;
    trainingRecordId?: number;
    trainingProviderId?: number;
    instructorId?: number;
    courseId?: number;
    certificateQrToken?: string;
  }) {
    const reasonRows = await this.prisma.trainingRejectionReason.findMany({
      where: { code: { in: input.issues.map((i) => i.code) } },
    });
    const reasonByCode = new Map(reasonRows.map((r) => [r.code, r] as const));

    const result = await this.prisma.trainingValidationResult.create({
      data: {
        subjectType: input.subjectType,
        outcome: input.outcome,
        score: input.score,
        jurisdictionCode: input.jurisdictionCode,
        matchedStandardCodes: input.matchedStandardCodes,
        missingStandardCodes: input.missingStandardCodes,
        details: input.details as object,
        validatedBy: input.validatedBy,
        trainingRecordId: input.trainingRecordId,
        trainingProviderId: input.trainingProviderId,
        instructorId: input.instructorId,
        courseId: input.courseId,
        certificateQrToken: input.certificateQrToken,
        rejections: {
          create: input.issues
            .filter((i) => reasonByCode.has(i.code))
            .map((i) => ({
              rejectionReasonId: reasonByCode.get(i.code)!.id,
              message: i.message,
            })),
        },
      },
      include: { rejections: { include: { rejectionReason: true } } },
    });

    await this.audit('training.validation.run', result.id, input.validatedBy, {
      subjectType: input.subjectType,
      outcome: input.outcome,
      score: input.score,
    });

    if (input.trainingRecordId) {
      const record = await this.prisma.trainingRecord.findUnique({
        where: { id: input.trainingRecordId },
        select: { companyId: true, worker: { select: { companyId: true } } },
      });
      this.events?.emit({
        name: DomainEvent.TRAINING_VALIDATED,
        occurredAt: new Date().toISOString(),
        entityType: 'training',
        entityId: input.trainingRecordId,
        companyId: record?.companyId ?? record?.worker?.companyId ?? undefined,
        data: {
          validationResultId: result.id,
          outcome: input.outcome,
        },
      });
    }

    return result;
  }

  private async audit(
    action: string,
    entityId: number,
    userId?: number,
    metadata?: Record<string, unknown>,
  ) {
    await this.monitoring.persistAudit({
      userId,
      action,
      entity: 'TrainingValidationResult',
      entityId,
      metadata,
    });
  }
}
