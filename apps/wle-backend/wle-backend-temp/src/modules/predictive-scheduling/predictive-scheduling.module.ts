import { Module, forwardRef } from '@nestjs/common';
import { PredictiveSchedulingController } from './predictive-scheduling.controller';
import { PredictiveSchedulingService } from './predictive-scheduling.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ReportingCoreModule,
    DigitalTwinModule,
    DashboardWidgetsModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [PredictiveSchedulingController],
  providers: [PredictiveSchedulingService],
  exports: [PredictiveSchedulingService],
})
export class PredictiveSchedulingModule {}
