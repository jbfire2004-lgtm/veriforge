import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export type QueuedAnalyticsEvent = {
    companyId: number;
    userId?: number | null;
    eventType: string;
    metadata?: Record<string, unknown>;
};
export declare class AdoptionEventQueueService implements OnModuleDestroy {
    private readonly prisma;
    private readonly logger;
    private readonly buffer;
    private flushTimer;
    private flushing;
    constructor(prisma: PrismaService);
    enqueue(event: QueuedAnalyticsEvent): void;
    flush(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
