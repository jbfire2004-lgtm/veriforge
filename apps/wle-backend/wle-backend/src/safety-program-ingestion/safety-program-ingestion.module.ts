import { Module } from '@nestjs/common';
import { FallClearanceModule } from '../fall-clearance/fall-clearance.module';
import { PmDocumentControlModule } from '../pm-document-control/pm-document-control.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { SafetyProgramIngestionController } from './safety-program-ingestion.controller';
import { SafetyProgramIngestionService } from './safety-program-ingestion.service';
import { SafetyProgramExtractService } from './safety-program-extract.service';
import { SafetyProgramWritebackService } from './safety-program-writeback.service';
import { SafetyProgramMergeService } from './safety-program-merge.service';
import { SafetyProgramNormalizeService } from './safety-program-normalize.service';
import { SafetyProgramSummarizeService } from './safety-program-summarize.service';
import { SafetyProgramSitePlanService } from './safety-program-site-plan.service';
import { SafetyProgramPipelineService } from './safety-program-pipeline.service';

@Module({
  imports: [
    FallClearanceModule,
    PmDocumentControlModule,
    PmCompanySafetyContextModule,
  ],
  controllers: [SafetyProgramIngestionController],
  providers: [
    SafetyProgramIngestionService,
    SafetyProgramExtractService,
    SafetyProgramWritebackService,
    SafetyProgramMergeService,
    SafetyProgramNormalizeService,
    SafetyProgramSummarizeService,
    SafetyProgramSitePlanService,
    SafetyProgramPipelineService,
  ],
  exports: [
    SafetyProgramIngestionService,
    SafetyProgramExtractService,
    SafetyProgramPipelineService,
  ],
})
export class SafetyProgramIngestionModule {}
