import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HubIndustrySafetyController } from './hub-industry-safety.controller';
import { HubIndustrySafetyService } from './hub-industry-safety.service';
import { VisiAnonymizationEngineService } from './visi-anonymization-engine.service';
import { VisiSelfVsIndustryService } from './visi-self-vs-industry.service';
import { VisiTrendEngineService } from './visi-trend-engine.service';

@Module({
  imports: [PrismaModule],
  controllers: [HubIndustrySafetyController],
  providers: [
    HubIndustrySafetyService,
    VisiAnonymizationEngineService,
    VisiTrendEngineService,
    VisiSelfVsIndustryService,
  ],
  exports: [
    HubIndustrySafetyService,
    VisiAnonymizationEngineService,
    VisiTrendEngineService,
    VisiSelfVsIndustryService,
  ],
})
export class HubIndustrySafetyModule {}
