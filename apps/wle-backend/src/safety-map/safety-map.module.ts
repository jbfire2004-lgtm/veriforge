import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MapLiveWsBootstrap } from './map-live.ws';
import { SafetyMapService } from './safety-map.service';

@Module({
  imports: [PrismaModule],
  providers: [SafetyMapService, MapLiveWsBootstrap],
  exports: [SafetyMapService],
})
export class SafetyMapModule {}
