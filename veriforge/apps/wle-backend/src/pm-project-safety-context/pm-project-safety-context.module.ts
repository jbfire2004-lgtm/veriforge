import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmProjectSafetyContextController } from './pm-project-safety-context.controller';
import { PmProjectSafetyController } from './pm-project-safety.controller';
import { PmProjectSafetyContextService } from './pm-project-safety-context.service';
import { PmProjectSafetyCailIntelligenceService } from './pm-project-safety-cail-intelligence.service';

@Module({
  imports: [PrismaModule],
  controllers: [PmProjectSafetyContextController, PmProjectSafetyController],
  providers: [
    PmProjectSafetyContextService,
    PmProjectSafetyCailIntelligenceService,
  ],
  exports: [
    PmProjectSafetyContextService,
    PmProjectSafetyCailIntelligenceService,
  ],
})
export class PmProjectSafetyContextModule {}
