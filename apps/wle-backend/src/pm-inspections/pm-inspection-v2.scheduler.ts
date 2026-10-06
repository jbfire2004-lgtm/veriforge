import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';

@Injectable()
export class PmInspectionV2Scheduler {
  private readonly logger = new Logger(PmInspectionV2Scheduler.name);

  constructor(
    @Optional()
    private readonly dispatch?: PmInspectionContractorDispatchService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async markOverdueContractorDispatches() {
    if (!this.dispatch) return;
    const result = await this.dispatch.markOverdueDispatches();
    if (result.marked > 0) {
      this.logger.log(`Marked ${result.marked} contractor dispatches overdue`);
    }
  }
}
