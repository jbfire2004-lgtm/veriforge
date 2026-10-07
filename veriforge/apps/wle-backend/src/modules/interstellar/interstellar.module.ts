import { Module } from '@nestjs/common';
import { InterstellarController } from './interstellar.controller';
import { InterstellarService } from './interstellar.service';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { InterplanetaryModule } from '../interplanetary/interplanetary.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [DigitalTwinModule, InterplanetaryModule, MarketplaceModule],
  controllers: [InterstellarController],
  providers: [InterstellarService],
  exports: [InterstellarService],
})
export class InterstellarModule {}
