export type EventBusMetricSnapshot = {
    emitted: number;
    enqueued: number;
    published: number;
    publishFailed: number;
    dlq: number;
    consumerErrors: number;
    byEvent: Record<string, number>;
    startedAt: string;
    updatedAt: string;
};
export declare class EventBusMetricsService {
    private readonly logger;
    private snapshot;
    recordEmit(eventName: string): void;
    recordEnqueued(): void;
    recordPublished(count?: number): void;
    recordPublishFailed(): void;
    recordDlq(): void;
    recordConsumerError(): void;
    getSnapshot(): EventBusMetricSnapshot;
    emitMonitoringHeartbeat(): void;
    private touch;
}
