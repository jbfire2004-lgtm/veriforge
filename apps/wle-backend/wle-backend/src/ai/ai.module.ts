import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JhaFlhaModule } from '../jha-flha/jha-flha.module';
import { WorkersModule } from '../workers/workers.module';
import { PmContractorPortalModule } from '../pm-contractor-portal/pm-contractor-portal.module';
import { PmTrainingModule } from '../pm-training/pm-training.module';
import { TrainingIngestionModule } from '../training-ingestion/training-ingestion.module';
import { PmPredictiveSafetyAnalyticsModule } from '../pm-predictive-safety-analytics/pm-predictive-safety-analytics.module';
import { AssessmentEnginesModule } from '../modules/assessment-engines/assessment-engines.module';
import { OrientationModule } from '../modules/orientation/orientation.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PermitAiController } from './permit-ai.controller';
import { PermitAiService } from './permit-ai.service';
import { PermitToWorkAiService } from './permit-to-work-ai.service';
import { ContractorVerificationAiController } from './contractor-verification-ai.controller';
import { ContractorVerificationAiService } from './contractor-verification-ai.service';
import { WorkerProjectReadinessController } from './worker-project-readiness.controller';
import { SafetyWorkflowAiController } from './safety-workflow-ai.controller';
import { SafetyWorkflowAiService } from './safety-workflow-ai.service';
import { DocumentIntelligenceAiController } from './document-intelligence-ai.controller';
import { DocumentIntelligenceAiService } from './document-intelligence-ai.service';
import { PredictiveSafetyAnalyticsAiController } from './predictive-safety-analytics-ai.controller';
import { PredictiveSafetyAnalyticsAiService } from './predictive-safety-analytics-ai.service';
import { SafetyContentGeneratorAiController } from './safety-content-generator-ai.controller';
import { SafetyContentGeneratorAiService } from './safety-content-generator-ai.service';
import { ComplianceCalendarAiController } from './compliance-calendar-ai.controller';
import { ComplianceCalendarAiService } from './compliance-calendar-ai.service';
import { ClientPrequalificationAiController } from './client-prequalification-ai.controller';
import { ClientPrequalificationAiService } from './client-prequalification-ai.service';
import { IncidentIntelligenceAiController } from './incident-intelligence-ai.controller';
import { IncidentIntelligenceAiService } from './incident-intelligence-ai.service';

@Module({
  imports: [
    PrismaModule,
    JhaFlhaModule,
    WorkersModule,
    PmContractorPortalModule,
    PmTrainingModule,
    TrainingIngestionModule,
    PmPredictiveSafetyAnalyticsModule,
    OrientationModule,
    AssessmentEnginesModule,
    PmSafetyEventsModule,
  ],
  controllers: [
    PermitAiController,
    ContractorVerificationAiController,
    WorkerProjectReadinessController,
    SafetyWorkflowAiController,
    DocumentIntelligenceAiController,
    PredictiveSafetyAnalyticsAiController,
    SafetyContentGeneratorAiController,
    ComplianceCalendarAiController,
    ClientPrequalificationAiController,
    IncidentIntelligenceAiController,
  ],
  providers: [
    PermitAiService,
    PermitToWorkAiService,
    ContractorVerificationAiService,
    SafetyWorkflowAiService,
    DocumentIntelligenceAiService,
    PredictiveSafetyAnalyticsAiService,
    SafetyContentGeneratorAiService,
    ComplianceCalendarAiService,
    ClientPrequalificationAiService,
    IncidentIntelligenceAiService,
  ],
  exports: [
    PermitAiService,
    PermitToWorkAiService,
    ContractorVerificationAiService,
    SafetyWorkflowAiService,
    DocumentIntelligenceAiService,
    PredictiveSafetyAnalyticsAiService,
    SafetyContentGeneratorAiService,
    ComplianceCalendarAiService,
    ClientPrequalificationAiService,
    IncidentIntelligenceAiService,
  ],
})
export class AiModule {}
