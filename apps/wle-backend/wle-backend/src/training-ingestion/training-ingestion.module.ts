import { Module, forwardRef } from '@nestjs/common';
import { TrainingIngestionController } from './training-ingestion.controller';
import { TrainingIngestionV1Controller } from './training-ingestion-v1.controller';
import { TrainingIngestionService } from './training-ingestion.service';
import { OcrExtractionService } from './ocr-extraction.service';
import { OcrFieldExtractorService } from './ocr-field-extractor.service';
import { TrainingMetadataParserService } from './training-metadata-parser.service';
import { IngestionConfidencePolicyService } from './ingestion-confidence-policy.service';
import { TrainingQrIngestionService } from './training-qr-ingestion.service';
import { TrainingProviderIngestionService } from './training-provider-ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { CoreUploadModule } from '../modules/core-upload/core-upload.module';
import { TrainingStandardsComplianceModule } from '../modules/training-standards-compliance/training-standards-compliance.module';
import { TrainingProviderCoreModule } from '../modules/training-provider-core/training-provider-core.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CredentialLedgerModule } from '../modules/credential-ledger/credential-ledger.module';
import { Phase1MonitoringModule } from '../common/monitoring/phase1-monitoring.module';

@Module({
  imports: [
    PrismaModule,
    Phase1MonitoringModule,
    forwardRef(() => VeraCoreModule),
    CoreUploadModule,
    TrainingStandardsComplianceModule,
    TrainingProviderCoreModule,
    CredentialLedgerModule,
    DomainEventBusModule,
    NotificationsModule,
  ],
  controllers: [TrainingIngestionController, TrainingIngestionV1Controller],
  providers: [
    TrainingIngestionService,
    OcrExtractionService,
    OcrFieldExtractorService,
    TrainingMetadataParserService,
    IngestionConfidencePolicyService,
    TrainingQrIngestionService,
    TrainingProviderIngestionService,
  ],
  exports: [
    TrainingIngestionService,
    OcrExtractionService,
    OcrFieldExtractorService,
    TrainingQrIngestionService,
    TrainingProviderIngestionService,
  ],
})
export class TrainingIngestionModule {}
