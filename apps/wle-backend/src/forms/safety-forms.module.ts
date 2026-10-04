import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { SafetyManagementModule } from '../safety-management/safety-management.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { SafetyFormsController } from './safety-forms.controller';
import { SafetyWorkflowController } from './safety-workflow.controller';
import { ProjectSafetyController } from './project-safety.controller';
import { FormEngineService } from './engine/form-engine.service';
import { DefinitionsLoader } from './definitions/definitions.loader';
import { DefinitionsService } from './definitions/definitions.service';
import { SafetyFormValidationService } from './validation/validation.service';
import { SafetyFormSubmissionsService } from './submissions/submissions.service';
import { SafetyFormWorkflowsService } from './workflows/workflows.service';
import { SafetyWorkflowEngineService } from './workflows/safety-workflow-engine.service';
import { SafetyFormAttachmentsService } from './attachments/attachments.service';
import { SafetyFormSignaturesService } from './signatures/signatures.service';
import { SafetyFormCorrectiveActionsService } from './corrective-actions/corrective-actions.service';
import { SafetyFormAnalyticsService } from './analytics/analytics.service';
import { AutoPopulateService } from './integration/auto-populate.service';

@Module({
  imports: [
    forwardRef(() => SafetyIntelligenceModule),
    SafetyManagementModule,
    SifHecaModule,
  ],
  controllers: [
    SafetyFormsController,
    SafetyWorkflowController,
    ProjectSafetyController,
  ],
  providers: [
    PrismaService,
    FormEngineService,
    DefinitionsLoader,
    DefinitionsService,
    SafetyFormValidationService,
    SafetyFormSubmissionsService,
    SafetyFormWorkflowsService,
    SafetyWorkflowEngineService,
    SafetyFormAttachmentsService,
    SafetyFormSignaturesService,
    SafetyFormCorrectiveActionsService,
    SafetyFormAnalyticsService,
    AutoPopulateService,
  ],
  exports: [
    SafetyFormSubmissionsService,
    DefinitionsService,
    FormEngineService,
    SafetyWorkflowEngineService,
  ],
})
export class SafetyFormsModule {}
