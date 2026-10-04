import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  TrainingValidationOutcome,
  TrainingValidationSubject,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingProviderCertificateService } from '../modules/training-provider-core/training-provider-certificate.service';
import { parseCertificateToken } from '../qr/qr-parse.util';
import { newIngestionCorrelationId } from './pipeline/correlation';
import type { QrIngestResult } from './pipeline/types';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';

@Injectable()
export class TrainingQrIngestionService {
  private readonly logger = new Logger(TrainingQrIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly certificates: TrainingProviderCertificateService,
    private readonly monitoring: Phase1MonitoringService,
  ) {}

  async ingestFromQr(
    companyId: number,
    workerId: number,
    qrPayload: string,
  ): Promise<QrIngestResult> {
    const correlationId = newIngestionCorrelationId();
    this.logStep(correlationId, 'qr.start', { companyId, workerId });

    const token = parseCertificateToken(qrPayload.trim());
    if (!token) {
      throw new BadRequestException({
        code: 'INVALID_QR',
        message:
          'Unrecognized QR format. Scan a Vera training certificate QR code.',
        correlationId,
      });
    }

    const validation = await this.certificates.validateByToken(token);
    if (!validation.valid && validation.reason === 'NOT_FOUND') {
      throw new NotFoundException({
        code: 'UNKNOWN_PROVIDER',
        message: 'Certificate not found for this QR code.',
        correlationId,
      });
    }

    if (validation.expired) {
      throw new BadRequestException({
        code: 'EXPIRED_QR',
        message: 'This certificate has expired.',
        correlationId,
      });
    }

    const record = validation.record;
    if (!record) {
      throw new BadRequestException({
        code: 'INVALID_QR',
        message: 'Certificate data could not be resolved.',
        correlationId,
      });
    }

    const worker = await this.prisma.worker.findFirst({
      where: { id: workerId, companyId },
    });
    if (!worker) {
      throw new NotFoundException('Worker not found for this company');
    }

    const trainingRecord = await this.prisma.trainingRecord.findFirst({
      where: { certificateQrToken: token, companyId },
    });
    if (!trainingRecord) {
      throw new NotFoundException({
        code: 'UNKNOWN_PROVIDER',
        message: 'Training record not found for certificate token.',
        correlationId,
      });
    }

    if (trainingRecord.workerId === workerId) {
      this.logStep(correlationId, 'qr.linked', {
        trainingRecordId: trainingRecord.id,
      });
      return {
        correlationId,
        status: 'linked',
        trainingRecordId: trainingRecord.id,
        certificate: {
          valid: true,
          expired: false,
          workerId: record.workerId,
          workerName: record.workerName,
          certification: record.certification,
          issuedAt: record.issuedAt?.toISOString?.() ?? String(record.issuedAt),
          expiresAt: record.expiresAt?.toISOString?.() ?? null,
        },
        message: 'Certificate already linked to this worker.',
      };
    }

    // Different worker — supervisor must approve linking scanned credential.
    const validationResult = await this.prisma.trainingValidationResult.create({
      data: {
        subjectType: TrainingValidationSubject.TRAINING_RECORD,
        outcome: TrainingValidationOutcome.NEEDS_REVIEW,
        trainingRecordId: trainingRecord.id,
        certificateQrToken: token,
        score: 50,
        details: {
          source: 'qr_ingestion',
          correlationId,
          requestedWorkerId: workerId,
          certificateWorkerId: trainingRecord.workerId,
          scannedWorkerName: record.workerName,
        },
      },
    });

    this.monitoring.processing('training_ingestion', 'qr.needs_review', {
      correlationId,
      trainingRecordId: trainingRecord.id,
      validationResultId: validationResult.id,
    });

    return {
      correlationId,
      status: 'needs_review',
      trainingRecordId: trainingRecord.id,
      validationResultId: validationResult.id,
      certificate: {
        valid: true,
        expired: false,
        workerId: record.workerId,
        workerName: record.workerName,
        certification: record.certification,
        issuedAt: record.issuedAt?.toISOString?.() ?? String(record.issuedAt),
        expiresAt: record.expiresAt?.toISOString?.() ?? null,
      },
      message:
        'Certificate belongs to another worker. Submitted for supervisor review.',
    };
  }

  private logStep(
    correlationId: string,
    step: string,
    data?: Record<string, unknown>,
  ): void {
    this.logger.log(
      JSON.stringify({
        type: `training_ingestion.${step}`,
        correlationId,
        ...data,
      }),
    );
  }
}
