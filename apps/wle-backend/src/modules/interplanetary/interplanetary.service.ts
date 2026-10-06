import { Injectable } from '@nestjs/common';
import { VeraInterplanetaryOperationsEngine } from '@vera/interplanetary';
import type {
  InterplanetaryContextInput,
  InterplanetaryReport,
} from '@vera/interplanetary';
import { PrismaService } from '../../prisma/prisma.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { GlobalNetworkService } from '../global-network/global-network.service';
import { IndustryEcosystemService } from '../industry-ecosystem/industry-ecosystem.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Injectable()
export class InterplanetaryService {
  private readonly vioe = new VeraInterplanetaryOperationsEngine();
  private lastReport: InterplanetaryReport | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly twins: DigitalTwinService,
    private readonly globalNetwork: GlobalNetworkService,
    private readonly industryEcosystem: IndustryEcosystemService,
    private readonly marketplace: MarketplaceService,
  ) {}

  async operate(companyId?: number): Promise<InterplanetaryReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const [networkReport, industryReport, marketplaceReport] =
      await Promise.all([
        this.globalNetwork.analyzeNetwork(companyId),
        this.industryEcosystem.orchestrateIndustry(companyId),
        this.marketplace.runMarketplace(companyId),
      ]);

    const [workers, equipment] = companyId
      ? await Promise.all([
          this.prisma.worker.count({ where: { companyId } }),
          this.prisma.equipment.count({ where: { companyId } }),
        ])
      : await Promise.all([
          this.prisma.worker.count(),
          this.prisma.equipment.count(),
        ]);

    const ctx: InterplanetaryContextInput = {
      companyId: companyId ? String(companyId) : undefined,
      earthWorkerCount: workers,
      earthEquipmentCount: equipment,
    };

    this.lastReport = this.vioe.operate(
      ctx,
      marketplaceReport,
      industryReport,
      networkReport,
    );
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: InterplanetaryContextInput) {
    this.lastReport = this.vioe.operateOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vioe.syncOffline();
  }
}
