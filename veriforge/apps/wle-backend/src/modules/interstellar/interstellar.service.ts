import { Injectable } from '@nestjs/common';
import { VeraInterstellarOperationsEngine } from '@vera/interstellar';
import type {
  InterstellarContextInput,
  InterstellarReport,
} from '@vera/interstellar';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { InterplanetaryService } from '../interplanetary/interplanetary.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Injectable()
export class InterstellarService {
  private readonly vioeX = new VeraInterstellarOperationsEngine();
  private lastReport: InterstellarReport | null = null;

  constructor(
    private readonly twins: DigitalTwinService,
    private readonly interplanetary: InterplanetaryService,
    private readonly marketplace: MarketplaceService,
  ) {}

  async expand(companyId?: number): Promise<InterstellarReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const [interplanetaryReport, marketplaceReport] = await Promise.all([
      this.interplanetary.operate(companyId),
      this.marketplace.runMarketplace(companyId),
    ]);
    const ctx: InterstellarContextInput = {
      companyId: companyId ? String(companyId) : undefined,
    };
    this.lastReport = this.vioeX.expand(
      ctx,
      interplanetaryReport,
      marketplaceReport,
    );
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: InterstellarContextInput) {
    this.lastReport = this.vioeX.expandOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vioeX.syncOffline();
  }
}
