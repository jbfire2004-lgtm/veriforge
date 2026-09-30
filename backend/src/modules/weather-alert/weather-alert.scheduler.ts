import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WeatherAlertService } from './weather-alert.service';

@Injectable()
export class WeatherAlertScheduler {
  private readonly logger = new Logger(WeatherAlertScheduler.name);
  private running = false;

  constructor(private readonly weatherAlerts: WeatherAlertService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePoll() {
    if (this.running) {
      this.logger.debug('Weather poll skipped — previous run in progress');
      return;
    }
    this.running = true;
    try {
      await this.weatherAlerts.pollAndProcess();
    } catch (e) {
      this.logger.error(`Weather poll failed: ${e}`);
    } finally {
      this.running = false;
    }
  }
}
