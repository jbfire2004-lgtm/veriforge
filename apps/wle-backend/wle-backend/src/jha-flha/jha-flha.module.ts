import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmUnifiedCorrectiveActionModule } from '../pm-unified-corrective-action/pm-unified-corrective-action.module';
import { JhaFlhaController } from './jha-flha.controller';
import { JhaFlhaService } from './jha-flha.service';
import { JhaLibraryLearningService } from './jha-library-learning.service';
import { JhaLibraryService } from './jha-library.service';
import { JhaScoringService } from './jha-scoring.service';
import { JhaCailBridgeService } from './jha-cail-bridge.service';
import { JhaFlhaOrchestratorService } from './jha-flha-orchestrator.service';
import { JhaFlhaEngineService } from './jha-flha-engine.service';
import {
  ControlCatalogController,
  HazardCatalogController,
} from './hazard-control-catalog.controller';
import { HazardControlCatalogService } from './hazard-control-catalog.service';

@Module({
  imports: [
    PrismaModule,
    SafetyIntelligenceModule,
    forwardRef(() => SifHecaModule),
    PmCorrectiveActionsModule,
    PmUnifiedCorrectiveActionModule,
  ],
  controllers: [
    JhaFlhaController,
    HazardCatalogController,
    ControlCatalogController,
  ],
  providers: [
    JhaFlhaService,
    JhaLibraryLearningService,
    JhaLibraryService,
    HazardControlCatalogService,
    JhaScoringService,
    JhaCailBridgeService,
    JhaFlhaOrchestratorService,
    JhaFlhaEngineService,
  ],
  exports: [
    JhaFlhaService,
    JhaLibraryService,
    HazardControlCatalogService,
    JhaFlhaOrchestratorService,
    JhaFlhaEngineService,
  ],
})
export class JhaFlhaModule {}
