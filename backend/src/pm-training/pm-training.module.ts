import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { PmTrainingController } from './pm-training.controller';
import { PmTrainingService } from './pm-training.service';
import { PmTrainingCailIntelligenceService } from './pm-training-cail-intelligence.service';
import { TrainingExpiryEngine } from './training-expiry.engine';
import { TrainingMatrixEngine } from './training-matrix.engine';
import { TrainingAutoAssignmentEngine } from './training-auto-assignment.engine';
import { TrainingCompetencyEngineService } from './training-competency-engine.service';

@Module({
  imports: [PrismaModule, PmCompanySafetyContextModule],
  controllers: [PmTrainingController],
  providers: [
    PmTrainingService,
    PmTrainingCailIntelligenceService,
    TrainingExpiryEngine,
    TrainingMatrixEngine,
    TrainingAutoAssignmentEngine,
    TrainingCompetencyEngineService,
  ],
  exports: [
    PmTrainingService,
    PmTrainingCailIntelligenceService,
    TrainingCompetencyEngineService,
  ],
})
export class PmTrainingModule {}
