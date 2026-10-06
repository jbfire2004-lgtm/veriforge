import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import type { DomainEventPayload } from '../../api-platform/events/domain-events';
import { IntelligenceService } from '../intelligence.service';

@Injectable()
export class IntelligenceEventHandler implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly intelligence: IntelligenceService,
  ) {}

  onModuleInit(): void {
    const events = [
      'training.uploaded',
      'inspection.failed',
      'compliance.changed',
      'worker.assigned',
      'equipment.locked_out',
    ];
    for (const name of events) {
      this.eventBus.on(name, (payload) => this.handleEvent(name, payload));
    }
    this.eventBus.on('*', (payload) => this.handleWildcard(payload));
  }

  private async handleEvent(
    name: string,
    payload: DomainEventPayload,
  ): Promise<void> {
    this.logger.debug(
      `Intelligence hook: ${name} ${payload.entityType}:${payload.entityId}`,
    );
    const companyId = payload.companyId;
    if (companyId) {
      await this.intelligence.runAutomation(companyId);
    }
  }

  private handleWildcard(payload: DomainEventPayload): void {
    if (payload.name?.includes('fail') || payload.name?.includes('expir')) {
      this.logger.verbose(`Anomaly watch: ${payload.name}`);
    }
  }
}
