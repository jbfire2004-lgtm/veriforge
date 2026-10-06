import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { resolvePublicBaseUrl } from '../../config/public-base-url';

export interface DigitalCertificatePayload {
  recordId: number;
  workerId: number;
  workerName: string;
  certificationName: string;
  courseName?: string;
  providerName: string;
  issuedAt: string;
  expiresAt?: string;
  certificateNumber?: string;
  verificationUrl: string;
}

@Injectable()
export class TrainingProviderCertificateService {
  constructor(private readonly prisma: PrismaService) {}

  newQrToken(): string {
    return `cert_${randomBytes(16).toString('hex')}`;
  }

  /** Public app route for certificate QR (human verify UI). */
  verificationPath(token: string): string {
    return `/verify/certificate/${token}`;
  }

  apiValidationPath(token: string): string {
    return `/api/v1/training-providers/certificates/validate/${token}`;
  }

  async buildDigitalCertificate(
    recordId: number,
  ): Promise<DigitalCertificatePayload | null> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: recordId },
      include: {
        worker: true,
        certification: true,
        course: true,
        trainingProvider: true,
      },
    });
    if (!record) return null;

    const token =
      record.certificateQrToken ?? (await this.ensureQrToken(recordId));
    const base = resolvePublicBaseUrl();

    return {
      recordId: record.id,
      workerId: record.workerId,
      workerName: `${record.worker.firstName} ${record.worker.lastName}`,
      certificationName: record.certification.name,
      courseName: record.course?.name,
      providerName: record.trainingProvider?.name ?? 'VERA Training',
      issuedAt: record.issuedAt.toISOString(),
      expiresAt: record.expiresAt?.toISOString(),
      certificateNumber: record.certificateNumber ?? undefined,
      verificationUrl: `${base}${this.verificationPath(token)}`,
    };
  }

  async generateQrDataUrl(recordId: number): Promise<string | null> {
    const cert = await this.buildDigitalCertificate(recordId);
    if (!cert) return null;
    return QRCode.toDataURL(cert.verificationUrl, { margin: 1, width: 256 });
  }

  async validateByToken(token: string) {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { certificateQrToken: token },
      include: {
        worker: true,
        certification: true,
        course: true,
        trainingProvider: true,
        instructor: true,
      },
    });
    if (!record) {
      return { valid: false, reason: 'NOT_FOUND' };
    }
    const expired = record.expiresAt ? record.expiresAt < new Date() : false;
    return {
      valid: !expired,
      expired,
      record: {
        id: record.id,
        workerId: record.workerId,
        workerName: `${record.worker.firstName} ${record.worker.lastName}`,
        certification: record.certification.name,
        course: record.course?.name,
        provider: record.trainingProvider?.name,
        instructor: record.instructor
          ? `${record.instructor.firstName} ${record.instructor.lastName}`
          : null,
        issuedAt: record.issuedAt,
        expiresAt: record.expiresAt,
        certificateNumber: record.certificateNumber,
        certificateUrl: record.certificateUrl,
      },
    };
  }

  private async ensureQrToken(recordId: number): Promise<string> {
    const token = this.newQrToken();
    await this.prisma.trainingRecord.update({
      where: { id: recordId },
      data: { certificateQrToken: token },
    });
    return token;
  }
}
