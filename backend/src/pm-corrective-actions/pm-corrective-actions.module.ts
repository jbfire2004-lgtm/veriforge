import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { PmCorrectiveActionsController } from './pm-corrective-actions.controller';
import { PmCorrectiveActionsService } from './pm-corrective-actions.service';
import { PmCapaAutoGenerateService } from './pm-capa-auto-generate.service';
import { PmCapaIntelligenceService } from './pm-capa-intelligence.service';
import { CapaPriorityEngine } from './capa-priority.engine';
import { CapaDueDateEngine } from './capa-due-date.engine';
import { CapaAssignmentEngine } from './capa-assignment.engine';
import { CapaEscalationEngine } from './capa-escalation.engine';
import { CapaVerificationEngine } from './capa-verification.engine';

@Module({
  imports: [
    PrismaModule,
    SafetyIntelligenceModule,
    forwardRef(() => VeraCoreModule),
  ],
  controllers: [PmCorrectiveActionsController],
  providers: [
    PmCorrectiveActionsService,
    PmCapaAutoGenerateService,
    PmCapaIntelligenceService,
    CapaPriorityEngine,
    CapaDueDateEngine,
    CapaAssignmentEngine,
    CapaEscalationEngine,
    CapaVerificationEngine,
  ],
  exports: [
    PmCorrectiveActionsService,
    PmCapaAutoGenerateService,
    CapaDueDateEngine,
  ],
})
export class PmCorrectiveActionsModule {}
