import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { PmUnifiedSafetyIntelligenceController } from './pm-unified-safety-intelligence.controller';
import { PmCailController } from './pm-cail.controller';
import { PmUnifiedSafetyIntelligenceService } from './pm-unified-safety-intelligence.service';
import { PmUnifiedSafetyIntelligenceScheduler } from './pm-unified-safety-intelligence.scheduler';

@Module({
  imports: [PrismaModule, ScheduleModule],
  controllers: [PmUnifiedSafetyIntelligenceController, PmCailController],
  providers: [
    PmUnifiedSafetyIntelligenceService,
    PmUnifiedSafetyIntelligenceScheduler,
  ],
  exports: [PmUnifiedSafetyIntelligenceService],
})
export class PmUnifiedSafetyIntelligenceModule {}
