import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
export declare class VisionEventHandler implements OnModuleInit {
    private readonly eventBus;
    private readonly logger;
    constructor(eventBus: EventBusService);
    onModuleInit(): void;
    private onDocument;
}
