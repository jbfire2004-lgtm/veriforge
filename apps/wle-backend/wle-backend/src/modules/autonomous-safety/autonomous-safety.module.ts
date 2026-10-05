import { Module, forwardRef } from '@nestjs/common';
import { AutonomousSafetyController } from './autonomous-safety.controller';
import { AutonomousSafetyService } from './autonomous-safety.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';

@Module({
  imports: [
    ReportingCoreModule,
    DigitalTwinModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [AutonomousSafetyController],
  providers: [AutonomousSafetyService],
  exports: [AutonomousSafetyService],
})
export class AutonomousSafetyModule {}
