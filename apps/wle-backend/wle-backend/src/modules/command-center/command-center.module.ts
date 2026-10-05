import { Module, forwardRef } from '@nestjs/common';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterService } from './command-center.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ReportingCoreModule,
    DigitalTwinModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [CommandCenterController],
  providers: [CommandCenterService],
  exports: [CommandCenterService],
})
export class CommandCenterModule {}
