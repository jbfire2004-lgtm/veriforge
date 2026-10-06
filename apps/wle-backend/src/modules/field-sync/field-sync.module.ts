import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrainingRecordsModule } from '../../training-records/training-records.module';
import { PmSafetyWorkflowModule } from '../../pm-safety-workflow/pm-safety-workflow.module';
import { SafetyFormsModule } from '../../forms/safety-forms.module';
import { CompanyLinksModule } from '../vera-core/company-links.module';
import { VeraCoreModule } from '../vera-core/vera-core.module';
import { FieldSyncController } from './field-sync.controller';
import { FieldSyncService } from './field-sync.service';
import { FieldSyncBatchProcessor } from './field-sync-batch.processor';
import { FieldSyncDeltaService } from './field-sync-delta.service';
import { FieldOfflineBundleService } from './field-offline-bundle.service';

@Module({
  imports: [
    PrismaModule,
    CompanyLinksModule,
    forwardRef(() => VeraCoreModule),
    forwardRef(() => TrainingRecordsModule),
    PmSafetyWorkflowModule,
    forwardRef(() => SafetyFormsModule),
  ],
  controllers: [FieldSyncController],
  providers: [
    FieldSyncService,
    FieldSyncBatchProcessor,
    FieldSyncDeltaService,
    FieldOfflineBundleService,
  ],
  exports: [
    FieldSyncService,
    FieldSyncBatchProcessor,
    FieldSyncDeltaService,
    FieldOfflineBundleService,
  ],
})
export class FieldSyncModule {}
