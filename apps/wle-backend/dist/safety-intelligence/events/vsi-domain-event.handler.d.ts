import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../modules/api-platform/events/event-bus.service';
import { VsiDashboardRevisionService } from './vsi-dashboard-revision.service';
export declare class VsiDomainEventHandler implements OnModuleInit {
    private readonly bus;
    private readonly revisions;
    private readonly logger;
    constructor(bus: EventBusService, revisions: VsiDashboardRevisionService);
    onModuleInit(): void;
    private onEvent;
}
