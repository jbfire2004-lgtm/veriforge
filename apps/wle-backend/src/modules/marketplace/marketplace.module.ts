import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { GlobalNetworkModule } from '../global-network/global-network.module';
import { IndustryEcosystemModule } from '../industry-ecosystem/industry-ecosystem.module';

@Module({
  imports: [DigitalTwinModule, GlobalNetworkModule, IndustryEcosystemModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
