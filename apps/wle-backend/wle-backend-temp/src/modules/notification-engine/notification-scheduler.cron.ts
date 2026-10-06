import { Injectable, Logger } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';

import { NotificationSchedulerService } from './notification-scheduler.service';

import type {
  DailyComplianceStepResult,
  ExpiryRunMetrics,
} from './notification-scheduler.types';

@Injectable()
export class NotificationSchedulerCron {
  private readonly logger = new Logger(NotificationSchedulerCron.name);

  constructor(private readonly scheduler: NotificationSchedulerService) {}

  /** Daily 6:00 — inspections, competency, PPE, maintenance, training & equipment cert expiry */

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyComplianceNotifications() {
    const startedAt = Date.now();

    this.logger.log('Running daily compliance notification scheduler');

    const steps: DailyComplianceStepResult[] = [];

    steps.push(
      await this.runStep('inspections', () => this.scheduler.runInspections()),
    );

    steps.push(
      await this.runStep('competencyExpiry', () =>
        this.scheduler.runCompetencyExpiry(),
      ),
    );

    steps.push(
      await this.runStep('ppeExpiry', () => this.scheduler.runPpeExpiry()),
    );

    steps.push(
      await this.runStep('maintenance', () => this.scheduler.runMaintenance()),
    );

    steps.push(
      await this.runStep('trainingExpiry', () =>
        this.scheduler.runTrainingExpiry(),
      ),
    );

    steps.push(
      await this.runStep('equipmentCertExpiry', () =>
        this.scheduler.runEquipmentCertExpiry(),
      ),
    );

    steps.push(
      await this.runStep('fitTestExpiry', () =>
        this.scheduler.runFitTestExpiry(),
      ),
    );

    const durationMs = Date.now() - startedAt;

    const failed = steps.filter((s) => !s.ok);

    const training = steps.find((s) => s.name === 'trainingExpiry')?.metrics;

    const equipment = steps.find(
      (s) => s.name === 'equipmentCertExpiry',
    )?.metrics;

    this.logger.log(
      JSON.stringify({
        job: 'dailyComplianceNotifications',

        durationMs,

        steps: steps.map(
          ({ name, ok, durationMs: stepMs, metrics, error }) => ({
            name,

            ok,

            durationMs: stepMs,

            ...(metrics ? { metrics } : {}),

            ...(error ? { error } : {}),
          }),
        ),

        summary: {
          trainingExpiry: training ?? null,

          equipmentCertExpiry: equipment ?? null,

          failedSteps: failed.map((s) => s.name),
        },
      }),
    );

    if (failed.length) {
      this.logger.warn(
        `Daily compliance scheduler finished with ${
          failed.length
        } failed step(s): ${failed.map((s) => s.name).join(', ')}`,
      );
    }
  }

  /** Hourly — assignment start/end reminders */

  @Cron(CronExpression.EVERY_HOUR)
  async hourlyAssignmentNotifications() {
    await this.scheduler.runWorkerAssignments();

    await this.scheduler.runEquipmentAssignments();
  }

  private async runStep(
    name: string,

    fn: () => Promise<unknown>,
  ): Promise<DailyComplianceStepResult> {
    const startedAt = Date.now();

    try {
      const result = await fn();

      const metrics = this.asExpiryMetrics(result);

      return {
        name,

        ok: true,

        durationMs: Date.now() - startedAt,

        ...(metrics ? { metrics } : {}),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      this.logger.error(`Daily compliance step "${name}" failed: ${message}`);

      return {
        name,

        ok: false,

        durationMs: Date.now() - startedAt,

        error: message,
      };
    }
  }

  private asExpiryMetrics(result: unknown): ExpiryRunMetrics | undefined {
    if (!result || typeof result !== 'object') return undefined;

    const row = result as Partial<ExpiryRunMetrics>;

    if (
      typeof row.scanned !== 'number' ||
      typeof row.processed !== 'number' ||
      typeof row.notified !== 'number'
    ) {
      return undefined;
    }

    return row as ExpiryRunMetrics;
  }
}
