import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
export declare class ComplianceEventHandler implements OnModuleInit {
    private readonly bus;
    private readonly logger;
    constructor(bus: EventBusService);
    onModuleInit(): void;
    private scheduleRecalc;
}
