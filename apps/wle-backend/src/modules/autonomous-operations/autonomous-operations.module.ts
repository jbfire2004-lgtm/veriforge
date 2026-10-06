import { Module, forwardRef } from '@nestjs/common';
import { AutonomousOperationsController } from './autonomous-operations.controller';
import { AutonomousOperationsService } from './autonomous-operations.service';
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
  controllers: [AutonomousOperationsController],
  providers: [AutonomousOperationsService],
  exports: [AutonomousOperationsService],
})
export class AutonomousOperationsModule {}
