import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProviderSyncEngineService } from './provider-sync-engine.service';

@Injectable()
export class ProviderSyncScheduler {
  private readonly logger = new Logger(ProviderSyncScheduler.name);

  constructor(private readonly sync: ProviderSyncEngineService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pollDueProviders() {
    try {
      const result = await this.sync.pollAllDue();
      if (result.polled > 0) {
        this.logger.log(
          `Provider sync poll cycle: ${result.polled} provider(s) processed`,
        );
      }
    } catch (e) {
      this.logger.warn(
        `Provider sync scheduler error: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
