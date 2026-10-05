import { type DomainEventName } from '../api-platform/events/domain-events';
export declare const VeraEventTopic: {
    readonly TRAINING: "vera.training";
    readonly WALLET: "vera.wallet";
    readonly COMPANY: "vera.company";
    readonly PROJECT: "vera.project";
    readonly PROVIDER: "vera.provider";
    readonly EXPIRY: "vera.expiry";
    readonly WORKER: "vera.worker";
    readonly UNION: "vera.union";
    readonly COMPLIANCE: "vera.compliance";
    readonly PERMIT: "vera.permit";
    readonly PLATFORM: "vera.platform";
};
export type VeraEventTopicName = (typeof VeraEventTopic)[keyof typeof VeraEventTopic];
export declare const DOMAIN_EVENT_TOPIC_MAP: Record<DomainEventName, VeraEventTopicName>;
export declare function topicForEvent(eventName: DomainEventName): VeraEventTopicName;
export declare function natsSubjectForEvent(eventName: DomainEventName): string;
export declare function partitionKeyForEvent(event: {
    companyId?: number;
    projectId?: number;
    entityType?: string;
    entityId?: number | string;
}): string;
