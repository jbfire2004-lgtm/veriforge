import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { FieldSyncService } from '../../field-sync/field-sync.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';

/**
 * Background jobs (§8) — training expiry, inspections, compliance, sync, dispatch.
 */
@Injectable()
export class ApiPlatformScheduler {
  private readonly logger = new Logger(ApiPlatformScheduler.name);

  constructor(
    private readonly analytics: AnalyticsService,
    private readonly reporting: ReportingCoreService,
    private readonly fieldSync: FieldSyncService,
    private readonly events: EventBusService,
  ) {}

  /** Training expiry scan — daily 05:00 */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async trainingExpiryJob() {
    this.logger.log('TrainingExpiryJob started');
    const summary = await this.analytics.trainingExpirySummary();
    this.events.emit({
      name: DomainEvent.TRAINING_UPLOADED,
      occurredAt: new Date().toISOString(),
      data: { job: 'TrainingExpiryJob', summary },
    });
  }

  /** Compliance recalculation — every 6 hours */
  @Cron(CronExpression.EVERY_6_HOURS)
  async complianceRecalcJob() {
    this.logger.log('ComplianceRecalcJob started');
    await this.reporting.overview();
    this.events.emit({
      name: DomainEvent.COMPLIANCE_RECALC,
      occurredAt: new Date().toISOString(),
      data: { job: 'ComplianceRecalcJob' },
    });
  }

  /** Inspection due sweep — weekdays 07:00 */
  @Cron('0 7 * * 1-5')
  async inspectionScheduleJob() {
    this.logger.log('InspectionScheduleJob started');
    await this.reporting.inspectionStatus();
  }

  /** Offline sync queue drain placeholder — every 15 minutes */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncQueueJob() {
    this.logger.debug('SyncQueueJob heartbeat');
    await this.fieldSync.processBatch([]);
  }

  /** Provider approval / dispatch — daily 08:00 */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async dispatchQueueJob() {
    this.logger.log('DispatchQueueJob started');
    await this.reporting.unionDispatchStatus();
  }
}
