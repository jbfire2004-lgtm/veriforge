import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyObservationController } from './safety-observation.controller';
import { SafetyObservationService } from './safety-observation.service';

@Module({
  controllers: [SafetyObservationController],
  providers: [SafetyObservationService, PrismaService],
  exports: [SafetyObservationService],
})
export class SafetyObservationModule {}
