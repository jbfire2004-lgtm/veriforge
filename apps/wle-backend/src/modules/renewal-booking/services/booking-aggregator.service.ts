import { Injectable } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { VendorIntegrationService } from '../../vendor-integration/services/vendor-integration.service';
import { VendorAvailability } from '../../vendor-integration/interfaces/vendor-availability.interface';

export interface RenewalOptionItem {
  certificationId: string;
  certificationName: string;
  expiresOn: string;
  recommended: VendorAvailability | null;
  options: VendorAvailability[];
}

export interface RenewalOptionsResponse {
  workerId: string;
  items: RenewalOptionItem[];
}

export interface CertTypeAvailabilityResponse {
  certType: string;
  recommended: VendorAvailability | null;
  options: VendorAvailability[];
}

/** Surface expiring certifications within this horizon for renewal. */
const EXPIRY_HORIZON_DAYS = 120;

@Injectable()
export class BookingAggregatorService {
  constructor(
    private readonly certifications: CertificationService,
    private readonly vendors: VendorIntegrationService,
  ) {}

  /** Build the full renewal dashboard payload for a worker. */
  async getRenewalOptionsForWorker(
    workerId: string,
  ): Promise<RenewalOptionsResponse> {
    const numericId = Number(workerId);
    const certs = await this.certifications.getWorkerCertifications(
      Number.isFinite(numericId) ? numericId : -1,
    );
    const now = Date.now();
    const items: RenewalOptionItem[] = [];

    for (const cert of certs) {
      if (!cert.expiresAt) continue;
      const daysUntilExpiry = (cert.expiresAt.getTime() - now) / 86_400_000;
      if (daysUntilExpiry > EXPIRY_HORIZON_DAYS) continue;

      const options = this.rank(
        await this.vendors.getAvailabilityForCertType(cert.certType),
      );
      items.push({
        certificationId: cert.id,
        certificationName: cert.certificationName,
        expiresOn: cert.expiresAt.toISOString(),
        recommended: options[0] ?? null,
        options,
      });
    }

    return { workerId, items };
  }

  /** Ranked vendor availability for a single cert type. */
  async getAvailabilityForCertType(
    certType: string,
    _workerId?: string,
  ): Promise<CertTypeAvailabilityResponse> {
    const options = this.rank(
      await this.vendors.getAvailabilityForCertType(certType),
    );
    return { certType, recommended: options[0] ?? null, options };
  }

  private rank(options: VendorAvailability[]): VendorAvailability[] {
    return [...options].sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) ||
        a.price - b.price ||
        b.seatsAvailable - a.seatsAvailable,
    );
  }
}
