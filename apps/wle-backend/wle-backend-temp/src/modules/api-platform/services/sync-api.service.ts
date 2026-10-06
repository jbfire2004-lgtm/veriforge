import { Injectable } from '@nestjs/common';
import { FieldSyncService } from '../../field-sync/field-sync.service';
import { DashboardWidgetsService } from '../../dashboard-widgets/dashboard-widgets.service';
import { resolveWidgetScope } from '../../dashboard-widgets/dashboard-widgets.controller';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';

@Injectable()
export class SyncApiService {
  constructor(
    private readonly fieldSync: FieldSyncService,
    private readonly dashboardWidgets: DashboardWidgetsService,
    private readonly events: EventBusService,
  ) {}

  processBatch(
    actions: {
      type: string;
      payload: Record<string, unknown>;
      clientTimestamp?: string;
      clientVersion?: number;
    }[],
    actorUserId: number,
    meta?: { batchId?: string; clientId?: string },
  ) {
    this.events.emit({
      name: DomainEvent.SYNC_BATCH,
      occurredAt: new Date().toISOString(),
      data: { count: actions.length },
    });
    return this.fieldSync.processBatch(actions, actorUserId, meta);
  }

  getDashboardWidgets(role: string, companyId?: number, unionHallId?: number) {
    const scope = resolveWidgetScope(role, companyId, unionHallId);
    return this.dashboardWidgets.getBundle(scope);
  }
}
