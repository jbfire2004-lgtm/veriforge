import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmCompanySafetyContextController } from './pm-company-safety-context.controller';
import { PmCompanySafetyController } from './pm-company-safety.controller';
import { PmCompanySafetyContextService } from './pm-company-safety-context.service';
import { PmCompanySafetyCailIntelligenceService } from './pm-company-safety-cail-intelligence.service';

@Module({
  imports: [PrismaModule, PmProjectSafetyContextModule],
  controllers: [PmCompanySafetyContextController, PmCompanySafetyController],
  providers: [
    PmCompanySafetyContextService,
    PmCompanySafetyCailIntelligenceService,
  ],
  exports: [
    PmCompanySafetyContextService,
    PmCompanySafetyCailIntelligenceService,
  ],
})
export class PmCompanySafetyContextModule {}
