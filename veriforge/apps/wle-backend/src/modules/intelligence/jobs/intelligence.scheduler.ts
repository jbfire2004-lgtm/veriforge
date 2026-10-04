import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IntelligenceService } from '../intelligence.service';

@Injectable()
export class IntelligenceScheduler {
  private readonly logger = new Logger(IntelligenceScheduler.name);

  constructor(private readonly intelligence: IntelligenceService) {}

  /** Daily intelligence refresh + automation evaluation */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyRefresh(): Promise<void> {
    this.logger.log('Running daily intelligence automation');
    await this.intelligence.runAutomation();
  }
}
