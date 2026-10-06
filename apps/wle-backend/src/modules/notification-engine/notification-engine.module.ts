import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { InspectionCoreModule } from '../inspection-core/inspection-core.module';
import { MaintenanceCalibrationCoreModule } from '../maintenance-calibration-core/maintenance-calibration-core.module';
import { ToolsPpeCoreModule } from '../tools-ppe-core/tools-ppe-core.module';
import { NotificationEngineController } from './notification-engine.controller';
import { NotificationSchedulerCron } from './notification-scheduler.cron';
import { NotificationSchedulerService } from './notification-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    NotificationsModule,
    DomainEventBusModule,
    EquipmentComplianceModule,
    InspectionCoreModule,
    MaintenanceCalibrationCoreModule,
    ToolsPpeCoreModule,
  ],
  controllers: [NotificationEngineController],
  providers: [NotificationSchedulerService, NotificationSchedulerCron],
  exports: [NotificationSchedulerService, NotificationsModule],
})
export class NotificationEngineModule {}
