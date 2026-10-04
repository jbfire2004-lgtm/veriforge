import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { ProjectComplianceAlertsService } from '../../project-compliance/project-compliance-alerts.service';
import { runWithRetry } from './event-subscriber.base';

@Injectable()
export class ExpiryFlowSubscriber implements OnModuleInit {
  private readonly logger = new Logger(ExpiryFlowSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    @Optional() private readonly metrics?: EventBusMetricsService,
    @Optional()
    private readonly complianceAlerts?: ProjectComplianceAlertsService,
  ) {}

  onModuleInit(): void {
    for (const name of [
      DomainEvent.EXPIRY_APPROACHING,
      DomainEvent.EXPIRY_PASSED,
    ]) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'ExpiryFlowSubscriber',
          event,
          async (e) => this.handle(e),
        );
      });
    }
  }

  private async handle(
    event: import('../../api-platform/events/domain-events').DomainEventPayload,
  ): Promise<void> {
    this.logger.log(
      JSON.stringify({
        type: 'flow.expiry',
        event: event.name,
        trainingRecordId: event.data?.trainingRecordId ?? event.entityId,
        expiresAt: event.data?.expiresAt,
        companyId: event.companyId,
      }),
    );

    const workerId = event.data?.workerId;
    if (workerId && this.complianceAlerts) {
      await this.complianceAlerts.onWorkerCredentialChange(Number(workerId));
    }
  }
}
