import { Injectable, BadRequestException } from '@nestjs/common';
import { VerificationService } from '../verification/verification.service';
import { CombinedService } from '../combined/combined.service';

@Injectable()
export class MobileScanService {
  constructor(
    private verify: VerificationService,
    private combined: CombinedService,
  ) {}

  // ---------------------------------------------------------
  // MAIN ENTRY: AUTO-DETECT QR TYPE
  // ---------------------------------------------------------
  async scan(qr: string) {
    const trimmed = qr.trim();

    // 1. JSON QR (equipment)
    if (trimmed.startsWith('{')) {
      try {
        const data = JSON.parse(trimmed);

        if (data.type === 'equipment' && data.id) {
          return this.verifyEquipment(data.id);
        }

        throw new BadRequestException('Invalid equipment QR format');
      } catch {
        throw new BadRequestException('Invalid JSON QR');
      }
    }

    // 2. URL QR (worker or combined)
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);

      // Combined
      if (url.pathname.includes('/combined')) {
        const workerId = parseInt(url.searchParams.get('worker') || '', 10);
        const equipmentId = parseInt(url.searchParams.get('equipment') || '', 10);

        if (!workerId || !equipmentId)
          throw new BadRequestException('Invalid combined QR');

        return this.verifyCombined(workerId, equipmentId);
      }

      // Worker
      if (url.pathname.includes('/worker/')) {
        const id = parseInt(url.pathname.split('/worker/')[1], 10);
        if (!id) throw new BadRequestException('Invalid worker QR');

        return this.verifyWorker(id);
      }
    }

    throw new BadRequestException('Unknown QR format');
  }

  // ---------------------------------------------------------
  // WORKER VERIFICATION (MOBILE PAYLOAD)
  // ---------------------------------------------------------
  async verifyWorker(workerId: number) {
    const result = await this.verify.verifyWorkerFull(workerId);

    return {
      type: 'worker',
      workerId,
      status: result.status,
      worker: result.worker,
      training: result.training,
      credentials: result.credentials,
      incidents: result.incidents,
    };
  }

  // ---------------------------------------------------------
  // EQUIPMENT VERIFICATION (MOBILE PAYLOAD)
  // ---------------------------------------------------------
  async verifyEquipment(equipmentId: number) {
    const result = await this.verify.verifyEquipmentFull(equipmentId);

    return {
      type: 'equipment',
      equipmentId,
      status: result.status,
      equipment: result.equipment,
      inspections: result.inspections ?? [],
      incidents: result.incidents,
    };
  }

  // ---------------------------------------------------------
  // COMBINED VERIFICATION (MOBILE PAYLOAD)
  // ---------------------------------------------------------
  async verifyCombined(workerId: number, equipmentId: number) {
    const result = await this.combined.verifyCombined(workerId, equipmentId);

    return {
      type: 'combined',
      workerId,
      equipmentId,
      status: result.status,
      worker: result.worker,
      equipment: result.equipment,
      issues: result.issues,
    };
  }
}
