import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { PmWorkerSafetyProfileModule } from '../pm-worker-safety-profile/pm-worker-safety-profile.module';
import { PmEquipmentSafetyModule } from '../pm-equipment-safety/pm-equipment-safety.module';
import { PmUnifiedCorrectiveActionModule } from '../pm-unified-corrective-action/pm-unified-corrective-action.module';
import { PmProjectManagementController } from './pm-project-management.controller';
import { PmProjectController } from './pm-project.controller';
import { PmProjectManagementService } from './pm-project-management.service';
import { PmProjectManagementCailIntelligenceService } from './pm-project-management-cail-intelligence.service';
import { PmSchedulingBridgeService } from './pm-scheduling-bridge.service';
import { PredictiveSchedulingModule } from '../modules/predictive-scheduling/predictive-scheduling.module';
import { AutonomousOperationsModule } from '../modules/autonomous-operations/autonomous-operations.module';
import { AcpModule } from '../acp/acp.module';

@Module({
  imports: [
    PrismaModule,
    PmProjectSafetyContextModule,
    PmCompanySafetyContextModule,
    PmWorkerSafetyProfileModule,
    PmEquipmentSafetyModule,
    PmUnifiedCorrectiveActionModule,
    PredictiveSchedulingModule,
    AutonomousOperationsModule,
    AcpModule,
  ],
  controllers: [PmProjectManagementController, PmProjectController],
  providers: [
    PmProjectManagementService,
    PmProjectManagementCailIntelligenceService,
    PmSchedulingBridgeService,
  ],
  exports: [
    PmProjectManagementService,
    PmProjectManagementCailIntelligenceService,
    PmSchedulingBridgeService,
  ],
})
export class PmProjectManagementModule {}
