import { Module, forwardRef } from '@nestjs/common';
import { EnterpriseAutomationController } from './enterprise-automation.controller';
import { EnterpriseAutomationService } from './enterprise-automation.service';
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
  controllers: [EnterpriseAutomationController],
  providers: [EnterpriseAutomationService],
  exports: [EnterpriseAutomationService],
})
export class EnterpriseAutomationModule {}
