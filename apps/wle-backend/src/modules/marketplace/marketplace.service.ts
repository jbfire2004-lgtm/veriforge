import { Injectable } from '@nestjs/common';
import { VeraGlobalMarketplaceEngine } from '@vera/marketplace';
import type {
  MarketplaceContextInput,
  MarketplaceReport,
} from '@vera/marketplace';
import { PrismaService } from '../../prisma/prisma.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { GlobalNetworkService } from '../global-network/global-network.service';
import { IndustryEcosystemService } from '../industry-ecosystem/industry-ecosystem.service';

@Injectable()
export class MarketplaceService {
  private readonly vgame = new VeraGlobalMarketplaceEngine();
  private lastReport: MarketplaceReport | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly twins: DigitalTwinService,
    private readonly globalNetwork: GlobalNetworkService,
    private readonly industryEcosystem: IndustryEcosystemService,
  ) {}

  async runMarketplace(companyId?: number): Promise<MarketplaceReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const [networkReport, industryReport] = await Promise.all([
      this.globalNetwork.analyzeNetwork(companyId),
      this.industryEcosystem.orchestrateIndustry(companyId),
    ]);
    const ctx = await this.buildContext(companyId);
    this.lastReport = this.vgame.run(ctx, networkReport, industryReport);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: MarketplaceContextInput) {
    this.lastReport = this.vgame.runOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vgame.syncOffline();
  }

  private async buildContext(
    companyId?: number,
  ): Promise<MarketplaceContextInput> {
    const [providers, workers, equipment] = await Promise.all([
      this.prisma.trainingProvider.count(),
      companyId
        ? this.prisma.worker.count({ where: { companyId } })
        : this.prisma.worker.count(),
      companyId
        ? this.prisma.equipment.count({ where: { companyId } })
        : this.prisma.equipment.count(),
    ]);

    return {
      companyId: companyId ? String(companyId) : undefined,
      region: 'NA',
      listings: [],
      demands: [],
      totalWorkers: workers,
      totalEquipment: equipment,
      totalProviders: providers,
    };
  }
}
