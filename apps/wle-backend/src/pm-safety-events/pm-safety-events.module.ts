import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmSmsCoreModule } from '../pm-sms-core/pm-sms-core.module';
import { PmSafetyEcosystemModule } from '../pm-safety-ecosystem/pm-safety-ecosystem.module';
import { PmSafetyEventsController } from './pm-safety-events.controller';
import { PmSafetyEventsService } from './pm-safety-events.service';
import { PmSafetyEventsLibraryService } from './pm-safety-events-library.service';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
import { PmSafetyEventsCailService } from './pm-safety-events-cail.service';
import { PmSafetyEventsIngestionService } from './pm-safety-events-ingestion.service';
import { PmSafetyEventsEquipmentService } from './pm-safety-events-equipment.service';
import { PmSafetyEventsIntelligenceService } from './pm-safety-events-intelligence.service';
import { PmSafetyEventsInvestigationService } from './pm-safety-events-investigation.service';
import { PmInvestigationCapaIntegrationService } from './pm-investigation-capa-integration.service';
import { PmInvestigationReportService } from './pm-investigation-report.service';
import { IncidentSifEngineService } from './incident-sif-engine.service';

@Module({
  imports: [
    PrismaModule,
    SafetyIntelligenceModule,
    SifHecaModule,
    forwardRef(() => VeraCoreModule),
    forwardRef(() => PmCorrectiveActionsModule),
    forwardRef(() => PmInspectionsModule),
    forwardRef(() => PmSmsCoreModule),
    PmSafetyEcosystemModule,
  ],
  controllers: [PmSafetyEventsController],
  providers: [
    PmSafetyEventsService,
    PmSafetyEventsLibraryService,
    EventClassificationEngine,
    SeverityRiskEngine,
    RcaEngine,
    PmSafetyEventsCailService,
    PmSafetyEventsIngestionService,
    PmSafetyEventsEquipmentService,
    PmSafetyEventsIntelligenceService,
    PmSafetyEventsInvestigationService,
    PmInvestigationCapaIntegrationService,
    PmInvestigationReportService,
    IncidentSifEngineService,
  ],
  exports: [
    PmSafetyEventsService,
    PmSafetyEventsIngestionService,
    IncidentSifEngineService,
    PmSafetyEventsIntelligenceService,
    PmSafetyEventsInvestigationService,
  ],
})
export class PmSafetyEventsModule {}
