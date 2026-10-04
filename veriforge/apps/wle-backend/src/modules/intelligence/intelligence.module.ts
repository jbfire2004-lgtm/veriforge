import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { IntelligenceEventHandler } from './handlers/intelligence-event.handler';
import { IntelligenceScheduler } from './jobs/intelligence.scheduler';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ScheduleModule,
    DashboardWidgetsModule,
    ReportingCoreModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [IntelligenceController],
  providers: [
    IntelligenceService,
    IntelligenceEventHandler,
    IntelligenceScheduler,
  ],
  exports: [IntelligenceService],
})
export class IntelligenceModule {}
