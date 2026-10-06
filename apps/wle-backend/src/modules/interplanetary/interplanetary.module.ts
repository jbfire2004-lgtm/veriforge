import { Module } from '@nestjs/common';
import { InterplanetaryController } from './interplanetary.controller';
import { InterplanetaryService } from './interplanetary.service';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { GlobalNetworkModule } from '../global-network/global-network.module';
import { IndustryEcosystemModule } from '../industry-ecosystem/industry-ecosystem.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [
    DigitalTwinModule,
    GlobalNetworkModule,
    IndustryEcosystemModule,
    MarketplaceModule,
  ],
  controllers: [InterplanetaryController],
  providers: [InterplanetaryService],
  exports: [InterplanetaryService],
})
export class InterplanetaryModule {}
