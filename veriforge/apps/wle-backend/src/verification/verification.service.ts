import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { PublicTokenResolver } from './public-token.resolver';
import {
  publicCompanyName,
  publicCredential,
  publicEquipmentCard,
  publicEquipmentSummary,
  publicTrainingRecord,
  publicWorkerCard,
} from './public-response.sanitizer';
import { isPublicQrToken } from './public-token.util';
import { Prisma, TrainingAttestationRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineService } from '../rules/rule-engine.service';
import type {
  TrainingRecordOverallStatus,
  TrainingRecordVerificationResult,
  ValidateTrainingRecordOptions,
} from './types/training-record-verification.types';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/notification-types';
import { RegulatoryDecisionService } from '../modules/training-standards-compliance/regulatory/regulatory-decision.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { phase1RequestStore } from '../common/monitoring/phase1-request-context.storage';
import {
  aggregateTrainingRecordOverallStatus,
  buildTrainingRecordVerificationSummary,
  checkCertificateNumber,
  checkCompletionState,
  checkCredentialCoverage,
  checkExpectedCompany,
  checkExpectedProvider,
  checkExpiry,
  checkProvider,
  checkTrainingType,
  checkWorkerIdentity,
} from './training-record-checks';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import type { WalletTrainingRecordDto } from '../modules/vera-core/training-wallet.mapper';
import { TrainingCredentialNftCoordinatorService } from '../modules/training-credential-nft/training-credential-nft-coordinator.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';

export type VerificationIssueType =
  | 'MISSING'
  | 'EXPIRED'
  | 'EXPIRING_SOON'
  | 'NO_DOCUMENT';

export interface WorkerVerificationStatus {
  workerId: number;
  isCompliant: boolean;
  issues: {
    type: VerificationIssueType;
    courseName: string;
    expiresAt: Date | null;
  }[];
}

const EXPIRING_SOON_DAYS = 30;

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  constructor(
    private prisma: PrismaService,
    private ruleEngine: RuleEngineService,
    private readonly monitoring: Phase1MonitoringService,
    private readonly auditLog: AuditLogService,
    private readonly publicTokens: PublicTokenResolver,
    @Optional()
    @Inject(forwardRef(() => TrainingWalletIntegrationService))
    private readonly walletIntegration?: TrainingWalletIntegrationService,
    @Optional()
    private readonly nftCoordinator?: TrainingCredentialNftCoordinatorService,
    @Optional()
    private readonly regulatoryDecision?: RegulatoryDecisionService,
    @Optional()
    private readonly events?: EventBusService,
    @Optional()
    private readonly notifications?: NotificationsService,
  ) {}

  // ---------------------------------------------------------
  // PHASE 1: TRAINING + DOCUMENT COMPLIANCE ENGINE
  // ---------------------------------------------------------
  async evaluateWorkerCompliance(
    workerId: number,
  ): Promise<WorkerVerificationStatus> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: { include: { trainingRequirements: true } },
        trainingRecords: {
          include: {
            certification: true,
            trainingProvider: true,
            instructor: true,
            course: { include: { standards: true } },
            company: true,
            project: { include: { site: true } },
          },
          orderBy: { issuedAt: 'desc' },
        },
        documents: { where: { type: 'TRAINING' } },
      },
    });

    if (!worker || !worker.company) {
      return { workerId, isCompliant: false, issues: [] };
    }

    const now = new Date();
    const issues: WorkerVerificationStatus['issues'] = [];

    for (const req of worker.company.trainingRequirements) {
      const courseName = req.courseName;

      const record = worker.trainingRecords.find(
        (t) => t.certification.name.toLowerCase() === courseName.toLowerCase(),
      );

      const doc = worker.documents.find((d) =>
        d.name.toLowerCase().includes(courseName.toLowerCase()),
      );

      // Missing training record
      if (!record) {
        issues.push({
          type: 'MISSING',
          courseName,
          expiresAt: null,
        });

        if (!doc) {
          issues.push({
            type: 'NO_DOCUMENT',
            courseName,
            expiresAt: null,
          });
        }

        continue;
      }

      // Expired training
      if (record.expiresAt && record.expiresAt <= now) {
        issues.push({
          type: 'EXPIRED',
          courseName,
          expiresAt: record.expiresAt,
        });
      }

      // Expiring soon
      if (record.expiresAt) {
        const diffDays =
          (record.expiresAt.getTime() - now.getTime()) / 86400000;

        if (diffDays > 0 && diffDays <= EXPIRING_SOON_DAYS) {
          issues.push({
            type: 'EXPIRING_SOON',
            courseName,
            expiresAt: record.expiresAt,
          });
        }
      }

      // Missing document even if record exists
      if (!doc) {
        issues.push({
          type: 'NO_DOCUMENT',
          courseName,
          expiresAt: record.expiresAt ?? null,
        });
      }
    }

    const blocking = issues.filter(
      (i) =>
        i.type === 'MISSING' ||
        i.type === 'EXPIRED' ||
        i.type === 'NO_DOCUMENT',
    );

    return {
      workerId,
      isCompliant: blocking.length === 0,
      issues,
    };
  }

  // ---------------------------------------------------------
  // PUBLIC WORKER CARD (QR / verify UI) — minimal, no tenant ids
  // ---------------------------------------------------------
  async verifyByPublicToken(token: string) {
    const trimmed = token.trim();
    if (!isPublicQrToken(trimmed)) {
      throw new NotFoundException('Invalid verification token');
    }
    if (trimmed.startsWith('e-') || trimmed.startsWith('E-')) {
      return this.verifyEquipmentByRef(trimmed);
    }
    return this.verifyWorkerByRef(trimmed);
  }

  async verifyWorker(workerId: number) {
    return this.verifyWorkerPublic(workerId);
  }

  async verifyWorkerByRef(ref: string) {
    const resolved = await this.publicTokens.resolveWorkerRef(ref);
    return this.verifyWorkerPublic(resolved.workerId, resolved.qrToken);
  }

  async verifyWorkerFullByRef(ref: string) {
    const resolved = await this.publicTokens.resolveWorkerRef(ref);
    return this.verifyWorkerFull(resolved.workerId);
  }

  verifyEquipmentMissingRef(): never {
    throw new BadRequestException(
      'Equipment verification requires ?ref= (qr token) or legacy ?id=',
    );
  }

  async verifyWorkerPublic(workerId: number, knownToken?: string | null) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: { select: { name: true } },
        trainingRecords: {
          include: { certification: true },
          orderBy: { issuedAt: 'desc' },
          take: 50,
        },
        credentials: { include: { certification: true }, take: 20 },
        equipmentAssignments: {
          where: { endedAt: null },
          include: {
            equipment: { select: { id: true, name: true, safetyStatus: true } },
          },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const qrToken =
      knownToken ??
      worker.qrToken ??
      (await this.publicTokens.ensureWorkerToken(workerId));
    const compliance = await this.evaluateWorkerCompliance(workerId);

    const certifications = worker.trainingRecords.map((tr) =>
      publicTrainingRecord({
        id: tr.id,
        expiresAt: tr.expiresAt,
        issuedAt: tr.issuedAt,
        completedAt: tr.completedAt,
        certification: tr.certification,
      }),
    );

    const credentials = worker.credentials.map((c) => publicCredential(c));
    const equipment = worker.equipmentAssignments
      .map((a) => a.equipment)
      .filter(Boolean)
      .map((eq) => publicEquipmentSummary(eq!));

    const card = publicWorkerCard({
      qrToken,
      firstName: worker.firstName,
      lastName: worker.lastName,
      photoUrl: worker.photoUrl,
      companyName: worker.company?.name ?? null,
      compliance,
      certifications,
      credentials,
      equipment,
    });

    return {
      ...card,
      /** @deprecated Legacy wallet shape — prefer `training` / `publicRef`. */
      worker: {
        firstName: worker.firstName,
        lastName: worker.lastName,
        photoUrl: worker.photoUrl,
        company: publicCompanyName(worker.company),
      },
      certifications,
      trainingRecords: certifications,
      credentials,
      equipment,
      compliance: {
        isCompliant: compliance.isCompliant,
        issues: compliance.issues.map((i) => ({
          type: i.type,
          courseName: i.courseName,
          expiresAt: i.expiresAt,
        })),
      },
    };
  }

  // ---------------------------------------------------------
  // FULL WORKER VERIFICATION + RULE ENGINE + PHASE 1 COMPLIANCE
  // ---------------------------------------------------------
  async verifyWorkerFull(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: { include: { trainingRequirements: true } },
        trainingRecords: {
          include: {
            certification: true,
            trainingProvider: true,
            instructor: true,
            course: { include: { standards: true } },
            company: true,
            project: { include: { site: true } },
          },
          orderBy: { issuedAt: 'desc' },
        },
        credentials: { include: { certification: true } },
        incidents: true,
        documents: { where: { type: 'TRAINING' } },
        equipmentAssignments: {
          where: { endedAt: null },
          include: { equipment: { include: { company: true } } },
        },
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();

    const expiredCerts = worker.trainingRecords.filter(
      (t) => t.expiresAt && t.expiresAt <= now,
    );

    const compliance = await this.evaluateWorkerCompliance(workerId);

    const ruleResult = this.ruleEngine.evaluate({
      worker,
      equipment: { incidents: [] },
      requiredCerts: [],
    });

    const certifications = this.walletIntegration
      ? await this.walletIntegration.listWalletTraining(workerId)
      : worker.trainingRecords;

    return {
      worker,
      certifications,
      credentials: worker.credentials,
      expiredCerts,
      activeIncidents: worker.incidents,
      ruleResult,
      compliance, // <-- Phase 1 compliance included
    };
  }

  private mapPublicTraining(tr: WalletTrainingRecordDto) {
    return {
      id: tr.id,
      name: tr.courseName ?? tr.certification?.name ?? 'Training',
      courseName: tr.courseName,
      expiresAt: tr.expiresAt,
      issuedAt: tr.issuedAt,
      completedAt: tr.completedAt,
      certification: tr.certification,
      providerName: tr.providerName,
      instructorName: tr.instructorName,
      courseStandards: tr.courseStandards,
      jurisdictionCode: tr.jurisdictionCode,
      jurisdictionValid: tr.jurisdictionValid,
      certificateQrToken: tr.certificateQrToken,
      certificateQrUrl: tr.certificateQrUrl,
      certificateNumber: tr.certificateNumber,
      complianceStatus: tr.complianceStatus,
      companyName: tr.companyName,
      projectName: tr.projectName,
    };
  }

  // ---------------------------------------------------------
  // PUBLIC EQUIPMENT CARD (QR / verify UI)
  // ---------------------------------------------------------
  async verifyEquipment(equipmentId: number) {
    return this.verifyEquipmentPublic(equipmentId);
  }

  async verifyEquipmentByRef(ref: string) {
    const resolved = await this.publicTokens.resolveEquipmentRef(ref);
    return this.verifyEquipmentPublic(resolved.equipmentId, resolved.qrToken);
  }

  async verifyEquipmentFullByRef(ref: string) {
    const resolved = await this.publicTokens.resolveEquipmentRef(ref);
    return this.verifyEquipmentFull(resolved.equipmentId);
  }

  async verifyEquipmentPublic(equipmentId: number, knownToken?: string | null) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        company: { select: { name: true } },
        equipmentAssignments: {
          where: { endedAt: null },
          include: {
            worker: { select: { firstName: true, lastName: true } },
          },
          take: 10,
        },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const qrToken =
      knownToken ??
      equipment.qrToken ??
      (await this.publicTokens.ensureEquipmentToken(equipmentId));

    const card = publicEquipmentCard({
      qrToken,
      name: equipment.name,
      safetyStatus: equipment.safetyStatus,
      photoUrl: equipment.photoUrl,
      companyName: equipment.company?.name ?? null,
      assignedWorkers: equipment.equipmentAssignments
        .map((a) => a.worker)
        .filter(Boolean)
        .map((w) => ({
          displayName: `${w!.firstName} ${w!.lastName}`.trim(),
        })),
    });

    return {
      ...card,
      equipment: publicEquipmentSummary(equipment),
    };
  }

  // ---------------------------------------------------------
  // FULL EQUIPMENT VERIFICATION + RULE ENGINE
  // ---------------------------------------------------------
  async verifyEquipmentFull(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        equipmentAssignments: {
          include: {
            worker: {
              include: {
                trainingRecords: true,
                credentials: true,
                incidents: true,
                company: true,
              },
            },
          },
        },
        incidents: true,
        company: true,
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');

    const assignedWorkers = equipment.equipmentAssignments
      .map((a) => a.worker)
      .filter(Boolean);

    const ruleResult = this.ruleEngine.evaluate({
      worker: assignedWorkers[0] ?? {
        trainingRecords: [],
        credentials: [],
        incidents: [],
      },
      equipment,
      requiredCerts: [],
    });

    return {
      equipment,
      requiredCerts: [],
      assignedWorkers,
      activeIncidents: equipment.incidents,
      ruleResult,
    };
  }

  // ---------------------------------------------------------
  // COMBINED VERIFICATION + RULE ENGINE + PHASE 1 COMPLIANCE
  // ---------------------------------------------------------
  /** Staff/authenticated combined verification (full objects). */
  async verifyCombined(workerId: number, equipmentId: number) {
    this.monitoring.processing('verification', 'combined.start', {
      workerId,
      equipmentId,
    });
    const workerFull = await this.verifyWorkerFull(workerId);
    const equipmentFull = await this.verifyEquipmentFull(equipmentId);

    const requiredCertIds: number[] = [];

    const ruleResult = this.ruleEngine.evaluate({
      worker: workerFull.worker,
      equipment: equipmentFull.equipment,
      requiredCerts: requiredCertIds,
    });

    return {
      worker: workerFull.worker,
      equipment: equipmentFull.equipment,
      ruleResult,
      missingCertifications: ruleResult.missingCertifications,
      expiredTraining: ruleResult.expiredTraining,
      expiredCredentials: ruleResult.expiredCredentials,
      workerIncidents: ruleResult.workerIncidents,
      equipmentIncidents: ruleResult.equipmentIncidents,
      compliance: workerFull.compliance,
    };
  }

  /** Public combined check — sanitized summaries only. */
  async verifyCombinedPublic(workerRef: string, equipmentRef: string) {
    const worker = await this.verifyWorkerByRef(workerRef);
    const equipment = await this.verifyEquipmentByRef(equipmentRef);
    const safe =
      (worker.compliance?.isCompliant ?? false) &&
      (equipment.isSafe ?? equipment.safetyStatus === 'OK');

    return {
      status: safe ? 'SAFE' : 'UNSAFE',
      worker: {
        publicRef: worker.publicRef,
        displayName: worker.displayName,
        company: worker.company,
        isCompliant: worker.compliance?.isCompliant ?? false,
      },
      equipment: {
        publicRef: equipment.publicRef,
        name: equipment.name,
        isSafe: equipment.isSafe,
        safetyStatus: equipment.safetyStatus,
      },
    };
  }

  // ---------------------------------------------------------
  // CERTIFICATION DEFINITION (by certification id)
  // ---------------------------------------------------------
  async verifyCertificationPublic(certificationId: number) {
    const cert = await this.prisma.certification.findUnique({
      where: { id: certificationId },
      include: {
        _count: { select: { trainingRecords: true, credentials: true } },
      },
    });

    if (!cert) throw new NotFoundException('Certification not found');

    return {
      type: 'cert',
      id: cert.id,
      name: cert.name,
      code: cert.code,
      description: cert.description,
      trainingRecordCount: cert._count.trainingRecords,
      credentialCount: cert._count.credentials,
    };
  }

  // ---------------------------------------------------------
  // TRAINING RECORD (by training record id)
  // ---------------------------------------------------------
  async verifyTrainingRecordPublic(trainingRecordId: number) {
    const tr = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        certification: true,
        worker: { include: { company: true } },
        provider: true,
      },
    });

    if (!tr) throw new NotFoundException('Training record not found');

    const w = tr.worker;
    const record = publicTrainingRecord({
      id: tr.id,
      expiresAt: tr.expiresAt,
      issuedAt: tr.issuedAt,
      completedAt: tr.completedAt,
      certificateNumber: tr.certificateNumber,
      certification: tr.certification,
    });
    return {
      type: 'training',
      displayName: `${w.firstName} ${w.lastName}`.trim(),
      company: publicCompanyName(w.company),
      training: record,
      providerName: tr.provider?.name ?? null,
    };
  }

  // ---------------------------------------------------------
  // CREDENTIAL (worker-issued pass / card)
  // ---------------------------------------------------------
  async verifyCredentialPublic(credentialId: number) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        worker: { include: { company: true } },
        certification: true,
      },
    });

    if (!credential) throw new NotFoundException('Credential not found');

    const now = new Date();
    const valid =
      !credential.expiresAt || credential.expiresAt.getTime() > now.getTime();
    const status = valid ? 'VALID' : 'EXPIRED';

    const w = credential.worker;

    const relatedTrainingRecords =
      credential.certificationId != null
        ? await this.prisma.trainingRecord.findMany({
            where: {
              workerId: w.id,
              certificationId: credential.certificationId,
            },
            select: { id: true },
            orderBy: { issuedAt: 'desc' },
            take: 5,
          })
        : [];

    return {
      type: 'credential',
      displayName: `${w.firstName} ${w.lastName}`.trim(),
      company: publicCompanyName(w.company),
      credential: publicCredential({
        id: credential.id,
        name: credential.name,
        issuedAt: credential.issuedAt,
        expiresAt: credential.expiresAt,
        certification: credential.certification,
      }),
      relatedTrainingCount: relatedTrainingRecords.length,
    };
  }

  // ---------------------------------------------------------
  // COMPANY (public org card)
  // ---------------------------------------------------------
  async verifyCompanyPublic(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: { select: { workers: true, equipment: true } },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    return {
      type: 'company',
      name: company.name,
      logoUrl: company.logoUrl ?? null,
      workerCount: company._count.workers,
      equipmentCount: company._count.equipment,
    };
  }

  // ---------------------------------------------------------
  // SITE ACCESS — token formats: "workerId-siteId", "workerId_siteId"
  // ---------------------------------------------------------
  private parseWorkerSiteToken(token: string): {
    workerId: number;
    siteId: number;
  } {
    const raw = decodeURIComponent(token).trim();
    const parts = raw.split(/[-_/]/).map((p) => parseInt(p, 10));
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) {
      throw new BadRequestException(
        'Invalid site-access id. Use workerId-siteId (e.g. 12-3).',
      );
    }
    return { workerId: parts[0], siteId: parts[1] };
  }

  async verifySiteAccessPublic(token: string) {
    const { workerId, siteId } = this.parseWorkerSiteToken(token);

    const access = await this.prisma.workerSiteAccess.findUnique({
      where: {
        workerId_siteId: { workerId, siteId },
      },
      include: {
        worker: { include: { company: true } },
        site: true,
      },
    });

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: { company: true },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    const compliance = await this.evaluateWorkerCompliance(workerId);
    const blocking = compliance.issues.filter(
      (i) =>
        i.type === 'MISSING' ||
        i.type === 'EXPIRED' ||
        i.type === 'NO_DOCUMENT',
    );

    const ruleOk = blocking.length === 0;
    const accessOk =
      access && access.status === 'ALLOWED' && access.approved && ruleOk;

    return {
      type: 'site-access',
      firstName: worker.firstName,
      lastName: worker.lastName,
      photoUrl: worker.photoUrl,
      company: worker.company,
      siteAccess: {
        isAllowed: accessOk,
        workerId,
        siteId,
        siteName: site.name,
        accessStatus: access?.status ?? 'NO_RECORD',
        approved: access?.approved ?? false,
        notes: access?.notes ?? null,
        complianceOk: ruleOk,
        compliance,
      },
    };
  }

  // ---------------------------------------------------------
  // VERA CORE — structured training record verification
  // Inputs: trainingRecordId; optional expectedWorkerId, expectedCompanyId, expectedTrainingType,
  // expectedCertificateNumber, expectedProvider (see types + parse-validate-training-record-query).
  // Checks: training-record-checks (expiry, provider, identity, company, type, cert #, credentials, completion).
  // ---------------------------------------------------------

  async validateTrainingRecord(
    trainingRecordId: number,
    options?: ValidateTrainingRecordOptions,
  ): Promise<TrainingRecordVerificationResult> {
    this.logger.log(
      JSON.stringify({
        type: 'verification.training.start',
        trainingRecordId,
        options: options ?? null,
      }),
    );
    const tr = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        certification: true,
        worker: {
          include: {
            company: true,
            credentials: { include: { certification: true } },
          },
        },
        provider: true,
      },
    });

    if (!tr) throw new NotFoundException('Training record not found');

    const expiry = checkExpiry(tr);
    const provider = checkProvider(tr);
    const expectedProvider = checkExpectedProvider(tr, {
      expectedProvider: options?.expectedProvider,
    });
    const workerIdentity = checkWorkerIdentity(tr, options);
    const expectedCompany = checkExpectedCompany(tr, {
      expectedCompanyId: options?.expectedCompanyId,
    });
    const trainingType = checkTrainingType(tr.certification, {
      expectedTrainingType: options?.expectedTrainingType,
    });
    const certificateNumber = checkCertificateNumber(
      {
        certificateNumber: tr.certificateNumber ?? null,
      },
      {
        expectedCertificateNumber: options?.expectedCertificateNumber,
      },
    );
    const credentialCoverage = checkCredentialCoverage(
      tr.worker.credentials,
      tr.certificationId,
      tr.certification.name,
    );
    const completionState = checkCompletionState(tr);

    const checks = {
      expiry,
      provider,
      expectedProvider,
      workerIdentity,
      expectedCompany,
      trainingType,
      certificateNumber,
      credentialCoverage,
      completionState,
    };
    const overallStatus = aggregateTrainingRecordOverallStatus(checks);
    const summary = buildTrainingRecordVerificationSummary(checks);
    const requestActorUserId = phase1RequestStore.getStore()?.userId;
    await this.auditLog.logAudit(
      { id: requestActorUserId ?? null, companyId: tr.worker.companyId },
      AuditAction.VERIFICATION_SUCCESS,
      {
        type: AuditEntityType.TRAINING_RECORD,
        id: tr.id,
        tenantId: tr.worker.companyId,
      },
      {
        overallStatus,
        options: options ?? null,
        workerId: tr.worker.id,
        certificationId: tr.certificationId,
        checkStatuses: {
          expiry: expiry.status,
          provider: provider.status,
          expectedProvider: expectedProvider.status,
          workerIdentity: workerIdentity.status,
          expectedCompany: expectedCompany.status,
          trainingType: trainingType.status,
          certificateNumber: certificateNumber.status,
          credentialCoverage: credentialCoverage.status,
          completionState: completionState.status,
        },
      },
    );
    this.monitoring.processing('verification', 'training_record.validate', {
      trainingRecordId: tr.id,
      workerId: tr.worker.id,
      overallStatus,
    });

    const verifiedAt = new Date();
    await this.persistVerificationSnapshot(
      tr.id,
      overallStatus,
      checks,
      verifiedAt,
    );

    if (overallStatus !== 'VERIFIED') {
      void this.notifyVerificationAttention(
        tr.id,
        tr.worker.companyId,
        overallStatus,
        summary.join(' '),
      );
    }

    return {
      trainingRecordId: tr.id,
      overallStatus,
      certification: {
        id: tr.certification.id,
        name: tr.certification.name,
        code: tr.certification.code ?? null,
      },
      worker: {
        id: tr.worker.id,
        firstName: tr.worker.firstName,
        lastName: tr.worker.lastName,
        companyId: tr.worker.companyId,
        companyName: tr.worker.company?.name ?? null,
      },
      checks,
      summary,
      verifiedAt: verifiedAt.toISOString(),
    };
  }

  async getTrainingVerificationSnapshot(trainingRecordId: number) {
    const tr = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        credentialNft: true,
        nftMintJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!tr) throw new NotFoundException('Training record not found');
    const snapshot = tr as typeof tr & {
      lastVerificationStatus?: string | null;
      lastVerificationChecks?: unknown;
      verifiedAt?: Date | null;
    };
    return {
      trainingRecordId: tr.id,
      lastVerificationStatus: snapshot.lastVerificationStatus ?? null,
      lastVerificationChecks: snapshot.lastVerificationChecks ?? null,
      verifiedAt: snapshot.verifiedAt?.toISOString() ?? null,
      completedAt: tr.completedAt?.toISOString() ?? null,
      credentialNft: tr.credentialNft,
      latestMintJob: tr.nftMintJobs[0] ?? null,
    };
  }

  async completeTrainingVerification(
    trainingRecordId: number,
    actor?: { userId: number } | null,
  ): Promise<{ ok: true }> {
    const tr = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        id: true,
        workerId: true,
        completedAt: true,
        expiresAt: true,
        worker: { select: { id: true, status: true, companyId: true } },
      },
    });
    if (!tr) {
      throw new NotFoundException('Training record not found');
    }
    if (!tr.worker) {
      throw new NotFoundException('Worker not found for training record');
    }

    if (tr.completedAt != null) {
      this.logger.log(
        JSON.stringify({
          type: 'verification.training.complete.idempotent',
          trainingRecordId: tr.id,
          workerId: tr.workerId,
        }),
      );
      await this.auditLog.logAudit(
        { id: actor?.userId ?? null, companyId: tr.worker.companyId },
        AuditAction.VERIFICATION_SUCCESS,
        {
          type: AuditEntityType.TRAINING_RECORD,
          id: tr.id,
          tenantId: tr.worker.companyId,
        },
        {
          reason: 'already_completed',
          trainingRecordId: tr.id,
          workerId: tr.workerId,
          completedByUserId: actor?.userId ?? null,
        },
      );
      return { ok: true };
    }

    const statusNorm = tr.worker.status.trim().toUpperCase();
    if (statusNorm !== 'ACTIVE') {
      throw new BadRequestException(
        `Cannot complete verification: worker status is ${tr.worker.status} (ACTIVE required)`,
      );
    }

    const now = new Date();
    if (tr.expiresAt != null && tr.expiresAt.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'Cannot complete verification: training record is expired',
      );
    }

    this.monitoring.processing(
      'verification',
      'training_record.complete.start',
      {
        trainingRecordId: tr.id,
        workerId: tr.workerId,
        completedByUserId: actor?.userId ?? null,
      },
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.trainingRecord.update({
        where: { id: tr.id },
        data: { completedAt: new Date() },
      });
      await tx.trainingAttestation.create({
        data: {
          trainingRecordId: tr.id,
          attestedByWorkerId: tr.workerId,
          role: TrainingAttestationRole.OTHER,
          notes:
            actor?.userId != null
              ? `Core training verification marked complete (signed by user ${actor.userId})`
              : 'Core training verification marked complete',
        },
      });
      await this.auditLog.logAudit(
        { id: actor?.userId ?? null, companyId: tr.worker.companyId },
        AuditAction.VERIFICATION_SUCCESS,
        {
          type: AuditEntityType.TRAINING_RECORD,
          id: tr.id,
          tenantId: tr.worker.companyId,
        },
        {
          event: 'training_verification.completed',
          trainingRecordId: tr.id,
          workerId: tr.workerId,
          source: 'core_verification_ui',
          completedByUserId: actor?.userId ?? null,
        },
        { tx },
      );
    });

    this.logger.log(
      JSON.stringify({
        type: 'verification.training.completed',
        trainingRecordId: tr.id,
        workerId: tr.workerId,
        completedByUserId: actor?.userId ?? null,
      }),
    );
    this.monitoring.processing(
      'verification',
      'training_record.complete.done',
      {
        trainingRecordId: tr.id,
        workerId: tr.workerId,
        completedByUserId: actor?.userId ?? null,
      },
    );

    await this.closeVerificationLoop(tr.id, actor);

    return { ok: true };
  }

  private async persistVerificationSnapshot(
    trainingRecordId: number,
    overallStatus: TrainingRecordOverallStatus,
    checks: TrainingRecordVerificationResult['checks'],
    verifiedAt: Date,
  ): Promise<void> {
    await this.prisma.trainingRecord.update({
      where: { id: trainingRecordId },
      data: {
        lastVerificationStatus: overallStatus,
        lastVerificationChecks: JSON.parse(JSON.stringify(checks)),
        verifiedAt,
      } as Prisma.TrainingRecordUpdateInput,
    });
  }

  private async closeVerificationLoop(
    trainingRecordId: number,
    actor?: { userId: number } | null,
  ): Promise<void> {
    const validation = await this.validateTrainingRecord(trainingRecordId);

    if (this.regulatoryDecision) {
      try {
        await this.regulatoryDecision.verifyTrainingAgainstRegulations(
          trainingRecordId,
          actor?.userId,
        );
      } catch (e) {
        this.logger.warn(
          `Regulatory verification failed for record ${trainingRecordId}: ${e}`,
        );
      }
    }

    if (this.walletIntegration) {
      try {
        await this.walletIntegration.syncAfterTrainingRecord(trainingRecordId);
      } catch (e) {
        this.logger.warn(
          `Wallet sync failed for record ${trainingRecordId}: ${e}`,
        );
      }
    }

    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        companyId: true,
        worker: { select: { companyId: true } },
      },
    });
    const companyId =
      record?.companyId ?? record?.worker.companyId ?? undefined;
    const occurredAt = new Date().toISOString();

    this.events?.emit({
      name: DomainEvent.VERIFICATION_COMPLETED,
      occurredAt,
      companyId,
      entityType: 'training_record',
      entityId: trainingRecordId,
      actorId: actor?.userId,
      data: { overallStatus: validation.overallStatus },
    });
    this.events?.emit({
      name: DomainEvent.TRAINING_VALIDATED,
      occurredAt,
      companyId,
      entityType: 'training_record',
      entityId: trainingRecordId,
      actorId: actor?.userId,
      data: { overallStatus: validation.overallStatus },
    });

    void this.nftCoordinator?.scheduleMintIfEligible(trainingRecordId);
  }

  private async notifyVerificationAttention(
    trainingRecordId: number,
    companyId: number | null,
    overallStatus: TrainingRecordOverallStatus,
    summary: string,
  ): Promise<void> {
    if (!companyId || !this.notifications || overallStatus === 'VERIFIED') {
      return;
    }
    this.events?.emit({
      name: DomainEvent.TRAINING_VERIFICATION_ATTENTION,
      occurredAt: new Date().toISOString(),
      companyId,
      entityType: 'training_record',
      entityId: trainingRecordId,
      data: { overallStatus, summary },
    });
    await this.notifications.notifyCompanySupervisors(companyId, {
      type: NOTIFICATION_TYPES.TRAINING_VERIFICATION_ATTENTION,
      title: 'Training verification needs review',
      body: `Record #${trainingRecordId} — ${overallStatus}. ${summary}`,
      payload: { trainingRecordId, overallStatus },
      dedupeKey: `training-verification-attention:${trainingRecordId}:${overallStatus}`,
      companyId,
    });
  }
}
