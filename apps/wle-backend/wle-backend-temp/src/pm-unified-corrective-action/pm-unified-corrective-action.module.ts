import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmUnifiedHazardControlModule } from '../pm-unified-hazard-control/pm-unified-hazard-control.module';
import { PmWorkerSafetyProfileModule } from '../pm-worker-safety-profile/pm-worker-safety-profile.module';
import { PmUnifiedCorrectiveActionController } from './pm-unified-corrective-action.controller';
import { PmCorrectiveActionSpecController } from './pm-corrective-action.controller';
import { PmUnifiedCorrectiveActionService } from './pm-unified-corrective-action.service';
import { PmUnifiedCorrectiveActionCailService } from './pm-unified-corrective-action-cail.service';

@Module({
  imports: [
    PrismaModule,
    PmCorrectiveActionsModule,
    PmUnifiedHazardControlModule,
    PmWorkerSafetyProfileModule,
  ],
  controllers: [
    PmUnifiedCorrectiveActionController,
    PmCorrectiveActionSpecController,
  ],
  providers: [
    PmUnifiedCorrectiveActionService,
    PmUnifiedCorrectiveActionCailService,
  ],
  exports: [
    PmUnifiedCorrectiveActionService,
    PmUnifiedCorrectiveActionCailService,
  ],
})
export class PmUnifiedCorrectiveActionModule {}
