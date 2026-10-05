import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { DomainEvent, type DomainEventPayload } from '../domain-events';
import { Logger } from '@nestjs/common';

@Injectable()
export class ComplianceEventHandler implements OnModuleInit {
  private readonly logger = new Logger(ComplianceEventHandler.name);

  constructor(private readonly bus: EventBusService) {}

  onModuleInit() {
    const triggers = [
      DomainEvent.WORKER_LINKED,
      DomainEvent.TRAINING_UPLOADED,
      DomainEvent.INSPECTION_COMPLETED,
      DomainEvent.PROJECT_ASSIGNED,
    ];

    for (const name of triggers) {
      this.bus.on(name, (payload) => this.scheduleRecalc(payload));
    }
  }

  private scheduleRecalc(payload: DomainEventPayload) {
    this.logger.log(
      `Compliance recalc queued for ${payload.entityType}:${payload.entityId}`,
    );
    this.bus.emit({
      name: DomainEvent.COMPLIANCE_RECALC,
      occurredAt: new Date().toISOString(),
      companyId: payload.companyId,
      projectId: payload.projectId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      data: payload.data,
    });
  }
}
