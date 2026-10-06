import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssignmentSchedulerService } from './assignment-scheduler.service';

@Injectable()
export class AssignmentSchedulerCron {
  constructor(private scheduler: AssignmentSchedulerService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.scheduler.autoStart();
    await this.scheduler.autoEnd();
  }
}
