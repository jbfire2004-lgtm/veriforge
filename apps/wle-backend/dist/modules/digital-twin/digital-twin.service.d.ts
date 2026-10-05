import { OnModuleInit } from '@nestjs/common';
import type { TwinEventPayload, TwinType, TwinDashboardBundle, DigitalTwin } from '@vera/digital-twin';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
export declare class DigitalTwinService implements OnModuleInit {
    private readonly prisma;
    private readonly reporting;
    private readonly widgets;
    private readonly eventBus;
    private readonly vdte;
    constructor(prisma: PrismaService, reporting: ReportingCoreService, widgets: DashboardWidgetsService, eventBus: EventBusService);
    onModuleInit(): void;
    hydrateCompany(companyId: number): Promise<DigitalTwin[]>;
    getTwin(type: TwinType, id: string): DigitalTwin | undefined;
    getTimeline(type: TwinType, id: string): any;
    getHistory(type: TwinType, id: string): any;
    getDashboard(): TwinDashboardBundle;
    applyEvent(event: TwinEventPayload): DigitalTwin | undefined;
    applyOfflineEvent(event: TwinEventPayload, clientVersion: number): void;
    syncTwin(type: TwinType, id: string): DigitalTwin | undefined;
    private registerEventHandlers;
}
