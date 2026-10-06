import { Module } from '@nestjs/common';
import { IndustryEcosystemController } from './industry-ecosystem.controller';
import { IndustryEcosystemService } from './industry-ecosystem.service';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { GlobalNetworkModule } from '../global-network/global-network.module';

@Module({
  imports: [ReportingCoreModule, DigitalTwinModule, GlobalNetworkModule],
  controllers: [IndustryEcosystemController],
  providers: [IndustryEcosystemService],
  exports: [IndustryEcosystemService],
})
export class IndustryEcosystemModule {}
