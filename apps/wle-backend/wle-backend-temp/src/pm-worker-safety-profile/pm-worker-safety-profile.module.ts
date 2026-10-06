import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmSiteAccessControlModule } from '../pm-site-access-control/pm-site-access-control.module';
import { PmWorkerSafetyProfileController } from './pm-worker-safety-profile.controller';
import { PmWorkerSafetyController } from './pm-worker-safety.controller';
import { PmWorkerSafetyProfileService } from './pm-worker-safety-profile.service';
import { PmWorkerSafetyCailIntelligenceService } from './pm-worker-safety-cail-intelligence.service';

@Module({
  imports: [
    PrismaModule,
    PmCompanySafetyContextModule,
    PmProjectSafetyContextModule,
    PmSiteAccessControlModule,
  ],
  controllers: [PmWorkerSafetyProfileController, PmWorkerSafetyController],
  providers: [
    PmWorkerSafetyProfileService,
    PmWorkerSafetyCailIntelligenceService,
  ],
  exports: [
    PmWorkerSafetyProfileService,
    PmWorkerSafetyCailIntelligenceService,
  ],
})
export class PmWorkerSafetyProfileModule {}
