import { Module } from '@nestjs/common';
import { SafetyStationController } from './safety-station.controller';
import { SafetyStationService } from './safety-station.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SafetyStationController],
  providers: [SafetyStationService, PrismaService],
  exports: [SafetyStationService],
})
export class SafetyStationModule {}
