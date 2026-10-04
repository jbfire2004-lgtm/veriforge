import { Injectable } from '@nestjs/common';
import { VeraUniversalCivilizationEngine } from '@vera/civilization';
import type {
  CivilizationContextInput,
  CivilizationReport,
} from '@vera/civilization';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { InterstellarService } from '../interstellar/interstellar.service';

@Injectable()
export class CivilizationService {
  private readonly uce = new VeraUniversalCivilizationEngine();
  private lastReport: CivilizationReport | null = null;

  constructor(
    private readonly twins: DigitalTwinService,
    private readonly interstellar: InterstellarService,
  ) {}

  async govern(companyId?: number): Promise<CivilizationReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const interstellarReport = await this.interstellar.expand(companyId);
    const ctx: CivilizationContextInput = {
      companyId: companyId ? String(companyId) : undefined,
    };
    this.lastReport = this.uce.govern(ctx, interstellarReport);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: CivilizationContextInput) {
    this.lastReport = this.uce.governOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.uce.syncOffline();
  }
}
