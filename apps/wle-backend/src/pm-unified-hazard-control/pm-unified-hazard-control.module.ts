import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { PmWorkerSafetyProfileModule } from '../pm-worker-safety-profile/pm-worker-safety-profile.module';
import { PmUnifiedHazardControlController } from './pm-unified-hazard-control.controller';
import { PmHazardController } from './pm-hazard.controller';
import { PmControlController } from './pm-control.controller';
import { PmUnifiedHazardControlService } from './pm-unified-hazard-control.service';
import { PmUnifiedHazardControlCailService } from './pm-unified-hazard-control-cail.service';

@Module({
  imports: [
    PrismaModule,
    PmProjectSafetyContextModule,
    PmCompanySafetyContextModule,
    PmWorkerSafetyProfileModule,
  ],
  controllers: [
    PmUnifiedHazardControlController,
    PmHazardController,
    PmControlController,
  ],
  providers: [PmUnifiedHazardControlService, PmUnifiedHazardControlCailService],
  exports: [PmUnifiedHazardControlService, PmUnifiedHazardControlCailService],
})
export class PmUnifiedHazardControlModule {}
