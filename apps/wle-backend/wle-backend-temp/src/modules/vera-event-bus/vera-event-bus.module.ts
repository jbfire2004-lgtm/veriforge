import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';
import { ProjectComplianceModule } from '../project-compliance/project-compliance.module';
import { EventOutboxService } from './event-outbox.service';
import { EventPublisherService } from './event-publisher.service';
import { EventDlqService } from './event-dlq.service';
import { EventBusMetricsService } from './event-bus-metrics.service';
import { EventBusScheduler } from './event-bus.scheduler';
import { EventBusController } from './event-bus.controller';
import { NatsEventTransport } from './transport/nats.transport';
import { KafkaEventTransport } from './transport/kafka.transport';
import { TrainingFlowSubscriber } from './subscribers/training-flow.subscriber';
import { WalletFlowSubscriber } from './subscribers/wallet-flow.subscriber';
import { ExpiryFlowSubscriber } from './subscribers/expiry-flow.subscriber';
import { ProjectAssignmentSubscriber } from './subscribers/project-assignment.subscriber';
import { ProviderSyncSubscriber } from './subscribers/provider-sync.subscriber';
import { UnionHallSubscriber } from './subscribers/union-hall.subscriber';
import { EventBusBootstrap } from './event-bus.bootstrap';
import { VeraCoreFlowHandler } from './vera-core-flow.handler';

@Global()
@Module({
  imports: [PrismaModule, DomainEventBusModule, ScheduleModule],
  controllers: [EventBusController],
  providers: [
    EventOutboxService,
    EventPublisherService,
    EventDlqService,
    EventBusMetricsService,
    EventBusScheduler,
    NatsEventTransport,
    KafkaEventTransport,
    TrainingFlowSubscriber,
    WalletFlowSubscriber,
    ExpiryFlowSubscriber,
    ProjectAssignmentSubscriber,
    ProviderSyncSubscriber,
    UnionHallSubscriber,
    EventBusBootstrap,
    VeraCoreFlowHandler,
  ],
  exports: [
    EventOutboxService,
    EventPublisherService,
    EventDlqService,
    EventBusMetricsService,
  ],
})
export class VeraEventBusModule {}
