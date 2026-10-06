import { Module, forwardRef } from '@nestjs/common';
import { EnterpriseBrainController } from './enterprise-brain.controller';
import { EnterpriseBrainService } from './enterprise-brain.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { CommandCenterModule } from '../command-center/command-center.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ReportingCoreModule,
    DigitalTwinModule,
    CommandCenterModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [EnterpriseBrainController],
  providers: [EnterpriseBrainService],
  exports: [EnterpriseBrainService],
})
export class EnterpriseBrainModule {}
