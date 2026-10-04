import { Module } from '@nestjs/common';
import { GlobalNetworkController } from './global-network.controller';
import { GlobalNetworkService } from './global-network.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';

@Module({
  imports: [ReportingCoreModule, DigitalTwinModule],
  controllers: [GlobalNetworkController],
  providers: [GlobalNetworkService],
  exports: [GlobalNetworkService],
})
export class GlobalNetworkModule {}
