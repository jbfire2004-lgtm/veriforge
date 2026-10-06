import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { SifHecaController } from './sif-heca.controller';
import { SifHecaService } from './sif-heca.service';
import { SifHecaIngestionService } from './sif-heca-ingestion.service';
import { SifScoringEngine } from './sif-scoring.engine';
import { HecaClassificationEngine } from './heca-classification.engine';
import { ControlEffectivenessEngine } from './control-effectiveness.engine';
import { CsraHecaEngine } from './csra-heca.engine';
import { SifHecaCailService } from './sif-heca-cail.service';
import { SifHecaScopeAnalysisService } from './sif-heca-scope-analysis.service';
import { SifHecaOrchestratorService } from './sif-heca-orchestrator.service';

@Module({
  imports: [PrismaModule, SafetyIntelligenceModule, PmCorrectiveActionsModule],
  controllers: [SifHecaController],
  providers: [
    SifHecaService,
    SifHecaIngestionService,
    SifScoringEngine,
    HecaClassificationEngine,
    ControlEffectivenessEngine,
    CsraHecaEngine,
    SifHecaCailService,
    SifHecaScopeAnalysisService,
    SifHecaOrchestratorService,
  ],
  exports: [
    SifHecaService,
    SifHecaIngestionService,
    SifHecaOrchestratorService,
    CsraHecaEngine,
  ],
})
export class SifHecaModule {}
