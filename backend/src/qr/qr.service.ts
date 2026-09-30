import { Injectable, BadRequestException } from '@nestjs/common';
import { CombinedService } from '../combined/combined.service';
import { VerificationService } from '../verification/verification.service';
import { PublicTokenResolver } from '../verification/public-token.resolver';
import type { QrScanDto } from './dto/qr-scan.dto';
import {
  parseCertificateToken,
  parseCombinedUrlIds,
  parseEquipmentPathId,
  parseTypedJsonQr,
  parseWorkerPathId,
} from './qr-parse.util';
import { TrainingProviderCertificateService } from '../modules/training-provider-core/training-provider-certificate.service';
import {
  equipmentQrJsonPayload,
  equipmentVerifyUrlByToken,
  publicBaseUrl,
  workerQrJsonPayload,
  workerVerifyUrlByToken,
} from '../common/wallet-routes';
import { isPublicQrToken } from '../verification/public-token.util';

@Injectable()
export class QrService {
  constructor(
    private combined: CombinedService,
    private verify: VerificationService,
    private readonly trainingCertificates: TrainingProviderCertificateService,
    private readonly publicTokens: PublicTokenResolver,
  ) {}

  async generateWorkerQr(workerId: number) {
    const token = await this.publicTokens.ensureWorkerToken(workerId);
    const url = workerVerifyUrlByToken(token);

    return {
      type: 'worker',
      workerId,
      qrToken: token,
      content: url,
      verifyUrl: url,
      json: workerQrJsonPayload(token, workerId),
    };
  }

  async generateEquipmentQr(equipmentId: number) {
    const token = await this.publicTokens.ensureEquipmentToken(equipmentId);
    const url = equipmentVerifyUrlByToken(token);
    const payload = equipmentQrJsonPayload(token, equipmentId);

    return {
      type: 'equipment',
      equipmentId,
      qrToken: token,
      content: url,
      verifyUrl: url,
      json: payload,
    };
  }

  generateCombinedQr(workerId: number, equipmentId: number) {
    const url = `${publicBaseUrl()}/scan/combined?worker=${workerId}&equipment=${equipmentId}`;

    return {
      type: 'combined',
      workerId,
      equipmentId,
      content: url,
      /** Combined public verify still uses refs — callers should migrate to token pair. */
      legacy: true,
    };
  }

  async parseAndVerify(dto: QrScanDto): Promise<unknown> {
    const qr = (dto.qr ?? '').trim();
    if (!qr) {
      throw new BadRequestException('QR payload is required');
    }
    const assumedTarget = dto.assumedTarget;

    try {
      return await this.parseAndVerifyInner(qr, assumedTarget);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('QR verification failed');
    }
  }

  private async parseAndVerifyInner(
    qr: string,
    assumedTarget?: 'worker' | 'equipment',
  ): Promise<unknown> {
    const certToken = parseCertificateToken(qr);
    if (certToken != null) {
      return this.trainingCertificates.validateByToken(certToken);
    }

    const tokenFromPath = this.extractPublicTokenFromUrl(qr);
    if (tokenFromPath) {
      return this.verify.verifyByPublicToken(tokenFromPath);
    }

    if (qr.startsWith('{')) {
      try {
        const typed = parseTypedJsonQr(qr);
        if (typed?.kind === 'equipment') {
          const ref = typed.token ?? String(typed.id);
          return this.verify.verifyEquipmentByRef(ref);
        }
        if (typed?.kind === 'worker') {
          const ref = typed.token ?? String(typed.id);
          return this.verify.verifyWorkerByRef(ref);
        }
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
        throw new BadRequestException('Invalid JSON QR code');
      }
      throw new BadRequestException('Invalid JSON QR code');
    }

    const combined = parseCombinedUrlIds(qr);
    if (combined != null) {
      return this.combined.verifyCombined(
        combined.workerId,
        combined.equipmentId,
      );
    }

    const workerIdFromPath = parseWorkerPathId(qr);
    if (workerIdFromPath != null) {
      return this.verify.verifyWorkerByRef(String(workerIdFromPath));
    }

    const equipmentIdFromPath = parseEquipmentPathId(qr);
    if (equipmentIdFromPath != null) {
      return this.verify.verifyEquipmentByRef(String(equipmentIdFromPath));
    }

    if (isPublicQrToken(qr)) {
      return this.verify.verifyByPublicToken(qr);
    }

    if (/^\d+$/.test(qr)) {
      throw new BadRequestException(
        'Numeric-only QR is not accepted on public scan — use a Vera token URL or JSON payload with token',
      );
    }

    if (assumedTarget === 'equipment') {
      throw new BadRequestException('Unrecognized equipment QR');
    }
    if (assumedTarget === 'worker') {
      throw new BadRequestException('Unrecognized worker QR');
    }

    throw new BadRequestException('Unknown QR format');
  }

  private extractPublicTokenFromUrl(qr: string): string | null {
    const markers = ['/verify/t/', '/verify/token/'];
    for (const m of markers) {
      const i = qr.indexOf(m);
      if (i >= 0) {
        const rest = qr
          .slice(i + m.length)
          .split(/[/?#]/)[0]
          ?.trim();
        if (rest && isPublicQrToken(rest)) return rest;
      }
    }
    return null;
  }
}
