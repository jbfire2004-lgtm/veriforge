import { Module, forwardRef } from '@nestjs/common';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';
import { WorkerTrainingHydrationService } from './worker-training-hydration.service';
import { WorkerProjectReadinessService } from './worker-project-readiness.service';
import { WorkerExpiryRulesStore } from './worker-expiry-rules.store';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationModule } from '../verification/verification.module';
import { CompanyLinksModule } from '../modules/vera-core/company-links.module';
import { OrientationModule } from '../modules/orientation/orientation.module';
import { PmContractorPortalModule } from '../pm-contractor-portal/pm-contractor-portal.module';

@Module({
  imports: [
    forwardRef(() => VerificationModule),
    CompanyLinksModule,
    OrientationModule,
    PmContractorPortalModule,
  ],
  controllers: [WorkersController],
  providers: [
    WorkersService,
    WorkerTrainingHydrationService,
    WorkerProjectReadinessService,
    WorkerExpiryRulesStore,
    PrismaService,
  ],
  exports: [
    WorkersService,
    WorkerTrainingHydrationService,
    WorkerProjectReadinessService,
    WorkerExpiryRulesStore,
  ],
})
export class WorkersModule {}
