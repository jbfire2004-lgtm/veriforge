import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { ProjectComplianceAlertsService } from '../../project-compliance/project-compliance-alerts.service';
import { runWithRetry } from './event-subscriber.base';

@Injectable()
export class ProjectAssignmentSubscriber implements OnModuleInit {
  private readonly logger = new Logger(ProjectAssignmentSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    @Optional() private readonly metrics?: EventBusMetricsService,
    @Optional()
    private readonly complianceAlerts?: ProjectComplianceAlertsService,
  ) {}

  onModuleInit(): void {
    for (const name of [
      DomainEvent.WORKER_ASSIGNED_TO_PROJECT,
      DomainEvent.WORKER_REMOVED_FROM_PROJECT,
      DomainEvent.PROJECT_ASSIGNED,
      DomainEvent.PROJECT_UPDATED,
    ]) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'ProjectAssignmentSubscriber',
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
        type: 'flow.project_assignment',
        event: event.name,
        projectId: event.projectId,
        workerId: event.data?.workerId ?? event.entityId,
        companyId: event.companyId,
      }),
    );

    if (
      event.name === DomainEvent.WORKER_ASSIGNED_TO_PROJECT &&
      event.projectId &&
      event.data?.workerId &&
      this.complianceAlerts
    ) {
      await this.complianceAlerts.onWorkerAssigned(
        event.projectId,
        Number(event.data.workerId),
      );
    }
  }
}
