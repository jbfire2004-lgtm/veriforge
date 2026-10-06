import { Module, forwardRef } from '@nestjs/common';
import { DigitalTwinController } from './digital-twin.controller';
import { DigitalTwinService } from './digital-twin.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ReportingCoreModule,
    DashboardWidgetsModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
