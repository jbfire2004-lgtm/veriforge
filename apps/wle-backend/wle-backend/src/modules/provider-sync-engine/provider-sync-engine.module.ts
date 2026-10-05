import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';
import { TrainingVerificationModule } from '../../services/training-verification.module';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { ProviderSyncEngineService } from './provider-sync-engine.service';
import { ProviderSyncEngineController } from './provider-sync-engine.controller';
import { ProviderSyncScheduler } from './provider-sync.scheduler';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    TrainingVerificationModule,
    DomainEventBusModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ProviderSyncEngineController],
  providers: [ProviderSyncEngineService, ProviderSyncScheduler],
  exports: [ProviderSyncEngineService],
})
export class ProviderSyncEngineModule {}
